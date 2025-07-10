# Pinecone RAG Setup Guide

## Overview
The chatbot uses Pinecone vector database with RAG (Retrieval-Augmented Generation) to provide context-aware answers based on the website content.

## Local Development Setup

### 1. Environment Variables
Create a `.env.local` file in the project root:

```env
PINECONE_API_KEY=your-pinecone-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Run Content Indexing
To index the website content into Pinecone:

```bash
npm run index:content
```

This will:
- Clear existing content in the development namespace
- Index all pages, services, case studies, and blog posts
- Create embeddings using OpenAI's text-embedding-ada-002
- Store vectors in Pinecone with metadata

### 3. Test the Chatbot
The chatbot will automatically search Pinecone for relevant content when answering questions.

## Production Setup

### GitHub Secrets Required
Add these secrets to your GitHub repository:
- `PINECONE_API_KEY` - Your Pinecone API key
- `OPENAI_API_KEY` - Your OpenAI API key

### Automatic Indexing
The content is automatically indexed after each deployment:
1. GitHub Actions deploys the site
2. Waits 30 seconds for the site to stabilize
3. Runs `npm run index:content` with production environment
4. Indexes content into production-en and production-nl namespaces

## Pinecone Configuration

### Index Details
- **Index Name**: groeimetai-website
- **Dimension**: 1024 (for text-embedding-3-small)
- **Metric**: cosine
- **Region**: eu-west1 (Frankfurt)

### Namespaces
- `development-en` - English content for local development
- `development-nl` - Dutch content for local development
- `production-en` - English content for production
- `production-nl` - Dutch content for production

## Content Structure

The indexing script includes:
- **Pages**: About, Services, Contact, Privacy, Terms, Cookies
- **Services**: Strategy, Transformation, Governance, Innovation
- **Case Studies**: Enterprise LLM, Snelnotuleren, Learning Platform, Routing System
- **Blog Posts**: Multi-Agent Systems, RAG Architecture

## Troubleshooting

### "PINECONE_API_KEY is not configured"
- Ensure you have created `.env.local` with your API keys
- For production, check GitHub Secrets are set correctly

### "Search functionality is not configured"
- The chatbot will work without Pinecone but won't have RAG context
- Check that both PINECONE_API_KEY and OPENAI_API_KEY are set

### Empty search results
- Run `npm run index:content` to populate the index
- Check Pinecone dashboard to verify vectors are created
- Ensure you're using the correct namespace (development/production)

## Updating Content

When you update website content:
1. Update the content in `scripts/generate-content-index.ts`
2. Run `npm run index:content` locally to test
3. Commit and push - production will be indexed automatically

## Cost Considerations
- OpenAI API: ~$0.02 per 1M tokens for embeddings
- Pinecone: Free tier includes 1GB storage and 20K operations/month
- Each indexing run uses approximately 10K tokens