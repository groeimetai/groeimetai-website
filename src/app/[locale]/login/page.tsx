'use client';

import { useState, useEffect, Suspense } from 'react';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { twoFactorService } from '@/services/twoFactorService';
import { Btn } from '@/components/ds/Btn';
import { IconArrow, IconLock, IconMail } from '@/components/ds/icons';

function LoginPageContent() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const t = useTranslations('auth.login');
  const searchParams = useSearchParams();

  const [returnUrl, setReturnUrl] = useState<string>('/dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  // 2FA
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);

  useEffect(() => {
    const returnUrlParam = searchParams.get('returnUrl');
    if (returnUrlParam) {
      let cleanUrl = decodeURIComponent(returnUrlParam);
      const localePattern = /^\/(nl|en)\//;
      if (localePattern.test(cleanUrl)) {
        cleanUrl = cleanUrl.replace(localePattern, '/');
      }
      setReturnUrl(cleanUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      router.push(returnUrl);
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/multi-factor-auth-required') {
        setMfaResolver(err.resolver);
        setShow2FADialog(true);
      } else if (err.code === 'auth/user-not-found') {
        setError(t('errors.userNotFound'));
      } else if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/invalid-login-credentials'
      ) {
        setError(t('errors.wrongPassword'));
      } else if (err.code === 'auth/too-many-requests') {
        setError(t('errors.tooManyRequests'));
      } else {
        setError(t('errors.general'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async () => {
    if (!mfaResolver || !verificationCode) return;
    setVerifying2FA(true);
    setError('');
    try {
      await twoFactorService.verifyTotpCode(mfaResolver, verificationCode);
      setShow2FADialog(false);
      setVerificationCode('');
      setMfaResolver(null);
      router.push(returnUrl);
    } catch (err: any) {
      console.error('2FA verification failed:', err);
      setError(t('errors.invalidCode'));
      setVerificationCode('');
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      router.push(returnUrl);
    } catch (err: any) {
      console.error('Google login failed:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(t('errors.general'));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="ds">
      <main
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px',
          background: 'var(--bg)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          <Link
            href="/"
            className="mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--fg-mute)',
              marginBottom: 28,
            }}
          >
            <span style={{ display: 'inline-block', transform: 'rotate(180deg)' }}>
              <IconArrow size={12} />
            </span>
            Terug naar de site
          </Link>

          <div className="card" style={{ padding: 32 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em', marginBottom: 8 }}>
              ADMIN · INTERN
            </div>
            <h1 style={{ fontSize: 28, marginBottom: 6 }}>{t('title')}</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-dim)', marginBottom: 28 }}>
              {t('subtitle')}
            </p>

            {!show2FADialog && (
              <form onSubmit={handleSubmit} className="contact-form">
                {error && (
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(255,90,31,0.08)',
                      border: '1px solid rgba(255,90,31,0.4)',
                      borderRadius: 8,
                      color: 'var(--accent-hot)',
                      fontSize: 13,
                    }}
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email">{t('emailLabel')}</label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--fg-mute)',
                      }}
                    >
                      <IconMail size={16} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('emailPlaceholder')}
                      required
                      style={{ paddingLeft: 38 }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <label htmlFor="password">{t('passwordLabel')}</label>
                    <Link
                      href="/forgot-password"
                      className="mono"
                      style={{ fontSize: 11, color: 'var(--accent)' }}
                    >
                      {t('forgotPassword')}
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--fg-mute)',
                      }}
                    >
                      <IconLock size={16} />
                    </span>
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={t('passwordPlaceholder')}
                      required
                      style={{ paddingLeft: 38 }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <Btn variant="primary" type="submit" disabled={isLoading} style={{ width: '100%' }}>
                    {isLoading ? t('signingIn') : t('signIn')}
                    {!isLoading && <IconArrow size={14} />}
                  </Btn>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    margin: '8px 0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--fg-mute)',
                  }}
                >
                  <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                  {t('orDivider')}
                  <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                </div>

                <Btn
                  variant="ghost"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  style={{ width: '100%' }}
                >
                  <GoogleGlyph />
                  {isGoogleLoading ? t('signingIn') : t('signInWithGoogle')}
                </Btn>
              </form>
            )}

            {show2FADialog && (
              <div className="contact-form">
                <div
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(110,231,183,0.08)',
                    border: '1px solid rgba(110,231,183,0.3)',
                    borderRadius: 8,
                    color: 'var(--good)',
                    fontSize: 13,
                  }}
                >
                  Voer de 6-cijferige code uit je authenticator-app in.
                </div>
                <div>
                  <label htmlFor="totp">Verificatiecode</label>
                  <input
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123 456"
                    autoFocus
                  />
                </div>
                {error && (
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(255,90,31,0.08)',
                      border: '1px solid rgba(255,90,31,0.4)',
                      borderRadius: 8,
                      color: 'var(--accent-hot)',
                      fontSize: 13,
                    }}
                  >
                    {error}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setShow2FADialog(false);
                      setVerificationCode('');
                      setMfaResolver(null);
                    }}
                    style={{ flex: 1 }}
                  >
                    Annuleren
                  </Btn>
                  <Btn
                    variant="primary"
                    type="button"
                    onClick={handle2FAVerification}
                    disabled={verifying2FA || verificationCode.length !== 6}
                    style={{ flex: 2 }}
                  >
                    {verifying2FA ? 'Verifiëren…' : 'Verifieer'}
                  </Btn>
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: 24,
                paddingTop: 18,
                borderTop: '1px solid var(--line)',
                fontSize: 13,
                color: 'var(--fg-mute)',
              }}
            >
              Toegang nodig? Mail{' '}
              <a
                href="mailto:info@groeimetai.io"
                style={{ color: 'var(--accent)', borderBottom: '1px dashed currentColor', paddingBottom: 1 }}
              >
                info@groeimetai.io
              </a>
              . Geen publieke registratie.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
