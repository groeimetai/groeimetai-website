'use client';

import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import { Btn, Eyebrow, Section, DsLink } from '@/components/ds';
import { IconArrow, IconBook, IconCompass, IconUsers, IconWrench } from '@/components/ds/icons';
import { FAQ, type FAQItem } from '@/components/landing-v2/FAQ';

type Training = {
  tag: string;
  duration: string;
  level: string;
  title: string;
  desc: string;
  bullets: string[];
};

const FEATURE_GLYPHS = [IconWrench, IconBook, IconCompass, IconUsers];

export function TrainingenPageView({ basePath }: { basePath: string }) {
  useReveal();
  const t = useTranslations('redesign.trainingen');
  const trainingen = t.raw('list') as Training[];
  const faqItems = t.raw('faq.items') as FAQItem[];

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
        <div className="reveal" style={{ display: 'grid', gap: 16 }}>
          {trainingen.map((tr, i) => (
            <div className="training-row" key={i}>
              <div className="training-left">
                <div className="tag">{tr.tag}</div>
                <h2 style={{ marginTop: 18, fontSize: 'clamp(28px, 3.2vw, 40px)' }}>{tr.title}</h2>
                <p style={{ marginTop: 14, fontSize: 16 }}>{tr.desc}</p>
                <div className="training-meta mono">
                  <div>{tr.duration}</div>
                  <div>{tr.level}</div>
                </div>
              </div>
              <div className="training-right">
                <div
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--fg-mute)', marginBottom: 14, letterSpacing: '0.06em' }}
                >
                  {t('whatYouLearn')}
                </div>
                <ul className="training-list">
                  {tr.bullets.map((b, j) => (
                    <li key={j}>
                      <span className="check mono">→</span>
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
        </div>
      </Section>

      <Section light>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>{t('features.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>{t('features.title')}</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">{t('features.lead')}</p>
          </div>
        </div>
        <div className="ds-grid-4 reveal">
          {[1, 2, 3, 4].map((i) => {
            const G = FEATURE_GLYPHS[i - 1];
            return (
              <div
                className="card"
                key={i}
                style={{ padding: 24, gap: 12, display: 'flex', flexDirection: 'column' }}
              >
                <div className="approach-icon" style={{ marginBottom: 4 }}>
                  <G size={22} />
                </div>
                <h4 style={{ fontSize: 16, marginTop: 4 }}>{t(`features.f${i}Title`)}</h4>
                <p style={{ fontSize: 14 }}>{t(`features.f${i}Body`)}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="ds-grid-2" style={{ gap: 80 }}>
          <div className="reveal">
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
          <div className="reveal">
            <FAQ items={faqItems} />
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

export default TrainingenPageView;
