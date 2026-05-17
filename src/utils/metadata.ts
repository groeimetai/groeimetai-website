import { Metadata } from 'next';
import { locales, defaultLocale } from '@/i18n';

interface GenerateMetadataParams {
  locale: string;
  pathname: string;
  title?: string;
  description?: string;
  image?: string;
  /**
   * Locales this specific page actually exists in. Defaults to all configured
   * locales. Set to `['nl']` for content that's only published in Dutch so we
   * don't emit hreflang pointing to a 404.
   */
  availableLocales?: readonly string[];
}

const BASE_URL = 'https://groeimetai.io';

/**
 * Strip the leading locale segment from a pathname so we can rebuild it per
 * locale. Returns `/path` (or empty string for the home page).
 */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(nl|en)/, '');
}

export function generateAlternateLinks(pathname: string) {
  const pathWithoutLocale = stripLocale(pathname);
  return locales.map((locale) => ({
    rel: 'alternate',
    hreflang: locale === 'nl' ? 'nl-NL' : locale,
    href: `${BASE_URL}/${locale}${pathWithoutLocale}`,
  }));
}

export function generateMetadataWithAlternates({
  locale,
  pathname,
  title = 'GroeimetAI — Geen AI-hype. Wel teams die er echt beter door werken.',
  description = 'GroeimetAI helpt MKB-organisaties nuchter werken met AI: training, strategie, adoptiebegeleiding, workflow-redesign en veilige integraties. Geen lock-in, geen black box.',
  image = '/og-image.png',
  availableLocales,
}: GenerateMetadataParams): Metadata {
  const pathWithoutLocale = stripLocale(pathname);
  const url = `${BASE_URL}/${locale}${pathWithoutLocale}`;

  const localesToEmit = availableLocales ?? locales;
  const languages: Record<string, string> = {};
  for (const loc of localesToEmit) {
    const key = loc === 'nl' ? 'nl-NL' : loc;
    languages[key] = `${BASE_URL}/${loc}${pathWithoutLocale}`;
  }
  // x-default points to the locale we serve when no language match is found.
  // For us that is the default locale (Dutch).
  if (localesToEmit.includes(defaultLocale)) {
    languages['x-default'] = `${BASE_URL}/${defaultLocale}${pathWithoutLocale}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'GroeimetAI',
      images: [
        {
          url: `${BASE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      alternateLocale: locale === 'nl' ? 'en_US' : 'nl_NL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}${image}`],
    },
  };
}
