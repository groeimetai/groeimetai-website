'use client';

import { motion } from 'framer-motion';
import { Eye, Wrench, Activity, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function AgentServicesShowcase() {
  const t = useTranslations('agentServices');

  const services = [
    {
      icon: Eye,
      titleKey: 'services.assess.title',
      subtitleKey: 'services.assess.subtitle',
      descriptionKey: 'services.assess.description',
      features: ['services.assess.features.0', 'services.assess.features.1', 'services.assess.features.2', 'services.assess.features.3'],
      highlightKey: 'services.assess.highlight',
    },
    {
      icon: Wrench,
      titleKey: 'services.build.title',
      subtitleKey: 'services.build.subtitle',
      descriptionKey: 'services.build.description',
      features: ['services.build.features.0', 'services.build.features.1', 'services.build.features.2', 'services.build.features.3'],
      highlightKey: 'services.build.highlight',
    },
    {
      icon: Activity,
      titleKey: 'services.monitor.title',
      subtitleKey: 'services.monitor.subtitle',
      descriptionKey: 'services.monitor.description',
      features: ['services.monitor.features.0', 'services.monitor.features.1', 'services.monitor.features.2', 'services.monitor.features.3'],
      highlightKey: 'services.monitor.highlight',
    },
  ];

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative bg-[#080D14]">
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
              <span className="text-[#F87315]">{t('titleHighlight')}</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-4">
              {t('subtitle')}
            </p>
            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-5 sm:p-6 max-w-4xl mx-auto">
              <p className="text-white/90 leading-relaxed">
                <strong>{t('guideIntro')}</strong>
              </p>
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4 mt-4 text-sm">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center text-white/80">
                    <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0 text-[#F87315]" />
                    {t(`guidePoints.${i}`)}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 h-full hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 flex flex-col">
                  {/* Service Header */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-gradient-to-br from-[#F87315] to-[#FF9F43]">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-white">{t(service.titleKey)}</h3>
                      <p className="text-white/60 font-medium">{t(service.subtitleKey)}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/70 mb-6 leading-relaxed text-sm sm:text-base">
                    {t(service.descriptionKey)}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {service.features.map((featureKey, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-white/70">
                        <CheckCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-[#FF9F43]" />
                        <span className="text-sm">{t(featureKey)}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Highlight */}
                  <div className="pt-4 border-t border-white/10 mt-auto">
                    <p className="text-sm font-semibold text-[#F87315]">
                      {t(service.highlightKey)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mt-16 sm:mt-20"
          >
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-display font-bold text-white mb-4">
                {t('ctaTitle')}
              </h3>
              <p className="text-white/60 mb-6">
                {t('ctaDescription')}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] bg-[#F87315] hover:bg-[#E5680F] shadow-lg shadow-[#F87315]/20 hover:shadow-[#F87315]/30"
              >
                {t('ctaButton')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
