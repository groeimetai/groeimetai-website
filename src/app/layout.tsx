import type { Metadata } from 'next';
import { Outfit, Manrope } from 'next/font/google';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OrganizationJsonLd, ServicesJsonLd, WebSiteJsonLd } from '@/components/JsonLd';
import '../styles/globals.css';

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
  title: 'GroeimetAI — AI Implementation Partner | Chatbots, Voice AI & Automation',
  description:
    'We build practical AI solutions for your business. Chatbots, voice assistants, automations, and system integrations. Fixed prices, real results. Based in the Netherlands.',
  keywords:
    'AI implementation, AI developer Netherlands, AI chatbot bouwen, voice AI, business automation, AI integrations, AI consultancy, AI for business, MKB AI, AI partner Nederland',
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
  alternates: {
    canonical: 'https://groeimetai.io',
    languages: {
      en: 'https://groeimetai.io/en',
      'nl-NL': 'https://groeimetai.io/nl',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'nl_NL',
    url: 'https://groeimetai.io',
    title: 'GroeimetAI — AI Implementation Partner | Chatbots, Voice AI & Automation',
    description: 'We build practical AI solutions for your business. Chatbots, voice assistants, automations, and system integrations. Fixed prices, real results.',
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
    title: 'GroeimetAI — AI Implementation Partner | Chatbots, Voice AI & Automation',
    description: 'We build practical AI solutions for your business. Chatbots, voice assistants, automations, and system integrations. Fixed prices, real results.',
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
      <body className={`${outfit.variable} ${manrope.variable} font-sans dark min-h-screen bg-background antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
