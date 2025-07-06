import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 1024, // Match Pinecone configuration
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: texts,
      dimensions: 1024,
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

// Chunk text into smaller pieces for better retrieval
export function chunkText(text: string, maxTokens: number = 500, overlap: number = 50): string[] {
  // Simple word-based chunking (more sophisticated tokenization can be added)
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  const wordsPerChunk = Math.floor(maxTokens * 0.75); // Rough estimate
  const overlapWords = Math.floor(overlap * 0.75);
  
  for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
    const chunk = words.slice(i, i + wordsPerChunk).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }
  }
  
  return chunks;
}