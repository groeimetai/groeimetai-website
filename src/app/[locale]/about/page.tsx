'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import CompanyTimeline from '@/components/landing/CompanyTimeline';
import {
  Github, ExternalLink, ArrowRight, Phone, Mail, MapPin,
  Code, Users, TrendingUp, Calendar, Target
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function AboutPage() {
  const t = useTranslations('about');

  const stats = [
    { value: '2+', label: t('stats.experience') },
    { value: '1M+', label: t('stats.tokens') },
    { value: '100%', label: t('stats.gdpr') },
    { value: '50K+', label: t('stats.users') },
  ];

  const philosophy = [
    {
      title: t('philosophy.opensource.title'),
      description: t('philosophy.opensource.description'),
      icon: Github
    },
    {
      title: t('philosophy.practical.title'),
      description: t('philosophy.practical.description'),
      icon: Code
    },
    {
      title: t('philosophy.custom.title'),
      description: t('philosophy.custom.description'),
      icon: Target
    },
    {
      title: t('philosophy.pioneers.title'),
      description: t('philosophy.pioneers.description'),
      icon: TrendingUp
    },
    {
      title: t('philosophy.dutch.title'),
      description: t('philosophy.dutch.description'),
      icon: Users
    }
  ];

  const capabilities = [
    {
      title: t('capabilities.mcp.title'),
      description: t('capabilities.mcp.description')
    },
    {
      title: t('capabilities.orchestration.title'),
      description: t('capabilities.orchestration.description')
    },
    {
      title: t('capabilities.context.title'),
      description: t('capabilities.context.description')
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="pt-28 pb-20 sm:pt-32 sm:pb-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Content Column */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-[-0.02em]">
                  {t('title')}{' '}
                  <span
                    className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                    style={{
                      background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                      boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.5)',
                    }}
                  >
                    GroeimetAI
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 mb-4 leading-relaxed">
                  {t('tagline')}
                </p>
                <p className="text-base sm:text-lg text-white/60 max-w-lg mx-auto lg:mx-0">
                  {t('subtitle')}
                </p>
              </motion.div>
            </div>

            {/* Atmospheric Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="sfeer-image sfeer-accent rounded-2xl overflow-hidden"
            >
              <Image
                src="/images/planet-volumes-byU63rK5W2E-unsplash.jpg"
                alt=""
                width={500}
                height={300}
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-black">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-5">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2 group-hover:text-[#FF9F43] transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div className="text-white/50 text-sm">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Atmospheric Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="sfeer-image sfeer-under rounded-2xl overflow-hidden"
            >
              <Image
                src="/images/jelena-lapina-hX8n1lbjNH8-unsplash.jpg"
                alt=""
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <CompanyTimeline />

      {/* What We Do */}
      <section className="py-20 sm:py-28 lg:py-36 relative overflow-hidden bg-black">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('whatWeDo.title')}{' '}
                <span className="text-[#FF9F43]">{t('whatWeDo.highlight')}</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                {t('whatWeDo.subtitle')}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Capabilities */}
              <div className="space-y-5">
                {capabilities.map((capability, index) => (
                  <motion.div
                    key={capability.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    className="bg-white/[0.03] border border-white/10 rounded-xl p-6 sm:p-8 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                  >
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">{capability.title}</h3>
                    <p className="text-white/60 text-base leading-relaxed">{capability.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Atmospheric Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="sfeer-image sticky top-8 rounded-2xl overflow-hidden"
                style={{ height: '420px', maxWidth: '560px' }}
              >
                <Image
                  src="/images/warren-umoh-FC-2ilPSO6A-unsplash.jpg"
                  alt=""
                  width={600}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 sm:py-28 lg:py-36 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('philosophySection.title')}{' '}
                <span className="text-[#FF9F43]">{t('philosophySection.highlight')}</span>
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {philosophy.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="group bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-black">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.02em]">
                <span className="text-[#FF9F43]">{t('contactSection.title')}</span>
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: MapPin, title: t('contactSection.office.title'), content: t('contactSection.office.location') },
                { icon: Mail, title: t('contactSection.email.title'), content: t('contactSection.email.address'), sub: t('contactSection.email.response') },
                { icon: Phone, title: t('contactSection.phone.title'), content: t('contactSection.phone.number'), sub: t('contactSection.phone.hours') },
                { icon: Github, title: t('contactSection.online.title'), content: t('contactSection.online.github'), sub: t('contactSection.online.linkedin') },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="group bg-white/[0.03] border border-white/10 rounded-xl p-6 text-center hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <item.icon className="w-8 h-8 mx-auto mb-4 text-[#FF9F43] transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/70">{item.content}</p>
                  {item.sub && <p className="text-white/50 text-sm mt-1">{item.sub}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 tracking-[-0.02em]">
                  {t('finalCta.title')}{' '}
                  <span
                    className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                    style={{
                      background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                      boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.4)',
                    }}
                  >
                    {t('finalCta.highlight')}
                  </span>
                  ?
                </h2>
                <p className="text-lg sm:text-xl text-white/70 mb-3">
                  {t('finalCta.subtitle')}
                </p>
                <p className="text-base sm:text-lg text-white/60 mb-5">
                  {t('finalCta.warning')}
                </p>
                <p className="text-lg sm:text-xl font-medium text-white mb-8">
                  {t('finalCta.promise')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/agent-readiness">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-14 text-base font-medium px-8 text-white border-0 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                        boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                      }}
                    >
                      <Calendar className="mr-2 w-5 h-5" />
                      {t('finalCta.startAssessment')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>

                  <Link href="/cases">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-14 text-base font-medium px-8 border-white/25 text-white hover:bg-white/10 hover:border-white/40 rounded-lg transition-all duration-300"
                    >
                      <Github className="mr-2 w-5 h-5" />
                      {t('finalCta.viewDemo')}
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/50 text-sm">
                    {t('finalCta.disclaimer')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
