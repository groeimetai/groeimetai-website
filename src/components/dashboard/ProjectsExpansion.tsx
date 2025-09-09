'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Database, Shield, ArrowRight, TrendingUp, Euro
} from 'lucide-react';
import Link from 'next/link';

interface ExpansionProps {
  currentSystems: string[];
  userState: any;
}

export default function ProjectsExpansion({ currentSystems, userState }: ExpansionProps) {
  const expansionOptions = [
    {
      id: 'knowledge-base',
      title: 'Knowledge Base MCP',
      description: 'Make your documentation agent-accessible for instant knowledge retrieval',
      impact: '30% more automation',
      investment: '€12,500',
      timeframe: '3-4 weeks',
      icon: Database,
      show: !currentSystems.includes('knowledge-base')
    },
    {
      id: 'multi-agent',
      title: 'Multi-Agent Orchestration',
      description: 'Connect your existing agents to work together on complex workflows',
      impact: 'Complex task automation',
      investment: '€15,000', 
      timeframe: '4-6 weeks',
      icon: Brain,
      show: userState.systemCount >= 2
    },
    {
      id: 'legacy-bridge',
      title: 'Legacy System Bridge',
      description: 'Make your old systems agent-ready without full modernization',
      impact: 'Unlock legacy data',
      investment: 'From €7,500',
      timeframe: '2-3 weeks',
      icon: Shield,
      show: true
    }
  ];

  const availableOptions = expansionOptions.filter(option => option.show);

  if (availableOptions.length === 0) return null;

  return (
    <Card className="bg-white/5 border-white/10 mb-8">
      <CardHeader>
        <CardTitle className="text-white">
          Expand Your Agent Infrastructure
        </CardTitle>
        <p className="text-white/70 text-sm">
          Based on your current setup, we recommend:
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {availableOptions.map((option, index) => (
            <div 
              key={option.id}
              className="flex items-start justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#F87315' }}
                >
                  <option.icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-2">{option.title}</h4>
                  <p className="text-white/80 text-sm mb-3">{option.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>Impact: {option.impact}</span>
                    </div>
                    <div className="flex items-center">
                      <Euro className="w-3 h-3 mr-1" />
                      <span>Investment: {option.investment}</span>
                    </div>
                    <div>Timeline: {option.timeframe}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link href="/implementation-proposal">
                  <Button
                    size="sm"
                    className="text-white"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    Request Proposal
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-lg text-center">
          <p className="text-white/80 text-sm mb-3">
            <strong>Custom needs?</strong> We can make ANY system agent-ready.
          </p>
          <Link href="/contact">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Discuss Custom Options
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}