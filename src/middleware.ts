import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { authMiddleware } from './middleware/auth';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Do not emit the `Link: <...>; hreflang="..."` response header. next-intl
  // derives it purely from the URL, so it advertises an /en/ counterpart for
  // NL-only content (blog posts, pillar pages) that returns 404, and it uses
  // `hreflang="nl"` where our HTML uses `nl-NL`. The per-page
  // `alternates.languages` in generateMetadata is the single source of truth.
  alternateLinks: false,
});

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply authentication middleware for admin API routes
  // This protects all /api/admin/* endpoints
  if (pathname.startsWith('/api/admin')) {
    const authResult = await authMiddleware(request);
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
