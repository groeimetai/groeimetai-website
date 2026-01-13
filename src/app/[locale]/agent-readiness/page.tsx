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
  const [resultsReady, setResultsReady] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const { user, firebaseUser } = useAuth();
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

  // Enhanced quiz pre-fill data loading with multiple fallbacks and better error handling
  useEffect(() => {
    let loadedData = null;
    let dataSource = 'none';

    // Try sessionStorage first (primary method)
    const sessionData = sessionStorage.getItem('quizPreFill');
    if (sessionData) {
      try {
        loadedData = JSON.parse(sessionData);
        dataSource = 'sessionStorage';
        console.log('🔄 Loading quiz data from sessionStorage:', loadedData);
      } catch (error) {
        console.error('❌ Failed to parse sessionStorage quiz data:', error);
      }
    }

    // Try localStorage backup if sessionStorage failed
    if (!loadedData) {
      const localData = localStorage.getItem('quizPreFillBackup');
      if (localData) {
        try {
          loadedData = JSON.parse(localData);
          dataSource = 'localStorage';
          console.log('🔄 Loading quiz data from localStorage backup:', loadedData);
        } catch (error) {
          console.error('❌ Failed to parse localStorage quiz data:', error);
        }
      }
    }

    // Try URL params as final fallback
    if (!loadedData) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('prefill') === 'true' && urlParams.get('from') === 'quick_check') {
        loadedData = {
          coreBusiness: decodeURIComponent(urlParams.get('coreBusiness') || ''),
          systems: (urlParams.get('systems') || '').split(',').filter(s => s.trim()),
          highestImpactSystem: decodeURIComponent(urlParams.get('highestImpactSystem') || ''),
          hasApis: decodeURIComponent(urlParams.get('hasApis') || ''),
          dataAccess: decodeURIComponent(urlParams.get('dataAccess') || ''),
          quickCheckScore: parseInt(urlParams.get('score') || '0'),
          quickCheckLevel: decodeURIComponent(urlParams.get('level') || ''),
          source: 'hero_quiz'
        };
        dataSource = 'urlParams';
        console.log('🔄 Loading quiz data from URL params:', loadedData);
      }
    }

    // If we have data, pre-fill the form
    if (loadedData && (loadedData.coreBusiness || loadedData.systems || loadedData.hasApis)) {
      setQuizPreFillData(loadedData);

      // Pre-fill overlapping fields with validation
      setFormData(prev => ({
        ...prev,
        coreBusiness: loadedData.coreBusiness || '',
        systems: loadedData.systems || [],
        highestImpactSystem: loadedData.highestImpactSystem || '',
        hasApis: loadedData.hasApis || '',
        dataAccess: loadedData.dataAccess || ''
      }));

      // Skip to first non-pre-filled question
      let startStep = 1;
      while (startStep <= totalSteps && shouldSkipStep(startStep)) {
        startStep++;
      }
      if (startStep !== currentStep) {
        setCurrentStep(startStep);
      }

      console.log('✅ Quiz-to-Assessment Bridge Successful:', {
        dataSource,
        fieldsLoaded: {
          coreBusiness: !!loadedData.coreBusiness,
          systems: !!(loadedData.systems && loadedData.systems.length > 0),
          highestImpactSystem: !!loadedData.highestImpactSystem,
          hasApis: !!loadedData.hasApis,
          dataAccess: !!loadedData.dataAccess
        },
        score: loadedData.quickCheckScore || 'none',
        level: loadedData.quickCheckLevel || 'none',
        startingAtStep: startStep
      });

      // Clean up storage after successful load to prevent reuse
      if (dataSource === 'sessionStorage') {
        sessionStorage.removeItem('quizPreFill');
      }
      if (dataSource === 'localStorage') {
        localStorage.removeItem('quizPreFillBackup');
      }

      // Clear URL params to clean up browser history
      if (dataSource === 'urlParams') {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } else {
      console.log('ℹ️ No quiz pre-fill data found or data incomplete');
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
            const nextStep = getNextStep(currentStep);
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

  const totalSteps = 15; // Assessment questions (1 business + 2 systems + 1 apis + 2 data + 1 processes + 1 automation + 1 ai platform + 1 blocker + 1 adoption + 1 cost + 1 budget + 1 it maturity + 1 contact), final step is contact info

  // Enhanced step skipping logic with better validation and logging
  const shouldSkipStep = (step: number): boolean => {
    if (!quizPreFillData) return false;

    const skipMap: Record<number, { condition: boolean; field: string; value: any }> = {
      1: { // APIs question (step 1)
        condition: !!(quizPreFillData.hasApis),
        field: 'hasApis',
        value: quizPreFillData.hasApis
      },
      2: { // Data access question (step 2)
        condition: !!(quizPreFillData.dataAccess),
        field: 'dataAccess',
        value: quizPreFillData.dataAccess
      },
      3: { // Process documentation question (step 3)
        condition: !!(quizPreFillData.processDocumentation),
        field: 'processDocumentation',
        value: quizPreFillData.processDocumentation
      },
      4: { // Automation experience question (step 4)
        condition: !!(quizPreFillData.automationExperience),
        field: 'automationExperience',
        value: quizPreFillData.automationExperience
      },
      5: { // Main blocker question (step 5)
        condition: !!(quizPreFillData.mainBlocker),
        field: 'mainBlocker',
        value: quizPreFillData.mainBlocker
      }
    };

    const stepConfig = skipMap[step];
    if (stepConfig && stepConfig.condition) {
      console.log(`⏭️ Skipping step ${step} (${stepConfig.field}): "${stepConfig.value}" - pre-filled from quiz`);
      return true;
    }

    return false;
  };

  // Get the next non-skipped step
  const getNextStep = (fromStep: number): number => {
    let nextStep = fromStep + 1;
    while (nextStep <= totalSteps && shouldSkipStep(nextStep)) {
      nextStep++;
    }
    return nextStep;
  };

  // Get the previous non-skipped step
  const getPreviousStep = (fromStep: number): number => {
    let prevStep = fromStep - 1;
    while (prevStep >= 1 && shouldSkipStep(prevStep)) {
      prevStep--;
    }
    return Math.max(1, prevStep);
  };

  // Calculate how many questions are skipped from quick check
  const getSkippedQuestionCount = (): number => {
    if (!quizPreFillData) return 0;

    let count = 0;
    if (shouldSkipStep(1)) count++; // Step 1 - APIs
    if (shouldSkipStep(2)) count++; // Step 2 - Data access
    if (shouldSkipStep(3)) count++; // Step 3 - Process documentation
    if (shouldSkipStep(4)) count++; // Step 4 - Automation experience
    if (shouldSkipStep(5)) count++; // Step 5 - Main blocker

    return count;
  };

  // Calculate the effective question number (accounting for skipped questions)
  const getCurrentQuestionNumber = (): number => {
    if (!quizPreFillData) return currentStep;

    let questionNumber = 1;
    for (let step = 1; step <= currentStep; step++) {
      if (step === currentStep || !shouldSkipStep(step)) {
        if (step < currentStep) {
          questionNumber++;
        }
      }
    }
    return questionNumber;
  };

  // Adjusted progress calculation that accounts for skipped questions
  const getAdjustedProgress = (): number => {
    const skippedCount = getSkippedQuestionCount();
    const currentQuestionNumber = getCurrentQuestionNumber();
    // Calculate progress based on total 15 questions, with skipped questions counting as completed
    const totalCompleted = skippedCount + currentQuestionNumber - 1;
    const totalQuestions = totalSteps - 1; // -1 because we don't count the final result as a question
    return Math.round((Math.min(totalCompleted, totalQuestions) / totalQuestions) * 100);
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

  // Poll assessment results until ready (with rate limiting)
  const pollAssessmentResults = async (assessmentId: string, initialScore?: number) => {
    setLoadingResults(true);
    let attempts = 0;
    const maxAttempts = 6; // Reduced to 1 minute max (6 * 10 seconds)
    let isActive = true;
    
    const poll = async () => {
      if (!isActive) return; // Prevent multiple polling instances
      
      try {
        attempts++;
        console.log(`⏳ Polling attempt ${attempts}/${maxAttempts} for assessment ${assessmentId}`);
        
        const response = await fetch(`/api/assessment/get-by-id?assessmentId=${assessmentId}`);
        const data = await response.json();
        
        if (data.success && data.assessment && isActive) {
          // Assessment is ready, show results
          setAssessmentResults(data.assessment);
          setLoadingResults(false);
          setResultsReady(true);
          isActive = false;
          return;
        }
        
        if (attempts < maxAttempts && isActive) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else if (isActive) {
          // Timeout - show basic results with initialScore if available
          console.log('⏰ Polling timeout - showing preview score');
          if (initialScore) {
            setAssessmentResults({
              id: assessmentId,
              score: initialScore,
              level: getLevelFromScore(initialScore),
              createdAt: new Date(),
              status: 'completed',
              type: 'agent_readiness',
              preview: true
            });
          }
          setLoadingResults(false);
          setResultsReady(true);
          isActive = false;
        }
      } catch (error) {
        console.error('Error polling assessment results:', error);
        if (attempts < maxAttempts && isActive) {
          setTimeout(poll, 15000); // Longer delay on error
        } else if (isActive) {
          setLoadingResults(false);
          // Show error or basic results if available
          if (initialScore) {
            setAssessmentResults({
              id: assessmentId,
              score: initialScore,
              level: getLevelFromScore(initialScore),
              createdAt: new Date(),
              status: 'completed',
              type: 'agent_readiness'
            });
          }
          setResultsReady(true);
        }
      }
    };
    
    // Start polling after 2 seconds
    setTimeout(poll, 2000);
  };

  // Helper function to get level from score
  const getLevelFromScore = (score: number): string => {
    if (score >= 90) return 'Agent-Ready (Level 5)';
    if (score >= 70) return 'Integration-Ready (Level 4)';
    if (score >= 50) return 'Digitalization-Ready (Level 3)';
    if (score >= 30) return 'Foundation-Building (Level 2)';
    return 'Pre-Digital (Level 1)';
  };

  const handleSubmit = async () => {
    try {
      // Prepare submission data with authentication
      const submissionData: any = {
        ...formData,
        entryPoint: 'comprehensive_assessment',
        timestamp: new Date().toISOString()
      };

      // Add Firebase ID token if user is authenticated
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          submissionData.firebaseIdToken = idToken;
          submissionData.userId = firebaseUser.uid;
          console.log('🔐 Adding authentication to assessment submission:', firebaseUser.uid);
        } catch (tokenError) {
          console.warn('⚠️ Failed to get ID token, submitting without auth:', tokenError);
        }
      }

      // Submit assessment data with authentication
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json' 
      };
      
      // Add Authorization header if available
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          headers['Authorization'] = `Bearer ${idToken}`;
        } catch (headerError) {
          console.warn('⚠️ Failed to add Authorization header:', headerError);
        }
      }

      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Assessment submission successful:', {
          assessmentId: data.assessmentId,
          previewScore: data.previewScore,
          userAuthenticated: !!user,
          message: data.message
        });
        
        // If user is already logged in, save to their account automatically
        if (user) {
          try {
            const linkResponse = await fetch('/api/user/link-assessment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: firebaseUser?.uid,
                assessmentId: data.assessmentId,
                userEmail: firebaseUser?.email,
                source: 'logged_in_user_enhanced'
              })
            });
            
            const linkData = await linkResponse.json();
            console.log('🔗 Assessment linking result:', linkData);
            
            if (linkData.offline) {
              console.log('🔄 Assessment will be linked when Firestore is back online');
            } else if (linkData.success && linkData.stats?.linkedCount > 0) {
              console.log(`✅ Successfully linked ${linkData.stats.linkedCount} assessments`);
            }
          } catch (linkError) {
            console.error('❌ Failed to link assessment, but continuing:', linkError);
          }
          
          // Redirect to dashboard with assessment (regardless of link success)
          window.location.href = `/dashboard?assessment=${data.assessmentId}&first=true&score=${data.previewScore || 'pending'}&linked=true`;
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
          // Show results without account - start polling for results
          setIsSubmitted(true);
          setLoadingResults(true);
          
          // Start polling for assessment results
          pollAssessmentResults(data.assessmentId, data.previewScore);
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
      case 1: return formData.hasApis !== ''; // API Status
      case 2: return formData.dataAccess !== ''; // Data Access
      case 3: return formData.processDocumentation !== ''; // Process Documentation
      case 4: return formData.automationExperience !== ''; // Automation Experience
      case 5: return formData.mainBlocker !== ''; // Main Blocker
      case 6: return formData.coreBusiness !== ''; // Core Business
      case 7: return (formData.systems || []).length > 0; // Priority Systems
      case 8: return formData.highestImpactSystem !== '' && (formData.systems || []).length > 0; // Highest Impact System
      case 9: return formData.dataLocation !== ''; // Data Location
      case 10: {
        // If they selected "yes", also require at least one platform selection
        if (formData.agentPlatformPreference === 'yes') {
          return formData.agentPlatforms.length > 0;
        }
        // For "no" or "depends", just the preference is enough
        return formData.agentPlatformPreference !== '';
      }
      case 11: return formData.adoptionSpeed !== ''; // Adoption Speed
      case 12: return formData.costOptimization !== ''; // Cost Optimization
      case 13: return formData.budgetReality !== ''; // Budget Reality
      case 14: return formData.itMaturity !== ''; // IT Maturity
      case 15: return formData.name && formData.company && formData.email; // Contact Info
      case 16: return true; // Confirmation step
      default: return false;
    }
  };

  if (isSubmitted) {
    // If results are ready, show them
    if (resultsReady && assessmentResults) {
      return (
        <div className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-6xl mx-auto">
              {/* Success Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <h1 className="text-3xl font-bold text-white">🎉 Assessment Voltooid!</h1>
                  </div>
                  <p className="text-green-200">
                    Je Agent Readiness Assessment is afgerond. Hieronder vind je je resultaten.
                  </p>
                </div>
              </motion.div>

              {/* Results Display */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Score Card */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-500" />
                      Je Agent Readiness Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Score Circle */}
                    <div className="text-center">
                      <div
                        className="w-36 h-36 rounded-full mx-auto flex items-center justify-center mb-6 relative"
                        style={{
                          background: `conic-gradient(#F87315 ${assessmentResults.score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                        }}
                      >
                        {/* Inner circle for text readability */}
                        <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center flex-col">
                          <span className="text-4xl font-bold text-white">{assessmentResults.score}</span>
                          <span className="text-white/60 text-sm">/100</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {assessmentResults.level}
                      </h3>
                      <p className="text-white/70">
                        {assessmentResults.score}/100 punten behaald
                      </p>
                    </div>

                    {/* Quick Insights */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Key Findings:</h4>
                      <div className="grid gap-2 text-sm">
                        {assessmentResults.score >= 70 && (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Goed voorbereid voor agent implementatie
                          </div>
                        )}
                        {assessmentResults.score < 70 && assessmentResults.score >= 40 && (
                          <div className="flex items-center gap-2 text-yellow-400">
                            <Clock className="w-4 h-4" />
                            Enkele voorbereidingen nodig
                          </div>
                        )}
                        {assessmentResults.score < 40 && (
                          <div className="flex items-center gap-2 text-red-400">
                            <Target className="w-4 h-4" />
                            Significante voorbereiding vereist
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-4">
                      <Button 
                        onClick={() => window.location.href = '/register'}
                        className="w-full bg-orange-500 text-white"
                      >
                        <Users className="mr-2 w-4 h-4" />
                        Maak Account Aan - Sla Assessment Op
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-2">Wil je een concrete roadmap?</h4>
                        <p className="text-white/70 text-sm mb-3">
                          Expert Assessment (€2.500) geeft specifieke gaps analyse en implementatie plan voor jouw bedrijf.
                        </p>
                        <Button 
                          size="sm" 
                          className="bg-orange-500 text-white w-full"
                          onClick={() => window.location.href = '/expert-assessment'}
                        >
                          Upgrade naar Expert Assessment
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Volgende Stappen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">1. Account Aanmaken</h4>
                        <p className="text-white/70 text-sm">
                          Sla je assessment op en krijg toegang tot je persoonlijke dashboard.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">2. Download Report</h4>
                        <p className="text-white/70 text-sm">
                          Krijg je volledige Agent Readiness Report via email.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">3. Plan Implementatie</h4>
                        <p className="text-white/70 text-sm">
                          Begin met de hoogst scorende systemen voor snelle wins.
                        </p>
                      </div>

                      {assessmentResults.score < 70 && (
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                          <h4 className="font-semibold text-orange-300 mb-2">🎯 Aanbevolen</h4>
                          <p className="text-white/80 text-sm">
                            Expert Assessment helpt je een concreet plan maken om je score naar 85+ te krijgen.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Still generating - show loading state
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
                {loadingResults ? (
                  <div className="w-16 h-16 mx-auto mb-6 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: '#F87315' }} />
                )}
                <h1 className="text-4xl font-bold text-white mb-4">
                  {loadingResults ? 'Je rapport wordt gegenereerd...' : 'Assessment Verwerkt!'}
                </h1>
                {loadingResults && (
                  <p className="text-white/70">
                    Even geduld, we analyseren je antwoorden...
                  </p>
                )}
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
                  {loadingResults ? 'Je resultaten komen eraan!' : 'Resultaten worden voorbereid!'}
                </h3>
                <p className="text-white/70 text-sm">
                  {loadingResults 
                    ? 'Even geduld, je score wordt berekend...'
                    : 'Je Agent Readiness Score en inzichten worden voorbereid.'
                  }
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
    <div className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
              <span
                className="text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 inline-block"
                style={{ 
                  background: 'linear-gradient(135deg, #F87315, #FF8533)',
                  borderRadius: 0
                }}
              >
                Agent Readiness
              </span>{' '}
              Assessment
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-3 sm:mb-4">
              15 vragen, 5-8 minuten - kom achter je complete agent readiness score
            </p>
            <p className="text-sm sm:text-base md:text-lg text-white/60 mb-4 sm:mb-6 md:mb-8">
              Begint met 5 snelle radio button vragen voor quick quiz overzicht
            </p>

            {/* Progress Bar */}
            <div className="max-w-sm sm:max-w-md mx-auto mb-6 sm:mb-8">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Vraag {getSkippedQuestionCount() + getCurrentQuestionNumber()} van {totalSteps}</span>
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
                  <div className="mt-2 text-xs text-white/60">
                    Quick check score: {quizPreFillData.quickCheckScore || 'N/A'}/100 • {quizPreFillData.quickCheckLevel || ''}
                  </div>
                  <div className="mt-1 text-xs text-green-400/80">
                    🔄 {getSkippedQuestionCount()} vraag{getSkippedQuestionCount() === 1 ? '' : 'en'} overgeslagen, {totalSteps - getSkippedQuestionCount()} vraag{totalSteps - getSkippedQuestionCount() === 1 ? '' : 'en'} van {totalSteps} over
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Assessment Form */}
          <Card className="bg-white/5 border border-white/10">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: API Status */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {quizPreFillData?.hasApis && (
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <span className="text-green-400 font-medium">Antwoord overgenomen uit quick check:</span>
                          <span className="text-green-300 italic">"{quizPreFillData.hasApis}"</span>
                        </div>
                      </div>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                      🔌 Hebben jullie systemen APIs?
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

                {/* Step 2: Data Access */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {quizPreFillData?.dataAccess && (
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <span className="text-green-400 font-medium">Antwoord overgenomen uit quick check:</span>
                          <span className="text-green-300 italic">"{quizPreFillData.dataAccess}"</span>
                        </div>
                      </div>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 3: Process Documentation */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 4: Automation Experience */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 5: Main Blocker */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {quizPreFillData?.mainBlocker && (
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <span className="text-green-400 font-medium">Antwoord overgenomen uit quick check:</span>
                          <span className="text-green-300 italic">"{quizPreFillData.mainBlocker}"</span>
                        </div>
                      </div>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                      🚧 Wat is je grootste blocker voor automation?
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

                {/* Step 6: Core Business */}
                {currentStep === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 7: Priority Systems */}
                {currentStep === 7 && (
                  <motion.div
                    key="step7"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 8: Highest Impact System */}
                {currentStep === 8 && (
                  <motion.div
                    key="step8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 9: Data Location */}
                {currentStep === 9 && (
                  <motion.div
                    key="step9"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 10: Agent Platform Preference */}
                {currentStep === 10 && (
                  <motion.div
                    key="step10"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 10B: Agent Platforms Selection - Show immediately after "yes" selection */}
                {currentStep === 10 && formData.agentPlatformPreference === 'yes' && (
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


                {/* Step 11: Adoption Speed */}
                {currentStep === 11 && (
                  <motion.div
                    key="step11"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 12: Cost Optimization */}
                {currentStep === 12 && (
                  <motion.div
                    key="step12"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 13: Budget Reality */}
                {currentStep === 13 && (
                  <motion.div
                    key="step13"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {quizPreFillData?.budgetReality && (
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <span className="text-green-400 font-medium">Antwoord overgenomen uit quick check:</span>
                          <span className="text-green-300 italic">"{quizPreFillData.budgetReality}"</span>
                        </div>
                      </div>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 14: IT Maturity */}
                {currentStep === 14 && (
                  <motion.div
                    key="step14"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
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

                {/* Step 15: Contact Info */}
                {currentStep === 15 && (
                  <motion.div
                    key="step15"
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

                {/* Step 15/16: Confirmation - This will be handled by the navigation logic below */}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    const prevStep = getPreviousStep(currentStep);
                    setCurrentStep(prevStep);
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
                        const nextStep = getNextStep(currentStep);
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