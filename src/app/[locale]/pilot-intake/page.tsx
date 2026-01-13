'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, ArrowRight, Target, Users, Calendar, AlertTriangle, TrendingUp, Quote } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PilotIntakeData {
  hasAssessment: string;
  system: string;
  useCase: string;
  users: string;
  transactions: string;
  budget: string;
  barriers: string;
  successMetrics: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

export default function PilotIntakePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PilotIntakeData>({
    hasAssessment: '',
    system: '',
    useCase: '',
    users: '',
    transactions: '',
    budget: '',
    barriers: '',
    successMetrics: '',
    timeline: '',
    name: user?.displayName || user?.firstName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    company: user?.company || ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Submit pilot intake data
      const response = await fetch('/api/pilot-intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          entryPoint: 'pilot_intake',
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // If user is already logged in, save to their account automatically
        if (user) {
          await fetch('/api/user/link-pilot-intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.uid,
              intakeId: data.intakeId,
              source: 'logged_in_user'
            })
          });
          
          // Redirect to dashboard with pilot intake
          window.location.href = `/dashboard?pilot=${data.intakeId}&first=true`;
        } else {
          // Show submission success
          setIsSubmitted(true);
        }
      } else {
        console.error('Pilot intake submission failed');
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Pilot intake submission error:', error);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: '#F87315' }} />
              <h1 className="text-3xl font-bold text-white mb-4">
                Bedankt! Je pilot proposal komt eraan
              </h1>
              <p className="text-white/80 mb-8">
                We analyseren jouw pilot requirements en sturen binnen 24 uur een 
                gepersonaliseerde pilot proposal met concrete timeline en pricing.
              </p>
              
              <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Pilot Garantie:</h3>
                <p className="text-white/80 mb-2">
                  <strong>Niet tevreden? 50% money back.</strong>
                </p>
                <p className="text-white/60 text-sm">
                  (Nog nooit gebruikt, maar het is er)
                </p>
              </div>

              <div className="text-sm text-white/60 mb-6">
                Direct vragen? Bel Niels: +31 (6) 81 739 018
              </div>
              
              <Button
                onClick={() => window.location.href = '/mcp-guide'}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Download MCP Guide
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
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
              Laten we jouw{' '}
              <span
                className="text-white px-4 py-2 inline-block"
                style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
              >
                pilot plannen
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-4">
              Start klein, bewijs de waarde.
            </p>
            <p className="text-lg text-white/60">
              Van planning tot werkende agent demo in 2-4 weken.
            </p>
          </motion.div>

          {/* Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Waarom een pilot?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium">Bewijs ROI in 2-4 weken</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium">€5.000 - €15.000 investering</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium">Geen lange-termijn commitment</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium">Werkende demo met jouw data</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <Card className="bg-white/5 border border-white/10">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Assessment Check */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Heb je al een assessment gedaan?
                  </h2>
                  <RadioGroup value={formData.hasAssessment} onValueChange={(value) => setFormData(prev => ({ ...prev, hasAssessment: value }))}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="yes" id="assess-yes" />
                        <Label htmlFor="assess-yes" className="text-white/80">Ja, rapport ontvangen</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="no" id="assess-no" />
                        <Label htmlFor="assess-no" className="text-white/80">Nee, nog niet</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="unsure" id="assess-unsure" />
                        <Label htmlFor="assess-unsure" className="text-white/80">Weet niet zeker</Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {formData.hasAssessment === 'no' && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-3 mt-1 text-orange-400" />
                        <div>
                          <p className="text-white font-medium mb-3">
                            Assessment geeft ons betere pilot focus en hogere slaagkans.
                          </p>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              onClick={() => window.location.href = '/agent-readiness'}
                              className="text-white text-sm"
                              style={{ backgroundColor: '#F87315' }}
                            >
                              Start eerst Assessment
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, hasAssessment: 'skip' }))}
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 text-sm"
                            >
                              Toch doorgaan
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* System Selection */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Welk systeem wil je eerst agent-ready maken?
                  </h2>
                  <RadioGroup value={formData.system} onValueChange={(value) => setFormData(prev => ({ ...prev, system: value }))}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="klantenservice" id="klantenservice" />
                        <Label htmlFor="klantenservice" className="text-white/80">Klantenservice/Helpdesk</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="crm" id="crm" />
                        <Label htmlFor="crm" className="text-white/80">CRM/Sales</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="planning" id="planning" />
                        <Label htmlFor="planning" className="text-white/80">Planning/Resource management</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="kennisbank" id="kennisbank" />
                        <Label htmlFor="kennisbank" className="text-white/80">Kennisbank/Documentatie</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="anders" id="anders" />
                        <Label htmlFor="anders" className="text-white/80">Anders:</Label>
                        {formData.system === 'anders' && (
                          <Input
                            placeholder="Beschrijf je systeem..."
                            className="bg-white/5 border-white/20 text-white ml-3"
                          />
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Use Case */}
                <div>
                  <Label htmlFor="useCase" className="text-xl font-bold text-white">
                    Wat is je belangrijkste use case?
                  </Label>
                  <p className="text-white/60 text-sm mb-3">
                    Voorbeeld: "Automatisch tickets categoriseren en routeren"
                  </p>
                  <Textarea
                    id="useCase"
                    value={formData.useCase}
                    onChange={(e) => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Beschrijf wat je wilt automatiseren..."
                    rows={4}
                    required
                  />
                </div>

                {/* Budget Check */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Budget voor pilot
                  </h2>
                  <RadioGroup value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="5-10k" id="budget-5-10k" />
                        <Label htmlFor="budget-5-10k" className="text-white/80">€5-10k beschikbaar</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="10-15k" id="budget-10-15k" />
                        <Label htmlFor="budget-10-15k" className="text-white/80">€10-15k beschikbaar</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="needs-approval" id="budget-needs-approval" />
                        <Label htmlFor="budget-needs-approval" className="text-white/80">Budget moet nog approved</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="exploring" id="budget-exploring" />
                        <Label htmlFor="budget-exploring" className="text-white/80">Verkenning voor budget aanvraag</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Barriers */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Wat houdt je tegen?
                  </h2>
                  <RadioGroup value={formData.barriers} onValueChange={(value) => setFormData(prev => ({ ...prev, barriers: value }))}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="technical" id="barrier-technical" />
                        <Label htmlFor="barrier-technical" className="text-white/80">Technische complexiteit</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="change" id="barrier-change" />
                        <Label htmlFor="barrier-change" className="text-white/80">Change management</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="security" id="barrier-security" />
                        <Label htmlFor="barrier-security" className="text-white/80">Security/compliance</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="roi" id="barrier-roi" />
                        <Label htmlFor="barrier-roi" className="text-white/80">ROI onduidelijk</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Success Metrics */}
                <div>
                  <Label htmlFor="successMetrics" className="text-xl font-bold text-white">
                    Hoe meet je succes?
                  </Label>
                  <p className="text-white/60 text-sm mb-3">
                    Bijvoorbeeld: "50% minder handmatig werk"
                  </p>
                  <Textarea
                    id="successMetrics"
                    value={formData.successMetrics}
                    onChange={(e) => setFormData(prev => ({ ...prev, successMetrics: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Beschrijf hoe je pilot succes wilt meten..."
                    rows={3}
                  />
                </div>

                {/* Scale */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="users" className="text-lg font-bold text-white">
                      Aantal gebruikers
                    </Label>
                    <Input
                      id="users"
                      type="number"
                      value={formData.users}
                      onChange={(e) => setFormData(prev => ({ ...prev, users: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="Bijv. 50"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactions" className="text-lg font-bold text-white">
                      Transacties per maand
                    </Label>
                    <Input
                      id="transactions" 
                      type="number"
                      value={formData.transactions}
                      onChange={(e) => setFormData(prev => ({ ...prev, transactions: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="Bijv. 500"
                      required
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Wanneer wil je starten?
                  </h2>
                  <RadioGroup value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="thismonth" id="thismonth" />
                        <Label htmlFor="thismonth" className="text-white/80">Deze maand nog</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="nextmonth" id="nextmonth" />
                        <Label htmlFor="nextmonth" className="text-white/80">Volgende maand</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="2-3months" id="2-3months" />
                        <Label htmlFor="2-3months" className="text-white/80">Over 2-3 maanden</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="exploring" id="exploring" />
                        <Label htmlFor="exploring" className="text-white/80">Gewoon verkennen</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Social Proof */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold mb-2" style={{ color: '#F87315' }}>92%</div>
                    <div className="text-white/80 text-sm">Pilot Success Rate gaat door naar full implementation</div>
                  </div>
                  <div className="flex items-start">
                    <Quote className="w-6 h-6 mr-4 mt-1" style={{ color: '#F87315' }} />
                    <div>
                      <blockquote className="text-white/90 italic mb-3">
                        "Pilot bewees binnen 3 weken dat agents 70% tijd konden besparen"
                      </blockquote>
                      <cite className="text-white/70 text-sm not-italic">
                        - Recent pilot klant
                      </cite>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Contactgegevens</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-white/80">Naam *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-white/80">Bedrijf *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white/80">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        required
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

                {/* Submit */}
                <div className="text-center">
                  <Button
                    type="submit"
                    size="lg"
                    className="text-white font-semibold px-12 py-4"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    <Target className="mr-2 w-5 h-5" />
                    Plan Pilot Gesprek
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  
                  <p className="text-white/60 text-sm mt-4">
                    Ontvang binnen 24 uur een pilot proposal
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