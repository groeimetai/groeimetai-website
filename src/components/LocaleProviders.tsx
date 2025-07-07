'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { CommandPaletteProvider } from '@/components/CommandPalette';
import { HelpProvider } from '@/components/HelpSystem';

// Dynamically import ChatbotWidget to avoid SSR issues
const ChatbotWidget = dynamic(() => import('@/components/chatbot/ChatbotWidget').then(mod => mod.ChatbotWidget), { ssr: false });

interface LocaleProvidersProps {
  children: ReactNode;
}

export function LocaleProviders({ children }: LocaleProvidersProps) {
  return (
    <HelpProvider>
      <CommandPaletteProvider>
        {children}
        <ChatbotWidget />
      </CommandPaletteProvider>
    </HelpProvider>
  );
}
