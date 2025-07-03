'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

  const approachSteps = [
    {
      key: 'discovery',
      number: '01',
    },
    {
      key: 'mapping',
      number: '02',
    },
    {
      key: 'pilot',
      number: '03',
    },
    {
      key: 'scale',
      number: '04',
    }
  ];

export default function OurApproach() {
  const t = useTranslations('approach');
  return (
    <section className="py-20 bg-black dark:bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green/10 rounded-full blur-3xl" />
      </div>

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
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {approachSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-12 last:mb-0"
            >
              <div className={`flex items-center gap-8 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                {/* Step number */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange to-orange-600 
                    flex items-center justify-center text-white font-bold text-2xl
                    shadow-lg shadow-orange/30">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 ${index % 2 === 1 ? 'text-right' : ''}`}>
                  <h3 className="text-2xl font-bold text-white mb-3">{t(`steps.${step.key}.title`)}</h3>
                  <p className="text-white/70 mb-4 text-lg">{t(`steps.${step.key}.description`)}</p>
                  
                  {/* Outcomes */}
                  <div className={`flex flex-wrap gap-2 ${index % 2 === 1 ? 'justify-end' : ''}`}>
                    {(t.raw(`steps.${step.key}.outcomes`) as string[]).map((outcome, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-white/80"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < approachSteps.length - 1 && (
                <div className="absolute left-12 top-24 w-0.5 h-20 bg-gradient-to-b from-orange/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Success metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { key: 'time' },
            { key: 'roi' },
            { key: 'success' },
            { key: 'sponsorship' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl font-bold text-orange mb-2">{t(`metrics.${item.key}.value`)}</p>
              <p className="text-white/60 text-sm">{t(`metrics.${item.key}.label`)}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}