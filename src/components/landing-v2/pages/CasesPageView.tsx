'use client';

import { Fragment, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Btn, Eyebrow, Section } from '@/components/ds';
import { IconArrow } from '@/components/ds/icons';
import { MotionShell } from '@/components/landing-v2/MotionShell';

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

/* Page-local chrome the design system has no class for: the load-in keyframes
   and the 1040px breakpoint where the case rows go single-column and the sticky
   meta column switches off. Mirrors the <style> block in the prototype
   (design_handoff_website_2026/design/Cases.dc.html). */
const PAGE_CSS = `
@keyframes casesWordIn {
  from { opacity: 0; transform: translateY(0.42em); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes casesFadeIn {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}
@media (max-width: 1040px) {
  [data-caserow] { grid-template-columns: 1fr !important; gap: 24px !important; }
  [data-casemeta] { position: static !important; }
}
[data-nomotion] [data-load-in] {
  animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important;
}
@media (prefers-reduced-motion: reduce) {
  [data-load-in] {
    animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important;
  }
}
`;

const revealStyle = (distance = 28, duration = '.85s'): CSSProperties => ({
  opacity: 0,
  transform: `translateY(${distance}px)`,
  transition: `opacity ${duration} var(--ease), transform ${duration} var(--ease)`,
});

const label: CSSProperties = {
  fontSize: 11,
  color: 'var(--fg-mute)',
  letterSpacing: '0.06em',
};

export function CasesPageView({ basePath }: { basePath: string }) {
  const t = useTranslations('redesign.cases');
  const cases = t.raw('list') as CaseItem[];

  const headWords: { text: string; accent?: boolean }[] = [
    ...t('head.title1')
      .split(/\s+/)
      .filter(Boolean)
      .map((text) => ({ text })),
    { text: t('head.titleAccent'), accent: true },
    ...t('head.title2')
      .split(/\s+/)
      .filter(Boolean)
      .map((text) => ({ text })),
  ];

  const ctaLine1 = t('cta.title1').split(/\s+/).filter(Boolean);
  const ctaLine2 = t('cta.title2').split(/\s+/).filter(Boolean);

  return (
    <MotionShell>
      <div className="page">
        <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

        <div className="page-head">
          <div className="grid-bg" data-parallax="0.14" style={{ willChange: 'transform' }} />
          <div
            className="glow"
            data-parallax="0.3"
            style={{
              left: 'calc(50% - 400px)',
              transform: 'translate3d(0,0,0)',
              willChange: 'transform',
            }}
          />
          <div className="container">
            <div className="page-head-inner">
              <div
                className="crumbs"
                data-load-in
                style={{ animation: 'casesFadeIn .6s var(--ease) both' }}
              >
                <span>{t('head.crumb1')}</span>
                <span className="sep">/</span>
                <span className="current">{t('head.crumbCurrent')}</span>
              </div>
              <h1>
                {headWords.map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 ? ' ' : null}
                    <span
                      data-load-in
                      style={{
                        display: 'inline-block',
                        color: w.accent ? 'var(--accent)' : undefined,
                        animation: 'casesWordIn .85s var(--ease) both',
                        animationDelay: `${(0.06 + i * 0.06).toFixed(2)}s`,
                      }}
                    >
                      {w.text}
                    </span>
                  </Fragment>
                ))}
              </h1>
              <p
                data-load-in
                style={{ animation: 'casesFadeIn .8s var(--ease) both', animationDelay: '.4s' }}
              >
                {t('head.lead')}
              </p>
            </div>
          </div>
        </div>

        <Section>
          <div className="cases-stack" data-cases-stack>
            {cases.map((c, i) => (
              <div className="case-row" data-caserow data-reveal key={i} style={revealStyle()}>
                <div
                  className="case-row-meta"
                  data-casemeta
                  style={{ position: 'sticky', top: 96, alignSelf: 'start' }}
                >
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
                    <div className="mono" style={{ ...label, marginBottom: 8 }}>
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
                  <div className="mono" style={{ ...label, marginBottom: 16 }}>
                    {t('labelResult')}
                  </div>
                  <div style={{ display: 'grid', gap: 24 }}>
                    {c.outcomes.map((o, j) => (
                      <div key={j}>
                        <div
                          className="mono"
                          style={{
                            fontSize: 32,
                            color: 'var(--accent)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                          }}
                        >
                          {o.num}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--fg-dim)' }}>
                          {o.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mono"
            data-reveal
            style={{
              ...revealStyle(20, '.8s'),
              marginTop: 48,
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingTop: 32,
              borderTop: '1px dashed var(--line)',
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--fg-mute)',
              letterSpacing: '0.01em',
              maxWidth: '64ch',
            }}
          >
            {t('listFooter')}
          </div>
        </Section>

        <Section>
          <div className="cta-block" data-reveal style={revealStyle(28, '.9s')}>
            <div
              aria-hidden
              data-parallax="-0.05"
              style={{
                position: 'absolute',
                width: 620,
                height: 620,
                top: -320,
                right: -200,
                background: 'radial-gradient(circle, rgba(255,112,20,.18), transparent 60%)',
                filter: 'blur(40px)',
                pointerEvents: 'none',
                willChange: 'transform',
              }}
            />
            <div className="cta-block-inner">
              <Eyebrow>{t('cta.eyebrow')}</Eyebrow>
              <h2 data-words style={{ marginTop: 18 }}>
                {ctaLine1.map((w, i) => (
                  <Fragment key={`a${i}`}>
                    {i > 0 ? ' ' : null}
                    <span data-w>{w}</span>
                  </Fragment>
                ))}
                <br />
                {ctaLine2.map((w, i) => (
                  <Fragment key={`b${i}`}>
                    {i > 0 ? ' ' : null}
                    <span data-w>{w}</span>
                  </Fragment>
                ))}
              </h2>
              <div className="row">
                <span
                  data-mag
                  style={{
                    display: 'inline-flex',
                    willChange: 'transform',
                    transition: 'transform .3s var(--ease)',
                  }}
                >
                  <Btn variant="primary" href={`${basePath}/contact`}>
                    {t('cta.ctaPrimary')} <IconArrow size={14} />
                  </Btn>
                </span>
                <span
                  data-mag
                  style={{
                    display: 'inline-flex',
                    willChange: 'transform',
                    transition: 'transform .3s var(--ease)',
                  }}
                >
                  <Btn variant="ghost" href={`${basePath}/agents`}>
                    {t('cta.ctaGhost')}
                  </Btn>
                </span>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </MotionShell>
  );
}

export default CasesPageView;
