'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Clock, CheckCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('hero');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch and flickering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Container animation - all children animate together
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1,
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
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: '#080D14' }}>
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#F87315]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#FF9F43]/10 rounded-full blur-[120px]" />

      {/* Floating connection lines - visual representation of API connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F87315" stopOpacity="0" />
            <stop offset="50%" stopColor="#F87315" stopOpacity="1" />
            <stop offset="100%" stopColor="#F87315" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Horizontal lines */}
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="url(#lineGradient)" strokeWidth="1" />
        <line x1="0" y1="70%" x2="100%" y2="70%" stroke="url(#lineGradient)" strokeWidth="1" />
        {/* Vertical lines */}
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="url(#lineGradient)" strokeWidth="1" />
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="url(#lineGradient)" strokeWidth="1" />
      </svg>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F87315]/10 border border-[#F87315]/30 text-white/90 text-sm font-medium">
              <Zap className="w-4 h-4 text-[#FF9F43]" />
              {t('badge')}
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('title')}{' '}
              <span
                className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.5)',
                }}
              >
                {t('highlight')}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/70 font-light max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Value proposition box */}
          <motion.div variants={itemVariants} className="mb-10">
            <div className="max-w-3xl mx-auto bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
              <p className="text-lg text-white/80 text-center mb-6">
                {t('description')}
              </p>

              {/* Mini stats/benefits */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Clock, text: '2-4 weken', subtext: 'implementatie' },
                  { icon: Shield, text: '100%', subtext: 'bestaande APIs' },
                  { icon: Zap, text: 'Direct', subtext: 'agent-compatible' },
                  { icon: CheckCircle, text: 'Geen', subtext: 'rebuilding nodig' },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <item.icon className="w-5 h-5 mx-auto mb-2 text-[#FF9F43]" />
                    <div className="text-white font-semibold text-sm">{item.text}</div>
                    <div className="text-white/50 text-xs">{item.subtext}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agent-readiness">
              <Button
                size="lg"
                className="w-full sm:w-auto text-white font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                }}
              >
                {t('cta.quickCheck')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/advisory-services">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-6 text-lg transition-all duration-300"
              >
                {t('cta.seeHow')}
              </Button>
            </Link>
          </motion.div>

          {/* Bottom explanation */}
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <p className="text-white/50 text-sm max-w-2xl mx-auto">
              {t('explanation')}{' '}
              <span className="text-[#FF9F43]">{t('reason')}</span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {mounted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 relative">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 bg-[#FF9F43] rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
