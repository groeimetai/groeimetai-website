'use client';

import { motion } from 'framer-motion';
import { Code, Lightbulb, Zap, Mic, Users, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const serviceConfig = [
  { id: 'web', icon: Code, bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #22D3EE 100%)' },
  { id: 'aiStrategy', icon: Lightbulb, bgGradient: 'linear-gradient(135deg, #A855F7 0%, #F472B6 100%)' },
  { id: 'mcp', icon: Zap, bgGradient: 'linear-gradient(135deg, #F97316 0%, #FACC15 100%)' },
  { id: 'voice', icon: Mic, bgGradient: 'linear-gradient(135deg, #2563EB 0%, #A855F7 100%)' },
  { id: 'training', icon: Users, bgGradient: 'linear-gradient(135deg, #22C55E 0%, #2DD4BF 100%)' },
] as const;

export default function ServicesOverviewSection() {
  const t = useTranslations('servicesOverview');

  return (
    <section className="py-16 sm:py-20 relative" style={{ backgroundColor: '#080D14' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 tracking-[-0.02em]">
              {t('hero.title')}{' '}
              <span
                className="text-white px-2 py-0.5 sm:px-3 sm:py-1 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                }}
              >
                {t('hero.titleHighlight')}
              </span>
            </h2>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {serviceConfig.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/services#${service.id}`}
                    className="group block bg-white/[0.03] border border-white/10 rounded-xl p-4 sm:p-5 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 h-full"
                  >
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: service.bgGradient }}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                      {t(`services.${service.id}.title`)}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#FF9F43] font-medium mb-2">
                      {t(`services.${service.id}.tagline`)}
                    </p>
                    <span className="inline-flex items-center text-xs text-white/50 group-hover:text-white/70 transition-colors">
                      Learn more
                      <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
