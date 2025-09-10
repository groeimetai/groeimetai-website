import * as cheerio from 'cheerio';
import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from '../embeddings/openai';
import { v4 as uuidv4 } from 'uuid';

interface PageContent {
  url: string;
  title: string;
  description: string;
  content: string;
  sections: {
    heading: string;
    content: string;
  }[];
  metadata: {
    language: string;
    lastModified?: string;
    author?: string;
    keywords?: string[];
  };
}

export class WebScraperService {
  private pinecone: Pinecone | null = null;
  private indexName = 'groeimetai-website';
  
  constructor() {
    if (process.env.PINECONE_API_KEY) {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
    }
  }

  async scrapeAndIndex(urls: string[]): Promise<{
    success: boolean;
    indexed: number;
    errors: string[];
  }> {
    const results = {
      success: true,
      indexed: 0,
      errors: [] as string[],
    };

    for (const url of urls) {
      try {
        console.log(`Scraping: ${url}`);
        const content = await this.scrapePage(url);
        
        if (content) {
          await this.indexContent(content);
          results.indexed++;
          console.log(`✓ Indexed: ${url}`);
        }
      } catch (error) {
        const errorMsg = `Failed to process ${url}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.success = false;
      }
    }

    return results;
  }

  private async scrapePage(url: string): Promise<PageContent | null> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $('script, style, noscript, iframe').remove();

      // Extract title and meta
      const title = $('title').text() || $('h1').first().text() || '';
      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || '';
      const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [];

      // Detect language
      const language = $('html').attr('lang') || 
                      $('meta[property="og:locale"]').attr('content')?.substring(0, 2) || 
                      'nl';

      // Extract main content sections
      const sections: PageContent['sections'] = [];
      
      // Try to find main content area
      const mainSelectors = ['main', 'article', '.content', '#content', '[role="main"]'];
      let mainContent = null;
      
      for (const selector of mainSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          mainContent = element.first();
          break;
        }
      }

      // If no main content found, use body
      if (!mainContent) {
        mainContent = $('body');
      }

      // Extract sections with headings
      mainContent.find('h1, h2, h3, h4').each((_, elem) => {
        const heading = $(elem);
        const headingText = heading.text().trim();
        
        if (headingText) {
          // Get content until next heading
          let content = '';
          let current = heading.next();
          
          while (current.length > 0 && !current.is('h1, h2, h3, h4')) {
            const text = current.text().trim();
            if (text) {
              content += ' ' + text;
            }
            current = current.next();
          }
          
          if (content.trim()) {
            sections.push({
              heading: headingText,
              content: content.trim(),
            });
          }
        }
      });

      // Get full text content as fallback
      const fullContent = mainContent.text()
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .substring(0, 10000); // Limit to 10k chars

      return {
        url,
        title,
        description,
        content: fullContent,
        sections,
        metadata: {
          language,
          keywords,
        },
      };
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return null;
    }
  }

  private async indexContent(content: PageContent): Promise<void> {
    if (!this.pinecone) {
      console.warn('Pinecone not configured, skipping indexing');
      return;
    }

    const index = this.pinecone.index(this.indexName);
    const namespace = `production-${content.metadata.language}`;

    // Create chunks from content
    const chunks = this.createChunks(content);
    
    // Process chunks in batches
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      // Generate embeddings for batch
      const vectors = await Promise.all(
        batch.map(async (chunk) => {
          const embedding = await generateEmbedding(chunk.text);
          
          return {
            id: chunk.id,
            values: embedding,
            metadata: {
              ...chunk.metadata,
              url: content.url,
              title: content.title,
              description: content.description,
              language: content.metadata.language,
              type: 'webpage',
              timestamp: new Date().toISOString(),
            },
          };
        })
      );

      // Upsert to Pinecone
      await index.namespace(namespace).upsert(vectors);
    }
  }

  private createChunks(content: PageContent): Array<{
    id: string;
    text: string;
    metadata: Record<string, any>;
  }> {
    const chunks: Array<{
      id: string;
      text: string;
      metadata: Record<string, any>;
    }> = [];

    // Chunk size settings
    const maxChunkSize = 1000;
    const overlapSize = 100;

    // Create chunk from full content
    const fullTextChunks = this.splitTextIntoChunks(
      content.content,
      maxChunkSize,
      overlapSize
    );

    fullTextChunks.forEach((chunkText, index) => {
      chunks.push({
        id: `${uuidv4()}_full_${index}`,
        text: chunkText,
        metadata: {
          section: 'full_content',
          chunkIndex: index,
          totalChunks: fullTextChunks.length,
        },
      });
    });

    // Create chunks from sections
    content.sections.forEach((section, sectionIndex) => {
      const sectionText = `${section.heading}\n\n${section.content}`;
      const sectionChunks = this.splitTextIntoChunks(
        sectionText,
        maxChunkSize,
        overlapSize
      );

      sectionChunks.forEach((chunkText, chunkIndex) => {
        chunks.push({
          id: `${uuidv4()}_section_${sectionIndex}_${chunkIndex}`,
          text: chunkText,
          metadata: {
            section: section.heading,
            chunkIndex,
            totalChunks: sectionChunks.length,
          },
        });
      });
    });

    return chunks;
  }

  private splitTextIntoChunks(
    text: string,
    maxSize: number,
    overlap: number
  ): string[] {
    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    let previousChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          
          // Add overlap from end of current chunk
          const words = currentChunk.split(' ');
          const overlapWords = words.slice(-Math.floor(overlap / 5)); // Approximate words for overlap
          previousChunk = overlapWords.join(' ');
          
          currentChunk = previousChunk + ' ' + sentence;
        } else {
          // Single sentence exceeds max size, split it
          chunks.push(sentence.substring(0, maxSize).trim());
          currentChunk = sentence.substring(maxSize - overlap);
        }
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  async updateVectorStore(): Promise<{
    success: boolean;
    message: string;
    stats?: any;
  }> {
    try {
      // Define all pages to scrape
      const urls = [
        'https://groeimetai.com',
        'https://groeimetai.com/diensten',
        'https://groeimetai.com/cases',
        'https://groeimetai.com/over-ons',
        'https://groeimetai.com/contact',
        'https://groeimetai.com/blog',
        'https://groeimetai.com/en',
        'https://groeimetai.com/en/services',
        'https://groeimetai.com/en/cases',
        'https://groeimetai.com/en/about',
        'https://groeimetai.com/en/contact',
      ];

      console.log(`Starting vector store update with ${urls.length} URLs...`);
      
      const result = await this.scrapeAndIndex(urls);
      
      return {
        success: result.success,
        message: `Indexed ${result.indexed} pages successfully`,
        stats: {
          totalUrls: urls.length,
          indexed: result.indexed,
          failed: result.errors.length,
          errors: result.errors,
        },
      };
    } catch (error) {
      console.error('Vector store update failed:', error);
      return {
        success: false,
        message: `Update failed: ${error}`,
      };
    }
  }
}