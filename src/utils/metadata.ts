import { Metadata } from 'next';
import { locales } from '@/i18n';

interface GenerateMetadataParams {
  locale: string;
  pathname: string;
  title?: string;
  description?: string;
  image?: string;
}

export function generateAlternateLinks(pathname: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://groeimetai.io';
  
  // Remove locale prefix from pathname
  const pathWithoutLocale = pathname.replace(/^\/(nl|en)/, '');
  
  return locales.map(locale => ({
    rel: 'alternate',
    hreflang: locale,
    href: `${baseUrl}/${locale}${pathWithoutLocale}`
  }));
}

export function generateMetadataWithAlternates({
  locale,
  pathname,
  title = 'GroeimetAI - AI Consultancy & Innovation',
  description = 'Transform your business with cutting-edge AI solutions. Expert consultancy in GenAI, LLM integration, RAG architecture, and ServiceNow implementation.',
  image = '/og-image.png'
}: GenerateMetadataParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://groeimetai.io';
  const url = `${baseUrl}${pathname}`;
  
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map(loc => [
          loc === 'nl' ? 'nl-NL' : 'en',
          `${baseUrl}/${loc}${pathname.replace(/^\/(nl|en)/, '')}`
        ])
      )
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'GroeimetAI',
      images: [
        {
          url: `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      alternateLocale: locale === 'nl' ? 'en_US' : 'nl_NL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}${image}`],
    },
  };
}