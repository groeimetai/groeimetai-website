'use client';

import { motion } from 'framer-motion';
import { Search, Target, Rocket, ArrowRight, CheckCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function ForEveryBusiness() {
  const t = useTranslations('nextSteps');
  
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
      icon: Search,
      link: '/agent-readiness'
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
      icon: Target,
      link: '/expert-assessment'
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
      icon: Rocket,
      link: '/implementation-proposal'
    }
  ];

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative" style={{ backgroundColor: '#080D14' }}>
      {/* Subtle section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
              {t('title')}{' '}
              <span
                className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.4)',
                }}
              >
                {t('highlight')}
              </span>{' '}
              {t('titleEnd')}
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Steps Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
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

                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 h-full hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 flex flex-col">
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white transition-transform duration-300 group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      {step.number}
                    </div>
                    <step.icon className="w-7 h-7 text-white/50" />
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-base font-medium text-white/80 mb-3">{step.subtitle}</p>
                    <p className="text-white/60 mb-6 text-sm leading-relaxed">{step.description}</p>

                    {/* Features */}
                    <div className="space-y-2.5 mb-6">
                      {step.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start text-white/70 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-[#FF9F43]" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Price & Timing */}
                    <div className="flex items-center justify-between text-sm mb-6">
                      <div className="flex items-center text-white/50">
                        <Calendar className="w-4 h-4 mr-2 text-[#FF9F43]" />
                        <span>Tijd:</span>
                        <span className="text-white font-medium ml-1">{step.timeframe}</span>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: step.pricing === 'GRATIS' ? '#10B981' : '#F87315' }}
                      >
                        {step.pricing}
                      </div>
                    </div>
                  </div>

                  {/* CTA Button - altijd onderaan */}
                  <div className="mt-auto">
                    <Link href={step.link}>
                      <button
                        className="w-full py-3.5 rounded-lg font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                          boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.4)',
                        }}
                      >
                        {step.cta}
                        <ArrowRight className="ml-2 w-4 h-4 inline" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Section - Image naast Explanation */}
          <div className="grid lg:grid-cols-2 gap-12 mt-16 items-stretch">
            {/* Linker kolom - Sfeer image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex"
            >
              <div className="sfeer-image w-full">
                <Image
                  src="/images/nathan-duck-Jo5FUEkhB_4-unsplash.jpg"
                  alt=""
                  width={400}
                  height={500}
                  className="object-cover w-full h-full rounded-xl"
                />
              </div>
            </motion.div>

            {/* Rechter kolom - Transparent Collaboration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex"
            >
              <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-8 w-full h-full flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  {t('explanation.title')}
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">{t('explanation.transparentPricing.title')}</h4>
                    <p className="text-white/70 mb-4">{t('explanation.transparentPricing.description')}</p>
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center text-white/80 text-sm">
                          <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0 text-[#F87315]" />
                          {t(`explanation.transparentPricing.ranges.${i}`)}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">{t('explanation.roiGuarantee.title')}</h4>
                    <p className="text-white/70 mb-4">{t('explanation.roiGuarantee.description')}</p>
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center text-white/80 text-sm">
                          <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0 text-[#F87315]" />
                          {t(`explanation.roiGuarantee.stats.${i}`)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">{t('explanation.noLockIn.title')}</h4>
                    <p className="text-white/70 mb-4">{t('explanation.noLockIn.description')}</p>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">100%</div>
                        <div className="text-white/60 text-xs">{t('explanation.guarantees.fixedPrice')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">2-12</div>
                        <div className="text-white/60 text-xs">{t('explanation.guarantees.timeframe')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">0</div>
                        <div className="text-white/60 text-xs">{t('explanation.guarantees.downtime')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}