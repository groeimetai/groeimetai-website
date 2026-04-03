import { Metadata } from 'next';
import { brandSiteContent } from '@/data/brandSiteContent';

export const metadata: Metadata = {
  title: brandSiteContent.nl.metadata.about.title,
  description: brandSiteContent.nl.metadata.about.description,
  openGraph: {
    title: brandSiteContent.nl.metadata.about.title,
    description: brandSiteContent.nl.metadata.about.description,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
