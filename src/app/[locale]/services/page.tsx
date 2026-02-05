'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import {
  Code, Lightbulb, Zap, Mic, Users,
  ArrowRight, CheckCircle, Sparkles, Clock
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function ServicesPage() {
  const t = useTranslations('servicesOverview');

  const labels = {
    whoItsFor: t('services.labels.whoItsFor'),
    whatYouGet: t('services.labels.whatYouGet'),
    includes: t('services.labels.includes'),
    timeline: t('services.labels.timeline'),
  };

  const serviceIds = ['web', 'aiStrategy', 'mcp', 'voice', 'training'] as const;
  const icons = { web: Code, aiStrategy: Lightbulb, mcp: Zap, voice: Mic, training: Users };
  const gradients: Record<string, string> = {
    web: 'linear-gradient(135deg, #3B82F6 0%, #22D3EE 100%)',
    aiStrategy: 'linear-gradient(135deg, #A855F7 0%, #F472B6 100%)',
    mcp: 'linear-gradient(135deg, #F97316 0%, #FACC15 100%)',
    voice: 'linear-gradient(135deg, #2563EB 0%, #A855F7 100%)',
    training: 'linear-gradient(135deg, #22C55E 0%, #2DD4BF 100%)',
  };

  const services = serviceIds.map((id) => {
    const deliverableKeys = Object.keys(
      (t.raw(`services.${id}.deliverables`) as Record<string, string>) || {}
    );
    return {
      id,
      icon: icons[id],
      bgGradient: gradients[id],
      title: t(`services.${id}.title`),
      tagline: t(`services.${id}.tagline`),
      description: t(`services.${id}.description`),
      targetAudience: t(`services.${id}.targetAudience`),
      outcome: t(`services.${id}.outcome`),
      timeframe: t(`services.${id}.timeframe`),
      deliverables: deliverableKeys.map((key) => t(`services.${id}.deliverables.${key}`)),
    };
  });

  const faqs = [
    { q: t('faq.questions.0.question'), a: t('faq.questions.0.answer') },
    { q: t('faq.questions.1.question'), a: t('faq.questions.1.answer') },
    { q: t('faq.questions.2.question'), a: t('faq.questions.2.answer') }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="pt-28 pb-20 sm:pt-32 sm:pb-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('hero.title')}{' '}
                <span
                  className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                    boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.5)',
                  }}
                >
                  {t('hero.titleHighlight')}
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.id}
                    id={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 flex flex-col scroll-mt-24"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: service.bgGradient }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{service.title}</h3>
                    <p className="text-[#FF9F43] text-sm font-medium mb-3">{service.tagline}</p>
                    <p className="text-white/70 text-sm leading-relaxed mb-4">{service.description}</p>

                    {/* Who it's for */}
                    <div className="mb-3">
                      <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{labels.whoItsFor}</p>
                      <p className="text-white/70 text-sm">{service.targetAudience}</p>
                    </div>

                    {/* What you get */}
                    <div className="mb-4">
                      <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{labels.whatYouGet}</p>
                      <p className="text-white/80 text-sm font-medium">{service.outcome}</p>
                    </div>

                    {/* Deliverables */}
                    <div className="mb-4 flex-grow">
                      <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">{labels.includes}</p>
                      <ul className="space-y-1.5">
                        {service.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-center text-white/60 text-sm">
                            <CheckCircle className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-[#FF9F43]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Timeframe badge */}
                    <div className="flex items-center text-white/60 text-sm mb-4">
                      <Clock className="w-4 h-4 mr-2 text-[#FF9F43]" />
                      <span className="text-white/50">{labels.timeline}:</span>
                      <span className="text-white font-medium ml-1">{service.timeframe}</span>
                    </div>

                    <Link href={`/contact?service=${service.id}`}>
                      <Button
                        className="w-full h-11 text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: service.bgGradient,
                          boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {t('services.cta')}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Agent Journey Teaser */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-black">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#F87315]/15 to-[#F87315]/5 border border-[#F87315]/30 rounded-2xl p-8 sm:p-12"
            >
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[#FF9F43] font-semibold text-sm uppercase tracking-wider">
                      {t('agentJourney.badge')}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    {t('agentJourney.title')}
                  </h2>
                  <p className="text-white/70 text-lg leading-relaxed mb-6">
                    {t('agentJourney.description')}
                  </p>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {['FREE CONSULT', 'ASSESS', 'PILOT', 'BUILD', 'MONITOR'].map((step, idx) => (
                      <span
                        key={step}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10"
                      >
                        {idx}. {step}
                      </span>
                    ))}
                  </div>

                  <Link href="/services/agent-journey">
                    <Button
                      size="lg"
                      className="h-12 text-white font-medium px-8 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                        boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                      }}
                    >
                      {t('agentJourney.cta')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>

                <div className="hidden lg:block">
                  <div className="relative h-[300px] rounded-xl overflow-hidden">
                    <Image
                      src="/images/mariola-grobelska-siujy-8IPrk-unsplash.jpg"
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.02em]">
                {t('faq.title')}
              </h2>
            </motion.div>

            <div className="space-y-5">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                >
                  <h3 className="text-base font-semibold text-white mb-3">{faq.q}</h3>
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
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('cta.title')}
              </h2>
              <p className="text-lg sm:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                {t('cta.description')}
              </p>
              <Link href="/contact">
                <Button
                  size="lg"
                  className="h-14 text-white font-medium px-10 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                    boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.5)',
                  }}
                >
                  {t('cta.button')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
