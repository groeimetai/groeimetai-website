import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['nl', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'nl';

// Locale detection based on region/country
export const localeMapping: Record<string, Locale> = {
  // Netherlands
  NL: 'nl',
  // Belgium (Dutch speaking)
  BE: 'nl',
  // All other countries default to English
  DEFAULT: 'en',
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locale || defaultLocale;
  if (!locales.includes(validLocale as any)) notFound();

  return {
    locale: validLocale,
    messages: (await import(`./translations/${validLocale}.json`)).default,
    timeZone: validLocale === 'nl' ? 'Europe/Amsterdam' : 'UTC',
    now: new Date(),
  };
});
