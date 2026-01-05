import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { authMiddleware } from './middleware/auth';

// Note: Middleware always runs in Edge Runtime in Next.js 14
// All imports must be Edge-compatible (jose is Edge-compatible, we replaced nanoid with crypto.randomUUID)

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply authentication middleware for admin API routes
  // This protects all /api/admin/* endpoints
  if (pathname.startsWith('/api/admin')) {
    const authResult = await authMiddleware(request);
    // If authMiddleware returns a response (error/redirect), use it
    // Otherwise it returns NextResponse.next() with headers
    if (authResult) {
      return authResult;
    }
  }

  // Apply internationalization middleware for non-API routes
  if (!pathname.startsWith('/api')) {
    return intlMiddleware(request);
  }

  // For other API routes, just continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pathnames except for static files
    '/((?!_next|_vercel|.*\\..*).*)',
    // Match all pathnames within `/nl` and `/en`
    '/(nl|en)/:path*',
    // Match admin API routes for authentication
    '/api/admin/:path*',
  ],
};
