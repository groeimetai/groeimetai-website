'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, ArrowRight, ArrowLeft, Database, Shield, Clock, FileText, Loader2, Download, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';

interface DataReadinessData {
  // Data Quality Questions (10 questions)
  dataQuality: string;
  dataGovernance: string;
  dataAccessibility: string;
  dataDocumentation: string;
  dataPrivacy: string;
  dataPipelines: string;
  dataLiteracy: string;
  dataVolume: string;
  dataVariety: string;
  realTimeData: string;
  // Business Context
  coreBusiness: string;
  mainChallenge: string;
  priorityArea: string;
  // Contact info
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

const totalSteps = 14;

export default function DataReadinessAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultsReady, setResultsReady] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { user, firebaseUser } = useAuth();

  const [formData, setFormData] = useState<DataReadinessData>({
    dataQuality: '',
    dataGovernance: '',
    dataAccessibility: '',
    dataDocumentation: '',
    dataPrivacy: '',
    dataPipelines: '',
    dataLiteracy: '',
    dataVolume: '',
    dataVariety: '',
    realTimeData: '',
    coreBusiness: '',
    mainChallenge: '',
    priorityArea: '',
    name: user?.displayName || user?.firstName || '',
    role: user?.jobTitle || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
  });

  // Update form data when user data becomes available
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

  const handleInputChange = (field: keyof DataReadinessData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return formData.dataQuality !== '';
      case 2: return formData.dataGovernance !== '';
      case 3: return formData.dataAccessibility !== '';
      case 4: return formData.dataDocumentation !== '';
      case 5: return formData.dataPrivacy !== '';
      case 6: return formData.dataPipelines !== '';
      case 7: return formData.dataLiteracy !== '';
      case 8: return formData.dataVolume !== '';
      case 9: return formData.dataVariety !== '';
      case 10: return formData.realTimeData !== '';
      case 11: return formData.coreBusiness.trim().length >= 10;
      case 12: return formData.mainChallenge.trim().length >= 10;
      case 13: return formData.priorityArea !== '';
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

  const pollAssessmentResults = async (assessmentId: string, initialScore: number) => {
    let attempts = 0;
    const maxAttempts = 12;

    const poll = async () => {
      attempts++;
      try {
        const response = await fetch(`/api/assessment/get-by-id?assessmentId=${assessmentId}&type=data_readiness`);
        const data = await response.json();

        if (data.success && data.assessment) {
          if (data.assessment.report && data.assessment.status === 'ready') {
            setAssessmentResults({
              ...data.assessment,
              score: data.assessment.report.score || initialScore
            });
            setResultsReady(true);
            setLoadingResults(false);
          } else if (attempts < maxAttempts) {
            setTimeout(poll, 5000);
          } else {
            setAssessmentResults({
              score: initialScore,
              level: getLevel(initialScore),
              status: 'timeout'
            });
            setResultsReady(true);
            setLoadingResults(false);
          }
        } else if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };

    setTimeout(poll, 3000);
  };

  const getLevel = (score: number): string => {
    if (score >= 90) return 'Data-Ready';
    if (score >= 70) return 'Data-Mature';
    if (score >= 50) return 'Data-Developing';
    if (score >= 30) return 'Data-Foundation';
    return 'Data-Starting';
  };

  const handleSubmit = async () => {
    if (!isStepValid(totalSteps)) return;

    setLoadingResults(true);
    setSubmissionError(null);

    try {
      const submissionData = {
        ...formData,
        type: 'data_readiness',
        entryPoint: 'data_readiness_assessment',
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
        if (result.assessmentId) {
          pollAssessmentResults(result.assessmentId, result.previewScore || 50);
        }
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

  // Render results page
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {loadingResults ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">
                    AI analyseert je data readiness...
                  </h2>
                  <p className="text-white/70 mb-8">
                    We genereren een gepersonaliseerd rapport met concrete aanbevelingen.
                    Dit duurt ongeveer 30-60 seconden.
                  </p>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 60, ease: 'linear' }}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : resultsReady && assessmentResults ? (
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="text-center pb-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-white">{assessmentResults.score || assessmentResults.report?.score}</span>
                  </div>
                  <CardTitle className="text-3xl text-white mb-2">
                    Data Readiness Score
                  </CardTitle>
                  <p className="text-xl text-blue-400 font-semibold">
                    {assessmentResults.level || getLevel(assessmentResults.score || assessmentResults.report?.score)}
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  {assessmentResults.report?.executiveSummary && (
                    <div className="mb-8 p-6 bg-white/5 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-3">Executive Summary</h3>
                      <p className="text-white/80 leading-relaxed">
                        {assessmentResults.report.executiveSummary}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Mail className="w-5 h-5 text-blue-400 mr-2" />
                        <span className="text-white font-medium">Volledig rapport</span>
                      </div>
                      <p className="text-white/60 text-sm">
                        Is verstuurd naar {formData.email}
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Download className="w-5 h-5 text-blue-400 mr-2" />
                        <span className="text-white font-medium">PDF Download</span>
                      </div>
                      <p className="text-white/60 text-sm">
                        Beschikbaar in je dashboard
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Aanbevolen Vervolgstappen</h3>
                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Data Strategie Sessie</h4>
                      <p className="text-white/70 text-sm mb-3">
                        Bespreek je resultaten met onze data experts en krijg een concrete roadmap.
                      </p>
                      <Link href="/contact">
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                          Plan een gesprek
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <Link href="/dashboard" className="flex-1">
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        Naar Dashboard
                      </Button>
                    </Link>
                    <Link href="/assessments" className="flex-1">
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        Meer Assessments
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Bedankt voor je inzending!
                  </h2>
                  <p className="text-white/70">
                    Je ontvangt je resultaten per e-mail.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Render form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-6">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Data Readiness Assessment
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Ontdek of je data klaar is voor AI en krijg een gepersonaliseerd rapport met concrete aanbevelingen.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-white/60">
            <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 5-7 minuten</span>
            <span className="flex items-center"><FileText className="w-4 h-4 mr-2" /> AI-gegenereerd rapport</span>
            <span className="flex items-center"><Shield className="w-4 h-4 mr-2" /> Gratis</span>
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Vraag {currentStep} van {totalSteps}</span>
            <span>{Math.round(progress)}% voltooid</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Data Quality */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Hoe zou je de algemene kwaliteit van je data omschrijven?
                    </Label>
                    <RadioGroup
                      value={formData.dataQuality}
                      onValueChange={(value) => handleInputChange('dataQuality', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'excellent', label: 'Uitstekend - Schoon, consistent en betrouwbaar', desc: 'Data is gevalideerd en regelmatig geaudit' },
                        { value: 'good', label: 'Goed - Over het algemeen betrouwbaar', desc: 'Enkele inconsistenties maar bruikbaar' },
                        { value: 'moderate', label: 'Matig - Vereist vaak opschoning', desc: 'Regelmatig kwaliteitsproblemen' },
                        { value: 'poor', label: 'Slecht - Veel kwaliteitsproblemen', desc: 'Data is onbetrouwbaar of incompleet' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                          <div>
                            <Label htmlFor={option.value} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 2: Data Governance */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Hoe volwassen is je data governance?
                    </Label>
                    <RadioGroup
                      value={formData.dataGovernance}
                      onValueChange={(value) => handleInputChange('dataGovernance', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'mature', label: 'Volwassen - Formeel framework met data stewards', desc: 'Duidelijke eigenaarschap, policies en procedures' },
                        { value: 'developing', label: 'In ontwikkeling - Bezig met implementatie', desc: 'Sommige processen gedefinieerd, andere in progress' },
                        { value: 'basic', label: 'Basis - Informele regels', desc: 'Ad-hoc afspraken zonder formeel framework' },
                        { value: 'none', label: 'Geen - Geen governance', desc: 'Geen duidelijke eigenaarschap of regels' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`gov-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`gov-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 3: Data Accessibility */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Hoe toegankelijk is je data voor verschillende teams?
                    </Label>
                    <RadioGroup
                      value={formData.dataAccessibility}
                      onValueChange={(value) => handleInputChange('dataAccessibility', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'centralized', label: 'Gecentraliseerd - Data warehouse/lake', desc: 'Alle data op één plek met self-service toegang' },
                        { value: 'multiple_sources', label: 'Meerdere bronnen - Geconnecteerd', desc: 'Data verspreid maar wel gekoppeld' },
                        { value: 'siloed', label: 'Gesilo\'d - Moeilijk te combineren', desc: 'Data in aparte systemen zonder integratie' },
                        { value: 'manual', label: 'Handmatig - Export/import vereist', desc: 'Data ophalen vereist handmatige acties' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`access-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`access-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 4: Data Documentation */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Hoe goed is je data gedocumenteerd?
                    </Label>
                    <RadioGroup
                      value={formData.dataDocumentation}
                      onValueChange={(value) => handleInputChange('dataDocumentation', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'comprehensive', label: 'Uitgebreid - Data catalog met metadata', desc: 'Volledige documentatie, data dictionary, lineage' },
                        { value: 'partial', label: 'Gedeeltelijk - Belangrijkste data gedocumenteerd', desc: 'Kerndata beschreven, maar niet alles' },
                        { value: 'minimal', label: 'Minimaal - Alleen op aanvraag', desc: 'Beperkte documentatie, kennis in hoofden' },
                        { value: 'none', label: 'Geen - Geen documentatie', desc: 'Geen formele documentatie aanwezig' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`doc-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`doc-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 5: Data Privacy */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Hoe staat het met data privacy en GDPR compliance?
                    </Label>
                    <RadioGroup
                      value={formData.dataPrivacy}
                      onValueChange={(value) => handleInputChange('dataPrivacy', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'gdpr_compliant', label: 'Volledig GDPR compliant', desc: 'Alle processen en systemen voldoen aan wetgeving' },
                        { value: 'partially_compliant', label: 'Grotendeels compliant', desc: 'Belangrijkste zaken op orde, enkele verbeterpunten' },
                        { value: 'working_on_it', label: 'Bezig met compliance', desc: 'Actief bezig met implementatie' },
                        { value: 'not_compliant', label: 'Niet compliant', desc: 'Privacy nog niet goed geregeld' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`privacy-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`privacy-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 6: Data Pipelines */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Hoe zijn je data pipelines georganiseerd?
                    </Label>
                    <RadioGroup
                      value={formData.dataPipelines}
                      onValueChange={(value) => handleInputChange('dataPipelines', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'automated', label: 'Volledig geautomatiseerd - CI/CD voor data', desc: 'ETL/ELT pipelines met monitoring en alerting' },
                        { value: 'semi_automated', label: 'Semi-geautomatiseerd', desc: 'Sommige pipelines automatisch, andere handmatig' },
                        { value: 'manual', label: 'Handmatig - Scripts en exports', desc: 'Data wordt handmatig verplaatst en getransformeerd' },
                        { value: 'none', label: 'Geen pipelines', desc: 'Data flows zijn niet gedefinieerd' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`pipe-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`pipe-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 7: Data Literacy */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Hoe hoog is de data literacy in je organisatie?
                    </Label>
                    <RadioGroup
                      value={formData.dataLiteracy}
                      onValueChange={(value) => handleInputChange('dataLiteracy', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'high', label: 'Hoog - Data-driven cultuur', desc: 'Medewerkers kunnen zelf data analyseren en interpreteren' },
                        { value: 'medium', label: 'Gemiddeld - Basiskennis aanwezig', desc: 'Sommige teams data-savvy, andere minder' },
                        { value: 'low', label: 'Laag - Afhankelijk van specialisten', desc: 'Alleen IT/BI kan met data werken' },
                        { value: 'very_low', label: 'Zeer laag - Geen data skills', desc: 'Nauwelijks data kennis in de organisatie' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`lit-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`lit-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 8: Data Volume */}
                {currentStep === 8 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Hoeveel data verwerk je typisch?
                    </Label>
                    <RadioGroup
                      value={formData.dataVolume}
                      onValueChange={(value) => handleInputChange('dataVolume', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'big_data', label: 'Big Data - Terabytes+', desc: 'Grote volumes, distributed processing nodig' },
                        { value: 'medium', label: 'Medium - Gigabytes', desc: 'Aanzienlijke hoeveelheid, standaard tools voldoen' },
                        { value: 'small', label: 'Klein - Megabytes', desc: 'Beperkte volumes, Excel/spreadsheets werkbaar' },
                        { value: 'minimal', label: 'Minimaal', desc: 'Zeer weinig gestructureerde data' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`vol-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`vol-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 9: Data Variety */}
                {currentStep === 9 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Wat voor soort data heb je voornamelijk?
                    </Label>
                    <RadioGroup
                      value={formData.dataVariety}
                      onValueChange={(value) => handleInputChange('dataVariety', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'structured_unstructured', label: 'Zowel gestructureerd als ongestructureerd', desc: 'Databases, documenten, images, logs, etc.' },
                        { value: 'mainly_structured', label: 'Voornamelijk gestructureerd', desc: 'Databases, spreadsheets, CRM data' },
                        { value: 'mainly_unstructured', label: 'Voornamelijk ongestructureerd', desc: 'Documenten, emails, afbeeldingen' },
                        { value: 'mixed_chaos', label: 'Gemengd zonder structuur', desc: 'Diverse bronnen zonder duidelijke ordening' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`var-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`var-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 10: Real-time Data */}
                {currentStep === 10 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Heb je real-time data nodig of beschikbaar?
                    </Label>
                    <RadioGroup
                      value={formData.realTimeData}
                      onValueChange={(value) => handleInputChange('realTimeData', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'yes', label: 'Ja - Real-time streaming', desc: 'Kafka, event streams, live dashboards' },
                        { value: 'partial', label: 'Gedeeltelijk - Near real-time', desc: 'Updates binnen minuten/uren' },
                        { value: 'batch_only', label: 'Alleen batch - Dagelijks/wekelijks', desc: 'Scheduled updates, geen streaming' },
                        { value: 'no', label: 'Nee - Niet relevant', desc: 'Real-time data is niet nodig' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`rt-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`rt-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 11: Core Business */}
                {currentStep === 11 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Beschrijf kort je kernactiviteiten
                    </Label>
                    <p className="text-white/60">
                      Wat doet je bedrijf en welke data is daarbij het meest cruciaal?
                    </p>
                    <Textarea
                      value={formData.coreBusiness}
                      onChange={(e) => handleInputChange('coreBusiness', e.target.value)}
                      placeholder="Bijv: We zijn een e-commerce platform met 100K+ producten. Onze belangrijkste data zijn klantgedrag, bestellingen en voorraad..."
                      className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                    <p className="text-white/40 text-sm">Minimaal 10 karakters</p>
                  </div>
                )}

                {/* Step 12: Main Challenge */}
                {currentStep === 12 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Wat is je grootste data uitdaging?
                    </Label>
                    <p className="text-white/60">
                      Beschrijf het belangrijkste probleem dat je wilt oplossen met betere data.
                    </p>
                    <Textarea
                      value={formData.mainChallenge}
                      onChange={(e) => handleInputChange('mainChallenge', e.target.value)}
                      placeholder="Bijv: We kunnen geen 360-graden klantbeeld maken omdat data verspreid is over 5 verschillende systemen..."
                      className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                    <p className="text-white/40 text-sm">Minimaal 10 karakters</p>
                  </div>
                )}

                {/* Step 13: Priority Area */}
                {currentStep === 13 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Welk gebied heeft de hoogste prioriteit?
                    </Label>
                    <RadioGroup
                      value={formData.priorityArea}
                      onValueChange={(value) => handleInputChange('priorityArea', value)}
                      className="space-y-3"
                    >
                      {[
                        { value: 'quality', label: 'Data kwaliteit verbeteren', desc: 'Schonere, betrouwbaardere data' },
                        { value: 'integration', label: 'Data integratie', desc: 'Systemen koppelen, silo\'s doorbreken' },
                        { value: 'analytics', label: 'Analytics & BI', desc: 'Betere inzichten en rapportages' },
                        { value: 'ai_ml', label: 'AI/ML readiness', desc: 'Data gereed maken voor machine learning' },
                        { value: 'governance', label: 'Governance & compliance', desc: 'Beleid, privacy en beveiliging' },
                        { value: 'infrastructure', label: 'Data infrastructuur', desc: 'Platform, tools en architectuur' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option.value} id={`prio-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`prio-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label>
                            <p className="text-white/60 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 14: Contact Info */}
                {currentStep === 14 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">
                      Waar mogen we je rapport naartoe sturen?
                    </Label>
                    <p className="text-white/60 mb-4">
                      Je ontvangt een uitgebreid AI-gegenereerd rapport met concrete aanbevelingen.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Naam *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Je volledige naam"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">E-mail *</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="je@bedrijf.nl"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Bedrijf *</Label>
                        <Input
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Bedrijfsnaam"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Functie</Label>
                        <Input
                          value={formData.role}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                          placeholder="Je functietitel"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-white">Telefoon</Label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+31 6 12345678"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
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

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Vorige
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Volgende
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep) || loadingResults}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  {loadingResults ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verzenden...
                    </>
                  ) : (
                    <>
                      Verstuur & Ontvang Rapport
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
