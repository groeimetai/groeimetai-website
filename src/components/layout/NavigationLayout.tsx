'use client';

import { ReactNode } from 'react';
import DynamicNavigation from '@/components/navigation/DynamicNavigation';

interface NavigationLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function NavigationLayout({ children, className }: NavigationLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <DynamicNavigation />
      <main className={className}>
        {children}
      </main>
    </div>
  );
}