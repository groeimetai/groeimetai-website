'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// Steps will be defined inside the component to use translations

const services = [
  'GenAI Consulting',
  'ServiceNow Solutions',
  'Custom AI Development',
  'Enterprise Security',
  'Performance Optimization',
  'Training & Support',
];

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

export default function QuoteRequestForm() {
  const router = useRouter();
  const { register } = useAuth();
  const t = useTranslations('auth.quoteRequest');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const steps = [
    { id: 1, title: t('form.accountSetup'), icon: Shield },
    { id: 2, title: t('form.contactInfo'), icon: User },
    { id: 3, title: t('form.projectDetails'), icon: FileText },
    { id: 4, title: t('form.requirements'), icon: Building },
    { id: 5, title: t('form.review'), icon: Check },
  ];

  const [formData, setFormData] = useState({
    // Account Setup
    accountType: 'account', // 'account' or 'guest'
    password: '',
    confirmPassword: '',

    // Contact Information
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',

    // Project Details
    projectName: '',
    services: [] as string[],
    projectDescription: '',

    // Requirements
    budget: '',
    timeline: '',
    additionalRequirements: '',

    // Files
    attachments: [] as File[],
  });

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
    switch (currentStep) {
      case 1:
        if (formData.accountType === 'account') {
          return (
            formData.password &&
            formData.confirmPassword &&
            formData.password === formData.confirmPassword
          );
        }
        return true; // Guest can proceed
      case 2:
        return formData.fullName && formData.email && formData.company;
      case 3:
        return formData.projectName && formData.services.length > 0 && formData.projectDescription;
      case 4:
        return formData.budget && formData.timeline;
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
      let userId = null;

      // Create account if requested
      if (formData.accountType === 'account') {
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

          // Get the current user ID after registration
          const auth = await import('firebase/auth').then((m) => m.getAuth());
          userId = auth.currentUser?.uid;
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

      await addDoc(collection(db, 'quotes'), quoteData);

      // TODO: Upload attachments to Firebase Storage

      // Redirect to success page
      router.push('/quote-success');
    } catch (error) {
      console.error('Failed to submit quote request:', error);
      setError(t('errors.submissionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

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
          {/* Step 1: Account Setup */}
          {currentStep === 1 && (
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

              <RadioGroup
                value={formData.accountType}
                onValueChange={(value) => handleInputChange('accountType', value)}
                className="space-y-4"
              >
                <div className="border border-orange/30 rounded-lg p-6 hover:border-orange/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="account" id="create-account" />
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
                    <RadioGroupItem value="guest" id="continue-guest" />
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
              </RadioGroup>

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

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
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

          {/* Step 3: Project Details */}
          {currentStep === 3 && (
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

              <div>
                <Label className="text-white">{t('servicesLabel')}</Label>
                <p className="text-sm text-white/60 mb-3">{t('servicesDescription')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <label
                      key={service}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.services.includes(service)
                          ? 'border-primary bg-primary/5'
                          : 'border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="mr-3"
                      />
                      <span className="text-sm text-white">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

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

          {/* Step 4: Requirements */}
          {currentStep === 4 && (
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
                <RadioGroup
                  value={formData.budget}
                  onValueChange={(value) => handleInputChange('budget', value)}
                  className="mt-3 space-y-2"
                >
                  {budgetRanges.map((range, index) => (
                    <div key={range} className="flex items-center space-x-2">
                      <RadioGroupItem value={range} id={`budget-${index}`} />
                      <Label
                        htmlFor={`budget-${index}`}
                        className="font-normal cursor-pointer text-white"
                      >
                        {range}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-white">{t('timelineLabel')}</Label>
                <RadioGroup
                  value={formData.timeline}
                  onValueChange={(value) => handleInputChange('timeline', value)}
                  className="mt-3 space-y-2"
                >
                  {timelines.map((timeline, index) => (
                    <div key={timeline} className="flex items-center space-x-2">
                      <RadioGroupItem value={timeline} id={`timeline-${index}`} />
                      <Label
                        htmlFor={`timeline-${index}`}
                        className="font-normal cursor-pointer text-white"
                      >
                        {timeline}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
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

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
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
                {formData.accountType === 'account' && (
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
