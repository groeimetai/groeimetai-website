import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - ... if they start with `/api`, `/_next` or `/_vercel`
    // - ... the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Optionally, match all pathnames within `/nl` and `/en`
    // But exclude API routes
    '/(nl|en)/((?!api).*)',
  ],
};
