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
import { CheckCircle, ArrowRight, ArrowLeft, MessageSquare, Clock, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface CXAIData {
  customerChannels: string[];
  responseTime: string;
  personalization: string;
  customerDataUnification: string;
  chatbotExperience: string;
  sentimentAnalysis: string;
  selfService: string;
  predictiveService: string;
  customerJourney: string;
  npsScore: string;
  coreBusiness: string;
  biggestPainPoint: string;
  targetImprovement: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

const totalSteps = 14;

export default function CXAIAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { user, firebaseUser } = useAuth();

  const [formData, setFormData] = useState<CXAIData>({
    customerChannels: [],
    responseTime: '',
    personalization: '',
    customerDataUnification: '',
    chatbotExperience: '',
    sentimentAnalysis: '',
    selfService: '',
    predictiveService: '',
    customerJourney: '',
    npsScore: '',
    coreBusiness: '',
    biggestPainPoint: '',
    targetImprovement: '',
    name: user?.displayName || '',
    role: user?.jobTitle || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: prev.name || user.displayName || '', role: prev.role || user.jobTitle || '', company: prev.company || user.company || '', email: prev.email || user.email || '', phone: prev.phone || user.phoneNumber || '' }));
    }
  }, [user]);

  const handleInputChange = (field: keyof CXAIData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChannelChange = (value: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, customerChannels: checked ? [...prev.customerChannels, value] : prev.customerChannels.filter(c => c !== value) }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return formData.customerChannels.length > 0;
      case 2: return formData.responseTime !== '';
      case 3: return formData.personalization !== '';
      case 4: return formData.customerDataUnification !== '';
      case 5: return formData.chatbotExperience !== '';
      case 6: return formData.sentimentAnalysis !== '';
      case 7: return formData.selfService !== '';
      case 8: return formData.predictiveService !== '';
      case 9: return formData.customerJourney !== '';
      case 10: return formData.npsScore !== '';
      case 11: return formData.coreBusiness.trim().length >= 10;
      case 12: return formData.biggestPainPoint.trim().length >= 10;
      case 13: return formData.targetImprovement !== '';
      case 14: return formData.name.trim() !== '' && formData.email.trim() !== '' && formData.company.trim() !== '';
      default: return false;
    }
  };

  const handleNext = () => { if (currentStep < totalSteps && isStepValid(currentStep)) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const getLevel = (score: number): string => {
    if (score >= 90) return 'AI-Powered CX';
    if (score >= 70) return 'Personalized CX';
    if (score >= 50) return 'Digital Engagement';
    if (score >= 30) return 'Basic Digital';
    return 'Traditional CX';
  };

  const handleSubmit = async () => {
    if (!isStepValid(totalSteps)) return;
    setLoadingResults(true);
    try {
      const submissionData = { ...formData, type: 'cx_ai', entryPoint: 'cx_ai_assessment', timestamp: new Date().toISOString() };
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">{assessmentResults?.score || 0}</span>
              </div>
              <CardTitle className="text-3xl text-white mb-2">CX AI Score</CardTitle>
              <p className="text-xl text-pink-400 font-semibold">{assessmentResults?.level}</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-lg mb-8">
                <h4 className="text-white font-medium mb-2">CX Transformation Workshop</h4>
                <p className="text-white/70 text-sm mb-3">Ontdek hoe AI je klantervaring kan transformeren.</p>
                <Link href="/contact"><Button className="bg-pink-500 hover:bg-pink-600 text-white">Plan een gesprek <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
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

  const channelOptions = [
    { value: 'email', label: 'E-mail' },
    { value: 'phone', label: 'Telefoon' },
    { value: 'chat', label: 'Live Chat' },
    { value: 'social', label: 'Social Media' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'self_service', label: 'Self-service portal' },
    { value: 'in_person', label: 'Face-to-face' },
    { value: 'mobile_app', label: 'Mobile App' },
  ];

  const questions = [
    { step: 2, label: 'Wat is je gemiddelde responstijd naar klanten?', field: 'responseTime' as const, options: [
      { value: 'instant', label: 'Direct (<1 min)', desc: 'Real-time support' },
      { value: 'minutes', label: 'Minuten', desc: 'Binnen een uur' },
      { value: 'hours', label: 'Uren', desc: 'Zelfde dag' },
      { value: 'days', label: 'Dagen', desc: 'Volgende werkdag of later' },
    ]},
    { step: 3, label: 'Hoe gepersonaliseerd is je klantcommunicatie?', field: 'personalization' as const, options: [
      { value: 'advanced', label: 'Geavanceerd', desc: 'AI-gedreven personalisatie' },
      { value: 'basic', label: 'Basis', desc: 'Naam en laatste aankoop' },
      { value: 'minimal', label: 'Minimaal', desc: 'Alleen naam' },
      { value: 'none', label: 'Geen', desc: 'Generieke communicatie' },
    ]},
    { step: 4, label: 'Hoe is je klantdata georganiseerd?', field: 'customerDataUnification' as const, options: [
      { value: 'unified_360', label: '360° klantbeeld', desc: 'Alle data gecentraliseerd' },
      { value: 'partially_unified', label: 'Gedeeltelijk', desc: 'Sommige systemen gekoppeld' },
      { value: 'siloed', label: 'Gesilo\'d', desc: 'Data in aparte systemen' },
      { value: 'no_data', label: 'Geen overzicht', desc: 'Geen centrale klantdata' },
    ]},
    { step: 5, label: 'Gebruik je chatbots of virtual assistants?', field: 'chatbotExperience' as const, options: [
      { value: 'ai_powered', label: 'AI-powered chatbot', desc: 'NLU, context-aware' },
      { value: 'rule_based', label: 'Rule-based bot', desc: 'Menu-gestuurde flows' },
      { value: 'planned', label: 'Gepland', desc: 'Komt eraan' },
      { value: 'none', label: 'Geen', desc: 'Alleen menselijke support' },
    ]},
    { step: 6, label: 'Analyseer je klantsentiment?', field: 'sentimentAnalysis' as const, options: [
      { value: 'real_time', label: 'Real-time', desc: 'Live sentiment monitoring' },
      { value: 'periodic', label: 'Periodiek', desc: 'Maandelijkse analyses' },
      { value: 'manual', label: 'Handmatig', desc: 'Ad-hoc reviews' },
      { value: 'none', label: 'Nee', desc: 'Geen sentiment analyse' },
    ]},
    { step: 7, label: 'Hoe uitgebreid is je self-service?', field: 'selfService' as const, options: [
      { value: 'comprehensive', label: 'Uitgebreid', desc: 'Klant kan bijna alles zelf' },
      { value: 'basic', label: 'Basis', desc: 'FAQ, account beheer' },
      { value: 'minimal', label: 'Minimaal', desc: 'Alleen info bekijken' },
      { value: 'none', label: 'Geen', desc: 'Alles via contact' },
    ]},
    { step: 8, label: 'Ben je proactief in klantenservice?', field: 'predictiveService' as const, options: [
      { value: 'proactive', label: 'Proactief', desc: 'We anticiperen op problemen' },
      { value: 'reactive', label: 'Reactief', desc: 'We reageren op vragen' },
      { value: 'planned', label: 'Gepland', desc: 'Gaan we implementeren' },
      { value: 'none', label: 'Niet', desc: 'Alleen inkomende vragen' },
    ]},
    { step: 9, label: 'Is je customer journey in kaart gebracht?', field: 'customerJourney' as const, options: [
      { value: 'mapped', label: 'Volledig in kaart', desc: 'Alle touchpoints gedefinieerd' },
      { value: 'partially_mapped', label: 'Gedeeltelijk', desc: 'Hoofdfases bekend' },
      { value: 'planned', label: 'Gepland', desc: 'Staat op roadmap' },
      { value: 'unknown', label: 'Niet', desc: 'Geen journey mapping' },
    ]},
    { step: 10, label: 'Wat is je NPS score?', field: 'npsScore' as const, options: [
      { value: 'promoter', label: 'Promoter (50+)', desc: 'Klanten bevelen ons aan' },
      { value: 'passive', label: 'Passief (0-50)', desc: 'Klanten zijn tevreden' },
      { value: 'detractor', label: 'Detractor (<0)', desc: 'Verbetering nodig' },
      { value: 'not_measured', label: 'Niet gemeten', desc: 'Geen NPS tracking' },
    ]},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Customer Experience AI Assessment</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">Ontdek hoe AI je klantervaring kan verbeteren.</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-white/60">
            <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 5-7 min</span>
            <span className="flex items-center"><FileText className="w-4 h-4 mr-2" /> AI-rapport</span>
          </div>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2"><span>Vraag {currentStep} van {totalSteps}</span><span>{Math.round(progress)}%</span></div>
          <div className="w-full bg-white/10 rounded-full h-2"><motion.div className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full" animate={{ width: `${progress}%` }} /></div>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Via welke kanalen bedien je klanten?</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {channelOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <Checkbox id={option.value} checked={formData.customerChannels.includes(option.value)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChannelChange(option.value, e.target.checked)} />
                          <Label htmlFor={option.value} className="text-white cursor-pointer">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep >= 2 && currentStep <= 10 && questions[currentStep - 2] && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">{questions[currentStep - 2].label}</Label>
                    <RadioGroup value={formData[questions[currentStep - 2].field] as string} onValueChange={(value) => handleInputChange(questions[currentStep - 2].field, value)} className="space-y-3">
                      {questions[currentStep - 2].options.map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <RadioGroupItem value={option.value} id={`${currentStep}-${option.value}`} className="mt-1" />
                          <div><Label htmlFor={`${currentStep}-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label><p className="text-white/60 text-sm">{option.desc}</p></div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentStep === 11 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Beschrijf je klantenservice operatie</Label>
                    <Textarea value={formData.coreBusiness} onChange={(e) => handleInputChange('coreBusiness', e.target.value)} placeholder="Hoeveel klantcontacten per dag? Welke vragen komen het meest voor?" className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                )}

                {currentStep === 12 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wat is het grootste pijnpunt in je CX?</Label>
                    <Textarea value={formData.biggestPainPoint} onChange={(e) => handleInputChange('biggestPainPoint', e.target.value)} placeholder="Waar lopen klanten of medewerkers het meest tegenaan?" className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                )}

                {currentStep === 13 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wat wil je het meest verbeteren?</Label>
                    <RadioGroup value={formData.targetImprovement} onValueChange={(value) => handleInputChange('targetImprovement', value)} className="space-y-3">
                      {[
                        { value: 'speed', label: 'Snelheid', desc: 'Snellere responstijden' },
                        { value: 'personalization', label: 'Personalisatie', desc: 'Relevantere interacties' },
                        { value: 'availability', label: '24/7 beschikbaarheid', desc: 'Altijd bereikbaar' },
                        { value: 'cost', label: 'Kosten', desc: 'Efficiëntere operatie' },
                        { value: 'satisfaction', label: 'Tevredenheid', desc: 'Hogere NPS' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <RadioGroupItem value={option.value} id={`target-${option.value}`} className="mt-1" />
                          <div><Label htmlFor={`target-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label><p className="text-white/60 text-sm">{option.desc}</p></div>
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
                <Button onClick={handleNext} disabled={!isStepValid(currentStep)} className="bg-pink-500 hover:bg-pink-600 text-white">Volgende <ArrowRight className="w-4 h-4 ml-2" /></Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid(currentStep) || loadingResults} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
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
