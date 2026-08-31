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
// Generated card image (src/app/opengraph-image.tsx). Referenced explicitly
// because Next did not merge the file convention into these pages.
const DEFAULT_OG_IMAGE = '/opengraph-image/og.png';

/**
 * Strip the leading locale segment from a pathname so we can rebuild it per
 * locale. Returns `/path` (or empty string for the home page).
 */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(nl|en)/, '');
}

/**
 * Locale-relative path with no trailing slash.
 *
 * The home page comes in as `/`, which stripLocale leaves as `/` — that would
 * build `https://groeimetai.io/nl/`, and Next 308-redirects that to `/nl`. A
 * canonical (or hreflang) pointing at a redirect is exactly what search engines
 * and AI crawlers discard, so normalise it away here, once, for every caller.
 */
function localePath(pathname: string): string {
  const stripped = stripLocale(pathname);
  return stripped === '/' ? '' : stripped.replace(/\/+$/, '');
}

export function generateAlternateLinks(pathname: string) {
  const path = localePath(pathname);
  return locales.map((locale) => ({
    rel: 'alternate',
    hreflang: locale === 'nl' ? 'nl-NL' : locale,
    href: `${BASE_URL}/${locale}${path}`,
  }));
}

export function generateMetadataWithAlternates({
  locale,
  pathname,
  title = 'GroeimetAI — Geen AI-hype. Wel teams die er echt beter door werken.',
  description = 'GroeimetAI helpt MKB-organisaties nuchter werken met AI: training, strategie, adoptiebegeleiding, workflow-redesign en veilige integraties. Geen lock-in, geen black box.',
  image,
  availableLocales,
}: GenerateMetadataParams): Metadata {
  const path = localePath(pathname);
  const url = `${BASE_URL}/${locale}${path}`;

  const localesToEmit = availableLocales ?? locales;
  const languages: Record<string, string> = {};
  for (const loc of localesToEmit) {
    const key = loc === 'nl' ? 'nl-NL' : loc;
    languages[key] = `${BASE_URL}/${loc}${path}`;
  }
  // x-default points to the locale we serve when no language match is found.
  // For us that is the default locale (Dutch).
  if (localesToEmit.includes(defaultLocale)) {
    languages['x-default'] = `${BASE_URL}/${defaultLocale}${path}`;
  }

  // The previous default was '/og-image.png', which does not exist in public/,
  // so every page advertised a 404 to every social and AI-search card renderer.
  // Point at the generated image instead.
  const images = [
    { url: `${BASE_URL}${image ?? DEFAULT_OG_IMAGE}`, width: 1200, height: 630, alt: title },
  ];

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
      images,
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      alternateLocale: locale === 'nl' ? 'en_US' : 'nl_NL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}
