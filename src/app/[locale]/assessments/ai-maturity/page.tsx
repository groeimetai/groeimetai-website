'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, ArrowRight, ArrowLeft, Brain, Clock, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface AIMaturityData {
  aiStrategy: string;
  aiGovernance: string;
  aiTalent: string;
  aiInfrastructure: string;
  aiUseCases: string;
  mlOps: string;
  dataScience: string;
  aiEthics: string;
  aiBudget: string;
  aiCulture: string;
  coreBusiness: string;
  aiVision: string;
  biggestBarrier: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

const totalSteps = 14;

export default function AIMaturityAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { user, firebaseUser } = useAuth();

  const [formData, setFormData] = useState<AIMaturityData>({
    aiStrategy: '', aiGovernance: '', aiTalent: '', aiInfrastructure: '', aiUseCases: '',
    mlOps: '', dataScience: '', aiEthics: '', aiBudget: '', aiCulture: '',
    coreBusiness: '', aiVision: '', biggestBarrier: '',
    name: user?.displayName || '', role: user?.jobTitle || '', company: user?.company || '', email: user?.email || '', phone: user?.phoneNumber || '',
  });

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: prev.name || user.displayName || '', role: prev.role || user.jobTitle || '', company: prev.company || user.company || '', email: prev.email || user.email || '', phone: prev.phone || user.phoneNumber || '' }));
  }, [user]);

  const handleInputChange = (field: keyof AIMaturityData, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const isStepValid = (step: number): boolean => {
    const fields: (keyof AIMaturityData)[] = ['aiStrategy', 'aiGovernance', 'aiTalent', 'aiInfrastructure', 'aiUseCases', 'mlOps', 'dataScience', 'aiEthics', 'aiBudget', 'aiCulture'];
    if (step <= 10) return formData[fields[step - 1]] !== '';
    if (step === 11) return formData.coreBusiness.trim().length >= 10;
    if (step === 12) return formData.aiVision.trim().length >= 10;
    if (step === 13) return formData.biggestBarrier !== '';
    if (step === 14) return formData.name.trim() !== '' && formData.email.trim() !== '' && formData.company.trim() !== '';
    return false;
  };

  const handleNext = () => { if (currentStep < totalSteps && isStepValid(currentStep)) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const getLevel = (score: number): string => {
    if (score >= 90) return 'AI Native';
    if (score >= 70) return 'AI Scaling';
    if (score >= 50) return 'AI Experimenting';
    if (score >= 30) return 'AI Exploring';
    return 'AI Aware';
  };

  const handleSubmit = async () => {
    if (!isStepValid(totalSteps)) return;
    setLoadingResults(true);
    try {
      const submissionData = { ...formData, type: 'ai_maturity', entryPoint: 'ai_maturity_assessment', timestamp: new Date().toISOString() };
      let idToken = null;
      if (firebaseUser) { try { idToken = await firebaseUser.getIdToken(); (submissionData as any).firebaseIdToken = idToken; (submissionData as any).userId = firebaseUser.uid; } catch {} }
      const response = await fetch('/api/assessment/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) }, body: JSON.stringify(submissionData) });
      const result = await response.json();
      if (result.success) { setIsSubmitted(true); setAssessmentResults({ score: result.previewScore, level: getLevel(result.previewScore) }); }
      else setSubmissionError(result.error || 'Er is iets misgegaan');
    } catch { setSubmissionError('Er is een fout opgetreden.'); }
    setLoadingResults(false);
  };

  const progress = (currentStep / totalSteps) * 100;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="text-center pb-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">{assessmentResults?.score || 0}</span>
              </div>
              <CardTitle className="text-3xl text-white mb-2">AI Maturity Score</CardTitle>
              <p className="text-xl text-amber-400 font-semibold">{assessmentResults?.level}</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg mb-8">
                <h4 className="text-white font-medium mb-2">AI Strategy Development</h4>
                <p className="text-white/70 text-sm mb-3">Ontwikkel een concrete AI roadmap voor je organisatie.</p>
                <Link href="/contact"><Button className="bg-amber-500 hover:bg-amber-600 text-white">Plan een gesprek <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
              </div>
              <div className="flex gap-4">
                <Link href="/dashboard" className="flex-1"><Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">Dashboard</Button></Link>
                <Link href="/assessments" className="flex-1"><Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">Meer Assessments</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const questions = [
    { step: 1, label: 'Heb je een AI strategie?', field: 'aiStrategy' as const, options: [
      { value: 'defined', label: 'Gedefinieerd', desc: 'Formele AI strategie aanwezig' },
      { value: 'emerging', label: 'In ontwikkeling', desc: 'Wordt aan gewerkt' },
      { value: 'ad_hoc', label: 'Ad hoc', desc: 'Geen formele strategie' },
      { value: 'none', label: 'Geen', desc: 'AI staat niet op de agenda' },
    ]},
    { step: 2, label: 'Hoe is je AI governance georganiseerd?', field: 'aiGovernance' as const, options: [
      { value: 'mature', label: 'Volwassen', desc: 'Formeel governance framework' },
      { value: 'developing', label: 'In ontwikkeling', desc: 'Wordt opgezet' },
      { value: 'basic', label: 'Basis', desc: 'Informele afspraken' },
      { value: 'none', label: 'Geen', desc: 'Geen governance' },
    ]},
    { step: 3, label: 'Hoe staat het met AI talent in je organisatie?', field: 'aiTalent' as const, options: [
      { value: 'in_house_team', label: 'Intern team', desc: 'Dedicated AI/ML team' },
      { value: 'some_expertise', label: 'Enige expertise', desc: 'Enkele specialisten' },
      { value: 'external_only', label: 'Alleen extern', desc: 'Outsourced' },
      { value: 'none', label: 'Geen', desc: 'Geen AI kennis' },
    ]},
    { step: 4, label: 'Wat is je AI infrastructuur?', field: 'aiInfrastructure' as const, options: [
      { value: 'cloud_native', label: 'Cloud native', desc: 'Azure ML, AWS SageMaker, etc.' },
      { value: 'hybrid', label: 'Hybrid', desc: 'Mix van cloud en on-prem' },
      { value: 'on_premise', label: 'On-premise', desc: 'Lokale servers' },
      { value: 'none', label: 'Geen', desc: 'Geen AI infrastructuur' },
    ]},
    { step: 5, label: 'Waar sta je met AI use cases?', field: 'aiUseCases' as const, options: [
      { value: 'production', label: 'In productie', desc: 'Multiple AI apps live' },
      { value: 'pilots', label: 'Pilots', desc: 'Proof of concepts lopen' },
      { value: 'experiments', label: 'Experimenten', desc: 'Aan het verkennen' },
      { value: 'none', label: 'Geen', desc: 'Nog geen AI use cases' },
    ]},
    { step: 6, label: 'Hoe is je MLOps ingericht?', field: 'mlOps' as const, options: [
      { value: 'automated', label: 'Geautomatiseerd', desc: 'CI/CD voor models' },
      { value: 'semi_automated', label: 'Semi-geautomatiseerd', desc: 'Deels automatisch' },
      { value: 'manual', label: 'Handmatig', desc: 'Handmatige deployments' },
      { value: 'none', label: 'Geen', desc: 'Geen MLOps proces' },
    ]},
    { step: 7, label: 'Wat is je data science capability?', field: 'dataScience' as const, options: [
      { value: 'advanced', label: 'Gevorderd', desc: 'Custom models, deep learning' },
      { value: 'intermediate', label: 'Gemiddeld', desc: 'Standaard ML technieken' },
      { value: 'basic', label: 'Basis', desc: 'Simpele analytics' },
      { value: 'none', label: 'Geen', desc: 'Geen data science' },
    ]},
    { step: 8, label: 'Heb je AI ethics richtlijnen?', field: 'aiEthics' as const, options: [
      { value: 'framework', label: 'Framework', desc: 'Formeel ethisch framework' },
      { value: 'guidelines', label: 'Richtlijnen', desc: 'Informele richtlijnen' },
      { value: 'ad_hoc', label: 'Ad hoc', desc: 'Per case bekeken' },
      { value: 'none', label: 'Geen', desc: 'Niet nagedacht over' },
    ]},
    { step: 9, label: 'Wat is je AI budget?', field: 'aiBudget' as const, options: [
      { value: 'dedicated', label: 'Dedicated budget', desc: 'Vast AI budget' },
      { value: 'project_based', label: 'Project-based', desc: 'Per project budget' },
      { value: 'limited', label: 'Beperkt', desc: 'Weinig budget' },
      { value: 'none', label: 'Geen', desc: 'Geen AI budget' },
    ]},
    { step: 10, label: 'Hoe staat de organisatie tegenover AI?', field: 'aiCulture' as const, options: [
      { value: 'embracing', label: 'Enthousiast', desc: 'AI wordt omarmd' },
      { value: 'curious', label: 'Nieuwsgierig', desc: 'Open voor experimenten' },
      { value: 'skeptical', label: 'Sceptisch', desc: 'Afwachtend' },
      { value: 'resistant', label: 'Weerstand', desc: 'Tegen AI' },
    ]},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">AI Maturity Scan</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">Bepaal waar je organisatie staat op de AI-volwassenheidscurve.</p>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2"><span>Vraag {currentStep} van {totalSteps}</span><span>{Math.round(progress)}%</span></div>
          <div className="w-full bg-white/10 rounded-full h-2"><motion.div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" animate={{ width: `${progress}%` }} /></div>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {currentStep <= 10 && questions[currentStep - 1] && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">{questions[currentStep - 1].label}</Label>
                    <RadioGroup value={formData[questions[currentStep - 1].field]} onValueChange={(value) => handleInputChange(questions[currentStep - 1].field, value)} className="space-y-3">
                      {questions[currentStep - 1].options.map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <RadioGroupItem value={option.value} id={`${currentStep}-${option.value}`} className="mt-1" />
                          <div><Label htmlFor={`${currentStep}-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label><p className="text-white/60 text-sm">{option.desc}</p></div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentStep === 11 && <div className="space-y-6"><Label className="text-xl font-semibold text-white">Beschrijf je organisatie en huidige AI initiatieven</Label><Textarea value={formData.coreBusiness} onChange={(e) => handleInputChange('coreBusiness', e.target.value)} placeholder="Wat doet je bedrijf en wat zijn je huidige AI projecten?" className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" /></div>}
                {currentStep === 12 && <div className="space-y-6"><Label className="text-xl font-semibold text-white">Wat is je AI visie voor de komende jaren?</Label><Textarea value={formData.aiVision} onChange={(e) => handleInputChange('aiVision', e.target.value)} placeholder="Waar wil je staan met AI over 2-3 jaar?" className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" /></div>}
                {currentStep === 13 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wat is de grootste barrière voor AI adoptie?</Label>
                    <RadioGroup value={formData.biggestBarrier} onValueChange={(value) => handleInputChange('biggestBarrier', value)} className="space-y-3">
                      {[{ value: 'talent', label: 'Talent', desc: 'Gebrek aan AI expertise' }, { value: 'budget', label: 'Budget', desc: 'Te weinig middelen' }, { value: 'data', label: 'Data', desc: 'Data niet op orde' }, { value: 'culture', label: 'Cultuur', desc: 'Weerstand in organisatie' }, { value: 'use_cases', label: 'Use cases', desc: 'Niet weten waar te beginnen' }].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <RadioGroupItem value={option.value} id={`barrier-${option.value}`} className="mt-1" />
                          <div><Label htmlFor={`barrier-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label><p className="text-white/60 text-sm">{option.desc}</p></div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
                {currentStep === 14 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Waar mogen we je rapport naartoe sturen?</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label className="text-white">Naam *</Label><Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="bg-white/5 border-white/20 text-white" /></div>
                      <div className="space-y-2"><Label className="text-white">E-mail *</Label><Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="bg-white/5 border-white/20 text-white" /></div>
                      <div className="space-y-2"><Label className="text-white">Bedrijf *</Label><Input value={formData.company} onChange={(e) => handleInputChange('company', e.target.value)} className="bg-white/5 border-white/20 text-white" /></div>
                      <div className="space-y-2"><Label className="text-white">Functie</Label><Input value={formData.role} onChange={(e) => handleInputChange('role', e.target.value)} className="bg-white/5 border-white/20 text-white" /></div>
                    </div>
                    {submissionError && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"><p className="text-red-400">{submissionError}</p></div>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="border-white/20 text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-2" /> Vorige</Button>
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={!isStepValid(currentStep)} className="bg-amber-500 hover:bg-amber-600 text-white">Volgende <ArrowRight className="w-4 h-4 ml-2" /></Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid(currentStep) || loadingResults} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  {loadingResults ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verzenden...</> : <>Verstuur Rapport<CheckCircle className="w-4 h-4 ml-2" /></>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
