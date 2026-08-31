// IndexNow client + helper to enumerate the indexable URL set.
//
// IndexNow is a Microsoft-backed protocol that lets a site notify search
// engines (Bing, Yandex) directly when content changes. Bing's index is what
// ChatGPT-search uses under the hood — so an IndexNow submission shortens the
// gap between publishing and inclusion in answer engines from weeks to hours.
//
// Usage:
//   import { submitUrls, listIndexableUrls } from '@/lib/indexnow';
//   const urls = listIndexableUrls();
//   await submitUrls(urls);

import { allPostSlugs } from '@/content/blog';
import { allPillarSlugs } from '@/content/pillars';
import { allProgrammaticSlugs } from '@/content/programmatic';

const HOST = 'groeimetai.io';
const KEY = 'b47aede02d0c7bdb8a1f91a99dcefa42';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

// Keep in sync with STATIC_PATHS in src/app/sitemap.ts — both lists describe
// the same set of locale-prefixed marketing routes. Only paths that resolve to
// a real page under src/app/[locale]/ belong here: submitting a redirect or a
// 404 to IndexNow pushes a dead URL straight into Bing, the index ChatGPT
// search reads. /services (308 → /trainingen) and /snow-flow (no route) were
// removed for exactly that reason.
const STATIC_PATHS = [
  '',
  '/agents',
  '/trainingen',
  '/about',
  '/contact',
  '/blog',
  '/cases',
  '/faq',
  '/assessments',
  '/privacy',
  '/terms',
  '/cookies',
];

// Detail routes that have no content registry to enumerate them. Same rule:
// keep in sync with src/app/sitemap.ts when a case study or assessment is
// added or retired.
const CASE_STUDIES = [
  'enterprise-llm-implementation',
  'snelnotuleren-ai-transcription',
  'groeimetai-learning-platform',
  'intelligent-ticket-routing',
];

const ASSESSMENTS = [
  'ai-maturity',
  'ai-security',
  'cx-ai',
  'data-readiness',
  'integration-readiness',
  'process-automation',
  'roi-calculator',
];

const LOCALES = ['nl', 'en'] as const;

export function listIndexableUrls(): string[] {
  const base = `https://${HOST}`;
  const urls = new Set<string>();

  // Static + locale-prefixed paths
  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      urls.add(`${base}/${locale}${path}`);
    }
    for (const slug of CASE_STUDIES) {
      urls.add(`${base}/${locale}/cases/${slug}`);
    }
    for (const slug of ASSESSMENTS) {
      urls.add(`${base}/${locale}/assessments/${slug}`);
    }
  }

  // Blog posts — only include the locales that have content
  for (const { slug, locale } of allPostSlugs()) {
    urls.add(`${base}/${locale}/blog/${slug}`);
  }

  // Pillar pages
  for (const { slug, locale } of allPillarSlugs()) {
    urls.add(`${base}/${locale}/voor/${slug}`);
  }

  // Programmatic SEO pages
  for (const { slug, locale } of allProgrammaticSlugs()) {
    urls.add(`${base}/${locale}/training/${slug}`);
  }

  // Root + sitemap + llms.txt
  urls.add(base);
  urls.add(`${base}/sitemap.xml`);
  urls.add(`${base}/llms.txt`);
  urls.add(`${base}/llms-full.txt`);

  return Array.from(urls).sort();
}

export interface IndexNowResult {
  ok: boolean;
  status: number;
  submitted: number;
  message?: string;
}

/**
 * Submit a batch of URLs to IndexNow. The protocol accepts up to 10,000 URLs
 * per request, but practical batches stay under 1000 to keep the payload sane.
 */
export async function submitUrls(urls: string[]): Promise<IndexNowResult> {
  if (urls.length === 0) {
    return { ok: true, status: 200, submitted: 0, message: 'no urls to submit' };
  }

  const batchSize = 1000;
  const batches: string[][] = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }

  let totalSubmitted = 0;
  for (const batch of batches) {
    const body = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch,
    };

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        submitted: totalSubmitted,
        message: `IndexNow rejected batch with status ${res.status}: ${await res.text()}`,
      };
    }
    totalSubmitted += batch.length;
  }

  return { ok: true, status: 200, submitted: totalSubmitted };
}
