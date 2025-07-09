'use client';

import { motion } from 'framer-motion';
import { Award, Users, Globe, TrendingUp, Clock, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

const differentiators = [
  {
    key: 'track',
    icon: Award,
  },
  {
    key: 'partnership',
    icon: Users,
  },
  {
    key: 'global',
    icon: Globe,
  },
  {
    key: 'value',
    icon: TrendingUp,
  },
  {
    key: 'speed',
    icon: Clock,
  },
  {
    key: 'risk',
    icon: Shield,
  },
];

export default function WhyChooseUs() {
  const t = useTranslations('whyChooseUs');
  return (
    <section className="py-20 bg-black dark:bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange/5 via-transparent to-green/5" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4 text-white">
            {t('title')} <span className="text-orange-500">{t('subtitle')}</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">{t('description')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {differentiators.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                <div
                  className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full
                  transition-all duration-300 hover:border-orange-500/50 hover:shadow-xl hover:scale-[1.02]"
                >
                  {/* Icon */}
                  <div className="inline-flex p-3 rounded-xl bg-orange/20 mb-6 group-hover:bg-orange/30 transition-colors">
                    <Icon className="w-6 h-6 text-orange" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {t(`differentiators.${item.key}.title`)}
                  </h3>
                  <p className="text-white/70 mb-4">
                    {t(`differentiators.${item.key}.description`)}
                  </p>

                  {/* Metric */}
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-lg font-semibold text-orange">
                      {t(`differentiators.${item.key}.metric`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-xl text-white/80 mb-2">{t('cta.ready')}</p>
          <p className="text-lg text-white/60">{t('cta.discuss')}</p>
        </motion.div>
      </div>
    </section>
  );
}
