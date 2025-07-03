'use client';

import { motion } from 'framer-motion';
import { Bot, GitBranch, Brain, Shield, Sparkles, Gauge } from 'lucide-react';
import { useState } from 'react';

const capabilities = [
  {
    icon: Bot,
    title: 'Autonomous Agents',
    description: 'Self-organizing AI teams that adapt to your challenges',
    features: ['Self-healing systems', 'Dynamic task allocation', 'Continuous learning'],
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: GitBranch,
    title: 'Parallel Processing',
    description: 'Multiple agents working simultaneously on different aspects',
    features: ['10x faster delivery', 'No bottlenecks', 'Optimal resource usage'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Brain,
    title: 'Collective Intelligence',
    description: 'Combined expertise of specialized agents for superior results',
    features: ['Domain expertise', 'Cross-validation', 'Knowledge synthesis'],
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Shield,
    title: 'Built-in Quality',
    description: 'Automatic validation and testing by dedicated agents',
    features: ['Code review agents', 'Security scanning', 'Performance optimization'],
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Sparkles,
    title: 'Creative Solutions',
    description: 'Emergent innovation from agent collaboration',
    features: ['Novel approaches', 'Pattern recognition', 'Solution evolution'],
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: Gauge,
    title: 'Real-time Monitoring',
    description: 'Complete visibility into agent performance and progress',
    features: ['Live dashboards', 'Performance metrics', 'Predictive insights'],
    color: 'from-indigo-500 to-indigo-600',
  },
];

export default function AICapabilities() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
            Why Multi-Agent Orchestration
            <span className="text-orange-500"> Transforms </span>
            Your Business
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Traditional AI gives you one perspective. Our orchestrated agents give you an entire
            team of specialists working in perfect harmony, delivering results that single models
            simply can&apos;t match.
          </p>
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
          <p className="text-xl text-white/70 mb-8">
            Ready to experience the power of orchestrated AI intelligence?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Start Your AI Journey
            </motion.a>
            <motion.a
              href="/services"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Explore Our Services
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
