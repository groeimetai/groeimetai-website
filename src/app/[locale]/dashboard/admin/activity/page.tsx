'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivityLogs } from '@/components/admin/ActivityLogs';

export default function ActivityLogsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Redirect non-admin users
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/dashboard/admin')}
        className="mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Admin Dashboard
      </Button>

      {/* Activity Logs Component */}
      <ActivityLogs />
    </div>
  );
}