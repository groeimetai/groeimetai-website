'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomRadioGroup, CustomRadioGroupItem } from '@/components/ui/custom-radio';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { logResourceActivity, logErrorActivity } from '@/services/activityLogger';
import {
  User,
  Building,
  Mail,
  Phone,
  FileText,
  Upload,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
  Shield,
  Zap,
  MessageSquare,
  TrendingUp,
  Lock,
  Users,
  AlertCircle,
  Brain,
  Bot,
  Layers,
  Workflow,
  Sparkles,
  Chrome,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// Steps will be defined inside the component to use translations

const budgetRanges = [
  'Under $10,000',
  '$10,000 - $50,000',
  '$50,000 - $100,000',
  '$100,000 - $500,000',
  'Over $500,000',
];

const timelines = [
  'Immediate (< 1 month)',
  'Short-term (1-3 months)',
  'Medium-term (3-6 months)',
  'Long-term (6+ months)',
];

interface QuoteRequestFormProps {
  isDialog?: boolean;
  onSuccess?: () => void;
  preselectedService?: string;
}

export default function QuoteRequestForm({
  isDialog = false,
  onSuccess,
  preselectedService,
}: QuoteRequestFormProps) {
  const router = useRouter();
  const { register, user, firebaseUser, loginWithGoogle } = useAuth();
  const t = useTranslations('auth.quoteRequest');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to determine if user is logged in
  const isLoggedIn = !!user;

  const steps = isLoggedIn
    ? [
        { id: 1, title: t('form.serviceSelection'), icon: Sparkles, type: 'service' },
        { id: 2, title: t('form.projectDetails'), icon: FileText, type: 'project' },
        { id: 3, title: t('form.requirements'), icon: Building, type: 'requirements' },
        { id: 4, title: t('form.review'), icon: Check, type: 'review' },
      ]
    : [
        { id: 1, title: t('form.accountSetup'), icon: Shield, type: 'account' },
        { id: 2, title: t('form.serviceSelection'), icon: Sparkles, type: 'service' },
        { id: 3, title: t('form.contactInfo'), icon: User, type: 'contact' },
        { id: 4, title: t('form.projectDetails'), icon: FileText, type: 'project' },
        { id: 5, title: t('form.requirements'), icon: Building, type: 'requirements' },
        { id: 6, title: t('form.review'), icon: Check, type: 'review' },
      ];

  // Helper to get current step type
  const getCurrentStepType = () => {
    return steps.find((step) => step.id === currentStep)?.type || '';
  };

  const [formData, setFormData] = useState({
    // Account Setup
    accountType: isLoggedIn ? 'account' : 'account', // 'account' or 'guest'
    password: '',
    confirmPassword: '',

    // Contact Information
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    company: '',
    jobTitle: '',

    // Project Details
    projectName: '',
    services: preselectedService ? [preselectedService] : ([] as string[]),
    projectDescription: '',

    // Requirements
    budget: '',
    timeline: '',
    additionalRequirements: '',

    // Files
    attachments: [] as File[],
  });

  // Load user data if logged in
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData((prev) => ({
              ...prev,
              fullName: userData.displayName || user.displayName || '',
              email: user.email || '',
              phone: userData.phoneNumber || '',
              company: userData.company || '',
              jobTitle: userData.jobTitle || '',
            }));
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateStep = () => {
    const stepType = getCurrentStepType();

    switch (stepType) {
      case 'account':
        if (formData.accountType === 'account') {
          return (
            formData.password &&
            formData.confirmPassword &&
            formData.password === formData.confirmPassword
          );
        }
        return true; // Guest can proceed
      case 'service':
        return formData.services.length > 0; // At least one service must be selected
      case 'contact':
        return formData.fullName && formData.email && formData.company;
      case 'project':
        return formData.projectName && formData.projectDescription;
      case 'requirements':
        return formData.budget && formData.timeline;
      case 'review':
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      let userId = user?.uid || null;

      // Create account if requested (only for non-logged in users)
      if (!isLoggedIn && formData.accountType === 'account') {
        try {
          await register(formData.email, formData.password, {
            displayName: formData.fullName,
            firstName: formData.fullName.split(' ')[0],
            lastName: formData.fullName.split(' ').slice(1).join(' '),
            phoneNumber: formData.phone,
            company: formData.company,
            jobTitle: formData.jobTitle,
            accountType: 'customer',
          });

          // The register function now signs out the user after registration
          // so they need to verify their email first
          setEmailVerificationSent(true);
          
          // User is signed out, so no userId
          userId = null;
        } catch (authError: any) {
          console.error('Failed to create account:', authError);
          if (authError.code === 'auth/email-already-in-use') {
            setError(t('errors.emailInUse'));
          } else if (authError.code === 'auth/weak-password') {
            setError(t('errors.weakPassword'));
          } else {
            setError(t('errors.accountCreationFailed'));
          }
          setIsSubmitting(false);
          return;
        }
      }

      // Submit quote to Firestore
      const quoteData = {
        userId: userId || null,
        accountType: formData.accountType,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company,
        jobTitle: formData.jobTitle || null,
        projectName: formData.projectName,
        services: formData.services,
        projectDescription: formData.projectDescription,
        budget: formData.budget,
        timeline: formData.timeline,
        additionalRequirements: formData.additionalRequirements || null,
        attachmentCount: uploadedFiles.length,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const quoteRef = await addDoc(collection(db, 'quotes'), quoteData);

      // Log activity
      await logResourceActivity(
        'quote.create',
        'quote',
        quoteRef.id,
        formData.projectName,
        {
          uid: userId || 'guest',
          email: formData.email,
          displayName: formData.fullName,
        },
        {
          services: formData.services,
          budget: formData.budget,
          timeline: formData.timeline,
          accountType: formData.accountType,
        }
      );

      // Send email notification to admin
      try {
        const emailResponse = await fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'new-project-request',
            data: {
              projectName: formData.projectName,
              companyName: formData.company,
              recipientName: formData.fullName,
              recipientEmail: formData.email,
              services: formData.services,
              budget: formData.budget,
              timeline: formData.timeline,
              description: formData.projectDescription,
              requestId: quoteRef.id,
            },
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json().catch(() => ({}));
          console.warn('Email notification failed:', errorData);
          // Log but don't show error to user - email is not critical for submission
        }
      } catch (emailError) {
        console.warn('Failed to send email notification:', emailError);
        // Don't fail the submission if email fails - it's not critical
      }

      // Create a project only if user is logged in AND email is verified
      if ((userId || user?.uid) && firebaseUser?.emailVerified) {
        const projectData = {
          userId: userId || user?.uid,
          quoteId: quoteRef.id,
          name: formData.projectName,
          description: formData.projectDescription,
          services: formData.services,
          budget: formData.budget,
          timeline: formData.timeline,
          status: 'active',
          progress: 0,
          startDate: serverTimestamp(),
          endDate: null,
          tasks: [],
          team: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const projectRef = await addDoc(collection(db, 'projects'), projectData);

        // Log project creation
        await logResourceActivity(
          'project.create',
          'project',
          projectRef.id,
          formData.projectName,
          {
            uid: userId || user?.uid || 'unknown',
            email: formData.email,
            displayName: formData.fullName,
          },
          {
            services: formData.services,
            budget: formData.budget,
            timeline: formData.timeline,
            quoteId: quoteRef.id,
          }
        );
      } else if ((userId || user?.uid) && !firebaseUser?.emailVerified) {
        // User created account but email not verified yet
        // Project will be created later when email is verified
        console.log('Quote created, but project creation deferred until email verification');
      }

      // TODO: Upload attachments to Firebase Storage

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        if (mounted) {
          // If email verification was sent, redirect to a page that tells them to verify
          if (emailVerificationSent) {
            router.push('/verify-email?email=' + encodeURIComponent(formData.email));
          } else {
            router.push('/quote-success');
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to submit quote request:', error);
      setError(t('errors.submissionFailed'));

      // Log error
      await logErrorActivity(
        'quote.create',
        error,
        {
          uid: user?.uid || 'guest',
          email: formData.email,
          displayName: formData.fullName,
        },
        {
          formData: {
            projectName: formData.projectName,
            services: formData.services,
            budget: formData.budget,
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-black/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/10"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? 'text-primary' : 'text-white/60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step.id < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.id === currentStep
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-white/10'
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs text-center hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {/* Account Setup (only for non-logged in users) */}
          {getCurrentStepType() === 'account' && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">{t('getStarted')}</h2>
                <p className="text-white/60">{t('getStartedDescription')}</p>
              </div>

              <CustomRadioGroup
                value={formData.accountType}
                onValueChange={(value) => handleInputChange('accountType', value)}
                className="space-y-4"
              >
                <div className="border border-orange/30 rounded-lg p-6 hover:border-orange/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <CustomRadioGroupItem value="account" id="create-account" />
                    <div className="flex-1">
                      <Label
                        htmlFor="create-account"
                        className="text-lg font-semibold text-white cursor-pointer"
                      >
                        {t('createAccount')}
                      </Label>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-orange mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {t('accountBenefits.portal.title')}
                            </p>
                            <p className="text-xs text-white/60">
                              {t('accountBenefits.portal.description')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <MessageSquare className="w-5 h-5 text-orange mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {t('accountBenefits.communication.title')}
                            </p>
                            <p className="text-xs text-white/60">
                              {t('accountBenefits.communication.description')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <TrendingUp className="w-5 h-5 text-orange mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {t('accountBenefits.insights.title')}
                            </p>
                            <p className="text-xs text-white/60">
                              {t('accountBenefits.insights.description')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Zap className="w-5 h-5 text-orange mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {t('accountBenefits.support.title')}
                            </p>
                            <p className="text-xs text-white/60">
                              {t('accountBenefits.support.description')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {formData.accountType === 'account' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 space-y-4"
                        >
                          <div>
                            <Label htmlFor="password" className="text-white">
                              {t('passwordLabel')}
                            </Label>
                            <div className="relative mt-1">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                              <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="pl-10"
                                placeholder={t('passwordPlaceholder')}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword" className="text-white">
                              {t('confirmPasswordLabel')}
                            </Label>
                            <div className="relative mt-1">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                  handleInputChange('confirmPassword', e.target.value)
                                }
                                className="pl-10"
                                placeholder={t('confirmPasswordPlaceholder')}
                              />
                            </div>
                            {formData.password &&
                              formData.confirmPassword &&
                              formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">{t('passwordMismatch')}</p>
                              )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border border-white/20 rounded-lg p-6 hover:border-white/30 transition-colors">
                  <div className="flex items-start space-x-3">
                    <CustomRadioGroupItem value="guest" id="continue-guest" />
                    <div className="flex-1">
                      <Label
                        htmlFor="continue-guest"
                        className="text-lg font-semibold text-white cursor-pointer"
                      >
                        {t('continueAsGuest')}
                      </Label>
                      <p className="text-sm text-white/60 mt-1">{t('guestDescription')}</p>
                    </div>
                  </div>
                </div>
              </CustomRadioGroup>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black text-white/60">{t('orDivider')}</span>
                </div>
              </div>

              {/* Google Sign Up */}
              <Button
                type="button"
                onClick={async () => {
                  setIsGoogleLoading(true);
                  setError('');
                  try {
                    await loginWithGoogle();
                    // If successful, move to next step
                    setCurrentStep((prev) => prev + 1);
                  } catch (error: any) {
                    console.error('Google sign up failed:', error);
                    if (error.code !== 'auth/popup-closed-by-user') {
                      setError(t('errors.general'));
                    }
                  } finally {
                    setIsGoogleLoading(false);
                  }
                }}
                disabled={isGoogleLoading}
                variant="outline"
                className="w-full border-white/20 hover:bg-white/10 text-white py-6 text-lg font-medium"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t('continueWithGoogle')}
                  </>
                )}
              </Button>

              <div className="bg-orange/10 border border-orange/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-orange mt-0.5" />
                  <div className="text-sm">
                    <p className="text-white font-medium">{t('accountMessage.title')}</p>
                    <p className="text-white/60 mt-1">{t('accountMessage.description')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Service Selection */}
          {getCurrentStepType() === 'service' && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">{t('servicesTitle')}</h2>
                <p className="text-white/60">{t('servicesSubtitle')}</p>
              </div>

              <div>
                <Label className="text-white mb-4 block">{t('selectServicesLabel')}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'genai-consultancy',
                      title: t('form.services.genai'),
                      description: t('form.services.genaiDesc'),
                      icon: Brain,
                    },
                    {
                      id: 'llm-integration',
                      title: t('form.services.llm'),
                      description: t('form.services.llmDesc'),
                      icon: Bot,
                    },
                    {
                      id: 'rag-architecture',
                      title: t('form.services.rag'),
                      description: t('form.services.ragDesc'),
                      icon: Layers,
                    },
                    {
                      id: 'servicenow-ai',
                      title: t('form.services.servicenow'),
                      description: t('form.services.servicenowDesc'),
                      icon: Workflow,
                    },
                    {
                      id: 'multi-agent',
                      title: t('form.services.multiAgent'),
                      description: t('form.services.multiAgentDesc'),
                      icon: Users,
                    },
                    {
                      id: 'custom-solutions',
                      title: t('form.services.security'),
                      description: t('form.services.securityDesc'),
                      icon: Chrome,
                    },
                  ].map((service) => {
                    const Icon = service.icon;
                    const isSelected = formData.services.includes(service.id);
                    return (
                      <label
                        key={service.id}
                        className={`
                          relative flex flex-col p-4 rounded-xl border cursor-pointer
                          transition-all duration-200 hover:shadow-lg
                          ${
                            isSelected
                              ? 'border-orange bg-orange/10 shadow-lg'
                              : 'border-white/20 hover:border-orange/50 hover:bg-white/5'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleServiceToggle(service.id)}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                              p-2 rounded-lg transition-colors
                              ${isSelected ? 'bg-orange text-white' : 'bg-white/10 text-white/60'}
                            `}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">{service.title}</h4>
                            <p className="text-sm text-white/60">{service.description}</p>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-orange absolute top-4 right-4" />
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-orange/10 border border-orange/20 rounded-lg p-4">
                <p className="text-sm text-white/80">
                  <AlertCircle className="w-4 h-4 inline mr-2 text-orange" />
                  {t('multipleServicesNote')}
                </p>
              </div>
            </motion.div>
          )}

          {/* Contact Information (only for non-logged in users) */}
          {getCurrentStepType() === 'contact' && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">{t('contactTitle')}</h2>
                <p className="text-white/60">{t('contactDescription')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-white">
                    {t('fullNameLabel')}
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="pl-10"
                      placeholder={t('fullNamePlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">
                    {t('emailLabel')}
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      placeholder={t('emailPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white">
                    {t('phoneLabel')}
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      placeholder={t('phonePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company" className="text-white">
                    {t('companyLabel')}
                  </Label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="pl-10"
                      placeholder={t('companyPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="jobTitle" className="text-white">
                    {t('jobTitleLabel')}
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder={t('jobTitlePlaceholder')}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Project Details */}
          {getCurrentStepType() === 'project' && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">{t('projectTitle')}</h2>
                <p className="text-white/60">{t('projectDescription')}</p>
              </div>

              <div>
                <Label htmlFor="projectName" className="text-white">
                  {t('projectNameLabel')}
                </Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  placeholder={t('projectNamePlaceholder')}
                  required
                  className="mt-1"
                />
              </div>

              {/* Show selected services as read-only */}
              {formData.services.length > 0 && (
                <div className="bg-orange/10 border border-orange/20 rounded-lg p-4">
                  <Label className="text-white mb-2 block">{t('servicesLabel')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((serviceId) => {
                      // Map service IDs to translated names
                      const serviceNames: { [key: string]: string } = {
                        'genai-consultancy': t('form.services.genai'),
                        'llm-integration': t('form.services.llm'),
                        'rag-architecture': t('form.services.rag'),
                        'servicenow-ai': t('form.services.servicenow'),
                        'multi-agent': t('form.services.multiAgent'),
                        'custom-solutions': t('form.services.security'),
                      };
                      return (
                        <Badge 
                          key={serviceId} 
                          variant="outline" 
                          className="text-orange border-orange/50"
                        >
                          {serviceNames[serviceId] || serviceId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="projectDescription" className="text-white">
                  {t('projectDescriptionLabel')}
                </Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  placeholder={t('projectDescriptionPlaceholder')}
                  rows={6}
                  required
                  className="mt-1"
                />
              </div>
            </motion.div>
          )}

          {/* Requirements */}
          {getCurrentStepType() === 'requirements' && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">{t('requirementsTitle')}</h2>
                <p className="text-white/60">{t('requirementsDescription')}</p>
              </div>

              <div>
                <Label className="text-white">{t('budgetLabel')}</Label>
                <CustomRadioGroup
                  value={formData.budget}
                  onValueChange={(value) => handleInputChange('budget', value)}
                  className="mt-3 space-y-2"
                >
                  {budgetRanges.map((range, index) => (
                    <div key={range} className="flex items-center space-x-2">
                      <CustomRadioGroupItem value={range} id={`budget-${index}`} />
                      <Label
                        htmlFor={`budget-${index}`}
                        className="font-normal cursor-pointer text-white"
                      >
                        {range}
                      </Label>
                    </div>
                  ))}
                </CustomRadioGroup>
              </div>

              <div>
                <Label className="text-white">{t('timelineLabel')}</Label>
                <CustomRadioGroup
                  value={formData.timeline}
                  onValueChange={(value) => handleInputChange('timeline', value)}
                  className="mt-3 space-y-2"
                >
                  {timelines.map((timeline, index) => (
                    <div key={timeline} className="flex items-center space-x-2">
                      <CustomRadioGroupItem value={timeline} id={`timeline-${index}`} />
                      <Label
                        htmlFor={`timeline-${index}`}
                        className="font-normal cursor-pointer text-white"
                      >
                        {timeline}
                      </Label>
                    </div>
                  ))}
                </CustomRadioGroup>
              </div>

              <div>
                <Label htmlFor="additionalRequirements" className="text-white">
                  {t('additionalRequirementsLabel')}
                </Label>
                <Textarea
                  id="additionalRequirements"
                  value={formData.additionalRequirements}
                  onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                  placeholder={t('additionalRequirementsPlaceholder')}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-white">{t('attachmentsLabel')}</Label>
                <p className="text-sm text-white/60 mb-3">{t('attachmentsDescription')}</p>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-white/60" />
                    <p className="text-sm text-white/60">{t('uploadLabel')}</p>
                    <p className="text-xs text-white/60 mt-1">{t('uploadTypes')}</p>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Review & Submit */}
          {getCurrentStepType() === 'review' && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">{t('reviewTitle')}</h2>
                <p className="text-white/60">{t('reviewDescription')}</p>
              </div>

              <div className="space-y-4">
                {!isLoggedIn && formData.accountType === 'account' && (
                  <div className="p-4 bg-orange/10 rounded-lg">
                    <h3 className="font-semibold mb-2 text-white">{t('accountDetailsTitle')}</h3>
                    <div className="text-sm">
                      <p className="text-white">
                        <span className="text-white/60">{t('accountType')}</span> {t('fullAccount')}
                      </p>
                      <p className="text-white/60 text-xs mt-1">{t('accountInfo')}</p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-white">{t('contactInfoTitle')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p className="text-white">
                      <span className="text-white/60">{t('name')}</span> {formData.fullName}
                    </p>
                    <p className="text-white">
                      <span className="text-white/60">{t('email')}</span> {formData.email}
                    </p>
                    <p className="text-white">
                      <span className="text-white/60">{t('phone')}</span>{' '}
                      {formData.phone || t('notProvided')}
                    </p>
                    <p className="text-white">
                      <span className="text-white/60">{t('company')}</span> {formData.company}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-white">{t('projectDetailsTitle')}</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-white">
                      <span className="text-white/60">{t('project')}</span> {formData.projectName}
                    </p>
                    <p className="text-white">
                      <span className="text-white/60">{t('services')}</span>{' '}
                      {formData.services.join(', ')}
                    </p>
                    <p className="text-white/60">{t('description')}</p>
                    <p className="whitespace-pre-wrap text-white">{formData.projectDescription}</p>
                  </div>
                </div>

                <div className="p-4 bg-white/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-white">{t('requirementsSection')}</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-white">
                      <span className="text-white/60">{t('budget')}</span> {formData.budget}
                    </p>
                    <p className="text-white">
                      <span className="text-white/60">{t('timeline')}</span> {formData.timeline}
                    </p>
                    {formData.attachments.length > 0 && (
                      <p className="text-white">
                        <span className="text-white/60">{t('attachments')}</span>{' '}
                        {t('fileCount', { count: formData.attachments.length })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-sm text-white">{t('termsNotice')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="min-w-[100px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('previous')}
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={!validateStep()} className="min-w-[100px]">
              {t('next')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[100px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  {t('submitRequest')}
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
