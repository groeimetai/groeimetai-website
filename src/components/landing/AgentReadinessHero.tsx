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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#080D14' }}>
      {/* Orange Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(248,115,21,0.4) 0%, rgba(248,115,21,0.1) 50%, transparent 100%)'
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.25, 0.2]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-15 blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,133,51,0.3) 0%, rgba(255,133,51,0.05) 70%, transparent 100%)'
          }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.2, 0.15]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(248,115,21,0.25) 0%, rgba(248,115,21,0.05) 60%, transparent 100%)'
          }}
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
          >
            {t('title')}{' '}
            <span
              className="text-white px-4 py-2 inline-block"
              style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
            >
              {t('highlight')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 mb-4 max-w-4xl mx-auto font-light leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {t('description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8 mb-12"
          >
            {!showQuickCheck ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setShowQuickCheck(true)}
                  size="lg"
                  className="group text-white border-0 shadow-xl hover-lift transform transition-all duration-300"
                  style={{ 
                    backgroundColor: '#F87315',
                    boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
                  }}
                >
                  <Zap className="mr-2 w-5 h-5" />
                  {t('cta.quickCheck')}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Link href="/cases">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
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
                    variant="outline"
                    className="border-white/20 text-white/70 hover:bg-white/5"
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
            <p className="text-sm text-white/50 mb-2">
              {t('badge')}
            </p>
            <p className="text-lg font-semibold text-white/90">
              {t('explanation')}{' '}
              <span style={{ color: '#F87315' }}>{t('reason')}</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}