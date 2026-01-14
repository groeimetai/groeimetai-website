'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { CheckCircle, ArrowRight, ArrowLeft, Calculator, Clock, FileText, Loader2, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ROIData {
  employeeCount: number;
  avgSalary: number;
  processHoursWeekly: number;
  errorCostMonthly: number;
  customerServiceCalls: number;
  avgCallDuration: number;
  manualDataEntry: number;
  complianceCost: number;
  targetAutomation: number;
  implementationTimeline: string;
  coreBusiness: string;
  primaryGoal: string;
  budgetRange: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

const totalSteps = 14;

export default function ROICalculatorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { user, firebaseUser } = useAuth();

  const [formData, setFormData] = useState<ROIData>({
    employeeCount: 50,
    avgSalary: 50000,
    processHoursWeekly: 20,
    errorCostMonthly: 5000,
    customerServiceCalls: 500,
    avgCallDuration: 10,
    manualDataEntry: 30,
    complianceCost: 10000,
    targetAutomation: 50,
    implementationTimeline: '',
    coreBusiness: '',
    primaryGoal: '',
    budgetRange: '',
    name: user?.displayName || '',
    role: user?.jobTitle || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
  });

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: prev.name || user.displayName || '', role: prev.role || user.jobTitle || '', company: prev.company || user.company || '', email: prev.email || user.email || '', phone: prev.phone || user.phoneNumber || '' }));
  }, [user]);

  const handleInputChange = (field: keyof ROIData, value: string | number) => setFormData(prev => ({ ...prev, [field]: value }));

  const isStepValid = (step: number): boolean => {
    if (step <= 9) return true; // Number inputs always valid
    if (step === 10) return formData.implementationTimeline !== '';
    if (step === 11) return formData.coreBusiness.trim().length >= 10;
    if (step === 12) return formData.primaryGoal !== '';
    if (step === 13) return formData.budgetRange !== '';
    if (step === 14) return formData.name.trim() !== '' && formData.email.trim() !== '' && formData.company.trim() !== '';
    return false;
  };

  const handleNext = () => { if (currentStep < totalSteps && isStepValid(currentStep)) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  // Calculate ROI
  const calculateROI = () => {
    const hourlyRate = formData.avgSalary / 2080; // Annual hours
    const weeklyLaborSavings = formData.processHoursWeekly * (formData.targetAutomation / 100) * hourlyRate;
    const annualLaborSavings = weeklyLaborSavings * 52;
    const annualErrorSavings = formData.errorCostMonthly * 12 * (formData.targetAutomation / 100);
    const callSavings = (formData.customerServiceCalls * formData.avgCallDuration / 60) * hourlyRate * 12 * 0.4;
    const totalAnnualSavings = annualLaborSavings + annualErrorSavings + callSavings;

    const implementationCost = formData.employeeCount < 50 ? 25000 : formData.employeeCount < 200 ? 75000 : 150000;
    const paybackMonths = (implementationCost / totalAnnualSavings) * 12;
    const threeYearROI = ((totalAnnualSavings * 3 - implementationCost) / implementationCost) * 100;

    return { totalAnnualSavings: Math.round(totalAnnualSavings), implementationCost, paybackMonths: Math.round(paybackMonths), threeYearROI: Math.round(threeYearROI) };
  };

  const handleSubmit = async () => {
    if (!isStepValid(totalSteps)) return;
    setLoadingResults(true);
    try {
      const roi = calculateROI();
      const submissionData = { ...formData, type: 'roi_calculator', entryPoint: 'roi_calculator_assessment', calculatedROI: roi, timestamp: new Date().toISOString() };
      let idToken = null;
      if (firebaseUser) { try { idToken = await firebaseUser.getIdToken(); (submissionData as any).firebaseIdToken = idToken; (submissionData as any).userId = firebaseUser.uid; } catch {} }
      const response = await fetch('/api/assessment/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) }, body: JSON.stringify(submissionData) });
      const result = await response.json();
      if (result.success) { setIsSubmitted(true); setAssessmentResults({ score: result.previewScore, roi }); }
      else setSubmissionError(result.error || 'Er is iets misgegaan');
    } catch { setSubmissionError('Er is een fout opgetreden.'); }
    setLoadingResults(false);
  };

  const progress = (currentStep / totalSteps) * 100;
  const roi = calculateROI();

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="text-center pb-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-3xl text-white mb-2">Je AI ROI Berekening</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-lg text-center">
                  <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Jaarlijkse Besparing</p>
                  <p className="text-3xl font-bold text-white">€{assessmentResults?.roi?.totalAnnualSavings?.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-lg text-center">
                  <Percent className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">3-jaars ROI</p>
                  <p className="text-3xl font-bold text-white">{assessmentResults?.roi?.threeYearROI}%</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
                  <Clock className="w-8 h-8 text-white/60 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Terugverdientijd</p>
                  <p className="text-2xl font-bold text-white">{assessmentResults?.roi?.paybackMonths} maanden</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
                  <Calculator className="w-8 h-8 text-white/60 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Implementatie Investering</p>
                  <p className="text-2xl font-bold text-white">€{assessmentResults?.roi?.implementationCost?.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-lg mb-8">
                <h4 className="text-white font-medium mb-2">Business Case Development</h4>
                <p className="text-white/70 text-sm mb-3">Laat ons een gedetailleerde business case opstellen voor je management.</p>
                <Link href="/contact"><Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Plan een gesprek <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 mb-6">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">AI ROI Calculator</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">Bereken de concrete besparingen en ROI van AI implementatie.</p>
        </motion.div>

        {/* Live ROI Preview */}
        <div className="mb-8 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-white/60 text-xs">Jaarlijkse Besparing</p><p className="text-lg font-bold text-white">€{roi.totalAnnualSavings.toLocaleString()}</p></div>
            <div><p className="text-white/60 text-xs">Terugverdientijd</p><p className="text-lg font-bold text-white">{roi.paybackMonths} mnd</p></div>
            <div><p className="text-white/60 text-xs">3-jaars ROI</p><p className="text-lg font-bold text-emerald-400">{roi.threeYearROI}%</p></div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2"><span>Stap {currentStep} van {totalSteps}</span><span>{Math.round(progress)}%</span></div>
          <div className="w-full bg-white/10 rounded-full h-2"><motion.div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full" animate={{ width: `${progress}%` }} /></div>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Hoeveel medewerkers heeft je organisatie?</Label>
                    <div className="space-y-4">
                      <Input type="number" value={formData.employeeCount} onChange={(e) => handleInputChange('employeeCount', parseInt(e.target.value) || 0)} className="bg-white/5 border-white/20 text-white text-2xl text-center py-4" />
                      <p className="text-white/60 text-center">medewerkers</p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wat is het gemiddelde jaarsalaris?</Label>
                    <div className="space-y-4">
                      <Input type="number" value={formData.avgSalary} onChange={(e) => handleInputChange('avgSalary', parseInt(e.target.value) || 0)} className="bg-white/5 border-white/20 text-white text-2xl text-center py-4" />
                      <p className="text-white/60 text-center">€ per jaar (incl. werkgeverslasten)</p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Hoeveel uur per week gaat naar repetitieve processen?</Label>
                    <div className="space-y-4">
                      <Slider value={[formData.processHoursWeekly]} onValueChange={(value: number[]) => handleInputChange('processHoursWeekly', value[0])} max={100} step={5} className="py-4" />
                      <p className="text-3xl font-bold text-white text-center">{formData.processHoursWeekly} uur/week</p>
                      <p className="text-white/60 text-center">per medewerker</p>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wat kosten fouten/herwerk per maand?</Label>
                    <div className="space-y-4">
                      <Input type="number" value={formData.errorCostMonthly} onChange={(e) => handleInputChange('errorCostMonthly', parseInt(e.target.value) || 0)} className="bg-white/5 border-white/20 text-white text-2xl text-center py-4" />
                      <p className="text-white/60 text-center">€ per maand (correcties, compensaties, etc.)</p>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Hoeveel klantvragen/calls per maand?</Label>
                    <div className="space-y-4">
                      <Input type="number" value={formData.customerServiceCalls} onChange={(e) => handleInputChange('customerServiceCalls', parseInt(e.target.value) || 0)} className="bg-white/5 border-white/20 text-white text-2xl text-center py-4" />
                      <p className="text-white/60 text-center">calls/tickets per maand</p>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Gemiddelde afhandeltijd per call/ticket?</Label>
                    <div className="space-y-4">
                      <Slider value={[formData.avgCallDuration]} onValueChange={(value: number[]) => handleInputChange('avgCallDuration', value[0])} max={60} step={1} className="py-4" />
                      <p className="text-3xl font-bold text-white text-center">{formData.avgCallDuration} minuten</p>
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Hoeveel uur per week aan handmatige data entry?</Label>
                    <div className="space-y-4">
                      <Slider value={[formData.manualDataEntry]} onValueChange={(value: number[]) => handleInputChange('manualDataEntry', value[0])} max={100} step={5} className="py-4" />
                      <p className="text-3xl font-bold text-white text-center">{formData.manualDataEntry} uur/week</p>
                    </div>
                  </div>
                )}

                {currentStep === 8 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Jaarlijkse compliance/audit kosten?</Label>
                    <div className="space-y-4">
                      <Input type="number" value={formData.complianceCost} onChange={(e) => handleInputChange('complianceCost', parseInt(e.target.value) || 0)} className="bg-white/5 border-white/20 text-white text-2xl text-center py-4" />
                      <p className="text-white/60 text-center">€ per jaar</p>
                    </div>
                  </div>
                )}

                {currentStep === 9 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Hoeveel procent wil je automatiseren?</Label>
                    <div className="space-y-4">
                      <Slider value={[formData.targetAutomation]} onValueChange={(value: number[]) => handleInputChange('targetAutomation', value[0])} max={100} step={5} className="py-4" />
                      <p className="text-3xl font-bold text-emerald-400 text-center">{formData.targetAutomation}%</p>
                      <p className="text-white/60 text-center">automatisering doelstelling</p>
                    </div>
                  </div>
                )}

                {currentStep === 10 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Gewenste implementatie timeline?</Label>
                    <RadioGroup value={formData.implementationTimeline} onValueChange={(value) => handleInputChange('implementationTimeline', value)} className="space-y-3">
                      {[{ value: '3_months', label: '3 maanden', desc: 'Snelle implementatie' }, { value: '6_months', label: '6 maanden', desc: 'Gefaseerde aanpak' }, { value: '12_months', label: '12 maanden', desc: 'Uitgebreide implementatie' }, { value: '18_months', label: '18+ maanden', desc: 'Enterprise rollout' }].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <RadioGroupItem value={option.value} id={`timeline-${option.value}`} className="mt-1" />
                          <div><Label htmlFor={`timeline-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label><p className="text-white/60 text-sm">{option.desc}</p></div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentStep === 11 && <div className="space-y-6"><Label className="text-xl font-semibold text-white">Beschrijf je organisatie en processen</Label><Textarea value={formData.coreBusiness} onChange={(e) => handleInputChange('coreBusiness', e.target.value)} placeholder="Wat doet je bedrijf en welke processen wil je automatiseren?" className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40" /></div>}

                {currentStep === 12 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wat is je primaire doel?</Label>
                    <RadioGroup value={formData.primaryGoal} onValueChange={(value) => handleInputChange('primaryGoal', value)} className="space-y-3">
                      {[{ value: 'cost_reduction', label: 'Kostenbesparing', desc: 'Operationele kosten verlagen' }, { value: 'efficiency', label: 'Efficiëntie', desc: 'Snellere processen' }, { value: 'quality', label: 'Kwaliteit', desc: 'Minder fouten' }, { value: 'scale', label: 'Schaalbaarheid', desc: 'Groeien zonder meer personeel' }, { value: 'cx', label: 'Klantervaring', desc: 'Betere service' }].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <RadioGroupItem value={option.value} id={`goal-${option.value}`} className="mt-1" />
                          <div><Label htmlFor={`goal-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label><p className="text-white/60 text-sm">{option.desc}</p></div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentStep === 13 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-white">Wat is je budget range?</Label>
                    <RadioGroup value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)} className="space-y-3">
                      {[{ value: 'small', label: '€10K - €50K', desc: 'Pilot project' }, { value: 'medium', label: '€50K - €150K', desc: 'Departement implementatie' }, { value: 'large', label: '€150K - €500K', desc: 'Enterprise project' }, { value: 'enterprise', label: '€500K+', desc: 'Organisatie-brede transformatie' }, { value: 'unknown', label: 'Nog te bepalen', desc: 'Afhankelijk van business case' }].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                          <RadioGroupItem value={option.value} id={`budget-${option.value}`} className="mt-1" />
                          <div><Label htmlFor={`budget-${option.value}`} className="text-white font-medium cursor-pointer">{option.label}</Label><p className="text-white/60 text-sm">{option.desc}</p></div>
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
                <Button onClick={handleNext} disabled={!isStepValid(currentStep)} className="bg-emerald-500 hover:bg-emerald-600 text-white">Volgende <ArrowRight className="w-4 h-4 ml-2" /></Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid(currentStep) || loadingResults} className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                  {loadingResults ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Berekenen...</> : <>Bereken ROI<CheckCircle className="w-4 h-4 ml-2" /></>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
