'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, ArrowRight, Target, Clock, FileText, Play, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AssessmentData {
  // Core Agent Readiness (14 questions)
  coreBusiness: string;
  systems: string[];
  highestImpactSystem: string;
  hasApis: string;
  dataAccess: string;
  dataLocation: string;
  processDocumentation: string;
  automationExperience: string;
  agentPlatformPreference: string;
  agentPlatforms: string[];
  mainBlocker: string;
  adoptionSpeed: string;
  costOptimization: string;
  budgetReality: string;
  itMaturity: string;
  // Contact info
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  wantGuide: boolean;
  createAccount?: boolean;
}

export default function AgentReadinessPage() {
  const t = useTranslations('agentReadinessAssessment');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();
  const [quizPreFillData, setQuizPreFillData] = useState<any>(null);
  const [formData, setFormData] = useState<AssessmentData>({
    // Core Agent Readiness
    coreBusiness: '',
    systems: [],
    highestImpactSystem: '',
    hasApis: '',
    dataAccess: '',
    dataLocation: '',
    processDocumentation: '',
    automationExperience: '',
    agentPlatformPreference: '',
    agentPlatforms: [],
    mainBlocker: '',
    adoptionSpeed: '',
    costOptimization: '',
    budgetReality: '',
    itMaturity: '',
    // Contact fields
    name: user?.displayName || user?.firstName || '',
    role: user?.jobTitle || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    wantGuide: false,
    createAccount: false
  });

  // Load quiz pre-fill data on component mount
  useEffect(() => {
    // Try sessionStorage first
    const sessionData = sessionStorage.getItem('quizPreFill');
    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        setQuizPreFillData(parsedData);
        
        // Pre-fill overlapping fields
        setFormData(prev => ({
          ...prev,
          hasApis: parsedData.hasApis || '',
          dataAccess: parsedData.dataAccess || '',
          budgetReality: parsedData.budgetReality || '',
          mainBlocker: parsedData.mainBlocker || '',
          highestImpactSystem: parsedData.highestImpact || ''
        }));

        console.log('Prefilled form data from session:', {
          hasApis: parsedData.hasApis,
          dataAccess: parsedData.dataAccess,
          budgetReality: parsedData.budgetReality,
          mainBlocker: parsedData.mainBlocker,
          highestImpact: parsedData.highestImpact
        });
        
        // Clear session storage to prevent reuse
        sessionStorage.removeItem('quizPreFill');
      } catch (error) {
        console.log('Failed to parse quiz pre-fill data:', error);
      }
    } else {
      // Try URL params as backup
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('prefill') === 'true') {
        const urlData = {
          hasApis: urlParams.get('hasApis') || '',
          dataAccess: urlParams.get('dataAccess') || '',
          budgetReality: urlParams.get('budgetReality') || '',
          mainBlocker: urlParams.get('mainBlocker') || '',
          highestImpact: urlParams.get('highestImpact') || '',
          quickCheckScore: parseInt(urlParams.get('score') || '0'),
          source: 'hero_quiz'
        };
        
        setQuizPreFillData(urlData);
        setFormData(prev => ({
          ...prev,
          hasApis: urlData.hasApis,
          dataAccess: urlData.dataAccess,
          budgetReality: urlData.budgetReality,
          mainBlocker: urlData.mainBlocker,
          highestImpactSystem: urlData.highestImpact
        }));

        console.log('Prefilled form data from URL:', urlData);
      }
    }
  }, []);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        
        if (currentStep < totalSteps) {
          // Same logic as "Volgende" button
          if (canProceed()) {
            let nextStep = currentStep + 1;
            
            // Skip pre-filled questions
            while (nextStep <= totalSteps && shouldSkipStep(nextStep)) {
              nextStep++;
            }
            
            setCurrentStep(nextStep);
          }
        } else {
          // Final step - submit
          if (canProceed()) {
            handleSubmit();
          }
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep, formData]); // Dependencies to ensure fresh state

  const totalSteps = 16; // Assessment questions (1 business + 2 systems + 1 apis + 2 data + 1 processes + 1 automation + 2 ai platform + 1 blocker + 1 adoption + 1 cost + 1 budget + 1 it maturity + 1 contact), final step is contact info

  // Skip questions that are already filled from quick check
  const shouldSkipStep = (step: number): boolean => {
    if (!quizPreFillData) return false;
    
    switch (step) {
      case 4: return !!(quizPreFillData.hasApis && formData.hasApis); // API question
      case 5: return !!(quizPreFillData.dataAccess && formData.dataAccess); // Data access question  
      case 11: return !!(quizPreFillData.mainBlocker && formData.mainBlocker); // Main blocker question
      case 14: return !!(quizPreFillData.budgetReality && formData.budgetReality); // Budget reality question
      default: return false;
    }
  };

  // Calculate how many questions are skipped from quick check
  const getSkippedQuestionCount = (): number => {
    if (!quizPreFillData) return 0;
    
    let count = 0;
    if (shouldSkipStep(4)) count++; // Step 4
    if (shouldSkipStep(5)) count++; // Step 5  
    if (shouldSkipStep(11)) count++; // Step 11
    if (shouldSkipStep(14)) count++; // Step 14
    
    return count;
  };

  // Adjusted progress calculation that accounts for skipped questions
  const getAdjustedProgress = (): number => {
    const skippedCount = getSkippedQuestionCount();
    const totalQuestionsToAnswer = 15 - skippedCount;
    const effectiveStep = currentStep + skippedCount;
    return Math.round((Math.min(effectiveStep, 15) / totalQuestionsToAnswer) * 100);
  };

  const systemOptions = [
    'Klantenservice/Helpdesk',
    'CRM/Sales', 
    'ERP/Finance',
    'HR/Personeelszaken',
    'Kennisbank/Documentatie',
    'Planning/Logistics',
    'Eigen software/Maatwerk',
    'Anders'
  ];

  const blockerOptions = [
    'Technische kennis ontbreekt',
    'Systemen praten niet met elkaar', 
    'Geen idee waar te beginnen',
    'Budget/resources beperkt',
    'Security/compliance zorgen',
    'Team weerstand tegen verandering',
    'Data is te rommelig/verspreid',
    'Anders'
  ];

  const costOptimizationOptions = [
    'Personeelskosten / handmatig werk',
    'Customer service / support kosten',
    'Data entry / administratie',
    'Communicatie tussen afdelingen', 
    'Fouten / rework kosten',
    'Planning / coordination overhead',
    'Anders'
  ];

  const agentPlatforms = [
    'Claude (Anthropic)',
    'GPT (OpenAI)', 
    'Gemini (Google)',
    'Eigen/Custom agents',
    'Weet nog niet',
    'Anders'
  ];

  const handleSystemToggle = (system: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        systems: [...prev.systems.filter(s => s !== system), system].slice(0, 3)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        systems: prev.systems.filter(s => s !== system)
      }));
    }
  };


  const handlePlatformToggle = (platform: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        agentPlatforms: [...prev.agentPlatforms.filter(p => p !== platform), platform]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        agentPlatforms: prev.agentPlatforms.filter(p => p !== platform)
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Submit assessment data
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          entryPoint: 'comprehensive_assessment',
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // If user is already logged in, save to their account automatically
        if (user) {
          try {
            const linkResponse = await fetch('/api/user/link-assessment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.uid,
                assessmentId: data.assessmentId,
                source: 'logged_in_user'
              })
            });
            
            const linkData = await linkResponse.json();
            if (linkData.offline) {
              console.log('Assessment will be linked when Firestore is back online');
            }
          } catch (linkError) {
            console.error('Failed to link assessment, but continuing:', linkError);
          }
          
          // Redirect to dashboard with assessment (regardless of link success)
          window.location.href = `/dashboard?assessment=${data.assessmentId}&first=true&score=${data.previewScore || 'pending'}`;
        } else if (formData.createAccount) {
          // Create account and redirect to dashboard with pre-filled data
          const params = new URLSearchParams({
            email: formData.email || '',
            company: formData.company || '',
            name: formData.name || '',
            assessment: data.assessmentId || '',
            source: 'assessment_completion'
          });
          window.location.href = `/register?${params.toString()}`;
        } else {
          // Show results without account
          setIsSubmitted(true);
        }
      } else {
        console.error('Assessment submission failed');
        setIsSubmitted(true); // Show error state
      }
    } catch (error) {
      console.error('Assessment submission error:', error);
      setIsSubmitted(true);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.coreBusiness !== '';
      case 2: return (formData.systems || []).length > 0;
      case 3: return formData.highestImpactSystem !== '' && (formData.systems || []).length > 0;
      case 4: return formData.hasApis !== '';
      case 5: return formData.dataAccess !== '';
      case 6: return formData.dataLocation !== '';
      case 7: return formData.processDocumentation !== '';
      case 8: return formData.automationExperience !== '';
      case 9: {
        // If they selected "yes", also require at least one platform selection
        if (formData.agentPlatformPreference === 'yes') {
          return formData.agentPlatformPreference !== '' && formData.agentPlatforms.length > 0;
        }
        // For "no" or "depends", just the preference is enough
        return formData.agentPlatformPreference !== '';
      }
      case 10: return true; // Step 10 is now always skippable since platforms show in step 9
      case 11: return formData.mainBlocker !== '';
      case 12: return formData.adoptionSpeed !== '';
      case 13: return formData.costOptimization !== '';
      case 14: return formData.budgetReality !== '';
      case 15: return formData.itMaturity !== '';
      case 16: return formData.name && formData.company && formData.email;
      case 17: return true; // Confirmation step
      default: return false;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8 lg:p-12"
            >
              <div className="mb-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: '#F87315' }} />
                <h1 className="text-4xl font-bold text-white mb-4">
                  Je Agent Readiness Report wordt gegenereerd...
                </h1>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Video Thumbnail */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Terwijl je wacht:</h3>
                  <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-6 mb-4">
                    <div className="flex items-center justify-center mb-4">
                      <Play className="w-12 h-12" style={{ color: '#F87315' }} />
                    </div>
                    <p className="text-white/80 text-sm">
                      "Bekijk hoe ServiceNow agent-ready werd in 2 weken"
                    </p>
                  </div>
                  <Button 
                    className="w-full text-white"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    <Play className="mr-2 w-4 h-4" />
                    Bekijk Video
                  </Button>
                </div>

                {/* Report Contents */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Je rapport bevat:</h3>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-center text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      Agent Readiness Score (0-100)
                    </li>
                    <li className="flex items-center text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      Breakdown per infrastructuur categorie
                    </li>
                    <li className="flex items-center text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      Algemene best practices per level
                    </li>
                    <li className="flex items-center text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      Indicatie tijd tot Agent-Ready
                    </li>
                    <li className="flex items-center text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      GroeimetAI certificaat + badge
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  Je gratis rapport wordt gegenereerd!
                </h3>
                <p className="text-white/70 text-sm">
                  Je Agent Readiness Score en algemene inzichten komen binnen 2 minuten via email.
                </p>
                <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-white/80 text-sm">
                    <strong>Wil je een concrete roadmap?</strong><br/>
                    Expert Assessment (€2.500) geeft specifieke gaps analyse en implementatie plan voor jouw bedrijf.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              <span
                className="text-white px-4 py-2 inline-block"
                style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
              >
                Agent Readiness
              </span>{' '}
              Assessment
            </h1>
            <p className="text-xl text-white/80 mb-4">
              14 vragen, 5-8 minuten - kom achter je complete agent readiness score
            </p>
            <p className="text-lg text-white/60 mb-8">
              Puur focus op: kunnen agents met jouw systemen werken?
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Vraag {Math.min(currentStep + getSkippedQuestionCount(), 15)} van 15</span>
                <span>{getAdjustedProgress()}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: '#F87315', 
                    width: `${getAdjustedProgress()}%` 
                  }}
                ></div>
              </div>
              
              {quizPreFillData && (
                <div className="mt-3 text-center">
                  <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
                    <span className="text-green-400 text-sm font-medium">
                      {getSkippedQuestionCount()} vragen geskipt uit quick check
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Assessment Form */}
          <Card className="bg-white/5 border border-white/10">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Core Business */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">
                      💼 Wat is jullie core business?
                    </h2>
                    <p className="text-white/70 mb-6">In één zin: wat doet jullie bedrijf voor klanten?</p>
                    
                    <div className="space-y-4">
                      <Textarea
                        value={formData.coreBusiness}
                        onChange={(e) => setFormData(prev => ({ ...prev, coreBusiness: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white min-h-[120px] resize-none"
                        placeholder="We zijn een [type bedrijf] die [wat jullie doen] voor [doelgroep]"
                      />
                      
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-white/60 text-sm mb-2">
                          <span className="text-orange-400 font-medium">Bijvoorbeeld:</span>
                        </p>
                        <p className="text-white/80 text-sm italic">
                          "We leveren IT hardware aan MKB bedrijven"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Priority Systems */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">
                      🏗️ Welke systemen MOETEN agent-ready worden?
                    </h2>
                    <p className="text-white/70 mb-6">Selecteer maximaal 3 systemen</p>
                    
                    <div className="space-y-4">
                      {systemOptions.map((system) => {
                        const isSelected = (formData.systems || []).includes(system);
                        return (
                          <div key={system} className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                            isSelected ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                          onClick={() => handleSystemToggle(system, !isSelected)}
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-5 h-5 rounded border-white/20 bg-white/5"
                                style={{ accentColor: '#F87315' }}
                              />
                              <Label className="text-white/80 cursor-pointer">
                                {system}
                              </Label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-white/70 text-sm">
                        Geselecteerd: {(formData.systems || []).length}/3 systemen
                      </p>
                    </div>
                    
                    {(formData.systems.includes('Anders') || formData.systems.includes('Eigen software/Maatwerk')) && (
                      <div className="mt-4">
                        <Input
                          placeholder={
                            formData.systems.includes('Eigen software/Maatwerk') 
                              ? "Beschrijf je maatwerk software..." 
                              : "Beschrijf je eigen systeem..."
                          }
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Highest Impact System - Part B */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">
                      🎯 Welk systeem heeft de GROOTSTE impact als het agent-ready wordt?
                    </h2>
                    <p className="text-white/70 mb-6">Kies uit de systemen die je net selecteerde</p>
                    
                    <RadioGroup value={formData.highestImpactSystem} onValueChange={(value) => setFormData(prev => ({ ...prev, highestImpactSystem: value }))}>
                      <div className="space-y-4">
                        {(formData.systems || []).map((system) => (
                          <div key={system} className="flex items-center space-x-3">
                            <RadioGroupItem value={system} id={`impact-${system}`} />
                            <Label htmlFor={`impact-${system}`} className="text-white/80">{system}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                    
                    {(formData.systems || []).length === 0 && (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <p className="text-orange-300 text-sm">
                          Ga terug naar de vorige stap om systemen te selecteren
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: API Status */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {quizPreFillData?.hasApis && (
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <span className="text-green-400 font-medium">Antwoord overgenomen uit quick check</span>
                        </div>
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-white mb-4">
                      🔗 Hebben deze systemen APIs?
                    </h2>
                    <p className="text-white/70 mb-6">Agents moeten kunnen verbinden met je systemen</p>
                    
                    <RadioGroup value={formData.hasApis} onValueChange={(value) => setFormData(prev => ({ ...prev, hasApis: value }))}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="most" id="most" />
                          <Label htmlFor="most" className="text-white/80">Ja, de meeste hebben APIs</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="some" id="some" />
                          <Label htmlFor="some" className="text-white/80">Sommige wel, sommige niet</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="unknown" id="unknown" />
                          <Label htmlFor="unknown" className="text-white/80">Geen idee eigenlijk</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="none" id="none" />
                          <Label htmlFor="none" className="text-white/80">Nee, nog geen APIs</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 5: Data Access */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {quizPreFillData?.dataAccess && (
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <span className="text-green-400 font-medium">Antwoord overgenomen uit quick check</span>
                        </div>
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-white mb-4">
                      📊 Kun je snel klantdata vinden?
                    </h2>
                    <p className="text-white/70 mb-6">
                      Test: Kun je binnen 5 minuten alle data van klant &quot;Jan de Vries&quot; vinden?
                    </p>
                    
                    <RadioGroup value={formData.dataAccess} onValueChange={(value) => setFormData(prev => ({ ...prev, dataAccess: value }))}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="instant" id="data-instant" />
                          <Label htmlFor="data-instant" className="text-white/80">Ja, paar clicks en ik heb alles</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="minutes" id="data-minutes" />
                          <Label htmlFor="data-minutes" className="text-white/80">Ja, maar moet door 2-3 systemen</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="difficult" id="data-difficult" />
                          <Label htmlFor="data-difficult" className="text-white/80">Lastig, data zit verspreid</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="impossible" id="data-impossible" />
                          <Label htmlFor="data-impossible" className="text-white/80">Nee, veel data is niet digitaal</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 6: Data Location */}
                {currentStep === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">
                      📍 Waar staat die klantdata?
                    </h2>
                    <p className="text-white/70 mb-6">Hoe verspreid is je data over systemen?</p>
                    
                    <RadioGroup value={formData.dataLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, dataLocation: value }))}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="central" id="data-central" />
                          <Label htmlFor="data-central" className="text-white/80">Één centraal systeem</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="few-systems" id="data-few" />
                          <Label htmlFor="data-few" className="text-white/80">2-3 systemen</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="many-systems" id="data-many" />
                          <Label htmlFor="data-many" className="text-white/80">5+ systemen</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="paper-excel" id="data-paper" />
                          <Label htmlFor="data-paper" className="text-white/80">Deels nog op papier/Excel</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 7: Process Documentation */}
                {currentStep === 7 && (
                  <motion.div
                    key="step7"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">
                      📋 Staan jullie processen beschreven?
                    </h2>
                    <p className="text-white/70 mb-6">
                      Agents moeten weten wat ze moeten doen
                    </p>
                    
                    <RadioGroup value={formData.processDocumentation} onValueChange={(value) => setFormData(prev => ({ ...prev, processDocumentation: value }))}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="documented" id="proc-yes" />
                          <Label htmlFor="proc-yes" className="text-white/80">Ja, alles gedocumenteerd</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="partially" id="proc-partial" />
                          <Label htmlFor="proc-partial" className="text-white/80">Belangrijkste processen wel</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="tribal" id="proc-tribal" />
                          <Label htmlFor="proc-tribal" className="text-white/80">Nee, zit in hoofden van medewerkers</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="chaos" id="proc-chaos" />
                          <Label htmlFor="proc-chaos" className="text-white/80">Iedereen doet het anders</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 8: Automation Experience */}
                {currentStep === 8 && (
                  <motion.div
                    key="step8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">
                      🤖 Welke automation gebruik je al?
                    </h2>
                    
                    <RadioGroup value={formData.automationExperience} onValueChange={(value) => setFormData(prev => ({ ...prev, automationExperience: value }))}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="advanced" id="auto-advanced" />
                          <Label htmlFor="auto-advanced" className="text-white/80">Zapier, Power Automate, RPA tools</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="basic" id="auto-basic" />
                          <Label htmlFor="auto-basic" className="text-white/80">Email automation, basis workflows</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="trying" id="auto-trying" />
                          <Label htmlFor="auto-trying" className="text-white/80">Proberen dingen, maar breekt vaak</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="none" id="auto-none" />
                          <Label htmlFor="auto-none" className="text-white/80">Nee, alles nog handmatig</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 9: Agent Platform Preference */}
                {currentStep === 9 && (
                  <motion.div
                    key="step9"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">
                      🧠 Heb je al een voorkeur voor AI platform?
                    </h2>
                    <p className="text-white/70 mb-6">We willen weten of je al specifieke wensen hebt</p>
                    
                    <RadioGroup value={formData.agentPlatformPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, agentPlatformPreference: value }))}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="yes" id="platform-yes" />
                          <Label htmlFor="platform-yes" className="text-white/80">Ja, namelijk:</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="no" id="platform-no" />
                          <Label htmlFor="platform-no" className="text-white/80">Nee, advies nodig</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="depends" id="platform-depends" />
                          <Label htmlFor="platform-depends" className="text-white/80">Hangt af van kosten/compliance</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 9B: Agent Platforms Selection - Show immediately after "yes" selection */}
                {currentStep === 9 && formData.agentPlatformPreference === 'yes' && (
                  <motion.div
                    key="platforms-selection"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-6 pt-6 border-t border-white/10"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">
                      Welke AI platforms heb je op het oog?
                    </h3>
                    <p className="text-white/70 mb-4 text-sm">Selecteer alle die van toepassing zijn</p>
                    
                    <div className="space-y-3">
                      {agentPlatforms.filter(p => p !== 'Weet nog niet').map((platform) => (
                        <div key={platform} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={platform}
                            checked={formData.agentPlatforms.includes(platform)}
                            onChange={(e) => handlePlatformToggle(platform, e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5"
                            style={{ accentColor: '#F87315' }}
                          />
                          <Label htmlFor={platform} className="text-white/80 text-sm cursor-pointer">
                            {platform}
                          </Label>
                        </div>
                      ))}
                    </div>

                    {formData.agentPlatforms.includes('Anders') && (
                      <div className="mt-4">
                        <Input
                          placeholder="Welke andere AI platforms heb je op het oog..."
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 10: Agent Platforms - Conditional (OUDE VERSIE - VERWIJDEREN) */}
                {currentStep === 10 && (
                  <motion.div
                    key="step10"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {formData.agentPlatformPreference === 'yes' ? (
                      <>
                        <h2 className="text-2xl font-bold text-white mb-4">
                          🧠 Welke AI platforms heb je op het oog?
                        </h2>
                        <p className="text-white/70 mb-6">Selecteer alle die van toepassing zijn</p>
                        
                        <div className="space-y-4">
                          {agentPlatforms.filter(p => p !== 'Weet nog niet').map((platform) => (
                            <div key={platform} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id={platform}
                                checked={formData.agentPlatforms.includes(platform)}
                                onChange={(e) => handlePlatformToggle(platform, e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-white/5"
                                style={{ accentColor: '#F87315' }}
                              />
                              <Label htmlFor={platform} className="text-white/80 text-sm cursor-pointer">
                                {platform}
                              </Label>
                            </div>
                          ))}
                        </div>

                        {formData.agentPlatforms.includes('Anders') && (
                          <div className="mt-4">
                            <Input
                              placeholder="Welke andere AI platforms heb je op het oog..."
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-white mb-4">
                          ✅ Perfect!
                        </h2>
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                          <p className="text-white/80 mb-4">
                            {formData.agentPlatformPreference === 'no' 
                              ? 'We gaan je advies geven over de beste AI platforms voor jouw situatie.'
                              : 'We houden rekening met kosten en compliance eisen bij onze aanbevelingen.'}
                          </p>
                          <p className="text-white/60 text-sm">
                            In je rapport krijg je een vergelijking van platforms die passen bij jouw infrastructure en budget.
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Step 11: Main Blocker */}
                {currentStep === 11 && (
                  <motion.div
                    key="step11"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {quizPreFillData?.mainBlocker && (
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <span className="text-green-400 font-medium">Antwoord overgenomen uit quick check</span>
                        </div>
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-white mb-4">
                      ⚠️ Wat is je grootste blocker voor automation?
                    </h2>
                    
                    <RadioGroup value={formData.mainBlocker} onValueChange={(value) => setFormData(prev => ({ ...prev, mainBlocker: value }))}>
                      <div className="space-y-4">
                        {blockerOptions.map((blocker) => (
                          <div key={blocker} className="flex items-center space-x-3">
                            <RadioGroupItem value={blocker} id={`blocker-${blocker}`} />
                            <Label htmlFor={`blocker-${blocker}`} className="text-white/80">{blocker}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                    
                    {formData.mainBlocker === 'Anders' && (
                      <div className="mt-4">
                        <Input
                          placeholder="Beschrijf je blocker..."
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 12: Adoption Speed */}
                {currentStep === 12 && (
                  <motion.div
                    key="step12"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">
                      ⚡ Hoe snel kan jullie team nieuwe tools adopteren?
                    </h2>
                    
                    <RadioGroup value={formData.adoptionSpeed} onValueChange={(value) => setFormData(prev => ({ ...prev, adoptionSpeed: value }))}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="very-fast" id="adoption-very-fast" />
                          <Label htmlFor="adoption-very-fast" className="text-white/80">Zeer snel (weken)</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="reasonable" id="adoption-reasonable" />
                          <Label htmlFor="adoption-reasonable" className="text-white/80">Redelijk (maanden)</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="slow" id="adoption-slow" />
                          <Label htmlFor="adoption-slow" className="text-white/80">Traag (kwartalen)</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="very-slow" id="adoption-very-slow" />
                          <Label htmlFor="adoption-very-slow" className="text-white/80">Zeer traag (jaren)</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 13: Cost Optimization */}
                {currentStep === 13 && (
                  <motion.div
                    key="step13"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">
                      💰 Wat is jullie grootste operational kostenpost die je zou willen optimaliseren?
                    </h2>
                    <p className="text-white/70 mb-6">Dit helpt agents prioriteren waar de grootste impact ligt</p>
                    
                    <RadioGroup value={formData.costOptimization} onValueChange={(value) => setFormData(prev => ({ ...prev, costOptimization: value }))}>
                      <div className="space-y-4">
                        {costOptimizationOptions.map((option) => (
                          <div key={option} className="flex items-center space-x-3">
                            <RadioGroupItem value={option} id={`cost-${option}`} />
                            <Label htmlFor={`cost-${option}`} className="text-white/80">{option}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 14: Budget Reality */}
                {currentStep === 14 && (
                  <motion.div
                    key="step14"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {quizPreFillData?.budgetReality && (
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <span className="text-green-400 font-medium">Antwoord overgenomen uit quick check</span>
                        </div>
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-white mb-4">
                      💰 Wat is realistisch voor agent infrastructure dit jaar?
                    </h2>
                    <p className="text-white/70 mb-6">Zodat we realistische aanbevelingen kunnen doen</p>
                    
                    <RadioGroup value={formData.budgetReality} onValueChange={(value) => setFormData(prev => ({ ...prev, budgetReality: value }))}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="pilot" id="budget-pilot" />
                          <Label htmlFor="budget-pilot" className="text-white/80">&lt; €10k - Pilot/experiment</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="single" id="budget-single" />
                          <Label htmlFor="budget-single" className="text-white/80">€10-25k - Één systeem serieus</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="multiple" id="budget-multiple" />
                          <Label htmlFor="budget-multiple" className="text-white/80">€25-100k - Meerdere systemen</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="enterprise" id="budget-enterprise" />
                          <Label htmlFor="budget-enterprise" className="text-white/80">€100k+ - Enterprise rollout</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="business-case" id="budget-case" />
                          <Label htmlFor="budget-case" className="text-white/80">Eerst business case nodig</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 15: IT Maturity */}
                {currentStep === 15 && (
                  <motion.div
                    key="step15"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">
                      🔧 Hoe worden systemen nu beheerd?
                    </h2>
                    <p className="text-white/70 mb-6">Dit helpt ons inschatten wie de implementatie gaat doen</p>
                    
                    <RadioGroup value={formData.itMaturity} onValueChange={(value) => setFormData(prev => ({ ...prev, itMaturity: value }))}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="internal" id="it-internal" />
                          <Label htmlFor="it-internal" className="text-white/80">Interne IT afdeling</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="external" id="it-external" />
                          <Label htmlFor="it-external" className="text-white/80">Externe IT partner</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="mixed" id="it-mixed" />
                          <Label htmlFor="it-mixed" className="text-white/80">Beetje van beide</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="adhoc" id="it-adhoc" />
                          <Label htmlFor="it-adhoc" className="text-white/80">Ad-hoc/niemand specifiek</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 16: Contact Info */}
                {currentStep === 16 && (
                  <motion.div
                    key="step16"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Jouw Agent Readiness Report
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-white/80">Naam *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-white/5 border-white/20 text-white"
                            placeholder="Je naam"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role" className="text-white/80">Functie</Label>
                          <Input
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            className="bg-white/5 border-white/20 text-white"
                            placeholder="Je functie"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company" className="text-white/80">Bedrijf *</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            className="bg-white/5 border-white/20 text-white"
                            placeholder="Bedrijfsnaam"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email" className="text-white/80">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-white/5 border-white/20 text-white"
                            placeholder="je@bedrijf.nl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-white/80">Telefoon</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-white/5 border-white/20 text-white"
                            placeholder="+31 6 12345678"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="guide"
                          checked={formData.wantGuide}
                          onChange={(e) => setFormData(prev => ({ ...prev, wantGuide: e.target.checked }))}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500 focus:ring-2"
                        />
                        <Label htmlFor="guide" className="text-white/80 text-sm cursor-pointer">
                          Ja, ik wil ook de Agent Readiness Guide (PDF)
                        </Label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 16/17: Confirmation - This will be handled by the navigation logic below */}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    let prevStep = currentStep - 1;
                    
                    // Skip pre-filled questions when going back
                    while (prevStep >= 1 && shouldSkipStep(prevStep)) {
                      prevStep--;
                    }
                    
                    setCurrentStep(Math.max(1, prevStep));
                  }}
                  disabled={currentStep === 1}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Vorige
                </Button>

                {currentStep < totalSteps ? (
                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      onClick={() => {
                        console.log('Next clicked! Step:', currentStep, 'Can proceed:', canProceed());
                        let nextStep = currentStep + 1;
                        
                        // Skip pre-filled questions
                        while (nextStep <= totalSteps && shouldSkipStep(nextStep)) {
                          nextStep++;
                        }
                        
                        setCurrentStep(nextStep);
                      }}
                      disabled={!canProceed()}
                      className="text-white"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      Volgende
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    {canProceed() && (
                      <span className="text-white/40 text-xs">
                        {navigator.platform?.includes('Mac') ? 'Cmd + Enter' : 'Ctrl + Enter'}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={handleSubmit}
                        disabled={!canProceed()}
                        className="w-full text-white font-semibold"
                        style={{ backgroundColor: '#F87315' }}
                      >
                        <Target className="mr-2 w-4 h-4" />
                        Kom achter mijn complete readiness score
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      {canProceed() && (
                        <div className="text-center">
                          <span className="text-white/40 text-xs">
                            {navigator.platform?.includes('Mac') ? 'Cmd + Enter' : 'Ctrl + Enter'} om te verzenden
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!user && (
                      <div className={`rounded-xl p-6 transition-all duration-300 ${
                        formData.createAccount 
                          ? 'bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-2 border-orange-500/50' 
                          : 'bg-white/5 border border-white/10 hover:border-white/20'
                      }`}>
                        <div className="flex items-start space-x-4 mb-4">
                          <div 
                            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              formData.createAccount ? 'bg-orange-500' : 'bg-white/10'
                            }`}
                          >
                            <input
                              type="checkbox"
                              id="createAccount"
                              checked={formData.createAccount}
                              onChange={(e) => setFormData(prev => ({ ...prev, createAccount: e.target.checked }))}
                              className="w-6 h-6 rounded border-0"
                              style={{ accentColor: formData.createAccount ? '#ffffff' : '#F87315' }}
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="createAccount" className="text-xl font-bold text-white cursor-pointer block mb-2">
                              ✨ Maak direct een{' '}
                              <span
                                className="text-white px-3 py-1 inline-block"
                                style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
                              >
                                account
                              </span>{' '}
                              aan
                            </Label>
                            <p className="text-white/70">
                              Krijg toegang tot je persoonlijke Agent Infrastructure dashboard
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                              <span className="text-white/90 text-sm">Assessment opgeslagen</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                                <span className="text-white text-xs font-bold">💰</span>
                              </div>
                              <span className="text-white/90 text-sm">Direct Expert upgrade (€2.500)</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                                <span className="text-white text-xs font-bold">🛠</span>
                              </div>
                              <span className="text-white/90 text-sm">Snow-flow demo toegang</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                                <span className="text-white text-xs font-bold">📈</span>
                              </div>
                              <span className="text-white/90 text-sm">Roadmap updates</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                                <span className="text-white text-xs font-bold">🔓</span>
                              </div>
                              <span className="text-white/90 text-sm">Premium features</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                                <span className="text-white text-xs font-bold">📊</span>
                              </div>
                              <span className="text-white/90 text-sm">Live metrics dashboard</span>
                            </div>
                          </div>
                        </div>
                        
                        {formData.createAccount && (
                          <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4 border border-orange-500/20">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                                <span className="text-white font-bold">✨</span>
                              </div>
                              <p className="text-white font-semibold">
                                Account wordt aangemaakt met {formData.email}
                              </p>
                            </div>
                            <p className="text-white/70 text-sm pl-11">
                              Je wordt direct doorgestuurd naar je persoonlijke dashboard met assessment resultaten
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}