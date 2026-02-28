'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Zap, Brain } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CompanyTimeline() {
  const t = useTranslations('timeline');

  const milestones = [
    { date: t('milestones.0.date'), title: t('milestones.0.title'), description: t('milestones.0.description'), impact: t('milestones.0.impact'), icon: Brain },
    { date: t('milestones.1.date'), title: t('milestones.1.title'), description: t('milestones.1.description'), impact: t('milestones.1.impact'), icon: TrendingUp },
    { date: t('milestones.2.date'), title: t('milestones.2.title'), description: t('milestones.2.description'), impact: t('milestones.2.impact'), icon: Zap },
    { date: t('milestones.3.date'), title: t('milestones.3.title'), description: t('milestones.3.description'), impact: t('milestones.3.impact'), icon: Calendar },
    { date: t('milestones.4.date'), title: t('milestones.4.title'), description: t('milestones.4.description'), impact: t('milestones.4.impact'), icon: TrendingUp },
    { date: t('milestones.5.date'), title: t('milestones.5.title'), description: t('milestones.5.description'), impact: t('milestones.5.impact'), icon: Brain },
    { date: t('milestones.6.date'), title: t('milestones.6.title'), description: t('milestones.6.description'), impact: t('milestones.6.impact'), icon: Calendar },
  ];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
      {/* Background decorations — matching hero */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-[#F87315]/[0.08] rounded-full blur-[128px]" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-[#FF9F43]/[0.08] rounded-full blur-[128px]" />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
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
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Gradient timeline line */}
            <div className="absolute left-6 sm:left-7 top-0 bottom-0 w-px bg-gradient-to-b from-[#F87315]/60 via-white/15 to-transparent" />

            <div className="space-y-6 sm:space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.date}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="relative flex items-start gap-5 sm:gap-8"
                >
                  {/* Timeline node */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center z-10 border border-white/10"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <milestone.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-[#F87315]/20 blur-lg -z-10" />
                  </div>

                  {/* Card */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-medium px-3 py-1 rounded-full bg-[#F87315]/10 border border-[#F87315]/30 text-[#FF9F43]">
                          {milestone.date}
                        </span>
                        <span className="text-xs text-white/40">
                          {index < milestones.length - 1 ? t('statusLabels.completed') : t('statusLabels.inProgress')}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-[-0.01em]">
                        {milestone.title}
                      </h3>

                      <p className="text-white/60 mb-4 leading-relaxed text-sm sm:text-base">
                        {milestone.description}
                      </p>

                      <div className="flex items-center text-sm">
                        <span className="text-white/40 mr-2">{t('statusLabels.impact')}</span>
                        <span className="text-[#FF9F43] font-semibold">{milestone.impact}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mt-20 sm:mt-24"
          >
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#F87315]/10 rounded-full blur-[80px]" />
              <div className="relative">
                <p className="text-lg sm:text-xl text-white/70 mb-3">
                  {t('finalQuestion')}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-[-0.02em]">
                  {t('readyQuestion')}
                </p>
                <p className="text-lg font-semibold text-[#F87315]">
                  {t('weAreReady')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
