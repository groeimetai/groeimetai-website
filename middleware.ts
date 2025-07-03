import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityMiddleware } from './src/middleware/security';
import { rateLimitMiddleware } from './src/middleware/rateLimit';
import { authMiddleware } from './src/middleware/auth';
import { csrfMiddleware } from './src/middleware/csrf';
import { createI18nMiddleware } from './src/middleware-intl';

// Initialize i18n middleware
const i18nMiddleware = createI18nMiddleware();

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/api/admin',
  '/api/user',
  '/api/chat',
  '/api/consultation'
];

// Define public API routes that need rate limiting
const publicApiRoutes = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/contact',
  '/api/newsletter'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip i18n for API routes and static files
  const shouldSkipI18n = 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon');
  
  // Apply i18n middleware first for non-API routes
  if (!shouldSkipI18n) {
    const i18nResponse = i18nMiddleware(request);
    if (i18nResponse) {
      return i18nResponse;
    }
  }
  
  // Apply security headers to all routes
  let response = securityMiddleware(request);
  
  // Apply CSRF protection to state-changing requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const csrfResult = await csrfMiddleware(request);
    if (csrfResult instanceof NextResponse) {
      return csrfResult;
    }
  }
  
  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }
  }
  
  // Apply authentication middleware to protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
  }
  
  // Add request ID for tracking
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);
  
  // Log request for monitoring
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      method: request.method,
      path: pathname,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    }));
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};