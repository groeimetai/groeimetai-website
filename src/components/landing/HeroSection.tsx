'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StartProjectButton } from '@/components/ui/StartProjectButton';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

export default function HeroSection() {
  const t = useTranslations('hero');
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black dark:bg-black">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/95 to-black" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-3 sm:mb-4 md:mb-6"
        >
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-orange/20 border border-orange/30 text-white text-xs sm:text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            {t('badge')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-4 sm:mb-5 md:mb-6 text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight"
        >
          {t('title')}
          <br />
          <span
            className="text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 inline-block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl"
            style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
          >
            {t('subtitle')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto font-light px-2 sm:px-0"
        >
          {t('description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0"
        >
          <StartProjectButton
            size="lg"
            className="group bg-orange hover:bg-orange-600 text-white border-0 shadow-orange hover-lift min-h-[48px] text-sm sm:text-base px-4 sm:px-6"
            preselectedService="genai-consultancy"
          >
            {user ? t('cta.dashboard') : t('cta.consultation')}
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
          </StartProjectButton>
          <Link href="/advisory-services">
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:border-orange hover:text-orange hover-lift min-h-[48px] text-sm sm:text-base px-4 sm:px-6"
            >
              {t('cta.services')}
            </Button>
          </Link>
        </motion.div>

        {/* Animated scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2"
        >
          <div className="animate-bounce">
            <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-orange/50 relative">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange rounded-full absolute top-1.5 sm:top-2 left-1/2 transform -translate-x-1/2 animate-float" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
