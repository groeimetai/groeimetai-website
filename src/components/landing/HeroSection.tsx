'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ParticleBackground from './ParticleBackground';
import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('hero');
  const handleGetStarted = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const quoteSection = document.getElementById('quote');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black dark:bg-black">
      {/* Animated particle background */}
      <ParticleBackground />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/95 to-black" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/20 border border-orange/30 text-white text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            {t('badge')}
          </span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6 text-white"
        >
          {t('title')}
          <br />
          <span className="text-white px-4 py-2 inline-block" 
                style={{background: 'linear-gradient(135deg, #FF6600, #FF8833)'}}>
            {t('subtitle')}
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-light"
        >
          {t('description')}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/#quote" onClick={handleGetStarted}>
            <Button size="lg" className="group bg-orange hover:bg-orange-600 text-white border-0 shadow-orange hover-lift">
              {t('cta.consultation')}
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/services">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-orange hover:text-orange hover-lift">
              {t('cta.services')}
            </Button>
          </Link>
        </motion.div>
        
        {/* Animated scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-orange/50 relative">
              <div className="w-2 h-2 bg-orange rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 animate-float" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}