'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function Footer({ basePath = '' }: { basePath?: string }) {
  const t = useTranslations('redesign.footer');

  return (
    <footer className="foot">
      <div className="container">
        <div className="foot-grid">
          <div>
            <div className="nav-brand" style={{ marginBottom: 16 }} aria-label="GroeimetAI">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/groeimet-ai-logo-dark.svg"
                alt="GroeimetAI"
                height={28}
                style={{ height: 28, width: 'auto' }}
              />
            </div>
            <p style={{ maxWidth: '32ch', fontSize: 14, color: 'var(--fg-dim)' }}>{t('tagline')}</p>
            <div style={{ marginTop: 24 }}>
              <a
                href="mailto:info@groeimetai.io"
                style={{ color: 'var(--fg)', fontSize: 14, fontFamily: 'var(--font-mono)' }}
              >
                info@groeimetai.io
              </a>
            </div>
          </div>
          <div>
            <h5>{t('servicesHeading')}</h5>
            <ul>
              <li>
                <Link href={basePath + '/agents'}>{t('agentImplementation')}</Link>
              </li>
              <li>
                <Link href={basePath + '/trainingen'}>{t('trainingen')}</Link>
              </li>
              <li>
                <Link href={basePath + '/trainingen'}>{t('literacy')}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>{t('workHeading')}</h5>
            <ul>
              <li>
                <Link href={basePath + '/cases'}>{t('cases')}</Link>
              </li>
              <li>
                <a href="https://github.com/serac-labs/serac" target="_blank" rel="noopener noreferrer">
                  {t('seracOss')}
                </a>
              </li>
              <li>
                <a href="https://github.com/GroeimetAI" target="_blank" rel="noopener noreferrer">
                  {t('githubOrg')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5>{t('contactHeading')}</h5>
            <ul>
              <li>
                <Link href={basePath + '/about'}>{t('aboutNiels')}</Link>
              </li>
              <li>
                <Link href={basePath + '/contact'}>{t('planCall')}</Link>
              </li>
              <li>
                <a href="tel:+31681739018">{t('phone')}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <div>{t('copyright')}</div>
          <div>{t('lockinLine')}</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
