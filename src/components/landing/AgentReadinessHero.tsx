'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function AgentReadinessHero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20" style={{ backgroundColor: '#080D14' }}>
      {/* Static Background Layer - no JS animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static gradient orbs */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            left: '15%',
            top: '20%',
            background: 'radial-gradient(circle, rgba(248,115,21,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            right: '10%',
            bottom: '20%',
            background: 'radial-gradient(circle, rgba(255,140,60,0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Central glow - static */}
        <div
          className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] lg:w-[1000px] lg:h-[1000px] rounded-full"
          style={{
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(248,115,21,0.2) 0%, rgba(248,115,21,0.06) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Simple grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(248,115,21,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(248,115,21,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{
            background: 'linear-gradient(to top, #080D14, transparent)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] text-white mb-6 sm:mb-8 leading-[1.1] animate-fade-in-up">
            {t('title')}{' '}
            <span
              className="relative inline-block text-white px-3 py-1 sm:px-4 sm:py-2"
              style={{
                background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.5)',
              }}
            >
              {t('highlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/70 mb-10 sm:mb-12 max-w-3xl mx-auto font-normal leading-relaxed animate-fade-in-up animation-delay-100">
            {t('subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 animate-fade-in-up animation-delay-200">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="group text-white border-0 w-full sm:w-auto h-14 text-base font-medium px-8 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                }}
              >
                <Calendar className="mr-2 w-5 h-5" />
                {t('cta.consultation')}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/cases" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 w-full sm:w-auto h-14 text-base font-medium px-8 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('cta.seeHow')}
              </Button>
            </Link>
          </div>

          {/* Trust Line */}
          <p className="text-sm text-white/50 animate-fade-in-up animation-delay-200">
            {t('stats.roi.value')} {t('stats.roi.label')} · {t('stats.speed.value')} {t('stats.speed.label')} · {t('stats.guarantee.value')}, {t('stats.guarantee.label')}
          </p>
        </div>
      </div>
    </section>
  );
}
