import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://groeimetai.io';
  const locales = ['nl', 'en'];

  // Static pages
  const staticPaths = [
    { path: '', priority: 1, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/snow-flow', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'daily' as const },
    { path: '/cases', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/faq', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/assessments', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/team', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/roadmap', priority: 0.5, changeFrequency: 'monthly' as const },
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

  // Case study detail pages
  const caseStudies = [
    'enterprise-llm-implementation',
    'snelnotuleren-ai-transcription',
    'groeimetai-learning-platform',
    'intelligent-ticket-routing',
  ];

  const casePages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    caseStudies.map((slug) => ({
      url: `${baseUrl}/${locale}/cases/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // Assessment sub-pages
  const assessments = [
    'ai-maturity',
    'ai-security',
    'cx-ai',
    'data-readiness',
    'integration-readiness',
    'process-automation',
    'roi-calculator',
  ];

  const assessmentPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    assessments.map((assessment) => ({
      url: `${baseUrl}/${locale}/assessments/${assessment}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  // Blog posts
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

  return [...staticPages, ...servicePages, ...casePages, ...assessmentPages, ...blogPages];
}
