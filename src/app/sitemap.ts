import { MetadataRoute } from 'next';
import { allPosts } from '@/content/blog';
import { allPillars } from '@/content/pillars';
import { allProgrammatic } from '@/content/programmatic';

const BASE_URL = 'https://groeimetai.io';
const LOCALES = ['nl', 'en'] as const;

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

interface StaticPath {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
  /**
   * Date this page's content last changed, as YYYY-MM-DD. Hand-maintained:
   * bump the entry when you edit the page. Google only uses <lastmod> when it
   * is "consistently and verifiably accurate", so a build timestamp on every
   * URL is worse than none — it claims every page changed at the same
   * millisecond. Under-claiming (a stale date) is safe; over-claiming is not.
   */
  lastModified: string;
}

// Only routes that actually exist under src/app/[locale]/ belong here.
// /services, /services/* and /snow-flow were removed: the first two 308-redirect
// to /trainingen (next.config.mjs) and the third has no route at all.
const STATIC_PATHS: StaticPath[] = [
  { path: '', priority: 1, changeFrequency: 'weekly', lastModified: '2026-05-17' },
  { path: '/agents', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-05-10' },
  { path: '/trainingen', priority: 0.7, changeFrequency: 'monthly', lastModified: '2026-05-17' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-17' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-17' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-01-13' },
  { path: '/cases', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-17' },
  { path: '/faq', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-03-12' },
  { path: '/assessments', priority: 0.6, changeFrequency: 'monthly', lastModified: '2026-01-14' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-01-13' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-01-13' },
  { path: '/cookies', priority: 0.3, changeFrequency: 'yearly', lastModified: '2025-07-04' },
];

const CASE_STUDIES = [
  'enterprise-llm-implementation',
  'snelnotuleren-ai-transcription',
  'groeimetai-learning-platform',
  'intelligent-ticket-routing',
];
const CASES_LAST_MODIFIED = '2025-07-04';

const ASSESSMENTS = [
  'ai-maturity',
  'ai-security',
  'cx-ai',
  'data-readiness',
  'integration-readiness',
  'process-automation',
  'roi-calculator',
];
const ASSESSMENTS_LAST_MODIFIED = '2026-01-14';

// ProgrammaticPage (src/content/types.ts) carries no date field — the 20
// industry pages are generated from industries.ts + template.ts, so their
// content date is the date those two modules were last revised. Bump this
// when the industry set or the page template changes.
const PROGRAMMATIC_LAST_MODIFIED = '2026-05-17';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    STATIC_PATHS.map(({ path, priority, changeFrequency, lastModified }) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
    }))
  );

  const casePages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    CASE_STUDIES.map((slug) => ({
      url: `${BASE_URL}/${locale}/cases/${slug}`,
      lastModified: CASES_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  const assessmentPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    ASSESSMENTS.map((slug) => ({
      url: `${BASE_URL}/${locale}/assessments/${slug}`,
      lastModified: ASSESSMENTS_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  // Blog posts — only locale/slug pairs that actually exist, each with its own
  // publication (or revision) date from the content record.
  const blogPages: MetadataRoute.Sitemap = allPosts().map((post) => ({
    url: `${BASE_URL}/${post.locale}/blog/${post.slug}`,
    lastModified: post.updated ?? post.date,
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  // Pillar pages
  const pillarPages: MetadataRoute.Sitemap = allPillars().map((pillar) => ({
    url: `${BASE_URL}/${pillar.locale}/voor/${pillar.slug}`,
    lastModified: pillar.updated ?? pillar.date,
    changeFrequency: 'yearly' as const,
    priority: 0.85,
  }));

  // Programmatic SEO pages — "AI training per branche"
  const programmaticPages: MetadataRoute.Sitemap = allProgrammatic().map((page) => ({
    url: `${BASE_URL}/${page.locale}/training/${page.slug}`,
    lastModified: PROGRAMMATIC_LAST_MODIFIED,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...casePages,
    ...assessmentPages,
    ...blogPages,
    ...pillarPages,
    ...programmaticPages,
  ];
}
