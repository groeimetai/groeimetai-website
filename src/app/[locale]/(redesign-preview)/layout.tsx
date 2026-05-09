import type { ReactNode } from 'react';
import { Navigation } from '@/components/layout-v2/Navigation';
import { Footer } from '@/components/layout-v2/Footer';

export default function RedesignPreviewLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const basePath = `/${params.locale}/preview`;
  return (
    <div className="ds">
      <Navigation basePath={basePath} />
      <main key={basePath}>{children}</main>
      <Footer basePath={basePath} />
    </div>
  );
}
