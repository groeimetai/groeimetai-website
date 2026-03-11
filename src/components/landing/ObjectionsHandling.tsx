'use client';

import ScrollReveal from '@/components/ui/ScrollReveal';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function ObjectionsHandling() {
  const t = useTranslations('objections');
  
  const objections = Object.values(t.raw('faqs')) as Array<{ question: string; answer: string }>;

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative bg-[#080D14]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
              {t('title')} <span className="text-[#F87315]">{t('titleHighlight')}</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* FAQ Content */}
            <div className="space-y-6">
              {objections.map((objection, index) => (
                <ScrollReveal
                  key={index}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-5 sm:p-6 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#F87315]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="w-5 h-5 text-[#F87315]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">
                        &ldquo;{objection.question}&rdquo;
                      </h3>
                      <p className="text-white/60 leading-relaxed text-sm">
                        {objection.answer}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Sfeer image naast objecties */}
            <ScrollReveal direction="right" distance={30} className="h-full">
              <div className="sfeer-image h-full w-full">
                <Image
                  src="/images/anne-nygard-w7-cOgX-IVQ-unsplash.jpg"
                  alt=""
                  width={500}
                  height={750}
                  className="object-cover w-full h-full"
                />
              </div>
            </ScrollReveal>
          </div>

          {/* Confidence Builder */}
          <ScrollReveal className="text-center mt-16 sm:mt-20">
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl font-semibold text-white mb-2">
                {t('stillDoubts')}
              </p>
              <p className="text-sm text-white/50">
                {t('freeConsultation')}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}