'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, CheckCircle, Clock, AlertTriangle, TrendingUp,
  Target, Users, FileText, Monitor, Zap, Brain, Activity, AlertCircle
} from 'lucide-react';
import { useUserJourney } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { JourneyTimelineSkeleton } from '@/components/ui/LoadingSkeleton';
import { cn } from '@/lib/utils';

interface JourneyStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
  estimatedTime?: string;
  actions?: string[];
  completedDate?: Date;
  progress?: number;
}

interface CustomerJourneyWidgetProps {
  clientId?: string;
  currentStage?: string;
  className?: string;
}

export default function CustomerJourneyWidget({ 
  clientId, 
  currentStage: propCurrentStage,
  className
}: CustomerJourneyWidgetProps) {
  const { user } = useAuth();
  const { journeyData, currentStage, loading, error, refresh } = useUserJourney();
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);

  // Use prop currentStage or hook currentStage
  const effectiveCurrentStage = propCurrentStage || currentStage;

  useEffect(() => {
    if (journeyData || effectiveCurrentStage) {
      const steps = generateJourneySteps(effectiveCurrentStage, journeyData);
      setJourneySteps(steps);
    }
  }, [effectiveCurrentStage, journeyData]);

  const generateJourneySteps = (stage: string, data: any): JourneyStep[] => {
    const baseSteps = [
      {
        id: 'assessment',
        title: 'Assessment Complete',
        status: 'completed' as const,
        description: 'Agent Readiness evaluated and scored',
        estimatedTime: 'Complete',
        completedDate: data?.projects?.[0]?.startDate || new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        progress: 100
      },
      {
        id: 'analysis',
        title: 'Requirements Analysis',
        status: (stage === 'assessment' ? 'current' : 'completed') as const,
        description: 'Technical requirements and system architecture review',
        estimatedTime: stage === 'analysis' ? '1-2 weeks' : 'Complete',
        actions: stage === 'analysis' ? ['View Analysis', 'Book Deep Dive'] : undefined,
        completedDate: stage !== 'assessment' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : undefined,
        progress: stage === 'analysis' ? 65 : stage === 'assessment' ? 0 : 100
      },
      {
        id: 'pilot',
        title: 'Pilot Project',
        status: stage === 'pilot' ? 'current' as const : 
                ['implementation', 'live'].includes(stage) ? 'completed' as const : 'upcoming' as const,
        description: 'Proof of concept implementation and testing',
        estimatedTime: stage === 'pilot' ? '2-4 weeks' : '2-4 weeks',
        actions: stage === 'pilot' ? ['View Progress', 'Test Demo', 'Schedule Review'] : undefined,
        completedDate: ['implementation', 'live'].includes(stage) ? new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) : undefined,
        progress: stage === 'pilot' ? 45 : ['implementation', 'live'].includes(stage) ? 100 : 0
      },
      {
        id: 'implementation',
        title: 'Full Implementation',
        status: stage === 'implementation' ? 'current' as const : 
                stage === 'live' ? 'completed' as const : 'upcoming' as const,
        description: 'Complete agent infrastructure deployment',
        estimatedTime: stage === 'implementation' ? '2-6 months' : '2-6 months',
        actions: stage === 'implementation' ? ['View Timeline', 'Contact PM', 'Weekly Updates'] : undefined,
        completedDate: stage === 'live' ? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) : undefined,
        progress: stage === 'implementation' ? 75 : stage === 'live' ? 100 : 0
      },
      {
        id: 'live',
        title: 'Live & Monitoring',
        status: stage === 'live' ? 'current' as const : 'upcoming' as const,
        description: 'Agents operational with 24/7 monitoring and support',
        estimatedTime: 'Ongoing',
        actions: stage === 'live' ? ['View Metrics', 'Generate Report', 'Request Enhancement'] : undefined,
        progress: stage === 'live' ? 100 : 0
      }
    ];

    // Add real project data if available
    if (data?.projects && data.projects.length > 0) {
      const project = data.projects[0];
      
      // Update steps with real project information
      baseSteps.forEach(step => {
        if (step.id === 'assessment' && project.type === 'assessment') {
          step.completedDate = project.startDate;
        }
        if (step.id === 'pilot' && project.status === 'pilot') {
          step.progress = Math.min(100, Math.max(0, project.progress || 45));
        }
        if (step.id === 'implementation' && project.status === 'implementation') {
          step.progress = Math.min(100, Math.max(0, project.progress || 75));
        }
      });
    }

    return baseSteps;
  };

  const getStepIcon = (step: JourneyStep) => {
    switch (step.id) {
      case 'assessment': return FileText;
      case 'analysis': return Brain;
      case 'pilot': return Target;
      case 'implementation': return Zap;
      case 'live': return Monitor;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'current': return 'text-[#F87315]';
      case 'upcoming': return 'text-white/60';
      default: return 'text-white/60';
    }
  };

  const getStatusIcon = (step: JourneyStep) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
    if (step.status === 'current') {
      return <Activity className="h-4 w-4 text-[#F87315]" />;
    }
    return <Clock className="h-4 w-4 text-white/60" />;
  };

  const getCurrentStepActions = () => {
    const currentStep = journeySteps.find(step => step.status === 'current');
    if (!currentStep || !currentStep.actions) return null;

    return (
      <div className="mt-6 pt-6 border-t border-white/10">
        <h5 className="text-white font-semibold mb-4">Current Actions</h5>
        <div className="flex gap-2 flex-wrap">
          {currentStep.actions.map((action, idx) => (
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
      </div>
    );
  };

  const getNextActions = () => {
    if (effectiveCurrentStage === 'assessment') {
      return (
        <div className="space-y-2">
          <Button
            className="w-full text-white font-medium"
            style={{ backgroundColor: '#F87315' }}
            onClick={() => window.location.href = '/contact'}
          >
            <Target className="w-4 h-4 mr-2" />
            Request Pilot Project
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
            onClick={() => window.location.href = '/expert-assessment'}
          >
            Book Expert Assessment
          </Button>
        </div>
      );
    }

    if (effectiveCurrentStage === 'pilot') {
      return (
        <div className="space-y-2">
          <Button
            className="w-full text-white font-medium"
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
      );
    }

    if (effectiveCurrentStage === 'live') {
      return (
        <div className="space-y-2">
          <Button
            className="w-full text-white font-medium"
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
      );
    }

    // Default actions
    return (
      <div className="space-y-2">
        <Button
          className="w-full text-white font-medium"
          style={{ backgroundColor: '#F87315' }}
          onClick={() => window.location.href = '/contact'}
        >
          <Brain className="w-4 h-4 mr-2" />
          Schedule Consultation
        </Button>
        <Button
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
          onClick={refresh}
        >
          Refresh Progress
        </Button>
      </div>
    );
  };

  if (error) {
    return (
      <Card className={cn("bg-white/5 border-white/10", className)}>
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Journey Tracking Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <Button 
              onClick={refresh}
              variant="outline" 
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white/5 border-white/10", className)}>
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Your Journey Progress
        </CardTitle>
        {journeyData && (
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">
              Stage: {effectiveCurrentStage?.charAt(0).toUpperCase()}{effectiveCurrentStage?.slice(1)}
            </p>
            <Badge className="bg-[#F87315]/20 text-[#F87315] border-[#F87315]/30">
              {journeySteps.filter(s => s.status === 'completed').length}/{journeySteps.length} Complete
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {loading ? (
            <JourneyTimelineSkeleton />
          ) : (
            <>
              {journeySteps.map((step, index) => {
                const Icon = getStepIcon(step);
                return (
                  <div key={step.id} className="relative">
                    {/* Step Icon */}
                    <div className="flex items-start space-x-4">
                      <div 
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center border-2 relative",
                          step.status === 'completed' 
                            ? 'bg-green-500/20 border-green-500'
                            : step.status === 'current'
                            ? 'border-[#F87315]'
                            : 'border-white/20',
                          step.status === 'current' && 'bg-[#F87315]/20'
                        )}
                      >
                        <Icon className={cn(
                          "w-6 h-6",
                          step.status === 'completed' ? 'text-green-400' :
                          step.status === 'current' ? 'text-[#F87315]' : 'text-white/60'
                        )} />
                        
                        {/* Progress indicator for current step */}
                        {step.status === 'current' && step.progress && step.progress > 0 && (
                          <div className="absolute -bottom-1 -right-1">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {step.progress}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={cn("font-bold", getStatusColor(step.status))}>
                            {step.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(step)}
                            <Badge className={cn(
                              step.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : step.status === 'current'
                                ? 'bg-[#F87315]/20 text-[#F87315] border-[#F87315]/30'
                                : 'bg-white/10 text-white/60 border-white/20'
                            )}>
                              {step.status === 'completed' ? 'Complete' : 
                               step.status === 'current' ? 'Active' : 'Upcoming'}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-white/80 text-sm mb-2">{step.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {step.estimatedTime}
                          </div>
                          {step.completedDate && (
                            <span>Completed: {step.completedDate.toLocaleDateString()}</span>
                          )}
                        </div>

                        {/* Progress bar for current step */}
                        {step.status === 'current' && step.progress && step.progress > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white/60">Progress</span>
                              <span className="text-xs text-[#F87315] font-medium">{step.progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-[#F87315] to-orange-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${step.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Actions for current step */}
                        {step.actions && step.status === 'current' && (
                          <div className="flex gap-2 flex-wrap">
                            {step.actions.slice(0, 2).map((action, idx) => (
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
                    </div>

                    {/* Connector Line */}
                    {index < journeySteps.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-white/20"></div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Next Actions */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h5 className="text-white font-semibold mb-4">What's Next?</h5>
          {getNextActions()}
        </div>

        {/* Current step actions */}
        {getCurrentStepActions()}
      </CardContent>
    </Card>
  );
}