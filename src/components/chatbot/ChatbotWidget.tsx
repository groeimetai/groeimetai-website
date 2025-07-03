'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Dynamically import the chatbot to avoid SSR issues
const ChatbotInterface = dynamic(
  () => import('./ChatbotInterface'),
  { ssr: false }
);

interface ChatbotWidgetProps {
  autoOpen?: boolean;
  delay?: number;
  proactiveMessage?: string;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  autoOpen = false,
  delay = 5000,
  proactiveMessage = "👋 Need help exploring our AI solutions? I'm here to assist!"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProactive, setShowProactive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user has interacted before
    const interacted = localStorage.getItem('chatbot_interacted');
    if (interacted) {
      setHasInteracted(true);
    }

    // Show proactive message after delay if not interacted
    if (!interacted && !autoOpen && delay > 0) {
      const timer = setTimeout(() => {
        setShowProactive(true);
      }, delay);

      return () => clearTimeout(timer);
    }

    // Auto-open if specified
    if (autoOpen && !interacted) {
      setIsOpen(true);
    }
  }, [autoOpen, delay]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowProactive(false);
    localStorage.setItem('chatbot_interacted', 'true');
    setHasInteracted(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDismissProactive = () => {
    setShowProactive(false);
    localStorage.setItem('chatbot_interacted', 'true');
    setHasInteracted(true);
  };

  if (isOpen) {
    return <ChatbotInterface />;
  }

  return (
    <>
      {/* Proactive Message */}
      {showProactive && (
        <div className="fixed bottom-20 right-4 z-40 animate-fade-in">
          <div className="bg-black rounded-lg shadow-xl p-4 max-w-xs border border-white/20">
            <p className="text-sm text-white mb-2">{proactiveMessage}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDismissProactive}
                className="text-xs text-white/60 hover:text-white"
              >
                Not now
              </button>
              <button
                onClick={handleOpen}
                className="text-xs bg-orange text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors"
              >
                Let&apos;s chat
              </button>
            </div>
          </div>
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-black transform rotate-45 border-r border-b border-white/20"></div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={handleOpen}
        className={cn(
          'fixed bottom-4 right-4 z-40',
          'bg-black border-2 border-orange',
          'text-orange rounded-full p-4',
          'shadow-lg hover:shadow-xl',
          'transform transition-all duration-300',
          'hover:scale-110 active:scale-95',
          'hover:bg-orange hover:text-white',
          'group'
        )}
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></span>
        
        {/* Hover tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Chat met AI Assistent
          </div>
        </div>
      </button>
    </>
  );
};

export default ChatbotWidget;