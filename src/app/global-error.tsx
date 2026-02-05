'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="nl">
      <body style={{ margin: 0, backgroundColor: '#080D14', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '28rem',
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem',
              boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.5)',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                margin: '0 auto 1.5rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                style={{ width: '2rem', height: '2rem', color: '#f87171' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem' }}>
              Kritieke Fout
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
              Er is een kritieke fout opgetreden in de applicatie. Probeer de pagina te herladen.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #F87315, #FF9F43)',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Opnieuw proberen
              </button>
              <a
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.875rem',
                }}
              >
                Naar homepage
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
