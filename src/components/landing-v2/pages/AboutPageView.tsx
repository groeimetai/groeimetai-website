'use client';

import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import { Btn, Eyebrow, Section, Numbered } from '@/components/ds';
import { IconArrow } from '@/components/ds/icons';

type Belief = { n: string; t: string; d: string };

export function AboutPageView({ basePath }: { basePath: string }) {
  useReveal();
  const t = useTranslations('redesign.about');
  const beliefs = t.raw('beliefs.items') as Belief[];

  return (
    <div className="page">
      <div className="page-head">
        <div className="glow" />
        <div className="container page-head-inner">
          <div className="crumbs">
            <span>{t('head.crumb1')}</span>
            <span className="sep">/</span>
            <span className="current">{t('head.crumbCurrent')}</span>
          </div>
          <h1>
            {t('head.title1')}{' '}
            <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>{t('head.titleAccent')}</em>
            {t('head.title2')}
          </h1>
          <p>{t('head.lead')}</p>
        </div>
      </div>

      <Section>
        <div className="ds-grid-2" style={{ gap: 64, alignItems: 'start' }}>
          <div className="reveal">
            <div className="team-portrait" style={{ aspectRatio: '3/4' }}>
              {t('niels.portraitPlaceholder')}
            </div>
          </div>
          <div className="reveal">
            <Eyebrow>{t('niels.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16, fontSize: 'clamp(32px, 3.6vw, 48px)' }}>
              {t('niels.title1')}
              <br />
              {t('niels.title2')}
            </h2>
            <div
              style={{
                marginTop: 24,
                display: 'grid',
                gap: 18,
                color: 'var(--fg-dim)',
                lineHeight: 1.65,
                fontSize: 16,
              }}
            >
              <p>
                {t('niels.para1Pre')}
                <em style={{ color: 'var(--fg)', fontStyle: 'normal' }}>{t('niels.para1Em1')}</em>
                {t('niels.para1Mid1')}
                <em style={{ color: 'var(--fg)', fontStyle: 'normal' }}>{t('niels.para1Em2')}</em>
                {t('niels.para1Mid2')}
                <em style={{ color: 'var(--fg)', fontStyle: 'normal' }}>{t('niels.para1Em3')}</em>
                {t('niels.para1Post')}
              </p>
              <p>{t('niels.para2')}</p>
              <p>{t('niels.para3')}</p>
            </div>
            <div style={{ marginTop: 32 }}>
              <div className="signature">
                <div className="signature-avatar">N</div>
                <div>
                  <div className="signature-name">{t('niels.signatureName')}</div>
                  <div className="signature-role">{t('niels.signatureRole')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section light>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>{t('beliefs.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>{t('beliefs.title')}</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">{t('beliefs.lead')}</p>
          </div>
        </div>
        <div style={{ marginTop: 32 }} className="reveal">
          {beliefs.map((b) => (
            <Numbered n={b.n} title={b.t} key={b.n}>
              {b.d}
            </Numbered>
          ))}
        </div>
      </Section>

      <Section>
        <div className="ds-grid-2" style={{ gap: 64, alignItems: 'start' }}>
          <div className="reveal">
            <Eyebrow>{t('oss.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>
              {t('oss.title1')}
              <br />
              {t('oss.title2')}
            </h2>
            <p style={{ marginTop: 24 }} className="lead">
              {t('oss.lead')}
            </p>
            <div style={{ marginTop: 32 }}>
              <Btn variant="ghost" href="https://github.com/GroeimetAI">
                {t('oss.ghLabel')} <IconArrow size={14} />
              </Btn>
            </div>
          </div>
          <div className="reveal">
            <div className="card" style={{ padding: 32 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: 16,
                }}
              >
                <div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                    {t('oss.card.owner')}
                  </div>
                  <h3 style={{ marginTop: 4, fontSize: 24 }}>{t('oss.card.repo')}</h3>
                </div>
                <div className="tag">{t('oss.card.license')}</div>
              </div>
              <p style={{ fontSize: 14 }}>{t('oss.card.desc')}</p>
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  gap: 16,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--fg-mute)',
                }}
              >
                <span>{t('oss.card.badge1')}</span>
                <span>{t('oss.card.badge2')}</span>
                <span>{t('oss.card.badge3')}</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section tight>
        <div className="cta-block reveal">
          <div className="cta-block-inner">
            <Eyebrow>{t('cta.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 18 }}>
              {t('cta.title1')}
              <br />
              {t('cta.title2')}
            </h2>
            <div className="row">
              <Btn variant="primary" href={`${basePath}/contact`}>
                {t('cta.ctaPrimary')} <IconArrow size={14} />
              </Btn>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default AboutPageView;
