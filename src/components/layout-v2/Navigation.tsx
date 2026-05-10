'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Btn } from '@/components/ds/Btn';
import { IconArrow, IconGithub } from '@/components/ds/icons';

export function Navigation({ basePath = '' }: { basePath?: string }) {
  const pathname = usePathname() ?? '';
  const t = useTranslations('redesign.nav');
  const [open, setOpen] = useState(false);

  // Close menu when pathname changes (after navigation)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const items: { href: string; label: string }[] = [
    { href: '/', label: t('home') },
    { href: '/agents', label: t('agents') },
    { href: '/trainingen', label: t('trainingen') },
    { href: '/cases', label: t('cases') },
    { href: '/about', label: t('about') },
  ];

  const isActive = (href: string) => {
    const full = basePath + href;
    if (href === '/') {
      return pathname === full || pathname === basePath;
    }
    return pathname.includes(full);
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href={basePath || '/'} className="nav-brand" aria-label="GroeimetAI">
          {/* Wide logo on desktop, square icon on mobile — swapped via CSS */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="nav-brand-wide"
            src="/groeimet-ai-logo-dark.svg"
            alt="GroeimetAI"
            height={28}
            style={{ height: 28, width: 'auto' }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="nav-brand-icon"
            src="/gecentreerd-logo-dark.svg"
            alt="GroeimetAI"
            height={32}
            width={32}
            style={{ height: 32, width: 32 }}
          />
        </Link>

        <div className="nav-links">
          {items.map((n) => (
            <Link
              key={n.href}
              href={basePath + n.href}
              className={isActive(n.href) ? 'active' : ''}
              style={{ cursor: 'pointer' }}
            >
              {n.label}
            </Link>
          ))}
        </div>

        <div className="nav-cta">
          <Btn
            variant="ghost"
            href="https://github.com/serac-labs/serac"
            style={{ padding: '8px 14px', fontSize: 13 }}
          >
            <IconGithub size={14} /> {t('github')}
          </Btn>
          <Btn
            variant="primary"
            href={basePath + '/contact'}
            style={{ padding: '9px 16px', fontSize: 13 } as React.CSSProperties}
          >
            {t('contact')} <IconArrow size={12} />
          </Btn>
        </div>

        <button
          type="button"
          className="nav-mobile-toggle"
          aria-label={open ? 'Sluit menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="ds-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-mobile-bars" data-open={open ? 'true' : 'false'}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        id="ds-mobile-menu"
        className={'nav-mobile-menu' + (open ? ' open' : '')}
        aria-hidden={!open}
      >
        <div className="nav-mobile-links">
          {items.map((n) => (
            <Link
              key={n.href}
              href={basePath + n.href}
              className={isActive(n.href) ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </Link>
          ))}
        </div>
        <div className="nav-mobile-cta">
          <Btn
            variant="ghost"
            href="https://github.com/serac-labs/serac"
            style={{ width: '100%' }}
          >
            <IconGithub size={14} /> {t('github')}
          </Btn>
          <Btn
            variant="primary"
            href={basePath + '/contact'}
            style={{ width: '100%' }}
            onClick={() => setOpen(false)}
          >
            {t('contact')} <IconArrow size={12} />
          </Btn>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
