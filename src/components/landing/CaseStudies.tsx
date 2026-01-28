'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Code, Zap, Brain, CheckCircle, Github, ExternalLink, ShoppingBag, Bot } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const caseStudies = [
  {
    id: 'snow-flow',
    titleKey: 'snowFlow.title',
    clientKey: 'snowFlow.client',
    industryKey: 'snowFlow.industry',
    challengeKey: 'snowFlow.challenge',
    resultsKeys: [
      { metricKey: 'snowFlow.results.tools.metric', labelKey: 'snowFlow.results.tools.label' },
      { metricKey: 'snowFlow.results.stars.metric', labelKey: 'snowFlow.results.stars.label' },
      { metricKey: 'snowFlow.results.production.metric', labelKey: 'snowFlow.results.production.label' },
    ],
    gradient: 'from-orange-600 to-red-600',
    icon: Github,
    link: 'https://github.com/groeimetai/snow-flow',
    isExternal: true,
  },
  {
    id: 'novaskin',
    titleKey: 'novaSkin.title',
    clientKey: 'novaSkin.client',
    industryKey: 'novaSkin.industry',
    challengeKey: 'novaSkin.challenge',
    resultsKeys: [
      { metricKey: 'novaSkin.results.timeline.metric', labelKey: 'novaSkin.results.timeline.label' },
      { metricKey: 'novaSkin.results.features.metric', labelKey: 'novaSkin.results.features.label' },
      { metricKey: 'novaSkin.results.platform.metric', labelKey: 'novaSkin.results.platform.label' },
    ],
    gradient: 'from-green-600 to-teal-600',
    icon: ShoppingBag,
    link: '/cases/novaskin',
    isExternal: false,
  },
  {
    id: 'request-ai-widget',
    titleKey: 'requestAiWidget.title',
    clientKey: 'requestAiWidget.client',
    industryKey: 'requestAiWidget.industry',
    challengeKey: 'requestAiWidget.challenge',
    resultsKeys: [
      { metricKey: 'requestAiWidget.results.automation.metric', labelKey: 'requestAiWidget.results.automation.label' },
      { metricKey: 'requestAiWidget.results.integration.metric', labelKey: 'requestAiWidget.results.integration.label' },
      { metricKey: 'requestAiWidget.results.kb.metric', labelKey: 'requestAiWidget.results.kb.label' },
    ],
    gradient: 'from-blue-600 to-purple-600',
    icon: Bot,
    link: 'https://github.com/groeimetai/servicenow-ai-universal-request-widget',
    isExternal: true,
  },
];

export default function CaseStudies() {
  const t = useTranslations('caseStudiesSection');

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4">{t('title')}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => {
            const Icon = study.icon;
            const CardWrapper = study.isExternal ? 'a' : Link;
            const cardProps = study.isExternal
              ? { href: study.link, target: '_blank', rel: 'noopener noreferrer' }
              : { href: study.link };

            return (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CardWrapper {...cardProps}>
                  <div className="group h-full bg-card rounded-2xl overflow-hidden shadow-premium hover-lift transition-all duration-300">
                    {/* Image placeholder with gradient */}
                    <div
                      className={`h-48 bg-gradient-to-br ${study.gradient} relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-4 left-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                          {t(study.industryKey)}
                        </span>
                      </div>
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        {study.isExternal ? (
                          <ExternalLink className="w-8 h-8 text-white transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                        ) : (
                          <ArrowUpRight className="w-8 h-8 text-white transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:gradient-text transition-all duration-300">
                        {t(study.titleKey)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">{t(study.clientKey)}</p>

                      {/* Challenge */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{t('challengeLabel')}</h4>
                        <p className="text-sm">{t(study.challengeKey)}</p>
                      </div>

                      {/* Results preview */}
                      <div className="space-y-3">
                        {study.resultsKeys.map((result, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{t(result.labelKey)}</span>
                            <span className="text-lg font-semibold gradient-text">
                              {t(result.metricKey)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                        <span className="text-sm font-medium text-primary group-hover:underline">
                          {study.isExternal ? t('viewOnGithub') : t('readCaseStudy')}
                        </span>
                        {study.isExternal && (
                          <ExternalLink className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-4">
                <Github className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-2">{t('stats.projects.value')}</h3>
              <p className="text-white/80">{t('stats.projects.label')}</p>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-2">{t('stats.tools.value')}</h3>
              <p className="text-white/80">{t('stats.tools.label')}</p>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-2">{t('stats.production.value')}</h3>
              <p className="text-white/80">{t('stats.production.label')}</p>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-2">{t('stats.ventures.value')}</h3>
              <p className="text-white/80">{t('stats.ventures.label')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
