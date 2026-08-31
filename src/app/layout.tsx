import type { Metadata } from 'next';
import '../styles/globals.css';

// Positioning per website-repositioning-2026-04.md (April 2026): AI-training,
// strategie, adoptiebegeleiding, workflow-herontwerp en veilige integraties
// voor het MKB. Deze strings moeten gelijk blijven aan de Organization-
// description in src/components/JsonLd.tsx en aan public/llms.txt.
const ROOT_TITLE = 'GroeimetAI — AI-training, strategie en adoptie voor het MKB';
// Absolute URL of the generated card image (src/app/opengraph-image.tsx).
// The `/og.png` id keeps the path dotted so the next-intl matcher skips it.
const OG_IMAGE = 'https://groeimetai.io/opengraph-image/og.png';
const ROOT_DESCRIPTION =
  'GroeimetAI helpt MKB-organisaties nuchter werken met AI: training, strategie, adoptiebegeleiding, workflow-herontwerp en veilige integraties.';
const ROOT_KEYWORDS = [
  'AI-training',
  'AI-adoptie',
  'AI-strategie MKB',
  'workflow-herontwerp',
  'veilige AI-integraties',
  'GroeimetAI',
];

export const metadata: Metadata = {
  metadataBase: new URL('https://groeimetai.io'),
  title: ROOT_TITLE,
  description: ROOT_DESCRIPTION,
  keywords: ROOT_KEYWORDS,
  authors: [{ name: 'GroeimetAI', url: 'https://groeimetai.io' }],
  creator: 'GroeimetAI',
  publisher: 'GroeimetAI',
  // No `icons` block here on purpose: src/app/icon.svg (Next file convention)
  // supplies the favicon. Next only falls back to file-based icons when
  // `metadata.icons` is undefined, so setting it here would suppress them.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Note: no global canonical or hreflang here. The root path "/" is a redirect
  // to /nl and should not be a canonical target itself. Each locale page sets
  // its own self-referential canonical via generateMetadataWithAlternates().
  openGraph: {
    type: 'website',
    // Dutch is the default locale and the bulk of the content; pages that use
    // generateMetadataWithAlternates() override this per locale.
    locale: 'nl_NL',
    alternateLocale: 'en_US',
    url: 'https://groeimetai.io',
    title: ROOT_TITLE,
    description: ROOT_DESCRIPTION,
    siteName: 'GroeimetAI',
    // Reference the generated image explicitly rather than relying on Next to
    // merge the src/app/opengraph-image.tsx file convention: verified against a
    // production build, the convention did not reach the [locale] pages (a page
    // that defines its own `openGraph` replaces this object wholesale, and even
    // pages inheriting it emitted no og:image). An explicit URL is deterministic
    // — /opengraph-image/og.png returns 200 image/png.
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: ROOT_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: ROOT_TITLE,
    description: ROOT_DESCRIPTION,
    creator: '@groeimetai',
    // Explicit for the same reason as openGraph.images above.
    images: [OG_IMAGE],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

// Disable Firebase Performance for now to prevent CSS class tracking errors
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    try {
      const perf = (window as any).firebase?.performance?.();
      if (perf) {
        perf.instrumentationEnabled = false;
        perf.dataCollectionEnabled = false;
      }
    } catch (e) {
      // Ignore Firebase Performance errors
    }
  });
}

/**
 * Pass-through root layout.
 *
 * The <html>/<body> shell lives in src/app/[locale]/layout.tsx because that is
 * the first layout that actually receives the locale segment — this file sits
 * above [locale], so its `params` never contained `locale` and every Dutch page
 * was served as <html lang="en">. Everything that used to render here (fonts,
 * providers, JSON-LD, preconnects) moved down one level in the same order.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
