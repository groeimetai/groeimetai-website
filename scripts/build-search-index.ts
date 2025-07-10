#!/usr/bin/env tsx

import { extractPageContent, extractBlogPosts, indexContent } from '../src/lib/pinecone/indexer';
import { crawlWebsite } from '../src/lib/pinecone/crawler';
import { getIndex } from '../src/lib/pinecone/client';
import type { IndexableContent } from '../src/lib/pinecone/indexer';

// Helper functions for extracting dynamic pages
async function extractServicePage(slug: string, locale: 'en' | 'nl'): Promise<IndexableContent[]> {
  // Services use [slug] dynamic route
  return extractPageContent(`/services/[slug]`, locale, { slug });
}

async function extractCasePage(slug: string, locale: 'en' | 'nl'): Promise<IndexableContent[]> {
  // Cases use [slug] dynamic route
  return extractPageContent(`/cases/[slug]`, locale, { slug });
}

// Pages to index (actual existing pages)
const PAGES_TO_INDEX = [
  '/about',
  '/services',
  '/advisory-services',
  '/cases',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
];

// Dynamic service pages to index
const SERVICE_SLUGS = [
  'strategy',
  'transformation',
  'governance',
  'innovation',
  'advisory',
  'adoption',
];

// Dynamic case study pages
const CASE_SLUGS = [
  'enterprise-llm-implementation',
  'snelnotuleren-ai-transcription',
  'groeimetai-learning-platform',
  'intelligent-routing-system',
];

async function buildSearchIndex() {
  const environment = process.env.INDEX_ENVIRONMENT || 'development';
  const baseUrl = process.env.BASE_URL; // Set by Cloud Build for live crawling

  console.log(`🔍 Building search index for GroeimetAI website (${environment})...`);
  if (baseUrl) {
    console.log(`🌐 Crawling live website at: ${baseUrl}`);
  } else {
    console.log(`📁 Using local files for development`);
  }

  let allContent: IndexableContent[] = [];
  const locales: ('en' | 'nl')[] = ['en', 'nl'];

  try {
    // Always clear existing index for fresh data
    console.log('Clearing existing index...');
    const pineconeIndex = getIndex();

    for (const locale of locales) {
      const namespace = `${environment}-${locale}`; // e.g., production-en, staging-nl
      try {
        await pineconeIndex.namespace(namespace).deleteAll();
        console.log(`  ✓ Cleared ${namespace} namespace`);
      } catch (error) {
        console.log(`  - Namespace ${namespace} doesn't exist yet, will be created`);
      }
    }

    // Extract content based on environment
    if (baseUrl) {
      // Crawl live website for production/staging
      allContent = await crawlWebsite(baseUrl, locales, environment);
    } else {
      // Use local files for development
      for (const locale of locales) {
        console.log(`\n📄 Extracting content for locale: ${locale}`);

        // Extract regular pages
        for (const page of PAGES_TO_INDEX) {
          console.log(`  - Extracting ${page}`);
          const pageContent = await extractPageContent(page, locale);
          allContent.push(...pageContent);
        }

        // Extract service pages
        for (const slug of SERVICE_SLUGS) {
          console.log(`  - Extracting /services/${slug}`);
          const pageContent = await extractServicePage(slug, locale);
          allContent.push(...pageContent);
        }

        // Extract case study pages
        for (const slug of CASE_SLUGS) {
          console.log(`  - Extracting /cases/${slug}`);
          const pageContent = await extractCasePage(slug, locale);
          allContent.push(...pageContent);
        }

        // Extract blog posts
        console.log(`  - Extracting blog posts`);
        const blogContent = await extractBlogPosts(locale);
        allContent.push(...blogContent);

        // Add environment to all content metadata
        allContent.forEach((item) => {
          item.metadata.environment = environment;
        });
      }
    }

    console.log(`\n📊 Total content items to index: ${allContent.length}`);

    // Index all content
    console.log('\n🚀 Indexing content to Pinecone...');
    await indexContent(allContent);

    console.log('\n✅ Search index built successfully!');
    console.log(`   Total items indexed: ${allContent.length}`);

    // Verify index stats
    const statsIndex = getIndex();
    for (const locale of locales) {
      const namespace = `${environment}-${locale}`;
      const stats = await statsIndex.namespace(namespace).describeIndexStats();
      console.log(`   ${namespace}: ${stats.totalRecordCount || 0} vectors`);
    }
  } catch (error) {
    console.error('\n❌ Error building search index:', error);
    process.exit(1);
  }
}

// Check for required environment variables
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY environment variable is required');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

// Run the indexing
buildSearchIndex();
