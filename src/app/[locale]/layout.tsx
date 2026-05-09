import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import CrawlerNav from '@/components/navigation/CrawlerNav';
import { Navigation as DsNavigation } from '@/components/layout-v2/Navigation';
import { Footer as DsFooter } from '@/components/layout-v2/Footer';
import type { RootLayoutProps } from '@/types/layout';
import { locales } from '@/i18n';
import { LocaleProviders } from '@/components/LocaleProviders';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
  );
}
