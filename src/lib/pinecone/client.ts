import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone client
export const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

// Get the index (using the provided URL)
export const getIndex = () => {
  const indexName = 'groeimetai-website'; // Extract from URL
  return pineconeClient.index(indexName);
};

// Pinecone configuration
export const PINECONE_CONFIG = {
  indexName: 'groeimetai-website',
  dimension: 1024,
  metric: 'cosine',
  host: 'https://groeimetai-website-nylx9gi.svc.gcp-europe-west4-de1d.pinecone.io',
};