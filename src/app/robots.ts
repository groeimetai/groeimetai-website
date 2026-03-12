import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/dashboard/', '/login/', '/register/', '/forgot-password/', '/verify-email/', '/auth/', '/settings/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      // AI search crawlers — allow (these serve real-time search results)
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'Claude-SearchBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      // AI training crawlers — block (protect content from training data scraping)
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
    ],
    sitemap: 'https://groeimetai.io/sitemap.xml',
  };
}
