'use client';

import { motion } from 'framer-motion';
import { Clock, Zap, Users, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AgentOpportunity() {
  const t = useTranslations('agentOpportunity');

  const opportunities = [
    { titleKey: 'opportunities.alwaysOn.title', descKey: 'opportunities.alwaysOn.description', icon: Clock },
    { titleKey: 'opportunities.automation.title', descKey: 'opportunities.automation.description', icon: Zap },
    { titleKey: 'opportunities.instant.title', descKey: 'opportunities.instant.description', icon: Users },
    { titleKey: 'opportunities.optimize.title', descKey: 'opportunities.optimize.description', icon: TrendingUp },
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
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 tracking-[-0.02em]">
              {t('title')} <span className="text-[#F87315]">{t('titleHighlight')}</span>:
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-16">
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-5 sm:p-6 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#F87315]">
                    <opportunity.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 leading-tight">
                      {t(opportunity.titleKey)}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t(opportunity.descKey)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reality Check */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto">
              <p className="text-lg sm:text-xl text-white/80 mb-4 leading-relaxed">
                <strong>{t('realityCheck')}</strong>
              </p>
              <p className="text-lg font-semibold text-[#F87315] mb-6">
                {t('question')}
              </p>
              <p className="text-white/60 text-sm">
                {t('guidance')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
