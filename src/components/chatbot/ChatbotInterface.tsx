'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Bot, User, Loader2, X, Maximize2, Minimize2, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceInput } from '@/components/voice';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatbotInterfaceProps {
  className?: string;
  initialMessage?: string;
  onClose?: () => void;
  enableVoice?: boolean;
  voiceLanguage?: string;
}

export const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({
  className,
  initialMessage,
  onClose,
  enableVoice = true,
  voiceLanguage = 'nl-NL',
}) => {
  const t = useTranslations('chatbot');
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: initialMessage || t('interface.initialMessage'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const scrollToBottom = () => {
    if (mounted && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      scrollToBottom();
    }
  }, [messages, mounted]);

  useEffect(() => {
    if (mounted && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized, mounted]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle rate limiting
        if (response.status === 429) {
          throw new Error(errorData.error || t('errors.tooManyRequests'));
        }

        // Handle validation errors
        if (response.status === 400) {
          throw new Error(errorData.error || t('errors.invalidMessage'));
        }

        throw new Error(errorData.error || t('errors.failedResponse'));
      }

      const data = await response.json();

      setIsTyping(false);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          error instanceof Error && (error.message.includes('Te veel') || error.message.includes('Too many'))
            ? error.message
            : t('errors.connectionError'),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice input handlers
  const handleVoiceTranscript = (transcript: string, confidence: number) => {
    if (transcript.trim()) {
      setInput(transcript);
      setVoiceError(null);

      // Auto-send if confidence is high enough
      if (confidence > 0.8) {
        // Small delay to show the transcript
        setTimeout(() => {
          setInput('');
          handleSend();
        }, 500);
      }
    }
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
    // Clear error after 5 seconds
    setTimeout(() => setVoiceError(null), 5000);
  };

  const handleVoiceStatusChange = (isListening: boolean) => {
    setIsVoiceMode(isListening);
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  // Prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300',
        isMobile ? 'bottom-0 right-0 left-0' : 'bottom-4 right-4',
        isMinimized ? 'w-80' : (isMobile ? 'w-full' : 'w-96'),
        className
      )}
    >
      {/* Chat Header */}
      <div className={cn(
        "bg-black p-4 flex items-center justify-between shadow-lg border-b-2 border-orange",
        isMobile ? "rounded-none" : "rounded-t-lg"
      )}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange to-orange-600 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-black"></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">{t('interface.title')}</h3>
            <p className="text-xs text-orange font-medium">{t('interface.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (isMobile && onClose) {
                onClose();
              } else {
                setIsMinimized(!isMinimized);
              }
            }}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            aria-label={isMobile ? t('interface.closeChat') : (isMinimized ? t('interface.maximizeChat') : t('interface.minimizeChat'))}
          >
            {isMobile ? <X className="h-5 w-5" /> : (isMinimized ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />)}
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      {!isMinimized && (
        <div className="bg-black border-x border-white/10 shadow-lg">
          <div className={cn(
            "overflow-y-auto p-4 space-y-4",
            isMobile ? "h-[70vh]" : "h-96"
          )}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start space-x-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange to-orange-600 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg px-4 py-2',
                    message.role === 'user' ? 'bg-orange text-white' : 'bg-white/10 text-white'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      message.role === 'user' ? 'text-white/90' : 'text-white/70'
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange to-orange-600 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div
                      className="h-2 w-2 bg-white/60 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-white/60 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-white/60 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-white/10 p-4 bg-black">
            {/* Voice Error Display */}
            {voiceError && (
              <div className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-xs">
                {voiceError}
              </div>
            )}

            {/* Voice Mode Toggle */}
            {enableVoice && (
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">
                    {isVoiceMode ? t('voice.modeActive') : t('voice.modeAvailable')}
                  </span>
                  <button
                    onClick={toggleVoiceMode}
                    className={cn(
                      'p-1 rounded-full text-xs transition-colors',
                      isVoiceMode
                        ? 'bg-orange/20 text-orange'
                        : 'bg-white/10 text-white/60 hover:text-white'
                    )}
                    title={isVoiceMode ? t('voice.switchToText') : t('voice.switchToVoice')}
                  >
                    {isVoiceMode ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isVoiceMode ? t('interface.placeholderVoice') : t('interface.placeholderText')}
                className="flex-1 px-4 py-2 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent bg-white/10 text-white placeholder-white/50"
                disabled={isLoading}
              />

              {/* Voice Input Component */}
              {enableVoice && isVoiceMode && (
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  onError={handleVoiceError}
                  onStatusChange={handleVoiceStatusChange}
                  language={voiceLanguage}
                  size={isMobile ? 'sm' : 'md'}
                  variant="compact"
                  autoSubmit={false}
                  showTranscript={false}
                  showSettings={false}
                  disabled={isLoading}
                  className="shrink-0"
                />
              )}

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={cn(
                  'p-2 rounded-full transition-all shrink-0',
                  isLoading || !input.trim()
                    ? 'bg-white/10 text-white/50 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-orange to-orange-600 text-white hover:shadow-lg transform hover:scale-105 focus:ring-2 focus:ring-orange focus:ring-offset-2 focus:ring-offset-black'
                )}
                aria-label={t('interface.sendMessage')}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 text-xs text-white/50">
              <span>{t('interface.poweredBy')}</span>
              {enableVoice && isVoiceMode && (
                <span className="text-orange/70">{t('interface.voiceEnabled')}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="bg-card border border-border rounded-b-lg p-2 text-center text-sm text-foreground shadow-lg">
          {t('interface.clickToContinue')}
        </div>
      )}
    </div>
  );
};

export default ChatbotInterface;
