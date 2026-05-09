import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AgentsPageView } from '@/components/landing-v2/pages/AgentsPageView';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'redesign.agents' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function AgentsPage({ params }: { params: { locale: string } }) {
  return (
    <div className="ds">
      <AgentsPageView basePath={`/${params.locale}`} />
    </div>
  );
}
