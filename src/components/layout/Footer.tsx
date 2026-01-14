'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, ExternalLink, Github, Linkedin, Twitter,
  Mail, Phone, MapPin
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const t = useTranslations('footer');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setIsSubscribed(true);
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const footerSections = {
    services: [
      { label: t('services.agentReadiness'), href: '/agent-readiness' },
      { label: t('services.mcpImplementation'), href: '/services' },
      { label: t('services.pilotProjects'), href: '/pilot-intake' },
      { label: t('services.agentMonitoring'), href: '/services' },
      { label: t('services.multiAgentOrchestration'), href: '/services' },
      { label: t('services.legacyBridging'), href: '/services' }
    ],
    resources: [
      { label: t('resources.mcpGuide'), href: '/mcp-guide' },
      { label: t('resources.snowFlowGithub'), href: 'https://github.com/GroeimetAI/snow-flow', external: true },
      { label: t('resources.agentReadinessTest'), href: '/agent-readiness' },
      { label: t('resources.blog'), href: '/blog' },
      { label: t('resources.documentation'), href: '/docs' },
      { label: t('resources.apiStatus'), href: '/status' }
    ],
    developers: [
      { label: t('developers.mcpFormatGuide'), href: '/mcp-guide', external: false },
      { label: t('developers.agentSetup'), href: '/docs', external: false },
      { label: t('developers.apiDocs'), href: '/docs', external: false }
    ],
    company: [
      { label: t('company.about'), href: '/about' },
      { label: t('company.cases'), href: '/cases' },
      { label: t('company.roadmap'), href: '/roadmap' },
      { label: t('company.team'), href: '/team' },
      { label: t('company.contact'), href: '/contact' }
    ],
    support: [
      { label: t('support.clientPortal'), href: '/dashboard' },
      { label: t('support.helpCenter'), href: '/docs' },
      { label: t('support.systemStatus'), href: '/status' },
      { label: t('support.reportIssue'), href: '/contact' },
      { label: t('support.scheduleCall'), href: '/contact' }
    ]
  };

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info - Spans 2 columns like original */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
              <Image
                src="/groeimet-ai-logo.svg"
                alt="GroeimetAI"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div 
                className="h-8"
                style={{ 
                  width: '60px',
                  background: 'linear-gradient(135deg, #F87315, #FF8533)' 
                }}
              ></div>
            </Link>
            <p className="text-white/70 mb-6">
              {t('tagline')}
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-white">{t('newsletter.title')}</h3>
              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('newsletter.placeholder')}
                    className="bg-white/5 border-white/20 text-white flex-1"
                    required
                  />
                  <Button
                    type="submit"
                    className="text-white"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <div className="text-green-400 text-sm">
                  {t('newsletter.subscribedMessage')}
                </div>
              )}
              <p className="text-white/60 text-xs mt-2">
                {t('newsletter.description')}
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center text-white/70">
                <Mail className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                <a href={`mailto:${t('contact.email')}`} className="hover:text-white group relative overflow-hidden transition-colors text-sm">
                  <span className="relative z-10 group-hover:text-orange-500 transition-colors">
                    {t('contact.email')}
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              </div>
              <div className="flex items-center text-white/70">
                <Phone className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                <a href="tel:+31681739018" className="hover:text-white group relative overflow-hidden transition-colors text-sm">
                  <span className="relative z-10 group-hover:text-orange-500 transition-colors">
                    {t('contact.phone')}
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              </div>
              <div className="flex items-center text-white/70 text-sm">
                <MapPin className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                <span>{t('contact.location')}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-white">{t('sections.services')}</h3>
            <ul className="space-y-3">
              {footerSections.services.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors text-sm block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-white">{t('sections.resources')}</h3>
            <ul className="space-y-3">
              {footerSections.resources.map((item, index) => (
                <li key={index}>
                  {item.external ? (
                    <a 
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white transition-colors text-sm flex items-center"
                    >
                      {item.label}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    <Link 
                      href={item.href}
                      className="text-white/70 hover:text-white transition-colors text-sm block relative overflow-hidden group"
                    >
                      <span className="relative z-10 group-hover:text-orange-500 transition-colors">
                        {item.label}
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-white">{t('sections.company')}</h3>
            <ul className="space-y-3">
              {footerSections.company.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors text-sm block relative overflow-hidden group"
                  >
                    <span className="relative z-10 group-hover:text-orange-500 transition-colors">
                      {item.label}
                    </span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Developer Section */}
            <div className="mt-8">
              <h4 className="font-semibold mb-3 text-white/80 text-sm">{t('sections.developers')}</h4>
              <ul className="space-y-2">
                {footerSections.developers.map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={item.href}
                      className="text-white/60 hover:text-orange-500 transition-colors text-xs block relative overflow-hidden group"
                    >
                      <span className="relative z-10 transition-colors">
                        {item.label}
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section with CTA */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              {t('cta.title').includes('Agent Season') ? (
                <>
                  {t('cta.title').split('Agent Season')[0]}
                  <span style={{ color: '#F87315' }}>Agent Season</span>
                  {t('cta.title').split('Agent Season')[1]}
                </>
              ) : (
                t('cta.title')
              )}
            </h3>
            <p className="text-white/70 mb-6">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agent-readiness">
                <Button
                  size="lg"
                  className="text-white font-semibold"
                  style={{ backgroundColor: '#F87315' }}
                >
                  {t('cta.startAssessment')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {t('cta.planCall')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-8">
            <a
              href="https://linkedin.com/company/groeimetai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="https://github.com/GroeimetAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://twitter.com/groeimetai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="border-t border-white/10 pt-6"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6 text-white/60 text-sm">
              <span>{t('copyright')}</span>
              <div className="flex space-x-4">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t('legal.privacy')}
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t('legal.terms')}
                </Link>
                <Link href="/cookies" className="hover:text-white transition-colors">
                  {t('legal.cookies')}
                </Link>
                <Link href="/status" className="hover:text-white transition-colors">
                  {t('legal.status')}
                </Link>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6 text-white/60 text-sm mt-4 lg:mt-0">
              <span>{t('taglines.agentReady')}</span>
              <span>{t('taglines.openSource')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}