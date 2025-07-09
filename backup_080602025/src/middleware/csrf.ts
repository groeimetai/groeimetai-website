import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

// CSRF token storage (in production, use Redis or similar)
const csrfTokens = new Map<string, { token: string; expiry: number }>();

// Token expiry time (1 hour)
const TOKEN_EXPIRY = 60 * 60 * 1000;

// Excluded paths that don't need CSRF protection
const excludedPaths = ['/api/health', '/api/status', '/api/public'];

/**
 * Generate a new CSRF token
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get session ID from request
 */
function getSessionId(request: NextRequest): string {
  // Try to get session ID from cookie
  const sessionCookie = request.cookies.get('session-id');
  if (sessionCookie) {
    return sessionCookie.value;
  }

  // Try to get from authorization header (for API clients)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract session info from JWT (simplified)
    return crypto.createHash('sha256').update(authHeader).digest('hex');
  }

  // Generate new session ID
  return crypto.randomUUID();
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  Array.from(csrfTokens.entries()).forEach(([sessionId, data]) => {
    if (data.expiry < now) {
      csrfTokens.delete(sessionId);
    }
  });
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

/**
 * CSRF protection middleware
 */
export async function csrfMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip CSRF check for excluded paths
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Skip for GET and HEAD requests
  if (request.method === 'GET' || request.method === 'HEAD') {
    return NextResponse.next();
  }

  const sessionId = getSessionId(request);

  // Get CSRF token from request
  const csrfTokenFromHeader = request.headers.get('x-csrf-token');
  const csrfTokenFromBody = await extractCsrfTokenFromBody(request);
  const csrfToken = csrfTokenFromHeader || csrfTokenFromBody;

  // For API requests, require CSRF token
  if (pathname.startsWith('/api/')) {
    if (!csrfToken) {
      return NextResponse.json(
        {
          error: 'CSRF token missing',
          message: 'CSRF token is required for this request',
        },
        { status: 403 }
      );
    }

    // Validate CSRF token
    const storedData = csrfTokens.get(sessionId);
    if (!storedData || storedData.token !== csrfToken || storedData.expiry < Date.now()) {
      return NextResponse.json(
        {
          error: 'Invalid CSRF token',
          message: 'The CSRF token is invalid or expired',
        },
        { status: 403 }
      );
    }

    // Token is valid, continue
    return NextResponse.next();
  }

  // For form submissions, check double submit cookie pattern
  const csrfCookie = request.cookies.get('csrf-token');
  if (!csrfCookie || csrfCookie.value !== csrfToken) {
    // Redirect to error page for non-API requests
    return NextResponse.redirect(new URL('/error/csrf', request.url));
  }

  return NextResponse.next();
}

/**
 * Extract CSRF token from request body
 */
async function extractCsrfTokenFromBody(request: NextRequest): Promise<string | null> {
  try {
    // Clone the request to avoid consuming the body
    const clonedRequest = request.clone();

    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const body = await clonedRequest.json();
      return body._csrf || body.csrfToken || null;
    }

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const text = await clonedRequest.text();
      const params = new URLSearchParams(text);
      return params.get('_csrf') || params.get('csrfToken');
    }

    if (contentType?.includes('multipart/form-data')) {
      // For multipart, we'd need to parse the form data
      // This is complex, so we'll rely on header for now
      return null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generate and store a new CSRF token for a session
 */
export function generateAndStoreCsrfToken(sessionId: string): string {
  const token = generateCsrfToken();
  const expiry = Date.now() + TOKEN_EXPIRY;

  csrfTokens.set(sessionId, { token, expiry });

  return token;
}

/**
 * API endpoint to get a new CSRF token
 */
export async function getCsrfToken(request: NextRequest): Promise<NextResponse> {
  const sessionId = getSessionId(request);
  const token = generateAndStoreCsrfToken(sessionId);

  const response = NextResponse.json({ csrfToken: token });

  // Set CSRF cookie for double submit pattern
  response.cookies.set('csrf-token', token, {
    httpOnly: false, // Allow JavaScript access for AJAX requests
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY / 1000,
    path: '/',
  });

  // Set session cookie if not present
  if (!request.cookies.get('session-id')) {
    response.cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });
  }

  return response;
}
