'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X, 
  Maximize2, 
  Minimize2,
  Sparkles,
  Calendar,
  Mail,
  Calculator,
  Globe,
  Database,
  Brain,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  toolsUsed?: string[];
  metadata?: any;
}

interface EnhancedChatbotInterfaceProps {
  className?: string;
  initialMessage?: string;
  onClose?: () => void;
}

// Tool icon mapping
const toolIcons: Record<string, React.ElementType> = {
  'search_knowledge_base': Database,
  'scrape_website': Globe,
  'servicenow_query': FileText,
  'schedule_meeting': Calendar,
  'send_email': Mail,
  'calculate': Calculator,
  'multi_step_analysis': Brain,
  'generate_document': FileText,
};

export const EnhancedChatbotInterface: React.FC<EnhancedChatbotInterfaceProps> = ({
  className,
  initialMessage = `👋 Welkom bij GroeimetAI! Ik ben uw intelligente AI-assistent met geavanceerde mogelijkheden.

Ik kan u helpen met:
• 🔍 Informatie zoeken over onze diensten en cases
• 📅 Meetings plannen voor consultaties
• 📧 Follow-up emails versturen
• 🧮 ROI en kosten berekeningen maken
• 📄 Voorstellen en rapporten genereren
• 🤖 ServiceNow integratie informatie
• 🧠 Complexe vragen analyseren

Hoe kan ik u vandaag helpen?`,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date(),
      toolsUsed: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Suggested prompts for users
  const suggestedPrompts = [
    "Wat zijn jullie GenAI diensten?",
    "Plan een consultatie meeting",
    "Bereken ROI voor multi-agent systeem",
    "Toon succesvolle case studies",
    "ServiceNow AI integratie mogelijkheden",
    "Stuur mij een voorstel",
  ];

  const handleSend = async (message?: string) => {
    const textToSend = message || input.trim();
    
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/chat/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId && { 'X-Session-ID': sessionId }),
        },
        body: JSON.stringify({
          message: textToSend,
          sessionId,
          locale: 'nl',
          mode: agentMode ? 'agent' : 'simple',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429) {
          throw new Error(errorData.error || 'Te veel berichten. Probeer het later opnieuw.');
        }
        
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      // Extract session ID from response
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      setIsTyping(false);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        toolsUsed: data.metadata?.toolsUsed || [],
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Mijn excuses, er is een fout opgetreden. Probeer het later opnieuw.',
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

  const renderToolsUsed = (tools: string[]) => {
    if (!tools || tools.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tools.map((tool, index) => {
          const Icon = toolIcons[tool] || Sparkles;
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange/20 text-orange rounded-full"
            >
              <Icon className="h-3 w-3" />
              {tool.replace(/_/g, ' ')}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300',
        isMobile ? 'bottom-0 right-0 left-0' : 'bottom-4 right-4',
        isMinimized ? 'w-80' : (isMobile ? 'w-full' : 'w-[450px]'),
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
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-black animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white flex items-center gap-2">
              GroeimetAI Agent
              {agentMode && <Sparkles className="h-4 w-4 text-orange" />}
            </h3>
            <p className="text-xs text-orange font-medium">
              {agentMode ? 'Advanced AI Mode' : 'Simple Chat Mode'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAgentMode(!agentMode)}
            className="p-1.5 rounded hover:bg-white/20 transition-colors"
            title={agentMode ? 'Switch to simple mode' : 'Switch to agent mode'}
          >
            <Brain className={cn(
              "h-5 w-5",
              agentMode ? "text-orange" : "text-white/50"
            )} />
          </button>
          <button
            onClick={() => {
              if (isMobile && onClose) {
                onClose();
              } else {
                setIsMinimized(!isMinimized);
              }
            }}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            aria-label={isMobile ? 'Close chat' : (isMinimized ? 'Maximize chat' : 'Minimize chat')}
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
            isMobile ? "h-[70vh]" : "h-[450px]"
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
                    'max-w-[75%] rounded-lg px-4 py-3',
                    message.role === 'user' 
                      ? 'bg-orange text-white' 
                      : 'bg-white/10 text-white'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.toolsUsed && renderToolsUsed(message.toolsUsed)}
                  <p
                    className={cn(
                      'text-xs mt-2',
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
                <div className="bg-white/10 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-orange animate-pulse" />
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
                    <span className="text-xs text-white/50">AI thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {showSuggestions && messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-white/50 mb-2">Suggesties:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(prompt)}
                    className="text-xs px-3 py-1.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="border-t border-white/10 p-4 bg-black">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={agentMode ? "Ask me anything..." : "Type your message..."}
                className="flex-1 px-4 py-2 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent bg-white/10 text-white placeholder-white/50"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className={cn(
                  'p-2 rounded-full transition-all',
                  isLoading || !input.trim()
                    ? 'bg-white/10 text-white/50 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-orange to-orange-600 text-white hover:shadow-lg transform hover:scale-105 focus:ring-2 focus:ring-orange focus:ring-offset-2 focus:ring-offset-black'
                )}
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-white/50">
                {agentMode ? '🚀 AI Agent Mode • Advanced capabilities' : '💬 Simple chat mode'}
              </p>
              {sessionId && (
                <p className="text-xs text-white/30">
                  Session: {sessionId.substring(0, 8)}...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="bg-black border border-white/10 rounded-b-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-4 w-4 text-orange animate-pulse" />
            <span className="text-sm text-white">AI Agent Active</span>
          </div>
          <p className="text-xs text-white/50 mt-1">Click to continue</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatbotInterface;