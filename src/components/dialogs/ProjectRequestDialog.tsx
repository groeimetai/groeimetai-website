'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QuoteRequestForm from '@/components/forms/QuoteRequestForm';
import { useTranslations } from 'next-intl';

interface ProjectRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedService?: string;
}

export function ProjectRequestDialog({ open, onOpenChange, preselectedService }: ProjectRequestDialogProps) {
  const t = useTranslations('projectDialog');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {t('title', { defaultMessage: 'Start Your AI Project' })}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <QuoteRequestForm 
            isDialog={true} 
            onSuccess={() => onOpenChange(false)} 
            preselectedService={preselectedService}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}