import { getIndex } from './client';
import { generateEmbedding } from '../embeddings/openai';
import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

export interface SearchResult {
  id: string;
  score: number;
  title: string;
  description: string;
  url: string;
  content: string;
  highlight: string;
  type: string;
  locale: string;
}

export interface SearchOptions {
  query: string;
  locale: 'en' | 'nl';
  limit?: number;
  filter?: {
    type?: string[];
    section?: string[];
    tags?: string[];
  };
  includeContext?: boolean;
}

export async function searchContent(options: SearchOptions): Promise<{
  results: SearchResult[];
  context?: string;
  totalResults: number;
}> {
  const { query, locale, limit = 10, filter, includeContext = false } = options;

  try {
    // Check if API keys are configured
    if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
      console.warn('Search API keys not configured');
      return { results: [], totalResults: 0 };
    }
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Build filter conditions
    const filterConditions: any = {};
    if (filter?.type) {
      filterConditions.type = { $in: filter.type };
    }
    if (filter?.section) {
      filterConditions.section = { $in: filter.section };
    }
    if (filter?.tags) {
      filterConditions.tags = { $in: filter.tags };
    }

    // Determine environment for namespace
    const environment =
      process.env.NODE_ENV === 'production'
        ? 'production'
        : process.env.INDEX_ENVIRONMENT || 'development';
    const namespace = `${environment}-${locale}`;

    // Query Pinecone
    const index = getIndex();
    const queryResponse = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK: limit * 2, // Get more results to deduplicate
      includeMetadata: true,
      filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined,
    });

    // Deduplicate results by page ID (keep best scoring chunk per page)
    const pageScores = new Map<string, any>();

    queryResponse.matches.forEach((match) => {
      const pageId = match.metadata?.id as string;
      if (!pageScores.has(pageId) || (match.score && match.score > pageScores.get(pageId).score)) {
        pageScores.set(pageId, match);
      }
    });

    // Convert to search results
    const results: SearchResult[] = Array.from(pageScores.values())
      .slice(0, limit)
      .map((match) => ({
        id: match.metadata?.id as string,
        score: match.score,
        title: match.metadata?.title as string,
        description: match.metadata?.description as string,
        url: match.metadata?.url as string,
        content: match.metadata?.content as string,
        highlight: createHighlight(match.metadata?.content as string, query),
        type: match.metadata?.type as string,
        locale: match.metadata?.locale as string,
      }));

    // Generate RAG context if requested
    let context: string | undefined;
    if (includeContext && results.length > 0) {
      context = await generateRAGResponse(query, results, locale);
    }

    return {
      results,
      context,
      totalResults: results.length,
    };
  } catch (error) {
    console.error('Search error:', error);
    return { results: [], totalResults: 0 };
  }
}

// Create a text highlight around the query terms
function createHighlight(content: string, query: string): string {
  const queryWords = query.toLowerCase().split(/\s+/);
  const sentences = content.split(/[.!?]+/);

  // Find the sentence with the most query words
  let bestSentence = '';
  let maxMatches = 0;

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const matches = queryWords.filter((word) => lowerSentence.includes(word)).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestSentence = sentence.trim();
    }
  }

  // Return the best sentence or first 150 chars if no matches
  return bestSentence || content.substring(0, 150) + '...';
}

// Generate RAG response using retrieved context
async function generateRAGResponse(
  query: string,
  results: SearchResult[],
  locale: 'en' | 'nl'
): Promise<string> {
  const context = results.map((r, i) => `[${i + 1}] ${r.title}\n${r.content}`).join('\n\n');

  const systemPrompt =
    locale === 'nl'
      ? `Je bent een behulpzame AI-assistent voor GroeimetAI. Beantwoord vragen op basis van de gegeven context. Wees beknopt en accuraat. Als het antwoord niet in de context staat, zeg dat dan eerlijk.`
      : `You are a helpful AI assistant for GroeimetAI. Answer questions based on the given context. Be concise and accurate. If the answer is not in the context, say so honestly.`;

  const userPrompt =
    locale === 'nl'
      ? `Context:\n${context}\n\nVraag: ${query}\n\nGeef een beknopt antwoord op basis van de context.`
      : `Context:\n${context}\n\nQuestion: ${query}\n\nProvide a concise answer based on the context.`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating RAG response:', error);
    return '';
  }
}
