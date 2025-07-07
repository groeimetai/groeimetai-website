'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CommandPaletteProvider } from '@/components/CommandPalette';
import { HelpProvider } from '@/components/HelpSystem';

// Dynamically import ChatbotWidget to avoid SSR issues
const ChatbotWidget = dynamic(() => import('@/components/chatbot/ChatbotWidget').then(mod => mod.ChatbotWidget), { ssr: false });

interface LocaleProvidersProps {
  children: ReactNode;
}

export function LocaleProviders({ children }: LocaleProvidersProps) {
  const pathname = usePathname();
  
  // Only show ChatbotWidget on non-dashboard pages
  const isDashboardPage = pathname?.includes('/dashboard');
  
  return (
    <HelpProvider>
      <CommandPaletteProvider>
        {children}
        {!isDashboardPage && <ChatbotWidget />}
      </CommandPaletteProvider>
    </HelpProvider>
  );
}
