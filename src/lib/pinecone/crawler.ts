import { generateEmbeddings, chunkText } from '../embeddings/openai';
import type { IndexableContent } from './indexer';
import * as cheerio from 'cheerio';

// List of pages to crawl
export const PAGES_TO_CRAWL = [
  '/',
  '/about',
  '/services',
  '/services/ai-consulting',
  '/services/automation',
  '/services/data-intelligence',
  '/services/ml-engineering',
  '/services/nlp-solutions',
  '/services/genai-assistants',
  '/services/custom-solutions',
  '/services/strategy',
  '/services/transformation',
  '/services/governance',
  '/services/innovation',
  '/services/advisory',
  '/services/adoption',
  '/advisory-services',
  '/cases',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  // Add blog posts
  '/blog/multi-agent-systems-future-automation',
  '/blog/rag-architectuur-best-practices',
];

// Crawl a single page
export async function crawlPage(
  baseUrl: string,
  path: string,
  locale: 'en' | 'nl',
  environment: string
): Promise<IndexableContent[]> {
  const url = `${baseUrl}/${locale}${path}`;
  const content: IndexableContent[] = [];

  try {
    console.log(`  - Crawling ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`    ⚠ Failed to fetch ${url}: ${response.status}`);
      return content;
    }

    const html = await response.text();

    // Extract content from HTML
    const { title, description, textContent } = extractContentFromHtml(html);

    // Chunk the content
    const chunks = chunkText(textContent);

    // Create indexable items for each chunk
    chunks.forEach((chunk, index) => {
      content.push({
        id: `${environment}-${locale}-${path.replace(/\//g, '-')}-chunk-${index}`,
        content: chunk,
        metadata: {
          id: `${environment}-${locale}-${path.replace(/\//g, '-')}`,
          type: determinePageType(path),
          locale,
          title,
          description,
          url: `/${locale}${path}`,
          section: path.split('/')[1] || 'main',
          content: chunk,
          chunk: index,
          totalChunks: chunks.length,
          lastModified: new Date().toISOString(),
          environment,
        },
      });
    });

    console.log(`    ✓ Extracted ${chunks.length} chunks`);
  } catch (error) {
    console.error(`    ✗ Error crawling ${url}:`, error);
  }

  return content;
}

// Extract content from HTML using cheerio for safe parsing
function extractContentFromHtml(html: string): {
  title: string;
  description: string;
  textContent: string;
} {
  // Use cheerio for safe HTML parsing (avoids regex-based HTML manipulation vulnerabilities)
  const $ = cheerio.load(html);

  // Extract title
  const title = $('title').text().replace(' | GroeimetAI', '').trim() || 'Untitled';

  // Extract meta description
  const description = $('meta[name="description"]').attr('content') || '';

  // Remove script, style, and non-content elements (using DOM manipulation, not regex)
  $('script, style, nav, footer, header, noscript, iframe').remove();

  // Extract text from main content area if possible, otherwise use body
  const mainContent = $('main').length > 0 ? $('main') : $('body');

  // Get text content and normalize whitespace
  const textContent = mainContent
    .text()
    .replace(/\s+/g, ' ')
    .trim();

  return { title, description, textContent };
}

// Determine page type from path
function determinePageType(path: string): 'page' | 'blog' | 'case' | 'service' | 'doc' {
  if (path.includes('/blog/')) return 'blog';
  if (path.includes('/cases/')) return 'case';
  if (path.includes('/services/')) return 'service';
  if (path.includes('/docs/')) return 'doc';
  return 'page';
}

// Crawl entire website
export async function crawlWebsite(
  baseUrl: string,
  locales: ('en' | 'nl')[],
  environment: string
): Promise<IndexableContent[]> {
  const allContent: IndexableContent[] = [];

  for (const locale of locales) {
    console.log(`\n🌐 Crawling ${locale.toUpperCase()} pages from ${baseUrl}`);

    for (const path of PAGES_TO_CRAWL) {
      const pageContent = await crawlPage(baseUrl, path, locale, environment);
      allContent.push(...pageContent);

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allContent;
}
