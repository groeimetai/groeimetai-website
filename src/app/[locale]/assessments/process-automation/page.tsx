'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, ArrowRight, ArrowLeft, Settings, Clock, FileText, Loader2, Download, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ProcessAutomationData {
  processDocumentation: string;
  repetitiveTasks: string;
  errorRate: string;
  processVolume: string;
  systemIntegration: string;
  decisionComplexity: string;
  exceptionHandling: string;
  staffAvailability: string;
  rpaExperience: string;
  bottlenecks: string[];
  coreBusiness: string;
  priorityProcess: string;
  expectedSavings: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

const totalSteps = 14;

export default function ProcessAutomationAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultsReady, setResultsReady] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { user, firebaseUser } = useAuth();

  const [formData, setFormData] = useState<ProcessAutomationData>({
    processDocumentation: '',
    repetitiveTasks: '',
    errorRate: '',
    processVolume: '',
    systemIntegration: '',
    decisionComplexity: '',
    exceptionHandling: '',
    staffAvailability: '',
    rpaExperience: '',
    bottlenecks: [],
    coreBusiness: '',
    priorityProcess: '',
    expectedSavings: '',
    name: user?.displayName || user?.firstName || '',
    role: user?.jobTitle || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.displayName || user.firstName || '',
        role: prev.role || user.jobTitle || '',
        company: prev.company || user.company || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phoneNumber || '',
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof ProcessAutomationData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBottleneckChange = (value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      bottlenecks: checked
        ? [...prev.bottlenecks, value]
        : prev.bottlenecks.filter(b => b !== value)
    }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return formData.processDocumentation !== '';
      case 2: return formData.repetitiveTasks !== '';
      case 3: return formData.errorRate !== '';
      case 4: return formData.processVolume !== '';
      case 5: return formData.systemIntegration !== '';
      case 6: return formData.decisionComplexity !== '';
      case 7: return formData.exceptionHandling !== '';
      case 8: return formData.staffAvailability !== '';
      case 9: return formData.rpaExperience !== '';
      case 10: return formData.bottlenecks.length > 0;
      case 11: return formData.coreBusiness.trim().length >= 10;
      case 12: return formData.priorityProcess.trim().length >= 10;
      case 13: return formData.expectedSavings !== '';
      case 14: return formData.name.trim() !== '' && formData.email.trim() !== '' && formData.company.trim() !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getLevel = (score: number): string => {
    if (score >= 90) return 'Fully Automated';
    if (score >= 70) return 'Advanced Automation';
    if (score >= 50) return 'Partial Automation';
    if (score >= 30) return 'Basic Automation';
    return 'Manual Operations';
  };

  const handleSubmit = async () => {
    if (!isStepValid(totalSteps)) return;
    setLoadingResults(true);
    setSubmissionError(null);

    try {
      const submissionData = {
        ...formData,
        type: 'process_automation',
        entryPoint: 'process_automation_assessment',
        timestamp: new Date().toISOString()
      };

      let idToken = null;
      if (firebaseUser) {
        try {
          idToken = await firebaseUser.getIdToken();
          (submissionData as any).firebaseIdToken = idToken;
          (submissionData as any).userId = firebaseUser.uid;
        } catch (tokenError) {
          console.warn('Could not get Firebase token:', tokenError);
        }
      }

      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();
      if (result.success) {
        setIsSubmitted(true);
        setAssessmentResults({ score: result.previewScore, level: getLevel(result.previewScore) });
        setResultsReady(true);
        setLoadingResults(false);
      } else {
        setSubmissionError(result.error || 'Er is iets misgegaan');
        setLoadingResults(false);
      }
    } catch (error) {
      setSubmissionError('Er is een fout opgetreden. Probeer het opnieuw.');
      setLoadingResults(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="text-center pb-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">{assessmentResults?.score || 0}</span>
              </div>
              <CardTitle className="text-3xl text-white mb-2">Automation Readiness Score</CardTitle>
              <p className="text-xl text-purple-400 font-semibold">{assessmentResults?.level}</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/30 rounded-lg mb-8">
                <h4 className="text-white font-medium mb-2">Automation Roadmap</h4>
                <p className="text-white/70 text-sm mb-3">Krijg een concreet plan voor procesautomatisering.</p>
                <Link href="/contact">
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white">Plan een gesprek <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </Link>
              </div>
              <div className="flex gap-4">
                <Link href="/dashboard" className="flex-1"><Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">Naar Dashboard</Button></Link>
                <Link href="/assessments" className="flex-1"><Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">Meer Assessments</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const questions = [
    { step: 1, label: 'Hoe goed zijn je processen gedocumenteerd?', field: 'processDocumentation' as const, options: [
      { value: 'fully_documented', label: 'Volledig gedocumenteerd', desc: 'Alle stappen beschreven' },
      { value: 'mostly_documented', label: 'Grotendeels gedocumenteerd', desc: 'Belangrijkste processen' },
      { value: 'partially', label: 'Gedeeltelijk', desc: 'Sommige processen beschreven' },
      { value: 'tribal_knowledge', label: 'Tribal knowledge', desc: 'In hoofden van mensen' },
    ]},
    { step: 2, label: 'Hoeveel repetitieve taken heb je?', field: 'repetitiveTasks' as const, options: [
      { value: 'many', label: 'Veel', desc: '>50% van het werk is repetitief' },
      { value: 'some', label: 'Redelijk wat', desc: '25-50% repetitief' },
      { value: 'few', label: 'Weinig', desc: '10-25% repetitief' },
      { value: 'rare', label: 'Nauwelijks', desc: '<10% repetitief' },
    ]},
    { step: 3, label: 'Wat is de foutmarge in handmatige processen?', field: 'errorRate' as const, options: [
      { value: 'high', label: 'Hoog', desc: '>5% fouten' },
      { value: 'moderate', label: 'Gemiddeld', desc: '2-5% fouten' },
      { value: 'low', label: 'Laag', desc: '1-2% fouten' },
      { value: 'minimal', label: 'Minimaal', desc: '<1% fouten' },
    ]},
    { step: 4, label: 'Hoeveel transacties/processen per dag?', field: 'processVolume' as const, options: [
      { value: 'thousands_daily', label: 'Duizenden per dag', desc: 'Zeer hoog volume' },
      { value: 'hundreds_daily', label: 'Honderden per dag', desc: 'Hoog volume' },
      { value: 'tens_daily', label: 'Tientallen per dag', desc: 'Medium volume' },
      { value: 'few_daily', label: 'Enkele per dag', desc: 'Laag volume' },
    ]},
    { step: 5, label: 'Hoe geïntegreerd zijn je systemen?', field: 'systemIntegration' as const, options: [
      { value: 'fully_integrated', label: 'Volledig geïntegreerd', desc: 'Systemen praten met elkaar' },
      { value: 'partially_integrated', label: 'Gedeeltelijk', desc: 'Sommige koppelingen' },
      { value: 'siloed', label: 'Gesilo\'d', desc: 'Weinig integratie' },
      { value: 'manual', label: 'Handmatig', desc: 'Copy-paste tussen systemen' },
    ]},
    { step: 6, label: 'Hoe complex zijn de beslissingen in processen?', field: 'decisionComplexity' as const, options: [
      { value: 'rule_based', label: 'Rule-based', desc: 'Duidelijke regels te definiëren' },
      { value: 'some_judgment', label: 'Enige beoordeling nodig', desc: 'Soms menselijke input' },
      { value: 'highly_complex', label: 'Complex', desc: 'Veel uitzonderingen' },
      { value: 'unpredictable', label: 'Onvoorspelbaar', desc: 'Elk geval anders' },
    ]},
    { step: 7, label: 'Hoe ga je om met uitzonderingen?', field: 'exceptionHandling' as const, options: [
      { value: 'standardized', label: 'Gestandaardiseerd', desc: 'Duidelijke procedures' },
      { value: 'ad_hoc', label: 'Ad hoc', desc: 'Per geval bekeken' },
      { value: 'chaotic', label: 'Chaotisch', desc: 'Geen vaste aanpak' },
      { value: 'undefined', label: 'Niet gedefinieerd', desc: 'Geen exception handling' },
    ]},
    { step: 8, label: 'Hoe is de werklast van je team?', field: 'staffAvailability' as const, options: [
      { value: 'overloaded', label: 'Overbelast', desc: 'Constant te weinig capaciteit' },
      { value: 'busy', label: 'Druk', desc: 'Weinig ruimte voor extra' },
      { value: 'balanced', label: 'Gebalanceerd', desc: 'Goede mix' },
      { value: 'underutilized', label: 'Onderbenut', desc: 'Ruimte over' },
    ]},
    { step: 9, label: 'Wat is je ervaring met RPA/automatisering?', field: 'rpaExperience' as const, options: [
      { value: 'advanced', label: 'Gevorderd', desc: 'Multiple bots in productie' },
      { value: 'basic', label: 'Basis', desc: 'Enkele automations' },
      { value: 'piloting', label: 'Aan het proberen', desc: 'Pilots lopen' },
      { value: 'none', label: 'Geen', desc: 'Nog niet mee begonnen' },
    ]},
  ];

  const bottleneckOptions = [
    { value: 'data_entry', label: 'Data invoer' },
    { value: 'approvals', label: 'Goedkeuringen' },
    { value: 'reporting', label: 'Rapportage' },
    { value: 'customer_service', label: 'Klantenservice' },
    { value: 'invoicing', label: 'Facturatie' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'compliance', label: 'Compliance checks' },
    { value: 'document_processing', label: 'Document verwerking' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 mb-6">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Process Automation Quickscan</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">Ontdek welke processen rijp zijn voor automatisering.</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-white/60">
            <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 5-7 minuten</span>
            <span className="flex items-center"><FileText className="w-4 h-4 mr-2" /> AI-rapport</span>
          </div>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Vraag {currentStep} van {totalSteps}</span>
            <span>{Math.round(progress)}% voltooid</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
          </div>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {currentStep <= 9 && questions[currentStep - 1] && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">{questions[currentStep - 1].label}</Label>
                    <RadioGroup value={formData[questions[currentStep - 1].field] as string} onValueChange={(value) => handleInputChange(questions[currentStep - 1].field, value)} className="space-y-3">
                      {questions[currentStep - 1].options.map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <RadioGroupItem value={option.value} id={`${questions[currentStep - 1].field}-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`${questions[currentStep - 1].field}-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentStep === 10 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Waar zitten de grootste bottlenecks? (selecteer alle relevante)</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {bottleneckOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <Checkbox id={option.value} checked={formData.bottlenecks.includes(option.value)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBottleneckChange(option.value, e.target.checked)} />
                          <Label htmlFor={option.value} className="text-white cursor-pointer">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 11 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Beschrijf je kernprocessen</Label>
                    <Textarea value={formData.coreBusiness} onChange={(e) => handleInputChange('coreBusiness', e.target.value)} placeholder="Welke processen nemen de meeste tijd in beslag?" className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                )}

                {currentStep === 12 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Welk proces wil je het eerst automatiseren?</Label>
                    <Textarea value={formData.priorityProcess} onChange={(e) => handleInputChange('priorityProcess', e.target.value)} placeholder="Beschrijf het proces en waarom dit prioriteit heeft..." className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                )}

                {currentStep === 13 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wat verwacht je te besparen met automatisering?</Label>
                    <RadioGroup value={formData.expectedSavings} onValueChange={(value) => handleInputChange('expectedSavings', value)} className="space-y-3">
                      {[
                        { value: 'significant', label: 'Significant - >50% tijdsbesparing', desc: 'Grote efficiency winst' },
                        { value: 'moderate', label: 'Gemiddeld - 25-50% besparing', desc: 'Merkbare verbetering' },
                        { value: 'some', label: 'Enige - 10-25% besparing', desc: 'Bescheiden winst' },
                        { value: 'unknown', label: 'Onbekend', desc: 'Nog geen inschatting' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <RadioGroupItem value={option.value} id={`savings-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`savings-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentStep === 14 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Waar mogen we je rapport naartoe sturen?</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Naam *</Label>
                        <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Je volledige naam" className="bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">E-mail *</Label>
                        <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="je@bedrijf.nl" className="bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Bedrijf *</Label>
                        <Input value={formData.company} onChange={(e) => handleInputChange('company', e.target.value)} placeholder="Bedrijfsnaam" className="bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Functie</Label>
                        <Input value={formData.role} onChange={(e) => handleInputChange('role', e.target.value)} placeholder="Je functietitel" className="bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                      </div>
                    </div>
                    {submissionError && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"><p className="text-red-400">{submissionError}</p></div>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="border-white/20 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" /> Vorige
              </Button>
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={!isStepValid(currentStep)} className="bg-purple-500 hover:bg-purple-600 text-white">
                  Volgende <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid(currentStep) || loadingResults} className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                  {loadingResults ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verzenden...</> : <>Verstuur & Ontvang Rapport<CheckCircle className="w-4 h-4 ml-2" /></>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
