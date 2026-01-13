'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, ArrowRight, FileText, AlertTriangle, Rocket, Clock, Shield, Zap } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';

interface ProposalData {
  hasAssessment: string;
  systemCount: string;
  systems: string[];
  budget: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  employees: string;
  mainGoal: string;
  customSystemsApis: string;
  customSystemsPlatform: string;
}

export default function ImplementationProposalPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProposalData>({
    hasAssessment: '',
    systemCount: '',
    systems: [],
    budget: '',
    timeline: '',
    name: user?.displayName || user?.firstName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    company: user?.company || '',
    role: user?.jobTitle || '',
    employees: '',
    mainGoal: '',
    customSystemsApis: '',
    customSystemsPlatform: ''
  });
  const [customSystems, setCustomSystems] = useState('');
  const [showRedirect, setShowRedirect] = useState(false);
  const [showAssessmentWarning, setShowAssessmentWarning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const systemOptions = [
    'ServiceNow', 'Salesforce', 'SAP', 'Microsoft 365', 
    'Eigen software', 'CRM systeem', 'ERP systeem', 'Anders'
  ];

  const handleSystemToggle = (system: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        systems: [...prev.systems, system]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        systems: prev.systems.filter(s => s !== system)
      }));
    }
  };

  const handleAssessmentChange = (value: string) => {
    setFormData(prev => ({ ...prev, hasAssessment: value }));
    if (value === 'no') {
      setShowAssessmentWarning(true);
    } else {
      setShowAssessmentWarning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Submit implementation proposal data
      const response = await fetch('/api/implementation-proposal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          entryPoint: 'implementation_proposal',
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // If user is already logged in, save to their account automatically
        if (user) {
          await fetch('/api/user/link-proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.uid,
              proposalId: data.proposalId,
              source: 'logged_in_user'
            })
          });
          
          // Redirect to dashboard with proposal
          window.location.href = `/dashboard?proposal=${data.proposalId}&first=true`;
        } else {
          // Show submission success
          setIsSubmitted(true);
        }
      } else {
        console.error('Implementation proposal submission failed');
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Implementation proposal submission error:', error);
      setIsSubmitted(true);
    }
  };

  if (showRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12"
            >
              <div
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
              >
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4 tracking-[-0.02em]">
                Assessment Aanbevolen
              </h1>
              <p className="text-white/70 mb-8 text-lg leading-relaxed">
                Je krijgt meer uit een implementation proposal na een assessment.
                We kunnen dan veel specifieker zijn over wat er nodig is.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/agent-readiness">
                  <Button
                    size="lg"
                    className="text-white font-semibold px-8 py-6 transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                      boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)'
                    }}
                  >
                    Start eerst met gratis assessment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowRedirect(false)}
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6"
                >
                  Toch doorgaan zonder assessment
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#080D14' }}>
      {/* Subtle section divider at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-12 sm:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
              <span
                className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.4)',
                }}
              >
                Implementation
              </span>{' '}
              Proposal
            </h1>
            <p className="text-lg sm:text-xl text-white/65 max-w-2xl mx-auto leading-relaxed">
              Voor bedrijven die klaar zijn voor volledige agent infrastructure
            </p>
          </motion.div>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { icon: Rocket, text: 'Custom Roadmap' },
              { icon: Clock, text: '48 uur response' },
              { icon: Shield, text: 'ROI Garantie' },
              { icon: Zap, text: 'Snelle implementatie' }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
              >
                <item.icon className="w-6 h-6 mx-auto mb-2 text-[#FF9F43]" />
                <span className="text-white/80 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <form className="space-y-10">
                {/* Assessment Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-[-0.02em]">
                      Heb je al een assessment gedaan?
                    </h2>
                  </div>
                  <RadioGroup value={formData.hasAssessment} onValueChange={handleAssessmentChange}>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { value: 'assessment', label: 'Ja, assessment compleet', icon: CheckCircle },
                        { value: 'pilot', label: 'Ja, pilot gedaan', icon: Rocket },
                        { value: 'no', label: 'Nee, nog niet', icon: Clock }
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`relative flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                            formData.hasAssessment === option.value
                              ? 'border-[#F87315] bg-[#F87315]/10'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                          }`}
                          onClick={() => handleAssessmentChange(option.value)}
                        >
                          <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                          <option.icon className={`w-5 h-5 mr-3 ${formData.hasAssessment === option.value ? 'text-[#FF9F43]' : 'text-white/50'}`} />
                          <Label htmlFor={option.value} className="text-white/80 cursor-pointer text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* System Count */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-[-0.02em]">
                      Hoeveel systemen wil je agent-ready maken?
                    </h2>
                  </div>
                  <RadioGroup value={formData.systemCount} onValueChange={(value) => setFormData(prev => ({ ...prev, systemCount: value }))}>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        { value: 'starter', label: 'Starter', systems: '1-2 systemen', price: '€15-25k' },
                        { value: 'growth', label: 'Growth', systems: '3-5 systemen', price: '€25-50k', popular: true },
                        { value: 'enterprise', label: 'Enterprise', systems: '5+ systemen', price: '€50k+' }
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`relative p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
                            formData.systemCount === option.value
                              ? 'border-[#F87315] bg-[#F87315]/10'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, systemCount: option.value }))}
                        >
                          {option.popular && (
                            <span className="absolute -top-2 left-4 px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: '#10B981' }}>
                              POPULAIR
                            </span>
                          )}
                          <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                          <div className="text-lg font-semibold text-white mb-1">{option.label}</div>
                          <div className="text-white/60 text-sm">{option.systems}</div>
                          <div className="text-[#FF9F43] font-bold mt-2">{option.price}</div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Systems Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-[-0.02em]">
                      Welke systemen? (selecteer alle)
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {systemOptions.map((system) => (
                      <div
                        key={system}
                        className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                          formData.systems.includes(system)
                            ? 'border-[#F87315] bg-[#F87315]/10'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                        }`}
                        onClick={() => handleSystemToggle(system, !formData.systems.includes(system))}
                      >
                        <input
                          type="checkbox"
                          id={system}
                          checked={formData.systems.includes(system)}
                          onChange={(e) => handleSystemToggle(system, e.target.checked)}
                          className="sr-only"
                        />
                        <CheckCircle className={`w-4 h-4 mr-2 flex-shrink-0 ${formData.systems.includes(system) ? 'text-[#FF9F43]' : 'text-white/30'}`} />
                        <Label htmlFor={system} className="text-white/80 text-sm cursor-pointer">
                          {system}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Custom Systems Input */}
                  {formData.systems.includes('Anders') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/10"
                    >
                      <Label htmlFor="customSystems" className="text-white/80 text-sm">
                        Welke andere systemen? (gescheiden door komma's)
                      </Label>
                      <Input
                        id="customSystems"
                        value={customSystems}
                        onChange={(e) => setCustomSystems(e.target.value)}
                        className="bg-white/5 border-white/20 text-white mt-2 focus:border-[#FF9F43] focus:ring-[#FF9F43]/20"
                        placeholder="Bijv. QuickBooks, Exact Online, eigen CRM systeem, legacy database"
                      />
                      <p className="text-white/50 text-xs mt-2">
                        Lijst alle systemen die je agent-ready wilt maken
                      </p>
                    </motion.div>
                  )}

                  {/* Progressive Disclosure for Custom Software */}
                  {formData.systems.includes('Eigen software') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-5"
                    >
                      <div>
                        <Label className="text-white text-sm font-medium">Heeft je eigen software al APIs?</Label>
                        <RadioGroup
                          value={formData.customSystemsApis}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, customSystemsApis: value }))}
                        >
                          <div className="flex gap-4 mt-3">
                            {['yes', 'no', 'unknown'].map((val) => (
                              <div
                                key={val}
                                className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-all duration-300 ${
                                  formData.customSystemsApis === val
                                    ? 'border-[#F87315] bg-[#F87315]/10'
                                    : 'border-white/10 hover:border-white/20'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, customSystemsApis: val }))}
                              >
                                <RadioGroupItem value={val} id={`apis-${val}`} className="sr-only" />
                                <Label htmlFor={`apis-${val}`} className="text-white/80 text-sm cursor-pointer">
                                  {val === 'yes' ? 'Ja' : val === 'no' ? 'Nee' : 'Weet niet'}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label htmlFor="platform" className="text-white text-sm font-medium">Welke programmeertaal/platform?</Label>
                        <Input
                          id="platform"
                          value={formData.customSystemsPlatform}
                          onChange={(e) => setFormData(prev => ({ ...prev, customSystemsPlatform: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white mt-2 focus:border-[#FF9F43] focus:ring-[#FF9F43]/20"
                          placeholder="Bijv. .NET, Java, PHP, Python, Node.js"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Main Goal */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <Label htmlFor="mainGoal" className="text-xl font-bold text-white tracking-[-0.02em]">
                      Wat is je belangrijkste doel met agents?
                    </Label>
                  </div>
                  <Textarea
                    id="mainGoal"
                    value={formData.mainGoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, mainGoal: e.target.value }))}
                    className="bg-white/[0.03] border-white/10 text-white focus:border-[#FF9F43] focus:ring-[#FF9F43]/20 rounded-xl min-h-[120px]"
                    placeholder="Bijv. 'Automatiseren van order processing en klantcommunicatie om 50% tijd te besparen'"
                    rows={4}
                  />
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Budget & Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <span className="text-white font-bold text-sm">5</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-[-0.02em]">
                      Budget & Timeline
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                      <h3 className="text-base font-semibold text-white mb-4">Budget range</h3>
                      <RadioGroup value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                        <div className="space-y-2">
                          {[
                            { value: '15-25k', label: '€15-25k' },
                            { value: '25-50k', label: '€25-50k' },
                            { value: '50k+', label: '€50k+' },
                            { value: 'tbd', label: 'Nog te bepalen' }
                          ].map((option) => (
                            <div
                              key={option.value}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                                formData.budget === option.value
                                  ? 'border-[#F87315] bg-[#F87315]/10'
                                  : 'border-white/5 hover:border-white/20'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, budget: option.value }))}
                            >
                              <RadioGroupItem value={option.value} id={`budget-${option.value}`} className="sr-only" />
                              <Label htmlFor={`budget-${option.value}`} className="text-white/80 text-sm cursor-pointer">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                      <h3 className="text-base font-semibold text-white mb-4">Timeline</h3>
                      <RadioGroup value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                        <div className="space-y-2">
                          {[
                            { value: 'q1-2025', label: 'Q1 2025' },
                            { value: 'q2-2025', label: 'Q2 2025' },
                            { value: 'h2-2025', label: 'H2 2025' }
                          ].map((option) => (
                            <div
                              key={option.value}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                                formData.timeline === option.value
                                  ? 'border-[#F87315] bg-[#F87315]/10'
                                  : 'border-white/5 hover:border-white/20'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, timeline: option.value }))}
                            >
                              <RadioGroupItem value={option.value} id={`timeline-${option.value}`} className="sr-only" />
                              <Label htmlFor={`timeline-${option.value}`} className="text-white/80 text-sm cursor-pointer">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Contact Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <span className="text-white font-bold text-sm">6</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-[-0.02em]">
                      Contactgegevens
                    </h2>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="pname" className="text-white/80 text-sm">Naam *</Label>
                        <Input
                          id="pname"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-white/[0.03] border-white/10 text-white mt-1.5 focus:border-[#FF9F43] focus:ring-[#FF9F43]/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pcompany" className="text-white/80 text-sm">Bedrijf *</Label>
                        <Input
                          id="pcompany"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          className="bg-white/[0.03] border-white/10 text-white mt-1.5 focus:border-[#FF9F43] focus:ring-[#FF9F43]/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pemail" className="text-white/80 text-sm">Email *</Label>
                        <Input
                          id="pemail"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-white/[0.03] border-white/10 text-white mt-1.5 focus:border-[#FF9F43] focus:ring-[#FF9F43]/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pphone" className="text-white/80 text-sm">Telefoon</Label>
                        <Input
                          id="pphone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-white/[0.03] border-white/10 text-white mt-1.5 focus:border-[#FF9F43] focus:ring-[#FF9F43]/20"
                          placeholder="+31 6 12345678"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prole" className="text-white/80 text-sm">Rol</Label>
                        <Input
                          id="prole"
                          value={formData.role}
                          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                          className="bg-white/[0.03] border-white/10 text-white mt-1.5 focus:border-[#FF9F43] focus:ring-[#FF9F43]/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pemployees" className="text-white/80 text-sm">Aantal medewerkers</Label>
                        <select
                          id="pemployees"
                          value={formData.employees}
                          onChange={(e) => setFormData(prev => ({ ...prev, employees: e.target.value }))}
                          className="w-full bg-white/[0.03] border border-white/10 text-white rounded-lg px-3 py-2 mt-1.5 focus:border-[#FF9F43] focus:outline-none transition-colors"
                        >
                          <option value="" className="bg-[#080D14]">Selecteer...</option>
                          <option value="1-10" className="bg-[#080D14]">1-10 medewerkers</option>
                          <option value="11-50" className="bg-[#080D14]">11-50 medewerkers</option>
                          <option value="51-250" className="bg-[#080D14]">51-250 medewerkers</option>
                          <option value="250+" className="bg-[#080D14]">250+ medewerkers</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="text-center pt-6">
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    size="lg"
                    className="text-white font-semibold px-12 py-6 text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                      boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)'
                    }}
                  >
                    <FileText className="mr-2 w-5 h-5" />
                    Request Proposal
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  <p className="text-white/50 text-sm mt-4">
                    Ontvang custom proposal binnen 48 uur
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}