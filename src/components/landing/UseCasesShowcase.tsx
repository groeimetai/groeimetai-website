'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { FileText, MessageCircle, Search, ClipboardList } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ScrollReveal from '@/components/ui/ScrollReveal';

const CASES = [
  { key: 'reports', icon: FileText, metricValue: 80 },
  { key: 'support', icon: MessageCircle, metricValue: 100 },
  { key: 'knowledge', icon: Search, metricValue: 95 },
  { key: 'intake', icon: ClipboardList, metricValue: 100 },
] as const;

function MetricBar({ metricValue }: { metricValue: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const width = useTransform(scrollYProgress, [0, 0.4], [0, metricValue]);
  const widthPercent = useTransform(width, (v) => `${v}%`);

  return (
    <div ref={ref} className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
          width: prefersReducedMotion ? `${metricValue}%` : widthPercent,
        }}
      />
    </div>
  );
}

export default function UseCasesShowcase() {
  const t = useTranslations('useCases');

  return (
    <section className="relative py-20 sm:py-28 lg:py-36 bg-[#080D14] overflow-hidden">
      {/* Subtle overlay for section contrast */}
      <div className="absolute inset-0 bg-white/[0.02]" />
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* Bottom orange gradient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F87315]/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <ScrollReveal className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
              {t('title')}{' '}
              <span className="text-white px-3 py-1 sm:px-4 sm:py-1.5 inline-block bg-gradient-to-r from-[#F87315] to-[#FF9F43] shadow-lg shadow-[#F87315]/30 rounded-sm">
                {t('titleHighlight')}
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </ScrollReveal>

          {/* Use Case Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {CASES.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <ScrollReveal key={useCase.key} className="group">
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 sm:p-8 h-full hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300">
                    {/* Card Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="inline-flex p-3 rounded-xl bg-[#F87315]/10 group-hover:bg-[#F87315]/20 transition-colors duration-300">
                        <Icon className="w-6 h-6 text-[#F87315]" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {t(`cases.${useCase.key}.title`)}
                      </h3>
                    </div>

                    {/* Before / After Split */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-white/30">
                          {t('labels.before')}
                        </span>
                        <p className="text-sm text-white/40 leading-relaxed">
                          {t(`cases.${useCase.key}.before`)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F87315]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F87315]" />
                          {t('labels.after')}
                        </span>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {t(`cases.${useCase.key}.after`)}
                        </p>
                      </div>
                    </div>

                    {/* Metric Bar */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/50">
                          {t(`cases.${useCase.key}.metric`)}
                        </span>
                        <span className="text-xs font-semibold text-[#F87315]">
                          {useCase.metricValue}%
                        </span>
                      </div>
                      <MetricBar metricValue={useCase.metricValue} />
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
