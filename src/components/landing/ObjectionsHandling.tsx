'use client';

import { motion } from 'framer-motion';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function ObjectionsHandling() {
  const t = useTranslations('objections');
  
  const objections = Object.values(t.raw('faqs')) as Array<{ question: string; answer: string }>;

  return (
    <section className="py-20" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              {t('title')} <span className="text-[#F87315]">{t('titleHighlight')}</span>
            </h2>
            <p className="text-xl text-white/70">
              {t('subtitle')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* FAQ Content */}
            <div className="space-y-6">
              {objections.map((objection, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <HelpCircle className="w-6 h-6 mt-1 flex-shrink-0 text-[#F87315]" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-3">
                        "{objection.question}"
                      </h3>
                      <p className="text-white/80 leading-relaxed mb-4">
                        {objection.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sfeer image naast objecties */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full"
            >
              <div className="sfeer-image h-full w-full">
                <Image
                  src="/images/anne-nygard-w7-cOgX-IVQ-unsplash.jpg"
                  alt=""
                  width={500}
                  height={750}
                  className="object-cover w-full h-full"
                />
              </div>
            </motion.div>
          </div>

          {/* Confidence Builder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl p-6">
              <p className="text-white/90 mb-2">
                <strong>{t('stillDoubts')}</strong>
              </p>
              <p className="text-sm text-white/70">
                {t('freeConsultation')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}