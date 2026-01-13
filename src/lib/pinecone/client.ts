import { Pinecone } from '@pinecone-database/pinecone';

// Lazy initialize Pinecone client
let pineconeClient: Pinecone | null = null;

export const getPineconeClient = () => {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY is not configured');
    }
    
    try {
      pineconeClient = new Pinecone({
        apiKey: apiKey.trim(), // Remove any whitespace
      });
    } catch (error) {
      console.error('Failed to initialize Pinecone client:', error);
      console.log('API Key configured:', apiKey ? 'yes' : 'no');
      throw error;
    }
  }
  return pineconeClient;
};

// Get the index (using the provided URL)
export const getIndex = () => {
  const indexName = 'groeimetai-website'; // Extract from URL
  return getPineconeClient().index(indexName);
};

// Pinecone configuration
export const PINECONE_CONFIG = {
  indexName: 'groeimetai-website',
  dimension: 1024,
  metric: 'cosine',
  host: 'https://groeimetai-website-nylx9gi.svc.gcp-europe-west4-de1d.pinecone.io',
};
