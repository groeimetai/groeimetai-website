import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CasesPageView } from '@/components/landing-v2/pages/CasesPageView';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'redesign.cases' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function CasesPage({ params }: { params: { locale: string } }) {
  return (
    <div className="ds">
      <CasesPageView basePath={`/${params.locale}`} />
    </div>
  );
}
