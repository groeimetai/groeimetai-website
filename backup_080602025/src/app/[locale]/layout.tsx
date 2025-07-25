import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import Footer from '@/components/layout/Footer';
import type { RootLayoutProps } from '@/types/layout';
import { locales } from '@/i18n';
import { LocaleProviders } from '@/components/LocaleProviders';

// Dynamically import Navigation to avoid SSR issues with router
const Navigation = dynamic(() => import('@/components/layout/Navigation'), {
  ssr: false,
  loading: () => <div className="h-20" />, // Placeholder to prevent layout shift
});

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
    // Import the messages for the specific locale
    messages = (await import(`@/translations/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleProviders>
        <Navigation />
        {children}
        <Footer />
      </LocaleProviders>
    </NextIntlClientProvider>
  );
}
