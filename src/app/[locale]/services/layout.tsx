import { Metadata } from 'next';
import { brandSiteContent } from '@/data/brandSiteContent';

export const metadata: Metadata = {
  title: brandSiteContent.nl.metadata.services.title,
  description: brandSiteContent.nl.metadata.services.description,
  openGraph: {
    title: brandSiteContent.nl.metadata.services.title,
    description: brandSiteContent.nl.metadata.services.description,
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
