import { Metadata } from 'next';
import { brandSiteContent } from '@/data/brandSiteContent';

export const metadata: Metadata = {
  title: brandSiteContent.nl.metadata.snowFlow.title,
  description: brandSiteContent.nl.metadata.snowFlow.description,
  openGraph: {
    title: brandSiteContent.nl.metadata.snowFlow.title,
    description: brandSiteContent.nl.metadata.snowFlow.description,
  },
};

export default function SnowFlowLayout({ children }: { children: React.ReactNode }) {
  return children;
}
