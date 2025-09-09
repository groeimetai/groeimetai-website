'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Search, Target, Rocket, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NextStepsSection() {
  const t = useTranslations('pricing');
  
  const steps = [
    {
      number: '1',
      title: t('steps.step1.title'),
      subtitle: t('steps.step1.subtitle'),
      pricing: t('steps.step1.pricing'),
      timeframe: t('steps.step1.timeframe'),
      description: t('steps.step1.description'),
      features: [
        t('steps.step1.features.0'),
        t('steps.step1.features.1'),
        t('steps.step1.features.2'),
        t('steps.step1.features.3')
      ],
      cta: t('steps.step1.cta'),
      link: '/agent-readiness',
      icon: Search,
      bgColor: 'from-green-500/10 to-green-600/10',
      borderColor: 'border-green-500/30',
      priceColor: 'text-green-500',
      numberColor: '#10B981'
    },
    {
      number: '2',
      title: t('steps.step2.title'),
      subtitle: t('steps.step2.subtitle'),
      pricing: t('steps.step2.pricing'),
      timeframe: t('steps.step2.timeframe'),
      description: t('steps.step2.description'),
      features: [
        t('steps.step2.features.0'),
        t('steps.step2.features.1'),
        t('steps.step2.features.2'),
        t('steps.step2.features.3')
      ],
      cta: t('steps.step2.cta'),
      link: '/expert-assessment',
      icon: Target,
      bgColor: 'from-orange-500/10 to-orange-600/10',
      borderColor: 'border-orange-500/30',
      priceColor: 'text-orange-500',
      numberColor: '#F87315'
    },
    {
      number: '3',
      title: t('steps.step3.title'),
      subtitle: t('steps.step3.subtitle'),
      pricing: t('steps.step3.pricing'),
      timeframe: t('steps.step3.timeframe'),
      description: t('steps.step3.description'),
      features: [
        t('steps.step3.features.0'),
        t('steps.step3.features.1'),
        t('steps.step3.features.2'),
        t('steps.step3.features.3')
      ],
      cta: t('steps.step3.cta'),
      link: '/implementation-proposal',
      icon: Rocket,
      bgColor: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/30', 
      priceColor: 'text-blue-500',
      numberColor: '#3B82F6'
    }
  ];

  return (
    <section className="py-24 relative" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('title')}{' '}
              <span 
                className="text-white px-4 py-2 inline-block"
                style={{ backgroundColor: '#F87315' }}
              >
                {t('titleHighlight')}
              </span>{' '}
              {t('titleEnd')}
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative group"
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-8 z-10">
                    <div className="h-0.5 bg-white/20 mt-8">
                      <ArrowRight className="w-4 h-4 text-white/40 absolute -right-1 -top-2" />
                    </div>
                  </div>
                )}

                <div className={`bg-gradient-to-br ${step.bgColor} backdrop-blur-sm border ${step.borderColor} rounded-xl p-8 h-full hover:border-opacity-50 transition-all duration-300`}>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: step.numberColor }}
                    >
                      {step.number}
                    </div>
                    <step.icon className="w-8 h-8 text-white/60" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-lg font-medium text-white/90 mb-4">{step.subtitle}</p>
                  <p className="text-white/70 mb-6 leading-relaxed">{step.description}</p>
                  
                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {step.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-white/80 text-sm">
                        <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: step.numberColor }} />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  {/* Price & Timing */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" style={{ color: step.numberColor }} />
                      <span className="text-white/60">Tijd:</span>
                      <span className="text-white font-medium ml-1">{step.timeframe}</span>
                    </div>
                    <div 
                      className={`px-3 py-1 rounded-full text-sm font-bold ${step.priceColor}`}
                      style={{ 
                        backgroundColor: `${step.numberColor}20`,
                        border: `1px solid ${step.numberColor}40`
                      }}
                    >
                      {step.pricing}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href={step.link}>
                    <button 
                      className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                      style={{ backgroundColor: step.numberColor }}
                    >
                      {step.cta}
                      <ArrowRight className="ml-2 w-4 h-4 inline" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                {t('bottomMessage.title')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-white/90">{t('collaboration.points.0')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-white/90">{t('collaboration.points.1')}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-white/90">{t('collaboration.points.2')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-white/90">{t('collaboration.points.3')}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-lg text-white/80 mb-6">
                  {t('cta.description')}
                </p>
                
                <button 
                  className="inline-flex items-center px-10 py-5 text-white font-bold text-xl rounded-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105"
                  style={{ 
                    backgroundColor: '#F87315',
                    boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
                  }}
                  onClick={() => window.open('/agent-readiness', '_blank')}
                >
                  {t('cta.button')}
                  <ArrowRight className="ml-3 w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}