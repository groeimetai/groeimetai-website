import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1,

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Environment
  environment: process.env.NODE_ENV,

  // Edge-specific configuration
  // transportOptions: {
  //   // Reduce payload size for edge runtime
  //   maxValueLength: 250,
  // },

  // Filtering
  beforeSend(event) {
    // Remove PII from edge runtime
    if (event.request) {
      // Sanitize headers
      if (event.request.headers) {
        const allowedHeaders = ['content-type', 'user-agent', 'referer'];
        const sanitizedHeaders: Record<string, string> = {};

        for (const [key, value] of Object.entries(event.request.headers)) {
          if (allowedHeaders.includes(key.toLowerCase())) {
            sanitizedHeaders[key] = value as string;
          }
        }

        event.request.headers = sanitizedHeaders;
      }

      // Remove cookies completely in edge runtime
      delete event.request.cookies;
    }

    // Add edge context
    event.contexts = {
      ...event.contexts,
      edge: {
        runtime: 'edge',
        region: process.env.VERCEL_REGION || 'unknown',
      },
    };

    return event;
  },

  // Disable features not available in edge runtime
  // autoSessionTracking: false,

  // Debug
  debug: false,
});
