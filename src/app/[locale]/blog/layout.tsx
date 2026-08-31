import type { Metadata } from 'next';
import { generateMetadataWithAlternates } from '@/utils/metadata';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isNl = params.locale === 'nl';
  return generateMetadataWithAlternates({
    locale: params.locale,
    pathname: '/blog',
    title: isNl ? 'Inzichten — GroeimetAI' : 'Insights — GroeimetAI',
    description: isNl
      ? 'Nuchtere artikelen over AI-training, strategie, adoptie, workflow-herontwerp en veilige integraties — zonder hype.'
      : 'Pragmatic articles on AI training, strategy, adoption, workflow redesign and safe integrations — without the hype.',
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
