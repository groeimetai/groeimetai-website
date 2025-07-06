import { Pinecone } from '@pinecone-database/pinecone';

// Lazy initialize Pinecone client
let pineconeClient: Pinecone | null = null;

export const getPineconeClient = () => {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY is not configured');
    }
    pineconeClient = new Pinecone({
      apiKey: apiKey,
    });
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
