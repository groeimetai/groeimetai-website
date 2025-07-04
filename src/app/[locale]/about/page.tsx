'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { StartProjectButton } from '@/components/ui/StartProjectButton';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { Award, Users, Target, Lightbulb, Building, Globe, Cloud } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  const stats = [
    { value: '€2.8M+', label: t('stats.savedAnnually') },
    { value: '1500+', label: t('stats.hoursProcessed') },
    { value: '94%', label: t('stats.accuracy') },
    { value: '2 weeks', label: t('stats.deliveryTime') },
  ];

  const values = [
    {
      icon: Lightbulb,
      title: t('values.items.innovation.title'),
      description: t('values.items.innovation.description'),
    },
    {
      icon: Users,
      title: t('values.items.collaboration.title'),
      description: t('values.items.collaboration.description'),
    },
    {
      icon: Target,
      title: t('values.items.results.title'),
      description: t('values.items.results.description'),
    },
    {
      icon: Award,
      title: t('values.items.excellence.title'),
      description: t('values.items.excellence.description'),
    },
  ];

  const techPartners = [
    {
      name: 'Google Cloud Platform',
      category: t('partners.categories.cloud'),
      description: t('partners.descriptions.gcp'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Anthropic Claude',
      category: t('partners.categories.ai'),
      description: t('partners.descriptions.anthropic'),
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'AssemblyAI',
      category: t('partners.categories.speech'),
      description: t('partners.descriptions.assemblyai'),
      color: 'from-red-500 to-red-600',
    },
    {
      name: 'LangChain',
      category: t('partners.categories.framework'),
      description: t('partners.descriptions.langchain'),
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Hugging Face',
      category: t('partners.categories.models'),
      description: t('partners.descriptions.huggingface'),
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      name: 'ServiceNow',
      category: t('partners.categories.enterprise'),
      description: t('partners.descriptions.servicenow'),
      color: 'from-teal-500 to-teal-600',
    },
    {
      name: 'OpenAI',
      category: t('partners.categories.ai'),
      description: t('partners.descriptions.openai'),
      color: 'from-gray-600 to-gray-700',
    },
    {
      name: 'Pinecone',
      category: t('partners.categories.vector'),
      description: t('partners.descriptions.pinecone'),
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-green/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white px-8 py-4 inline-block relative"
              style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
            >
              {t('hero.title')}
            </h1>
            <p className="text-xl text-white/80 mb-8">{t('hero.description')}</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="inline-flex flex-col items-center p-6 hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                >
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/90 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="p-8 hover-lift">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  {t('mission.title')}
                </h2>
                <p className="text-white/70">{t('mission.description')}</p>
              </Card>
              <Card className="p-8 hover-lift">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-primary" />
                  {t('vision.title')}
                </h2>
                <p className="text-white/70">{t('vision.description')}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {t('values.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-white/70">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              {t('partners.title')}
            </h2>
            <p className="text-xl text-white/70 text-center mb-12 max-w-3xl mx-auto">
              {t('partners.subtitle')}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {techPartners.map((partner, index) => (
                <Card
                  key={index}
                  className="p-6 hover-lift transition-all duration-300 hover:border-orange/50"
                >
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${partner.color} mb-4 flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-2xl">{partner.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{partner.name}</h3>
                  <p className="text-sm text-primary mb-2">{partner.category}</p>
                  <p className="text-sm text-white/70">{partner.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-xl text-white/70 mb-8">{t('cta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <StartProjectButton size="lg" className="shadow-premium hover-lift">
                {t('cta.contactButton')}
              </StartProjectButton>
              <Link href="/services">
                <Button size="lg" variant="outline" className="hover-lift">
                  {t('cta.servicesButton')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
