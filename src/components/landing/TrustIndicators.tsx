'use client';

import { motion } from 'framer-motion';
import { Shield, Award, Users, Zap, CheckCircle, Building, Code, Brain } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const trustFactors = [
  {
    icon: Shield,
    key: 'security',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: Award,
    key: 'achievement',
    gradient: 'from-green-500 to-green-600',
  },
  {
    icon: Users,
    key: 'scale',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: Zap,
    key: 'innovation',
    gradient: 'from-orange-500 to-orange-600',
  },
];

const techPartners = [
  { name: 'Google Cloud Platform', logo: 'gcp' },
  { name: 'Anthropic Claude', logo: 'anthropic' },
  { name: 'AssemblyAI', logo: 'assemblyai' },
  { name: 'LangChain', logo: 'langchain' },
  { name: 'Hugging Face', logo: 'huggingface' },
  { name: 'ServiceNow', logo: 'servicenow' },
];

const achievements = [
  { metric: '€2.8M+', label: 'Annual Savings Delivered', icon: Building },
  { metric: '1M+', label: 'Tokens Processed', icon: Code },
  { metric: '94%', label: 'Accuracy Rate', icon: Brain },
  { metric: '2 weeks', label: 'Fastest Deployment', icon: Zap },
];

export default function TrustIndicators() {
  const t = useTranslations('trust');

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green/10 rounded-full blur-3xl" />
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
            {t('title')} <span className="text-orange">{t('subtitle')}</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">{t('description')}</p>
        </motion.div>

        {/* Trust Factors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {trustFactors.map((factor, index) => {
            const Icon = factor.icon;
            return (
              <motion.div
                key={factor.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6
                  transition-all duration-300 hover:border-orange/50 hover:shadow-xl hover:scale-[1.02]"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${factor.gradient} mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {t(`factors.${factor.key}.title`)}
                </h3>
                <p className="text-white/70 text-sm">{t(`factors.${factor.key}.description`)}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Real Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-orange/20 to-green/20 rounded-2xl p-8 md:p-12 border border-white/10 mb-20"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-white">
            {t('achievements.title')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-orange" />
                  <div
                    className="inline-block px-4 py-2 mb-2 text-2xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                  >
                    {achievement.metric}
                  </div>
                  <div className="text-sm text-white/70">{achievement.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Technology Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold mb-8 text-white">{t('partners.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {techPartners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6 h-24 flex items-center justify-center
                  hover:bg-white/10 hover:border-orange/30 transition-all duration-300 group"
              >
                <span className="text-white/70 font-medium text-sm group-hover:text-orange transition-colors">
                  {partner.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security & Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-6 flex-wrap justify-center">
            <div className="flex items-center gap-2 text-white/70">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{t('compliance.gdpr')}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{t('compliance.euAi')}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{t('compliance.iso')}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{t('compliance.soc2')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
