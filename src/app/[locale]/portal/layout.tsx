'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import PortalSidebar from '@/components/portal/PortalSidebar';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        setIsReady(true);
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080D14' }}>
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#080D14' }}>
      <PortalSidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
