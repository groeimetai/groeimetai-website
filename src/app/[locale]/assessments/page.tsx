'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Database,
  Shield,
  Settings,
  MessageSquare,
  Brain,
  Plug,
  Calculator,
  Target,
  ArrowRight,
  Clock,
  FileText,
  Sparkles,
} from 'lucide-react';

const assessments = [
  {
    id: 'agent-readiness',
    title: 'Agent Readiness Assessment',
    description: 'Ontdek hoe klaar je organisatie is voor AI agents en intelligente automatisering.',
    icon: Target,
    color: '#F87315',
    bgGradient: 'from-orange-500/10 to-orange-600/10',
    borderColor: 'border-orange-500/30',
    duration: '5-7 min',
    href: '/agent-readiness',
    popular: true,
  },
  {
    id: 'data-readiness',
    title: 'Data Readiness Assessment',
    description: 'Beoordeel de kwaliteit, toegankelijkheid en AI-gereedheid van je data.',
    icon: Database,
    color: '#3B82F6',
    bgGradient: 'from-blue-500/10 to-blue-600/10',
    borderColor: 'border-blue-500/30',
    duration: '5-7 min',
    href: '/assessments/data-readiness',
    popular: false,
  },
  {
    id: 'ai-security',
    title: 'AI Security & Compliance Scan',
    description: 'Check je compliance met de EU AI Act en beveiligingsstandaarden.',
    icon: Shield,
    color: '#10B981',
    bgGradient: 'from-green-500/10 to-green-600/10',
    borderColor: 'border-green-500/30',
    duration: '6-8 min',
    href: '/assessments/ai-security',
    popular: false,
    badge: 'EU AI Act',
  },
  {
    id: 'process-automation',
    title: 'Process Automation Quickscan',
    description: 'Identificeer welke processen rijp zijn voor automatisering en de potentiële ROI.',
    icon: Settings,
    color: '#8B5CF6',
    bgGradient: 'from-purple-500/10 to-purple-600/10',
    borderColor: 'border-purple-500/30',
    duration: '5-7 min',
    href: '/assessments/process-automation',
    popular: false,
  },
  {
    id: 'cx-ai',
    title: 'Customer Experience AI Assessment',
    description: 'Ontdek hoe AI je klantervaring kan transformeren met chatbots en personalisatie.',
    icon: MessageSquare,
    color: '#EC4899',
    bgGradient: 'from-pink-500/10 to-pink-600/10',
    borderColor: 'border-pink-500/30',
    duration: '5-7 min',
    href: '/assessments/cx-ai',
    popular: false,
  },
  {
    id: 'ai-maturity',
    title: 'AI Maturity Scan',
    description: 'Bepaal waar je organisatie staat op de AI-volwassenheidscurve.',
    icon: Brain,
    color: '#F59E0B',
    bgGradient: 'from-amber-500/10 to-amber-600/10',
    borderColor: 'border-amber-500/30',
    duration: '6-8 min',
    href: '/assessments/ai-maturity',
    popular: false,
  },
  {
    id: 'integration-readiness',
    title: 'Integration Readiness Check',
    description: 'Evalueer of je tech stack klaar is voor AI-integraties en moderne architectuur.',
    icon: Plug,
    color: '#06B6D4',
    bgGradient: 'from-cyan-500/10 to-cyan-600/10',
    borderColor: 'border-cyan-500/30',
    duration: '5-7 min',
    href: '/assessments/integration-readiness',
    popular: false,
  },
  {
    id: 'roi-calculator',
    title: 'AI ROI Calculator',
    description: 'Bereken de concrete besparingen en opbrengsten van AI-implementatie.',
    icon: Calculator,
    color: '#22C55E',
    bgGradient: 'from-emerald-500/10 to-emerald-600/10',
    borderColor: 'border-emerald-500/30',
    duration: '4-6 min',
    href: '/assessments/roi-calculator',
    popular: false,
    badge: 'Concrete cijfers',
  },
];

export default function AssessmentsOverviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI Readiness Assessments
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Krijg inzicht in de AI-gereedheid van je organisatie met onze gratis, AI-gegenereerde assessments.
            Elk assessment levert een gepersonaliseerd rapport met concrete aanbevelingen.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-white/60">
            <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 5-8 minuten per assessment</span>
            <span className="flex items-center"><FileText className="w-4 h-4 mr-2" /> AI-gegenereerd rapport</span>
            <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> 100% Gratis</span>
          </div>
        </motion.div>

        {/* Assessment Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {assessments.map((assessment, index) => (
            <motion.div
              key={assessment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={assessment.href}>
                <Card className={`bg-gradient-to-r ${assessment.bgGradient} ${assessment.borderColor} hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: assessment.color }}
                      >
                        <assessment.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-2">
                        {assessment.popular && (
                          <Badge className="bg-orange-500 text-white">Populair</Badge>
                        )}
                        {assessment.badge && (
                          <Badge variant="outline" className="border-white/30 text-white/80">
                            {assessment.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-white mt-4">
                      {assessment.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 mb-4">
                      {assessment.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {assessment.duration}
                      </span>
                      <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                        style={{ color: assessment.color }}
                      >
                        Start Assessment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Niet zeker waar te beginnen?
              </h2>
              <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                Start met de Agent Readiness Assessment - onze meest uitgebreide scan die je een compleet beeld geeft
                van je AI-gereedheid en concrete vervolgstappen.
              </p>
              <Link href="/agent-readiness">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6">
                  Start Agent Readiness Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
