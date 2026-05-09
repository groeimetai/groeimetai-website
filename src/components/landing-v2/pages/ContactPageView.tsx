'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import { Btn, Eyebrow, Section } from '@/components/ds';
import { IconArrow, IconMail, IconPhone, IconPin, IconCheck } from '@/components/ds/icons';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function ContactPageView({ wireApi = false }: { wireApi?: boolean }) {
  useReveal();
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
            {t('head.title1')}
            <br />
            <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>{t('head.titleAccent')}</em>
          </h1>
          <p>{t('head.lead')}</p>
        </div>
      </div>

      <Section>
        <div className="ds-grid-2" style={{ gap: 80, alignItems: 'start' }}>
          <div className="reveal">
            <Eyebrow>{t('direct.eyebrow')}</Eyebrow>
            <h2 style={{ marginTop: 16, fontSize: 'clamp(28px, 3vw, 38px)' }}>{t('direct.title')}</h2>
            <div style={{ marginTop: 32, display: 'grid', gap: 20 }}>
              <a href="mailto:info@groeimetai.io" className="contact-line">
                <div className="contact-line-icon">
                  <IconMail size={18} />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                    {t('direct.emailLabel')}
                  </div>
                  <div style={{ fontSize: 18, marginTop: 4 }}>info@groeimetai.io</div>
                </div>
              </a>
              <a href="tel:+31681739018" className="contact-line">
                <div className="contact-line-icon">
                  <IconPhone size={18} />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                    {t('direct.phoneLabel')}
                  </div>
                  <div style={{ fontSize: 18, marginTop: 4 }}>+31 6 8173 9018</div>
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
                  <div style={{ fontSize: 18, marginTop: 4 }}>{t('direct.baseValue')}</div>
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

          <div className="reveal">
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
                      <Btn variant="primary" type="submit" disabled={state === 'submitting'}>
                        {t('form.submit')} <IconArrow size={14} />
                      </Btn>
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
                      background: 'rgba(255,90,31,0.12)',
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
  );
}

export default ContactPageView;
