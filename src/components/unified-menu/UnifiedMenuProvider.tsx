'use client';

import React, { createContext, useContext } from 'react';
import { useUnifiedMenu } from '@/hooks/useUnifiedMenu';
import { UnifiedMenuProviderProps, UseUnifiedMenuReturn } from '@/types/unified-menu';

const UnifiedMenuContext = createContext<UseUnifiedMenuReturn | null>(null);

export function UnifiedMenuProvider({ children, config, userId, isAdmin }: UnifiedMenuProviderProps) {
  const menuState = useUnifiedMenu(config);

  return (
    <UnifiedMenuContext.Provider value={menuState}>
      {children}
    </UnifiedMenuContext.Provider>
  );
}

export function useUnifiedMenuContext(): UseUnifiedMenuReturn {
  const context = useContext(UnifiedMenuContext);
  if (!context) {
    throw new Error('useUnifiedMenuContext must be used within a UnifiedMenuProvider');
  }
  return context;
}