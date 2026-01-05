'use client';

import { motion } from 'framer-motion';
import { Github, ExternalLink, ArrowRight, Zap, Shield, Activity, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function SnowFlowShowcase() {
  const t = useTranslations('snowflow');
  
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 relative" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              {t('title')}{' '}
              <span style={{ color: '#F87315' }}>{t('titleHighlight')}</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
              {t('subtitle')}
              <br />
              <strong className="text-white">{t('subtitleHighlight')}</strong>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
            {/* De Context - Waarom ServiceNow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{t('whyServiceNow.title')}</h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                {t('whyServiceNow.description')}
              </p>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="text-white/90 text-xs sm:text-sm font-medium">
                  {t('whyServiceNow.problem')}
                </p>
              </div>
              <p className="text-white/70 text-xs sm:text-sm">
                {t('whyServiceNow.solution')}
              </p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs sm:text-sm" style={{ color: '#F87315' }}>
                  <strong>{t('whyServiceNow.conclusion')}</strong>
                </p>
              </div>
            </motion.div>

            {/* Het Probleem & Oplossing */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{t('problemSolution.problemTitle')}</h3>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="text-white/80 text-sm leading-relaxed">
                  {t('problemSolution.problemDescription')}
                </p>
              </div>
              
              <h4 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">{t('problemSolution.solutionTitle')}</h4>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4">
                <p className="text-white/80 text-sm leading-relaxed">
                  {t('problemSolution.solutionDescription')}
                </p>
              </div>
            </motion.div>

            {/* Wat Agents Nu Kunnen */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">{t('agentCapabilities.title')}</h3>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F87315' }}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{t('agentCapabilities.tickets.title')}</p>
                    <p className="text-white/60 text-sm">{t('agentCapabilities.tickets.description')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F87315' }}>
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{t('agentCapabilities.workflows.title')}</p>
                    <p className="text-white/60 text-sm">{t('agentCapabilities.workflows.description')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F87315' }}>
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{t('agentCapabilities.knowledge.title')}</p>
                    <p className="text-white/60 text-sm">{t('agentCapabilities.knowledge.description')}</p>
                  </div>
                </div>
              </div>

              {/* Technical Implementation */}
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-lg font-bold text-white mb-4">{t('technicalImplementation.title')}</h4>
                <ul className="space-y-2 text-sm">
                  {Object.values(t.raw('technicalImplementation.features')).map((feature, index) => (
                    <li key={index} className="flex items-center text-white/70">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#F87315' }}></div>
                      {String(feature)}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Decorative Image Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
            </div>
          </motion.div>

          {/* GitHub Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-16"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Github className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-2xl font-bold text-white">{t('openSourceTitle')}</h3>
                  <p className="text-white/60">{t('github.subtitle')}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: '#F87315' }}>{t('github.openSourceBadge')}</div>
                <div className="text-white/60 text-sm">{t('github.transparency')}</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{t('github.stats.integrations')}</div>
                <div className="text-white/60">{t('github.stats.integrationsLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{t('github.stats.functions')}</div>
                <div className="text-white/60">{t('github.stats.functionsLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{t('github.stats.community')}</div>
                <div className="text-white/60">{t('github.stats.communityLabel')}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-300">
                <Github className="mr-2 w-5 h-5" />
                {t('github.buttons.github')}
                <ExternalLink className="ml-2 w-4 h-4" />
              </button>
              <button 
                className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105"
                style={{ 
                  backgroundColor: '#F87315',
                  boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
                }}
              >
                {t('github.buttons.demo')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-4">
                {t('futureTitle')}
              </h3>
              <p className="text-white/80 mb-6 text-lg">
                {t('futureDescription')}
              </p>
              <button 
                className="inline-flex items-center px-8 py-4 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 text-lg"
                style={{ 
                  backgroundColor: '#F87315',
                  boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
                }}
              >
{t('ctaButton')}
                <ArrowRight className="ml-3 w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}