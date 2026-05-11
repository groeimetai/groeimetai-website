'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Dynamically import the chatbot to avoid SSR issues
const ChatbotInterface = dynamic(() => import('./ChatbotInterface'), { ssr: false });

interface ChatbotWidgetProps {
  autoOpen?: boolean;
  delay?: number;
  proactiveMessage?: string;
  hideButton?: boolean;
  enableVoice?: boolean;
  voiceLanguage?: string;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  autoOpen = false,
  delay = 5000,
  proactiveMessage,
  hideButton = false,
  enableVoice = true,
  voiceLanguage = 'nl-NL',
}) => {
  const t = useTranslations('chatbot');
  const [isOpen, setIsOpen] = useState(false);
  const [showProactive, setShowProactive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if user has interacted before (only after mount)
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
  }, [autoOpen, delay, mounted]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowProactive(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbot_interacted', 'true');
    }
    setHasInteracted(true);
  };

  // Listen for custom event to open chatbot
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOpenChatbot = () => {
      setIsOpen(true);
      setShowProactive(false);
      localStorage.setItem('chatbot_interacted', 'true');
      setHasInteracted(true);
    };

    window.addEventListener('openChatbot', handleOpenChatbot);

    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDismissProactive = () => {
    setShowProactive(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbot_interacted', 'true');
    }
    setHasInteracted(true);
  };

  // Prevent hydration issues
  if (!mounted) {
    return null;
  }

  if (isOpen) {
    return (
      <ChatbotInterface
        onClose={handleClose}
        enableVoice={enableVoice}
        voiceLanguage={voiceLanguage}
      />
    );
  }

  return (
    <>
      {/* Proactive Message */}
      {showProactive && (
        <div
          className="fixed bottom-20 right-2 sm:right-4 z-40"
          style={{ animation: 'ds-chat-fadeIn .25s ease-out' }}
        >
          <div
            style={{
              background: 'var(--bg-elev-2, #18181d)',
              border: '1px solid var(--line, #26262d)',
              borderRadius: 12,
              padding: 14,
              maxWidth: 300,
              boxShadow: '0 20px 50px -20px rgba(0,0,0,0.7)',
            }}
          >
            <p style={{ fontSize: 13, color: 'var(--fg, #f4f4f1)', margin: 0, lineHeight: 1.5 }}>
              {proactiveMessage || t('widget.proactiveMessage')}
            </p>
            <div className="flex justify-end" style={{ gap: 8, marginTop: 12 }}>
              <button
                onClick={handleDismissProactive}
                style={{
                  fontSize: 12,
                  color: 'var(--fg-mute, #71717a)',
                  background: 'transparent',
                  border: 'none',
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
              >
                {t('widget.notNow')}
              </button>
              <button
                onClick={handleOpen}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  background: 'var(--accent, #ff5a1f)',
                  color: '#1a0d05',
                  border: '1px solid var(--accent, #ff5a1f)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {t('widget.letsChat')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      {!hideButton && (
        <button
          onClick={handleOpen}
          className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 group"
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--accent, #ff5a1f)',
            color: '#1a0d05',
            border: '1px solid var(--accent, #ff5a1f)',
            boxShadow: '0 0 0 1px rgba(255,90,31,.25), 0 12px 30px -10px rgba(255,90,31,.6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label={t('widget.openChat')}
        >
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
          <span
            className="absolute"
            style={{
              top: -2,
              right: -2,
              width: 12,
              height: 12,
              background: 'var(--good, #6ee7b7)',
              borderRadius: '50%',
              border: '2px solid var(--bg, #0a0a0b)',
              animation: 'ds-chat-pulse 2s infinite',
            }}
          />
          <div
            className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block"
          >
            <div
              style={{
                background: 'var(--bg-elev-2, #18181d)',
                color: 'var(--fg, #f4f4f1)',
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid var(--line, #26262d)',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {t('widget.tooltip')}
            </div>
          </div>
        </button>
      )}
    </>
  );
};

export default ChatbotWidget;
