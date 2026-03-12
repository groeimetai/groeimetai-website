import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Veelgestelde Vragen over AI voor Bedrijven | GroeimetAI',
  description:
    'Antwoorden op veelgestelde vragen over AI-implementatie, kosten, tijdlijnen en mogelijkheden. Alles wat je wilt weten over AI voor jouw bedrijf.',
  openGraph: {
    title: 'FAQ — Veelgestelde Vragen over AI | GroeimetAI',
    description:
      'Eerlijke antwoorden op veelgestelde vragen over AI-implementatie voor bedrijven.',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
