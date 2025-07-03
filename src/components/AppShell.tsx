import React from 'react';

/**
 * App Shell component for instant loading experience
 * This component is rendered immediately while the main app loads
 */
export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Logo Skeleton */}
          <div className="mr-4 flex">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          </div>

          {/* Nav Skeleton */}
          <nav className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-16 animate-pulse rounded bg-muted" />
              ))}
            </div>

            {/* Actions Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1">
        <div className="container py-6">
          {/* Hero Section Skeleton */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-12 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mx-auto mb-6 h-6 w-1/2 animate-pulse rounded bg-muted" />
            <div className="mx-auto flex justify-center space-x-4">
              <div className="h-11 w-32 animate-pulse rounded-md bg-muted" />
              <div className="h-11 w-32 animate-pulse rounded-md bg-muted" />
            </div>
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <div className="mb-4 h-12 w-12 animate-pulse rounded bg-muted" />
                <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Loading Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground shadow-lg">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-pulse {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.05) 25%,
            rgba(0, 0, 0, 0.1) 50%,
            rgba(0, 0, 0, 0.05) 75%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        @media (prefers-color-scheme: dark) {
          .animate-pulse {
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.05) 25%,
              rgba(255, 255, 255, 0.1) 50%,
              rgba(255, 255, 255, 0.05) 75%
            );
            background-size: 1000px 100%;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Hook to hide app shell after main app loads
 */
export const useHideAppShell = () => {
  React.useEffect(() => {
    // Hide app shell when main app is ready
    const appShell = document.getElementById('app-shell');
    if (appShell) {
      appShell.style.opacity = '0';
      appShell.style.transition = 'opacity 0.3s ease-out';

      setTimeout(() => {
        appShell.style.display = 'none';
      }, 300);
    }
  }, []);
};
