'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Award, Users, Target, Lightbulb, Building, Globe } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  const stats = [
    { value: '50+', label: t('stats.projects') },
    { value: '98%', label: t('stats.satisfaction') },
    { value: '15+', label: t('stats.experts') },
    { value: '24/7', label: t('stats.support') },
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

  const teamMembers = [
    {
      name: t('team.members.sarah.name'),
      role: t('team.members.sarah.role'),
      expertise: t('team.members.sarah.expertise'),
      bio: t('team.members.sarah.bio'),
    },
    {
      name: t('team.members.mark.name'),
      role: t('team.members.mark.role'),
      expertise: t('team.members.mark.expertise'),
      bio: t('team.members.mark.bio'),
    },
    {
      name: t('team.members.emma.name'),
      role: t('team.members.emma.role'),
      expertise: t('team.members.emma.expertise'),
      bio: t('team.members.emma.bio'),
    },
    {
      name: t('team.members.tom.name'),
      role: t('team.members.tom.role'),
      expertise: t('team.members.tom.expertise'),
      bio: t('team.members.tom.bio'),
    },
  ];

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-green/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white px-8 py-4 inline-block relative" 
                style={{background: 'linear-gradient(135deg, #FF6600, #FF8833)'}}>
              {t('hero.title')}
            </h1>
            <p className="text-xl text-white/80 mb-8">
              {t('hero.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex flex-col items-center p-6 hover:scale-105 transition-transform" 
                     style={{background: 'linear-gradient(135deg, #FF6600, #FF8833)'}}>
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
                <p className="text-white/70">
                  {t('mission.description')}
                </p>
              </Card>
              <Card className="p-8 hover-lift">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-primary" />
                  {t('vision.title')}
                </h2>
                <p className="text-white/70">
                  {t('vision.description')}
                </p>
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

      {/* Team */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              {t('team.title')}
            </h2>
            <p className="text-xl text-white/70 text-center mb-12 max-w-3xl mx-auto">
              {t('team.subtitle')}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="p-6 hover-lift">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-sm font-medium text-white/70 mb-3">{member.expertise}</p>
                  <p className="text-sm text-white/70">{member.bio}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('partners.title')}
            </h2>
            <p className="text-xl text-white/70 mb-12">
              {t('partners.subtitle')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-white/70 mb-8">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="shadow-premium hover-lift">
                  {t('cta.contactButton')}
                </Button>
              </Link>
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