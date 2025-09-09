'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AgentReadinessDialog } from '@/components/dialogs/AgentReadinessDialog';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/routing';

interface StartProjectButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  preselectedService?: string;
}

export function StartProjectButton({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  preselectedService,
}: StartProjectButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('common');
  const { user } = useAuth();
  const router = useRouter();

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    if (user) {
      // If user is logged in, redirect to dashboard
      if (mounted) {
        router.push('/dashboard');
      }
    } else {
      // Check if we're on login page
      if (mounted && window.location.pathname.includes('/login')) {
        router.push('/register');
      } else {
        // If not logged in and not on login page, show the agent readiness dialog
        setDialogOpen(true);
      }
    }
  };

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={handleClick}>
        {children || (
          <>
            {user
              ? t('goToDashboard', { defaultMessage: 'Go to Dashboard' })
              : t('startProject', { defaultMessage: 'Start Project' })}
            <ArrowRight className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>
      <AgentReadinessDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
