'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { AgentReadinessQuickCheck } from '@/components/landing/AgentReadinessQuickCheck';
import { useTranslations } from 'next-intl';

export default function AgentReadinessHero() {
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20" style={{ backgroundColor: '#080D14' }}>
      {/* Refined Ambient Glow Effects - More subtle and elegant */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary Glow - Soft central warmth */}
        <motion.div
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(248,115,21,0.4) 0%, rgba(248,115,21,0.15) 35%, rgba(248,115,21,0.05) 60%, transparent 100%)',
            filter: 'blur(80px)',
            opacity: 0.6
          }}
          animate={{
            scale: [1, 1.03, 1],
            opacity: [0.5, 0.6, 0.5]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Secondary Glow - Asymmetric accent */}
        <motion.div
          className="absolute top-1/4 right-1/3 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,140,60,0.3) 0%, rgba(248,115,21,0.1) 50%, transparent 100%)',
            filter: 'blur(60px)',
            opacity: 0.4
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            opacity: [0.3, 0.45, 0.3]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Tertiary Glow - Bottom left balance */}
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(248,115,21,0.25) 0%, rgba(255,165,0,0.1) 50%, transparent 100%)',
            filter: 'blur(70px)',
            opacity: 0.35
          }}
          animate={{
            x: [0, -15, 0],
            y: [0, 10, 0],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />

        {/* Subtle grid overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] text-white mb-6 sm:mb-8 leading-[1.1]"
          >
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
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl md:text-2xl text-white/85 mb-4 sm:mb-5 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg text-white/65 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t('description')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12 sm:mb-16"
          >
            {!showQuickCheck ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => setShowQuickCheck(true)}
                  size="lg"
                  className="group text-white border-0 w-full sm:w-auto h-14 text-base font-medium px-8 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                    boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                  }}
                >
                  <Zap className="mr-2 w-5 h-5" />
                  {t('cta.quickCheck')}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Link href="/cases" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 w-full sm:w-auto h-14 text-base font-medium px-8 rounded-lg transition-all duration-300"
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
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <p className="text-xs sm:text-sm text-white/40 mb-3 uppercase tracking-wider font-medium">
              {t('badge')}
            </p>
            <p className="text-sm sm:text-base md:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
              {t('explanation')}{' '}
              <span className="text-[#FF9F43] font-medium">{t('reason')}</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}