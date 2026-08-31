import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AgentsPageView } from '@/components/landing-v2/pages/AgentsPageView';
import { generateMetadataWithAlternates } from '@/utils/metadata';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'redesign.agents' });
  // Route through the shared helper so this page gets the same self-canonical,
  // hreflang set and card image as every other locale page — it had none.
  return generateMetadataWithAlternates({
    locale: params.locale,
    pathname: '/agents',
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

export default function AgentsPage({ params }: { params: { locale: string } }) {
  return (
    <div className="ds">
      <AgentsPageView basePath={`/${params.locale}`} />
    </div>
  );
}
