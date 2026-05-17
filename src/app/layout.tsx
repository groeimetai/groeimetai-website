import type { Metadata } from 'next';
import { Outfit, Manrope } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OrganizationJsonLd, ServicesJsonLd, WebSiteJsonLd } from '@/components/JsonLd';
import '../styles/globals.css';

const ROOT_TITLE = 'GroeimetAI — Agents bouwen die je zelf begrijpt';
const ROOT_DESCRIPTION =
  'GroeimetAI traint teams om AI agents te bouwen, beheren en aanpassen. Geen black box, geen lock-in, geen hype.';
const ROOT_KEYWORDS = [
  'AI agents',
  'AI training',
  'AI literacy',
  'agent implementatie',
  'GenAI consultancy',
  'GroeimetAI',
];

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

export const metadata: Metadata = {
  metadataBase: new URL('https://groeimetai.io'),
  title: ROOT_TITLE,
  description: ROOT_DESCRIPTION,
  keywords: ROOT_KEYWORDS,
  authors: [{ name: 'GroeimetAI', url: 'https://groeimetai.io' }],
  creator: 'GroeimetAI',
  publisher: 'GroeimetAI',
  icons: {
    icon: [
      { url: '/gecentreerd-logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon.png',
  },
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
    locale: 'en_US',
    alternateLocale: 'nl_NL',
    url: 'https://groeimetai.io',
    title: ROOT_TITLE,
    description: ROOT_DESCRIPTION,
    siteName: 'GroeimetAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GroeimetAI - AI Consultancy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: ROOT_TITLE,
    description: ROOT_DESCRIPTION,
    creator: '@groeimetai',
    images: ['/twitter-image.png'],
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

// Generate static params for all supported locales
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'nl' }];
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params?.locale || 'en'} suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <ServicesJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className={`${outfit.variable} ${manrope.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans dark min-h-screen bg-background antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
