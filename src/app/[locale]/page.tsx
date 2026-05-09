import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomePageView } from '@/components/landing-v2/pages/HomePageView';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'redesign.home' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function HomePage({ params }: { params: { locale: string } }) {
  return (
    <div className="ds">
      <HomePageView basePath={`/${params.locale}`} />
    </div>
  );
}
