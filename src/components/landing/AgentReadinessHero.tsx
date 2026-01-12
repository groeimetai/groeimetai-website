'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { AgentReadinessQuickCheck } from '@/components/landing/AgentReadinessQuickCheck';
import { useTranslations } from 'next-intl';

// Floating particle component
function FloatingParticle({ delay, duration, size, startX, startY }: {
  delay: number;
  duration: number;
  size: number;
  startX: number;
  startY: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        top: `${startY}%`,
        background: `radial-gradient(circle, rgba(248,115,21,0.6) 0%, rgba(248,115,21,0) 70%)`,
      }}
      animate={{
        x: [0, Math.random() * 100 - 50, Math.random() * 80 - 40, 0],
        y: [0, Math.random() * -80 - 20, Math.random() * -60, 0],
        opacity: [0, 0.8, 0.6, 0],
        scale: [0.5, 1.2, 0.8, 0.5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Animated line component
function AnimatedLine({ startX, startY, angle, length, delay }: {
  startX: number;
  startY: number;
  angle: number;
  length: number;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute origin-left"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: length,
        height: 1,
        transform: `rotate(${angle}deg)`,
        background: 'linear-gradient(90deg, transparent, rgba(248,115,21,0.3), transparent)',
      }}
      animate={{
        opacity: [0, 0.5, 0],
        scaleX: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Glowing orb with trail effect
function GlowingOrb({ size, color, x, y, duration, delay }: {
  size: number;
  color: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
      animate={{
        x: [0, 100, -50, 80, 0],
        y: [0, -60, 40, -80, 0],
        scale: [1, 1.3, 0.9, 1.2, 1],
        opacity: [0.4, 0.7, 0.5, 0.6, 0.4],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function AgentReadinessHero() {
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const t = useTranslations('hero');

  // Track mouse for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate particles
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: i * 0.5,
      duration: 8 + Math.random() * 6,
      size: 4 + Math.random() * 8,
      startX: Math.random() * 100,
      startY: 60 + Math.random() * 40,
    }))
  , []);

  // Generate animated lines
  const lines = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      startX: Math.random() * 80 + 10,
      startY: Math.random() * 60 + 20,
      angle: Math.random() * 360,
      length: 100 + Math.random() * 150,
      delay: i * 0.7,
    }))
  , []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20" style={{ backgroundColor: '#080D14' }}>
      {/* Dynamic Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* Animated Aurora Gradient Mesh */}
        <div className="absolute inset-0">
          {/* Primary aurora wave */}
          <motion.div
            className="absolute w-full h-full"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at ${30 + mousePosition.x * 0.2}% ${40 + mousePosition.y * 0.1}%,
                  rgba(248,115,21,0.25) 0%,
                  transparent 50%),
                radial-gradient(ellipse 60% 40% at ${70 - mousePosition.x * 0.1}% ${60 - mousePosition.y * 0.1}%,
                  rgba(255,140,60,0.2) 0%,
                  transparent 50%)
              `,
            }}
            animate={{
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Secondary moving gradient */}
          <motion.div
            className="absolute w-full h-full"
            animate={{
              background: [
                'radial-gradient(ellipse 100% 60% at 20% 30%, rgba(248,115,21,0.15) 0%, transparent 50%)',
                'radial-gradient(ellipse 100% 60% at 80% 70%, rgba(248,115,21,0.15) 0%, transparent 50%)',
                'radial-gradient(ellipse 100% 60% at 50% 40%, rgba(248,115,21,0.15) 0%, transparent 50%)',
                'radial-gradient(ellipse 100% 60% at 20% 30%, rgba(248,115,21,0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Large floating orbs with movement */}
        <GlowingOrb size={600} color="rgba(248,115,21,0.3)" x={20} y={20} duration={20} delay={0} />
        <GlowingOrb size={400} color="rgba(255,140,60,0.25)" x={70} y={60} duration={18} delay={3} />
        <GlowingOrb size={500} color="rgba(248,115,21,0.2)" x={50} y={80} duration={22} delay={6} />
        <GlowingOrb size={300} color="rgba(255,165,0,0.2)" x={80} y={20} duration={16} delay={9} />

        {/* Central pulsing glow - follows mouse slightly */}
        <motion.div
          className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] lg:w-[1000px] lg:h-[1000px] rounded-full"
          style={{
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(248,115,21,0.35) 0%, rgba(248,115,21,0.1) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.7, 0.5],
            x: (mousePosition.x - 50) * 0.5,
            y: (mousePosition.y - 50) * 0.3,
          }}
          transition={{
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: 0.5, ease: 'easeOut' },
            y: { duration: 0.5, ease: 'easeOut' },
          }}
        />

        {/* Animated light beams */}
        <motion.div
          className="absolute top-0 left-1/4 w-[2px] h-full"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(248,115,21,0.3), rgba(248,115,21,0.1), transparent)',
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scaleY: [0, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0,
          }}
        />
        <motion.div
          className="absolute top-0 right-1/3 w-[1px] h-full"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(255,140,60,0.25), transparent)',
          }}
          animate={{
            opacity: [0, 0.5, 0],
            scaleY: [0, 1, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Floating particles */}
        {particles.map((particle) => (
          <FloatingParticle key={particle.id} {...particle} />
        ))}

        {/* Animated connection lines */}
        {lines.map((line) => (
          <AnimatedLine key={line.id} {...line} />
        ))}

        {/* Animated grid overlay with perspective */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
            style={{
              backgroundImage: `
                linear-gradient(rgba(248,115,21,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(248,115,21,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              transform: 'perspective(500px) rotateX(60deg)',
              transformOrigin: 'center center',
            }}
            animate={{
              backgroundPosition: ['0px 0px', '80px 80px'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
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
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-orange-300 border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm">
              <motion.span
                className="w-2 h-2 rounded-full bg-orange-400"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Nu beschikbaar: AI Agent Readiness Assessment
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] text-white mb-6 sm:mb-8 leading-[1.1]"
          >
            {t('title')}{' '}
            <motion.span
              className="relative inline-block text-white px-3 py-1 sm:px-4 sm:py-2"
              style={{
                background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
              }}
              whileHover={{ scale: 1.02 }}
              animate={{
                boxShadow: [
                  '0 8px 32px -8px rgba(248, 115, 21, 0.5)',
                  '0 12px 40px -8px rgba(248, 115, 21, 0.7)',
                  '0 8px 32px -8px rgba(248, 115, 21, 0.5)',
                ],
              }}
              transition={{
                boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              {t('highlight')}
            </motion.span>
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setShowQuickCheck(true)}
                    size="lg"
                    className="group text-white border-0 w-full sm:w-auto h-14 text-base font-medium px-8 rounded-lg transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                      boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                    }}
                  >
                    <Zap className="mr-2 w-5 h-5" />
                    {t('cta.quickCheck')}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
                <Link href="/cases" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 w-full sm:w-auto h-14 text-base font-medium px-8 rounded-lg transition-all duration-300"
                    >
                      {t('cta.seeHow')}
                    </Button>
                  </motion.div>
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

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-1 h-2 rounded-full bg-orange-400"
            animate={{ y: [0, 8, 0], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
