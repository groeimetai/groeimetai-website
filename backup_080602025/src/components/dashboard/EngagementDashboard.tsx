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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantMatch | null>(null);

  // Mock data - will be replaced with real data
  const userProgress = {
    overallCompletion: 65,
    currentPhase: 'Implementation',
    daysActive: 14,
    consultationsCompleted: 3,
    nextMilestone: 'POC Deployment',
  };

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'Initial Consultation',
      description: 'Discussed AI transformation goals and roadmap',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: 'completed',
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: '2',
      title: 'Requirements Analysis',
      description: 'Completed technical requirements and architecture review',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'completed',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: '3',
      title: 'POC Development',
      description: 'Building proof of concept for RAG implementation',
      date: new Date(),
      status: 'current',
      icon: <Brain className="h-5 w-5" />,
    },
    {
      id: '4',
      title: 'POC Deployment',
      description: 'Deploy and test the POC in staging environment',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      icon: <Zap className="h-5 w-5" />,
    },
    {
      id: '5',
      title: 'Production Rollout',
      description: 'Full production deployment with monitoring',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      icon: <Target className="h-5 w-5" />,
    },
  ];

  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'RAG Implementation Guide',
      description: 'Comprehensive guide on implementing RAG with your tech stack',
      type: 'resource',
      relevanceScore: 95,
      icon: <FileText className="h-5 w-5" />,
      action: 'Download Guide',
    },
    {
      id: '2',
      title: 'Advanced LLM Workshop',
      description: 'Join our workshop on optimizing LLM performance',
      type: 'consultation',
      relevanceScore: 88,
      icon: <Video className="h-5 w-5" />,
      action: 'Register Now',
    },
    {
      id: '3',
      title: 'ServiceNow AI Integration',
      description: 'Explore AI-powered automation for your ServiceNow instance',
      type: 'service',
      relevanceScore: 82,
      icon: <Brain className="h-5 w-5" />,
      action: 'Learn More',
    },
  ];

  const consultantMatches: ConsultantMatch[] = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      title: 'Senior AI Architect',
      specialties: ['RAG Systems', 'LLM Optimization', 'Enterprise AI'],
      matchScore: 94,
      availability: 'available',
      rating: 4.9,
      completedProjects: 47,
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      title: 'ServiceNow AI Specialist',
      specialties: ['ServiceNow', 'Process Automation', 'AI Integration'],
      matchScore: 87,
      availability: 'busy',
      rating: 4.8,
      completedProjects: 32,
    },
    {
      id: '3',
      name: 'Emma Thompson',
      title: 'ML Engineer',
      specialties: ['Computer Vision', 'NLP', 'Model Deployment'],
      matchScore: 78,
      availability: 'available',
      rating: 4.7,
      completedProjects: 28,
    },
  ];

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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your AI Journey</h2>
            <p className="text-gray-600 mt-1">Track your progress and milestones</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {userProgress.overallCompletion}%
            </div>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
        </div>

        <div className="relative">
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${userProgress.overallCompletion}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{userProgress.daysActive}</div>
            <p className="text-sm text-gray-600">Days Active</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {userProgress.consultationsCompleted}
            </div>
            <p className="text-sm text-gray-600">Consultations</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{userProgress.currentPhase}</div>
            <p className="text-sm text-gray-600">Current Phase</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{userProgress.nextMilestone}</div>
            <p className="text-sm text-gray-600">Next Milestone</p>
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Project Milestones</h3>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {index < milestones.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
              )}
              <div className="flex items-start space-x-4">
                <div
                  className={cn(
                    'flex items-center justify-center h-12 w-12 rounded-full',
                    getStatusColor(milestone.status)
                  )}
                >
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    milestone.icon
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                    <span className="text-sm text-gray-500">
                      {milestone.date.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{milestone.description}</p>
                  {milestone.status === 'current' && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recommended for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    rec.type === 'resource' && 'bg-blue-100 text-blue-600',
                    rec.type === 'service' && 'bg-purple-100 text-purple-600',
                    rec.type === 'consultation' && 'bg-green-100 text-green-600'
                  )}
                >
                  {rec.icon}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {rec.relevanceScore}% match
                  </span>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                {rec.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Consultant Matching */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Matched Consultants</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {consultantMatches.map((consultant) => (
            <div
              key={consultant.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedConsultant(consultant)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
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
                    <h4 className="font-semibold text-gray-900">{consultant.name}</h4>
                    <p className="text-sm text-gray-600">{consultant.title}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {consultant.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{consultant.rating}</span>
                  </div>
                  <p className="text-xs text-gray-600">{consultant.completedProjects} projects</p>
                  <div className="mt-2">
                    <span className="text-sm font-semibold text-blue-600">
                      {consultant.matchScore}% match
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={cn(
                    'text-sm',
                    consultant.availability === 'available' && 'text-green-600',
                    consultant.availability === 'busy' && 'text-yellow-600',
                    consultant.availability === 'offline' && 'text-gray-500'
                  )}
                >
                  {consultant.availability === 'available' && '● Available now'}
                  {consultant.availability === 'busy' && '● In consultation'}
                  {consultant.availability === 'offline' && '● Offline'}
                </span>
                <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  <span>View Profile</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Celebration */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Great Progress!</h3>
              <p className="text-blue-100 mt-1">
                You&apos;re {100 - userProgress.overallCompletion}% away from completing your AI
                transformation journey
              </p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            View Achievements
          </button>
        </div>
      </div>
    </div>
  );
};

export default EngagementDashboard;
