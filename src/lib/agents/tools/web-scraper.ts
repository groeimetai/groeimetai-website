import * as cheerio from 'cheerio';
import { z } from 'zod';

export class WebScraperTool {
  private allowedDomains = [
    'groeimetai.com',
    'www.groeimetai.com',
    'groeimetai.io',
    'www.groeimetai.io',
  ];

  async scrape(url: string, selector?: string): Promise<string> {
    try {
      // Validate URL
      const urlObj = new URL(url);
      const isAllowed = this.allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        return 'I can only scrape content from GroeimetAI domains for security reasons.';
      }

      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GroeimetAI-Bot/1.0',
        },
      });

      if (!response.ok) {
        return `Failed to fetch page: ${response.status} ${response.statusText}`;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script and style elements
      $('script, style, noscript').remove();

      // Extract content based on selector or default extraction
      let content: string;
      
      if (selector) {
        content = $(selector).text().trim();
      } else {
        // Default extraction strategy
        const mainContent = $('main, article, .content, #content').first();
        
        if (mainContent.length > 0) {
          content = mainContent.text().trim();
        } else {
          // Fallback to body content
          content = $('body').text().trim();
        }
      }

      // Clean up whitespace
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // Limit content length
      if (content.length > 5000) {
        content = content.substring(0, 5000) + '...';
      }

      // Extract metadata
      const title = $('title').text() || '';
      const description = $('meta[name="description"]').attr('content') || '';
      const keywords = $('meta[name="keywords"]').attr('content') || '';

      return `
Title: ${title}
Description: ${description}
${keywords ? `Keywords: ${keywords}` : ''}

Content:
${content}
`;
    } catch (error) {
      console.error('Scraping error:', error);
      return `Failed to scrape content: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async scrapeStructured(url: string): Promise<{
    title: string;
    description: string;
    content: string;
    images: string[];
    links: string[];
    metadata: Record<string, string>;
  }> {
    try {
      const urlObj = new URL(url);
      const isAllowed = this.allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        throw new Error('Domain not allowed');
      }

      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $('script, style, noscript').remove();

      // Extract structured data
      const title = $('title').text() || '';
      const description = $('meta[name="description"]').attr('content') || '';
      
      // Extract main content
      const mainContent = $('main, article, .content').first().text().trim() || $('body').text().trim();
      
      // Extract images
      const images: string[] = [];
      $('img').each((_, elem) => {
        const src = $(elem).attr('src');
        if (src) {
          const absoluteUrl = new URL(src, url).toString();
          images.push(absoluteUrl);
        }
      });

      // Extract links
      const links: string[] = [];
      $('a[href]').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href && !href.startsWith('#')) {
          try {
            const absoluteUrl = new URL(href, url).toString();
            links.push(absoluteUrl);
          } catch {}
        }
      });

      // Extract metadata
      const metadata: Record<string, string> = {};
      $('meta').each((_, elem) => {
        const name = $(elem).attr('name') || $(elem).attr('property');
        const content = $(elem).attr('content');
        if (name && content) {
          metadata[name] = content;
        }
      });

      return {
        title,
        description,
        content: mainContent.substring(0, 5000),
        images: images.slice(0, 10),
        links: links.slice(0, 20),
        metadata,
      };
    } catch (error) {
      throw error;
    }
  }
}