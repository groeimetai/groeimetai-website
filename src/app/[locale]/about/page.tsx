'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CompanyTimeline from '@/components/landing/CompanyTimeline';
import { 
  Github, ExternalLink, ArrowRight, CheckCircle, Phone, Mail, MapPin,
  Code, Users, TrendingUp, Calendar, FileText, Brain, Shield, Globe,
  Award, Target
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
      <section className="py-32 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Content Column */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  {t('title')}{' '}
                  <span
                    className="text-white px-4 py-2 inline-block"
                    style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
                  >
                    GroeimetAI
                  </span>
                </h1>
                <p className="text-xl text-white/80 max-w-4xl mx-auto lg:mx-0 mb-4">
                  {t('tagline')}
                </p>
                <p className="text-lg text-white/60 max-w-3xl mx-auto lg:mx-0 mb-8">
                  {t('subtitle')}
                </p>
              </motion.div>
            </div>
            
            {/* Subtle Atmospheric Image */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
className="sfeer-image sfeer-accent"
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
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative overflow-hidden bg-black">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Subtle Atmospheric Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sfeer-image sfeer-under"
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

      {/* Company Timeline - Compact */}
      <CompanyTimeline />

      {/* What We Do */}
      <section className="py-20 relative overflow-hidden bg-black">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Wat We <span style={{ color: '#F87315' }}>Doen</span>
              </h2>
              <p className="text-xl text-white/70 max-w-4xl mx-auto">
                We maken bedrijven klaar voor de agent economie door:
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Capabilities */}
              <div className="space-y-8">
                {capabilities.map((capability, index) => (
                  <motion.div
                    key={capability.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-8"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">{capability.title}</h3>
                    <p className="text-white/80 text-lg leading-relaxed">{capability.description}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Subtle Atmospheric Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="sfeer-image sticky top-8" style={{ height: '396px', maxWidth: '528px' }}
              >
                <Image
                  src="/images/warren-umoh-FC-2ilPSO6A-unsplash.jpg"
                  alt=""
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Onze <span style={{ color: '#F87315' }}>Filosofie</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {philosophy.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 relative overflow-hidden bg-black">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                <span style={{ color: '#F87315' }}>Contact</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
              >
                <MapPin className="w-8 h-8 mx-auto mb-4" style={{ color: '#F87315' }} />
                <h3 className="text-lg font-bold text-white mb-3">Hoofdkantoor</h3>
                <p className="text-white/80">Apeldoorn, Nederland</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
              >
                <Mail className="w-8 h-8 mx-auto mb-4" style={{ color: '#F87315' }} />
                <h3 className="text-lg font-bold text-white mb-3">Email</h3>
                <p className="text-white/80 mb-2">info@groeimetai.io</p>
                <p className="text-white/60 text-sm">Respons binnen 24 uur</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
              >
                <Phone className="w-8 h-8 mx-auto mb-4" style={{ color: '#F87315' }} />
                <h3 className="text-lg font-bold text-white mb-3">Telefoon</h3>
                <p className="text-white/80 mb-2">+31 (6) 81 739 018</p>
                <p className="text-white/60 text-sm">Ma-Vr 9:00-18:00</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
              >
                <Github className="w-8 h-8 mx-auto mb-4" style={{ color: '#F87315' }} />
                <h3 className="text-lg font-bold text-white mb-3">Online</h3>
                <p className="text-white/80 mb-1">GitHub: @GroeimetAI</p>
                <p className="text-white/80">LinkedIn: GroeimetAI</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-8 lg:p-12 max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready voor{' '}
                  <span
                    className="text-white px-4 py-2 inline-block"
                    style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
                  >
                    Agent Season
                  </span>
                  ?
                </h2>
                <p className="text-xl text-white/80 mb-4">
                  De agent economie wacht niet.
                </p>
                <p className="text-lg text-white/70 mb-6">
                  Bedrijven die nu niet voorbereiden, missen de boot.
                </p>
                <p className="text-xl font-bold text-white mb-8">
                  Wij helpen je aan boord.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/agent-readiness">
                    <Button
                      size="lg"
                      className="text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                      style={{ 
                        backgroundColor: '#F87315',
                        boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
                      }}
                    >
                      <Calendar className="mr-2 w-5 h-5" />
                      Start Agent Assessment
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  
                  <Link href="/cases">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                    >
                      <Github className="mr-2 w-5 h-5" />
                      Bekijk Snow-flow Demo
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    Elk gesprek start met een gratis assessment - geen verplichtingen
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