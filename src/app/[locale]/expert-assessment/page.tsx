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

  const whyChooseReasons = [
    {
      icon: Target,
      title: 'Specifiek',
      description: 'Geen algemene tips, maar concrete acties voor jouw situatie'
    },
    {
      icon: Euro,
      title: 'ROI Berekening',
      description: 'Exacte kosten/baten analyse gebaseerd op jouw cijfers'
    },
    {
      icon: Award,
      title: 'Expert Inzichten',
      description: '2+ jaar agent infrastructure ervaring in 1 gesprek'
    }
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      {/* Hero Section */}
      <section className="pt-28 pb-20 sm:pt-32 sm:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F87315]/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-[-0.02em]">
              <span
                className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.4)',
                }}
              >
                Expert Assessment
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Van automated naar expert - ontdek het verschil tussen onze assessment opties
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Comparison Grid */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Freemium Assessment */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/[0.03] border-white/10 h-full">
                  <CardHeader>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400 mb-2">GRATIS</div>
                      <CardTitle className="text-white text-2xl">Automated Assessment</CardTitle>
                      <p className="text-white/60 text-sm mt-2">10-15 vragen, automated rapport</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-white font-semibold mb-4">Wat je krijgt:</h4>
                      <ul className="space-y-3">
                        {freemiumFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center text-white/75 text-sm">
                            <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0 text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-4">Wat je NIET krijgt:</h4>
                      <ul className="space-y-3">
                        {freemiumMissing.map((feature, index) => (
                          <li key={index} className="flex items-center text-white/50 text-sm">
                            <X className="w-4 h-4 mr-3 flex-shrink-0 text-red-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <Link href="/agent-readiness">
                        <Button
                          className="w-full py-6 font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          style={{ backgroundColor: '#22c55e' }}
                        >
                          Start Gratis Assessment
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <p className="text-center text-white/50 text-xs mt-3">
                        5 minuten - Direct resultaat
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Expert Assessment */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-[#F87315]/10 to-[#FF9F43]/5 border-[#F87315]/30 h-full relative">
                  <div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                  >
                    AANBEVOLEN
                  </div>

                  <CardHeader>
                    <div className="text-center pt-4">
                      <div className="text-4xl font-bold text-[#FF9F43] mb-2">€2.500</div>
                      <CardTitle className="text-white text-2xl">Expert Assessment</CardTitle>
                      <p className="text-white/60 text-sm mt-2">Workshop + expert review + custom rapport</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <h4 className="text-green-400 font-semibold">Alles van gratis PLUS:</h4>
                    </div>

                    <div>
                      <ul className="space-y-3">
                        {expertFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center text-white/80 text-sm">
                            <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0 text-[#FF9F43]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/[0.03] rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <Clock className="w-5 h-5 mx-auto mb-1 text-[#FF9F43]" />
                          <div className="text-white/70">2-4 uur</div>
                        </div>
                        <div>
                          <FileText className="w-5 h-5 mx-auto mb-1 text-[#FF9F43]" />
                          <div className="text-white/70">15 pagina's</div>
                        </div>
                        <div>
                          <Users className="w-5 h-5 mx-auto mb-1 text-[#FF9F43]" />
                          <div className="text-white/70">Expert review</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button
                        onClick={handleExpertBooking}
                        className="w-full py-6 font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                          boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Boek Expert Assessment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <p className="text-center text-white/50 text-xs mt-3">
                        Aftrekbaar bij vervolgproject
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Why Choose Expert */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 sm:p-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center tracking-[-0.02em]">
                Waarom kiezen klanten voor{' '}
                <span
                  className="text-white px-2 py-0.5 inline-block"
                  style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                >
                  Expert Assessment
                </span>
                ?
              </h3>

              <div className="grid md:grid-cols-3 gap-8 mb-10">
                {whyChooseReasons.map((reason, index) => (
                  <motion.div
                    key={reason.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-transform duration-300 hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <reason.icon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">{reason.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{reason.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-white/[0.03] to-white/[0.06] rounded-xl p-6 text-center">
                <p className="text-lg font-bold text-white mb-2">
                  Start met gratis - upgrade naar expert indien nodig
                </p>
                <p className="text-white/65 text-sm">
                  De meeste bedrijven beginnen gratis en upgraden na het zien van hun score en gaps.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
