import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://groeimetai.io'),
  title: 'GroeimetAI - AI Consultancy & Innovation',
  description:
    'Transform your business with cutting-edge AI solutions. Expert consultancy in GenAI, LLM integration, RAG architecture, and ServiceNow implementation.',
  keywords:
    'AI consultancy, GenAI, LLM, ServiceNow, RAG architecture, AI automation, multi-agent orchestration, Netherlands',
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
    title: 'GroeimetAI - AI Consultancy & Innovation',
    description: 'Transform your business with cutting-edge AI solutions',
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
    title: 'GroeimetAI - AI Consultancy & Innovation',
    description: 'Transform your business with cutting-edge AI solutions',
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
      <body className={`${inter.className} dark min-h-screen bg-background antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
