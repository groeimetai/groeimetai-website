'use client';

import { motion } from 'framer-motion';
import { Search, Target, Rocket, ArrowRight, CheckCircle, Clock, Euro, Users } from 'lucide-react';
import Link from 'next/link';

export default function TransparentPricing() {
  const steps = [
    {
      number: '1',
      title: 'Ontdek waar je staat',
      subtitle: 'Agent Readiness Assessment',
      pricing: 'GRATIS',
      timeframe: '10 vragen • 6 minuten',
      description: 'Krijg direct inzicht in hoe agent-ready jouw APIs en systemen zijn.',
      features: [
        'Agent readiness score (0-100)',
        'Gap analyse per categorie',
        'Professional PDF rapport',
        'LinkedIn certificaat'
      ],
      cta: 'Start Gratis Assessment',
      link: '/agent-readiness',
      icon: Search,
      popular: false
    },
    {
      number: '2',
      title: 'Krijg concrete roadmap',
      subtitle: 'Expert Assessment',
      pricing: '€2.500',
      timeframe: '2-4 uur • Vaste prijs',
      description: 'Personal deep-dive in jouw systemen met hands-on implementation planning.',
      features: [
        'Persoonlijke analyse van APIs',
        'System-specifieke roadmap',
        'ROI berekening & business case',
        'Vaste prijs implementatie offerte'
      ],
      cta: 'Boek Expert Assessment',
      link: '/expert-assessment',
      icon: Target,
      popular: true,
      badge: 'Meest gekozen'
    },
    {
      number: '3',
      title: 'Implementation',
      subtitle: 'API→MCP Conversie',
      pricing: '€15-75k',
      timeframe: '2-12 weken • Vaste prijs',
      description: 'Van je bestaande APIs naar agent-compatible MCP systemen. Geen rebuild.',
      features: [
        'API→MCP translation layer',
        'Agent configuratie & testing',
        'Phased rollout planning',
        'ROI garantie in contract'
      ],
      cta: 'Vraag Implementatie Offerte',
      link: '/implementation-proposal',
      icon: Rocket,
      popular: false
    }
  ];

  return (
    <section className="py-24 relative" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Voor elk bedrijf met{' '}
              <span style={{ color: '#F87315' }}>APIs</span>
            </h2>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-8">
              Van pilot tot enterprise - Altijd dezelfde 3 stappen. 
              Transparante prijzen, vaste deliverables, geen verrassingen.
            </p>
            
            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-6 text-white/60">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
                <span>Geen uurtje-factuurtje</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
                <span>Eerst assessment, dan offerte</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
                <span>ROI garantie</span>
              </div>
            </div>
          </motion.div>

          {/* Steps Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative group ${step.popular ? 'transform scale-105' : ''}`}
              >
                {/* Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-white/30" />
                  </div>
                )}

                {/* Popular Badge */}
                {step.badge && (
                  <div 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold text-white z-20"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    {step.badge}
                  </div>
                )}

                {/* Card */}
                <div className={`bg-white/5 backdrop-blur-sm border ${step.popular ? 'border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-orange-600/5' : 'border-white/10'} rounded-xl p-8 h-full hover:border-white/20 hover:bg-white/10 transition-all duration-300`}>
                  
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                        style={{ backgroundColor: '#F87315' }}
                      >
                        {step.number}
                      </div>
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: step.popular ? '#F87315' : 'rgba(255,255,255,0.1)' }}
                      >
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-1">{step.title}</h3>
                    <p className="text-white/60 text-sm mb-3">{step.subtitle}</p>
                    
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{ color: step.popular ? '#F87315' : '#10B981' }}
                    >
                      {step.pricing}
                    </div>
                    
                    <div className="flex items-center justify-center text-white/50 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      {step.timeframe}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/70 mb-6 leading-relaxed text-center">
                    {step.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {step.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <CheckCircle 
                          className="w-5 h-5 flex-shrink-0" 
                          style={{ color: step.popular ? '#F87315' : '#10B981' }} 
                        />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href={step.link} className="block">
                    <button 
                      className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105 ${
                        step.popular ? 'text-white shadow-lg hover:shadow-xl' : 'text-white border border-white/20 hover:bg-white/10'
                      }`}
                      style={{ 
                        backgroundColor: step.popular ? '#F87315' : 'transparent',
                        boxShadow: step.popular ? '0 10px 25px rgba(248, 115, 21, 0.3)' : 'none'
                      }}
                    >
                      {step.cta}
                      <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}