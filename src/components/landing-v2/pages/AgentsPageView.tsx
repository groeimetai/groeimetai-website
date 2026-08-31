'use client';

import { Fragment, useEffect, useState, type CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { MotionShell } from '@/components/landing-v2/MotionShell';
import { Btn, Eyebrow, Section } from '@/components/ds';
import { IconArrow, IconFolder, IconInstructions, IconTool } from '@/components/ds/icons';

/** WebGL only — never renders on the server, so the copy around it stays server-rendered. */
const MorphObject = dynamic(
  () => import('@/components/landing-v2/MorphObject').then((m) => ({ default: m.MorphObject })),
  { ssr: false }
);

const EASE = 'var(--ease)';

/**
 * Start state for a `[data-reveal]` element. The motion loop clears opacity and
 * transform when it enters the viewport; the content itself is always rendered.
 */
function reveal(dy = 24, dur = 0.8, delay = 0): CSSProperties {
  return {
    opacity: 0,
    transform: `translateY(${dy}px)`,
    transition: `opacity ${dur}s ${EASE}, transform ${dur}s ${EASE}`,
    ...(delay ? { transitionDelay: `${delay}s` } : null),
  };
}

/** Magnetic-hover wrapper — the loop needs its own transform to push around. */
const MAG: CSSProperties = {
  display: 'inline-flex',
  willChange: 'transform',
  transition: `transform .3s ${EASE}`,
};

const MODEL_CARDS = [
  { key: 'card1', icon: <IconFolder size={22} /> },
  { key: 'card2', icon: <IconInstructions size={22} /> },
  { key: 'card3', icon: <IconTool size={22} /> },
];

/** Split a translated line into per-word spans, keeping the spaces as real text. */
function words(line: string) {
  return line.split(' ').filter(Boolean);
}

export function AgentsPageView({ basePath }: { basePath: string }) {
  const t = useTranslations('redesign.agents');

  // The ambient object bleeds off the right edge of the two-column band. Below
  // ~1000px that column is gone and it would wash out the copy it sits behind.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1001px)');
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const headWords: { w: string; accent?: boolean }[] = [
    ...words(t('head.title1')).map((w) => ({ w })),
    { w: t('head.titleAccent'), accent: true },
    ...words(t('head.title2')).map((w) => ({ w })),
  ];

  return (
    <MotionShell>
      <div className="page">
        <div className="page-head" style={{ padding: '88px 0 56px' }}>
          <div className="grid-bg" data-parallax="0.14" style={{ willChange: 'transform' }} />
          <div
            aria-hidden
            data-parallax="0.3"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', willChange: 'transform' }}
          >
            <div className="glow" />
          </div>
          <div className="container">
            <div className="page-head-inner">
              <div className="crumbs" data-reveal style={reveal(14, 0.6)}>
                <span>{t('head.crumb1')}</span>
                <span className="sep">/</span>
                <span className="current">{t('head.crumbCurrent')}</span>
              </div>
              <h1>
                {headWords.map((word, i) => (
                  <Fragment key={i}>
                    {i > 0 ? ' ' : null}
                    <span
                      data-reveal
                      style={{
                        display: 'inline-block',
                        color: word.accent ? 'var(--accent)' : undefined,
                        opacity: 0,
                        transform: 'translateY(0.42em)',
                        transition: `opacity .85s ${EASE}, transform .85s ${EASE}`,
                        transitionDelay: `${(0.06 + i * 0.06).toFixed(2)}s`,
                      }}
                    >
                      {word.w}
                    </span>
                  </Fragment>
                ))}
              </h1>
              <p data-reveal style={reveal(18, 0.8, 0.4)}>
                {t('head.lead')}
              </p>
            </div>
          </div>
        </div>

        <section className="section" style={{ overflow: 'hidden' }}>
          <div
            data-r="modelObj"
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%',
              right: '-6%',
              width: '46%',
              height: '120%',
              transform: 'translateY(-50%)',
              opacity: 0.28,
              pointerEvents: 'none',
              zIndex: 0,
              display: wide ? 'block' : 'none',
            }}
          >
            {wide ? <MorphObject variant="ambient" /> : null}
          </div>
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div className="sec-head" data-reveal style={reveal(24)}>
              <div>
                <Eyebrow>{t('model.eyebrow')}</Eyebrow>
                <h2 data-words style={{ marginTop: 16 }}>
                  {words(t('model.title1')).map((w, i) => (
                    <Fragment key={`t1-${i}`}>
                      {i > 0 ? ' ' : null}
                      <span data-w>{w}</span>
                    </Fragment>
                  ))}
                  <br />
                  {words(t('model.title2')).map((w, i) => (
                    <Fragment key={`t2-${i}`}>
                      {i > 0 ? ' ' : null}
                      <span data-w>{w}</span>
                    </Fragment>
                  ))}
                </h2>
              </div>
              <div className="sec-head-right">
                <p className="lead">{t('model.lead')}</p>
              </div>
            </div>
            <div className="approach-grid">
              {MODEL_CARDS.map((c) => (
                <div
                  className="approach-card"
                  key={c.key}
                  data-reveal
                  data-tilt
                  style={{ ...reveal(28), willChange: 'transform' }}
                >
                  <div className="approach-icon">{c.icon}</div>
                  <div className="num">{t(`model.${c.key}Num`)}</div>
                  <h4>{t(`model.${c.key}Title`)}</h4>
                  <p>{t(`model.${c.key}Body`)}</p>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 8 }}>
                    {t(`model.${c.key}Hint`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div data-band="paper">
          <Section light>
            <div className="sec-head" data-reveal style={reveal(24)}>
              <div>
                <Eyebrow>{t('process.eyebrow')}</Eyebrow>
                <h2 style={{ marginTop: 16 }}>{t('process.title')}</h2>
              </div>
              <div className="sec-head-right">
                <p className="lead">{t('process.lead')}</p>
              </div>
            </div>
            <div className="steps" style={{ marginTop: 32 }}>
              {[1, 2, 3, 4].map((n, i) => (
                <div className="step" key={n} data-reveal style={reveal(22, 0.7, i * 0.1)}>
                  <div className="step-n">{t(`process.step${n}N`)}</div>
                  <h4>{t(`process.step${n}Title`)}</h4>
                  <p>{t(`process.step${n}Body`)}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section>
          <div className="ds-grid-2" style={{ gap: 80 }}>
            <div data-reveal style={reveal(24)}>
              <Eyebrow>{t('boundaries.eyebrow')}</Eyebrow>
              <h2 style={{ marginTop: 16 }}>{t('boundaries.title')}</h2>
              <p className="lead" style={{ marginTop: 20 }}>
                {t('boundaries.lead')}
              </p>
            </div>
            <div data-reveal style={reveal(24, 0.8, 0.1)}>
              <div className="checklist">
                {[1, 2, 3, 4].map((i) => (
                  <div className="checklist-item" key={i}>
                    <span className="x">×</span>
                    <div>
                      <strong style={{ color: 'var(--fg)', fontWeight: 500 }}>
                        {t(`boundaries.item${i}Bold`)}
                      </strong>
                      {t(`boundaries.item${i}Rest`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="cta-block" data-reveal style={reveal(28, 0.9)}>
            <div
              className="glow"
              aria-hidden
              data-parallax="-0.05"
              style={{ top: -340, right: -220, willChange: 'transform' }}
            />
            <div className="cta-block-inner">
              <Eyebrow>{t('cta.eyebrow')}</Eyebrow>
              <h2 style={{ marginTop: 18 }}>
                {t('cta.title1')}
                <br />
                {t('cta.title2')}
              </h2>
              <div className="row">
                <span data-mag style={MAG}>
                  <Btn variant="primary" href={`${basePath}/contact`}>
                    {t('cta.ctaPrimary')} <IconArrow size={14} />
                  </Btn>
                </span>
                <span data-mag style={MAG}>
                  <Btn variant="ghost" href={`${basePath}/cases`}>
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

export default AgentsPageView;
