import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'redesign.contact' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
