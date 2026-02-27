'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Github, ExternalLink, ArrowRight, CheckCircle, ShoppingBag,
  Bot, FileText, FileEdit, Mic, Brain, Wrench, Layers, Cloud, CreditCard
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function CasesPage() {
  const t = useTranslations('casesPage');

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

      {/* Open Source Spotlight */}
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]">
                {t('openSource.title')}{' '}
                <span className="text-[#FF9F43]">{t('openSource.titleHighlight')}</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl">
                {t('openSource.subtitle')}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Snow-Flow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="group bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mr-4"
                    style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                  >
                    <Github className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{t('openSource.snowFlow.title')}</h3>
                    <p className="text-[#FF9F43] text-sm">{t('openSource.snowFlow.subtitle')}</p>
                  </div>
                </div>

                <p className="text-white/70 mb-6 leading-relaxed">
                  {t('openSource.snowFlow.description')}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {['tools', 'realtime', 'multiAgent', 'production'].map((feature) => (
                    <div key={feature} className="flex items-center text-white/70 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-[#FF9F43]" />
                      {t(`openSource.snowFlow.features.${feature}`)}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 bg-white/[0.05] rounded-xl p-4">
                  {['stars', 'tools', 'license', 'status'].map((stat) => (
                    <div key={stat} className="text-center">
                      <div className="text-xl font-bold text-white">{t(`openSource.snowFlow.stats.${stat}.value`)}</div>
                      <div className="text-xs text-white/50">{t(`openSource.snowFlow.stats.${stat}.label`)}</div>
                    </div>
                  ))}
                </div>

                <a
                  href="https://github.com/groeimetai/snow-flow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#FF9F43] hover:text-white transition-colors font-medium"
                >
                  <Github className="w-4 h-4 mr-2" />
                  {t('openSource.snowFlow.githubLink')}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </motion.div>

              {/* Request AI Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="group bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mr-4"
                    style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
                  >
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{t('openSource.requestWidget.title')}</h3>
                    <p className="text-purple-400 text-sm">{t('openSource.requestWidget.subtitle')}</p>
                  </div>
                </div>

                <p className="text-white/70 mb-6 leading-relaxed">
                  {t('openSource.requestWidget.description')}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {['chatbot', 'automation', 'knowledge', 'native'].map((feature) => (
                    <div key={feature} className="flex items-center text-white/70 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-purple-400" />
                      {t(`openSource.requestWidget.features.${feature}`)}
                    </div>
                  ))}
                </div>

                <a
                  href="https://github.com/groeimetai/servicenow-ai-universal-request-widget"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-400 hover:text-white transition-colors font-medium"
                >
                  <Github className="w-4 h-4 mr-2" />
                  {t('openSource.requestWidget.githubLink')}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </motion.div>

              {/* Mollie AP2 Protocol */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="group bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mr-4"
                    style={{ background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)' }}
                  >
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{t('openSource.mollieAP2.title')}</h3>
                    <p className="text-emerald-400 text-sm">{t('openSource.mollieAP2.subtitle')}</p>
                  </div>
                </div>

                <div className="inline-block px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-400 text-sm mb-4">
                  {t('openSource.mollieAP2.badge')}
                </div>

                <p className="text-white/70 mb-6 leading-relaxed">
                  {t('openSource.mollieAP2.description')}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {['mandate', 'multiAgent', 'mollie', 'liveDemo'].map((feature) => (
                    <div key={feature} className="flex items-center text-white/70 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-emerald-400" />
                      {t(`openSource.mollieAP2.features.${feature}`)}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-6">
                  <a
                    href="https://github.com/groeimetai/Mollie-Agent-Payments-Protocol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-emerald-400 hover:text-white transition-colors font-medium"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    {t('openSource.mollieAP2.githubLink')}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                  <a
                    href="https://ap2-mollie-878093427982.europe-west1.run.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-emerald-400 hover:text-white transition-colors font-medium"
                  >
                    {t('openSource.mollieAP2.demoLink')}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Projects - NovaSkin */}
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]">
                {t('clientProjects.title')}{' '}
                <span className="text-[#FF9F43]">{t('clientProjects.titleHighlight')}</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl">
                {t('clientProjects.subtitle')}
              </p>
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
                      style={{ background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)' }}
                    >
                      <ShoppingBag className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white">{t('clientProjects.novaSkin.title')}</h3>
                      <p className="text-emerald-400">{t('clientProjects.novaSkin.subtitle')}</p>
                    </div>
                  </div>

                  <div className="inline-block px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
                    {t('clientProjects.novaSkin.industry')}
                  </div>

                  <p className="text-white/70 mb-8 leading-relaxed text-lg">
                    {t('clientProjects.novaSkin.description')}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {['catalog', 'checkout', 'accounts', 'orders'].map((feature) => (
                      <div key={feature} className="flex items-center text-white/70">
                        <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 text-emerald-400" />
                        {t(`clientProjects.novaSkin.features.${feature}`)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/[0.05] rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-6">Project Stats</h4>
                  <div className="space-y-6">
                    {['timeline', 'features', 'status'].map((stat) => (
                      <div key={stat} className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">{t(`clientProjects.novaSkin.stats.${stat}.value`)}</div>
                        <div className="text-white/50 text-sm">{t(`clientProjects.novaSkin.stats.${stat}.label`)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Own Ventures - Snelnotuleren */}
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]">
                {t('ownVentures.title')}{' '}
                <span className="text-[#FF9F43]">{t('ownVentures.titleHighlight')}</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl">
                {t('ownVentures.subtitle')}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Snelnotuleren */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="group bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mr-4"
                    style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                  >
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{t('ownVentures.snelnotuleren.title')}</h3>
                    <p className="text-[#FF9F43] text-sm">{t('ownVentures.snelnotuleren.subtitle')}</p>
                  </div>
                </div>

                <p className="text-white/70 mb-6 leading-relaxed">
                  {t('ownVentures.snelnotuleren.description')}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {['transcription', 'processing', 'gdpr', 'architecture'].map((feature) => (
                    <div key={feature} className="flex items-center text-white/70 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-[#FF9F43]" />
                      {t(`ownVentures.snelnotuleren.features.${feature}`)}
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
                  <p className="text-white font-medium text-sm">"{t('ownVentures.snelnotuleren.highlight')}"</p>
                </div>

                <a
                  href="https://snelnotuleren.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#FF9F43] hover:text-white transition-colors font-medium"
                >
                  {t('ownVentures.snelnotuleren.link')}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </motion.div>

              {/* MaakCVeetje */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="group bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mr-4"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
                  >
                    <FileEdit className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{t('ownVentures.maakcveetje.title')}</h3>
                    <p className="text-blue-400 text-sm">{t('ownVentures.maakcveetje.subtitle')}</p>
                  </div>
                </div>

                <p className="text-white/70 mb-6 leading-relaxed">
                  {t('ownVentures.maakcveetje.description')}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {['aiGenerated', 'templates', 'speed', 'language'].map((feature) => (
                    <div key={feature} className="flex items-center text-white/70 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-blue-400" />
                      {t(`ownVentures.maakcveetje.features.${feature}`)}
                    </div>
                  ))}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                  <p className="text-white font-medium text-sm">"{t('ownVentures.maakcveetje.highlight')}"</p>
                </div>

                <a
                  href="https://maakcveetje.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-400 hover:text-white transition-colors font-medium"
                >
                  {t('ownVentures.maakcveetje.link')}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice AI Experience */}
      <section className="py-16 sm:py-20 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
                >
                  <Mic className="w-7 h-7 text-white" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {t('voiceAI.title')}{' '}
                <span className="text-[#FF9F43]">{t('voiceAI.titleHighlight')}</span>
              </h2>

              <p className="text-white/60 mb-4 max-w-xl mx-auto">
                {t('voiceAI.subtitle')}
              </p>

              <p className="text-white/50 text-sm">
                {t('voiceAI.description')}
              </p>

              <p className="text-[#FF9F43] text-sm mt-4 font-medium">
                {t('voiceAI.note')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-[-0.02em]">
                {t('techStack.title')}{' '}
                <span className="text-[#FF9F43]">{t('techStack.titleHighlight')}</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                {t('techStack.subtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { key: 'ai', icon: Brain, gradient: 'from-purple-500 to-pink-500' },
                { key: 'devTools', icon: Wrench, gradient: 'from-blue-500 to-cyan-500' },
                { key: 'frameworks', icon: Layers, gradient: 'from-emerald-500 to-teal-500' },
                { key: 'infrastructure', icon: Cloud, gradient: 'from-orange-500 to-yellow-500' }
              ].map((category, index) => (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-4">{t(`techStack.categories.${category.key}.title`)}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(t.raw(`techStack.categories.${category.key}.items`) as string[]).map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/[0.08] rounded-full text-white/70 text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 bg-black relative overflow-hidden">
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
                  <blockquote className="text-base sm:text-lg text-white/80 mb-6 leading-relaxed italic">
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

      {/* CTA Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
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
                <p className="text-lg sm:text-xl text-white/70 mb-4">
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
                      {t('cta.buttons.discuss')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>

                  <a
                    href="https://github.com/groeimetai"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-14 text-base font-medium px-8 border-white/25 text-white hover:bg-white/10 hover:border-white/40 rounded-lg transition-all duration-300"
                    >
                      <Github className="mr-2 w-5 h-5" />
                      {t('cta.buttons.github')}
                    </Button>
                  </a>
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
