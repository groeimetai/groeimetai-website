'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Target, Zap, CheckCircle } from 'lucide-react';

interface QuickCheckData {
  coreBusiness: string;
  systems: string[];
  highestImpactSystem: string;
  hasApis: string;
  dataAccess: string;
  processDocumentation: string;    // ✅ FIXED: Added missing field
  automationExperience: string;    // ✅ FIXED: Added missing field
  mainBlocker: string;             // ✅ FIXED: Added missing field
}

export function AgentReadinessQuickCheck() {
  const t = useTranslations('agentReadinessQuiz');
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState('');
  const [formData, setFormData] = useState<QuickCheckData>({
    coreBusiness: '',
    systems: [],
    highestImpactSystem: '',
    hasApis: '',
    dataAccess: '',
    processDocumentation: '',
    automationExperience: '',
    mainBlocker: '',
  });

  const totalSteps = 5;

  const calculateQuickScore = (data: QuickCheckData): number => {
    let score = 0;

    // APIs (25 points)
    const apiScore = {
      'most': 25,
      'some': 15,
      'unknown': 8,
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

    // Process Documentation (25 points)
    const processScore = {
      'documented': 25,
      'partially': 18,
      'tribal': 8,
      'chaos': 0
    }[data.processDocumentation] || 0;
    score += processScore;

    // Automation Experience (15 points)
    const automationScore = {
      'advanced': 15,
      'basic': 10,
      'trying': 5,
      'none': 0
    }[data.automationExperience] || 0;
    score += automationScore;

    // Main Blocker (10 points) - LOWER score for HARDER blockers
    const blockerScore = {
      'Security/compliance zorgen': 2,
      'Team weerstand tegen verandering': 3,
      'Data is te rommelig/verspreid': 4,
      'Systemen praten niet met elkaar': 5,
      'Technische kennis ontbreekt': 6,
      'Geen idee waar te beginnen': 7,
      'Budget/resources beperkt': 8,
      'Anders': 5
    }[data.mainBlocker] || 0;
    score += blockerScore;

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
    console.log('🎯 QUIZ COMPLETE - handleComplete started');
    console.log('📋 QUIZ COMPLETE - Final formData before submission:', formData);

    try {
      // Submit to API
      const response = await fetch('/api/quick-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ QUIZ COMPLETE - API success:', data);
        setScore(data.score);
        setLevel(data.level);
        setIsCompleted(true);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Quick check submission error:', error);
      console.log('🔄 QUIZ COMPLETE - Falling back to client-side calculation');
      // Fallback to client-side calculation
      const finalScore = calculateQuickScore(formData);
      const finalLevel = getQuickLevel(finalScore);
      console.log('🎯 QUIZ COMPLETE - Client-side score:', finalScore);
      console.log('📊 QUIZ COMPLETE - Client-side level:', finalLevel);
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
        return formData.processDocumentation !== '';
      case 4:
        return formData.automationExperience !== '';
      case 5:
        return formData.mainBlocker !== '';
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
                processDocumentation: formData.processDocumentation,
                automationExperience: formData.automationExperience,
                mainBlocker: formData.mainBlocker,
                quickCheckScore: score,
                quickCheckLevel: level,
                source: 'hero_quiz',
                timestamp: new Date().toISOString()
              };
              
              // Store in both sessionStorage and localStorage for reliability
              sessionStorage.setItem('quizPreFill', JSON.stringify(preFillData));
              localStorage.setItem('quizPreFillBackup', JSON.stringify(preFillData));
              
              // Enhanced URL parameters with better encoding
              const params = new URLSearchParams({
                prefill: 'true',
                score: score.toString(),
                level: encodeURIComponent(level),
                from: 'quick_check',
                coreBusiness: encodeURIComponent(formData.coreBusiness),
                systems: formData.systems.join(','),
                highestImpactSystem: encodeURIComponent(formData.highestImpactSystem),
                hasApis: formData.hasApis,
                dataAccess: formData.dataAccess
              });
              
              console.log('🔄 Quiz-to-Assessment Transfer:', {
                sessionData: preFillData,
                urlParams: params.toString(),
                fieldsTransferred: Object.keys(preFillData).length
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
              console.log('🔄 QUIZ RESET - Retry button clicked');
              setIsCompleted(false);
              setCurrentStep(1);
              setFormData({
                coreBusiness: '',
                systems: [],
                highestImpactSystem: '',
                hasApis: '',
                dataAccess: '',
                processDocumentation: '',
                automationExperience: '',
                mainBlocker: '',
              });
              console.log('🔄 QUIZ RESET - FormData reset to initial state');
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
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight text-left">🔌 {t('questions.hasApis.title')}</h4>
                <RadioGroup value={formData.hasApis} onValueChange={(value) => setFormData(prev => ({ ...prev, hasApis: value }))}>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="most" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="most" id="most" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.hasApis.options.most')}</span>
                    </Label>
                    <Label htmlFor="some" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="some" id="some" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.hasApis.options.some')}</span>
                    </Label>
                    <Label htmlFor="unknown" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="unknown" id="unknown" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.hasApis.options.unknown')}</span>
                    </Label>
                    <Label htmlFor="none" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="none" id="none" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.hasApis.options.none')}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight text-left">📊 {t('questions.dataAccess.title')}</h4>
                <RadioGroup value={formData.dataAccess} onValueChange={(value) => setFormData(prev => ({ ...prev, dataAccess: value })))}>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="instant" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="instant" id="instant" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.dataAccess.options.instant')}</span>
                    </Label>
                    <Label htmlFor="minutes" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="minutes" id="minutes" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.dataAccess.options.minutes')}</span>
                    </Label>
                    <Label htmlFor="difficult" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="difficult" id="difficult" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.dataAccess.options.difficult')}</span>
                    </Label>
                    <Label htmlFor="impossible" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="impossible" id="impossible" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.dataAccess.options.impossible')}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight text-left">📋 {t('questions.processDocumentation.title')}</h4>
                <RadioGroup value={formData.processDocumentation} onValueChange={(value) => {
                  console.log('🔘 QUIZ DEBUG - processDocumentation radio clicked:', value);
                  setFormData(prev => {
                    const newData = { ...prev, processDocumentation: value };
                    console.log('📊 QUIZ DEBUG - processDocumentation updated formData:', newData);
                    return newData;
                  });
                }}>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="documented" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="documented" id="documented" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.processDocumentation.options.documented')}</span>
                    </Label>
                    <Label htmlFor="partially" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="partially" id="partially" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.processDocumentation.options.partially')}</span>
                    </Label>
                    <Label htmlFor="tribal" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="tribal" id="tribal" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.processDocumentation.options.tribal')}</span>
                    </Label>
                    <Label htmlFor="chaos" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="chaos" id="chaos" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.processDocumentation.options.chaos')}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight text-left">🤖 {t('questions.automationExperience.title')}</h4>
                <RadioGroup value={formData.automationExperience} onValueChange={(value) => {
                  console.log('🔘 QUIZ DEBUG - automationExperience radio clicked:', value);
                  setFormData(prev => {
                    const newData = { ...prev, automationExperience: value };
                    console.log('📊 QUIZ DEBUG - automationExperience updated formData:', newData);
                    return newData;
                  });
                }}>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="advanced" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="advanced" id="advanced" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.automationExperience.options.advanced')}</span>
                    </Label>
                    <Label htmlFor="basic" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="basic" id="basic" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.automationExperience.options.basic')}</span>
                    </Label>
                    <Label htmlFor="trying" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="trying" id="trying" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.automationExperience.options.trying')}</span>
                    </Label>
                    <Label htmlFor="none-auto" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="none" id="none-auto" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.automationExperience.options.none')}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight text-left">🚧 {t('questions.mainBlocker.title')}</h4>
                <RadioGroup value={formData.mainBlocker} onValueChange={(value) => {
                  console.log('🔘 QUIZ DEBUG - mainBlocker radio clicked:', value);
                  setFormData(prev => {
                    const newData = { ...prev, mainBlocker: value };
                    console.log('📊 QUIZ DEBUG - mainBlocker updated formData:', newData);
                    return newData;
                  });
                }}>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="security" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="Security/compliance zorgen" id="security" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.mainBlocker.options.security')}</span>
                    </Label>
                    <Label htmlFor="budget" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="Budget/resources beperkt" id="budget" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.mainBlocker.options.budget')}</span>
                    </Label>
                    <Label htmlFor="guidance" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="Geen idee waar te beginnen" id="guidance" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.mainBlocker.options.guidance')}</span>
                    </Label>
                    <Label htmlFor="knowledge" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="Technische kennis ontbreekt" id="knowledge" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.mainBlocker.options.knowledge')}</span>
                    </Label>
                    <Label htmlFor="integration" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="Systemen praten niet met elkaar" id="integration" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.mainBlocker.options.integration')}</span>
                    </Label>
                    <Label htmlFor="other" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="Anders" id="other" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{t('questions.mainBlocker.options.other')}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
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