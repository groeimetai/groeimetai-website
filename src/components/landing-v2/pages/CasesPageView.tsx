'use client';

import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import { Btn, Eyebrow, Section } from '@/components/ds';
import { IconArrow } from '@/components/ds/icons';

type Outcome = { num: string; label: string };
type CaseItem = {
  industry: string;
  title: string;
  role: string;
  summary: string;
  stack: string[];
  outcomes: Outcome[];
  why: string;
};

export function CasesPageView({ basePath }: { basePath: string }) {
  useReveal();
  const t = useTranslations('redesign.cases');
  const cases = t.raw('list') as CaseItem[];

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
            <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>{t('head.titleAccent')}</em>{' '}
            {t('head.title2')}
          </h1>
          <p>{t('head.lead')}</p>
        </div>
      </div>

      <Section>
        <div className="cases-stack">
          {cases.map((c, i) => (
            <div className="case-row reveal" key={i}>
              <div className="case-row-meta">
                <div className="case-row-num mono">
                  {t('labelCase')} {String(i + 1).padStart(2, '0')}
                </div>
                <div className="tag" style={{ marginTop: 12 }}>
                  {c.industry}
                </div>
                <div className="case-row-role mono">{c.role}</div>
              </div>
              <div className="case-row-body">
                <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 40px)' }}>{c.title}</h2>
                <p style={{ marginTop: 16, fontSize: 17 }}>{c.summary}</p>
                <div className="q-block" style={{ marginTop: 24 }}>
                  <p className="q-block-text" style={{ fontSize: 18 }}>
                    {c.why}
                  </p>
                </div>
                <div className="case-stack-row">
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: 'var(--fg-mute)',
                      letterSpacing: '0.06em',
                      marginBottom: 8,
                    }}
                  >
                    {t('labelStack')}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {c.stack.map((s, j) => (
                      <span key={j} className="stack-pill mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="case-row-results">
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: 'var(--fg-mute)',
                    letterSpacing: '0.06em',
                    marginBottom: 16,
                  }}
                >
                  {t('labelResult')}
                </div>
                <div style={{ display: 'grid', gap: 24 }}>
                  {c.outcomes.map((o, j) => (
                    <div key={j}>
                      <div
                        className="mono"
                        style={{ fontSize: 32, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}
                      >
                        {o.num}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13, color: 'var(--fg-dim)' }}>{o.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
              <Btn variant="ghost" href={`${basePath}/agents`}>
                {t('cta.ctaGhost')}
              </Btn>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default CasesPageView;
