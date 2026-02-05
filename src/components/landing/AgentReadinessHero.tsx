'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Code, Lightbulb, Mic, Users, Calendar } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { AgentReadinessQuickCheck } from '@/components/landing/AgentReadinessQuickCheck';
import { useTranslations } from 'next-intl';

const servicePills = [
  { id: 'web', icon: Code },
  { id: 'aiStrategy', icon: Lightbulb },
  { id: 'mcp', icon: Zap },
  { id: 'voice', icon: Mic },
  { id: 'training', icon: Users },
] as const;

export default function AgentReadinessHero() {
  const [showQuickCheck, setShowQuickCheck] = useState(false);
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
        <div className="max-w-5xl mx-auto">
          {/* Badge - no animation */}
          <div className="mb-6 animate-fade-in-down">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-orange-300 border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              {t('badge')}
            </span>
          </div>

          {/* Main Headline */}
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
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-4 sm:mb-5 max-w-3xl mx-auto font-normal leading-relaxed animate-fade-in-up animation-delay-100">
            {t('subtitle')}
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-white/60 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            {t('description')}
          </p>

          {/* Service Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 animate-fade-in-up animation-delay-200">
            {servicePills.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.id}
                  href={`/services#${service.id}`}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-white/80 border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/25 transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF9F43]" />
                  {t(`services.${service.id}`)}
                </Link>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-8 sm:mb-10 animate-fade-in-up animation-delay-300">
            {(['roi', 'speed', 'guarantee'] as const).map((stat) => (
              <div key={stat} className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white">{t(`stats.${stat}.value`)}</div>
                <div className="text-xs sm:text-sm text-white/50">{t(`stats.${stat}.label`)}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mb-12 sm:mb-16 animate-fade-in-up animation-delay-300">
            {!showQuickCheck ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
            ) : (
              <div className="max-w-2xl mx-auto">
                <AgentReadinessQuickCheck />

                <div className="text-center mt-6">
                  <Button
                    onClick={() => setShowQuickCheck(false)}
                    variant="ghost"
                    className="text-white/60 hover:text-white hover:bg-white/5 px-4 py-2 text-sm"
                  >
                    {t('cta.back')}
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Check tertiary link */}
            {!showQuickCheck && (
              <div className="mt-4">
                <button
                  onClick={() => setShowQuickCheck(true)}
                  className="text-white/50 hover:text-white/70 text-sm transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/40"
                >
                  <Zap className="w-3.5 h-3.5 inline mr-1.5" />
                  {t('cta.quickCheck')}
                </button>
              </div>
            )}
          </div>

          {/* Trust Badge */}
          <div className="text-center animate-fade-in-up animation-delay-400">
            <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              {t('explanation')}{' '}
              <span className="text-[#FF9F43] font-medium">{t('reason')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator - CSS animation only */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-up animation-delay-500">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-orange-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
