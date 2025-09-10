'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Zap } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { AgentReadinessQuickCheck } from '@/components/landing/AgentReadinessQuickCheck';
import { useTranslations } from 'next-intl';

export default function AgentReadinessHero() {
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const t = useTranslations('hero');
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-4 sm:py-8 md:py-16" style={{ backgroundColor: '#080D14' }}>
      {/* Luxe Moving Orange Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none glow-container">
        {/* Main Central Glow - Slow Orbital Movement */}
        <motion.div 
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full opacity-25 sm:opacity-25 lg:opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(248,115,21,0.8) 0%, rgba(248,115,21,0.3) 40%, rgba(248,115,21,0.1) 70%, transparent 100%)',
            filter: 'blur(30px) sm:blur(50px) lg:blur(60px)'
          }}
          animate={{ 
            x: [0, 5, -3, 0],
            y: [0, -3, 5, 0],
            scale: [1, 1.02, 0.99, 1],
            opacity: [0.25, 0.30, 0.20, 0.25]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Secondary Glow - Figure-8 Movement */}
        <motion.div 
          className="absolute top-1/3 right-1/4 w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] lg:w-[300px] lg:h-[300px] rounded-full opacity-20 sm:opacity-15 lg:opacity-20 blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,133,51,0.6) 0%, rgba(255,133,51,0.2) 50%, rgba(248,115,21,0.1) 80%, transparent 100%)',
            filter: 'blur(25px) sm:blur(40px)'
          }}
          animate={{ 
            x: [0, 10, 0, -10, 0],
            y: [0, -8, 0, 8, 0],
            scale: [1, 1.05, 1.02, 1.03, 1],
            opacity: [0.20, 0.25, 0.15, 0.20, 0.20]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        ></motion.div>
        
        {/* Accent Glow - Gentle Drift */}
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] rounded-full opacity-20 sm:opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(248,115,21,0.5) 0%, rgba(255,165,0,0.2) 60%, rgba(248,115,21,0.05) 80%, transparent 100%)',
            filter: 'blur(30px) sm:blur(50px)'
          }}
          animate={{ 
            x: [0, -8, 12, -5, 0],
            y: [0, 6, -3, 5, 0],
            scale: [1, 1.03, 1.01, 1.02, 1],
            opacity: [0.20, 0.25, 0.15, 0.20, 0.20]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        ></motion.div>
        
        {/* Ambient Background Glow - Subtle Overall Warmth */}
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(ellipse, rgba(248,115,21,0.2) 0%, rgba(248,115,21,0.05) 50%, transparent 100%)',
            filter: 'blur(80px)'
          }}
          animate={{ 
            scale: [1, 1.01, 1.005, 1],
            opacity: [0.05, 0.08, 0.04, 0.05]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        ></motion.div>
      </div>
      
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6"
          >
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-3 sm:mb-4 md:mb-6 leading-tight"
          >
            {t('title')}{' '}
            <span
              className="text-white px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 inline-block"
              style={{ 
                background: 'linear-gradient(135deg, #F87315, #FF8533)',
                boxShadow: '0 4px 14px 0 rgba(248, 115, 21, 0.3)'
              }}
            >
              {t('highlight')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-2 sm:mb-3 md:mb-4 max-w-4xl mx-auto font-light leading-relaxed px-1 sm:px-2 md:px-0"
          >
            {t('subtitle')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm sm:text-base md:text-lg text-white/80 mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-1 sm:px-2 md:px-0"
          >
            {t('description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="space-y-4 sm:space-y-6 md:space-y-8 mb-6 sm:mb-8 md:mb-12"
          >
            {!showQuickCheck ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center px-2 sm:px-4 md:px-0">
                <Button
                  onClick={() => setShowQuickCheck(true)}
                  size="lg"
                  className="group text-white border-0 shadow-xl hover-lift transform transition-all duration-300 w-full sm:w-auto min-h-[48px] text-sm sm:text-base md:text-lg px-4 sm:px-6 py-3 sm:py-4"
                  style={{ 
                    backgroundColor: '#F87315',
                    boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
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
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 w-full sm:w-auto min-h-[48px] text-sm sm:text-base md:text-lg px-4 sm:px-6 py-3 sm:py-4"
                  >
                    {t('cta.seeHow')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto px-2 sm:px-4">
                <AgentReadinessQuickCheck />
                
                <div className="text-center mt-4 sm:mt-6">
                  <Button
                    onClick={() => setShowQuickCheck(false)}
                    variant="outline"
                    className="border-white/20 text-white/70 hover:bg-white/5 min-h-[44px] px-3 sm:px-4 py-2 text-xs sm:text-sm"
                  >
                    {t('cta.back')}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <p className="text-xs sm:text-sm text-white/50 mb-2 px-1 sm:px-2 text-center">
              {t('badge')}
            </p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white/90 px-1 sm:px-2 text-center leading-relaxed">
              {t('explanation')}{' '}
              <span style={{ color: '#F87315' }}>{t('reason')}</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}