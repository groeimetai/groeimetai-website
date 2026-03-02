'use client';

import { motion } from 'framer-motion';
import { Quote, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function TestimonialSection() {
  const t = useTranslations('testimonial');

  const reasons = [
    { titleKey: 'reasons.earlyAdopters.title', descKey: 'reasons.earlyAdopters.description' },
    { titleKey: 'reasons.openSource.title', descKey: 'reasons.openSource.description' },
    { titleKey: 'reasons.practical.title', descKey: 'reasons.practical.description' },
    { titleKey: 'reasons.together.title', descKey: 'reasons.together.description' },
    { titleKey: 'reasons.dutch.title', descKey: 'reasons.dutch.description' },
  ];

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative bg-[#080D14]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 relative hover:border-white/20 transition-all duration-300">
              {/* Quote Icon */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F87315]">
                  <Quote className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* ServiceNow Testimonial */}
              <div className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-display font-bold text-lg">SN</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-display font-bold">{t('quote.author')}</h4>
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span className="text-blue-400 text-sm">LinkedIn</span>
                    </div>
                    <p className="text-white/60 text-sm">{t('quote.role')}</p>
                  </div>
                </div>

                <blockquote className="text-white/90 leading-relaxed mb-4 italic text-left">
                  &ldquo;{t('quote.text')}&rdquo;
                </blockquote>

                <div className="flex items-center gap-2 text-blue-300 text-sm">
                  <span>{t('quote.context')}</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-6">
                {t('whyTitle')} <span className="text-[#F87315]">{t('whyHighlight')}</span>?
              </h3>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 text-left">
                {reasons.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-[#F87315]">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{t(reason.titleKey)}</p>
                      <p className="text-white/60 text-sm">{t(reason.descKey)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
