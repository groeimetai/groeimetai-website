'use client';

import { ReactNode } from 'react';
import { CommandPaletteProvider } from '@/components/CommandPalette';
import { HelpProvider } from '@/components/HelpSystem';

interface LocaleProvidersProps {
  children: ReactNode;
}

export function LocaleProviders({ children }: LocaleProvidersProps) {
  return (
    <HelpProvider>
      <CommandPaletteProvider>
        {children}
      </CommandPaletteProvider>
    </HelpProvider>
  );
}