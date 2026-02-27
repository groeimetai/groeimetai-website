'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Calendar,
  Bot,
  Mic,
  Brain,
  Zap,
  Globe,
  GraduationCap,
  Workflow,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const SERVICE_KEYS = [
  { key: 'aiStrategy', icon: Brain },
  { key: 'voiceAI', icon: Mic },
  { key: 'chatbots', icon: Bot },
  { key: 'automation', icon: Zap },
  { key: 'mcp', icon: Workflow },
  { key: 'websites', icon: Globe },
  { key: 'training', icon: GraduationCap },
] as const;

export default function AgentReadinessHero() {
  const t = useTranslations('hero');
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SERVICE_KEYS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren' as const,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 bg-[#080D14]">
      {/* ── Background layers ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Center orb — dominant warm glow */}
        <motion.div
          className="absolute w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] lg:w-[1100px] lg:h-[1100px] rounded-full left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'radial-gradient(circle, rgba(248,115,21,0.28) 0%, rgba(248,115,21,0.07) 45%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : { scale: [1, 1.06, 0.98, 1], opacity: [1, 0.85, 1, 0.9, 1] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Top-left satellite */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            left: '8%',
            top: '12%',
            background:
              'radial-gradient(circle, rgba(248,115,21,0.18) 0%, rgba(248,115,21,0.04) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [0, 50, -25, 0],
                  y: [0, -35, 25, 0],
                  scale: [1, 1.08, 0.96, 1],
                }
          }
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Bottom-right orb */}
        <motion.div
          className="absolute w-[450px] h-[450px] rounded-full"
          style={{
            left: '72%',
            top: '68%',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(255,159,67,0.16) 0%, rgba(255,159,67,0.03) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [0, -40, 30, 0],
                  y: [0, 30, -20, 0],
                  scale: [1, 0.96, 1.06, 1],
                }
          }
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Green accent */}
        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{
            left: '68%',
            top: '8%',
            background:
              'radial-gradient(circle, rgba(18,83,18,0.10) 0%, rgba(18,83,18,0.02) 50%, transparent 70%)',
            filter: 'blur(70px)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : { x: [0, 20, -12, 0], y: [0, -18, 25, 0] }
          }
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Center hot-spot */}
        <motion.div
          className="absolute w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'radial-gradient(circle, rgba(255,159,67,0.15) 0%, transparent 60%)',
            filter: 'blur(40px)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : { scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }
          }
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 45%, #080D14 85%)',
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(248,115,21,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(248,115,21,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          }}
        />

        {/* Grain texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-overlay pointer-events-none">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: 'linear-gradient(to top, #080D14, transparent)' }}
        />
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] mb-8 sm:mb-10"
          >
            <div className="w-2 h-2 rounded-full bg-[#F87315]" />
            <span className="text-sm text-white/50 tracking-wide">
              {t('badge')}
            </span>
          </motion.div>

          {/* Headline with rotating service name */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-white leading-[1.1]"
          >
            {t('title')}
            {/* Rotating service — fixed-height container to prevent layout shift */}
            <span className="relative block h-[1.2em] overflow-hidden mt-1 sm:mt-2 mb-6 sm:mb-8">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeIndex}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { y: '100%', opacity: 0 }
                  }
                  animate={{ y: '0%', opacity: 1 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { y: '-100%', opacity: 0 }
                  }
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-x-0 bg-gradient-to-r from-[#F87315] to-[#FF9F43] bg-clip-text text-transparent"
                >
                  {t(
                    `rotatingServices.${SERVICE_KEYS[activeIndex].key}`
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-white/60 mb-10 sm:mb-12 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14 sm:mb-16"
          >
            <Link href="/contact" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="group text-white border-0 w-full sm:w-auto h-14 text-base font-medium px-8 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
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
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 w-full sm:w-auto h-14 text-base font-medium px-8 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('cta.seeHow')}
              </Button>
            </Link>
          </motion.div>

          {/* Service capsules — synced with rotating headline */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-10 sm:mb-12"
          >
            {SERVICE_KEYS.map((service, i) => {
              const Icon = service.icon;
              const isActive = i === activeIndex;
              return (
                <motion.div
                  key={service.key}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-medium transition-colors duration-500 cursor-default ${
                    isActive
                      ? 'border-[#F87315]/30 bg-[#F87315]/[0.08] text-white/90'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/35'
                  }`}
                  animate={
                    isActive
                      ? {
                          scale: 1.05,
                          boxShadow:
                            '0 0 20px -5px rgba(248,115,21,0.25)',
                        }
                      : {
                          scale: 1,
                          boxShadow: '0 0 0px 0px rgba(248,115,21,0)',
                        }
                  }
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>
                    {t(`rotatingServices.${service.key}`)}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Trust line */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm"
          >
            <span className="text-white/50">
              {t('stats.roi.value')}{' '}
              <span className="text-white/30">{t('stats.roi.label')}</span>
            </span>
            <span className="hidden sm:inline text-white/15">|</span>
            <span className="text-white/50">
              {t('stats.speed.value')}{' '}
              <span className="text-white/30">{t('stats.speed.label')}</span>
            </span>
            <span className="hidden sm:inline text-white/15">|</span>
            <span className="text-white/50">
              {t('stats.guarantee.value')}{' '}
              <span className="text-white/30">
                {t('stats.guarantee.label')}
              </span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
