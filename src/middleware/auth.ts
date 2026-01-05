import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';

// Use crypto.randomUUID() instead of nanoid for Edge Runtime compatibility
function generateId(): string {
  return crypto.randomUUID();
}

// JWT configuration - lazy initialization to avoid build-time errors
const JWT_ISSUER = 'groeimetai.io';
const JWT_AUDIENCE = 'groeimetai-app';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Get JWT secret lazily (only when needed at runtime)
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET environment variable is not set!');
    // Return empty secret - will fail token verification gracefully
    return new TextEncoder().encode('');
  }
  return new TextEncoder().encode(secret);
}

// Check if JWT is properly configured
function isJwtConfigured(): boolean {
  return !!process.env.JWT_SECRET;
}

// User roles
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  CONSULTANT = 'consultant',
  GUEST = 'guest',
}

// JWT payload interface
interface JWTCustomPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}

// Route permissions
const routePermissions: Record<string, UserRole[]> = {
  '/dashboard': [UserRole.USER, UserRole.CONSULTANT, UserRole.ADMIN],
  '/admin': [UserRole.ADMIN],
  '/consultant': [UserRole.CONSULTANT, UserRole.ADMIN],
  '/api/admin': [UserRole.ADMIN],
  '/api/user': [UserRole.USER, UserRole.CONSULTANT, UserRole.ADMIN],
  '/api/consultant': [UserRole.CONSULTANT, UserRole.ADMIN],
  '/api/chat': [UserRole.USER, UserRole.CONSULTANT, UserRole.ADMIN],
  '/api/consultation': [UserRole.USER, UserRole.CONSULTANT, UserRole.ADMIN],
};

/**
 * Generate JWT token
 */
export async function generateToken(
  payload: Omit<JWTCustomPayload, 'iat' | 'exp' | 'jti' | 'iss' | 'aud'>,
  expiresIn: string = ACCESS_TOKEN_EXPIRY
): Promise<string> {
  if (!isJwtConfigured()) {
    throw new Error('JWT_SECRET is not configured');
  }
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(generateId())
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());

  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<JWTCustomPayload | null> {
  if (!isJwtConfigured()) {
    console.error('JWT_SECRET is not configured - cannot verify token');
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return payload as JWTCustomPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract token from request
 */
function extractToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  const tokenCookie = request.cookies.get('auth-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

/**
 * Check if user has required role for route
 */
function hasRequiredRole(userRole: UserRole, pathname: string): boolean {
  // Find the most specific route match
  let requiredRoles: UserRole[] | undefined;

  for (const [route, roles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      requiredRoles = roles;
      break;
    }
  }

  // If no specific permissions found, allow access
  if (!requiredRoles) {
    return true;
  }

  return requiredRoles.includes(userRole);
}

/**
 * Authentication middleware
 */
export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Extract token from request
  const token = extractToken(request);

  if (!token) {
    // No token found, redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Redirect to login page for web requests
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }

    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  // Check role-based access
  if (!hasRequiredRole(payload.role, pathname)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Insufficient permissions',
        },
        { status: 403 }
      );
    }

    // Redirect to unauthorized page
    return NextResponse.redirect(new URL('/error/403', request.url));
  }

  // Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);

  // Create new response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Refresh token if close to expiry (less than 5 minutes)
  const exp = payload.exp || 0;
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = exp - now;

  if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
    // Generate new token
    const newToken = await generateToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    });

    // Set new token in cookie
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Add new token to response header for API clients
    response.headers.set('X-New-Token', newToken);
  }

  return response;
}

/**
 * Generate access and refresh tokens
 */
export async function generateTokenPair(user: {
  id: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}) {
  const accessToken = await generateToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
    ACCESS_TOKEN_EXPIRY
  );

  const refreshToken = await generateToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    },
    REFRESH_TOKEN_EXPIRY
  );

  return { accessToken, refreshToken };
}
