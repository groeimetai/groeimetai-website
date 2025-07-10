import { generateEmbeddings, chunkText } from '../embeddings/openai';
import type { IndexableContent } from './indexer';

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

// Extract content from HTML
function extractContentFromHtml(html: string): {
  title: string;
  description: string;
  textContent: string;
} {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(' | GroeimetAI', '').trim() : 'Untitled';

  // Extract meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const description = descMatch ? descMatch[1] : '';

  // Remove script and style tags
  let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove navigation, footer, and other non-content elements
  cleanHtml = cleanHtml.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
  cleanHtml = cleanHtml.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
  cleanHtml = cleanHtml.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');

  // Extract text from main content area if possible
  const mainMatch = cleanHtml.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const contentHtml = mainMatch ? mainMatch[1] : cleanHtml;

  // Convert HTML to text
  const textContent = contentHtml
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
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
