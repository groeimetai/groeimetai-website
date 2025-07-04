'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectRequestDialog } from '@/components/dialogs/ProjectRequestDialog';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  preselectedService
}: StartProjectButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const t = useTranslations('common');

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setDialogOpen(true)}
      >
        {children || (
          <>
            {t('startProject', { defaultMessage: 'Start Project' })}
            <ArrowRight className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>
      <ProjectRequestDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        preselectedService={preselectedService}
      />
    </>
  );
}