'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, ArrowRight, Monitor, Users, Calendar, Eye, Phone, Quote } from 'lucide-react';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
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
                {confirmation.title}
              </h1>
              <p className="text-white/80 mb-6">
                {confirmation.message}
              </p>

              <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 mr-3" style={{ color: '#F87315' }} />
                  <span className="text-lg font-bold text-white">{confirmation.timeline}</span>
                </div>
                <p className="text-white/70 text-sm">
                  Demo type: <strong>{
                    formData.demoType === 'self-guided' ? 'Self-guided account' :
                    formData.demoType === 'live' ? 'Live 1-on-1 demo' :
                    formData.demoType === 'workshop' ? 'Team workshop' : 
                    'Custom demo'
                  }</strong>
                </p>
              </div>

              <div className="text-sm text-white/60 mb-6">
                Heb je ondertussen vragen? Bel direct: +31 (6) 81 739 018
              </div>

              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Terug naar Home
              </Button>
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
              Agent Monitoring{' '}
              <span
                className="text-white px-4 py-2 inline-block"
                style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
              >
                Dashboard Demo
              </span>
            </h1>
            <p className="text-xl text-white/80">
              Zie hoe je agents real-time kunt monitoren
            </p>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Live Dashboard Preview:</h2>
            
            {/* Mock Dashboard */}
            <div className="bg-black/50 border border-white/20 rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">23</div>
                  <div className="text-white/70 text-sm">Active Agents</div>
                </div>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">€2,847</div>
                  <div className="text-white/70 text-sm">Saved This Month</div>
                </div>
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">97%</div>
                  <div className="text-white/70 text-sm">Uptime</div>
                </div>
              </div>
              <div className="text-center text-white/60 text-sm">
                ↑ Live metrics van een echt agent ecosysteem
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-4">Demo Dashboard Features:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                <span className="text-white/80 text-sm">Live agent activity feed</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                <span className="text-white/80 text-sm">Performance metrics</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                <span className="text-white/80 text-sm">Cost savings calculator</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                <span className="text-white/80 text-sm">System health monitoring</span>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <Card className="bg-white/5 border border-white/10">
            <CardContent className="p-8">
              <form className="space-y-8">
                {/* Demo For */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Ik wil een demo voor:
                  </h2>
                  <RadioGroup value={formData.demoFor} onValueChange={(value) => setFormData(prev => ({ ...prev, demoFor: value }))}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="myself" id="myself" />
                        <Label htmlFor="myself" className="text-white/80">Mezelf (decision maker)</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="team" id="team" />
                        <Label htmlFor="team" className="text-white/80">Mijn team (2-5 personen)</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="management" id="management" />
                        <Label htmlFor="management" className="text-white/80">Management presentatie</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Demo Type with Context */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Kies je demo:
                  </h2>
                  <div className="space-y-4">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                        formData.demoType === 'live' ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, demoType: 'live' }))}
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3">
                          <span className="text-lg">👥</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Live 1-on-1 demo (30 min)</h3>
                          <p className="text-white/60 text-sm">Best voor: Quick overview, specifieke vragen</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                        formData.demoType === 'self-guided' ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, demoType: 'self-guided' }))}
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mr-3">
                          <span className="text-lg">🖥️</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Self-guided met demo data</h3>
                          <p className="text-white/60 text-sm">Best voor: Zelf verkennen, eigen tempo</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                        formData.demoType === 'workshop' ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, demoType: 'workshop' }))}
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3">
                          <span className="text-lg">🏢</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Workshop met team (2 uur)</h3>
                          <p className="text-white/60 text-sm">Best voor: Buy-in creëren, deep dive</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Qualifying Questions */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Hoeveel agents verwacht je te monitoren?</h3>
                    <RadioGroup value={formData.expectedAgents} onValueChange={(value) => setFormData(prev => ({ ...prev, expectedAgents: value }))}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="1-10" id="agents-1-10" />
                          <Label htmlFor="agents-1-10" className="text-white/80 text-sm">1-10</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="10-50" id="agents-10-50" />
                          <Label htmlFor="agents-10-50" className="text-white/80 text-sm">10-50</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="50+" id="agents-50+" />
                          <Label htmlFor="agents-50+" className="text-white/80 text-sm">50+</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="unknown" id="agents-unknown" />
                          <Label htmlFor="agents-unknown" className="text-white/80 text-sm">Weet nog niet</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Wanneer wil je live gaan?</h3>
                    <RadioGroup value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="thismonth" id="time-thismonth" />
                          <Label htmlFor="time-thismonth" className="text-white/80 text-sm">Deze maand</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="3months" id="time-3months" />
                          <Label htmlFor="time-3months" className="text-white/80 text-sm">Binnen 3 maanden</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="exploring" id="time-exploring" />
                          <Label htmlFor="time-exploring" className="text-white/80 text-sm">Verkennen voor later</Label>
                        </div>
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
                        <Label htmlFor={option} className="text-white/80 text-sm cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Quick Info</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="dname" className="text-white/80">Naam *</Label>
                      <Input
                        id="dname"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dcompany" className="text-white/80">Bedrijf *</Label>
                      <Input
                        id="dcompany"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="demail" className="text-white/80">Email *</Label>
                      <Input
                        id="demail"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dphone" className="text-white/80">Telefoon</Label>
                      <Input
                        id="dphone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="+31 6 12345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="drole" className="text-white/80">Rol</Label>
                      <Input
                        id="drole"
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-start">
                    <Quote className="w-6 h-6 mr-4 mt-1" style={{ color: '#F87315' }} />
                    <div>
                      <blockquote className="text-white/90 italic mb-3">
                        "Het dashboard gaf ons direct inzicht in agent performance. 
                        Game changer voor onze operations."
                      </blockquote>
                      <cite className="text-white/70 text-sm not-italic">
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
                    className="text-white font-semibold px-12 py-4"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    <Monitor className="mr-2 w-5 h-5" />
                    Get Demo Access
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  
                  <p className="text-white/60 text-sm mt-4">
                    Direct: Demo login credentials of Calendly link voor live demo
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