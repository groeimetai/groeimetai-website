'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, X, Maximize2, Minimize2, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceInput } from '@/components/voice';

/** Minimal markdown renderer styled with DS tokens. */
function ChatMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ node, ...props }) => (
          <p {...props} style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.55 }} />
        ),
        strong: ({ node, ...props }) => (
          <strong {...props} style={{ color: 'var(--fg)', fontWeight: 600 }} />
        ),
        em: ({ node, ...props }) => <em {...props} style={{ fontStyle: 'italic' }} />,
        a: ({ node, ...props }) => (
          <a
            {...props}
            target={props.href?.startsWith('http') ? '_blank' : undefined}
            rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={{
              color: 'var(--accent)',
              borderBottom: '1px dashed currentColor',
              textDecoration: 'none',
            }}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul
            {...props}
            style={{ margin: '8px 0', paddingLeft: 18, display: 'grid', gap: 4, fontSize: 14 }}
          />
        ),
        ol: ({ node, ...props }) => (
          <ol
            {...props}
            style={{ margin: '8px 0', paddingLeft: 18, display: 'grid', gap: 4, fontSize: 14 }}
          />
        ),
        li: ({ node, ...props }) => <li {...props} style={{ lineHeight: 1.55 }} />,
        code: ({ node, className, children, ...props }) => {
          const isBlock = className?.includes('language-');
          if (isBlock) {
            return (
              <pre
                style={{
                  margin: '8px 0',
                  padding: 12,
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  overflowX: 'auto',
                  color: 'var(--fg-dim)',
                }}
              >
                <code {...props}>{children}</code>
              </pre>
            );
          }
          return (
            <code
              {...props}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9em',
                background: 'rgba(255,255,255,0.08)',
                padding: '1px 5px',
                borderRadius: 4,
                color: 'var(--accent-hot)',
              }}
            >
              {children}
            </code>
          );
        },
        h1: ({ node, ...props }) => (
          <h3 {...props} style={{ fontSize: 17, fontWeight: 600, margin: '8px 0 6px', color: 'var(--fg)' }} />
        ),
        h2: ({ node, ...props }) => (
          <h3 {...props} style={{ fontSize: 15, fontWeight: 600, margin: '8px 0 6px', color: 'var(--fg)' }} />
        ),
        h3: ({ node, ...props }) => (
          <h4 {...props} style={{ fontSize: 14, fontWeight: 600, margin: '6px 0 4px', color: 'var(--fg)' }} />
        ),
        hr: ({ node, ...props }) => (
          <hr {...props} style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '12px 0' }} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  /** Knowledge files the agent read while producing this answer. */
  filesRead?: string[];
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
        filesRead: Array.isArray(data.filesRead) ? data.filesRead : undefined,
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
        'ds fixed z-50 transition-all duration-300',
        isMobile ? 'bottom-0 right-0 left-0' : 'bottom-4 right-4',
        isMinimized ? 'w-80' : (isMobile ? 'w-full' : 'w-96'),
        className
      )}
    >
      {/* Chat Header */}
      <div
        className={cn('p-4 flex items-center justify-between', isMobile ? 'rounded-none' : 'rounded-t-xl')}
        style={{
          background: 'var(--bg-elev-2)',
          borderBottom: '1px solid var(--line)',
          boxShadow: '0 8px 24px -16px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div
              className="flex items-center justify-center"
              style={{ width: 36, height: 36 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/gecentreerd-logo.svg"
                alt="GroeimetAI"
                width={36}
                height={36}
                style={{ width: 36, height: 36 }}
              />
            </div>
            <div
              className="absolute -bottom-1 -right-1 rounded-full"
              style={{
                width: 10,
                height: 10,
                background: 'var(--good)',
                border: '2px solid var(--bg-elev-2)',
              }}
            />
          </div>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 16, color: 'var(--fg)', margin: 0 }}>
              {t('interface.title')}
            </h3>
            <p
              className="mono"
              style={{
                fontSize: 11,
                color: 'var(--fg-mute)',
                letterSpacing: '0.04em',
                margin: 0,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {t('interface.subtitle')}
            </p>
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
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--fg-dim)' }}
            aria-label={isMobile ? t('interface.closeChat') : (isMinimized ? t('interface.maximizeChat') : t('interface.minimizeChat'))}
          >
            {isMobile ? <X className="h-5 w-5" /> : (isMinimized ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />)}
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      {!isMinimized && (
        <div style={{ background: 'var(--bg)', borderLeft: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
          <div className={cn('overflow-y-auto p-4 space-y-3', isMobile ? 'h-[70vh]' : 'h-96')}>
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{
                      maxWidth: '80%',
                      background: isUser ? 'var(--accent)' : 'var(--bg-elev)',
                      color: isUser ? '#1a0d05' : 'var(--fg)',
                      border: isUser ? '1px solid var(--accent)' : '1px solid var(--line)',
                    }}
                  >
                    {isUser ? (
                      <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </p>
                    ) : (
                      <div className="chat-md" style={{ color: 'var(--fg-dim)' }}>
                        <ChatMarkdown>{message.content}</ChatMarkdown>
                      </div>
                    )}

                    {message.role === 'assistant' && message.filesRead && message.filesRead.length > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: '1px solid var(--line)',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6,
                        }}
                        aria-label="Knowledge files used for this answer"
                      >
                        {Array.from(new Set(message.filesRead)).map((path) => (
                          <span
                            key={path}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: 'rgba(255,90,31,0.1)',
                              border: '1px solid rgba(255,90,31,0.25)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: 10,
                              color: 'var(--accent)',
                            }}
                            title={`De agent las ${path} om dit te beantwoorden`}
                          >
                            <svg
                              width="10" height="10" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M3 7 V18 a2 2 0 0 0 2 2 H19 a2 2 0 0 0 2 -2 V9 a2 2 0 0 0 -2 -2 H12 L10 5 H5 a2 2 0 0 0 -2 2 Z" />
                            </svg>
                            {path.replace(/^knowledge\//, '')}
                          </span>
                        ))}
                      </div>
                    )}

                    <p
                      className="mono"
                      style={{
                        fontSize: 10,
                        marginTop: 6,
                        marginBottom: 0,
                        color: isUser ? 'rgba(26,13,5,0.65)' : 'var(--fg-mute)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: 'var(--bg-elev)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <div className="flex space-x-1">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="rounded-full"
                        style={{
                          width: 6,
                          height: 6,
                          background: 'var(--fg-mute)',
                          animation: 'ds-bounce 1.2s infinite',
                          animationDelay: `${delay}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div
            style={{
              borderTop: '1px solid var(--line)',
              padding: 16,
              background: 'var(--bg-elev-2)',
            }}
          >
            {/* Voice Error Display */}
            {voiceError && (
              <div
                style={{
                  marginBottom: 8,
                  padding: 8,
                  background: 'rgba(255,90,31,0.1)',
                  border: '1px solid rgba(255,90,31,0.3)',
                  borderRadius: 8,
                  color: 'var(--accent-hot)',
                  fontSize: 12,
                }}
              >
                {voiceError}
              </div>
            )}

            {/* Voice Mode Toggle */}
            {enableVoice && (
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <span
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)' }}
                >
                  {isVoiceMode ? t('voice.modeActive') : t('voice.modeAvailable')}
                </span>
                <button
                  onClick={toggleVoiceMode}
                  className="rounded-full"
                  style={{
                    padding: 6,
                    background: isVoiceMode ? 'rgba(255,90,31,0.16)' : 'var(--bg-elev)',
                    color: isVoiceMode ? 'var(--accent)' : 'var(--fg-mute)',
                    border: `1px solid ${isVoiceMode ? 'rgba(255,90,31,0.3)' : 'var(--line)'}`,
                  }}
                  title={isVoiceMode ? t('voice.switchToText') : t('voice.switchToVoice')}
                >
                  {isVoiceMode ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                </button>
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
                style={{
                  flex: 1,
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: 'var(--fg)',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  outline: 'none',
                }}
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
                className="shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: '1px solid var(--accent)',
                  background: isLoading || !input.trim() ? 'var(--bg-elev)' : 'var(--accent)',
                  color: isLoading || !input.trim() ? 'var(--fg-mute)' : '#1a0d05',
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background .2s, color .2s',
                  boxShadow: isLoading || !input.trim() ? 'none' : '0 6px 18px -6px rgba(255,90,31,.6)',
                }}
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
            <div
              className="flex items-center justify-between mono"
              style={{
                marginTop: 10,
                fontSize: 10,
                color: 'var(--fg-mute)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
              }}
            >
              <span>{t('interface.poweredBy')}</span>
              {enableVoice && isVoiceMode && (
                <span style={{ color: 'var(--accent)' }}>{t('interface.voiceEnabled')}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div
          className="rounded-b-xl text-center"
          style={{
            background: 'var(--bg-elev-2)',
            border: '1px solid var(--line)',
            borderTop: 'none',
            padding: 10,
            fontSize: 13,
            color: 'var(--fg-dim)',
          }}
        >
          {t('interface.clickToContinue')}
        </div>
      )}
    </div>
  );
};

export default ChatbotInterface;
