'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, ArrowRight, ArrowLeft, Shield, Clock, FileText, Loader2, Download, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';

interface AISecurityData {
  aiActAwareness: string;
  riskClassification: string;
  dataProtection: string;
  modelTransparency: string;
  biasAudit: string;
  securityFramework: string;
  incidentResponse: string;
  vendorAssessment: string;
  humanOversight: string;
  trainingData: string;
  coreBusiness: string;
  mainConcern: string;
  complianceDeadline: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

const totalSteps = 14;

export default function AISecurityAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultsReady, setResultsReady] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { user, firebaseUser } = useAuth();

  const [formData, setFormData] = useState<AISecurityData>({
    aiActAwareness: '',
    riskClassification: '',
    dataProtection: '',
    modelTransparency: '',
    biasAudit: '',
    securityFramework: '',
    incidentResponse: '',
    vendorAssessment: '',
    humanOversight: '',
    trainingData: '',
    coreBusiness: '',
    mainConcern: '',
    complianceDeadline: '',
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

  const handleInputChange = (field: keyof AISecurityData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return formData.aiActAwareness !== '';
      case 2: return formData.riskClassification !== '';
      case 3: return formData.dataProtection !== '';
      case 4: return formData.modelTransparency !== '';
      case 5: return formData.biasAudit !== '';
      case 6: return formData.securityFramework !== '';
      case 7: return formData.incidentResponse !== '';
      case 8: return formData.vendorAssessment !== '';
      case 9: return formData.humanOversight !== '';
      case 10: return formData.trainingData !== '';
      case 11: return formData.coreBusiness.trim().length >= 10;
      case 12: return formData.mainConcern.trim().length >= 10;
      case 13: return formData.complianceDeadline !== '';
      case 14: return formData.name.trim() !== '' && formData.email.trim() !== '' && formData.company.trim() !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getLevel = (score: number): string => {
    if (score >= 90) return 'Fully Compliant';
    if (score >= 70) return 'Mostly Compliant';
    if (score >= 50) return 'Developing Compliance';
    if (score >= 30) return 'Basic Security';
    return 'Non-Compliant';
  };

  const handleSubmit = async () => {
    if (!isStepValid(totalSteps)) return;
    setLoadingResults(true);
    setSubmissionError(null);

    try {
      const submissionData = {
        ...formData,
        type: 'ai_security',
        entryPoint: 'ai_security_assessment',
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
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
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
      console.error('Submission error:', error);
      setSubmissionError('Er is een fout opgetreden. Probeer het opnieuw.');
      setLoadingResults(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="text-center pb-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">{assessmentResults?.score || 0}</span>
                </div>
                <CardTitle className="text-3xl text-white mb-2">AI Security Score</CardTitle>
                <p className="text-xl text-green-400 font-semibold">{assessmentResults?.level}</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Mail className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-white font-medium">Volledig rapport</span>
                    </div>
                    <p className="text-white/60 text-sm">Is verstuurd naar {formData.email}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Download className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-white font-medium">PDF Download</span>
                    </div>
                    <p className="text-white/60 text-sm">Beschikbaar in je dashboard</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Compliance Audit</h4>
                    <p className="text-white/70 text-sm mb-3">Laat onze experts je volledige AI compliance status doorlichten.</p>
                    <Link href="/contact">
                      <Button className="bg-green-500 hover:bg-green-600 text-white">
                        Plan een gesprek <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="mt-8 flex gap-4">
                  <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">Naar Dashboard</Button>
                  </Link>
                  <Link href="/assessments" className="flex-1">
                    <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">Meer Assessments</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const questions = [
    {
      step: 1,
      label: 'Hoe bekend ben je met de EU AI Act?',
      field: 'aiActAwareness' as const,
      options: [
        { value: 'fully_aware', label: 'Volledig op de hoogte', desc: 'Ken de vereisten en deadlines' },
        { value: 'partially_aware', label: 'Gedeeltelijk bekend', desc: 'Weet de grote lijnen' },
        { value: 'heard_of_it', label: 'Heb ervan gehoord', desc: 'Nog niet echt verdiept' },
        { value: 'not_aware', label: 'Niet bekend', desc: 'Weet er weinig van' },
      ]
    },
    {
      step: 2,
      label: 'Heb je je AI-systemen geclassificeerd op risico?',
      field: 'riskClassification' as const,
      options: [
        { value: 'mapped', label: 'Ja, volledig in kaart', desc: 'Alle AI-systemen geclassificeerd' },
        { value: 'partially_mapped', label: 'Gedeeltelijk', desc: 'Sommige systemen in kaart' },
        { value: 'planned', label: 'Gepland', desc: 'Staat op de roadmap' },
        { value: 'not_started', label: 'Nog niet begonnen', desc: 'Geen classificatie gedaan' },
      ]
    },
    {
      step: 3,
      label: 'Hoe staat het met je GDPR/AVG compliance?',
      field: 'dataProtection' as const,
      options: [
        { value: 'gdpr_compliant', label: 'Volledig GDPR compliant', desc: 'DPO, DPIA\'s, verwerkersovereenkomsten' },
        { value: 'partially_compliant', label: 'Grotendeels compliant', desc: 'Belangrijkste zaken geregeld' },
        { value: 'working_on_it', label: 'Bezig met implementatie', desc: 'Actief aan het werken' },
        { value: 'not_compliant', label: 'Niet compliant', desc: 'Privacy nog niet op orde' },
      ]
    },
    {
      step: 4,
      label: 'Hoe transparant zijn je AI-modellen?',
      field: 'modelTransparency' as const,
      options: [
        { value: 'explainable', label: 'Explainable AI', desc: 'Beslissingen zijn uitlegbaar' },
        { value: 'documented', label: 'Gedocumenteerd', desc: 'Werking is beschreven' },
        { value: 'black_box', label: 'Black box', desc: 'Weinig inzicht in werking' },
        { value: 'unknown', label: 'Onbekend', desc: 'Weten we niet' },
      ]
    },
    {
      step: 5,
      label: 'Voer je bias audits uit op AI-systemen?',
      field: 'biasAudit' as const,
      options: [
        { value: 'regular_audits', label: 'Regelmatige audits', desc: 'Periodieke controles' },
        { value: 'occasional', label: 'Incidenteel', desc: 'Af en toe gecontroleerd' },
        { value: 'planned', label: 'Gepland', desc: 'Gaan we doen' },
        { value: 'never', label: 'Nooit', desc: 'Geen bias controles' },
      ]
    },
    {
      step: 6,
      label: 'Welk security framework gebruik je?',
      field: 'securityFramework' as const,
      options: [
        { value: 'iso27001', label: 'ISO 27001 gecertificeerd', desc: 'Internationale standaard' },
        { value: 'soc2', label: 'SOC 2 compliant', desc: 'Amerikaanse standaard' },
        { value: 'custom', label: 'Eigen framework', desc: 'Intern ontwikkeld' },
        { value: 'none', label: 'Geen framework', desc: 'Geen formeel framework' },
      ]
    },
    {
      step: 7,
      label: 'Heb je een AI incident response plan?',
      field: 'incidentResponse' as const,
      options: [
        { value: 'mature', label: 'Volwassen plan', desc: 'Getest en gedocumenteerd' },
        { value: 'basic', label: 'Basisplan', desc: 'Simpele procedures' },
        { value: 'planned', label: 'In ontwikkeling', desc: 'Wordt aan gewerkt' },
        { value: 'none', label: 'Geen plan', desc: 'Niet aanwezig' },
      ]
    },
    {
      step: 8,
      label: 'Hoe beoordeel je AI-leveranciers?',
      field: 'vendorAssessment' as const,
      options: [
        { value: 'thorough', label: 'Grondig assessment', desc: 'Security reviews, audits' },
        { value: 'basic', label: 'Basis controles', desc: 'Certficaten gecheckt' },
        { value: 'trust_based', label: 'Op vertrouwen', desc: 'Grote namen = veilig' },
        { value: 'none', label: 'Geen controle', desc: 'Niet gecontroleerd' },
      ]
    },
    {
      step: 9,
      label: 'Is er menselijk toezicht op AI-beslissingen?',
      field: 'humanOversight' as const,
      options: [
        { value: 'always', label: 'Altijd', desc: 'Alle beslissingen worden gecontroleerd' },
        { value: 'critical_decisions', label: 'Kritieke beslissingen', desc: 'Belangrijke beslissingen gecontroleerd' },
        { value: 'minimal', label: 'Minimaal', desc: 'Weinig controle' },
        { value: 'none', label: 'Geen', desc: 'AI beslist autonoom' },
      ]
    },
    {
      step: 10,
      label: 'Zijn je trainingsdata geaudit?',
      field: 'trainingData' as const,
      options: [
        { value: 'audited', label: 'Volledig geaudit', desc: 'Kwaliteit en bias gecontroleerd' },
        { value: 'partially_audited', label: 'Gedeeltelijk', desc: 'Sommige datasets gecontroleerd' },
        { value: 'not_audited', label: 'Niet geaudit', desc: 'Geen controles uitgevoerd' },
        { value: 'unknown', label: 'Onbekend', desc: 'Weten we niet' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">AI Security & Compliance Scan</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">Check je compliance met de EU AI Act en krijg concrete aanbevelingen.</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-white/60">
            <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 6-8 minuten</span>
            <span className="flex items-center"><FileText className="w-4 h-4 mr-2" /> AI-gegenereerd rapport</span>
            <span className="flex items-center"><Shield className="w-4 h-4 mr-2" /> Gratis</span>
          </div>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Vraag {currentStep} van {totalSteps}</span>
            <span>{Math.round(progress)}% voltooid</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
          </div>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {currentStep <= 10 && questions[currentStep - 1] && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">{questions[currentStep - 1].label}</Label>
                    <RadioGroup
                      value={formData[questions[currentStep - 1].field]}
                      onValueChange={(value) => handleInputChange(questions[currentStep - 1].field, value)}
                      className="space-y-3"
                    >
                      {questions[currentStep - 1].options.map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
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

                {currentStep === 11 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Beschrijf kort je organisatie en AI-gebruik</Label>
                    <Textarea value={formData.coreBusiness} onChange={(e) => handleInputChange('coreBusiness', e.target.value)} placeholder="Welke AI-systemen gebruik je en waarvoor?" className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                )}

                {currentStep === 12 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wat is je grootste security/compliance zorg?</Label>
                    <Textarea value={formData.mainConcern} onChange={(e) => handleInputChange('mainConcern', e.target.value)} placeholder="Bijv: We weten niet of onze chatbot voldoet aan de EU AI Act..." className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                )}

                {currentStep === 13 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wanneer wil je compliant zijn?</Label>
                    <RadioGroup value={formData.complianceDeadline} onValueChange={(value) => handleInputChange('complianceDeadline', value)} className="space-y-3">
                      {[
                        { value: 'asap', label: 'Zo snel mogelijk', desc: 'Hoge prioriteit' },
                        { value: '6_months', label: 'Binnen 6 maanden', desc: 'Ruim voor deadline' },
                        { value: '12_months', label: 'Binnen 12 maanden', desc: 'Op tijd voor EU AI Act' },
                        { value: 'no_deadline', label: 'Geen specifieke deadline', desc: 'Wanneer nodig' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`deadline-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`deadline-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
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
                    {submissionError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400">{submissionError}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="border-white/20 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" /> Vorige
              </Button>
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={!isStepValid(currentStep)} className="bg-green-500 hover:bg-green-600 text-white">
                  Volgende <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid(currentStep) || loadingResults} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
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
