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
  });

  const totalSteps = 5;

  const calculateQuickScore = (data: QuickCheckData): number => {
    let score = 0;

    // Core Business (20 points)
    const businessScore = data.coreBusiness.trim().length > 10 ? 20 : data.coreBusiness.trim().length > 0 ? 10 : 0;
    score += businessScore;

    // Systems (25 points - based on number of systems selected)
    const systemsScore = Math.min(data.systems.length * 8, 25);
    score += systemsScore;

    // Highest Impact System (15 points)
    const highestImpactScore = data.highestImpactSystem ? 15 : 0;
    score += highestImpactScore;

    // APIs (25 points)
    const apiScore = {
      'most': 25,
      'some': 18,
      'unknown': 8,
      'none': 0
    }[data.hasApis] || 0;
    score += apiScore;

    // Data Access (15 points)
    const dataScore = {
      'instant': 15,
      'minutes': 12,
      'difficult': 6,
      'impossible': 0
    }[data.dataAccess] || 0;
    score += dataScore;

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
        return formData.coreBusiness.trim().length > 0;
      case 2:
        return formData.systems.length > 0;
      case 3:
        return formData.highestImpactSystem !== '';
      case 4:
        return formData.hasApis !== '';
      case 5:
        return formData.dataAccess !== '';
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
                coreBusiness: formData.coreBusiness,
                systems: formData.systems,
                highestImpactSystem: formData.highestImpactSystem,
                hasApis: formData.hasApis,
                dataAccess: formData.dataAccess,
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
              setIsCompleted(false);
              setCurrentStep(1);
              setFormData({
                coreBusiness: '',
                systems: [],
                highestImpactSystem: '',
                hasApis: '',
                dataAccess: '',
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
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight text-left">💼 Wat is jullie core business?</h4>
                <p className="text-white/70 text-sm mb-4">In één zin: wat doet jullie bedrijf voor klanten?</p>
                <Input
                  value={formData.coreBusiness}
                  onChange={(e) => setFormData(prev => ({ ...prev, coreBusiness: e.target.value }))}
                  placeholder="We zijn een [type bedrijf] die [wat jullie doen] voor [doelgroep]"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight text-left">🏗️ Welke systemen MOETEN agent-ready worden?</h4>
                <p className="text-white/70 text-sm mb-4">Selecteer maximaal 3 systemen die je prioriteit hebben</p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    'Klantenservice/Helpdesk',
                    'CRM/Sales', 
                    'ERP/Finance',
                    'HR/Personeelszaken',
                    'Kennisbank/Documentatie',
                    'Planning/Logistics',
                    'Eigen software/Maatwerk',
                    'Anders'
                  ].map((system) => (
                    <Label key={system} className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <Checkbox 
                        checked={formData.systems.includes(system)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const checked = e.target.checked;
                          if (checked && formData.systems.length < 3) {
                            setFormData(prev => ({ ...prev, systems: [...prev.systems, system] }));
                          } else if (!checked) {
                            setFormData(prev => ({ ...prev, systems: prev.systems.filter(s => s !== system) }));
                          }
                        }}
                        disabled={!formData.systems.includes(system) && formData.systems.length >= 3}
                        className="mt-0.5"
                      />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{system}</span>
                    </Label>
                  ))}
                </div>
                <p className="text-white/50 text-xs mt-2">Geselecteerd: {formData.systems.length}/3 systemen</p>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight text-left">🎯 Welk systeem heeft de GROOTSTE impact?</h4>
                <p className="text-white/70 text-sm mb-4">Kies uit de systemen die je net selecteerde</p>
                <RadioGroup value={formData.highestImpactSystem} onValueChange={(value) => setFormData(prev => ({ ...prev, highestImpactSystem: value }))}>
                  <div className="space-y-2 sm:space-y-3">
                    {formData.systems.map((system) => (
                      <Label key={system} className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                        <RadioGroupItem value={system} id={system.toLowerCase().replace(/[^a-z0-9]/g, '-')} className="mt-0.5" />
                        <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">{system}</span>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight text-left">🔌 Hebben deze systemen APIs?</h4>
                <p className="text-white/70 text-sm mb-4">Agents moeten kunnen verbinden met je systemen</p>
                <RadioGroup value={formData.hasApis} onValueChange={(value) => setFormData(prev => ({ ...prev, hasApis: value }))}>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="most" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="most" id="most" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">Ja, de meeste hebben APIs</span>
                    </Label>
                    <Label htmlFor="some" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="some" id="some" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">Sommige wel, sommige niet</span>
                    </Label>
                    <Label htmlFor="unknown" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="unknown" id="unknown" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">Geen idee eigenlijk</span>
                    </Label>
                    <Label htmlFor="none" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="none" id="none" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">Nee, nog geen APIs</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 leading-tight text-left">📊 Kun je snel klantdata vinden?</h4>
                <p className="text-white/70 text-sm mb-4">Test: Kun je binnen 5 minuten alle data van klant "Jan de Vries" vinden?</p>
                <RadioGroup value={formData.dataAccess} onValueChange={(value) => setFormData(prev => ({ ...prev, dataAccess: value }))}>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="instant" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="instant" id="instant" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">Ja, binnen 1 minuut</span>
                    </Label>
                    <Label htmlFor="minutes" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="minutes" id="minutes" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">Ja, binnen 5 minuten</span>
                    </Label>
                    <Label htmlFor="difficult" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="difficult" id="difficult" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">Moeilijk, data zit verspreid</span>
                    </Label>
                    <Label htmlFor="impossible" className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <RadioGroupItem value="impossible" id="impossible" className="mt-0.5" />
                      <span className="text-sm sm:text-base text-white/80 leading-relaxed flex-1 text-left">Bijna onmogelijk</span>
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