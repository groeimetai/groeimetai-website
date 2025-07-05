'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  BookOpen,
  Lightbulb,
  Info,
  Video,
  FileText,
  ExternalLink,
  Search,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface HelpTooltip {
  id: string;
  targetElement: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnFirstVisit?: boolean;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  category: 'getting-started' | 'features' | 'advanced';
}

interface TutorialStep {
  title: string;
  content: string;
  targetElement?: string;
  action?: () => void;
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface HelpContextType {
  showTooltip: (tooltipId: string) => void;
  hideTooltip: (tooltipId: string) => void;
  startTutorial: (tutorialId: string) => void;
  openHelpCenter: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within HelpProvider');
  }
  return context;
};

const HELP_TOOLTIPS: HelpTooltip[] = [
  {
    id: 'dashboard-widgets',
    targetElement: '[data-help="dashboard-widgets"]',
    title: 'Customize Your Dashboard',
    content: 'Click the customize button to add, remove, or rearrange widgets to suit your workflow.',
    position: 'bottom',
    showOnFirstVisit: true
  },
  {
    id: 'notification-center',
    targetElement: '[data-help="notification-center"]',
    title: 'Stay Updated',
    content: 'All your notifications in one place. Click the bell icon to view and manage your notifications.',
    position: 'bottom'
  },
  {
    id: 'project-timeline',
    targetElement: '[data-help="project-timeline"]',
    title: 'Track Your Progress',
    content: 'See where your project stands and what comes next in your journey with us.',
    position: 'right'
  },
  {
    id: 'chat-widget',
    targetElement: '[data-help="chat-widget"]',
    title: 'Direct Communication',
    content: 'Chat directly with our team. Get instant support, ask questions, and receive updates.',
    position: 'left'
  },
  {
    id: 'quick-actions',
    targetElement: '[data-help="quick-actions"]',
    title: 'Quick Access',
    content: 'Jump to frequently used features with these quick action buttons.',
    position: 'top'
  },
  {
    id: 'welcome-header',
    targetElement: '[data-help="welcome-header"]',
    title: 'Your Personalized Dashboard',
    content: 'This is your central hub for managing AI projects and tracking progress.',
    position: 'bottom',
    showOnFirstVisit: true
  }
];

const TUTORIALS: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with GroeimetAI',
    description: 'Learn the basics of navigating your dashboard and key features',
    category: 'getting-started',
    steps: [
      {
        title: 'Welcome to Your Dashboard',
        content: 'This is your central hub for managing all your AI projects and communications with our team.',
        targetElement: '[data-help="dashboard-main"]'
      },
      {
        title: 'Customize Your Experience',
        content: 'You can customize your dashboard by adding widgets that matter most to you.',
        targetElement: '[data-help="dashboard-widgets"]'
      },
      {
        title: 'Stay Connected',
        content: 'Use the chat widget to communicate directly with our team anytime.',
        targetElement: '[data-help="chat-widget"]'
      },
      {
        title: 'Track Your Projects',
        content: 'Monitor your project progress and milestones in real-time.',
        targetElement: '[data-help="project-timeline"]'
      }
    ]
  },
  {
    id: 'managing-projects',
    title: 'Managing Your Projects',
    description: 'Learn how to view, track, and manage your AI projects',
    category: 'features',
    steps: [
      {
        title: 'View All Projects',
        content: 'Navigate to the Projects page to see all your active and completed projects.',
        targetElement: '[data-help="projects-link"]'
      },
      {
        title: 'Project Details',
        content: 'Click on any project to view detailed information, timelines, and deliverables.',
      },
      {
        title: 'Communication',
        content: 'Each project has a dedicated chat for seamless communication with your project team.',
      }
    ]
  }
];

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: '1',
    title: 'How to Request a New Project',
    category: 'Getting Started',
    tags: ['project', 'request', 'quote'],
    content: `
# How to Request a New Project

Requesting a new AI project with GroeimetAI is simple:

1. **Click "Start Project"** - You'll find this button in the navigation bar
2. **Fill out the form** - Provide details about your project needs
3. **Submit for review** - Our team will review and respond within 24 hours
4. **Receive your quote** - We'll provide a detailed proposal and timeline

## What to include in your request:
- Clear project objectives
- Desired timeline
- Budget range
- Any specific requirements

Our team is here to help transform your ideas into reality!
    `
  },
  {
    id: '2',
    title: 'Understanding Project Timelines',
    category: 'Projects',
    tags: ['timeline', 'milestones', 'progress'],
    content: `
# Understanding Project Timelines

Your project timeline shows the journey from concept to completion:

## Timeline Stages:
1. **Discovery** - Understanding your needs
2. **Planning** - Defining scope and approach
3. **Development** - Building your solution
4. **Delivery** - Implementation and handover

## Tracking Progress:
- Green checkmarks indicate completed stages
- Orange circles show current stage
- Gray circles are upcoming stages

You'll receive notifications at each milestone completion.
    `
  }
];

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [activeTooltips, setActiveTooltips] = useState<string[]>([]);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSeenTooltips, setHasSeenTooltips] = useState<string[]>([]);

  const hideTooltip = useCallback((tooltipId: string) => {
    setActiveTooltips(prev => prev.filter(id => id !== tooltipId));
  }, []);

  const showTooltip = useCallback((tooltipId: string) => {
    setActiveTooltips(prev => [...prev, tooltipId]);
    
    // Mark as seen
    if (!hasSeenTooltips.includes(tooltipId)) {
      const newSeen = [...hasSeenTooltips, tooltipId];
      setHasSeenTooltips(newSeen);
      localStorage.setItem('seenHelpTooltips', JSON.stringify(newSeen));
    }

    // Auto-hide after 10 seconds
    setTimeout(() => {
      hideTooltip(tooltipId);
    }, 10000);
  }, [hasSeenTooltips, hideTooltip]);

  // Load seen tooltips from localStorage
  useEffect(() => {
    const seen = localStorage.getItem('seenHelpTooltips');
    if (seen) {
      setHasSeenTooltips(JSON.parse(seen));
    }
  }, []);

  // Show first-visit tooltips
  useEffect(() => {
    const firstVisitTooltips = HELP_TOOLTIPS.filter(
      tooltip => tooltip.showOnFirstVisit && !hasSeenTooltips.includes(tooltip.id)
    );
    
    if (firstVisitTooltips.length > 0) {
      setTimeout(() => {
        firstVisitTooltips.forEach(tooltip => {
          showTooltip(tooltip.id);
        });
      }, 2000);
    }
  }, [hasSeenTooltips, showTooltip]);

  const startTutorial = (tutorialId: string) => {
    const tutorial = TUTORIALS.find(t => t.id === tutorialId);
    if (tutorial) {
      setActiveTutorial(tutorial);
      setTutorialStep(0);
      setIsHelpCenterOpen(false);
    }
  };

  const nextTutorialStep = () => {
    if (activeTutorial && tutorialStep < activeTutorial.steps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setActiveTutorial(null);
      setTutorialStep(0);
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const openHelpCenter = () => {
    setIsHelpCenterOpen(true);
  };

  const filteredArticles = HELP_ARTICLES.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <HelpContext.Provider value={{ showTooltip, hideTooltip, startTutorial, openHelpCenter }}>
      {children}

      {/* Help Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          className="bg-orange hover:bg-orange/90 rounded-full w-14 h-14 shadow-lg"
          onClick={openHelpCenter}
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Contextual Tooltips */}
      <AnimatePresence>
        {activeTooltips.map(tooltipId => {
          const tooltip = HELP_TOOLTIPS.find(t => t.id === tooltipId);
          if (!tooltip) return null;

          // Calculate position based on target element
          const targetEl = document.querySelector(tooltip.targetElement);
          let position = { top: 0, left: 0 };
          
          if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            const tooltipWidth = 350; // Approximate width
            const tooltipHeight = 120; // Approximate height
            const padding = 10;
            
            switch (tooltip.position) {
              case 'top':
                position = {
                  top: rect.top - tooltipHeight - padding,
                  left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
                };
                break;
              case 'bottom':
                position = {
                  top: rect.bottom + padding,
                  left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
                };
                break;
              case 'left':
                position = {
                  top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
                  left: rect.left - tooltipWidth - padding
                };
                break;
              case 'right':
                position = {
                  top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
                  left: rect.right + padding
                };
                break;
            }
            
            // Ensure tooltip stays within viewport
            position.top = Math.max(10, Math.min(position.top, window.innerHeight - tooltipHeight - 10));
            position.left = Math.max(10, Math.min(position.left, window.innerWidth - tooltipWidth - 10));
          }

          return (
            <motion.div
              key={tooltip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed z-50"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`
              }}
            >
              <Card className="bg-black/95 border-orange/50 shadow-xl max-w-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-orange" />
                      <CardTitle className="text-base text-white">{tooltip.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => hideTooltip(tooltip.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/80">{tooltip.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {activeTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-black/95 border border-white/20 rounded-xl max-w-2xl w-full p-6"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white">{activeTutorial.title}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveTutorial(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <Progress 
                  value={((tutorialStep + 1) / activeTutorial.steps.length) * 100} 
                  className="h-2"
                />
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {activeTutorial.steps[tutorialStep].title}
                </h3>
                <p className="text-white/80">
                  {activeTutorial.steps[tutorialStep].content}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevTutorialStep}
                  disabled={tutorialStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-white/60 text-sm">
                  Step {tutorialStep + 1} of {activeTutorial.steps.length}
                </span>
                <Button
                  className="bg-orange hover:bg-orange/90"
                  onClick={nextTutorialStep}
                >
                  {tutorialStep === activeTutorial.steps.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Center Dialog */}
      <Dialog open={isHelpCenterOpen} onOpenChange={setIsHelpCenterOpen}>
        <DialogContent className="bg-black/95 border-white/20 max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Help Center</DialogTitle>
            <DialogDescription className="text-white/60">
              Find answers, tutorials, and resources to help you succeed
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="articles" className="mt-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/5">
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="mt-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {filteredArticles.map(article => (
                      <Card key={article.id} className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-white font-medium mb-1">{article.title}</h4>
                              <p className="text-white/60 text-sm line-clamp-2">{article.content}</p>
                              <div className="flex gap-2 mt-2">
                                {article.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <FileText className="w-5 h-5 text-white/40" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="tutorials" className="mt-6">
              <div className="grid gap-4">
                {TUTORIALS.map(tutorial => (
                  <Card 
                    key={tutorial.id} 
                    className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10"
                    onClick={() => startTutorial(tutorial.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium mb-1">{tutorial.title}</h4>
                          <p className="text-white/60 text-sm">{tutorial.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-white/40 text-sm">
                            <span>{tutorial.steps.length} steps</span>
                            <Badge variant="outline" className="text-xs">
                              {tutorial.category}
                            </Badge>
                          </div>
                        </div>
                        <Play className="w-5 h-5 text-orange" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Video Tutorials Coming Soon</h3>
                <p className="text-white/60">We&apos;re creating helpful video content to guide you</p>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-6">
              <div className="space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <MessageSquare className="w-8 h-8 text-orange" />
                      <div>
                        <h4 className="text-white font-medium mb-2">Chat with Support</h4>
                        <p className="text-white/60 text-sm mb-4">
                          Get instant help from our support team through the chat widget
                        </p>
                        <Button className="bg-orange hover:bg-orange/90">
                          Open Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <BookOpen className="w-8 h-8 text-blue-500" />
                      <div>
                        <h4 className="text-white font-medium mb-2">Browse Documentation</h4>
                        <p className="text-white/60 text-sm mb-4">
                          Explore our comprehensive documentation for detailed guides
                        </p>
                        <Button variant="outline">
                          View Docs
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </HelpContext.Provider>
  );
}

// Helper component to add help tooltip triggers
export function HelpTrigger({ 
  tooltipId, 
  children 
}: { 
  tooltipId: string; 
  children: React.ReactNode 
}) {
  const { showTooltip } = useHelp();

  return (
    <div 
      data-help={tooltipId}
      className="relative inline-block"
    >
      {children}
      <button
        onClick={() => showTooltip(tooltipId)}
        className="absolute -top-2 -right-2 w-5 h-5 bg-orange/20 hover:bg-orange/30 rounded-full flex items-center justify-center transition-colors"
      >
        <HelpCircle className="w-3 h-3 text-orange" />
      </button>
    </div>
  );
}