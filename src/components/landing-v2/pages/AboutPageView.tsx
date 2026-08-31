'use client';

import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { MotionShell } from '@/components/landing-v2/MotionShell';
import { Btn, Eyebrow, Section, Tag, LogoMark } from '@/components/ds';
import { IconArrow } from '@/components/ds/icons';

type Belief = { n: string; t: string; d: string };

/**
 * Scroll-reveal start state. The motion loop (`useSiteMotion`, via `MotionShell`)
 * finds every `[data-reveal]` and writes `opacity: 1; transform: none` when it
 * enters — so the copy is always in the server-rendered HTML and only the
 * presentation animates.
 */
const rise = (delay = 0, dy = 24, dur = 0.8): CSSProperties => ({
  opacity: 0,
  transform: `translateY(${dy}px)`,
  transition: `opacity ${dur}s var(--ease) ${delay}s, transform ${dur}s var(--ease) ${delay}s`,
});

type HeadWord = { text: string; accent?: boolean; glue?: boolean };

/**
 * Splits the h1 into per-word spans so it can rise in word by word on load.
 * `post` starts with punctuation (". Met opzet.") which has to stay welded to
 * the accent word, hence the `glue` flag rather than a plain join on spaces.
 */
function headWords(pre: string, accent: string, post: string): HeadWord[] {
  const out: HeadWord[] = [];
  for (const w of pre.trim().split(/\s+/).filter(Boolean)) out.push({ text: w });
  out.push({ text: accent, accent: true });
  const glueFirst = /^\S/.test(post);
  post
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .forEach((w, i) => out.push({ text: w, glue: i === 0 && glueFirst }));
  return out;
}

export function AboutPageView({ basePath }: { basePath: string }) {
  const t = useTranslations('redesign.about');
  const beliefs = t.raw('beliefs.items') as Belief[];
  const title = headWords(t('head.title1'), t('head.titleAccent'), t('head.title2'));
  const beliefsTitle = t('beliefs.title').split(/\s+/).filter(Boolean);

  return (
    <MotionShell>
      <div className="page">
        <div className="page-head">
          <div className="grid-bg" data-parallax="0.14" style={{ willChange: 'transform' }} />
          <div
            aria-hidden
            data-parallax="0.3"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          >
            <div className="glow" />
          </div>
          <div className="container page-head-inner">
            <div className="crumbs" data-reveal style={rise(0, 12, 0.6)}>
              <span>{t('head.crumb1')}</span>
              <span className="sep">/</span>
              <span className="current">{t('head.crumbCurrent')}</span>
            </div>
            <h1>
              {title.map((w, i) => (
                <Fragment key={`${w.text}-${i}`}>
                  {i > 0 && !w.glue ? ' ' : null}
                  <span
                    data-reveal
                    style={{
                      display: 'inline-block',
                      color: w.accent ? 'var(--accent)' : undefined,
                      ...rise(0.06 + i * 0.06, 14, 0.85),
                    }}
                  >
                    {w.text}
                  </span>
                </Fragment>
              ))}
            </h1>
            <p data-reveal style={rise(0.46, 18, 0.8)}>
              {t('head.lead')}
            </p>
          </div>
        </div>

        <Section>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 64 }}>
            <div
              data-reveal
              style={{ flex: '0.8 1 0%', minWidth: 'min(300px, 100%)', ...rise(0, 26, 0.85) }}
            >
              {/* No portrait exists in the repo yet — a framed placeholder in the
                  DS idiom, never a fabricated photo. See `needsOrchestrator`. */}
              <div
                className="team-portrait"
                style={{
                  position: 'sticky',
                  top: 96,
                  aspectRatio: '3 / 4',
                  borderRadius: 'var(--r-lg)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    justifyItems: 'center',
                    gap: 14,
                    padding: 24,
                    textAlign: 'center',
                  }}
                >
                  <LogoMark size={40} />
                  <span>{t('niels.portraitPlaceholder')}</span>
                </div>
              </div>
            </div>
            <div
              data-reveal
              style={{ flex: '1.2 1 0%', minWidth: 'min(300px, 100%)', ...rise(0.1, 26, 0.85) }}
            >
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

        <div data-band="paper">
          <Section light>
            <div className="sec-head" data-reveal style={rise(0, 24, 0.8)}>
              <div>
                <Eyebrow>{t('beliefs.eyebrow')}</Eyebrow>
                <h2 data-words style={{ marginTop: 16 }}>
                  {beliefsTitle.map((w, i) => (
                    <Fragment key={`${w}-${i}`}>
                      {i > 0 ? ' ' : null}
                      <span data-w>{w}</span>
                    </Fragment>
                  ))}
                </h2>
              </div>
              <div className="sec-head-right">
                <p className="lead">{t('beliefs.lead')}</p>
              </div>
            </div>
            <div style={{ marginTop: 32 }}>
              {/* The `.numbered` row markup rather than <Numbered>, because each
                  row needs its own reveal + 70ms stagger and the component takes
                  no extra props — the classes and DOM shape are identical, so
                  `.numbered:last-child` still draws the closing rule. */}
              {beliefs.map((b, i) => (
                <div className="numbered" data-reveal key={b.n} style={rise(i * 0.07, 20, 0.7)}>
                  <div className="numbered-n mono">{b.n}</div>
                  <div className="numbered-body">
                    <h3>{b.t}</h3>
                    <p>{b.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section>
          <div className="ds-grid-2" style={{ gap: 64, alignItems: 'start' }}>
            <div data-reveal style={rise(0, 24, 0.8)}>
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
                <span
                  data-mag
                  style={{
                    display: 'inline-flex',
                    willChange: 'transform',
                    transition: 'transform .3s var(--ease)',
                  }}
                >
                  <Btn variant="ghost" href="https://github.com/GroeimetAI">
                    {t('oss.ghLabel')} <IconArrow size={14} />
                  </Btn>
                </span>
              </div>
            </div>
            <div data-reveal style={rise(0.1, 24, 0.8)}>
              <div data-tilt style={{ willChange: 'transform' }}>
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
                    <Tag>{t('oss.card.license')}</Tag>
                  </div>
                  <p style={{ fontSize: 14 }}>{t('oss.card.desc')}</p>
                  <div
                    className="mono"
                    style={{
                      marginTop: 20,
                      display: 'flex',
                      gap: 16,
                      flexWrap: 'wrap',
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
          </div>
        </Section>

        <Section>
          <div className="cta-block" data-reveal style={rise(0, 28, 0.9)}>
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
              <h2 style={{ marginTop: 18 }}>
                {t('cta.title1')}
                <br />
                {t('cta.title2')}
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
              </div>
            </div>
          </div>
        </Section>
      </div>
    </MotionShell>
  );
}

export default AboutPageView;
