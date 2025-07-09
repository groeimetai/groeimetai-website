import { getIndex } from './client';
import { generateEmbeddings, chunkText } from '../embeddings/openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

export interface ContentMetadata {
  id: string;
  type: 'page' | 'blog' | 'case' | 'service' | 'doc';
  locale: 'en' | 'nl';
  title: string;
  description: string;
  url: string;
  section: string;
  content: string;
  chunk: number;
  totalChunks: number;
  lastModified: string;
  tags?: string[];
  environment?: string;
}

export interface IndexableContent {
  id: string;
  content: string;
  metadata: ContentMetadata;
}

// Extract content from different page types
export async function extractPageContent(
  pagePath: string,
  locale: 'en' | 'nl'
): Promise<IndexableContent[]> {
  const content: IndexableContent[] = [];

  try {
    // Read page file
    const filePath = join(process.cwd(), 'src/app', `[locale]`, pagePath);
    const fileContent = readFileSync(filePath, 'utf-8');

    // Extract metadata and content (simplified - would need proper parsing)
    const title = extractTitle(fileContent);
    const description = extractDescription(fileContent);
    const pageContent = extractTextContent(fileContent);

    // Chunk the content
    const chunks = chunkText(pageContent);

    // Create indexable items for each chunk
    chunks.forEach((chunk, index) => {
      content.push({
        id: `${locale}-${pagePath.replace(/\//g, '-')}-chunk-${index}`,
        content: chunk,
        metadata: {
          id: `${locale}-${pagePath.replace(/\//g, '-')}`,
          type: determinePageType(pagePath),
          locale,
          title,
          description,
          url: `/${locale}${pagePath}`,
          section: pagePath.split('/')[0] || 'main',
          content: chunk,
          chunk: index,
          totalChunks: chunks.length,
          lastModified: new Date().toISOString(),
        },
      });
    });
  } catch (error) {
    console.error(`Error extracting content from ${pagePath}:`, error);
  }

  return content;
}

// Extract blog posts
export async function extractBlogPosts(locale: 'en' | 'nl'): Promise<IndexableContent[]> {
  const content: IndexableContent[] = [];
  const blogPosts = ['multi-agent-systems-future-automation', 'rag-architectuur-best-practices'];

  for (const slug of blogPosts) {
    try {
      const filePath = join(process.cwd(), 'src/content/blog', `${slug}-${locale}.mdx`);
      const fileContent = readFileSync(filePath, 'utf-8');
      const { data, content: mdxContent } = matter(fileContent);

      const chunks = chunkText(mdxContent);

      chunks.forEach((chunk, index) => {
        content.push({
          id: `blog-${locale}-${slug}-chunk-${index}`,
          content: chunk,
          metadata: {
            id: `blog-${locale}-${slug}`,
            type: 'blog',
            locale,
            title: data.title || slug,
            description: data.excerpt || '',
            url: `/${locale}/blog/${slug}`,
            section: 'blog',
            content: chunk,
            chunk: index,
            totalChunks: chunks.length,
            lastModified: data.publishedAt || new Date().toISOString(),
            tags: data.tags || [],
          },
        });
      });
    } catch (error) {
      console.error(`Error extracting blog post ${slug}:`, error);
    }
  }

  return content;
}

// Index content to Pinecone
export async function indexContent(items: IndexableContent[]) {
  const index = getIndex();
  const batchSize = 100;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    try {
      // Generate embeddings for the batch
      const texts = batch.map((item) => `${item.metadata.title}\n\n${item.content}`);
      const embeddings = await generateEmbeddings(texts);

      // Prepare vectors for Pinecone
      const vectors = batch.map((item, idx) => ({
        id: item.id,
        values: embeddings[idx],
        metadata: {
          ...item.metadata,
          contentPreview: item.content.substring(0, 200) + '...',
        },
      }));

      // Upsert to Pinecone with environment-specific namespace
      const environment = batch[0].metadata.environment || 'development';
      const namespace = `${environment}-${batch[0].metadata.locale}`;
      await index.namespace(namespace).upsert(vectors);

      console.log(`Indexed batch ${i / batchSize + 1} (${vectors.length} items)`);
    } catch (error) {
      console.error(`Error indexing batch ${i / batchSize + 1}:`, error);
    }
  }
}

// Helper functions
function extractTitle(content: string): string {
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1] : 'Untitled';
}

function extractDescription(content: string): string {
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  return descMatch ? descMatch[1] : '';
}

function extractTextContent(content: string): string {
  // Remove JSX/TSX code, keep only text
  return content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]+\}/g, ' ')
    .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
    .replace(/export\s+.*?;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function determinePageType(path: string): ContentMetadata['type'] {
  if (path.includes('blog')) return 'blog';
  if (path.includes('cases')) return 'case';
  if (path.includes('services')) return 'service';
  if (path.includes('docs')) return 'doc';
  return 'page';
}
