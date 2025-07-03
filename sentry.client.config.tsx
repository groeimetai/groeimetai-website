import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Environment
  environment: process.env.NODE_ENV,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
      // maskAllInputs: true,
      // maskAllEmails: true,
      // maskAllPhoneNumbers: true,
      // maskAllCreditCards: true,
      // maskNetworkRequestHeaders: true,
      // maskNetworkRequestBody: true,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
  ],

  // Filtering
  beforeSend(event, hint) {
    // Filter out specific errors
    if (event.exception) {
      const error = hint.originalException as Error;

      // Filter out network errors in development
      if (process.env.NODE_ENV === 'development' && error?.message?.includes('NetworkError')) {
        return null;
      }

      // Filter out ResizeObserver errors
      if (error?.message?.includes('ResizeObserver')) {
        return null;
      }

      // Filter out browser extension errors
      if (
        error?.stack?.includes('chrome-extension://') ||
        error?.stack?.includes('moz-extension://')
      ) {
        return null;
      }
    }

    // Sanitize sensitive data
    if (event.request) {
      // Remove auth headers
      if (event.request.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
        delete event.request.headers['X-CSRF-Token'];
      }

      // Sanitize query strings
      if (event.request.query_string) {
        if (typeof event.request.query_string === 'string') {
          event.request.query_string = sanitizeQueryString(event.request.query_string);
        }
      }
    }

    // Sanitize user data
    if (event.user) {
      event.user = {
        id: event.user.id,
        // Don't send email or other PII
      };
    }

    return event;
  },

  // Breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
      return null;
    }

    // Sanitize fetch breadcrumbs
    if (breadcrumb.category === 'fetch') {
      if (breadcrumb.data?.url) {
        breadcrumb.data.url = sanitizeUrl(breadcrumb.data.url);
      }
    }

    return breadcrumb;
  },

  // Error boundaries
  // errorBoundaryOptions: {
  //   showDialog: false,
  //   fallback: ({ error, resetError }: { error: Error; resetError: () => void }) => (
  //     <div className="error-boundary">
  //       <h2>Something went wrong</h2>
  //       <button onClick={resetError}>Try again</button>
  //     </div>
  //   ),
  // },

  // Transport options
  // transportOptions: {
  //   // Retry failed requests
  //   maxRetries: 3,
  // },

  // Privacy
  // autoSessionTracking: true,

  // Performance
  // profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Debug
  debug: process.env.NODE_ENV === 'development',
});

// Helper functions
function sanitizeQueryString(queryString: string): string {
  const params = new URLSearchParams(queryString);
  const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth'];

  sensitiveParams.forEach((param) => {
    if (params.has(param)) {
      params.set(param, '[REDACTED]');
    }
  });

  return params.toString();
}

function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      if (['token', 'key', 'secret', 'password', 'auth'].includes(key)) {
        urlObj.searchParams.set(key, '[REDACTED]');
      }
    });
    return urlObj.toString();
  } catch {
    return url;
  }
}
