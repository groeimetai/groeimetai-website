'use client';

import { Fragment, useState, type CSSProperties, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { MotionShell } from '@/components/landing-v2/MotionShell';
import { Btn, Eyebrow, Section } from '@/components/ds';
import { IconArrow, IconMail, IconPhone, IconPin, IconCheck } from '@/components/ds/icons';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Start state for a `[data-reveal]` element. The shared motion loop clears
 * opacity/transform when the element enters the viewport; with motion off it
 * clears them immediately. Keep `transitionDelay` last — it has to win over the
 * `transition` shorthand above it.
 */
const reveal = (delayMs = 0, shift = 24): CSSProperties => ({
  opacity: 0,
  transform: `translateY(${shift}px)`,
  transition: 'opacity .85s var(--ease), transform .85s var(--ease)',
  transitionDelay: `${delayMs}ms`,
});

/** `.contact-line` transitions `all .2s`; magnetic pull wants .5s on transform. */
const magSoft: CSSProperties = {
  willChange: 'transform',
  transition: 'transform .5s var(--ease), border-color .2s var(--ease), background .2s var(--ease)',
};

/** Word-by-word load-in for the page-head heading, staggered 60ms per word. */
function HeadWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 ? ' ' : null}
          <span
            data-reveal
            style={{
              display: 'inline-block',
              opacity: 0,
              transform: 'translateY(0.42em)',
              transition: 'opacity .85s var(--ease), transform .85s var(--ease)',
              transitionDelay: `${delay + i * 60}ms`,
            }}
          >
            {word}
          </span>
        </Fragment>
      ))}
    </>
  );
}

export function ContactPageView({ wireApi = false }: { wireApi?: boolean }) {
  const t = useTranslations('redesign.contact');
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!wireApi) {
      // Preview mode — skip API call.
      setState('success');
      return;
    }

    setState('submitting');
    setErrorMsg(null);
    const fd = new FormData(e.currentTarget);

    const payload = {
      name: String(fd.get('name') || ''),
      organization: String(fd.get('organization') || ''),
      email: String(fd.get('email') || ''),
      message: String(fd.get('message') || ''),
    };

    try {
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setState('success');
    } catch (err: any) {
      setErrorMsg(err?.message || 'unknown error');
      setState('error');
    }
  };

  const submitted = state === 'success';

  return (
    <MotionShell>
      <div className="page">
        <div className="page-head">
          <div className="grid-bg" data-parallax="0.14" style={{ willChange: 'transform' }} />
          <div
            className="glow"
            data-parallax="0.3"
            style={{
              top: -300,
              left: 'calc(50% - 400px)',
              transform: 'translate3d(0,0,0)',
              opacity: 0.5,
              willChange: 'transform',
            }}
          />
          <div className="container page-head-inner">
            <div className="crumbs" data-reveal style={reveal(0, 12)}>
              <span>{t('head.crumb1')}</span>
              <span className="sep">/</span>
              <span className="current">{t('head.crumbCurrent')}</span>
            </div>
            <h1>
              <HeadWords text={t('head.title1')} delay={60} />
              <br />
              <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>
                <HeadWords text={t('head.titleAccent')} delay={260} />
              </em>
            </h1>
            <p data-reveal style={reveal(400, 18)}>
              {t('head.lead')}
            </p>
          </div>
        </div>

        <Section style={{ paddingBottom: 104 }}>
          {/* columnGap/rowGap split so the 900px collapse to one column closes to 44px. */}
          <div className="ds-grid-2" style={{ columnGap: 80, rowGap: 44, alignItems: 'start' }}>
            <div data-reveal style={reveal(0, 26)}>
              <Eyebrow>{t('direct.eyebrow')}</Eyebrow>
              <h2 style={{ marginTop: 16, fontSize: 'clamp(28px, 3vw, 38px)' }}>{t('direct.title')}</h2>
              <div style={{ marginTop: 32, display: 'grid', gap: 20 }}>
                <a href="mailto:info@groeimetai.io" className="contact-line" data-mag="soft" style={magSoft}>
                  <div className="contact-line-icon">
                    <IconMail size={18} />
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                      {t('direct.emailLabel')}
                    </div>
                    <div style={{ fontSize: 18, marginTop: 4, color: 'var(--fg)' }}>info@groeimetai.io</div>
                  </div>
                </a>
                <a href="tel:+31681739018" className="contact-line" data-mag="soft" style={magSoft}>
                  <div className="contact-line-icon">
                    <IconPhone size={18} />
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                      {t('direct.phoneLabel')}
                    </div>
                    <div style={{ fontSize: 18, marginTop: 4, color: 'var(--fg)' }}>+31 6 8173 9018</div>
                  </div>
                </a>
                <div className="contact-line" style={{ cursor: 'default' }}>
                  <div className="contact-line-icon">
                    <IconPin size={18} />
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                      {t('direct.baseLabel')}
                    </div>
                    <div style={{ fontSize: 18, marginTop: 4, color: 'var(--fg)' }}>{t('direct.baseValue')}</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 48,
                  padding: 24,
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                }}
              >
                <div
                  className="signature"
                  style={{ padding: 0, background: 'transparent', border: 'none', maxWidth: 'none' }}
                >
                  <div className="signature-avatar">N</div>
                  <div>
                    <div className="signature-name">{t('direct.signatureName')}</div>
                    <div className="signature-role">{t('direct.signatureRole')}</div>
                  </div>
                </div>
                <p style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-dim)' }}>{t('direct.signatureBody')}</p>
              </div>
            </div>

            <div data-reveal style={reveal(100, 26)}>
              <div className="card" style={{ padding: 36 }}>
                {!submitted ? (
                  <>
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: 'var(--fg-mute)',
                        letterSpacing: '0.06em',
                        marginBottom: 8,
                      }}
                    >
                      {t('form.label')}
                    </div>
                    <h3 style={{ fontSize: 22, marginBottom: 24 }}>{t('form.title')}</h3>
                    <form className="contact-form" onSubmit={onSubmit}>
                      <div className="form-row">
                        <div>
                          <label>{t('form.name')}</label>
                          <input name="name" type="text" placeholder={t('form.namePlaceholder')} required />
                        </div>
                        <div>
                          <label>{t('form.org')}</label>
                          <input name="organization" type="text" placeholder={t('form.orgPlaceholder')} />
                        </div>
                      </div>
                      <div>
                        <label>{t('form.email')}</label>
                        <input name="email" type="email" placeholder={t('form.emailPlaceholder')} required />
                      </div>
                      <div>
                        <label>{t('form.message')}</label>
                        <textarea name="message" placeholder={t('form.messagePlaceholder')} required />
                      </div>
                      {state === 'error' && (
                        <div style={{ color: 'var(--accent-hot)', fontSize: 13 }}>
                          {errorMsg ?? 'Er ging iets mis. Probeer het opnieuw.'}
                        </div>
                      )}
                      <div style={{ marginTop: 8 }}>
                        <span
                          data-mag
                          style={{
                            display: 'inline-flex',
                            willChange: 'transform',
                            transition: 'transform .3s var(--ease)',
                          }}
                        >
                          <Btn variant="primary" type="submit" disabled={state === 'submitting'}>
                            {t('form.submit')} <IconArrow size={14} />
                          </Btn>
                        </span>
                      </div>
                    </form>
                  </>
                ) : (
                  <div style={{ padding: '32px 0', textAlign: 'center' }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                        color: 'var(--accent)',
                        display: 'grid',
                        placeItems: 'center',
                        margin: '0 auto 24px',
                      }}
                    >
                      <IconCheck size={28} />
                    </div>
                    <h3 style={{ fontSize: 22, marginBottom: 12 }}>{t('form.successTitle')}</h3>
                    <p style={{ fontSize: 15, maxWidth: '32ch', margin: '0 auto' }}>{t('form.successBody')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </MotionShell>
  );
}

export default ContactPageView;
