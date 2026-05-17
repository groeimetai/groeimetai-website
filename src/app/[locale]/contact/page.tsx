import type { Metadata } from 'next';
import { ContactPageView } from '@/components/landing-v2/pages/ContactPageView';
import { generateMetadataWithAlternates } from '@/utils/metadata';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isNl = params.locale === 'nl';
  return generateMetadataWithAlternates({
    locale: params.locale,
    pathname: '/contact',
    title: isNl ? 'Contact — GroeimetAI' : 'Contact — GroeimetAI',
    description: isNl
      ? 'Plan een verkennend gesprek over AI in jullie organisatie. Een uur, kost niets, geeft concrete vervolgstappen ongeacht of we samenwerken.'
      : 'Schedule a scoping conversation about AI in your organisation. One hour, no cost, with concrete next steps regardless of whether we work together.',
  });
}

export default function ContactPage() {
  return (
    <div className="ds">
      <ContactPageView wireApi />
    </div>
  );
}
