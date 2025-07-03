import { Metadata } from 'next';
import { generateMetadataWithAlternates } from '@/utils/metadata';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: {
    locale: string;
  };
}

// Example of how to generate metadata for a page with proper hreflang tags
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: 'home' });
  
  return generateMetadataWithAlternates({
    locale,
    pathname: `/${locale}`,
    title: t('meta.title'),
    description: t('meta.description'),
    image: '/og-image.png'
  });
}

// For dynamic pages like blog posts or case studies
export async function generateMetadataForDynamicPage(
  locale: string,
  slug: string,
  data: {
    title: string;
    description: string;
    image?: string;
  }
): Promise<Metadata> {
  return generateMetadataWithAlternates({
    locale,
    pathname: `/${locale}/blog/${slug}`,
    title: `${data.title} | GroeimetAI`,
    description: data.description,
    image: data.image || '/og-image-blog.png'
  });
}