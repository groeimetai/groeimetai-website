import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Outfit, Manrope } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import CrawlerNav from '@/components/navigation/CrawlerNav';
import { Navigation as DsNavigation } from '@/components/layout-v2/Navigation';
import { Footer as DsFooter } from '@/components/layout-v2/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/JsonLd';
import type { RootLayoutProps } from '@/types/layout';
import { locales } from '@/i18n';
import { LocaleProviders } from '@/components/LocaleProviders';
import { Providers } from '../providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * This layout owns the <html>/<body> shell. src/app/layout.tsx sits above the
 * [locale] segment and therefore never receives a locale, which is why the
 * shell lives here: `lang` has to match the language of the page.
 */
export default async function LocaleLayout({ children, params: { locale } }: RootLayoutProps) {
  // Ensure valid locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  let messages;
  try {
    // Import the messages for the specific locale + merge redesign namespace
    const baseMessages = (await import(`@/translations/${locale}.json`)).default;
    const redesignMessages = (await import(`@/translations/redesign/${locale}.json`)).default;
    messages = { ...baseMessages, redesign: redesignMessages };
  } catch (error) {
    notFound();
  }

  const basePath = `/${locale}`;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Preconnect to third-party origins we hit on initial load — saves
            ~100-200ms when GA/Firebase fires its first call. dns-prefetch is
            kept as a safety net for browsers that ignore preconnect under
            heavy load. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body
        className={`${outfit.variable} ${manrope.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans dark min-h-screen bg-background antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <Providers>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <LocaleProviders>
                <CrawlerNav locale={locale} />
                <div className="ds">
                  <DsNavigation basePath={basePath} />
                </div>
                {children}
                <div className="ds">
                  <DsFooter basePath={basePath} />
                </div>
              </LocaleProviders>
            </NextIntlClientProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
