import { MetadataRoute } from 'next';
import { allPostSlugs } from '@/content/blog';
import { allPillarSlugs } from '@/content/pillars';
import { allProgrammaticSlugs } from '@/content/programmatic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://groeimetai.io';
  const locales = ['nl', 'en'];
  const now = new Date();

  const staticPaths = [
    { path: '', priority: 1, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/snow-flow', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/cases', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/faq', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/assessments', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/team', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/roadmap', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/trainingen', priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map(({ path, priority, changeFrequency }) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }))
  );

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
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  const caseStudies = [
    'enterprise-llm-implementation',
    'snelnotuleren-ai-transcription',
    'groeimetai-learning-platform',
    'intelligent-ticket-routing',
  ];

  const casePages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    caseStudies.map((slug) => ({
      url: `${baseUrl}/${locale}/cases/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

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
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  // Blog posts — only include locale-slug pairs that actually exist
  const blogPages: MetadataRoute.Sitemap = allPostSlugs().map(({ slug, locale }) => ({
    url: `${baseUrl}/${locale}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Pillar pages
  const pillarPages: MetadataRoute.Sitemap = allPillarSlugs().map(({ slug, locale }) => ({
    url: `${baseUrl}/${locale}/voor/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // Programmatic SEO pages
  const programmaticPages: MetadataRoute.Sitemap = allProgrammaticSlugs().map(
    ({ slug, locale }) => ({
      url: `${baseUrl}/${locale}/training/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })
  );

  return [
    ...staticPages,
    ...servicePages,
    ...casePages,
    ...assessmentPages,
    ...blogPages,
    ...pillarPages,
    ...programmaticPages,
  ];
}
