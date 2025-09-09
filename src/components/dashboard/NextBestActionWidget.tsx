'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, TrendingUp, Clock, ArrowRight, X
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface NextActionProps {
  userState: {
    hasAssessment?: boolean;
    hasPilot?: boolean;
    isLiveClient?: boolean;
    systemCount?: number;
    ticketVolume?: number;
    lastAssessment?: Date;
  };
}

export default function NextBestActionWidget({ userState }: NextActionProps) {
  const [dismissed, setDismissed] = useState(false);

  const getRecommendation = () => {
    // Smart recommendations based on user state
    if (!userState.hasAssessment) {
      return {
        title: 'Start with Agent Readiness Assessment',
        description: 'Understand your current position and opportunities in the agent economy.',
        benefit: 'Get clarity on your agent infrastructure potential',
        timeToValue: '5 minutes',
        href: '/agent-readiness',
        cta: 'Start Assessment',
        priority: 'high'
      };
    }

    if (userState.hasAssessment && !userState.hasPilot) {
      return {
        title: 'Launch Your First Pilot Project',
        description: 'Prove the value of agent automation with a low-risk pilot implementation.',
        benefit: 'ROI proof in 2-4 weeks',
        timeToValue: '2-4 weeks',
        href: '/pilot-intake',
        cta: 'Request Pilot',
        priority: 'high'
      };
    }

    if (userState.hasPilot && !userState.isLiveClient) {
      return {
        title: 'Scale to Full Implementation',
        description: 'Expand your successful pilot to complete agent infrastructure.',
        benefit: 'Multiply your pilot results',
        timeToValue: '2-6 months',
        href: '/implementation-proposal',
        cta: 'Get Proposal',
        priority: 'medium'
      };
    }

    if (userState.isLiveClient && userState.ticketVolume && userState.ticketVolume > 1000) {
      return {
        title: 'Add Your CRM to Agent Infrastructure',
        description: 'High ticket volume detected. CRM integration would save significant time.',
        benefit: '20+ hours/week saved',
        timeToValue: '3 months ROI',
        href: '/implementation-proposal?system=crm',
        cta: 'Get Proposal',
        priority: 'high'
      };
    }

    if (userState.lastAssessment && 
        Date.now() - userState.lastAssessment.getTime() > 180 * 24 * 60 * 60 * 1000) {
      return {
        title: 'Time for Reassessment - What\'s Changed?',
        description: 'Your last assessment was 6+ months ago. Update your readiness score.',
        benefit: 'Discover new opportunities',
        timeToValue: '5 minutes',
        href: '/agent-readiness',
        cta: 'Update Assessment',
        priority: 'medium'
      };
    }

    // Default recommendation
    return {
      title: 'Book Strategy Session',
      description: 'Quarterly review to optimize your agent infrastructure and explore new possibilities.',
      benefit: 'Maximize agent ROI',
      timeToValue: '30 minutes',
      href: '/contact',
      cta: 'Schedule Call',
      priority: 'low'
    };
  };

  const recommendation = getRecommendation();

  if (dismissed) return null;

  return (
    <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/30 mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2" style={{ color: '#F87315' }} />
            Recommended Next Step
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={
              recommendation.priority === 'high' ? 'bg-red-500/20 text-red-400' :
              recommendation.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
              'bg-green-500/20 text-green-400'
            }>
              {recommendation.priority.toUpperCase()} IMPACT
            </Badge>
            <button 
              onClick={() => setDismissed(true)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h4 className="text-xl font-bold text-white mb-3">
            "{recommendation.title}"
          </h4>
          <p className="text-white/80 leading-relaxed mb-4">
            {recommendation.description}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" style={{ color: '#F87315' }} />
              <span className="text-white/70 text-sm">
                <strong>Voordeel:</strong> {recommendation.benefit}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" style={{ color: '#F87315' }} />
              <span className="text-white/70 text-sm">
                <strong>Tijd:</strong> {recommendation.timeToValue}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={recommendation.href} className="flex-1">
            <Button 
              className="w-full text-white font-semibold"
              style={{ backgroundColor: '#F87315' }}
            >
              {recommendation.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Button 
            onClick={() => setDismissed(true)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}