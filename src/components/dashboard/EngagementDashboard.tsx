'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Award,
  Users,
  Target,
  CheckCircle,
  ArrowRight,
  Brain,
  Zap,
  MessageSquare,
  FileText,
  Video,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserJourney } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ProgressOverviewSkeleton, 
  JourneyTimelineSkeleton, 
  ConsultantMatchSkeleton 
} from '@/components/ui/LoadingSkeleton';

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: Date;
  status: 'completed' | 'current' | 'upcoming';
  icon: React.ReactNode;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'resource' | 'service' | 'consultation';
  relevanceScore: number;
  icon: React.ReactNode;
  action: string;
}

interface ConsultantMatch {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  matchScore: number;
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  completedProjects: number;
}

export const EngagementDashboard: React.FC = () => {
  const { user } = useAuth();
  const { journeyData, currentStage, loading, error, refresh } = useUserJourney();
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantMatch | null>(null);

  // Generate milestones based on real journey data
  const generateMilestones = (): Milestone[] => {
    if (!journeyData) return [];

    const baseMilestones = [
      {
        id: '1',
        title: 'Initial Assessment',
        description: 'Completed Agent Readiness Assessment',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        status: 'completed' as const,
        icon: <MessageSquare className="h-5 w-5" />,
      },
      {
        id: '2',
        title: 'Requirements Analysis',
        description: 'Analyzed technical requirements and system architecture',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: (currentStage === 'assessment' ? 'current' : 'completed') as const,
        icon: <FileText className="h-5 w-5" />,
      },
      {
        id: '3',
        title: 'Pilot Development',
        description: 'Building proof of concept implementation',
        date: new Date(),
        status: (currentStage === 'pilot' ? 'current' : 
                currentStage === 'assessment' ? 'upcoming' : 'completed') as const,
        icon: <Brain className="h-5 w-5" />,
      },
      {
        id: '4',
        title: 'Implementation',
        description: 'Full system implementation and integration',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: (currentStage === 'implementation' ? 'current' : 
                ['live', 'completed'].includes(currentStage) ? 'completed' : 'upcoming') as const,
        icon: <Zap className="h-5 w-5" />,
      },
      {
        id: '5',
        title: 'Production Launch',
        description: 'Live deployment with monitoring and support',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        status: (currentStage === 'live' ? 'current' : 'upcoming') as const,
        icon: <Target className="h-5 w-5" />,
      },
    ];

    return baseMilestones;
  };

  // Calculate user progress based on real data
  const calculateProgress = () => {
    if (!journeyData) {
      return {
        overallCompletion: 0,
        currentPhase: 'Assessment',
        daysActive: 0,
        consultationsCompleted: 0,
        nextMilestone: 'Complete Assessment',
      };
    }

    const stageProgress = {
      'assessment': 25,
      'pilot': 50,
      'implementation': 75,
      'live': 100,
    };

    const completedMilestones = journeyData.milestonesCompleted || 0;
    const totalActivities = journeyData.activities?.length || 0;

    return {
      overallCompletion: stageProgress[currentStage as keyof typeof stageProgress] || 0,
      currentPhase: currentStage.charAt(0).toUpperCase() + currentStage.slice(1),
      daysActive: Math.floor((Date.now() - (journeyData.activities?.[0]?.timestamp?.seconds * 1000 || Date.now())) / (1000 * 60 * 60 * 24)),
      consultationsCompleted: journeyData.projects?.filter((p: any) => p.type === 'consultation').length || 0,
      nextMilestone: journeyData.nextMilestone || 'Complete Assessment',
    };
  };

  // Generate personalized recommendations
  const getRecommendations = (): Recommendation[] => {
    const baseRecommendations = [
      {
        id: '1',
        title: 'Agent Readiness Guide',
        description: 'Complete guide to implementing AI agents in your organization',
        type: 'resource' as const,
        relevanceScore: 95,
        icon: <FileText className="h-5 w-5" />,
        action: 'Download Guide',
      },
      {
        id: '2',
        title: 'AI Strategy Workshop',
        description: 'Join our workshop on developing AI transformation strategy',
        type: 'consultation' as const,
        relevanceScore: 88,
        icon: <Video className="h-5 w-5" />,
        action: 'Register Now',
      },
      {
        id: '3',
        title: 'Expert Assessment',
        description: 'Get a detailed analysis of your systems and roadmap',
        type: 'service' as const,
        relevanceScore: 92,
        icon: <Brain className="h-5 w-5" />,
        action: 'Book Assessment',
      },
    ];

    // Customize based on current stage
    if (currentStage === 'pilot') {
      baseRecommendations[0] = {
        ...baseRecommendations[0],
        title: 'Pilot Implementation Guide',
        description: 'Best practices for successful AI pilot projects'
      };
    } else if (currentStage === 'live') {
      baseRecommendations[0] = {
        ...baseRecommendations[0],
        title: 'Scaling AI Systems',
        description: 'How to scale your AI implementation across the organization'
      };
    }

    return baseRecommendations;
  };

  // Mock consultant matches (in real app, this would come from an API)
  const getConsultantMatches = (): ConsultantMatch[] => {
    return [
      {
        id: '1',
        name: 'Dr. Sarah Chen',
        title: 'Senior AI Architect',
        specialties: ['AI Strategy', 'System Integration', 'Enterprise Architecture'],
        matchScore: 94,
        availability: 'available',
        rating: 4.9,
        completedProjects: 47,
      },
      {
        id: '2',
        name: 'Michael Rodriguez',
        title: 'Agent Specialist',
        specialties: ['Process Automation', 'AI Integration', 'Change Management'],
        matchScore: 87,
        availability: 'busy',
        rating: 4.8,
        completedProjects: 32,
      },
      {
        id: '3',
        name: 'Emma Thompson',
        title: 'Implementation Manager',
        specialties: ['Project Management', 'Technical Training', 'Go-Live Support'],
        matchScore: 78,
        availability: 'available',
        rating: 4.7,
        completedProjects: 28,
      },
    ];
  };

  const userProgress = calculateProgress();
  const milestones = generateMilestones();
  const recommendations = getRecommendations();
  const consultantMatches = getConsultantMatches();

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'current':
        return 'text-blue-600 bg-blue-100';
      case 'upcoming':
        return 'text-gray-400 bg-gray-100';
    }
  };

  const getAvailabilityColor = (availability: ConsultantMatch['availability']) => {
    switch (availability) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-400">Failed to Load Journey Data</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
          <Button 
            onClick={refresh} 
            variant="outline" 
            className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Progress Overview */}
      {loading ? (
        <ProgressOverviewSkeleton />
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Your AI Journey</h2>
                <p className="text-white/60 mt-1">Track your progress and milestones</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#F87315]">
                  {userProgress.overallCompletion}%
                </div>
                <p className="text-sm text-white/60">Complete</p>
              </div>
            </div>

            <div className="relative">
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F87315] to-orange-600 transition-all duration-500"
                  style={{ width: `${userProgress.overallCompletion}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userProgress.daysActive}</div>
                <p className="text-sm text-white/60">Days Active</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {userProgress.consultationsCompleted}
                </div>
                <p className="text-sm text-white/60">Consultations</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userProgress.currentPhase}</div>
                <p className="text-sm text-white/60">Current Phase</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userProgress.nextMilestone}</div>
                <p className="text-sm text-white/60">Next Milestone</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones Timeline */}
      {loading ? (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Project Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <JourneyTimelineSkeleton />
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Project Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  {index < milestones.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-white/20" />
                  )}
                  <div className="flex items-start space-x-4">
                    <div
                      className={cn(
                        'flex items-center justify-center h-12 w-12 rounded-full border-2',
                        milestone.status === 'completed' 
                          ? 'bg-green-500/20 border-green-500'
                          : milestone.status === 'current'
                          ? 'bg-[#F87315]/20 border-[#F87315]'
                          : 'bg-white/10 border-white/20'
                      )}
                    >
                      {milestone.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <div className={milestone.status === 'current' ? 'text-[#F87315]' : 'text-white/60'}>
                          {milestone.icon}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={cn(
                          "font-semibold",
                          milestone.status === 'completed' ? 'text-green-400' :
                          milestone.status === 'current' ? 'text-[#F87315]' : 'text-white/60'
                        )}>
                          {milestone.title}
                        </h4>
                        <span className="text-sm text-white/60">
                          {milestone.date.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white/60 mt-1">{milestone.description}</p>
                      {milestone.status === 'current' && (
                        <div className="mt-2">
                          <Badge className="bg-[#F87315]/20 text-[#F87315] border-[#F87315]/30">
                            In Progress
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recommended for You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      rec.type === 'resource' && 'bg-blue-500/20 text-blue-400',
                      rec.type === 'service' && 'bg-[#F87315]/20 text-[#F87315]',
                      rec.type === 'consultation' && 'bg-green-500/20 text-green-400'
                    )}
                  >
                    {rec.icon}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-white/70">
                      {rec.relevanceScore}% match
                    </span>
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-2">{rec.title}</h4>
                <p className="text-sm text-white/60 mb-4">{rec.description}</p>
                <Button className="w-full bg-[#F87315] hover:bg-[#F87315]/90 text-white text-sm font-medium">
                  {rec.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consultant Matching */}
      {loading ? (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Matched Consultants</CardTitle>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ConsultantMatchSkeleton />
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Matched Consultants</CardTitle>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consultantMatches.map((consultant) => (
                <div
                  key={consultant.id}
                  className="border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors cursor-pointer"
                  onClick={() => setSelectedConsultant(consultant)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#F87315] to-orange-600 flex items-center justify-center">
                          <span className="text-lg font-semibold text-white">
                            {consultant.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div
                          className={cn(
                            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white',
                            getAvailabilityColor(consultant.availability)
                          )}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{consultant.name}</h4>
                        <p className="text-sm text-white/60">{consultant.title}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {consultant.specialties.map((specialty) => (
                            <Badge
                              key={specialty}
                              className="bg-white/10 text-white/80 border-white/20"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-white">{consultant.rating}</span>
                      </div>
                      <p className="text-xs text-white/60">{consultant.completedProjects} projects</p>
                      <div className="mt-2">
                        <span className="text-sm font-semibold text-[#F87315]">
                          {consultant.matchScore}% match
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={cn(
                        'text-sm',
                        consultant.availability === 'available' && 'text-green-400',
                        consultant.availability === 'busy' && 'text-yellow-400',
                        consultant.availability === 'offline' && 'text-white/60'
                      )}
                    >
                      {consultant.availability === 'available' && '● Available now'}
                      {consultant.availability === 'busy' && '● In consultation'}
                      {consultant.availability === 'offline' && '● Offline'}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Celebration */}
      <Card className="bg-gradient-to-r from-[#F87315] to-orange-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Great Progress!</h3>
                <p className="text-white/90 mt-1">
                  You&apos;re {100 - userProgress.overallCompletion}% away from completing your AI
                  transformation journey
                </p>
              </div>
            </div>
            <Button className="px-6 py-3 bg-white text-[#F87315] hover:bg-white/90 font-medium">
              View Achievements
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagementDashboard;