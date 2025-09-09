'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
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

    // APIs (40 points) - MOST CRITICAL - Foundation for everything
    const apiScore =
      {
        most: 40, // Strong API foundation
        some: 25, // Partial API coverage
        unknown: 10, // Need discovery
        none: 0, // No API foundation
      }[data.hasApis] || 0;
    score += apiScore;

    // Data Access (25 points) - Can agents get data?
    const dataScore =
      {
        instant: 25, // Central data access
        minutes: 18, // Some friction
        difficult: 8, // Data silos
        impossible: 0, // Not digital
      }[data.dataAccess] || 0;
    score += dataScore;

    // Budget Reality (20 points) - Investment capacity
    const budgetScore =
      {
        'EUR100k+ - Enterprise rollout': 20,
        'EUR25-100k - Meerdere systemen': 15,
        'EUR10-25k - Één systeem serieus': 10,
        '< EUR10k - Pilot/experiment': 5,
        'Eerst business case nodig': 2,
      }[data.budgetReality] || 0;
    score += budgetScore;

    // Main Blocker Assessment (10 points) - Reverse scoring (less severe = higher score)
    const blockerScore =
      {
        'Security/compliance zorgen': 10, // Addressable governance
        'Budget/resources beperkt': 8, // Solvable constraint
        'Geen idee waar te beginnen': 6, // Need guidance
        'Technische kennis ontbreekt': 4, // Knowledge gap
        'Systemen praten niet met elkaar': 2, // Complex integration
        'Team weerstand tegen verandering': 3, // Change management challenge
        'Data is te rommelig/verspreid': 1, // Data quality issues
        Anders: 5, // Unknown, middle score
      }[data.mainBlocker] || 0;
    score += blockerScore;

    // Highest Impact System (5 points) - System readiness assessment
    const impactScore =
      {
        'Klantenservice/Helpdesk': 5, // High agent ROI
        'CRM/Sales': 4, // Good automation potential
        'Kennisbank/Documentatie': 4, // Knowledge management
        'ERP/Finance': 3, // Complex but valuable
        'Planning/Logistics': 3, // Operational efficiency
        'HR/Personeelszaken': 3, // Process automation potential
        'Eigen software/Maatwerk': 2, // Depends on implementation
        Anders: 2, // Unknown system
      }[data.highestImpact] || 0;
    score += impactScore;

    return Math.min(score, 100);
  };

  const getQuickLevel = (score: number): string => {
    if (score >= 90) return t('results.levels.level5');
    if (score >= 70) return t('results.levels.level4');
    if (score >= 50) return t('results.levels.level3');
    if (score >= 30) return t('results.levels.level2');
    return t('results.levels.level1');
  };

  const getLevelDescription = (score: number): string => {
    if (score >= 90) return t('results.descriptions.level5');
    if (score >= 70) return t('results.descriptions.level4');
    if (score >= 50) return t('results.descriptions.level3');
    if (score >= 30) return t('results.descriptions.level2');
    return t('results.descriptions.level1');
  };

  const handleComplete = async () => {
    try {
      // Submit to API for server-side scoring and tracking
      const response = await fetch('/api/quick-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          source: 'homepage_quick_check',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setScore(data.score);
        setLevel(data.level);
        setIsCompleted(true);

        // Track conversion for analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'quick_check_completed', {
            score: data.score,
            level: data.level,
            value: data.score,
            time_to_ready: data.timeToReady,
          });
        }
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 text-center"
      >
        <div className="mb-6">
          <div
            className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4"
            style={{
              background: `conic-gradient(#F87315 ${score}%, rgba(255,255,255,0.1) ${score}%)`,
            }}
          >
            {score}%
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{level}</h3>
          <p className="text-white/80 mb-6">{getLevelDescription(score)}</p>
        </div>

        <div className="space-y-4">
          {/* FOMO Trigger */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-5 mb-4">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🤔</div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg mb-3">
                  {t('results.fomoTitle', { level: level.split(':')[0] })}
                </p>
                <div className="grid grid-cols-1 gap-2 text-sm text-white/90">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-400">❓</span>
                    <span>
                      {t('results.questions.0', {
                        count:
                          score >= 70 ? '2-3 systems' : score >= 50 ? '5+ systems' : '10+ systems',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-400">❓</span>
                    <span>{t('results.questions.1')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-400">❓</span>
                    <span>{t('results.questions.2')}</span>
                  </div>
                  {score < 70 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-red-400">⚠️</span>
                      <span className="text-red-400">{t('results.questions.3')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              // Store quiz data for assessment pre-filling
              const quizData = {
                hasApis: formData.hasApis,
                dataAccess: formData.dataAccess,
                budgetReality: formData.budgetReality,
                mainBlocker: formData.mainBlocker,
                highestImpact: formData.highestImpact,
                quickCheckScore: score,
                quickCheckLevel: level,
                source: 'hero_quiz',
              };

              // Store in sessionStorage for assessment page
              sessionStorage.setItem('quizPreFill', JSON.stringify(quizData));

              // Redirect with URL params as backup
              const params = new URLSearchParams();
              params.set('prefill', 'true');
              params.set('score', score.toString());
              Object.entries(quizData).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  params.set(key, value.toString());
                }
              });
              window.location.href = `/agent-readiness?${params.toString()}`;
            }}
            className="w-full text-white font-semibold text-lg py-4"
            style={{ backgroundColor: '#F87315' }}
          >
            <Target className="mr-2 w-6 h-6" />
            {score >= 70 ? t('results.cta.high') : t('results.cta.low')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: '#F87315' }}
              >
                ✓
              </div>
              <p className="text-white font-semibold text-sm">{t('results.benefits.0')}</p>
            </div>
            <p className="text-white/70 text-sm ml-9">{t('results.benefits.1')}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <Card className="bg-white/5 border border-white/20 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">🎯 {t('title')}</h3>
              <p className="text-white/70">{t('subtitle')}</p>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-sm">
                {t('step')} {currentStep} {t('of')} {totalSteps}
              </div>
              <div className="w-16 h-2 bg-white/20 rounded-full mt-1">
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

        {/* Questions */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Question 1: APIs */}
            {currentStep === 1 && (
              <motion.div
                key="q1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-xl font-bold text-white mb-4">{t('questions.apis.title')}</h4>
                <RadioGroup
                  value={formData.hasApis}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, hasApis: value }))}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="most" id="q1-most" />
                      <Label htmlFor="q1-most" className="text-white/80">
                        {t('questions.apis.options.most')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="some" id="q1-some" />
                      <Label htmlFor="q1-some" className="text-white/80">
                        {t('questions.apis.options.some')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="unknown" id="q1-unknown" />
                      <Label htmlFor="q1-unknown" className="text-white/80">
                        {t('questions.apis.options.unknown')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="none" id="q1-none" />
                      <Label htmlFor="q1-none" className="text-white/80">
                        {t('questions.apis.options.none')}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {/* Question 2: Data Access */}
            {currentStep === 2 && (
              <motion.div
                key="q2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-xl font-bold text-white mb-4">
                  {t('questions.dataAccess.title')}
                </h4>
                <RadioGroup
                  value={formData.dataAccess}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, dataAccess: value }))}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="instant" id="q2-instant" />
                      <Label htmlFor="q2-instant" className="text-white/80">
                        {t('questions.dataAccess.options.instant')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="minutes" id="q2-minutes" />
                      <Label htmlFor="q2-minutes" className="text-white/80">
                        {t('questions.dataAccess.options.minutes')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="difficult" id="q2-difficult" />
                      <Label htmlFor="q2-difficult" className="text-white/80">
                        {t('questions.dataAccess.options.difficult')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="impossible" id="q2-impossible" />
                      <Label htmlFor="q2-impossible" className="text-white/80">
                        {t('questions.dataAccess.options.impossible')}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {/* Question 3: Budget Reality */}
            {currentStep === 3 && (
              <motion.div
                key="q3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-xl font-bold text-white mb-4">{t('questions.budget.title')}</h4>
                <RadioGroup
                  value={formData.budgetReality}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, budgetReality: value }))
                  }
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="EUR100k+ - Enterprise rollout" id="q3-enterprise" />
                      <Label htmlFor="q3-enterprise" className="text-white/80">
                        {t('questions.budget.options.enterprise')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="EUR25-100k - Meerdere systemen" id="q3-multiple" />
                      <Label htmlFor="q3-multiple" className="text-white/80">
                        {t('questions.budget.options.multiple')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="EUR10-25k - Één systeem serieus" id="q3-single" />
                      <Label htmlFor="q3-single" className="text-white/80">
                        {t('questions.budget.options.single')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="< EUR10k - Pilot/experiment" id="q3-pilot" />
                      <Label htmlFor="q3-pilot" className="text-white/80">
                        {t('questions.budget.options.pilot')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Eerst business case nodig" id="q3-business-case" />
                      <Label htmlFor="q3-business-case" className="text-white/80">
                        {t('questions.budget.options.businessCase')}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {/* Question 4: Main Blocker */}
            {currentStep === 4 && (
              <motion.div
                key="q4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-xl font-bold text-white mb-4">
                  {t('questions.blocker.title')}
                </h4>
                <RadioGroup
                  value={formData.mainBlocker}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, mainBlocker: value }))
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Technische kennis ontbreekt" id="q4-knowledge" />
                      <Label htmlFor="q4-knowledge" className="text-white/80">
                        {t('questions.blocker.options.knowledge')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Systemen praten niet met elkaar" id="q4-integration" />
                      <Label htmlFor="q4-integration" className="text-white/80">
                        {t('questions.blocker.options.integration')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Geen idee waar te beginnen" id="q4-guidance" />
                      <Label htmlFor="q4-guidance" className="text-white/80">
                        {t('questions.blocker.options.guidance')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Budget/resources beperkt" id="q4-budget" />
                      <Label htmlFor="q4-budget" className="text-white/80">
                        {t('questions.blocker.options.budget')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Security/compliance zorgen" id="q4-security" />
                      <Label htmlFor="q4-security" className="text-white/80">
                        {t('questions.blocker.options.security')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Team weerstand tegen verandering" id="q4-resistance" />
                      <Label htmlFor="q4-resistance" className="text-white/80">
                        {t('questions.blocker.options.resistance')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Data is te rommelig/verspreid" id="q4-data" />
                      <Label htmlFor="q4-data" className="text-white/80">
                        {t('questions.blocker.options.data')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Anders" id="q4-other" />
                      <Label htmlFor="q4-other" className="text-white/80">
                        {t('questions.blocker.options.other')}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {/* Question 5: Highest Impact System */}
            {currentStep === 5 && (
              <motion.div
                key="q5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-xl font-bold text-white mb-4">{t('questions.impact.title')}</h4>
                <p className="text-white/60 text-sm mb-4">{t('questions.impact.subtitle')}</p>
                <RadioGroup
                  value={formData.highestImpact}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, highestImpact: value }))
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Klantenservice/Helpdesk" id="q5-helpdesk" />
                      <Label htmlFor="q5-helpdesk" className="text-white/80">
                        {t('questions.impact.options.helpdesk')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="CRM/Sales" id="q5-crm" />
                      <Label htmlFor="q5-crm" className="text-white/80">
                        {t('questions.impact.options.crm')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="ERP/Finance" id="q5-erp" />
                      <Label htmlFor="q5-erp" className="text-white/80">
                        {t('questions.impact.options.erp')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Planning/Logistics" id="q5-planning" />
                      <Label htmlFor="q5-planning" className="text-white/80">
                        {t('questions.impact.options.planning')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Kennisbank/Documentatie" id="q5-knowledge" />
                      <Label htmlFor="q5-knowledge" className="text-white/80">
                        {t('questions.impact.options.knowledge')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="HR/Personeelszaken" id="q5-hr" />
                      <Label htmlFor="q5-hr" className="text-white/80">
                        {t('questions.impact.options.hr')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Eigen software/Maatwerk" id="q5-custom" />
                      <Label htmlFor="q5-custom" className="text-white/80">
                        {t('questions.impact.options.custom')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Anders" id="q5-other" />
                      <Label htmlFor="q5-other" className="text-white/80">
                        {t('questions.impact.options.other')}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {t('navigation.previous')}
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="text-white"
                style={{ backgroundColor: '#F87315' }}
              >
                {t('navigation.next')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="text-white font-semibold"
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
