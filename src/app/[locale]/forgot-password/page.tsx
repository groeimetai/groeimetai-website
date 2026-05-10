'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { Btn } from '@/components/ds/Btn';
import { IconArrow, IconCheck, IconMail } from '@/components/ds/icons';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password reset failed:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Geen account gevonden bij dit e-mailadres.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Ongeldig e-mailadres.');
      } else {
        setError('Er ging iets mis. Probeer het opnieuw.');
      }
    } finally {
      setIsLoading(false);
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
            href="/login"
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
            Terug naar inloggen
          </Link>

          <div className="card" style={{ padding: 32 }}>
            {!isSuccess ? (
              <>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em', marginBottom: 8 }}>
                  WACHTWOORD VERGETEN
                </div>
                <h1 style={{ fontSize: 28, marginBottom: 6 }}>Reset je wachtwoord</h1>
                <p style={{ fontSize: 14, color: 'var(--fg-dim)', marginBottom: 28 }}>
                  Vul je e-mailadres in. Je krijgt een link om je wachtwoord opnieuw in te stellen.
                </p>

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
                    <label htmlFor="email">E-mailadres</label>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="naam@bedrijf.nl"
                        required
                        style={{ paddingLeft: 38 }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <Btn variant="primary" type="submit" disabled={isLoading} style={{ width: '100%' }}>
                      {isLoading ? 'Versturen…' : 'Verstuur reset-link'}
                      {!isLoading && <IconArrow size={14} />}
                    </Btn>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
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
                <h1 style={{ fontSize: 22, marginBottom: 8 }}>Mail onderweg</h1>
                <p style={{ fontSize: 14, color: 'var(--fg-dim)', maxWidth: '32ch', margin: '0 auto 24px' }}>
                  We hebben de reset-link gestuurd naar
                  <br />
                  <strong style={{ color: 'var(--fg)' }}>{email}</strong>.
                </p>
                <Link href="/login">
                  <Btn variant="ghost" type="button">
                    Terug naar inloggen
                  </Btn>
                </Link>
                <p style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 20 }}>
                  Niets ontvangen? Check je spam-folder, of{' '}
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      borderBottom: '1px dashed currentColor',
                    }}
                  >
                    probeer het opnieuw
                  </button>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
