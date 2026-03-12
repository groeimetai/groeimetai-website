import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Services — Chatbots, Voice AI, Automation & Strategy | GroeimetAI',
  description:
    'Onze AI-diensten: AI Strategy & Consultancy, AI Integrations, Voice AI Development, Full-stack Web Development, en AI Training & Workshops. Vaste prijzen, echte resultaten.',
  openGraph: {
    title: 'AI Services — GroeimetAI',
    description:
      'Van strategie tot implementatie. Chatbots, spraakassistenten, automatiseringen en meer. Vaste prijzen.',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
