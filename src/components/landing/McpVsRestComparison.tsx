'use client';

import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function McpVsRestComparison() {
  const t = useTranslations('mcpComparison');

  const comparisonKeys = ['discovery', 'protocol', 'authentication', 'context', 'documentation', 'integration'];

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
              {t('title')} <span className="text-[#F87315]">{t('titleHighlight')}</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            {/* REST APIs - Old Way */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">{t('rest.title')}</h3>
                <p className="text-red-400 font-semibold">{t('rest.subtitle')}</p>
              </div>

              <ul className="space-y-4">
                {comparisonKeys.map((key, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-white/80 font-medium">{t(`comparisons.${key}.feature`)}: </span>
                      <span className="text-white/60">{t(`comparisons.${key}.rest`)}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-red-500/20">
                <p className="text-red-400 text-sm font-medium">
                  {t('rest.result')}
                </p>
              </div>
            </motion.div>

            {/* MCP Servers - New Way */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">{t('mcp.title')}</h3>
                <p className="text-green-400 font-semibold">{t('mcp.subtitle')}</p>
              </div>

              <ul className="space-y-4">
                {comparisonKeys.map((key, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-white/80 font-medium">{t(`comparisons.${key}.feature`)}: </span>
                      <span className="text-white/60">{t(`comparisons.${key}.mcp`)}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-green-500/20">
                <p className="text-green-400 text-sm font-medium">
                  {t('mcp.result')}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Technical Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8"
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-display font-bold text-white mb-2">{t('stats.server.value')}</div>
                <div className="text-white/60">{t('stats.server.label')}</div>
                <div className="text-sm text-white/40 mt-1">{t('stats.server.detail')}</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white mb-2">{t('stats.protocol.value')}</div>
                <div className="text-white/60">{t('stats.protocol.label')}</div>
                <div className="text-sm text-white/40 mt-1">{t('stats.protocol.detail')}</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white mb-2">{t('stats.plugPlay.value')}</div>
                <div className="text-white/60">{t('stats.plugPlay.label')}</div>
                <div className="text-sm text-white/40 mt-1">{t('stats.plugPlay.detail')}</div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-lg text-white/80 mb-4">
                <strong>{t('differenceTitle')}</strong> {t('differenceDescription')}
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-[#F87315]">
                <span>{t('snowflowLink')}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
