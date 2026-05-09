'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import { Btn, Eyebrow, Section, PillarCard, CaseCard, LogoBar, Stat, DsLink } from '@/components/ds';
import { IconArrow, IconFolder, IconInstructions, IconTool } from '@/components/ds/icons';
import { AgentAnatomy } from '@/components/landing-v2/AgentAnatomy';

export function HomePageView({ basePath }: { basePath: string }) {
  useReveal();
  const t = useTranslations('redesign.home');

  return (
    <div className="page">
      <section className="hero">
        <div className="grid-bg" />
        <div className="glow" />
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="pill">
                <span className="dot" />
                {t('hero.pill')}
              </div>
              <h1>
                {t('hero.title1')}
                <br />
                {t('hero.title2')}{' '}
                <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>{t('hero.titleAccent')}</em>
              </h1>
              <p className="hero-sub lead">{t('hero.lead')}</p>
              <div className="hero-cta">
                <Btn variant="primary" href={`${basePath}/contact`}>
                  {t('hero.ctaPrimary')} <IconArrow size={14} />
                </Btn>
                <Btn variant="ghost" href={`${basePath}/agents`}>
                  {t('hero.ctaGhost')}
                </Btn>
              </div>
              <div className="hero-meta">
                <div className="hero-meta-item">
                  <span className="icon">●</span> {t('hero.meta1')}
                </div>
                <div className="hero-meta-item">
                  <span className="icon">●</span> {t('hero.meta2')}
                </div>
                <div className="hero-meta-item">
                  <span className="icon">●</span> {t('hero.meta3')}
                </div>
              </div>
            </div>
            <div>
              <AgentAnatomy />
            </div>
          </div>
        </div>
      </section>

      <section className="section tight" style={{ paddingTop: 24, paddingBottom: 32 }}>
        <div className="container">
          <div className="divider-mono">{t('logoBarLabel')}</div>
          <LogoBar />
        </div>
      </section>

      <Section id="problem">
        <div className="sec-head reveal">
          <div>
            <Eyebrow>{t('problem.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>
              {t('problem.title1')}
              <br />
              {t('problem.title2')}
            </h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">{t('problem.lead')}</p>
          </div>
        </div>
        <div className="ds-grid-3 reveal">
          {[1, 2, 3].map((i) => (
            <div className="card" key={i}>
              <div className="tag">{t(`problem.card${i}Tag`)}</div>
              <h3 style={{ marginTop: 16 }}>{t(`problem.card${i}Title`)}</h3>
              <p style={{ marginTop: 12 }}>{t(`problem.card${i}Body`)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="pillars" light>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>{t('pillars.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>{t('pillars.title')}</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">{t('pillars.lead')}</p>
          </div>
        </div>
        <div className="ds-grid-3 reveal">
          <Link href={`${basePath}/trainingen`} style={{ textDecoration: 'none' }}>
            <PillarCard
              tag={t('pillars.p1Tag')}
              title={t('pillars.p1Title')}
              desc={t('pillars.p1Desc')}
              items={t.raw('pillars.p1Items') as string[]}
            />
          </Link>
          <Link href={`${basePath}/agents`} style={{ textDecoration: 'none' }}>
            <PillarCard
              tag={t('pillars.p2Tag')}
              title={t('pillars.p2Title')}
              desc={t('pillars.p2Desc')}
              items={t.raw('pillars.p2Items') as string[]}
            />
          </Link>
          <Link href={`${basePath}/trainingen`} style={{ textDecoration: 'none' }}>
            <PillarCard
              tag={t('pillars.p3Tag')}
              title={t('pillars.p3Title')}
              desc={t('pillars.p3Desc')}
              items={t.raw('pillars.p3Items') as string[]}
            />
          </Link>
        </div>
      </Section>

      <Section id="anatomy">
        <div className="sec-head reveal">
          <div>
            <Eyebrow>{t('anatomy.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>{t('anatomy.title')}</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">{t('anatomy.lead')}</p>
          </div>
        </div>
        <div className="approach-grid reveal">
          <div className="approach-card">
            <div className="approach-icon">
              <IconFolder size={22} />
            </div>
            <div className="num">{t('anatomy.card1Num')}</div>
            <h4>
              {t('anatomy.card1Title1')}{' '}
              <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>{t('anatomy.card1Title2')}</em>
            </h4>
            <p>{t('anatomy.card1Body')}</p>
          </div>
          <div className="approach-card">
            <div className="approach-icon">
              <IconInstructions size={22} />
            </div>
            <div className="num">{t('anatomy.card2Num')}</div>
            <h4>
              {t('anatomy.card2Title1')}{' '}
              <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>{t('anatomy.card2Title2')}</em>
            </h4>
            <p>{t('anatomy.card2Body')}</p>
          </div>
          <div className="approach-card">
            <div className="approach-icon">
              <IconTool size={22} />
            </div>
            <div className="num">{t('anatomy.card3Num')}</div>
            <h4>
              {t('anatomy.card3Title1')}{' '}
              <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>{t('anatomy.card3Title2')}</em>
            </h4>
            <p>{t('anatomy.card3Body')}</p>
          </div>
        </div>
      </Section>

      <Section id="quote" light tight>
        <div className="ds-grid-2" style={{ alignItems: 'center', gap: 80 }}>
          <div className="bigquote reveal">
            &ldquo;{t('quote.text')}&rdquo;
            <div className="bigquote-source">
              <div className="bigquote-avatar">M</div>
              <div>
                <div style={{ color: 'var(--ink)' }}>{t('quote.author')}</div>
                <div>{t('quote.authorRole')}</div>
              </div>
            </div>
          </div>
          <div className="reveal" style={{ display: 'grid', gap: 32 }}>
            <Stat num={t('quote.stat1Num')} label={t('quote.stat1Label')} />
            <Stat num={t('quote.stat2Num')} label={t('quote.stat2Label')} />
            <Stat num={t('quote.stat3Num')} label={t('quote.stat3Label')} />
          </div>
        </div>
      </Section>

      <Section id="cases-preview">
        <div className="sec-head reveal">
          <div>
            <Eyebrow>{t('casesPreview.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16 }}>{t('casesPreview.title')}</h2>
          </div>
          <div className="sec-head-right">
            <DsLink href={`${basePath}/cases`}>{t('casesPreview.viewAll')}</DsLink>
          </div>
        </div>
        <div className="ds-grid-3 reveal">
          {[1, 2, 3].map((i) => (
            <CaseCard
              key={i}
              industry={t(`casesPreview.c${i}Industry`)}
              title={t(`casesPreview.c${i}Title`)}
              snippet={t(`casesPreview.c${i}Snippet`)}
              metric={{
                num: t(`casesPreview.c${i}MetricNum`),
                label: t(`casesPreview.c${i}MetricLabel`),
              }}
            />
          ))}
        </div>
      </Section>

      <Section id="cta" tight>
        <div className="cta-block reveal">
          <div className="cta-block-inner">
            <Eyebrow>{t('cta.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 18 }}>
              {t('cta.title1')}
              <br />
              {t('cta.title2')}
            </h2>
            <p className="lead" style={{ marginTop: 20 }}>
              {t('cta.lead')}
            </p>
            <div className="row">
              <Btn variant="primary" href={`${basePath}/contact`}>
                {t('cta.ctaPrimary')} <IconArrow size={14} />
              </Btn>
              <Btn variant="ghost" href={`${basePath}/about`}>
                {t('cta.ctaGhost')}
              </Btn>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default HomePageView;
