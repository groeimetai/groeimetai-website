import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security middleware to add security headers to all responses
 */
export function securityMiddleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Get the origin from the request
  const origin = request.headers.get('origin') || '';

  // Define allowed origins
  const allowedOrigins = [
    'https://groeimetai.com',
    'https://www.groeimetai.com',
    'https://groeimetai-app.run.app',
    'https://groeimetai-app-staging.run.app',
  ];

  // Add CORS headers for allowed origins
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.firebaseapp.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com",
    "media-src 'self' https:",
    "object-src 'none'",
    "child-src 'self' https://meet.google.com",
    "frame-src 'self' https://meet.google.com https://accounts.google.com",
    "worker-src 'self' blob:",
    "form-action 'self'",
    "base-uri 'self'",
    "manifest-src 'self'",
    'upgrade-insecure-requests',
  ];

  // Apply CSP based on environment
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  } else {
    // More permissive CSP for development
    response.headers.set(
      'Content-Security-Policy',
      cspDirectives.join('; ').replace("'unsafe-eval'", "'unsafe-eval' http://localhost:*")
    );
  }

  // Strict Transport Security
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  const permissionsPolicyDirectives = [
    'camera=(self)',
    'microphone=(self)',
    'geolocation=(self)',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=(self)',
    'encrypted-media=(self)',
    'picture-in-picture=(self)',
    'fullscreen=(self)',
    'display-capture=(self)',
  ];

  response.headers.set('Permissions-Policy', permissionsPolicyDirectives.join(', '));

  // Feature Policy (legacy, but still supported by some browsers)
  response.headers.set('Feature-Policy', permissionsPolicyDirectives.join('; '));

  // X-Permitted-Cross-Domain-Policies
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Expect-CT
  response.headers.set('Expect-CT', 'max-age=86400, enforce');

  // X-DNS-Prefetch-Control
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Remove sensitive headers
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}
