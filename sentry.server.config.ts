import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Integrations
  integrations: [
    // Database query tracking
    Sentry.prismaIntegration(),
    
    // HTTP request tracking
    Sentry.httpIntegration({
      // tracing: true,
      // breadcrumbs: true,
    }),
    
    // Console tracking
    Sentry.consoleIntegration(),
    
    // Context lines in stack traces
    Sentry.contextLinesIntegration(),
  ],
  
  // Filtering
  beforeSend(event, hint) {
    // Filter out specific errors
    if (event.exception) {
      const error = hint.originalException as any;
      
      // Filter out expected errors
      if (error?.code === 'ECONNREFUSED' || 
          error?.code === 'ETIMEDOUT') {
        return null;
      }
      
      // Filter out 404 errors
      if (error?.status === 404) {
        return null;
      }
    }
    
    // Sanitize request data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        const sensitiveHeaders = [
          'authorization',
          'cookie',
          'x-csrf-token',
          'x-api-key',
          'x-auth-token',
        ];
        
        sensitiveHeaders.forEach(header => {
          if (event.request?.headers) {
            delete event.request.headers[header];
          }
        });
      }
      
      // Sanitize request data
      if (event.request.data) {
        event.request.data = sanitizeData(event.request.data);
      }
    }
    
    // Sanitize extra context
    if (event.extra) {
      event.extra = sanitizeData(event.extra);
    }
    
    // Add server context
    event.contexts = {
      ...event.contexts,
      server: {
        node_version: process.version,
        memory_usage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };
    
    return event;
  },
  
  // Error sampling
  // errorSampler(event) {
  //   // Sample rate based on error type
  //   if (event.exception?.values?.[0]?.type === 'ValidationError') {
  //     return 0.1; // 10% of validation errors
  //   }
    
  //   if (event.exception?.values?.[0]?.type === 'NetworkError') {
  //     return 0.05; // 5% of network errors
  //   }
    
  //   return 1.0; // 100% of other errors
  // },
  
  // Transaction sampling
  tracesSampler(samplingContext) {
    // Lower sample rate for health checks
    if (samplingContext.request?.url?.includes('/api/health')) {
      return 0.01;
    }
    
    // Higher sample rate for critical endpoints
    if (samplingContext.request?.url?.includes('/api/auth') ||
        samplingContext.request?.url?.includes('/api/payment')) {
      return 0.5;
    }
    
    // Default sample rate
    return 0.1;
  },
  
  // Profiling
  // profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug
  debug: process.env.NODE_ENV === 'development',
  
  // Server name
  serverName: process.env.HOSTNAME || 'groeimetai-server',
  
  // Transport options
  // transportOptions: {
  //   maxRetries: 3,
  // },
});

// Helper function to sanitize sensitive data
function sanitizeData(data: any): any {
  if (!data) return data;
  
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'auth',
    'api_key',
    'private_key',
    'credit_card',
    'ssn',
    'email',
    'phone',
  ];
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  return data;
}