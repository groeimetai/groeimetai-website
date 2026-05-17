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

const STATIC_PATHS = [
  '',
  '/about',
  '/services',
  '/contact',
  '/blog',
  '/cases',
  '/faq',
  '/team',
  '/roadmap',
  '/assessments',
  '/snow-flow',
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
