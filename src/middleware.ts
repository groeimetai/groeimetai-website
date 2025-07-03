import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, type Locale } from './i18n';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'as-needed'
});

// Function to get country code from various sources
function getCountryCode(request: NextRequest): string | null {
  // 1. Check Vercel's geo headers (works on Vercel deployment)
  const country = request.headers.get('x-vercel-ip-country');
  if (country) return country;
  
  // 2. Check Cloudflare headers
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry) return cfCountry;
  
  // 3. Check standard geo headers
  const geoCountry = request.geo?.country;
  if (geoCountry) return geoCountry;
  
  return null;
}

// Function to determine locale based on country
function getLocaleFromCountry(countryCode: string | null): Locale {
  if (!countryCode) return defaultLocale;
  
  // Netherlands and Dutch-speaking Belgium get Dutch
  if (countryCode === 'NL' || countryCode === 'BE') {
    return 'nl';
  }
  
  // All other countries get English
  return 'en';
}

// Function to parse Accept-Language header
function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null;
  
  // Parse the Accept-Language header
  const languages = acceptLanguage.split(',').map(lang => {
    const [code, quality = '1'] = lang.trim().split(';q=');
    return {
      code: code.toLowerCase(),
      quality: parseFloat(quality)
    };
  }).sort((a, b) => b.quality - a.quality);
  
  // Check for exact matches first
  for (const lang of languages) {
    if (lang.code === 'nl' || lang.code.startsWith('nl-')) return 'nl';
    if (lang.code === 'en' || lang.code.startsWith('en-')) return 'en';
  }
  
  return null;
}

// Main locale detection function with prioritization
function detectLocale(request: NextRequest): Locale {
  // 1. Check for locale preference in cookie (highest priority)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }
  
  // 2. Check browser Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  const browserLocale = getLocaleFromAcceptLanguage(acceptLanguage);
  if (browserLocale) {
    return browserLocale;
  }
  
  // 3. Fall back to geo-location based detection
  const countryCode = getCountryCode(request);
  return getLocaleFromCountry(countryCode);
}

export function createI18nMiddleware() {
  return function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    
    // Skip locale detection for API routes, static files, etc.
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.') ||
      pathname.startsWith('/favicon')
    ) {
      return NextResponse.next();
    }
    
    // Check if the pathname already includes a locale
    const pathnameHasLocale = locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );
    
    if (!pathnameHasLocale) {
      // Detect the appropriate locale
      const locale = detectLocale(request);
      
      // Create redirect response
      const newUrl = new URL(`/${locale}${pathname}`, request.url);
      newUrl.search = request.nextUrl.search;
      const response = NextResponse.redirect(newUrl);
      
      // Set locale preference cookie for future visits
      response.cookies.set(LOCALE_COOKIE_NAME, locale, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      return response;
    }
    
    // Extract current locale from pathname
    const currentLocale = pathname.split('/')[1] as Locale;
    
    // Use the intl middleware for further processing
    const response = intlMiddleware(request);
    
    // Update locale preference cookie if different from current
    const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    if (response && cookieLocale !== currentLocale) {
      response.cookies.set(LOCALE_COOKIE_NAME, currentLocale, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    }
    
    return response;
  };
}

// Export the middleware
export default function middleware(request: NextRequest): NextResponse | void {
  // Use the intlMiddleware we already created
  return intlMiddleware(request);
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public files (images, etc.)
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|robots.txt|sitemap.xml).*)',
  ]
};