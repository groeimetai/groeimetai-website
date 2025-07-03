'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, ArrowRight, Heart } from 'lucide-react';

const socialLinks = [
  { icon: Linkedin, href: 'https://linkedin.com/company/groeimetai', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com/groeimetai', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/groeimetai', label: 'GitHub' },
];

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('navigation');
  const year = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: 'GenAI Consultancy', href: '/services/genai-consultancy' },
      { label: 'LLM Integratie', href: '/services/llm-integration' },
      { label: 'RAG Architectuur', href: '/services/rag-architecture' },
      { label: 'ServiceNow AI', href: '/services/servicenow-ai' },
      { label: 'Multi-Agent Systems', href: '/services/multi-agent-orchestration' },
      { label: 'AI Security', href: '/services/ai-security' },
    ],
    company: [
      { label: tNav('about'), href: '/about' },
      { label: tNav('cases'), href: '/cases' },
      { label: tNav('contact'), href: '/contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  };
  return (
    <footer className="bg-black border-t border-white/10">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/groeimet-ai-logo.svg"
                alt="GroeimetAI"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold gradient-text">GroeimetAI</span>
            </Link>
            <p className="text-white/70 mb-6">{t('tagline')}</p>

            {/* Newsletter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-white">{t('newsletter.title')}</h3>
              <div className="flex gap-2">
                <Input type="email" placeholder={t('newsletter.placeholder')} className="flex-1" />
                <Button size="icon" className="hover-lift">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <link.icon className="w-5 h-5 text-orange" />
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">{t('sections.services')}</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover-orange-inline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">{t('sections.company')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover-orange-inline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white">{t('sections.legal')}</h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover-orange-inline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-semibold mb-4 text-white">{t('sections.contact')}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@groeimetai.io" className="hover:text-white transition-colors">
                  info@groeimetai.io
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+31201234567" className="hover:text-white transition-colors">
                  +31 (0)20 123 4567
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Amsterdam, Nederland</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50 text-center md:text-left">
              {t('copyright', { year })}
            </p>
            <p className="text-sm text-white/50 flex items-center gap-1">
              {t('madeWith')} <Heart className="w-4 h-4 text-red-500" /> {t('in')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
