'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Zap, 
  Target, 
  Trophy,
  Sparkles,
  Brain,
  Rocket,
  Shield,
  Users,
  BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  points: number;
}

interface UserProgress {
  completedSteps: string[];
  totalPoints: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: Date;
}

export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedSteps: [],
    totalPoints: 0,
    achievements: [],
  });
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  const achievements: Achievement[] = [
    {
      id: 'first_step',
      title: 'First Steps',
      description: 'Complete your first onboarding step',
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      id: 'halfway_there',
      title: 'Halfway There',
      description: 'Complete 50% of onboarding',
      icon: <Target className="h-6 w-6" />,
    },
    {
      id: 'onboarding_complete',
      title: 'Onboarding Champion',
      description: 'Complete all onboarding steps',
      icon: <Trophy className="h-6 w-6" />,
    },
  ];

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to GroeimetAI',
      description: 'Your journey to AI transformation starts here',
      icon: <Rocket className="h-8 w-8" />,
      points: 10,
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-foreground">
            Transform Your Business with AI
          </h3>
          <p className="text-foreground/80">
            GroeimetAI specializes in cutting-edge AI solutions that drive real business value.
            Let&apos;s explore how we can help you achieve your goals.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-primary/10 p-4 rounded-lg">
              <Brain className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-semibold">GenAI Solutions</h4>
              <p className="text-sm text-foreground/75">LLM, RAG, and AI Automation</p>
            </div>
            <div className="bg-secondary/10 p-4 rounded-lg">
              <Shield className="h-6 w-6 text-secondary mb-2" />
              <h4 className="font-semibold">Enterprise Ready</h4>
              <p className="text-sm text-foreground/75">Secure and scalable solutions</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'goals',
      title: 'Your AI Goals',
      description: 'Tell us what you want to achieve',
      icon: <Target className="h-8 w-8" />,
      points: 20,
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">
            What brings you to GroeimetAI?
          </h3>
          <p className="text-gray-600">
            Select all that apply to help us understand your needs better.
          </p>
          <div className="space-y-3 mt-6">
            {[
              'Automate customer service with AI',
              'Implement RAG for knowledge management',
              'Build custom AI applications',
              'ServiceNow AI integration',
              'Process automation and optimization',
              'AI strategy consulting',
            ].map((goal) => (
              <label key={goal} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'company',
      title: 'About Your Company',
      description: 'Help us understand your business',
      icon: <Users className="h-8 w-8" />,
      points: 20,
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Tell us about your organization
          </h3>
          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select your industry</option>
                <option>Technology</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Retail</option>
                <option>Manufacturing</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Size
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select company size</option>
                <option>1-50 employees</option>
                <option>51-200 employees</option>
                <option>201-1000 employees</option>
                <option>1000+ employees</option>
              </select>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'timeline',
      title: 'Project Timeline',
      description: 'When do you plan to start?',
      icon: <BarChart className="h-8 w-8" />,
      points: 20,
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">
            When are you looking to implement AI solutions?
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[
              { label: 'Immediately', description: 'Ready to start now' },
              { label: 'Within 1 month', description: 'Finalizing plans' },
              { label: 'Within 3 months', description: 'In planning phase' },
              { label: 'Just exploring', description: 'Learning about options' },
            ].map((option) => (
              <label
                key={option.label}
                className="p-4 border-2 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
              >
                <input type="radio" name="timeline" className="sr-only" />
                <div>
                  <h4 className="font-semibold text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      title: 'Stay Connected',
      description: 'Get personalized AI insights',
      icon: <Zap className="h-8 w-8" />,
      points: 30,
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Get your personalized AI roadmap
          </h3>
          <p className="text-gray-600">
            We&apos;ll create a custom AI implementation plan based on your needs.
          </p>
          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg mt-6">
            <p className="text-sm text-blue-800">
              🎉 Complete this step to unlock your personalized AI consultation!
            </p>
          </div>
        </div>
      ),
    },
  ];

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !userProgress.achievements.find(a => a.id === achievementId)) {
      const unlockedAchievement = { ...achievement, unlockedAt: new Date() };
      setUserProgress(prev => ({
        ...prev,
        achievements: [...prev.achievements, unlockedAchievement],
      }));
      setShowAchievement(unlockedAchievement);
      triggerConfetti();
      
      // Hide achievement notification after 5 seconds
      setTimeout(() => setShowAchievement(null), 5000);
    }
  };

  const handleStepComplete = () => {
    const step = steps[currentStep];
    if (!userProgress.completedSteps.includes(step.id)) {
      const newProgress = {
        completedSteps: [...userProgress.completedSteps, step.id],
        totalPoints: userProgress.totalPoints + step.points,
        achievements: userProgress.achievements,
      };
      setUserProgress(newProgress);
      
      // Check for achievements
      if (newProgress.completedSteps.length === 1) {
        unlockAchievement('first_step');
      }
      if (newProgress.completedSteps.length === Math.floor(steps.length / 2)) {
        unlockAchievement('halfway_there');
      }
      if (newProgress.completedSteps.length === steps.length) {
        unlockAchievement('onboarding_complete');
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = (userProgress.completedSteps.length / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-600">Your Progress</h2>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">
              {userProgress.totalPoints} points
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-1">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  userProgress.completedSteps.includes(step.id)
                    ? 'bg-white'
                    : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-center mb-8 space-x-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center',
              index < steps.length - 1 && 'flex-1'
            )}
          >
            <button
              onClick={() => userProgress.completedSteps.includes(step.id) && setCurrentStep(index)}
              disabled={!userProgress.completedSteps.includes(step.id) && index !== currentStep}
              className={cn(
                'relative flex items-center justify-center h-12 w-12 rounded-full transition-all',
                currentStep === index
                  ? 'bg-blue-600 text-white scale-110'
                  : userProgress.completedSteps.includes(step.id)
                  ? 'bg-green-500 text-white cursor-pointer hover:scale-105'
                  : 'bg-gray-300 text-gray-500'
              )}
            >
              {userProgress.completedSteps.includes(step.id) ? (
                <Check className="h-6 w-6" />
              ) : (
                <span className="font-semibold">{index + 1}</span>
              )}
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  userProgress.completedSteps.includes(steps[index + 1].id)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center mb-6 text-blue-600">
          {steps[currentStep].icon}
        </div>
        
        <div className="mb-8">
          {steps[currentStep].content}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all',
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleStepComplete}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <span>{currentStep === steps.length - 1 ? 'Complete' : 'Continue'}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Achievement Notification */}
      {showAchievement && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm animate-slide-in-right z-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-yellow-500">
              {showAchievement.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Achievement Unlocked!</h4>
              <p className="text-sm text-gray-600">{showAchievement.title}</p>
              <p className="text-xs text-gray-500 mt-1">{showAchievement.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Display */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Achievements</h3>
        <div className="grid grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const isUnlocked = userProgress.achievements.find(a => a.id === achievement.id);
            return (
              <div
                key={achievement.id}
                className={cn(
                  'p-4 rounded-lg border-2 text-center transition-all',
                  isUnlocked
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                )}
              >
                <div className={cn(
                  'text-2xl mb-2',
                  isUnlocked ? 'text-yellow-500' : 'text-gray-400'
                )}>
                  {achievement.icon}
                </div>
                <h4 className="font-medium text-sm">{achievement.title}</h4>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;