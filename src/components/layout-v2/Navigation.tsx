'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Btn } from '@/components/ds/Btn';
import { LogoMark } from '@/components/ds/Brand';
import { IconArrow, IconGithub } from '@/components/ds/icons';

const SOFT_MAG: React.CSSProperties = {
  display: 'inline-flex',
  willChange: 'transform',
  transition: 'transform .5s var(--ease)',
};

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
    <nav className="nav" data-r="nav">
      <div className="nav-inner">
        <Link href={basePath || '/'} className="nav-brand" aria-label="GroeimetAI">
          {/* Inline SVG, not <img>: an image cannot see the page's CSS custom
              properties, which is why the old wordmark rendered black-on-black. */}
          <LogoMark size={28} bracket="var(--fg)" />
          <span
            className="nav-brand-wide"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 17,
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
            }}
          >
            Groeimet<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
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
          {/* data-mag="soft" — the gentle magnet (3.2px pull). At full strength
              the nav pair reads as chasing the cursor. */}
          <span style={SOFT_MAG} data-mag="soft">
            <Btn
              variant="ghost"
              href="https://github.com/serac-labs/serac"
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              <IconGithub size={14} /> {t('github')}
            </Btn>
          </span>
          <span style={SOFT_MAG} data-mag="soft">
            <Btn
              variant="primary"
              href={basePath + '/contact'}
              style={{ padding: '9px 16px', fontSize: 13 } as React.CSSProperties}
            >
              {t('contact')} <IconArrow size={12} />
            </Btn>
          </span>
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
