'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowRight, Target, Zap, CheckCircle } from 'lucide-react';

interface QuickCheckData {
  hasApis: string;
  dataAccess: string;
  budgetReality: string;
  mainBlocker: string;
  highestImpact: string;
}

export function AgentReadinessQuickCheck() {
  const t = useTranslations('agentReadinessQuiz');
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState('');
  const [formData, setFormData] = useState<QuickCheckData>({
    hasApis: '',
    dataAccess: '',
    budgetReality: '',
    mainBlocker: '',
    highestImpact: '',
  });

  const totalSteps = 5;

  const calculateQuickScore = (data: QuickCheckData): number => {
    let score = 0;

    // APIs (40 points)
    const apiScore = {
      'most': 40,
      'some': 25,
      'unknown': 10,
      'none': 0
    }[data.hasApis] || 0;
    score += apiScore;

    // Data Access (25 points)
    const dataScore = {
      'instant': 25,
      'minutes': 18,
      'difficult': 8,
      'impossible': 0
    }[data.dataAccess] || 0;
    score += dataScore;

    // Budget Reality (20 points)
    const budgetScore = {
      'EUR100k+ - Enterprise rollout': 20,
      'EUR25-100k - Meerdere systemen': 15,
      'EUR10-25k - Één systeem serieus': 10,
      '< EUR10k - Pilot/experiment': 5,
      'Eerst business case nodig': 2
    }[data.budgetReality] || 0;
    score += budgetScore;

    // Main Blocker (10 points)
    const blockerScore = {
      'Security/compliance zorgen': 10,
      'Budget/resources beperkt': 8,
      'Geen idee waar te beginnen': 6,
      'Technische kennis ontbreekt': 4,
      'Systemen praten niet met elkaar': 2,
      'Team weerstand tegen verandering': 3,
      'Data is te rommelig/verspreid': 1,
      'Anders': 5
    }[data.mainBlocker] || 0;
    score += blockerScore;

    // Highest Impact (5 points)
    const impactScore = {
      'Klantenservice/Helpdesk': 5,
      'CRM/Sales': 4,
      'Kennisbank/Documentatie': 4,
      'ERP/Finance': 3,
      'Planning/Logistics': 3,
      'HR/Personeelszaken': 3,
      'Eigen software/Maatwerk': 2,
      'Anders': 2
    }[data.highestImpact] || 0;
    score += impactScore;

    return Math.min(score, 100);
  };

  const getQuickLevel = (score: number): string => {
    if (score >= 90) return 'Agent-Ready (Level 5)';
    if (score >= 70) return 'Integration-Ready (Level 4)';
    if (score >= 50) return 'Digitalization-Ready (Level 3)';
    if (score >= 30) return 'Foundation-Building (Level 2)';
    return 'Pre-Digital (Level 1)';
  };

  const handleComplete = async () => {
    try {
      // Submit to API
      const response = await fetch('/api/quick-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setScore(data.score);
        setLevel(data.level);
        setIsCompleted(true);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Quick check submission error:', error);
      // Fallback to client-side calculation
      const finalScore = calculateQuickScore(formData);
      const finalLevel = getQuickLevel(finalScore);
      setScore(finalScore);
      setLevel(finalLevel);
      setIsCompleted(true);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.hasApis !== '';
      case 2:
        return formData.dataAccess !== '';
      case 3:
        return formData.budgetReality !== '';
      case 4:
        return formData.mainBlocker !== '';
      case 5:
        return formData.highestImpact !== '';
      default:
        return false;
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 text-center">
        <div className="mb-6">
          <div
            className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4"
            style={{
              background: `conic-gradient(#F87315 ${score}%, rgba(255,255,255,0.1) ${score}%)`,
            }}
          >
            {score}
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
            {level}
          </h3>
          <p className="text-white/70 text-sm sm:text-base">
            {t('results.yourScore')}: {score}/100
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            🎯 <strong>{t('results.nextStep')}</strong> {t('results.nextStepDescription')}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button
            onClick={() => {
              const preFillData = {
                hasApis: formData.hasApis,
                dataAccess: formData.dataAccess,
                budgetReality: formData.budgetReality,
                mainBlocker: formData.mainBlocker,
                highestImpact: formData.highestImpact,
                quickCheckScore: score,
                quickCheckLevel: level,
                source: 'hero_quiz'
              };
              
              sessionStorage.setItem('quizPreFill', JSON.stringify(preFillData));
              
              const params = new URLSearchParams({
                prefill: 'true',
                score: score.toString(),
                ...preFillData
              });
              
              window.location.href = `/agent-readiness?${params.toString()}`;
            }}
            className="text-white font-semibold flex-1"
            style={{ backgroundColor: '#F87315' }}
          >
            <Target className="mr-2 w-4 h-4" />
            {t('results.getFullRoadmap')}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => {
              setIsCompleted(false);
              setCurrentStep(1);
              setFormData({
                hasApis: '',
                dataAccess: '',
                budgetReality: '',
                mainBlocker: '',
                highestImpact: '',
              });
            }}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 flex-shrink-0"
          >
            {t('results.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white/5 border border-white/20 overflow-hidden max-w-full">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-3 sm:p-4 md:p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 leading-tight">🎯 {t('title')}</h3>
              <p className="text-sm sm:text-base text-white/70">{t('subtitle')}</p>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-sm">
                {t('step')} {currentStep} {t('of')} {totalSteps}
              </div>
              <div className="w-20 sm:w-16 h-2 bg-white/20 rounded-full mt-1">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: '#F87315',
                    width: `${(currentStep / totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {/* Question Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight">{t('questions.hasApis.title')}</h4>
                <RadioGroup value={formData.hasApis} onValueChange={(value) => setFormData(prev => ({ ...prev, hasApis: value }))}>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors">
                      <RadioGroupItem value="most" id="most" className="mt-0.5" />
                      <Label htmlFor="most" className="text-sm sm:text-base text-white/80 leading-relaxed cursor-pointer flex-1">{t('questions.hasApis.options.most')}</Label>
                    </div>
                    <div className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors">
                      <RadioGroupItem value="some" id="some" className="mt-0.5" />
                      <Label htmlFor="some" className="text-sm sm:text-base text-white/80 leading-relaxed cursor-pointer flex-1">{t('questions.hasApis.options.some')}</Label>
                    </div>
                    <div className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors">
                      <RadioGroupItem value="unknown" id="unknown" className="mt-0.5" />
                      <Label htmlFor="unknown" className="text-sm sm:text-base text-white/80 leading-relaxed cursor-pointer flex-1">{t('questions.hasApis.options.unknown')}</Label>
                    </div>
                    <div className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors">
                      <RadioGroupItem value="none" id="none" className="mt-0.5" />
                      <Label htmlFor="none" className="text-sm sm:text-base text-white/80 leading-relaxed cursor-pointer flex-1">{t('questions.hasApis.options.none')}</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Add other steps here... simplified for now */}
            
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="border-white/20 text-white hover:bg-white/10 min-h-[44px] w-full sm:w-auto order-2 sm:order-1"
            >
              {t('navigation.previous')}
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="text-white min-h-[44px] w-full sm:w-auto order-1 sm:order-2"
                style={{ backgroundColor: '#F87315' }}
              >
                {t('navigation.next')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="text-white font-semibold min-h-[44px] w-full sm:w-auto order-1 sm:order-2"
                style={{ backgroundColor: '#F87315' }}
              >
                <Zap className="mr-2 w-4 h-4" />
                {t('navigation.showScore')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}