'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardErrorBoundary } from '@/components/dashboard/DashboardErrorBoundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if still loading
    if (loading) return;

    // If no user is logged in, redirect to login with return URL
    if (!user) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
  }, [user, loading, router, pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange mx-auto mb-4" />
          <p className="text-white/60">Authenticatie controleren...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard content if user is not authenticated
  // (The redirect should handle this, but this is a fallback)
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Doorverwijzen naar login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render dashboard content with error boundary
  return (
    <DashboardErrorBoundary componentName="Dashboard">
      {children}
    </DashboardErrorBoundary>
  );
}