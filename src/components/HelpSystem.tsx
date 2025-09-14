'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

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
  MessageSquare,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  pagePattern?: string; // Optional regex pattern to match specific pages
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
    targetElement: '[data-help="dashboard-main-widgets"]',
    title: 'Customize Your Dashboard',
    content:
      'Click the customize button to add, remove, or rearrange widgets to suit your workflow.',
    position: 'bottom',
    showOnFirstVisit: true,
    pagePattern: '^/(nl|en)?/?dashboard$', // Only show on main dashboard
  },
  {
    id: 'notification-center',
    targetElement: '[data-help="notification-center"]',
    title: 'Stay Updated',
    content:
      'All your notifications in one place. Click the bell icon to view and manage your notifications.',
    position: 'bottom',
  },
  {
    id: 'project-timeline',
    targetElement: '[data-help="project-timeline"]',
    title: 'Track Your Progress',
    content: 'See where your project stands and what comes next in your journey with us.',
    position: 'right',
    pagePattern: '^/(nl|en)?/?dashboard$', // Only show on main dashboard
  },
  {
    id: 'chat-widget',
    targetElement: '[data-help="chat-widget"]',
    title: 'Direct Communication',
    content:
      'Chat directly with our team. Get instant support, ask questions, and receive updates.',
    position: 'left',
    pagePattern: '^/(nl|en)?/?dashboard$', // Only show on main dashboard
  },
  {
    id: 'quick-actions',
    targetElement: '[data-help="quick-actions"]',
    title: 'Quick Access',
    content: 'Jump to frequently used features with these quick action buttons.',
    position: 'top',
    pagePattern: '^/(nl|en)?/?dashboard$', // Only show on main dashboard
  },
  {
    id: 'welcome-header',
    targetElement: '[data-help="welcome-header"]',
    title: 'Your Personalized Dashboard',
    content: 'This is your central hub for managing AI projects and tracking progress.',
    position: 'bottom',
    showOnFirstVisit: true,
    pagePattern: '^/(nl|en)?/?dashboard$', // Only show on main dashboard
  },
];

const TUTORIALS: Tutorial[] = [
  // Tutorials sectie leeggemaakt zoals gevraagd
];

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: '1',
    title: 'Welcome to GroeimetAI - Your AI Transformation Partner',
    category: 'About GroeimetAI',
    tags: ['groeimetai', 'company', 'ai', 'transformation'],
    content: `
# Welcome to GroeimetAI - Your AI Transformation Partner

GroeimetAI is een Nederlandse AI consultancy die bedrijven helpt groeien met cutting-edge AI technologie. We zijn gespecialiseerd in het bouwen van agent-ready infrastructuur en multi-agent systemen.

## Onze Expertise
- **Agent Infrastructure**: MCP servers en API integraties
- **Multi-Agent Systemen**: Orchestratie van AI-agents voor complexe processen
- **ServiceNow Development**: Gespecialiseerd in Snow-flow ontwikkeling
- **RAG Architectuur**: Retrieval-Augmented Generation systemen

## Waarom GroeimetAI?
- 🚀 **Agent Infrastructure Pioniers** sinds 2023
- 🔧 **Praktisch > Theoretisch** - We bouwen wat werkt
- 🎯 **Custom > Copy-Paste** - Elke oplossing op maat
- 🇳🇱 **Nederlands & Direct** - Geen Silicon Valley hype

## Onze Diensten
1. **Agent Readiness Assessment** - Gratis analyse van je huidige infrastructuur
2. **Expert Assessment** (€2.500) - Diepgaande roadmap en implementatieplan
3. **Pilot Trajecten** - Proof-of-concept ontwikkeling
4. **Full Implementation** - Complete AI transformatie

Begin je reis met onze gratis Agent Readiness Check!
    `,
  },
  {
    id: '2',
    title: 'Agent Readiness Assessment - Hoe het werkt',
    category: 'Assessments',
    tags: ['assessment', 'agent-readiness', 'gratis', 'score'],
    content: `
# Agent Readiness Assessment - Hoe het werkt

Onze gratis Agent Readiness Assessment helpt je begrijpen hoe klaar jouw bedrijf is voor AI agents.

## Het Assessment Proces

### 1. Quick Check (5 minuten)
Start met onze **5 snelle vragen** op de homepage:
- API beschikbaarheid van je systemen
- Data toegankelijkheid en vindbaarheid
- Proces documentatie status
- Huidige automation ervaring
- Grootste blockers voor automation

**Result**: Immediate score + niveau (0-100 punten)

### 2. Volledige Assessment (15 minuten)
Voor een diepere analyse, vul de complete assessment in:
- Core business beschrijving
- Systeem prioriteiten en architectuur
- Budget realiteit en planning
- Team readiness en adoption snelheid
- IT maturiteit en security vereisten

**Result**: Uitgebreid rapport via email binnen 2 minuten

## Score Interpretatie
- **90-100**: Agent-Ready (Level 5) - Start binnen weken
- **70-89**: Integration-Ready (Level 4) - 2-3 maanden voorbereiding
- **50-69**: Digitalization-Ready (Level 3) - 6-12 maanden werk
- **30-49**: Foundation-Building (Level 2) - 1-2 jaar ontwikkeling
- **0-29**: Pre-Digital (Level 1) - Begin met basis digitalisering

## Volgende Stappen
- **Hoge scores**: Expert Assessment voor concrete roadmap
- **Middel scores**: Pilot traject voor proof-of-concept
- **Lage scores**: Modernisering advies en fundament opbouw

Start vandaag nog met je gratis assessment!
    `,
  },
  {
    id: '3',
    title: 'Expert Assessment vs Agent Readiness - Het verschil',
    category: 'Assessments',
    tags: ['expert-assessment', 'verschil', 'roadmap', 'advies'],
    content: `
# Expert Assessment vs Agent Readiness - Het verschil

Beide assessments helpen je AI readiness te begrijpen, maar hebben verschillende doelen en diepgang.

## Agent Readiness Assessment (Gratis)
**Doel**: Snelle score en algemene richting

### Wat je krijgt:
- ✅ **Agent Readiness Score** (0-100)
- ✅ **Maturity Level** (1-5) met beschrijving
- ✅ **Algemene inzichten** en best practices
- ✅ **Indicatie tijd** tot agent-ready
- ✅ **GroeimetAI certificaat** + LinkedIn badge

### Tijd: 5-15 minuten
### Prijs: Gratis
### Output: Geautomatiseerd rapport via email

---

## Expert Assessment (€2.500)
**Doel**: Concrete roadmap en implementatieplan

### Wat je krijgt:
- 🎯 **Specifieke gaps analyse** voor jouw situatie
- 🗺️ **Stap-voor-stap roadmap** met tijdlijnen
- 💰 **Budget planning** en cost-benefit analyse
- 🔧 **Technische specificaties** voor implementatie
- 👥 **Team training plan** en change management
- 📞 **45-min expert sessie** voor vragen en uitleg
- 🔄 **3 maanden follow-up** support

### Tijd: 2-3 weken expert analyse
### Prijs: €2.500 (eenmalig)
### Output: Persoonlijk expert rapport + consultatie

## Wanneer Welke Kiezen?

**Start altijd met Agent Readiness** (gratis):
- Geeft je baseline score en richting
- Helpt prioriteiten stellen
- Toont waar je staat in de markt

**Upgrade naar Expert Assessment** als je:
- Score > 50 hebt (concrete implementatie mogelijk)
- Budget hebt voor daadwerkelijke uitvoering
- Concrete roadmap en tijdplanning nodig hebt
- Expert advies wilt voor je specifieke situatie

**Pro tip**: Begin gratis, upgrade als je klaar bent voor actie!
    `,
  },
  {
    id: '4',
    title: 'Dashboard Handleiding - Alles wat je moet weten',
    category: 'Platform',
    tags: ['dashboard', 'navigatie', 'features', 'handleiding'],
    content: `
# Dashboard Handleiding - Alles wat je moet weten

Je GroeimetAI dashboard is je centrale hub voor alle AI projecten en communicatie.

## Dashboard Overzicht

### 📊 **Metrics & Statistics**
- **Active Projects**: Lopende AI implementaties
- **Messages**: Directe communicatie met team
- **Consultations**: Geplande expert sessies
- **System Health**: Real-time status monitoring

### 📈 **Real-time Data**
Alle data komt live uit Firestore:
- Project voortgang updates
- Team communicatie logs
- Assessment resultaten
- System performance metrics

## Hoofdsecties

### 🏠 **Dashboard Home**
- Project overzicht en voortgang
- Recent activities en updates
- Quick actions voor veelgebruikte features
- System health monitoring

### 💬 **Messages & Communication**
- Direct chat met GroeimetAI team
- Project-specifieke communicatie
- Notification center voor updates
- Support chat voor vragen

### 📋 **Projects & Quotes**
- Bekijk alle actieve projecten
- Track milestones en deliverables
- Download project documentatie
- Quote geschiedenis en status

### ⚙️ **Settings & Profile**
- Persoonlijke voorkeuren instellen
- Notification instellingen
- Account informatie bijwerken
- Security en privacy opties

## Pro Tips
- 🔔 **Enable notifications** voor real-time updates
- 💬 **Gebruik chat** voor directe support
- 📊 **Check metrics** voor project voortgang
- ⚙️ **Personaliseer** je dashboard ervaring

Heb je vragen? Gebruik de chat widget rechtsonder!
    `,
  },
  {
    id: '5',
    title: 'Van Assessment naar Implementatie - De Complete Reis',
    category: 'Workflow',
    tags: ['implementatie', 'proces', 'stappen', 'roadmap'],
    content: `
# Van Assessment naar Implementatie - De Complete Reis

Ontdek hoe GroeimetAI je begeleidt van eerste assessment tot volledige AI implementatie.

## De Complete Customer Journey

### 🎯 **Stap 1: Assessment & Discovery**
**Duur**: 5-30 minuten
- Start met gratis Agent Readiness Check
- Optioneel: Expert Assessment voor diepere analyse
- **Output**: Score, niveau, en basisrichtingen

### 🗺️ **Stap 2: Roadmap & Planning**
**Duur**: 1-2 weken
- Gedetailleerde gap analyse
- Technische architectuur planning
- Budget en timeline bepaling
- **Output**: Concrete implementatieplan

### 🧪 **Stap 3: Pilot & Proof-of-Concept**
**Duur**: 4-8 weken
- Selecteer 1-2 systemen voor pilot
- Bouw minimum viable automation
- Test en valideer met je team
- **Output**: Werkend prototype + learnings

### 🚀 **Stap 4: Full Implementation**
**Duur**: 3-12 maanden
- Scale successful pilot naar meer systemen
- Enterprise-grade security en compliance
- Team training en change management
- **Output**: Production-ready agent infrastructure

### 📈 **Stap 5: Optimization & Growth**
**Duur**: Ongoing
- Performance monitoring en tuning
- Nieuwe use cases en expansie
- Continuous improvement
- **Output**: Measurable ROI en business impact

## Onze Garanties
- ✅ **Geen vendor lock-in** - Je behoudt controle
- ✅ **Open source approach** - Transparante technologie
- ✅ **GDPR compliant** - Nederlandse privacy standards
- ✅ **24/7 support** - Nederlandse tijdzone service

## Success Metrics
Klanten zien gemiddeld:
- 🎯 **40-60% efficiency gains** binnen 6 maanden
- 💰 **ROI van 200-400%** binnen eerste jaar
- ⚡ **80% snellere** proces afhandeling
- 😊 **Verhoogde tevredenheid** team en klanten

**Klaar om te beginnen? Start met je gratis assessment!**
    `,
  },
];

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeTooltips, setActiveTooltips] = useState<string[]>([]);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSeenTooltips, setHasSeenTooltips] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hideTooltip = useCallback((tooltipId: string) => {
    setActiveTooltips((prev) => prev.filter((id) => id !== tooltipId));
  }, []);

  const showTooltip = useCallback(
    (tooltipId: string) => {
      // Find the tooltip configuration
      const tooltip = HELP_TOOLTIPS.find((t) => t.id === tooltipId);
      if (!tooltip) return;

      // Check if tooltip should be shown on current page
      if (tooltip.pagePattern) {
        const regex = new RegExp(tooltip.pagePattern);
        if (!regex.test(pathname)) {
          return; // Don't show tooltip if page doesn't match pattern
        }
      }

      // Prevent duplicate tooltips
      setActiveTooltips((prev) => {
        if (prev.includes(tooltipId)) return prev;
        return [...prev, tooltipId];
      });

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
    },
    [hasSeenTooltips, hideTooltip, pathname]
  );

  // Load seen tooltips from localStorage
  useEffect(() => {
    const seen = localStorage.getItem('seenHelpTooltips');
    if (seen) {
      setHasSeenTooltips(JSON.parse(seen));
    }
  }, []);

  // Show first-visit tooltips only on dashboard
  useEffect(() => {
    // Only show tooltips on the main dashboard page
    const isDashboardPage =
      pathname === '/dashboard' || pathname === '/nl/dashboard' || pathname === '/en/dashboard';

    if (!isDashboardPage) {
      // Clear any active tooltips when navigating away from dashboard
      setActiveTooltips([]);
      return;
    }

    // Temporarily disable auto-showing tooltips to prevent duplicates
    /*
    const firstVisitTooltips = HELP_TOOLTIPS.filter(
      tooltip => tooltip.showOnFirstVisit && !hasSeenTooltips.includes(tooltip.id)
    );
    
    if (firstVisitTooltips.length > 0) {
      setTimeout(() => {
        firstVisitTooltips.forEach(tooltip => {
          // Check if the target element exists on the page
          const targetElement = document.querySelector(tooltip.targetElement);
          if (targetElement) {
            showTooltip(tooltip.id);
          }
        });
      }, 2000);
    }
    */
  }, [hasSeenTooltips, showTooltip, pathname]);

  const startTutorial = (tutorialId: string) => {
    const tutorial = TUTORIALS.find((t) => t.id === tutorialId);
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

  const filteredArticles = HELP_ARTICLES.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <HelpContext.Provider value={{ showTooltip, hideTooltip, startTutorial, openHelpCenter }}>
      {children}

      {/* Help Button */}
      {mounted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 left-4 z-40"
        >
          <Button
            className="bg-orange hover:bg-orange/90 rounded-full w-14 h-14 shadow-lg"
            onClick={openHelpCenter}
          >
            <HelpCircle className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Contextual Tooltips */}
      <AnimatePresence>
        {activeTooltips.map((tooltipId) => {
          const tooltip = HELP_TOOLTIPS.find((t) => t.id === tooltipId);
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
                  left: rect.left + rect.width / 2 - tooltipWidth / 2,
                };
                break;
              case 'bottom':
                position = {
                  top: rect.bottom + padding,
                  left: rect.left + rect.width / 2 - tooltipWidth / 2,
                };
                break;
              case 'left':
                position = {
                  top: rect.top + rect.height / 2 - tooltipHeight / 2,
                  left: rect.left - tooltipWidth - padding,
                };
                break;
              case 'right':
                position = {
                  top: rect.top + rect.height / 2 - tooltipHeight / 2,
                  left: rect.right + padding,
                };
                break;
            }

            // Ensure tooltip stays within viewport
            position.top = Math.max(
              10,
              Math.min(position.top, window.innerHeight - tooltipHeight - 10)
            );
            position.left = Math.max(
              10,
              Math.min(position.left, window.innerWidth - tooltipWidth - 10)
            );
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
                left: `${position.left}px`,
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
                  <Button variant="ghost" size="icon" onClick={() => setActiveTutorial(null)}>
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
                <p className="text-white/80">{activeTutorial.steps[tutorialStep].content}</p>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={prevTutorialStep} disabled={tutorialStep === 0}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-white/60 text-sm">
                  Step {tutorialStep + 1} of {activeTutorial.steps.length}
                </span>
                <Button className="bg-orange hover:bg-orange/90" onClick={nextTutorialStep}>
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
        <DialogContent className="bg-black/95 border-white/20 max-w-4xl max-h-[90vh] md:max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Help Center</DialogTitle>
            <DialogDescription className="text-white/60">
              Find answers, tutorials, and resources to help you succeed
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="articles" className="mt-6 flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 bg-white/5">
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-1 mt-6">
              <TabsContent value="articles" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <ScrollArea className="h-[50vh] md:h-[400px]">
                  <div className="space-y-3">
                    {filteredArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setSelectedArticle(article)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-white font-medium mb-1">{article.title}</h4>
                              <p className="text-white/60 text-sm line-clamp-2">
                                {article.content}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {article.tags.map((tag) => (
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
              </TabsContent>

              <TabsContent value="tutorials" className="text-center py-12">
                <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Interactive Tutorials Coming Soon
                </h3>
                <p className="text-white/60">
                  We&apos;re creating step-by-step interactive guides to help you master our platform
                </p>
              </TabsContent>

              <TabsContent value="videos" className="text-center py-12">
                <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Video Tutorials Coming Soon
                </h3>
                <p className="text-white/60">
                  We&apos;re creating helpful video content to guide you
                </p>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Bot className="w-8 h-8 text-orange" />
                      <div>
                        <h4 className="text-white font-medium mb-2">AI Assistant (24/7)</h4>
                        <p className="text-white/60 text-sm mb-4">
                          Get instant answers from our AI chatbot - available 24/7 to help with all
                          your questions
                        </p>
                        <Button
                          className="bg-orange hover:bg-orange/90"
                          onClick={() => {
                            setIsHelpCenterOpen(false);
                            // Trigger chatbot opening
                            const event = new CustomEvent('openChatbot');
                            window.dispatchEvent(event);
                          }}
                        >
                          Open AI Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <MessageSquare className="w-8 h-8 text-blue-500" />
                      <div>
                        <h4 className="text-white font-medium mb-2">Chat with Human Support</h4>
                        <p className="text-white/60 text-sm mb-4">
                          Need more help? Connect with our support team during business hours
                          (Mon-Fri 9-17 CET)
                        </p>
                        <a
                          href="/dashboard/messages"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <Button variant="outline">
                            Open Support Chat
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <BookOpen className="w-8 h-8 text-green-500" />
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
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="bg-black/95 border-white/20 max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              {selectedArticle?.title}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {selectedArticle?.category}
              </Badge>
              {selectedArticle?.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </DialogHeader>

          <div className="flex-1 mt-6 overflow-y-auto max-h-[60vh]">
            <div className="prose prose-invert max-w-none p-4">
              {selectedArticle?.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return (
                    <h1 key={index} className="text-3xl font-bold text-white mb-4">
                      {line.slice(2)}
                    </h1>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl font-semibold text-white mb-3 mt-6">
                      {line.slice(3)}
                    </h2>
                  );
                }
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl font-semibold text-white mb-2 mt-4">
                      {line.slice(4)}
                    </h3>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <li key={index} className="text-white/80 ml-4 list-disc">
                      {line.slice(2)}
                    </li>
                  );
                }
                if (line.trim().length === 0) {
                  return <br key={index} />;
                }
                return (
                  <p key={index} className="text-white/80 mb-3">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </HelpContext.Provider>
  );
}

// Helper component to add help tooltip triggers
export function HelpTrigger({
  tooltipId,
  children,
}: {
  tooltipId: string;
  children: React.ReactNode;
}) {
  const { showTooltip } = useHelp();

  return (
    <div data-help={tooltipId} className="relative inline-block">
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
