'use client';

import { FAQJsonLd } from '@/components/JsonLd';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function FAQPage() {
  const t = useTranslations('faqPage');

  const categories = ['general', 'costs', 'process', 'technical'] as const;

  return (
    <main className="relative z-10 bg-[#080D14]">
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal className="text-center mb-16">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('title')}{' '}
                <span className="text-[#F87315]">{t('titleHighlight')}</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                {t('subtitle')}
              </p>
            </ScrollReveal>

            {categories.map((category) => {
              const faqs = Object.values(
                t.raw(`categories.${category}.faqs`)
              ) as Array<{ question: string; answer: string }>;

              return (
                <div key={category} className="mb-12">
                  <ScrollReveal>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      {t(`categories.${category}.title`)}
                    </h2>
                  </ScrollReveal>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
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
                              {faq.question}
                            </h3>
                            <p className="text-white/60 leading-relaxed text-sm">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                  <FAQJsonLd faqs={faqs} />
                </div>
              );
            })}

            <ScrollReveal className="text-center mt-16">
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
                <p className="text-xl font-semibold text-white mb-2">
                  {t('cta.title')}
                </p>
                <p className="text-white/50 text-sm mb-6">
                  {t('cta.subtitle')}
                </p>
                <Link href="/contact">
                  <Button className="bg-[#F87315] hover:bg-[#E5680F] text-white font-medium h-12 px-8 shadow-lg shadow-[#F87315]/20">
                    {t('cta.button')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </main>
  );
}
