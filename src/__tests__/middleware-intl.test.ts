import { NextRequest, NextResponse } from 'next/server';
import { createI18nMiddleware } from '../middleware-intl';

// Mock next-intl middleware
jest.mock('next-intl/middleware', () => ({
  __esModule: true,
  default: () => (request: NextRequest) => NextResponse.next()
}));

describe('I18n Middleware', () => {
  const middleware = createI18nMiddleware();

  describe('Cookie-based detection', () => {
    it('should respect NEXT_LOCALE cookie when set', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'accept-language': 'en-US,en;q=0.9',
          'x-vercel-ip-country': 'US'
        },
        cookies: {
          'NEXT_LOCALE': 'nl'
        }
      });

      const response = middleware(request);
      expect(response?.status).toBe(308); // Redirect
      expect(response?.headers.get('location')).toBe('https://example.com/nl/about');
    });
  });

  describe('Browser language detection', () => {
    it('should detect Dutch from Accept-Language header', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'accept-language': 'nl-NL,nl;q=0.9,en;q=0.8'
        }
      });

      const response = middleware(request);
      expect(response?.status).toBe(308);
      expect(response?.headers.get('location')).toBe('https://example.com/nl/about');
    });

    it('should detect English from Accept-Language header', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'accept-language': 'en-US,en;q=0.9'
        }
      });

      const response = middleware(request);
      expect(response?.status).toBe(308);
      expect(response?.headers.get('location')).toBe('https://example.com/en/about');
    });

    it('should handle complex Accept-Language headers', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'accept-language': 'de-DE,de;q=0.9,nl;q=0.8,en;q=0.7'
        }
      });

      const response = middleware(request);
      expect(response?.status).toBe(308);
      expect(response?.headers.get('location')).toBe('https://example.com/nl/about');
    });
  });

  describe('Geo-location detection', () => {
    it('should redirect to Dutch for Netherlands visitors', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'x-vercel-ip-country': 'NL'
        }
      });

      const response = middleware(request);
      expect(response?.status).toBe(308);
      expect(response?.headers.get('location')).toBe('https://example.com/nl/about');
    });

    it('should redirect to Dutch for Belgium visitors', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'x-vercel-ip-country': 'BE'
        }
      });

      const response = middleware(request);
      expect(response?.status).toBe(308);
      expect(response?.headers.get('location')).toBe('https://example.com/nl/about');
    });

    it('should redirect to English for other countries', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'x-vercel-ip-country': 'US'
        }
      });

      const response = middleware(request);
      expect(response?.status).toBe(308);
      expect(response?.headers.get('location')).toBe('https://example.com/en/about');
    });

    it('should handle Cloudflare headers', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'cf-ipcountry': 'NL'
        }
      });

      const response = middleware(request);
      expect(response?.status).toBe(308);
      expect(response?.headers.get('location')).toBe('https://example.com/nl/about');
    });
  });

  describe('Priority order', () => {
    it('should prioritize cookie over browser language', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'accept-language': 'en-US,en;q=0.9'
        },
        cookies: {
          'NEXT_LOCALE': 'nl'
        }
      });

      const response = middleware(request);
      expect(response?.headers.get('location')).toBe('https://example.com/nl/about');
    });

    it('should prioritize browser language over geo-location', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'accept-language': 'nl-NL,nl;q=0.9',
          'x-vercel-ip-country': 'US'
        }
      });

      const response = middleware(request);
      expect(response?.headers.get('location')).toBe('https://example.com/nl/about');
    });
  });

  describe('Path handling', () => {
    it('should preserve query parameters during redirect', () => {
      const request = new NextRequest('https://example.com/about?ref=home&campaign=test', {
        headers: {
          'x-vercel-ip-country': 'NL'
        }
      });

      const response = middleware(request);
      expect(response?.headers.get('location')).toBe('https://example.com/nl/about?ref=home&campaign=test');
    });

    it('should skip API routes', () => {
      const request = new NextRequest('https://example.com/api/auth', {
        headers: {
          'x-vercel-ip-country': 'NL'
        }
      });

      const response = middleware(request);
      expect(response?.status).not.toBe(308);
    });

    it('should skip static files', () => {
      const request = new NextRequest('https://example.com/image.png', {
        headers: {
          'x-vercel-ip-country': 'NL'
        }
      });

      const response = middleware(request);
      expect(response?.status).not.toBe(308);
    });
  });

  describe('Cookie setting', () => {
    it('should set locale preference cookie on redirect', () => {
      const request = new NextRequest('https://example.com/about', {
        headers: {
          'x-vercel-ip-country': 'NL'
        }
      });

      const response = middleware(request);
      const setCookie = response?.headers.get('set-cookie');
      expect(setCookie).toContain('NEXT_LOCALE=nl');
      expect(setCookie).toContain('max-age=31536000'); // 1 year
    });

    it('should update cookie when navigating to different locale', () => {
      const request = new NextRequest('https://example.com/en/about', {
        cookies: {
          'NEXT_LOCALE': 'nl'
        }
      });

      const response = middleware(request);
      const setCookie = response?.headers.get('set-cookie');
      expect(setCookie).toContain('NEXT_LOCALE=en');
    });
  });
});