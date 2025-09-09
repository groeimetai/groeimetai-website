'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Zap, Brain } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function CompanyTimeline() {
  const t = useTranslations('timeline');
  
  const milestones = [
    {
      date: t('milestones.0.date'),
      title: t('milestones.0.title'),
      description: t('milestones.0.description'),
      impact: t('milestones.0.impact'),
      icon: Brain
    },
    {
      date: t('milestones.1.date'),
      title: t('milestones.1.title'),
      description: t('milestones.1.description'),
      impact: t('milestones.1.impact'),
      icon: TrendingUp
    },
    {
      date: t('milestones.2.date'),
      title: t('milestones.2.title'),
      description: t('milestones.2.description'),
      impact: t('milestones.2.impact'),
      icon: Zap
    },
    {
      date: t('milestones.3.date'),
      title: t('milestones.3.title'),
      description: t('milestones.3.description'),
      impact: t('milestones.3.impact'),
      icon: Calendar
    },
    {
      date: t('milestones.4.date'),
      title: t('milestones.4.title'),
      description: t('milestones.4.description'),
      impact: t('milestones.4.impact'),
      icon: TrendingUp
    },
    {
      date: t('milestones.5.date'),
      title: t('milestones.5.title'),
      description: t('milestones.5.description'),
      impact: t('milestones.5.impact'),
      icon: Brain
    },
    {
      date: t('milestones.6.date'),
      title: t('milestones.6.title'),
      description: t('milestones.6.description'),
      impact: t('milestones.6.impact'),
      icon: Calendar
    }
  ];

  return (
    <section className="py-24 relative" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('title')}{' '}
              <span style={{ color: '#F87315' }}>{t('titleHighlight')}</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/20"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.date}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="relative flex items-start gap-8"
                >
                  {/* Timeline dot */}
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center z-10 border-4 border-white/10"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    <milestone.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-white/10 text-white">
                          {milestone.date}
                        </span>
                        <span className="text-xs text-white/50">
                          {index < milestones.length - 1 ? t('statusLabels.completed') : t('statusLabels.inProgress')}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3">
                        {milestone.title}
                      </h3>
                      
                      <p className="text-white/80 mb-4 leading-relaxed">
                        {milestone.description}
                      </p>
                      
                      <div className="flex items-center text-sm">
                        <span className="text-white/60 mr-2">{t('statusLabels.impact')}</span>
                        <span style={{ color: '#F87315' }} className="font-semibold">
                          {milestone.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decorative Image Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 mb-8"
          >
            <div className="max-w-4xl mx-auto">
            </div>
          </motion.div>

          {/* Bottom message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-16"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-4xl mx-auto">
              <p className="text-xl text-white/90 mb-4 font-medium">
                {t('finalQuestion')}
              </p>
              <p className="text-2xl font-bold text-white mb-2">
                {t('readyQuestion')}
              </p>
              <p className="text-lg" style={{ color: '#F87315' }}>
                {t('weAreReady')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}