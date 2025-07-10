import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://groeimetai.io';
  const locales = ['nl', 'en'];

  // Static pages
  const staticPaths = [
    { path: '', priority: 1, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'daily' as const },
    { path: '/cases', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map(({ path, priority, changeFrequency }) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    }))
  );

  // Service pages
  const services = [
    'genai-consultancy',
    'llm-integration',
    'rag-architecture',
    'servicenow-ai',
    'multi-agent-orchestration',
    'custom-solutions',
  ];

  const servicePages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    services.map((service) => ({
      url: `${baseUrl}/${locale}/services/${service}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  );

  // Blog posts (in production, this would be fetched from a CMS or database)
  const blogPosts = [
    'multi-agent-systems-future-automation',
    'rag-architectuur-best-practices',
    'servicenow-ai-transformatie',
    'llm-security-compliance',
    'genai-roi-measurement',
    'prompt-engineering-advanced',
  ];

  const blogPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    blogPosts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  );

  return [...staticPages, ...servicePages, ...blogPages];
}
