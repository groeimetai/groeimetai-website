'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, Rocket, TrendingUp, Lightbulb, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface ServiceRequestCardsProps {
  userState: {
    hasAssessment?: boolean;
    hasPilot?: boolean;
    isLiveClient?: boolean;
    systemCount?: number;
    lastAssessment?: Date;
  };
}

export default function ServiceRequestCards({ userState }: ServiceRequestCardsProps) {
  const serviceCards = [
    {
      icon: BarChart3,
      title: 'Schedule New Assessment',
      description: 'Update your readiness score\nSee new opportunities',
      cta: 'Start Assessment',
      href: '/agent-readiness',
      show: !userState.hasAssessment || (userState.lastAssessment && 
        Date.now() - userState.lastAssessment.getTime() > 180 * 24 * 60 * 60 * 1000) // 6 months
    },
    {
      icon: Rocket,
      title: 'Add Another System',
      description: 'Expand your agent infrastructure\nQuick 2-week implementation',
      cta: 'Request Quote',
      href: '/implementation-proposal',
      show: userState.hasPilot || userState.isLiveClient
    },
    {
      icon: TrendingUp,
      title: 'Upgrade Monitoring',
      description: 'Get deeper insights\nAdvanced analytics',
      cta: 'View Plans',
      href: '/services#monitoring',
      show: userState.isLiveClient
    },
    {
      icon: Lightbulb,
      title: 'Book Strategy Session',
      description: 'Quarterly business review\nOptimization opportunities',
      cta: 'Schedule Call',
      href: '/contact',
      show: true // Always show
    }
  ];

  const visibleCards = serviceCards.filter(card => card.show);

  if (visibleCards.length === 0) return null;

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-6"
      >
        <h3 className="text-2xl font-bold text-white mb-2">Ready for More?</h3>
        <p className="text-white/70">Expand your agent infrastructure with these next steps</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 h-full">
              <CardContent className="p-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#F87315' }}
                >
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                
                <h4 className="text-lg font-bold text-white mb-3">{card.title}</h4>
                <p className="text-white/70 text-sm leading-relaxed mb-6 whitespace-pre-line">
                  {card.description}
                </p>
                
                <Link href={card.href}>
                  <Button 
                    className="w-full text-white group"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    {card.cta}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}