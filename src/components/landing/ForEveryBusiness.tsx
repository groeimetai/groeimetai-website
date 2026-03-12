'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Search, Target, Rocket, ArrowRight, CheckCircle, Calendar } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { blurDataURLs } from '@/lib/image-blurs';

function StepCard({
  step,
  index,
  totalSteps,
}: {
  step: {
    number: string;
    title: string;
    subtitle: string;
    pricing: string;
    timeframe: string;
    description: string;
    features: string[];
    cta: string;
    icon: React.ComponentType<{ className?: string }>;
    link: string;
  };
  index: number;
  totalSteps: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('nextSteps');

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.25], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.25], [0.95, 1]);

  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      style={prefersReducedMotion ? {} : { opacity, y, scale }}
      className="relative group"
    >
      {/* Connection Line */}
      {index < totalSteps - 1 && (
        <div className="hidden md:block absolute top-16 left-full w-8 z-10">
          <div className="h-0.5 bg-white/20 mt-8">
            <ArrowRight className="w-4 h-4 text-white/40 absolute -right-1 -top-2" />
          </div>
        </div>
      )}

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 h-full hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 flex flex-col">
        {/* Step Number */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-display font-bold text-white transition-transform duration-300 group-hover:scale-105 bg-gradient-to-br from-[#F87315] to-[#FF9F43]">
            {step.number}
          </div>
          <Icon className="w-7 h-7 text-white/50" />
        </div>

        {/* Content */}
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-base font-medium text-white/80 mb-3">{step.subtitle}</p>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">{step.description}</p>

          {/* Features */}
          <div className="space-y-2.5 mb-6">
            {step.features.map((feature, idx) => (
              <div key={idx} className="flex items-start text-white/70 text-sm">
                <CheckCircle className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-[#FF9F43]" />
                {feature}
              </div>
            ))}
          </div>

          {/* Price & Timing */}
          <div className="flex items-center justify-between text-sm mb-6">
            <div className="flex items-center text-white/50">
              <Calendar className="w-4 h-4 mr-2 text-[#FF9F43]" />
              <span>{t('labels.time')}</span>
              <span className="text-white font-medium ml-1">{step.timeframe}</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                step.pricing === 'GRATIS' || step.pricing === 'FREE' ? 'bg-emerald-500' : 'bg-[#F87315]'
              }`}
            >
              {step.pricing}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-auto pt-2">
          <Link href={step.link}>
            <Button
              className="w-full bg-[#F87315] hover:bg-[#E5680F] text-white font-medium h-12 shadow-lg shadow-[#F87315]/20 hover:shadow-[#F87315]/30 transition-all duration-200"
            >
              {step.cta}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ForEveryBusiness() {
  const t = useTranslations('nextSteps');

  const steps = [
    {
      number: '1',
      title: t('steps.step1.title'),
      subtitle: t('steps.step1.subtitle'),
      pricing: t('steps.step1.pricing'),
      timeframe: t('steps.step1.timeframe'),
      description: t('steps.step1.description'),
      features: [
        t('steps.step1.features.0'),
        t('steps.step1.features.1'),
        t('steps.step1.features.2'),
        t('steps.step1.features.3'),
      ],
      cta: t('steps.step1.cta'),
      icon: Search,
      link: '/agent-readiness',
    },
    {
      number: '2',
      title: t('steps.step2.title'),
      subtitle: t('steps.step2.subtitle'),
      pricing: t('steps.step2.pricing'),
      timeframe: t('steps.step2.timeframe'),
      description: t('steps.step2.description'),
      features: [
        t('steps.step2.features.0'),
        t('steps.step2.features.1'),
        t('steps.step2.features.2'),
        t('steps.step2.features.3'),
      ],
      cta: t('steps.step2.cta'),
      icon: Target,
      link: '/expert-assessment',
    },
    {
      number: '3',
      title: t('steps.step3.title'),
      subtitle: t('steps.step3.subtitle'),
      pricing: t('steps.step3.pricing'),
      timeframe: t('steps.step3.timeframe'),
      description: t('steps.step3.description'),
      features: [
        t('steps.step3.features.0'),
        t('steps.step3.features.1'),
        t('steps.step3.features.2'),
        t('steps.step3.features.3'),
      ],
      cta: t('steps.step3.cta'),
      icon: Rocket,
      link: '/implementation-proposal',
    },
  ];

  return (
    <section className="relative bg-[#080D14]">
      {/* Subtle section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Sticky header + scrolling cards layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12">
            {/* Left: Sticky title */}
            <div className="pt-20 sm:pt-28 lg:pt-36 lg:pb-36">
              <div className="lg:sticky lg:top-32">
                <ScrollReveal>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                    {t('title')}{' '}
                    <span className="text-white px-3 py-1 sm:px-4 sm:py-1.5 inline-block bg-gradient-to-r from-[#F87315] to-[#FF9F43] shadow-lg shadow-[#F87315]/30 rounded-sm">
                      {t('highlight')}
                    </span>{' '}
                    {t('titleEnd')}
                  </h2>
                  <p className="text-lg sm:text-xl text-white/60 max-w-md leading-relaxed">
                    {t('subtitle')}
                  </p>
                </ScrollReveal>
              </div>
            </div>

            {/* Right: Scroll-driven step cards */}
            <div className="py-20 sm:py-28 lg:py-36 space-y-6 lg:space-y-8">
              {steps.map((step, index) => (
                <StepCard
                  key={step.number}
                  step={step}
                  index={index}
                  totalSteps={steps.length}
                />
              ))}
            </div>
          </div>

          {/* Bottom Section - Image naast Explanation */}
          <div className="grid lg:grid-cols-2 gap-12 pb-20 sm:pb-28 lg:pb-36 items-stretch">
            {/* Linker kolom - Sfeer image */}
            <ScrollReveal direction="left" distance={30} className="flex">
              <div className="sfeer-image w-full">
                <Image
                  src="/images/nathan-duck-Jo5FUEkhB_4-unsplash.jpg"
                  alt=""
                  width={400}
                  height={500}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL={blurDataURLs['/images/nathan-duck-Jo5FUEkhB_4-unsplash.jpg']}
                  className="object-cover w-full h-full rounded-xl"
                />
              </div>
            </ScrollReveal>

            {/* Rechter kolom - Transparent Collaboration */}
            <ScrollReveal direction="right" distance={30} className="flex">
              <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-8 w-full h-full flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  {t('explanation.title')}
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">{t('explanation.transparentPricing.title')}</h4>
                    <p className="text-white/70 mb-4">{t('explanation.transparentPricing.description')}</p>
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center text-white/80 text-sm">
                          <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0 text-[#F87315]" />
                          {t(`explanation.transparentPricing.ranges.${i}`)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">{t('explanation.roiGuarantee.title')}</h4>
                    <p className="text-white/70 mb-4">{t('explanation.roiGuarantee.description')}</p>
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center text-white/80 text-sm">
                          <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0 text-[#F87315]" />
                          {t(`explanation.roiGuarantee.stats.${i}`)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">{t('explanation.noLockIn.title')}</h4>
                    <p className="text-white/70 mb-4">{t('explanation.noLockIn.description')}</p>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-display font-bold text-white">100%</div>
                        <div className="text-white/60 text-xs">{t('explanation.guarantees.fixedPrice')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-display font-bold text-white">2-12</div>
                        <div className="text-white/60 text-xs">{t('explanation.guarantees.timeframe')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-display font-bold text-white">0</div>
                        <div className="text-white/60 text-xs">{t('explanation.guarantees.downtime')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
