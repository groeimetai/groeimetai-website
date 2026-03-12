import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact GroeimetAI — Gratis Gesprek over AI voor jouw Bedrijf',
  description:
    'Neem contact op met GroeimetAI. Start met een gratis gesprek over AI-mogelijkheden voor jouw bedrijf. Chatbots, spraakassistenten, automatiseringen en meer.',
  openGraph: {
    title: 'Contact GroeimetAI — Gratis Gesprek',
    description:
      'Start met een gratis gesprek over AI-mogelijkheden voor jouw bedrijf. Geen verplichtingen.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
