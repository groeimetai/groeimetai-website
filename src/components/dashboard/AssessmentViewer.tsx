'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Target, Brain, ArrowRight, 
  AlertTriangle, CheckCircle, Clock, Star, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AssessmentViewerProps {
  assessmentId: string;
  isFirstTime?: boolean;
  initialScore?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AssessmentData {
  id: string;
  score: number;
  level: string;
  responses: Record<string, any>;
  createdAt: Date;
  userId?: string;
  email?: string;
  status: string;
  type: string;
}

export default function AssessmentViewer({ 
  assessmentId, 
  isFirstTime = false, 
  initialScore 
}: AssessmentViewerProps) {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const maxMessages = 10;

  // Load assessment data
  useEffect(() => {
    loadAssessmentData();
  }, [assessmentId]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (assessment && chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hallo! 👋 

Ik zie dat je je Agent Readiness Assessment hebt afgerond met een score van **${assessment.score}/100** - niveau **${assessment.level}**.

Ik kan je helpen om je resultaten beter te begrijpen en concrete volgende stappen te bepalen. Wat wil je weten over je assessment?

Bijvoorbeeld:
• Wat betekent mijn score precies?
• Welke systemen moet ik prioriteren?
• Hoe lang duurt implementatie ongeveer?
• Wat zijn mijn grootste blockers?`,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
  }, [assessment]);

  const loadAssessmentData = async () => {
    setLoading(true);
    try {
      // First try to get from agent_assessments
      const response = await fetch(
        `/api/assessment/get-by-id?assessmentId=${assessmentId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.assessment) {
          setAssessment(data.assessment);
          return;
        }
      }
      
      // Fallback: create mock data if not found but we have score from URL
      if (initialScore) {
        const mockAssessment: AssessmentData = {
          id: assessmentId,
          score: initialScore,
          level: getLevelFromScore(initialScore),
          responses: {},
          createdAt: new Date(),
          status: 'completed',
          type: 'agent_readiness'
        };
        setAssessment(mockAssessment);
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
      toast.error('Kon assessment niet laden');
    } finally {
      setLoading(false);
    }
  };

  const getLevelFromScore = (score: number): string => {
    if (score >= 90) return 'Agent-Ready (Level 5)';
    if (score >= 70) return 'Integration-Ready (Level 4)';
    if (score >= 50) return 'Digitalization-Ready (Level 3)';
    if (score >= 30) return 'Foundation-Building (Level 2)';
    return 'Pre-Digital (Level 1)';
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isChatLoading) return;
    
    if (messageCount >= maxMessages) {
      toast.error(`Je hebt het maximum van ${maxMessages} berichten bereikt. Upgrade naar Expert Assessment voor onbeperkte chat.`);
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsChatLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const response = await fetch('/api/assessment/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage.trim(),
          assessmentData: assessment,
          chatHistory: chatMessages.slice(-4) // Last 4 messages for context
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Chat response failed');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, er ging iets mis. Probeer het opnieuw.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Assessment laden...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Assessment niet gevonden</h3>
          <p className="text-white/60 mb-4">Het gevraagde assessment kon niet worden geladen.</p>
          <Button asChild>
            <Link href="/agent-readiness">
              Nieuwe assessment starten
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const remainingMessages = maxMessages - messageCount;
  const showUpsell = remainingMessages <= 2;

  return (
    <div className="space-y-6">
      {/* First time welcome banner */}
      {isFirstTime && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">🎉 Assessment voltooid!</h2>
          </div>
          <p className="text-green-200 text-sm">
            Je Agent Readiness Assessment is succesvol opgeslagen. Hieronder vind je je resultaten en kun je vragen stellen over je score.
          </p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assessment Results */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-orange" />
              Agent Readiness Assessment
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock className="w-4 h-4" />
              {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString('nl-NL') : 'Recent'}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div
                className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4"
                style={{
                  background: `conic-gradient(#F87315 ${assessment.score}%, rgba(255,255,255,0.1) ${assessment.score}%)`,
                }}
              >
                {assessment.score}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {assessment.level}
              </h3>
              <p className="text-white/70">
                {assessment.score}/100 punten behaald
              </p>
            </div>

            {/* Quick insights */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Key Findings:</h4>
              <div className="grid gap-2 text-sm">
                {assessment.score >= 70 && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Goed voorbereid voor agent implementatie
                  </div>
                )}
                {assessment.score < 70 && assessment.score >= 40 && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-4 h-4" />
                    Enkele voorbereidingen nodig
                  </div>
                )}
                {assessment.score < 40 && (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    Significante voorbereiding vereist
                  </div>
                )}
              </div>
            </div>

            {/* CTA for Expert Assessment */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Wil je een concrete roadmap?</h4>
              <p className="text-white/70 text-sm mb-3">
                Expert Assessment (€2.500) geeft specifieke gaps analyse en implementatie plan voor jouw bedrijf.
              </p>
              <Button 
                size="sm" 
                className="bg-orange text-white w-full"
                asChild
              >
                <Link href="/expert-assessment">
                  Upgrade naar Expert Assessment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Claude Chat */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-orange" />
              Chat met Claude over je resultaten
            </CardTitle>
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">
                Stel vragen over je assessment resultaten
              </p>
              <Badge variant="outline" className="border-white/20 text-white/70">
                {remainingMessages} berichten over
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto space-y-3 bg-white/5 rounded-lg p-4">
              <AnimatePresence>
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-orange text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <div className="prose prose-sm max-w-none">
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-white/70' : 'text-white/50'
                      }`}>
                        {message.timestamp.toLocaleTimeString('nl-NL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isChatLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-white max-w-[80%] p-3 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Message limit warning */}
            {showUpsell && remainingMessages > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">
                    Nog {remainingMessages} berichten over
                  </span>
                </div>
                <p className="text-yellow-200 text-xs">
                  Wil je dieper ingaan op je resultaten? Expert Assessment geeft onbeperkte chat + concrete roadmap.
                </p>
              </motion.div>
            )}

            {/* Message limit reached */}
            {messageCount >= maxMessages && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-orange" />
                  <span className="font-semibold text-white">Chat limiet bereikt</span>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Je hebt alle 10 gratis berichten gebruikt. Upgrade naar Expert Assessment voor:
                </p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Onbeperkte chat met assessment expert
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Concrete implementatie roadmap
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Systeem prioritering en budget planning
                  </div>
                </div>
                <Button className="bg-orange text-white w-full" asChild>
                  <Link href="/expert-assessment">
                    Expert Assessment - €2.500
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            )}

            {/* Chat Input */}
            {messageCount < maxMessages && (
              <div className="flex gap-2">
                <Input
                  placeholder="Stel een vraag over je assessment..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  disabled={isChatLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isChatLoading}
                  className="bg-orange text-white px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}