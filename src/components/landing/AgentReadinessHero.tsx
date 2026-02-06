'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function AgentReadinessHero() {
  const t = useTranslations('hero');
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren' as const,
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 bg-[#080D14]">
      {/* Background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Layer 1: Animated orbs */}
        {/* Center orb */}
        <motion.div
          className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] lg:w-[1000px] lg:h-[1000px] rounded-full left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(248,115,21,0.18) 0%, rgba(248,115,21,0.05) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.05, 1],
                  opacity: [1, 0.85, 1],
                }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Top-left orb */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            left: '15%',
            top: '20%',
            background: 'radial-gradient(circle, rgba(248,115,21,0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [0, 30, -20, 0],
                  y: [0, -25, 15, 0],
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Bottom-right orb */}
        <motion.div
          className="absolute w-[450px] h-[450px] rounded-full"
          style={{
            left: '80%',
            top: '75%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255,159,67,0.10) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [0, -25, 20, 0],
                  y: [0, 20, -15, 0],
                }
          }
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Green accent orb */}
        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{
            left: '60%',
            top: '15%',
            background: 'radial-gradient(circle, rgba(18,83,18,0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [0, 15, -10, 0],
                  y: [0, -10, 20, 0],
                }
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Layer 2: Radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, #080D14 80%)',
          }}
        />

        {/* Layer 3: Grid pattern with mask fade */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(248,115,21,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(248,115,21,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          }}
        />

        {/* Layer 4: Grain texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] mix-blend-overlay pointer-events-none">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* Layer 5: Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{
            background: 'linear-gradient(to top, #080D14, transparent)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          {/* Headline */}
          <motion.h1
            variants={itemVariants}
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
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-white/70 mb-10 sm:mb-12 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
          >
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
          </motion.div>

          {/* Trust Line */}
          <motion.p variants={itemVariants} className="text-sm text-white/50">
            {t('stats.roi.value')} {t('stats.roi.label')} · {t('stats.speed.value')} {t('stats.speed.label')} · {t('stats.guarantee.value')}, {t('stats.guarantee.label')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
