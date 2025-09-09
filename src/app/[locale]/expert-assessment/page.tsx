'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, X, Clock, Users, FileText, Target, 
  ArrowRight, Euro, Calendar, Award
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ExpertAssessmentPage() {
  const { user } = useAuth();
  
  const handleExpertBooking = async () => {
    if (user) {
      try {
        // Create Mollie payment for Expert Assessment
        const response = await fetch('/api/payment/create-expert-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            userEmail: user.email,
            userName: user.displayName || user.firstName || '',
            userCompany: user.company || ''
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Redirect to Mollie checkout
          window.location.href = data.checkoutUrl;
        } else {
          console.error('Payment creation failed:', data.error);
          alert('Er ging iets mis bij het maken van de betaling. Probeer het opnieuw.');
        }
      } catch (error) {
        console.error('Expert Assessment booking error:', error);
        alert('Er ging iets mis. Probeer het opnieuw of neem contact op.');
      }
    } else {
      // Redirect to login first
      window.location.href = '/login?redirect=/expert-assessment';
    }
  };

  const freemiumFeatures = [
    'Agent Readiness Score (0-100)',
    'Breakdown per categorie', 
    '3-page automated rapport',
    'Algemene best practices',
    'Dashboard account'
  ];

  const freemiumMissing = [
    'Specifieke roadmap',
    'ROI berekening',
    'Custom recommendations', 
    'Expert review',
    'Implementation plan'
  ];

  const expertFeatures = [
    '2-4 uur workshop',
    '15-page custom rapport',
    'Gepersonaliseerde roadmap',
    'ROI & business case',
    'Priority matrix',
    'Expert review call',
    '90-dagen actieplan'
  ];

  return (
    <div className="min-h-screen bg-black">
      <section className="py-32 relative" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                <span
                  className="text-white px-4 py-2 inline-block"
                  style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
                >
                  Expert Assessment
                </span>
              </h1>
              <p className="text-xl text-white/80 max-w-4xl mx-auto">
                Van automated naar expert - ontdek het verschil tussen onze assessment opties
              </p>
            </motion.div>

            {/* Comparison Grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {/* Freemium Assessment */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardHeader>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400 mb-2">GRATIS</div>
                      <CardTitle className="text-white">Automated Assessment</CardTitle>
                      <p className="text-white/70 text-sm">10-15 vragen, automated rapport</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-white font-semibold mb-4">Wat je krijgt:</h4>
                      <ul className="space-y-3">
                        {freemiumFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center text-white/80 text-sm">
                            <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: '#22c55e' }} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-4">Wat je NIET krijgt:</h4>
                      <ul className="space-y-3">
                        {freemiumMissing.map((feature, index) => (
                          <li key={index} className="flex items-center text-white/60 text-sm">
                            <X className="w-4 h-4 mr-3 flex-shrink-0 text-red-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <Link href="/agent-readiness">
                        <Button
                          className="w-full text-white font-semibold"
                          style={{ backgroundColor: '#22c55e' }}
                        >
                          Start Gratis Assessment
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <p className="text-center text-white/60 text-xs mt-3">
                        5 minuten • Direct resultaat
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Expert Assessment */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/30 h-full relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: '#F87315' }}>
                    AANBEVOLEN
                  </div>
                  
                  <CardHeader>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2" style={{ color: '#F87315' }}>€2.500</div>
                      <CardTitle className="text-white">Expert Assessment</CardTitle>
                      <p className="text-white/70 text-sm">Workshop + expert review + custom rapport</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h4 className="text-green-400 font-semibold mb-2">Alles van gratis PLUS:</h4>
                    </div>

                    <div>
                      <ul className="space-y-3">
                        {expertFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center text-white/80 text-sm">
                            <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: '#F87315' }} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <Clock className="w-4 h-4 mx-auto mb-1" style={{ color: '#F87315' }} />
                          <div className="text-white/70">2-4 uur</div>
                        </div>
                        <div>
                          <FileText className="w-4 h-4 mx-auto mb-1" style={{ color: '#F87315' }} />
                          <div className="text-white/70">15 pagina's</div>
                        </div>
                        <div>
                          <Users className="w-4 h-4 mx-auto mb-1" style={{ color: '#F87315' }} />
                          <div className="text-white/70">Expert review</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                        <Button
                          onClick={handleExpertBooking}
                          className="w-full text-white font-semibold"
                          style={{ backgroundColor: '#F87315' }}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Boek Expert Assessment
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      <p className="text-center text-white/60 text-xs mt-3">
                        Aftrekbaar bij vervolgproject
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Why Choose Expert */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <Card className="bg-white/5 border-white/10 p-8 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Waarom kiezen klanten voor Expert Assessment?
                </h3>
                
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">Specifiek</h4>
                    <p className="text-white/70 text-sm">Geen algemene tips, maar concrete acties voor jouw situatie</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                      <Euro className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">ROI Berekening</h4>
                    <p className="text-white/70 text-sm">Exacte kosten/baten analyse gebaseerd op jouw cijfers</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F87315' }}>
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">Expert Inzichten</h4>
                    <p className="text-white/70 text-sm">2+ jaar agent infrastructure ervaring in 1 gesprek</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-6">
                  <p className="text-lg font-bold text-white mb-2">
                    Start met gratis - upgrade naar expert indien nodig
                  </p>
                  <p className="text-white/70">
                    De meeste bedrijven beginnen gratis en upgraden na het zien van hun score en gaps.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}