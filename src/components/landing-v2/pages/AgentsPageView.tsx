'use client';

import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import { Btn, Eyebrow, Section } from '@/components/ds';
import { IconArrow, IconFolder, IconInstructions, IconTool } from '@/components/ds/icons';

export function AgentsPageView({ basePath }: { basePath: string }) {
  useReveal();
  const t = useTranslations('redesign.agents');

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
        <div className="sec-head reveal">
          <div>
            <Eyebrow>{t('model.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>
              {t('model.title1')}
              <br />
              {t('model.title2')}
            </h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">{t('model.lead')}</p>
          </div>
        </div>
        <div className="approach-grid reveal">
          {[
            { icon: <IconFolder size={22} />, num: 'card1Num', title: 'card1Title', body: 'card1Body', hint: 'card1Hint' },
            {
              icon: <IconInstructions size={22} />,
              num: 'card2Num',
              title: 'card2Title',
              body: 'card2Body',
              hint: 'card2Hint',
            },
            { icon: <IconTool size={22} />, num: 'card3Num', title: 'card3Title', body: 'card3Body', hint: 'card3Hint' },
          ].map((c, i) => (
            <div className="approach-card" key={i}>
              <div className="approach-icon">{c.icon}</div>
              <div className="num">{t(`model.${c.num}`)}</div>
              <h4>{t(`model.${c.title}`)}</h4>
              <p>{t(`model.${c.body}`)}</p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 8 }}>
                {t(`model.${c.hint}`)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section light>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>{t('process.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>{t('process.title')}</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">{t('process.lead')}</p>
          </div>
        </div>
        <div className="steps reveal">
          {[1, 2, 3, 4].map((i) => (
            <div className="step" key={i}>
              <div className="step-n">{t(`process.step${i}N`)}</div>
              <h4>{t(`process.step${i}Title`)}</h4>
              <p>{t(`process.step${i}Body`)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>{t('trifecta.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>
              {t('trifecta.title1')}{' '}
              <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>{t('trifecta.titleAccent')}</em>
              {t('trifecta.title2')}
            </h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">{t('trifecta.lead')}</p>
          </div>
        </div>
        <div className="approach-grid reveal">
          {[1, 2, 3].map((i) => (
            <div className="approach-card" key={i}>
              <div className="num">{t(`trifecta.card${i}Num`)}</div>
              <h4>{t(`trifecta.card${i}Title`)}</h4>
              <p>{t(`trifecta.card${i}Body`)}</p>
            </div>
          ))}
        </div>
        <div
          className="reveal"
          style={{
            marginTop: 32,
            padding: 24,
            borderLeft: '2px solid var(--accent)',
            background: 'var(--bg-elev)',
            borderRadius: '0 12px 12px 0',
          }}
        >
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>{t('trifecta.footer')}</p>
          <p
            className="mono"
            style={{
              marginTop: 12,
              marginBottom: 0,
              fontSize: 11,
              color: 'var(--fg-mute)',
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {t('trifecta.attribution')}
          </p>
        </div>
      </Section>

      <Section>
        <div className="ds-grid-2" style={{ gap: 80 }}>
          <div className="reveal">
            <Eyebrow>{t('boundaries.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>{t('boundaries.title')}</h2>
            <p style={{ marginTop: 20 }} className="lead">
              {t('boundaries.lead')}
            </p>
          </div>
          <div className="reveal">
            <div className="checklist">
              {[1, 2, 3, 4].map((i) => (
                <div className="checklist-item" key={i}>
                  <span className="x">×</span>
                  <div>
                    <strong style={{ color: 'var(--fg)' }}>{t(`boundaries.item${i}Bold`)}</strong>
                    {t(`boundaries.item${i}Rest`)}
                  </div>
                </div>
              ))}
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
              <Btn variant="ghost" href={`${basePath}/cases`}>
                {t('cta.ctaGhost')}
              </Btn>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default AgentsPageView;
