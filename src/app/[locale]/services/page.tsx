'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { 
  Eye, Wrench, Activity, CheckCircle, ArrowRight, Calendar, 
  Euro, Clock, TrendingUp, Shield, FileText, Brain, Users, Target
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
      <section className="py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            
            {/* Content Column */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  <span
                    className="text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 inline-block"
                    style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
                  >
                    {t('hero.titleHighlight')}
                  </span>{' '}
                  {t('hero.title')}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-4xl mx-auto lg:mx-0 mb-3 sm:mb-4">
                  {t('hero.description')}
                </p>
                <p className="text-sm sm:text-base md:text-lg max-w-3xl mx-auto lg:mx-0 mb-4 sm:mb-6 md:mb-8" style={{ color: '#F87315' }}>
                  {t('hero.tagline')}
                </p>
              </motion.div>
            </div>
            
            {/* Subtle Atmospheric Images */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="sfeer-image sfeer-under"
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
                transition={{ duration: 0.8, delay: 0.5 }}
                className="sfeer-image sfeer-accent ml-8"
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
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 md:space-y-16">
            {coreServices.map((service, index) => (
              <motion.div
                key={service.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 lg:p-12"
              >
                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Service Info */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center mb-6">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mr-4 text-2xl font-bold text-white"
                        style={{ backgroundColor: service.color }}
                      >
                        {service.number}
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{service.title}</h2>
                        <p className="text-base sm:text-lg md:text-xl" style={{ color: service.color }}>{service.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-white/80 text-lg leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Pricing */}
                    <div className="bg-white/5 rounded-lg p-6 mb-6">
                      <div className="flex items-center mb-2">
                        <Euro className="w-5 h-5 mr-2" style={{ color: service.color }} />
                        <span className="text-2xl font-bold text-white">{service.pricing}</span>
                      </div>
                      <p className="text-white/60 text-sm">{service.subtext}</p>
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
                        className="w-full text-white font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        style={{ 
                          backgroundColor: service.color,
                          boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
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
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* What We Do */}
                      <div>
                        <h4 className="text-lg font-bold text-white mb-4">{t('labels.whatWeDo')}:</h4>
                        <ul className="space-y-3">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-white/80 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: service.color }}></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* What You Get */}
                      <div>
                        <h4 className="text-lg font-bold text-white mb-4">{t('labels.whatYouGet')}:</h4>
                        <ul className="space-y-3">
                          {service.deliverables.map((deliverable, idx) => (
                            <li key={idx} className="flex items-center text-white/80 text-sm">
                              <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: service.color }} />
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
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-black">
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('journey.title')}: {t('journey.from')}{' '}
                <span className="text-red-400">{t('journey.scan')}</span> {t('journey.to')}{' '}
                <span style={{ color: '#F87315' }}>{t('journey.scale')}</span>
              </h2>
            </motion.div>

            {/* Timeline Visual */}
            <div className="relative mb-16">
              <div className="flex items-center justify-between mb-8">
                <div className="text-center flex-1">
                  <div className="text-sm text-white/60 mb-2">{t('timeline.step1.time')}</div>
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white font-bold"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    1
                  </div>
                  <div className="text-white font-medium mt-2">{t('timeline.step1.title')}</div>
                </div>

                <ArrowRight className="w-8 h-8 text-white/40" />

                <div className="text-center flex-1">
                  <div className="text-sm text-white/60 mb-2">{t('timeline.step2.time')}</div>
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white font-bold"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    2
                  </div>
                  <div className="text-white font-medium mt-2">{t('timeline.step2.title')}</div>
                </div>

                <ArrowRight className="w-8 h-8 text-white/40" />

                <div className="text-center flex-1">
                  <div className="text-sm text-white/60 mb-2">{t('timeline.step3.time')}</div>
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white font-bold"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    3
                  </div>
                  <div className="text-white font-medium mt-2">{t('timeline.step3.title')}</div>
                </div>
              </div>
            </div>

            {/* Typical Journey */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">{t('investmentCalculator.title')}</h3>
              
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 text-center">{t('investmentCalculator.subtitle')}:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-xl font-bold text-green-400">FREE</div>
                    <div className="text-white/60 text-sm">{t('investmentCalculator.steps.consult')}</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-xl font-bold text-white">Fixed</div>
                    <div className="text-white/60 text-sm">{t('investmentCalculator.steps.assessment')}</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-xl font-bold text-white">Pilot</div>
                    <div className="text-white/60 text-sm">{t('investmentCalculator.steps.pilot')}</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-xl font-bold text-white">Custom</div>
                    <div className="text-white/60 text-sm">{t('investmentCalculator.steps.implementation')}</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-xl font-bold text-white">Monthly</div>
                    <div className="text-white/60 text-sm">{t('investmentCalculator.steps.monitoring')}</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-orange-500/30 rounded-lg bg-orange-500/10">
                  <div className="text-2xl font-bold text-white mb-2">Initial</div>
                  <div className="text-white/80 mb-2">{t('roi.year1Investment')}</div>
                  <div className="text-orange-400 font-semibold text-sm">{t('roi.year1Note')}</div>
                </div>
                
                <div className="text-center p-6 border border-green-500/30 rounded-lg bg-green-500/10">
                  <div className="text-2xl font-bold text-white mb-2">6-9</div>
                  <div className="text-white/80 mb-2">{t('roi.monthsROI')}</div>
                  <div className="text-green-400 font-semibold text-sm">{t('roi.roiNote')}</div>
                </div>

                <div className="text-center p-6 border border-blue-500/30 rounded-lg bg-blue-500/10">
                  <div className="text-2xl font-bold text-white mb-2">Ongoing</div>
                  <div className="text-white/80 mb-2">{t('roi.year2Savings')}</div>
                  <div className="text-blue-400 font-semibold text-sm">{t('roi.year2Note')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialist Services */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('specialistSection.title')}: <span style={{ color: '#F87315' }}>{t('specialistSection.titleHighlight')}</span>
              </h2>
              <p className="text-xl text-white/70">{t('specialistSection.description')}</p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-stretch">
              {/* Linker kolom - Specialist Services */}
              <div className="grid gap-8">
                {specialistServices.map((service, index) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                  >
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                    <p className="text-white/80 mb-4">{service.description}</p>
                    <div className="mb-4">
                      <div className="text-lg font-bold" style={{ color: '#F87315' }}>
                        {service.pricing}
                      </div>
                    </div>
                    <p className="text-sm italic text-white/60">
                      {service.note}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Rechter kolom - Afbeelding */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex items-center justify-center"
              >
                <div className="sfeer-image w-full h-full">
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
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mt-16"
            >
              <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl p-8 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {t('notSure.title')}
                </h3>
                <p className="text-white/80 mb-2">
                  {t('notSure.advice')}
                </p>
                <p className="text-white/60 mb-6">
                  {t('notSure.note')}
                </p>
                <Button
                  size="lg"
                  className="text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  style={{ 
                    backgroundColor: '#22c55e',
                    boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.25)'
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
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-black">
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('whyThisWorks.title')} <span style={{ color: '#F87315' }}>{t('whyThisWorks.titleHighlight')}</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { title: t('benefits.0.title'), desc: t('benefits.0.description'), icon: Users },
                { title: t('benefits.1.title'), desc: t('benefits.1.description'), icon: TrendingUp },
                { title: t('benefits.2.title'), desc: t('benefits.2.description'), icon: Brain },
                { title: t('benefits.3.title'), desc: t('benefits.3.description'), icon: Eye }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 lg:py-20" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">{t('faq.title')}</h2>
            </motion.div>

            <div className="space-y-6">
              {[
                { q: t('faq.questions.0.question'), a: t('faq.questions.0.answer') },
                { q: t('faq.questions.1.question'), a: t('faq.questions.1.answer') },
                { q: t('faq.questions.2.question'), a: t('faq.questions.2.answer') }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-3">"{faq.q}"</h3>
                  <p className="text-white/80">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA with 3 Options */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-black">
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('finalCta.title')}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white/5 border-2 border-orange-500/50 rounded-xl p-8 text-center relative scale-105"
              >
                <div 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: '#F87315' }}
                >
                  {t('finalCta.recommended')}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{t('finalCta.option1.title')}</h3>
                <p className="text-white/80 mb-6">{t('finalCta.option1.description')}</p>
                <Button 
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: '#F87315' }}
                >
                  {t('finalCta.option1.cta')}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8 text-center hover:border-white/20 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-4">{t('finalCta.option2.title')}</h3>
                <p className="text-white/80 mb-6">{t('finalCta.option2.description')}</p>
                <Button className="w-full border border-white/20 text-white hover:bg-white/10">
                  {t('finalCta.option2.cta')}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8 text-center hover:border-white/20 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-4">{t('finalCta.option3.title')}</h3>
                <p className="text-white/80 mb-6">{t('finalCta.option3.description')}</p>
                <Button className="w-full border border-white/20 text-white hover:bg-white/10">
                  {t('finalCta.option3.cta')}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}