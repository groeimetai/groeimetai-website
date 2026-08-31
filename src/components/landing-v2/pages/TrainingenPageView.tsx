'use client';

import { Fragment, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Btn, Eyebrow, Section, DsLink } from '@/components/ds';
import { IconArrow, IconBook, IconCompass, IconUsers, IconWrench } from '@/components/ds/icons';
import { FAQ, type FAQItem } from '@/components/landing-v2/FAQ';
import { MotionShell } from '@/components/landing-v2/MotionShell';

type Training = {
  tag: string;
  duration: string;
  level: string;
  title: string;
  desc: string;
  bullets: string[];
};

const FEATURE_GLYPHS = [IconWrench, IconBook, IconCompass, IconUsers];

/**
 * Start state for a `[data-reveal]` element. The motion loop animates it to
 * `opacity: 1 / transform: none` when it enters the viewport, so the copy is
 * always in the server-rendered HTML — only its opacity is animated.
 */
function revealFrom(delay = 0, dy = 24, dur = 0.8): CSSProperties {
  return {
    opacity: 0,
    transform: `translateY(${dy}px)`,
    transition: `opacity ${dur}s var(--ease) ${delay}s, transform ${dur}s var(--ease) ${delay}s`,
  };
}

/**
 * The h1 as individual words, so they can fade up one by one. The accent word
 * comes from its own key; a `title2` that is nothing but punctuation (EN: ".")
 * is glued to it rather than floating off as a separate word.
 */
function headWords(title1: string, accent: string, title2: string) {
  const split = (s: string) => s.trim().split(/\s+/).filter(Boolean);
  const rest = title2.trim();
  // A `title2` that is only punctuation (EN: ".") belongs to the accent word,
  // not on its own line — but it stays in the foreground colour.
  const glued = /^[.,!?;:…]+$/.test(rest);
  const words: { text: string; accent?: boolean; punct?: string }[] = split(title1).map((text) => ({
    text,
  }));
  words.push({ text: accent, accent: true, ...(glued ? { punct: rest } : null) });
  if (!glued && rest) words.push(...split(rest).map((text) => ({ text })));
  return words;
}

export function TrainingenPageView({ basePath }: { basePath: string }) {
  const t = useTranslations('redesign.trainingen');
  const trainingen = t.raw('list') as Training[];
  const faqItems = t.raw('faq.items') as FAQItem[];
  const title = headWords(t('head.title1'), t('head.titleAccent'), t('head.title2'));
  const featureTitle = t('features.title').split(/\s+/).filter(Boolean);

  return (
    <MotionShell>
      <div className="page">
        {/* ---------- Page head ---------- */}
        <div className="page-head">
          <div
            className="grid-bg"
            data-parallax="0.14"
            aria-hidden
            style={{ willChange: 'transform' }}
          />
          {/* The glow keeps its own translateX(-50%) centring, so the parallax
              transform lives on a wrapper instead of overwriting it. */}
          <div
            data-parallax="0.3"
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          >
            <div className="glow" />
          </div>

          <div className="container">
            <div className="page-head-inner">
              <div className="crumbs" data-reveal style={revealFrom(0, 10, 0.6)}>
                <span>{t('head.crumb1')}</span>
                <span className="sep">/</span>
                <span className="current">{t('head.crumbCurrent')}</span>
              </div>
              <h1>
                {title.map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 ? ' ' : null}
                    <span
                      data-reveal
                      style={{
                        display: 'inline-block',
                        ...(w.accent ? { color: 'var(--accent)' } : null),
                        ...revealFrom(0.06 + i * 0.06, 16, 0.85),
                      }}
                    >
                      {w.text}
                      {w.punct ? <span style={{ color: 'var(--fg)' }}>{w.punct}</span> : null}
                    </span>
                  </Fragment>
                ))}
              </h1>
              <p data-reveal style={revealFrom(0.06 + title.length * 0.06 + 0.08, 16)}>
                {t('head.lead')}
              </p>
            </div>
          </div>
        </div>

        {/* ---------- The three trainings ---------- */}
        <Section>
          {trainingen.map((tr, i) => (
            <div className="training-row" key={i} data-reveal style={revealFrom(0, 26)}>
              <div>
                <div className="tag">{tr.tag}</div>
                <h2 style={{ marginTop: 18, fontSize: 'clamp(28px, 3.2vw, 40px)' }}>{tr.title}</h2>
                <p style={{ marginTop: 14, fontSize: 16 }}>{tr.desc}</p>
                <div className="training-meta mono">
                  <div>{tr.duration}</div>
                  <div>{tr.level}</div>
                </div>
              </div>
              <div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: 'var(--fg-mute)',
                    marginBottom: 14,
                    letterSpacing: '0.06em',
                  }}
                >
                  {t('whatYouLearn')}
                </div>
                <ul className="training-list">
                  {tr.bullets.map((b, j) => (
                    <li key={j}>
                      <span className="check mono" aria-hidden>
                        →
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 24 }}>
                  <DsLink href={`${basePath}/contact`}>{t('moreInfo')}</DsLink>
                </div>
              </div>
            </div>
          ))}
        </Section>

        {/* ---------- In elke training (paper band) ---------- */}
        <div data-band="paper">
          <Section light>
            <div className="sec-head" data-reveal style={revealFrom()}>
              <div>
                <Eyebrow>{t('features.eyebrow')}</Eyebrow>
                <h2 data-words style={{ marginTop: 16 }}>
                  {featureTitle.map((w, i) => (
                    <Fragment key={i}>
                      {i > 0 ? ' ' : null}
                      <span data-w>{w}</span>
                    </Fragment>
                  ))}
                </h2>
              </div>
              <div className="sec-head-right">
                <p className="lead">{t('features.lead')}</p>
              </div>
            </div>
            <div className="ds-grid-4" style={{ marginTop: 38 }}>
              {FEATURE_GLYPHS.map((Glyph, i) => {
                const delay = i * 0.08;
                return (
                  <div
                    className="card"
                    key={i}
                    data-reveal
                    data-tilt
                    style={{
                      padding: 24,
                      gap: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      willChange: 'transform',
                      opacity: 0,
                      transform: 'translateY(26px)',
                      transition:
                        `opacity .75s var(--ease) ${delay}s, transform .75s var(--ease) ${delay}s,` +
                        ' border-color .25s var(--ease), background .25s var(--ease)',
                    }}
                  >
                    <div className="approach-icon" style={{ marginBottom: 4 }}>
                      <Glyph size={22} />
                    </div>
                    <h4 style={{ fontSize: 16, marginTop: 4 }}>{t(`features.f${i + 1}Title`)}</h4>
                    <p style={{ fontSize: 14 }}>{t(`features.f${i + 1}Body`)}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* ---------- FAQ ---------- */}
        <Section>
          {/* rowGap only bites once the grid collapses to one column ≤900px */}
          <div className="ds-grid-2" style={{ columnGap: 80, rowGap: 48 }}>
            <div data-reveal style={revealFrom()}>
              <Eyebrow>{t('faq.eyebrow')}</Eyebrow>
              <h2 style={{ marginTop: 16 }}>{t('faq.title')}</h2>
              <p style={{ marginTop: 18, maxWidth: '40ch' }}>
                {t('faq.fallback')}{' '}
                <a
                  href={`${basePath}/contact`}
                  style={{
                    color: 'var(--accent)',
                    borderBottom: '1px dashed currentColor',
                    paddingBottom: 1,
                    cursor: 'pointer',
                  }}
                >
                  {t('faq.fallbackLink')}
                </a>
              </p>
            </div>
            <div data-reveal style={revealFrom(0.1)}>
              <FAQ items={faqItems} />
            </div>
          </div>
        </Section>

        {/* ---------- CTA ---------- */}
        <Section tight>
          <div className="cta-block" data-reveal style={revealFrom(0, 28, 0.9)}>
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

export default TrainingenPageView;
