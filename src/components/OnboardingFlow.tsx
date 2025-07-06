'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Building,
  Target,
  Rocket,
  CheckCircle,
  MessageSquare,
  Calendar,
  FileText,
  Settings,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import confetti from 'canvas-confetti';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  component: React.ReactNode;
}

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSkipping, setIsSkipping] = useState(false);

  // Form data
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredContact, setPreferredContact] = useState('email');

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Welcome to GroeimetAI!',
      description: "Let's get you set up in just a few steps",
      icon: Sparkles,
      component: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-orange/20 rounded-full mx-auto flex items-center justify-center">
              <Rocket className="w-12 h-12 text-orange" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Ready to transform your business with AI?
            </h2>
            <p className="text-white/60">
              This quick setup will help us understand your needs better
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/5 rounded-lg p-4">
              <Target className="w-8 h-8 text-orange mx-auto mb-2" />
              <p className="text-sm text-white/80">Personalized Solutions</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <MessageSquare className="w-8 h-8 text-orange mx-auto mb-2" />
              <p className="text-sm text-white/80">24/7 Support</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-orange mx-auto mb-2" />
              <p className="text-sm text-white/80">Quick Setup</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: 'Tell us about your company',
      description: 'This helps us tailor our services to your needs',
      icon: Building,
      component: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="company-name" className="text-white">
              Company Name
            </Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter your company name"
              className="mt-2 bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="industry" className="text-white">
              Industry
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="company-size" className="text-white">
              Company Size
            </Label>
            <Select value={companySize} onValueChange={setCompanySize}>
              <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="500+">500+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'What are your AI goals?',
      description: 'Select all that apply to your business',
      icon: Target,
      component: (
        <div className="space-y-4">
          <p className="text-white/80 mb-4">What would you like to achieve with AI?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Automate repetitive tasks',
              'Improve customer service',
              'Enhance data analysis',
              'Optimize operations',
              'Create AI-powered products',
              'Improve decision making',
              'Reduce costs',
              'Scale business faster',
            ].map((goal) => (
              <motion.div key={goal} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    goals.includes(goal)
                      ? 'bg-orange/20 border-orange'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setGoals((prev) =>
                      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
                    );
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        goals.includes(goal) ? 'border-orange bg-orange' : 'border-white/40'
                      }`}
                    >
                      {goals.includes(goal) && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-white text-sm">{goal}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Services of interest',
      description: 'Which of our services interest you most?',
      icon: Rocket,
      component: (
        <div className="space-y-4">
          <p className="text-white/80 mb-4">Select services you&apos;d like to explore:</p>
          <div className="grid grid-cols-1 gap-3">
            {[
              { name: 'AI Consultation', desc: 'Strategic AI implementation guidance' },
              { name: 'Custom AI Development', desc: 'Tailored AI solutions for your needs' },
              { name: 'Process Automation', desc: 'Automate workflows with AI' },
              { name: 'Data Analytics', desc: 'AI-powered insights from your data' },
              { name: 'AI Training', desc: 'Train your team on AI technologies' },
            ].map((service) => (
              <motion.div
                key={service.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    interests.includes(service.name)
                      ? 'bg-orange/20 border-orange'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setInterests((prev) =>
                      prev.includes(service.name)
                        ? prev.filter((i) => i !== service.name)
                        : [...prev, service.name]
                    );
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        interests.includes(service.name)
                          ? 'border-orange bg-orange'
                          : 'border-white/40'
                      }`}
                    >
                      {interests.includes(service.name) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{service.name}</h4>
                      <p className="text-white/60 text-sm mt-1">{service.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'How should we contact you?',
      description: 'Set your communication preferences',
      icon: MessageSquare,
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-white mb-3 block">Preferred contact method</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'email', label: 'Email', icon: FileText },
                { value: 'phone', label: 'Phone', icon: MessageSquare },
                { value: 'both', label: 'Both', icon: Settings },
              ].map((method) => (
                <Card
                  key={method.value}
                  className={`p-4 cursor-pointer transition-all ${
                    preferredContact === method.value
                      ? 'bg-orange/20 border-orange'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setPreferredContact(method.value)}
                >
                  <div className="text-center">
                    <method.icon
                      className={`w-8 h-8 mx-auto mb-2 ${
                        preferredContact === method.value ? 'text-orange' : 'text-white/60'
                      }`}
                    />
                    <p className="text-white font-medium">{method.label}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">What happens next?</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>You&apos;ll receive a personalized welcome email</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Schedule a free consultation call</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Get AI recommendations based on your goals</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Save onboarding data to user profile
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          onboardingCompleted: true,
          onboardingData: {
            companyName,
            industry,
            companySize,
            goals,
            interests,
            preferredContact,
            completedAt: new Date(),
          },
          updatedAt: new Date(),
        });

        // Fire confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Complete onboarding
        setTimeout(() => {
          onComplete();
        }, 1000);
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          onboardingCompleted: true,
          onboardingSkipped: true,
          updatedAt: new Date(),
        });
        onComplete();
      } catch (error) {
        console.error('Error skipping onboarding:', error);
      }
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/95 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange/20 rounded-full flex items-center justify-center">
                {React.createElement(steps[currentStep].icon, { className: 'w-5 h-5 text-orange' })}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{steps[currentStep].title}</h3>
                <p className="text-sm text-white/60">{steps[currentStep].description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              disabled={isSkipping}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-1" />
        </div>

        {/* Content */}
        <div className="p-6 h-[400px] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].component}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious} className="bg-white/5">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-orange hover:bg-orange/90"
                disabled={
                  (currentStep === 1 && !companyName) ||
                  (currentStep === 2 && goals.length === 0) ||
                  (currentStep === 3 && interests.length === 0)
                }
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Complete Setup
                    <CheckCircle className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
