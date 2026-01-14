'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, ArrowRight, ArrowLeft, Plug, Clock, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface IntegrationData {
  apiAvailability: string;
  apiDocumentation: string;
  authMechanisms: string;
  cloudReadiness: string;
  microservices: string;
  eventDriven: string;
  ciCd: string;
  monitoring: string;
  security: string;
  scalability: string;
  coreBusiness: string;
  integrationPriority: string;
  legacyChallenge: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

const totalSteps = 14;

export default function IntegrationReadinessPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { user, firebaseUser } = useAuth();

  const [formData, setFormData] = useState<IntegrationData>({
    apiAvailability: '', apiDocumentation: '', authMechanisms: '', cloudReadiness: '', microservices: '',
    eventDriven: '', ciCd: '', monitoring: '', security: '', scalability: '',
    coreBusiness: '', integrationPriority: '', legacyChallenge: '',
    name: user?.displayName || '', role: user?.jobTitle || '', company: user?.company || '', email: user?.email || '', phone: user?.phoneNumber || '',
  });

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: prev.name || user.displayName || '', role: prev.role || user.jobTitle || '', company: prev.company || user.company || '', email: prev.email || user.email || '', phone: prev.phone || user.phoneNumber || '' }));
  }, [user]);

  const handleInputChange = (field: keyof IntegrationData, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const isStepValid = (step: number): boolean => {
    const fields: (keyof IntegrationData)[] = ['apiAvailability', 'apiDocumentation', 'authMechanisms', 'cloudReadiness', 'microservices', 'eventDriven', 'ciCd', 'monitoring', 'security', 'scalability'];
    if (step <= 10) return formData[fields[step - 1]] !== '';
    if (step === 11) return formData.coreBusiness.trim().length >= 10;
    if (step === 12) return formData.integrationPriority.trim().length >= 10;
    if (step === 13) return formData.legacyChallenge !== '';
    if (step === 14) return formData.name.trim() !== '' && formData.email.trim() !== '' && formData.company.trim() !== '';
    return false;
  };

  const handleNext = () => { if (currentStep < totalSteps && isStepValid(currentStep)) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const getLevel = (score: number): string => {
    if (score >= 90) return 'Integration-Ready';
    if (score >= 70) return 'API-First';
    if (score >= 50) return 'Connected Systems';
    if (score >= 30) return 'Basic Integration';
    return 'Legacy Systems';
  };

  const handleSubmit = async () => {
    if (!isStepValid(totalSteps)) return;
    setLoadingResults(true);
    try {
      const submissionData = { ...formData, type: 'integration_readiness', entryPoint: 'integration_readiness_assessment', timestamp: new Date().toISOString() };
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">{assessmentResults?.score || 0}</span>
              </div>
              <CardTitle className="text-3xl text-white mb-2">Integration Readiness Score</CardTitle>
              <p className="text-xl text-cyan-400 font-semibold">{assessmentResults?.level}</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 rounded-lg mb-8">
                <h4 className="text-white font-medium mb-2">Integration Architecture Review</h4>
                <p className="text-white/70 text-sm mb-3">Laat onze experts je integratie architectuur analyseren.</p>
                <Link href="/contact"><Button className="bg-cyan-500 hover:bg-cyan-600 text-white">Plan een gesprek <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
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
    { step: 1, label: 'Welke API\'s hebben je systemen?', field: 'apiAvailability' as const, options: [
      { value: 'rest_graphql', label: 'REST + GraphQL', desc: 'Moderne API architectuur' },
      { value: 'rest_only', label: 'REST API\'s', desc: 'Standaard REST endpoints' },
      { value: 'legacy', label: 'Legacy (SOAP, etc.)', desc: 'Oudere protocollen' },
      { value: 'none', label: 'Geen API\'s', desc: 'Geen programmatische toegang' },
    ]},
    { step: 2, label: 'Hoe is je API documentatie?', field: 'apiDocumentation' as const, options: [
      { value: 'comprehensive', label: 'Uitgebreid', desc: 'OpenAPI/Swagger, voorbeelden' },
      { value: 'basic', label: 'Basis', desc: 'Endpoints gedocumenteerd' },
      { value: 'minimal', label: 'Minimaal', desc: 'Beperkte docs' },
      { value: 'none', label: 'Geen', desc: 'Niet gedocumenteerd' },
    ]},
    { step: 3, label: 'Welke authenticatie gebruik je?', field: 'authMechanisms' as const, options: [
      { value: 'oauth2', label: 'OAuth 2.0 / OIDC', desc: 'Moderne standaard' },
      { value: 'api_keys', label: 'API Keys', desc: 'Simpele authenticatie' },
      { value: 'basic_auth', label: 'Basic Auth', desc: 'Username/password' },
      { value: 'custom', label: 'Custom', desc: 'Eigen oplossing' },
    ]},
    { step: 4, label: 'Hoe cloud-ready ben je?', field: 'cloudReadiness' as const, options: [
      { value: 'cloud_native', label: 'Cloud Native', desc: 'Volledig in de cloud' },
      { value: 'hybrid', label: 'Hybrid', desc: 'Mix van cloud en on-prem' },
      { value: 'on_premise', label: 'On-premise', desc: 'Lokale servers' },
      { value: 'planning', label: 'Plannen', desc: 'Cloud migratie gepland' },
    ]},
    { step: 5, label: 'Gebruik je microservices?', field: 'microservices' as const, options: [
      { value: 'fully', label: 'Volledig', desc: 'Microservices architectuur' },
      { value: 'partially', label: 'Gedeeltelijk', desc: 'Mix van mono en micro' },
      { value: 'monolith', label: 'Monoliet', desc: 'Grote applicaties' },
      { value: 'legacy', label: 'Legacy', desc: 'Oude architectuur' },
    ]},
    { step: 6, label: 'Heb je event-driven architectuur?', field: 'eventDriven' as const, options: [
      { value: 'kafka_rabbitmq', label: 'Kafka/RabbitMQ', desc: 'Message brokers' },
      { value: 'basic_events', label: 'Basis events', desc: 'Simpele event handling' },
      { value: 'polling', label: 'Polling', desc: 'Periodiek checken' },
      { value: 'none', label: 'Geen', desc: 'Geen event architectuur' },
    ]},
    { step: 7, label: 'Hoe is je CI/CD pipeline?', field: 'ciCd' as const, options: [
      { value: 'automated', label: 'Volledig geautomatiseerd', desc: 'CI/CD voor alles' },
      { value: 'semi_automated', label: 'Semi-geautomatiseerd', desc: 'Deels automatisch' },
      { value: 'manual', label: 'Handmatig', desc: 'Handmatige deployments' },
      { value: 'none', label: 'Geen', desc: 'Geen CI/CD' },
    ]},
    { step: 8, label: 'Hoe monitor je systemen?', field: 'monitoring' as const, options: [
      { value: 'comprehensive', label: 'Uitgebreid', desc: 'APM, logging, tracing' },
      { value: 'basic', label: 'Basis', desc: 'Uptime monitoring' },
      { value: 'logs_only', label: 'Alleen logs', desc: 'Logfiles bekijken' },
      { value: 'none', label: 'Geen', desc: 'Geen monitoring' },
    ]},
    { step: 9, label: 'Wat is je security model?', field: 'security' as const, options: [
      { value: 'zero_trust', label: 'Zero Trust', desc: 'Nooit vertrouwen, altijd verifiëren' },
      { value: 'perimeter', label: 'Perimeter', desc: 'Firewall-gebaseerd' },
      { value: 'basic', label: 'Basis', desc: 'Standaard beveiliging' },
      { value: 'minimal', label: 'Minimaal', desc: 'Beperkte security' },
    ]},
    { step: 10, label: 'Hoe schaalbaar zijn je systemen?', field: 'scalability' as const, options: [
      { value: 'auto_scaling', label: 'Auto-scaling', desc: 'Automatisch schalen' },
      { value: 'manual_scaling', label: 'Handmatig schalen', desc: 'Servers toevoegen' },
      { value: 'limited', label: 'Beperkt', desc: 'Moeilijk te schalen' },
      { value: 'not_possible', label: 'Niet mogelijk', desc: 'Kan niet schalen' },
    ]},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 mb-6">
            <Plug className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Integration Readiness Check</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">Evalueer of je tech stack klaar is voor AI integraties.</p>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2"><span>Vraag {currentStep} van {totalSteps}</span><span>{Math.round(progress)}%</span></div>
          <div className="w-full bg-white/10 rounded-full h-2"><motion.div className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full" animate={{ width: `${progress}%` }} /></div>
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

                {currentStep === 11 && <div className="space-y-6"><Label className="text-xl font-semibold text-white">Beschrijf je huidige systemen en architectuur</Label><Textarea value={formData.coreBusiness} onChange={(e) => handleInputChange('coreBusiness', e.target.value)} placeholder="Welke systemen gebruik je en hoe zijn ze gekoppeld?" className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" /></div>}
                {currentStep === 12 && <div className="space-y-6"><Label className="text-xl font-semibold text-white">Welke integratie heeft de hoogste prioriteit?</Label><Textarea value={formData.integrationPriority} onChange={(e) => handleInputChange('integrationPriority', e.target.value)} placeholder="Welk systeem wil je als eerste koppelen aan AI?" className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" /></div>}
                {currentStep === 13 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wat is je grootste legacy uitdaging?</Label>
                    <RadioGroup value={formData.legacyChallenge} onValueChange={(value) => handleInputChange('legacyChallenge', value)} className="space-y-3">
                      {[{ value: 'no_api', label: 'Geen API\'s', desc: 'Systemen zonder interfaces' }, { value: 'old_tech', label: 'Oude technologie', desc: 'Verouderde systemen' }, { value: 'vendor_lock', label: 'Vendor lock-in', desc: 'Afhankelijk van leverancier' }, { value: 'no_docs', label: 'Geen documentatie', desc: 'Kennis verloren' }, { value: 'none', label: 'Geen', desc: 'Geen legacy issues' }].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <RadioGroupItem value={option.value} id={`legacy-${option.value}`} className="mt-1" />
                          <div><Label htmlFor={`legacy-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label><p className="text-white/60 text-sm">{option.desc}</p></div>
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
                <Button onClick={handleNext} disabled={!isStepValid(currentStep)} className="bg-cyan-500 hover:bg-cyan-600 text-white">Volgende <ArrowRight className="w-4 h-4 ml-2" /></Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid(currentStep) || loadingResults} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
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
