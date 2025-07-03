'use client';

import { motion } from 'framer-motion';
import { Brain, Cpu, GitBranch, Shield, Sparkles, TrendingUp, Code, Layers, MessageSquare, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

  const expertiseAreas = [
    {
      key: 'finance',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
    },
    {
      key: 'healthcare',
      icon: Cpu,
      color: 'from-blue-500 to-blue-600',
    },
    {
      key: 'retail',
      icon: GitBranch,
      color: 'from-orange-500 to-orange-600',
    },
    {
      key: 'manufacturing',
      icon: Layers,
      color: 'from-green-500 to-green-600',
    },
    {
      key: 'public',
      icon: Shield,
      color: 'from-red-500 to-red-600',
    },
    {
      key: 'energy',
      icon: MessageSquare,
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

export default function Expertise() {
  const t = useTranslations('expertise');
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #FF6600 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #0A4A0A 0%, transparent 50%)`,
        }} />
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
            {t('title')}
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {expertiseAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.div
                key={area.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full
                  transition-all duration-300 hover:border-orange-500/50 hover:shadow-2xl hover:scale-[1.02]">
                  
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${area.color} mb-6`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-white">{t(`industries.${area.key}.title`)}</h3>
                  <p className="text-white/70 mb-6">{t(`industries.${area.key}.description`)}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {(t.raw(`industries.${area.key}.skills`) as string[]).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-xs font-medium bg-white/10 text-white/80 rounded-full
                          border border-white/20 group-hover:border-orange-500/50 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Success Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-orange-500/20 to-green-500/20 rounded-2xl p-8 md:p-12 border border-white/10"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-orange-500 rounded-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Our Multi-Agent Success Story</h3>
                <p className="text-white/80 text-lg">
                  We built a complete educational platform using our multi-agent orchestration system
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-1">2</div>
                <div className="text-white/70">Weeks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">10+</div>
                <div className="text-white/70">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-1">40+</div>
                <div className="text-white/70">Modules</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-1">160+</div>
                <div className="text-white/70">Lessons</div>
              </div>
            </div>

            <p className="text-white/70 mb-6">
              Using our multi-agent orchestration system, we created a comprehensive learning platform with:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-white/80">Automated content generation</span>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-white/80">Intelligent curriculum design</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-white/80">Interactive exercises & quizzes</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-white/80">Personalized learning paths</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}