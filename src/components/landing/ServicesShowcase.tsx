'use client';

import { motion } from 'framer-motion';
import { Brain, Cpu, Shield, Zap, Code, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

const services = [
  {
    key: 'strategy',
    icon: Brain,
    color: 'from-orange to-orange-100',
  },
  {
    key: 'transformation',
    icon: Cpu,
    color: 'from-green-100 to-green',
  },
  {
    key: 'governance',
    icon: Shield,
    color: 'from-orange-100 to-orange',
  },
  {
    key: 'innovation',
    icon: Zap,
    color: 'from-green to-green-100',
  },
  {
    key: 'advisory',
    icon: Code,
    color: 'from-orange to-orange-100',
  },
  {
    key: 'adoption',
    icon: Users,
    color: 'from-green-100 to-green',
  },
];

export default function ServicesShowcase() {
  const t = useTranslations('services');
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-black dark:bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange/5 via-transparent to-green/5" />

      <div className="container mx-auto px-2 sm:px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="mb-3 sm:mb-4 text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">{t('title')}</h2>
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto px-2 sm:px-0">{t('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="relative h-full p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10 bg-black-50 transition-all duration-300 overflow-hidden">
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5`} />

                {/* Icon */}
                <div
                  className={`inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-br ${service.color} text-white mb-4 sm:mb-6`}
                >
                  <service.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">
                  {t(`items.${service.key}.title`)}
                </h3>
                <p className="text-sm sm:text-base text-white/60 mb-4 sm:mb-6">{t(`items.${service.key}.description`)}</p>

                {/* Features */}
                <ul className="space-y-1 sm:space-y-2">
                  {(t.raw(`items.${service.key}.features`) as string[]).map((feature) => (
                    <li key={feature} className="flex items-center text-xs sm:text-sm text-white/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
