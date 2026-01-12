'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Github, ExternalLink, ArrowRight, CheckCircle, Users,
  Brain, FileText, Code, Wrench, Target
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function CasesPage() {
  const t = useTranslations('casesPage');

  const liveImplementations = [
    {
      titleKey: 'liveImplementations.snelnotuleren.title',
      subtitleKey: 'liveImplementations.snelnotuleren.subtitle',
      statsKeys: [
        { valueKey: 'liveImplementations.snelnotuleren.stats.meetings.value', labelKey: 'liveImplementations.snelnotuleren.stats.meetings.label' },
        { valueKey: 'liveImplementations.snelnotuleren.stats.tokens.value', labelKey: 'liveImplementations.snelnotuleren.stats.tokens.label' },
        { valueKey: 'liveImplementations.snelnotuleren.stats.gdpr.value', labelKey: 'liveImplementations.snelnotuleren.stats.gdpr.label' }
      ],
      highlightKey: 'liveImplementations.snelnotuleren.highlight',
      featuresKeys: [
        'liveImplementations.snelnotuleren.features.orchestration',
        'liveImplementations.snelnotuleren.features.noVector',
        'liveImplementations.snelnotuleren.features.zeroContext',
        'liveImplementations.snelnotuleren.features.privacy'
      ],
      icon: FileText,
      statusKey: 'liveImplementations.snelnotuleren.status'
    },
    {
      titleKey: 'liveImplementations.enterprise.title',
      subtitleKey: 'liveImplementations.enterprise.subtitle',
      statsKeys: [
        { valueKey: 'liveImplementations.enterprise.stats.users.value', labelKey: 'liveImplementations.enterprise.stats.users.label' },
        { valueKey: 'liveImplementations.enterprise.stats.availability.value', labelKey: 'liveImplementations.enterprise.stats.availability.label' },
        { valueKey: 'liveImplementations.enterprise.stats.nda.value', labelKey: 'liveImplementations.enterprise.stats.nda.label' }
      ],
      highlightKey: 'liveImplementations.enterprise.highlight',
      featuresKeys: [
        'liveImplementations.enterprise.features.routing',
        'liveImplementations.enterprise.features.agentic',
        'liveImplementations.enterprise.features.azure',
        'liveImplementations.enterprise.features.workflow'
      ],
      icon: Brain,
      statusKey: 'liveImplementations.enterprise.status'
    }
  ];

  const focusAreas = [
    {
      titleKey: 'focusAreas.mcpExpertise.title',
      descriptionKey: 'focusAreas.mcpExpertise.description',
      icon: Code
    },
    {
      titleKey: 'focusAreas.customImplementations.title',
      descriptionKey: 'focusAreas.customImplementations.description',
      icon: Wrench
    },
    {
      titleKey: 'focusAreas.openSource.title',
      descriptionKey: 'focusAreas.openSource.description',
      icon: Github
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="pt-28 pb-20 sm:pt-32 sm:pb-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-[-0.02em]">
                <span
                  className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                    boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.5)',
                  }}
                >
                  {t('hero.title')}
                </span>{' '}
                {t('hero.titleSuffix')}
              </h1>
              <p className="text-lg sm:text-xl text-white/75 max-w-3xl mx-auto leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Source Initiative */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('openSource.title')}{' '}
                <span className="text-[#FF9F43]">{t('openSource.titleHighlight')}</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-12"
            >
              <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                <div className="lg:col-span-2">
                  <div className="flex items-center mb-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mr-4"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <Github className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white">{t('openSource.project.title')}</h3>
                      <p className="text-lg text-[#FF9F43]">{t('openSource.project.subtitle')}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">{t('openSource.whatItIs.title')}:</h4>
                      <ul className="space-y-2.5">
                        {['proof', 'functions', 'opensource', 'active'].map((feature) => (
                          <li key={feature} className="flex items-start text-white/75 text-sm">
                            <CheckCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-[#FF9F43]" />
                            {t(`openSource.whatItIs.features.${feature}`)}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">{t('openSource.whyImportant.title')}:</h4>
                      <p className="text-white/70 leading-relaxed text-sm">
                        {t('openSource.whyImportant.description')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-lg transition-all duration-300"
                    >
                      <Github className="mr-2 w-4 h-4" />
                      {t('openSource.buttons.github')}
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                    <Button
                      className="text-white border-0 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                        boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.4)',
                      }}
                    >
                      {t('openSource.buttons.demo')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-white/[0.05] rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-5">{t('openSource.stats.title')}</h4>
                  <div className="space-y-4">
                    {[
                      { labelKey: 'stars', color: 'text-white' },
                      { labelKey: 'contributors', color: 'text-white' },
                      { labelKey: 'license', color: 'text-white' },
                      { labelKey: 'status', color: 'text-emerald-400' }
                    ].map((stat) => (
                      <div key={stat.labelKey} className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">{t(`openSource.stats.${stat.labelKey}.label`)}</span>
                        <span className={`${stat.color} font-semibold`}>{t(`openSource.stats.${stat.labelKey}.value`)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Implementations */}
      <section className="py-20 sm:py-28 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('liveImplementations.title')}{' '}
                <span className="text-[#FF9F43]">{t('liveImplementations.titleHighlight')}</span>
              </h2>
            </motion.div>

            <div className="space-y-8">
              {liveImplementations.map((implementation, index) => (
                <motion.div
                  key={implementation.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="group bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
                >
                  <div className="grid lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
                    <div className="lg:col-span-2">
                      <div className="flex items-center mb-6">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 transition-transform duration-300 group-hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                        >
                          <implementation.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-white">{t(implementation.titleKey)}</h3>
                          <p className="text-white/60 italic text-sm">{t(implementation.subtitleKey)}</p>
                        </div>
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 mb-6">
                        <p className="text-base sm:text-lg font-medium text-white mb-2">"{t(implementation.highlightKey)}"</p>
                        <p className="text-sm text-white/55">{t(implementation.statusKey)}</p>
                      </div>

                      <div>
                        <h4 className="text-base font-semibold text-white mb-4">{t('liveImplementations.keyFeatures')}:</h4>
                        <ul className="space-y-2.5">
                          {implementation.featuresKeys.map((featureKey, idx) => (
                            <li key={idx} className="flex items-start text-white/70 text-sm">
                              <CheckCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-[#FF9F43]" />
                              {t(featureKey)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Atmospheric Image */}
                    <div className="lg:col-span-1 hidden lg:flex items-center justify-center">
                      <div className="sfeer-image w-full h-full rounded-xl overflow-hidden">
                        <Image
                          src={index === 0 ? "/images/flyd-zbYYnDti3oU-unsplash.jpg" : "/images/luis-quintero-nu8doV27wpo-unsplash.jpg"}
                          alt=""
                          width={250}
                          height={300}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>

                    <div className="bg-white/[0.05] rounded-xl p-5">
                      <h4 className="text-white font-semibold mb-5">{t('liveImplementations.impactMetrics')}</h4>
                      <div className="space-y-5">
                        {implementation.statsKeys.map((statKeys, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{t(statKeys.valueKey)}</div>
                            <div className="text-white/55 text-sm">{t(statKeys.labelKey)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Leadership */}
      <section className="py-20 sm:py-28 lg:py-36 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('technologyLeadership.title')}{' '}
                <span className="text-[#FF9F43]">{t('technologyLeadership.titleHighlight')}</span>
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Technologies */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="space-y-5"
              >
                {/* Intelligent Ticket Classification */}
                <div className="group bg-white/[0.03] border-l-4 rounded-r-xl p-5 hover:bg-white/[0.06] transition-all duration-300" style={{ borderLeftColor: '#F87315' }}>
                  <div className="flex items-center mb-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center mr-4 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{t('technologyLeadership.intelligentTicket.title')}</h3>
                      <p className="text-xs text-white/55">{t('technologyLeadership.intelligentTicket.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-3 leading-relaxed">
                    {t('technologyLeadership.intelligentTicket.description')}
                  </p>
                  <div className="flex items-center text-xs">
                    <ArrowRight className="w-3 h-3 mr-2 text-[#FF9F43]" />
                    <span className="font-medium text-[#FF9F43]">{t('technologyLeadership.intelligentTicket.tagline')}</span>
                  </div>
                </div>

                {/* Agentic Conversational AI */}
                <div className="group bg-white/[0.03] border-l-4 rounded-r-xl p-5 hover:bg-white/[0.06] transition-all duration-300" style={{ borderLeftColor: '#F87315' }}>
                  <div className="flex items-center mb-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center mr-4 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{t('technologyLeadership.agenticAI.title')}</h3>
                      <p className="text-xs text-white/55">{t('technologyLeadership.agenticAI.subtitle')}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-3 text-xs">
                    {['liveAgent', 'knowledge', 'catalog', 'simple'].map((cap) => (
                      <div key={cap} className="flex items-center text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full mr-2 bg-[#FF9F43]" />
                        {t(`technologyLeadership.agenticAI.capabilities.${cap}`)}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center text-xs">
                    <ArrowRight className="w-3 h-3 mr-2 text-[#FF9F43]" />
                    <span className="font-medium text-[#FF9F43]">{t('technologyLeadership.agenticAI.tagline')}</span>
                  </div>
                </div>

                {/* Multi-Agent Orchestration */}
                <div className="group bg-white/[0.03] border-l-4 rounded-r-xl p-5 hover:bg-white/[0.06] transition-all duration-300" style={{ borderLeftColor: '#F87315' }}>
                  <div className="flex items-center mb-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center mr-4 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{t('technologyLeadership.multiAgent.title')}</h3>
                      <p className="text-xs text-white/55">{t('technologyLeadership.multiAgent.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-3 leading-relaxed">
                    {t('technologyLeadership.multiAgent.description')}
                  </p>
                  <div className="flex items-center text-xs">
                    <ArrowRight className="w-3 h-3 mr-2 text-[#FF9F43]" />
                    <span className="font-medium text-[#FF9F43]">{t('technologyLeadership.multiAgent.tagline')}</span>
                  </div>
                </div>
              </motion.div>

              {/* Atmospheric Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="hidden lg:flex items-center justify-center"
              >
                <div className="sfeer-image sticky top-8 rounded-xl overflow-hidden" style={{ height: '420px' }}>
                  <Image
                    src="/images/adrien-olichon-GBCLhU3rN5w-unsplash.jpg"
                    alt=""
                    width={400}
                    height={500}
                    className="object-cover w-full h-full"
                  />
                </div>
              </motion.div>

              {/* Right Column - Technologies */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="space-y-5"
              >
                {/* Extreme Context Processing */}
                <div className="group bg-white/[0.03] border-l-4 rounded-r-xl p-5 hover:bg-white/[0.06] transition-all duration-300" style={{ borderLeftColor: '#F87315' }}>
                  <div className="flex items-center mb-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center mr-4 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{t('technologyLeadership.extremeContext.title')}</h3>
                      <p className="text-xs text-white/55">{t('technologyLeadership.extremeContext.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-3 leading-relaxed">
                    {t('technologyLeadership.extremeContext.description')}
                  </p>
                  <div className="flex items-center text-xs">
                    <ArrowRight className="w-3 h-3 mr-2 text-[#FF9F43]" />
                    <span className="font-medium text-[#FF9F43]">{t('technologyLeadership.extremeContext.tagline')}</span>
                  </div>
                </div>

                {/* MCP Excellence */}
                <div className="group bg-white/[0.03] border-l-4 rounded-r-xl p-5 hover:bg-white/[0.06] transition-all duration-300" style={{ borderLeftColor: '#F87315' }}>
                  <div className="flex items-center mb-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center mr-4 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{t('technologyLeadership.mcpExcellence.title')}</h3>
                      <p className="text-xs text-white/55">{t('technologyLeadership.mcpExcellence.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-3 leading-relaxed">
                    {t('technologyLeadership.mcpExcellence.description')}
                  </p>
                  <div className="flex items-center text-xs">
                    <ArrowRight className="w-3 h-3 mr-2 text-[#FF9F43]" />
                    <span className="font-medium text-[#FF9F43]">{t('technologyLeadership.mcpExcellence.tagline')}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-20 sm:py-28 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('focusAreas.title')}{' '}
                <span className="text-[#FF9F43]">{t('focusAreas.titleHighlight')}</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/65 max-w-3xl mx-auto leading-relaxed">
                {t('focusAreas.subtitle')}
              </p>
            </motion.div>

            <div className="space-y-5">
              {focusAreas.map((area, index) => (
                <motion.div
                  key={area.titleKey}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="group bg-white/[0.03] border border-white/10 rounded-xl p-6 sm:p-8 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <area.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">{t(area.titleKey)}</h3>
                      <p className="text-white/70 leading-relaxed">{t(area.descriptionKey)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
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
                {t('testimonials.title')}{' '}
                <span className="text-[#FF9F43]">{t('testimonials.titleHighlight')}</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {['first', 'second'].map((testimonial, index) => (
                <motion.div
                  key={testimonial}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-6 sm:p-8 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <blockquote className="text-base sm:text-lg text-white/85 mb-6 leading-relaxed italic">
                    "{t(`testimonials.${testimonial}.quote`)}"
                  </blockquote>
                  <cite className="text-white/60 font-medium not-italic text-sm">
                    {t(`testimonials.${testimonial}.author`)}
                  </cite>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Start Your Project */}
      <section className="py-20 sm:py-28 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 tracking-[-0.02em]">
                  {t('cta.title')}
                </h2>
                <p className="text-lg sm:text-xl text-white/75 mb-4">
                  {t('cta.subtitle')}
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-white mb-8">
                  {t('cta.statement')}{' '}
                  <span className="text-[#FF9F43]">{t('cta.statementHighlight')}</span>{' '}
                  {t('cta.statementEnd')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/agent-readiness">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-14 text-base font-medium px-8 text-white border-0 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                        boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                      }}
                    >
                      <Users className="mr-2 w-5 h-5" />
                      {t('cta.buttons.discuss')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-14 text-base font-medium px-8 border-white/25 text-white hover:bg-white/10 hover:border-white/40 rounded-lg transition-all duration-300"
                    onClick={() => window.open('/api/download/mcp-guide', '_blank')}
                  >
                    {t('cta.buttons.downloadGuide')}
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/50 text-sm">
                    {t('cta.note')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
