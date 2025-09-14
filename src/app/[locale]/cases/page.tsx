'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Github, ExternalLink, ArrowRight, CheckCircle, Users, Clock,
  Brain, FileText, Zap, Shield, Code, Database, Globe, Eye,
  TrendingUp, Award, Lock, Wrench, Target
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
      <section className="py-32 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                <span
                  className="text-white px-4 py-2 inline-block"
                  style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
                >
                  {t('hero.title')}
                </span>{' '}
                {t('hero.titleSuffix')}
              </h1>
              <p className="text-xl text-white/80 max-w-4xl mx-auto mb-8">
                {t('hero.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Source Initiative */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('openSource.title')} <span style={{ color: '#F87315' }}>{t('openSource.titleHighlight')}</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8 lg:p-12"
            >
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-center mb-6">
                    <Github className="w-12 h-12 text-white mr-4" />
                    <div>
                      <h3 className="text-3xl font-bold text-white">{t('openSource.project.title')}</h3>
                      <p className="text-xl" style={{ color: '#F87315' }}>{t('openSource.project.subtitle')}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-4">{t('openSource.whatItIs.title')}:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center text-white/80 text-sm">
                          <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                          {t('openSource.whatItIs.features.proof')}
                        </li>
                        <li className="flex items-center text-white/80 text-sm">
                          <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                          {t('openSource.whatItIs.features.functions')}
                        </li>
                        <li className="flex items-center text-white/80 text-sm">
                          <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                          {t('openSource.whatItIs.features.opensource')}
                        </li>
                        <li className="flex items-center text-white/80 text-sm">
                          <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                          {t('openSource.whatItIs.features.active')}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white mb-4">{t('openSource.whyImportant.title')}:</h4>
                      <p className="text-white/80 leading-relaxed">
                        {t('openSource.whyImportant.description')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="border border-white/20 text-white hover:bg-white/10">
                      <Github className="mr-2 w-4 h-4" />
                      {t('openSource.buttons.github')}
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                    <Button 
                      className="text-white"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      {t('openSource.buttons.demo')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-white font-semibold mb-4">{t('openSource.stats.title')}</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/70">{t('openSource.stats.stars.label')}</span>
                      <span className="text-white font-bold">{t('openSource.stats.stars.value')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">{t('openSource.stats.contributors.label')}</span>
                      <span className="text-white font-bold">{t('openSource.stats.contributors.value')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">{t('openSource.stats.license.label')}</span>
                      <span className="text-white font-bold">{t('openSource.stats.license.value')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">{t('openSource.stats.status.label')}</span>
                      <span className="text-green-400 font-bold">{t('openSource.stats.status.value')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Implementations */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('liveImplementations.title')} <span style={{ color: '#F87315' }}>{t('liveImplementations.titleHighlight')}</span>
              </h2>
            </motion.div>

            <div className="space-y-12">
              {liveImplementations.map((implementation, index) => (
                <motion.div
                  key={implementation.titleKey}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-8 lg:p-12"
                >
                  <div className="grid lg:grid-cols-4 gap-8 items-stretch">
                    <div className="lg:col-span-2">
                      <div className="flex items-center mb-6">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center mr-4"
                          style={{ backgroundColor: '#F87315' }}
                        >
                          <implementation.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{t(implementation.titleKey)}</h3>
                          <p className="text-white/70 italic">{t(implementation.subtitleKey)}</p>
                        </div>
                      </div>

                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
                        <p className="text-lg font-semibold text-white mb-2">"{t(implementation.highlightKey)}"</p>
                        <p className="text-sm text-white/60">{t(implementation.statusKey)}</p>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-white mb-4">{t('liveImplementations.keyFeatures')}:</h4>
                        <ul className="space-y-2">
                          {implementation.featuresKeys.map((featureKey, idx) => (
                            <li key={idx} className="flex items-center text-white/80 text-sm">
                              <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                              {t(featureKey)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Sfeer afbeelding voor elke implementation */}
                    <div className="lg:col-span-1 flex items-center justify-center">
                      <div className="sfeer-image w-full h-full">
                        <Image
                          src={index === 0 ? "/images/flyd-zbYYnDti3oU-unsplash.jpg" : "/images/luis-quintero-nu8doV27wpo-unsplash.jpg"}
                          alt=""
                          width={250}
                          height={300}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-6">
                      <h4 className="text-white font-semibold mb-4">{t('liveImplementations.impactMetrics')}</h4>
                      <div className="space-y-4">
                        {implementation.statsKeys.map((statKeys, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-2xl font-bold text-white">{t(statKeys.valueKey)}</div>
                            <div className="text-white/60 text-sm">{t(statKeys.labelKey)}</div>
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
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('technologyLeadership.title')} <span style={{ color: '#F87315' }}>{t('technologyLeadership.titleHighlight')}</span>
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Technologies */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                {/* Intelligent Ticket Classification */}
                <div className="bg-white/5 border-l-4 rounded-r-xl p-6 hover:bg-white/10 transition-all duration-300" style={{ borderLeftColor: '#F87315' }}>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{t('technologyLeadership.intelligentTicket.title')}</h3>
                      <p className="text-sm text-white/60">{t('technologyLeadership.intelligentTicket.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-3 leading-relaxed">
                    {t('technologyLeadership.intelligentTicket.description')}
                  </p>
                  <div className="flex items-center text-xs">
                    <ArrowRight className="w-3 h-3 mr-2" style={{ color: '#F87315' }} />
                    <span className="font-medium" style={{ color: '#F87315' }}>{t('technologyLeadership.intelligentTicket.tagline')}</span>
                  </div>
                </div>

                {/* Agentic Conversational AI */}
                <div className="bg-white/5 border-l-4 rounded-r-xl p-6 hover:bg-white/10 transition-all duration-300" style={{ borderLeftColor: '#F87315' }}>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{t('technologyLeadership.agenticAI.title')}</h3>
                      <p className="text-sm text-white/60">{t('technologyLeadership.agenticAI.subtitle')}</p>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3 text-xs">
                    <div className="flex items-center text-white/80">
                      <div className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: '#F87315' }}></div>
                      {t('technologyLeadership.agenticAI.capabilities.liveAgent')}
                    </div>
                    <div className="flex items-center text-white/80">
                      <div className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: '#F87315' }}></div>
                      {t('technologyLeadership.agenticAI.capabilities.knowledge')}
                    </div>
                    <div className="flex items-center text-white/80">
                      <div className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: '#F87315' }}></div>
                      {t('technologyLeadership.agenticAI.capabilities.catalog')}
                    </div>
                    <div className="flex items-center text-white/80">
                      <div className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: '#F87315' }}></div>
                      {t('technologyLeadership.agenticAI.capabilities.simple')}
                    </div>
                  </div>
                  <div className="flex items-center text-xs">
                    <ArrowRight className="w-3 h-3 mr-2" style={{ color: '#F87315' }} />
                    <span className="font-medium" style={{ color: '#F87315' }}>{t('technologyLeadership.agenticAI.tagline')}</span>
                  </div>
                </div>

                {/* Multi-Agent Orchestration */}
                <div className="bg-white/5 border-l-4 rounded-r-xl p-6 hover:bg-white/10 transition-all duration-300" style={{ borderLeftColor: '#F87315' }}>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{t('technologyLeadership.multiAgent.title')}</h3>
                      <p className="text-sm text-white/60">{t('technologyLeadership.multiAgent.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-3 leading-relaxed">
                    {t('technologyLeadership.multiAgent.description')}
                  </p>
                  <div className="flex items-center text-xs">
                    <ArrowRight className="w-3 h-3 mr-2" style={{ color: '#F87315' }} />
                    <span className="font-medium" style={{ color: '#F87315' }}>{t('technologyLeadership.multiAgent.tagline')}</span>
                  </div>
                </div>
              </motion.div>

              {/* Subtle Atmospheric Image */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="space-y-8"
              >
                <div className="sfeer-image sticky top-8" style={{ height: '396px', maxWidth: '528px' }}>
                  <Image
                    src="/images/adrien-olichon-GBCLhU3rN5w-unsplash.jpg"
                    alt=""
                    width={400}
                    height={500}
                    className="object-cover w-full h-80"
                  />
                </div>
              </motion.div>

              {/* Right Column - Technologies */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Extreme Context Processing */}
                <div className="bg-white/5 border-l-4 rounded-r-xl p-6 hover:bg-white/10 transition-all duration-300" style={{ borderLeftColor: '#F87315' }}>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{t('technologyLeadership.extremeContext.title')}</h3>
                      <p className="text-sm text-white/60">{t('technologyLeadership.extremeContext.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-3 leading-relaxed">
                    {t('technologyLeadership.extremeContext.description')}
                  </p>
                  <div className="flex items-center text-xs">
                    <ArrowRight className="w-3 h-3 mr-2" style={{ color: '#F87315' }} />
                    <span className="font-medium" style={{ color: '#F87315' }}>{t('technologyLeadership.extremeContext.tagline')}</span>
                  </div>
                </div>

                {/* MCP Excellence */}
                <div className="bg-white/5 border-l-4 rounded-r-xl p-6 hover:bg-white/10 transition-all duration-300" style={{ borderLeftColor: '#F87315' }}>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{t('technologyLeadership.mcpExcellence.title')}</h3>
                      <p className="text-sm text-white/60">{t('technologyLeadership.mcpExcellence.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-3 leading-relaxed">
                    {t('technologyLeadership.mcpExcellence.description')}
                  </p>
                  <div className="flex items-center text-xs">
                    <ArrowRight className="w-3 h-3 mr-2" style={{ color: '#F87315' }} />
                    <span className="font-medium" style={{ color: '#F87315' }}>{t('technologyLeadership.mcpExcellence.tagline')}</span>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('focusAreas.title')} <span style={{ color: '#F87315' }}>{t('focusAreas.titleHighlight')}</span>
              </h2>
              <p className="text-xl text-white/70 max-w-4xl mx-auto mb-4">
                {t('focusAreas.subtitle')}
              </p>
            </motion.div>

            <div className="space-y-8">
              {focusAreas.map((area, index) => (
                <motion.div
                  key={area.titleKey}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-8"
                >
                  <div className="flex items-start gap-6">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      <area.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">{t(area.titleKey)}</h3>
                      <p className="text-white/80 leading-relaxed text-lg">{t(area.descriptionKey)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('testimonials.title')} <span style={{ color: '#F87315' }}>{t('testimonials.titleHighlight')}</span>
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8"
              >
                <blockquote className="text-lg text-white/90 mb-6 leading-relaxed italic">
                  "{t('testimonials.first.quote')}"
                </blockquote>
                <cite className="text-white/70 font-medium not-italic">
                  {t('testimonials.first.author')}
                </cite>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8"
              >
                <blockquote className="text-lg text-white/90 mb-6 leading-relaxed italic">
                  "{t('testimonials.second.quote')}"
                </blockquote>
                <cite className="text-white/70 font-medium not-italic">
                  {t('testimonials.second.author')}
                </cite>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Start Your Project */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-8 lg:p-12 max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {t('cta.title')}
                </h2>
                <p className="text-xl text-white/80 mb-4">
                  {t('cta.subtitle')}
                </p>
                <p className="text-2xl font-bold text-white mb-8">
                  {t('cta.statement')} <span style={{ color: '#F87315' }}>{t('cta.statementHighlight')}</span> {t('cta.statementEnd')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/agent-readiness">
                    <Button
                      size="lg"
                      className="text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                      style={{ 
                        backgroundColor: '#F87315',
                        boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
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
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                    onClick={() => window.open('/api/download/mcp-guide', '_blank')}
                  >
                    {t('cta.buttons.downloadGuide')}
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/60 text-sm">
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