'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, ArrowRight, Building, FileText, AlertTriangle, Phone, Mail, User } from 'lucide-react';
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-8"
            >
              <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-orange-400" />
              <h1 className="text-3xl font-bold text-white mb-4">
                Assessment Aanbevolen
              </h1>
              <p className="text-white/80 mb-6">
                Je krijgt meer uit een implementation proposal na een assessment. 
                We kunnen dan veel specifieker zijn over wat er nodig is.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/agent-readiness">
                  <Button
                    size="lg"
                    className="text-white"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    Start eerst met gratis assessment
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowRedirect(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
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
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span
                className="text-white px-4 py-2 inline-block"
                style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
              >
                Implementation
              </span>{' '}
              Proposal
            </h1>
            <p className="text-xl text-white/80">
              Voor bedrijven die klaar zijn voor volledige agent infrastructure
            </p>
          </motion.div>

          {/* Form */}
          <Card className="bg-white/5 border border-white/10">
            <CardContent className="p-8">
              <form className="space-y-8">
                {/* Assessment Status */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Heb je al een assessment gedaan?
                  </h2>
                  <RadioGroup value={formData.hasAssessment} onValueChange={handleAssessmentChange}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="assessment" id="assessment" />
                        <Label htmlFor="assessment" className="text-white/80">Ja, assessment compleet</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="pilot" id="pilot" />
                        <Label htmlFor="pilot" className="text-white/80">Ja, pilot gedaan</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no" className="text-white/80">Nee, nog niet</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* System Count */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Hoeveel systemen wil je agent-ready maken?
                  </h2>
                  <RadioGroup value={formData.systemCount} onValueChange={(value) => setFormData(prev => ({ ...prev, systemCount: value }))}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="starter" id="starter" />
                        <Label htmlFor="starter" className="text-white/80">1-2 systemen (Starter - €15-25k)</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="growth" id="growth" />
                        <Label htmlFor="growth" className="text-white/80">3-5 systemen (Growth - €25-50k)</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="enterprise" id="enterprise" />
                        <Label htmlFor="enterprise" className="text-white/80">5+ systemen (Enterprise - €50k+)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Systems Selection */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Welke systemen? (selecteer alle)
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {systemOptions.map((system) => (
                      <div key={system} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={system}
                          checked={formData.systems.includes(system)}
                          onChange={(e) => handleSystemToggle(system, e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5"
                          style={{ accentColor: '#F87315' }}
                        />
                        <Label htmlFor={system} className="text-white/80 text-sm cursor-pointer">
                          {system}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Custom Systems Input */}
                  {formData.systems.includes('Anders') && (
                    <div className="mt-6">
                      <Label htmlFor="customSystems" className="text-white/80">
                        Welke andere systemen? (gescheiden door komma's)
                      </Label>
                      <Input
                        id="customSystems"
                        value={customSystems}
                        onChange={(e) => setCustomSystems(e.target.value)}
                        className="bg-white/5 border-white/20 text-white mt-2"
                        placeholder="Bijv. QuickBooks, Exact Online, eigen CRM systeem, legacy database"
                      />
                      <p className="text-white/60 text-xs mt-2">
                        Lijst alle systemen die je agent-ready wilt maken, gescheiden door komma's
                      </p>
                    </div>
                  )}

                  {/* Progressive Disclosure for Custom Software */}
                  {formData.systems.includes('Eigen software') && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label className="text-white/80">Heeft je eigen software al APIs?</Label>
                        <RadioGroup 
                          value={formData.customSystemsApis} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, customSystemsApis: value }))}
                        >
                          <div className="flex gap-6 mt-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="apis-yes" />
                              <Label htmlFor="apis-yes" className="text-white/80 text-sm">Ja</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="apis-no" />
                              <Label htmlFor="apis-no" className="text-white/80 text-sm">Nee</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="unknown" id="apis-unknown" />
                              <Label htmlFor="apis-unknown" className="text-white/80 text-sm">Weet niet</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label htmlFor="platform" className="text-white/80">Welke programmeertaal/platform?</Label>
                        <Input
                          id="platform"
                          value={formData.customSystemsPlatform}
                          onChange={(e) => setFormData(prev => ({ ...prev, customSystemsPlatform: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white mt-2"
                          placeholder="Bijv. .NET, Java, PHP, Python, Node.js"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Goal */}
                <div>
                  <Label htmlFor="mainGoal" className="text-xl font-bold text-white">
                    Wat is je belangrijkste doel met agents?
                  </Label>
                  <Textarea
                    id="mainGoal"
                    value={formData.mainGoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, mainGoal: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white mt-2"
                    placeholder="Bijv. 'Automatiseren van order processing en klantcommunicatie om 50% tijd te besparen'"
                    rows={4}
                  />
                </div>

                {/* Budget & Timeline */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Budget range</h3>
                    <RadioGroup value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="15-25k" id="15-25k" />
                          <Label htmlFor="15-25k" className="text-white/80 text-sm">€15-25k</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="25-50k" id="25-50k" />
                          <Label htmlFor="25-50k" className="text-white/80 text-sm">€25-50k</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="50k+" id="50k+" />
                          <Label htmlFor="50k+" className="text-white/80 text-sm">€50k+</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="tbd" id="tbd" />
                          <Label htmlFor="tbd" className="text-white/80 text-sm">Nog te bepalen</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
                    <RadioGroup value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="q1-2025" id="q1-2025" />
                          <Label htmlFor="q1-2025" className="text-white/80 text-sm">Q1 2025</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="q2-2025" id="q2-2025" />
                          <Label htmlFor="q2-2025" className="text-white/80 text-sm">Q2 2025</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="h2-2025" id="h2-2025" />
                          <Label htmlFor="h2-2025" className="text-white/80 text-sm">H2 2025</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Contactgegevens</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="pname" className="text-white/80">Naam *</Label>
                      <Input
                        id="pname"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pcompany" className="text-white/80">Bedrijf *</Label>
                      <Input
                        id="pcompany"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pemail" className="text-white/80">Email *</Label>
                      <Input
                        id="pemail"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pphone" className="text-white/80">Telefoon</Label>
                      <Input
                        id="pphone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="+31 6 12345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prole" className="text-white/80">Rol</Label>
                      <Input
                        id="prole"
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pemployees" className="text-white/80">Aantal medewerkers</Label>
                      <select
                        id="pemployees"
                        value={formData.employees}
                        onChange={(e) => setFormData(prev => ({ ...prev, employees: e.target.value }))}
                        className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2"
                      >
                        <option value="">Selecteer...</option>
                        <option value="1-10">1-10 medewerkers</option>
                        <option value="11-50">11-50 medewerkers</option>
                        <option value="51-250">51-250 medewerkers</option>
                        <option value="250+">250+ medewerkers</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="text-center">
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    size="lg"
                    className="text-white font-semibold px-12 py-4"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    <FileText className="mr-2 w-5 h-5" />
                    Request Proposal
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  
                  <p className="text-white/60 text-sm mt-4">
                    Ontvang custom proposal binnen 48 uur
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}