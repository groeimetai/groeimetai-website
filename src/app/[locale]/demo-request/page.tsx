'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, ArrowRight, Monitor, Calendar, Quote } from 'lucide-react';
import Link from 'next/link';

interface DemoRequestData {
  demoFor: string;
  demoType: string;
  currentMonitoring: string[];
  expectedAgents: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
}

export default function DemoRequestPage() {
  const [formData, setFormData] = useState<DemoRequestData>({
    demoFor: '',
    demoType: '',
    currentMonitoring: [],
    expectedAgents: '',
    timeline: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    role: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const monitoringOptions = [
    'API calls', 'System performance', 'User activity',
    'Niets / Manual', 'Anders'
  ];

  const handleMonitoringToggle = (option: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        currentMonitoring: [...prev.currentMonitoring, option]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        currentMonitoring: prev.currentMonitoring.filter(m => m !== option)
      }));
    }
  };

  if (isSubmitted) {
    const getConfirmationMessage = () => {
      switch (formData.demoType) {
        case 'self-guided':
          return {
            title: 'Demo credentials onderweg!',
            message: 'Je krijgt binnen 5 minuten een email met login credentials en instructies.',
            timeline: 'Direct toegang'
          };
        case 'live':
          return {
            title: 'Live demo wordt ingepland!',
            message: 'Je krijgt binnen 5 minuten een Calendly link om een tijd te kiezen.',
            timeline: 'Demo binnen 48 uur'
          };
        case 'workshop':
          return {
            title: 'Workshop wordt gepland!',
            message: 'Onze agent architect neemt binnen 24 uur contact op voor planning.',
            timeline: 'Workshop binnen 1 week'
          };
        default:
          return {
            title: 'Demo aanvraag ontvangen!',
            message: 'We nemen binnen 2 uur contact op.',
            timeline: 'Snel contact'
          };
      }
    };

    const confirmation = getConfirmationMessage();

    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 sm:p-12 text-center"
            >
              <div
                className="w-20 h-20 mx-auto mb-6 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-[-0.02em]">
                {confirmation.title}
              </h1>
              <p className="text-lg text-white/70 mb-8">
                {confirmation.message}
              </p>

              <div className="bg-gradient-to-r from-white/[0.03] to-white/[0.06] rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 mr-3 text-[#FF9F43]" />
                  <span className="text-xl font-bold text-white">{confirmation.timeline}</span>
                </div>
                <p className="text-white/60">
                  Demo type: <strong className="text-white">{
                    formData.demoType === 'self-guided' ? 'Self-guided account' :
                    formData.demoType === 'live' ? 'Live 1-on-1 demo' :
                    formData.demoType === 'workshop' ? 'Team workshop' :
                    'Custom demo'
                  }</strong>
                </p>
              </div>

              <p className="text-white/50 text-sm mb-8">
                Heb je ondertussen vragen? Bel direct: +31 (6) 81 739 018
              </p>

              <Link href="/">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                >
                  Terug naar Home
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      {/* Hero Section */}
      <section className="pt-28 pb-12 sm:pt-32 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F87315]/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-[-0.02em]">
              Agent Monitoring{' '}
              <span
                className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.4)',
                }}
              >
                Dashboard Demo
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70">
              Zie hoe je agents real-time kunt monitoren
            </p>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-[-0.02em]">
                Live Dashboard Preview:
              </h2>

              {/* Mock Dashboard */}
              <div className="bg-black/50 border border-white/20 rounded-xl p-6 mb-6">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">23</div>
                    <div className="text-white/60 text-sm">Active Agents</div>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">€2,847</div>
                    <div className="text-white/60 text-sm">Saved This Month</div>
                  </div>
                  <div className="bg-[#F87315]/20 border border-[#F87315]/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[#FF9F43]">97%</div>
                    <div className="text-white/60 text-sm">Uptime</div>
                  </div>
                </div>
                <div className="text-center text-white/50 text-sm">
                  ↑ Live metrics van een echt agent ecosysteem
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Demo Dashboard Features:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {['Live agent activity feed', 'Performance metrics', 'Cost savings calculator', 'System health monitoring'].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-3 text-[#FF9F43]" />
                    <span className="text-white/75 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Form Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/[0.03] border-white/10">
              <CardContent className="p-6 sm:p-8">
                <form className="space-y-8">
                  {/* Demo For */}
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">
                      Ik wil een demo voor:
                    </h2>
                    <RadioGroup value={formData.demoFor} onValueChange={(value) => setFormData(prev => ({ ...prev, demoFor: value }))}>
                      <div className="space-y-3">
                        {[
                          { value: 'myself', label: 'Mezelf (decision maker)' },
                          { value: 'team', label: 'Mijn team (2-5 personen)' },
                          { value: 'management', label: 'Management presentatie' },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value} className="text-white/75 cursor-pointer">{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Demo Type with Context */}
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">
                      Kies je demo:
                    </h2>
                    <div className="space-y-4">
                      {[
                        { value: 'live', icon: '👥', title: 'Live 1-on-1 demo (30 min)', description: 'Best voor: Quick overview, specifieke vragen' },
                        { value: 'self-guided', icon: '🖥️', title: 'Self-guided met demo data', description: 'Best voor: Zelf verkennen, eigen tempo' },
                        { value: 'workshop', icon: '🏢', title: 'Workshop met team (2 uur)', description: 'Best voor: Buy-in creëren, deep dive' },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                            formData.demoType === option.value
                              ? 'border-[#F87315]/50 bg-[#F87315]/10'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, demoType: option.value }))}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mr-4">
                              <span className="text-xl">{option.icon}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{option.title}</h3>
                              <p className="text-white/55 text-sm">{option.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Qualifying Questions */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Hoeveel agents verwacht je te monitoren?</h3>
                      <RadioGroup value={formData.expectedAgents} onValueChange={(value) => setFormData(prev => ({ ...prev, expectedAgents: value }))}>
                        <div className="space-y-2">
                          {[
                            { value: '1-10', label: '1-10' },
                            { value: '10-50', label: '10-50' },
                            { value: '50+', label: '50+' },
                            { value: 'unknown', label: 'Weet nog niet' },
                          ].map((option) => (
                            <div key={option.value} className="flex items-center space-x-3">
                              <RadioGroupItem value={option.value} id={`agents-${option.value}`} />
                              <Label htmlFor={`agents-${option.value}`} className="text-white/75 text-sm cursor-pointer">{option.label}</Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Wanneer wil je live gaan?</h3>
                      <RadioGroup value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                        <div className="space-y-2">
                          {[
                            { value: 'thismonth', label: 'Deze maand' },
                            { value: '3months', label: 'Binnen 3 maanden' },
                            { value: 'exploring', label: 'Verkennen voor later' },
                          ].map((option) => (
                            <div key={option.value} className="flex items-center space-x-3">
                              <RadioGroupItem value={option.value} id={`time-${option.value}`} />
                              <Label htmlFor={`time-${option.value}`} className="text-white/75 text-sm cursor-pointer">{option.label}</Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Current Monitoring */}
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">
                      Wat monitor je nu?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {monitoringOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={option}
                            checked={formData.currentMonitoring.includes(option)}
                            onChange={(e) => handleMonitoringToggle(option, e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5"
                            style={{ accentColor: '#F87315' }}
                          />
                          <Label htmlFor={option} className="text-white/75 text-sm cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white/[0.03] rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Quick Info</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="dname" className="text-white/70">Naam *</Label>
                        <Input
                          id="dname"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white focus:border-[#FF9F43] transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dcompany" className="text-white/70">Bedrijf *</Label>
                        <Input
                          id="dcompany"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white focus:border-[#FF9F43] transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="demail" className="text-white/70">Email *</Label>
                        <Input
                          id="demail"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white focus:border-[#FF9F43] transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dphone" className="text-white/70">Telefoon</Label>
                        <Input
                          id="dphone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white focus:border-[#FF9F43] transition-colors"
                          placeholder="+31 6 12345678"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="drole" className="text-white/70">Rol</Label>
                        <Input
                          id="drole"
                          value={formData.role}
                          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white focus:border-[#FF9F43] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="bg-gradient-to-r from-white/[0.03] to-white/[0.06] border border-white/10 rounded-xl p-6">
                    <div className="flex items-start">
                      <Quote className="w-6 h-6 mr-4 mt-1 text-[#FF9F43]" />
                      <div>
                        <blockquote className="text-white/85 italic mb-3 leading-relaxed">
                          "Het dashboard gaf ons direct inzicht in agent performance.
                          Game changer voor onze operations."
                        </blockquote>
                        <cite className="text-white/55 text-sm not-italic">
                          - Operations Manager, 1000+ medewerkers
                        </cite>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="text-center">
                    <Button
                      type="submit"
                      onClick={() => setIsSubmitted(true)}
                      size="lg"
                      className="text-white font-semibold px-12 py-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                        boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                      }}
                    >
                      <Monitor className="mr-2 w-5 h-5" />
                      Get Demo Access
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>

                    <p className="text-white/50 text-sm mt-4">
                      Direct: Demo login credentials of Calendly link voor live demo
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
