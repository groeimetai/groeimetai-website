'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import {
  Eye, Wrench, Activity, CheckCircle, ArrowRight,
  Euro, TrendingUp, Shield, FileText, Brain, Users, Target
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function ServicesPage() {
  const t = useTranslations('servicesPage');

  const coreServices = [
    {
      number: '0',
      title: t('coreServices.0.title'),
      subtitle: t('coreServices.0.subtitle'),
      description: t('coreServices.0.description'),
      features: [
        t('coreServices.0.features.0'),
        t('coreServices.0.features.1'),
        t('coreServices.0.features.2'),
        t('coreServices.0.features.3'),
        t('coreServices.0.features.4')
      ],
      deliverables: [
        t('coreServices.0.deliverables.0'),
        t('coreServices.0.deliverables.1'),
        t('coreServices.0.deliverables.2'),
        t('coreServices.0.deliverables.3'),
        t('coreServices.0.deliverables.4')
      ],
      pricing: t('coreServices.0.pricing'),
      subtext: t('coreServices.0.subtext'),
      cta: t('coreServices.0.cta'),
      icon: Users,
      color: '#22c55e'
    },
    {
      number: '1',
      title: t('coreServices.1.title'),
      subtitle: t('coreServices.1.subtitle'),
      description: t('coreServices.1.description'),
      features: [
        t('coreServices.1.features.0'),
        t('coreServices.1.features.1'),
        t('coreServices.1.features.2'),
        t('coreServices.1.features.3'),
        t('coreServices.1.features.4')
      ],
      deliverables: [
        t('coreServices.1.deliverables.0'),
        t('coreServices.1.deliverables.1'),
        t('coreServices.1.deliverables.2'),
        t('coreServices.1.deliverables.3'),
        t('coreServices.1.deliverables.4')
      ],
      pricing: t('coreServices.1.pricing'),
      subtext: t('coreServices.1.subtext'),
      cta: t('coreServices.1.cta'),
      icon: Eye,
      color: '#F87315'
    },
    {
      number: '2',
      title: t('coreServices.2.title'),
      subtitle: t('coreServices.2.subtitle'),
      description: t('coreServices.2.description'),
      features: [
        t('coreServices.2.features.0'),
        t('coreServices.2.features.1'),
        t('coreServices.2.features.2'),
        t('coreServices.2.features.3'),
        t('coreServices.2.features.4')
      ],
      deliverables: [
        t('coreServices.2.deliverables.0'),
        t('coreServices.2.deliverables.1'),
        t('coreServices.2.deliverables.2'),
        t('coreServices.2.deliverables.3'),
        t('coreServices.2.deliverables.4')
      ],
      pricing: t('coreServices.2.pricing'),
      subtext: t('coreServices.2.subtext'),
      cta: t('coreServices.2.cta'),
      icon: Target,
      color: '#F87315'
    },
    {
      number: '3',
      title: t('coreServices.3.title'),
      subtitle: t('coreServices.3.subtitle'),
      description: t('coreServices.3.description'),
      features: [
        t('coreServices.3.features.0'),
        t('coreServices.3.features.1'),
        t('coreServices.3.features.2'),
        t('coreServices.3.features.3'),
        t('coreServices.3.features.4')
      ],
      deliverables: [
        t('coreServices.3.deliverables.0'),
        t('coreServices.3.deliverables.1'),
        t('coreServices.3.deliverables.2'),
        t('coreServices.3.deliverables.3'),
        t('coreServices.3.deliverables.4')
      ],
      pricing: t('coreServices.3.pricing'),
      subtext: t('coreServices.3.subtext'),
      cta: t('coreServices.3.cta'),
      icon: Wrench,
      color: '#F87315'
    },
    {
      number: '4',
      title: t('coreServices.4.title'),
      subtitle: t('coreServices.4.subtitle'),
      description: t('coreServices.4.description'),
      features: [
        t('coreServices.4.features.0'),
        t('coreServices.4.features.1'),
        t('coreServices.4.features.2'),
        t('coreServices.4.features.3'),
        t('coreServices.4.features.4')
      ],
      deliverables: [
        t('coreServices.4.deliverables.0'),
        t('coreServices.4.deliverables.1'),
        t('coreServices.4.deliverables.2'),
        t('coreServices.4.deliverables.3'),
        t('coreServices.4.deliverables.4')
      ],
      pricing: t('coreServices.4.pricing'),
      subtext: t('coreServices.4.subtext'),
      cta: t('coreServices.4.cta'),
      icon: Activity,
      color: '#F87315'
    }
  ];

  const specialistServices = [
    {
      title: t('specialistServices.0.title'),
      description: t('specialistServices.0.description'),
      pricing: t('specialistServices.0.pricing'),
      note: t('specialistServices.0.note'),
      icon: FileText
    },
    {
      title: t('specialistServices.1.title'),
      description: t('specialistServices.1.description'),
      pricing: t('specialistServices.1.pricing'),
      note: t('specialistServices.1.note'),
      icon: Brain
    },
    {
      title: t('specialistServices.2.title'),
      description: t('specialistServices.2.description'),
      pricing: t('specialistServices.2.pricing'),
      note: t('specialistServices.2.note'),
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="pt-28 pb-20 sm:pt-32 sm:pb-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-[-0.02em]">
                <span
                  className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                    boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.5)',
                  }}
                >
                  {t('hero.titleHighlight')}
                </span>{' '}
                {t('hero.title')}
              </h1>
              <p className="text-lg sm:text-xl text-white/75 max-w-xl mx-auto lg:mx-0 mb-4 leading-relaxed">
                {t('hero.description')}
              </p>
              <p className="text-base sm:text-lg text-[#FF9F43] max-w-lg mx-auto lg:mx-0">
                {t('hero.tagline')}
              </p>
            </motion.div>

            {/* Atmospheric Images */}
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="sfeer-image sfeer-under rounded-xl overflow-hidden"
              >
                <Image
                  src="/images/mariola-grobelska-siujy-8IPrk-unsplash.jpg"
                  alt=""
                  width={500}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="sfeer-image sfeer-accent ml-8 rounded-xl overflow-hidden"
              >
                <Image
                  src="/images/ambrose-chua-zxbNbuncq1g-unsplash.jpg"
                  alt=""
                  width={400}
                  height={250}
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            {coreServices.map((service, index) => (
              <motion.div
                key={service.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Service Info */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center mb-6">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 text-xl font-bold text-white transition-transform duration-300 group-hover:scale-105"
                        style={{ background: service.color === '#22c55e' ? 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' : 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                      >
                        {service.number}
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">{service.title}</h2>
                        <p className="text-base" style={{ color: service.color === '#22c55e' ? '#4ade80' : '#FF9F43' }}>{service.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-white/70 leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Pricing */}
                    <div className="bg-white/[0.05] rounded-xl p-5 mb-6">
                      <div className="flex items-center mb-2">
                        <Euro className="w-5 h-5 mr-2" style={{ color: service.color === '#22c55e' ? '#4ade80' : '#FF9F43' }} />
                        <span className="text-xl font-bold text-white">{service.pricing}</span>
                      </div>
                      <p className="text-white/55 text-sm">{service.subtext}</p>
                    </div>

                    <Link href={
                      service.cta === 'Plan Gesprek' ? '/contact' :
                      service.cta === 'Start Online Assessment' ? '/agent-readiness' :
                      service.cta === 'Bespreek Pilot Opties' ? '/pilot-intake' :
                      service.cta === 'Krijg Implementation Proposal' ? '/implementation-proposal' :
                      service.cta === 'Request Demo Dashboard' ? '/demo-request' :
                      '/contact'
                    }>
                      <Button
                        size="lg"
                        className="w-full h-12 text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: service.color === '#22c55e' ? 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' : 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                          boxShadow: service.color === '#22c55e' ? '0 4px 20px -4px rgba(34, 197, 94, 0.4)' : '0 4px 20px -4px rgba(248, 115, 21, 0.4)',
                        }}
                      >
                        <service.icon className="mr-2 w-5 h-5" />
                        {service.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Features & Deliverables */}
                  <div className="lg:col-span-2">
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                      {/* What We Do */}
                      <div>
                        <h4 className="text-base font-semibold text-white mb-4">{t('labels.whatWeDo')}:</h4>
                        <ul className="space-y-2.5">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-white/70 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: service.color === '#22c55e' ? '#4ade80' : '#FF9F43' }} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* What You Get */}
                      <div>
                        <h4 className="text-base font-semibold text-white mb-4">{t('labels.whatYouGet')}:</h4>
                        <ul className="space-y-2.5">
                          {service.deliverables.map((deliverable, idx) => (
                            <li key={idx} className="flex items-center text-white/70 text-sm">
                              <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: service.color === '#22c55e' ? '#4ade80' : '#FF9F43' }} />
                              {deliverable}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-black">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('journey.title')}: {t('journey.from')}{' '}
                <span className="text-red-400">{t('journey.scan')}</span> {t('journey.to')}{' '}
                <span className="text-[#FF9F43]">{t('journey.scale')}</span>
              </h2>
            </motion.div>

            {/* Timeline Visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="relative mb-16"
            >
              <div className="flex items-center justify-between mb-8">
                {[
                  { time: t('timeline.step1.time'), title: t('timeline.step1.title'), num: '1' },
                  { time: t('timeline.step2.time'), title: t('timeline.step2.title'), num: '2' },
                  { time: t('timeline.step3.time'), title: t('timeline.step3.title'), num: '3' }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="text-center flex-1">
                      <div className="text-sm text-white/55 mb-2">{step.time}</div>
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto text-white font-bold transition-transform duration-300 hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                      >
                        {step.num}
                      </div>
                      <div className="text-white font-medium mt-2 text-sm">{step.title}</div>
                    </div>
                    {idx < 2 && <ArrowRight className="w-6 h-6 text-white/30 mx-4" />}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Typical Journey */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-8 text-center">{t('investmentCalculator.title')}</h3>

              <div className="mb-8">
                <h4 className="text-base font-semibold text-white mb-5 text-center">{t('investmentCalculator.subtitle')}:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                  {[
                    { label: 'FREE', sub: t('investmentCalculator.steps.consult'), color: 'text-emerald-400' },
                    { label: 'Fixed', sub: t('investmentCalculator.steps.assessment'), color: 'text-white' },
                    { label: 'Pilot', sub: t('investmentCalculator.steps.pilot'), color: 'text-white' },
                    { label: 'Custom', sub: t('investmentCalculator.steps.implementation'), color: 'text-white' },
                    { label: 'Monthly', sub: t('investmentCalculator.steps.monitoring'), color: 'text-white' }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center p-4 bg-white/[0.03] rounded-xl border border-white/10">
                      <div className={`text-lg font-bold ${item.color}`}>{item.label}</div>
                      <div className="text-white/55 text-xs mt-1">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {[
                  { label: 'Initial', sub: t('roi.year1Investment'), note: t('roi.year1Note'), color: 'border-[#F87315]/30 bg-[#F87315]/10', noteColor: 'text-[#FF9F43]' },
                  { label: '6-9', sub: t('roi.monthsROI'), note: t('roi.roiNote'), color: 'border-emerald-500/30 bg-emerald-500/10', noteColor: 'text-emerald-400' },
                  { label: 'Ongoing', sub: t('roi.year2Savings'), note: t('roi.year2Note'), color: 'border-blue-500/30 bg-blue-500/10', noteColor: 'text-blue-400' }
                ].map((item, idx) => (
                  <div key={idx} className={`text-center p-6 border rounded-xl ${item.color}`}>
                    <div className="text-xl font-bold text-white mb-2">{item.label}</div>
                    <div className="text-white/75 text-sm mb-2">{item.sub}</div>
                    <div className={`font-medium text-xs ${item.noteColor}`}>{item.note}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specialist Services */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('specialistSection.title')}: <span className="text-[#FF9F43]">{t('specialistSection.titleHighlight')}</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/65 max-w-3xl mx-auto">{t('specialistSection.description')}</p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
              {/* Specialist Services */}
              <div className="space-y-5">
                {specialistServices.map((service, index) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    className="group bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">{service.title}</h3>
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">{service.description}</p>
                    <div className="mb-3">
                      <div className="text-base font-semibold text-[#FF9F43]">
                        {service.pricing}
                      </div>
                    </div>
                    <p className="text-xs italic text-white/50">
                      {service.note}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Atmospheric Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="hidden lg:flex items-center justify-center"
              >
                <div className="sfeer-image w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src="/images/sumaid-pal-singh-bakshi-avWFUikdFrc-unsplash.jpg"
                    alt=""
                    width={600}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                </div>
              </motion.div>
            </div>

            {/* Not Sure Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                  {t('notSure.title')}
                </h3>
                <p className="text-white/75 mb-2">
                  {t('notSure.advice')}
                </p>
                <p className="text-white/55 text-sm mb-6">
                  {t('notSure.note')}
                </p>
                <Button
                  size="lg"
                  className="h-12 text-white font-medium px-8 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
                    boxShadow: '0 4px 20px -4px rgba(34, 197, 94, 0.4)',
                  }}
                >
                  <Users className="mr-2 w-5 h-5" />
                  {t('cta.planCall')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why This Approach Works */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-black">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('whyThisWorks.title')} <span className="text-[#FF9F43]">{t('whyThisWorks.titleHighlight')}</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: t('benefits.0.title'), desc: t('benefits.0.description'), icon: Users },
                { title: t('benefits.1.title'), desc: t('benefits.1.description'), icon: TrendingUp },
                { title: t('benefits.2.title'), desc: t('benefits.2.description'), icon: Brain },
                { title: t('benefits.3.title'), desc: t('benefits.3.description'), icon: Eye }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="group text-center p-6 bg-white/[0.03] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                  >
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.02em]">{t('faq.title')}</h2>
            </motion.div>

            <div className="space-y-5">
              {[
                { q: t('faq.questions.0.question'), a: t('faq.questions.0.answer') },
                { q: t('faq.questions.1.question'), a: t('faq.questions.1.answer') },
                { q: t('faq.questions.2.question'), a: t('faq.questions.2.answer') }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                >
                  <h3 className="text-base font-semibold text-white mb-3">"{faq.q}"</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-black">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-[-0.02em]">
                {t('finalCta.title')}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="bg-white/[0.03] border-2 border-[#F87315]/50 rounded-2xl p-6 sm:p-8 text-center relative md:scale-105"
              >
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                >
                  {t('finalCta.recommended')}
                </div>
                <h3 className="text-lg font-semibold text-white mb-4 mt-2">{t('finalCta.option1.title')}</h3>
                <p className="text-white/70 text-sm mb-6">{t('finalCta.option1.description')}</p>
                <Button
                  className="w-full h-11 text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                    boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.4)',
                  }}
                >
                  {t('finalCta.option1.cta')}
                </Button>
              </motion.div>

              {[
                { title: t('finalCta.option2.title'), desc: t('finalCta.option2.description'), cta: t('finalCta.option2.cta') },
                { title: t('finalCta.option3.title'), desc: t('finalCta.option3.description'), cta: t('finalCta.option3.cta') }
              ].map((option, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (idx + 1) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:border-white/20 transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">{option.title}</h3>
                  <p className="text-white/70 text-sm mb-6">{option.desc}</p>
                  <Button
                    variant="outline"
                    className="w-full h-11 border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-lg transition-all duration-300"
                  >
                    {option.cta}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
