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
    pathname: '/faq',
    title: isNl
      ? 'FAQ — Veelgestelde vragen over AI voor bedrijven | GroeimetAI'
      : 'FAQ — Frequently asked questions about AI for business | GroeimetAI',
    description: isNl
      ? 'Eerlijke antwoorden op vragen over AI-implementatie, kosten, tijdlijnen en wat AI wel en niet kan.'
      : 'Honest answers to questions about AI implementation, cost, timelines and what AI can and can\'t do.',
  });
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
