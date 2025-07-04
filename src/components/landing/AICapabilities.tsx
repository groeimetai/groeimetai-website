'use client';

import { motion } from 'framer-motion';
import { Bot, GitBranch, Brain, Shield, Sparkles, Gauge } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { StartProjectButton } from '@/components/ui/StartProjectButton';
import { useTranslations } from 'next-intl';

export default function AICapabilities() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const t = useTranslations('aiCapabilities');

  const capabilities = [
    {
      icon: Bot,
      title: t('capabilities.autonomous.title'),
      description: t('capabilities.autonomous.description'),
      features: [
        t('capabilities.autonomous.features.selfHealing'),
        t('capabilities.autonomous.features.dynamicAllocation'),
        t('capabilities.autonomous.features.continuousLearning'),
      ],
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: GitBranch,
      title: t('capabilities.parallel.title'),
      description: t('capabilities.parallel.description'),
      features: [
        t('capabilities.parallel.features.fasterDelivery'),
        t('capabilities.parallel.features.noBottlenecks'),
        t('capabilities.parallel.features.optimalUsage'),
      ],
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Brain,
      title: t('capabilities.collective.title'),
      description: t('capabilities.collective.description'),
      features: [
        t('capabilities.collective.features.domainExpertise'),
        t('capabilities.collective.features.crossValidation'),
        t('capabilities.collective.features.knowledgeSynthesis'),
      ],
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Shield,
      title: t('capabilities.quality.title'),
      description: t('capabilities.quality.description'),
      features: [
        t('capabilities.quality.features.codeReview'),
        t('capabilities.quality.features.securityScanning'),
        t('capabilities.quality.features.performanceOptimization'),
      ],
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Sparkles,
      title: t('capabilities.creative.title'),
      description: t('capabilities.creative.description'),
      features: [
        t('capabilities.creative.features.novelApproaches'),
        t('capabilities.creative.features.patternRecognition'),
        t('capabilities.creative.features.solutionEvolution'),
      ],
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Gauge,
      title: t('capabilities.monitoring.title'),
      description: t('capabilities.monitoring.description'),
      features: [
        t('capabilities.monitoring.features.liveDashboards'),
        t('capabilities.monitoring.features.performanceMetrics'),
        t('capabilities.monitoring.features.predictiveInsights'),
      ],
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #FF6600 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, #0A4A0A 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, #FF6600 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4 text-white">
            {t('heading.why')}
            <span className="text-orange-500"> {t('heading.transforms')} </span>
            {t('heading.yourBusiness')}
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative group"
              >
                <div
                  className={`
                  relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8
                  transition-all duration-300 hover:border-orange-500/50 hover:shadow-2xl
                  ${isHovered ? 'scale-105' : ''}
                `}
                >
                  {/* Gradient background on hover */}
                  <div
                    className={`
                    absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity
                    bg-gradient-to-br ${capability.color}
                  `}
                  />

                  {/* Icon */}
                  <div
                    className={`
                    relative mb-6 inline-flex p-4 rounded-xl
                    bg-gradient-to-br ${capability.color}
                  `}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 text-white">{capability.title}</h3>
                  <p className="text-white/70 mb-6">{capability.description}</p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {capability.features.map((feature, featureIndex) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: isHovered ? 1 : 0.7,
                          x: isHovered ? 0 : -10,
                        }}
                        transition={{ delay: featureIndex * 0.1 }}
                        className="flex items-center gap-2 text-sm text-white/60"
                      >
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Hover effect line */}
                  <div
                    className={`
                    absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl
                    bg-gradient-to-r ${capability.color}
                    transform origin-left transition-transform duration-300
                    ${isHovered ? 'scale-x-100' : 'scale-x-0'}
                  `}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-xl text-white/70 mb-8">{t('cta.question')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <StartProjectButton
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {t('cta.startJourney')}
              </StartProjectButton>
            </motion.div>
            <Link href="/services">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
              >
                {t('cta.exploreServices')}
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
