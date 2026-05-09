'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Btn } from '@/components/ds/Btn';
import { LogoMark, IconArrow, IconGithub } from '@/components/ds/icons';

export function Navigation({ basePath = '' }: { basePath?: string }) {
  const pathname = usePathname() ?? '';
  const t = useTranslations('redesign.nav');

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
        <Link href={basePath || '/'} className="nav-brand" style={{ cursor: 'pointer' }}>
          <LogoMark size={32} />
          <span>GroeimetAI</span>
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
            href="https://github.com/GroeimetAI/serac"
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
      </div>
    </nav>
  );
}

export default Navigation;
