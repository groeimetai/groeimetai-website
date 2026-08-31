import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TrainingenPageView } from '@/components/landing-v2/pages/TrainingenPageView';
import { generateMetadataWithAlternates } from '@/utils/metadata';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'redesign.trainingen' });
  return generateMetadataWithAlternates({
    locale: params.locale,
    pathname: '/trainingen',
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

export default function TrainingenPage({ params }: { params: { locale: string } }) {
  return (
    <div className="ds">
      <TrainingenPageView basePath={`/${params.locale}`} />
    </div>
  );
}
