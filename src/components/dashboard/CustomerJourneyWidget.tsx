'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, CheckCircle, Clock, AlertTriangle, TrendingUp,
  Target, Users, FileText, Monitor, Zap
} from 'lucide-react';

interface JourneyStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
  estimatedTime?: string;
  actions?: string[];
}

interface CustomerJourneyWidgetProps {
  clientId: string;
  currentStage: string;
}

export default function CustomerJourneyWidget({ 
  clientId, 
  currentStage 
}: CustomerJourneyWidgetProps) {
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);

  useEffect(() => {
    // Load journey based on current stage
    const steps = generateJourneySteps(currentStage);
    setJourneySteps(steps);
  }, [currentStage]);

  const generateJourneySteps = (stage: string): JourneyStep[] => {
    const baseSteps = [
      {
        id: 'assessment',
        title: 'Assessment Complete',
        status: 'completed' as const,
        description: 'Agent Readiness evaluated',
        estimatedTime: 'Complete'
      },
      {
        id: 'pilot',
        title: 'Pilot Project',
        status: stage === 'pilot' ? 'current' as const : stage === 'live' ? 'completed' as const : 'upcoming' as const,
        description: 'Proof of concept implementation',
        estimatedTime: '2-4 weeks',
        actions: stage === 'pilot' ? ['View Progress', 'Test Demo'] : undefined
      },
      {
        id: 'implementation',
        title: 'Full Implementation',
        status: stage === 'implementation' ? 'current' as const : stage === 'live' ? 'completed' as const : 'upcoming' as const,
        description: 'Complete agent infrastructure',
        estimatedTime: '2-6 months',
        actions: stage === 'implementation' ? ['View Timeline', 'Contact PM'] : undefined
      },
      {
        id: 'live',
        title: 'Live & Monitoring',
        status: stage === 'live' ? 'current' as const : 'upcoming' as const,
        description: 'Agents operational with monitoring',
        estimatedTime: 'Ongoing',
        actions: stage === 'live' ? ['View Metrics', 'Generate Report'] : undefined
      }
    ];

    return baseSteps;
  };

  const getStepIcon = (step: JourneyStep) => {
    switch (step.id) {
      case 'assessment': return FileText;
      case 'pilot': return Target;
      case 'implementation': return Zap;
      case 'live': return Monitor;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'current': return 'text-orange-400';
      case 'upcoming': return 'text-white/60';
      default: return 'text-white/60';
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Your Journey Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {journeySteps.map((step, index) => {
            const Icon = getStepIcon(step);
            return (
              <div key={step.id} className="flex items-start space-x-4">
                {/* Step Icon */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    step.status === 'completed' 
                      ? 'bg-green-500/20 border-green-500'
                      : step.status === 'current'
                      ? 'border-orange-500'
                      : 'border-white/20'
                  }`}
                  style={{ 
                    backgroundColor: step.status === 'current' ? '#F87315' : undefined
                  }}
                >
                  <Icon className={`w-6 h-6 ${
                    step.status === 'completed' ? 'text-green-400' :
                    step.status === 'current' ? 'text-white' : 'text-white/60'
                  }`} />
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-bold ${getStatusColor(step.status)}`}>
                      {step.title}
                    </h4>
                    <Badge className={
                      step.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : step.status === 'current'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-white/10 text-white/60'
                    }>
                      {step.status === 'completed' ? 'Complete' : 
                       step.status === 'current' ? 'Active' : 'Upcoming'}
                    </Badge>
                  </div>
                  
                  <p className="text-white/80 text-sm mb-2">{step.description}</p>
                  
                  {step.estimatedTime && (
                    <div className="flex items-center text-xs text-white/60 mb-3">
                      <Clock className="w-3 h-3 mr-1" />
                      {step.estimatedTime}
                    </div>
                  )}

                  {/* Actions for current step */}
                  {step.actions && step.status === 'current' && (
                    <div className="flex gap-2">
                      {step.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Connector Line */}
                {index < journeySteps.length - 1 && (
                  <div className="absolute left-6 mt-12">
                    <div className="w-0.5 h-8 bg-white/20"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Actions */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h5 className="text-white font-semibold mb-4">What's Next?</h5>
          {currentStage === 'assessment' && (
            <div className="space-y-2">
              <Button
                className="w-full text-white"
                style={{ backgroundColor: '#F87315' }}
              >
                <Target className="w-4 h-4 mr-2" />
                Request Pilot Project
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Book Strategy Consult
              </Button>
            </div>
          )}

          {currentStage === 'pilot' && (
            <div className="space-y-2">
              <Button
                className="w-full text-white"
                style={{ backgroundColor: '#F87315' }}
              >
                <Monitor className="w-4 h-4 mr-2" />
                View Live Demo
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Schedule Implementation
              </Button>
            </div>
          )}

          {currentStage === 'live' && (
            <div className="space-y-2">
              <Button
                className="w-full text-white"
                style={{ backgroundColor: '#F87315' }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Add More Systems
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Download Monthly Report
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}