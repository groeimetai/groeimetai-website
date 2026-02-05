'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'app-error',
        digest: error.digest || 'none',
      },
      extra: {
        componentStack: error.stack,
      },
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080D14] px-4">
      <div className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-2xl shadow-2xl p-8 text-center backdrop-blur-sm">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
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

        <h1 className="text-2xl font-bold text-white mb-2">
          Er is iets misgegaan
        </h1>
        <p className="text-white/60 mb-6">
          Er is een onverwachte fout opgetreden. Onze excuses voor het ongemak.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-4 bg-white/[0.05] border border-white/10 rounded-lg text-left">
            <p className="text-sm font-mono text-white/70 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-white/40 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#F87315] hover:bg-[#E5680F] text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F87315]/50 focus:ring-offset-2 focus:ring-offset-[#080D14] active:scale-[0.98]"
          >
            Opnieuw proberen
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#080D14]"
          >
            Naar homepage
          </a>
        </div>

        <p className="mt-8 text-sm text-white/40">
          Blijft het probleem bestaan?{' '}
          <a
            href="mailto:support@groeimetai.io"
            className="text-[#F87315] hover:text-[#FF9F43] transition-colors"
          >
            Neem contact op
          </a>
        </p>
      </div>
    </div>
  );
}
