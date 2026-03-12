import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Over GroeimetAI — AI Implementation Partner sinds 2023',
  description:
    'GroeimetAI is een Nederlandse AI-implementatiepartner. Wij bouwen praktische AI-oplossingen: chatbots, spraakassistenten, automatiseringen en systeemintegraties. Al 3 jaar actief.',
  openGraph: {
    title: 'Over GroeimetAI — AI Implementation Partner',
    description:
      'Nederlandse AI-implementatiepartner. Praktische AI-oplossingen voor bedrijven van elke omvang.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
