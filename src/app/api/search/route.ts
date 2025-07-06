import { NextRequest, NextResponse } from 'next/server';
import { searchContent } from '@/lib/pinecone/search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, locale = 'en', limit = 10, filter, includeContext = false } = body;
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Validate locale
    if (!['en', 'nl'].includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale. Must be "en" or "nl"' },
        { status: 400 }
      );
    }
    
    // Perform search
    const results = await searchContent({
      query,
      locale,
      limit,
      filter,
      includeContext,
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', results: [], totalResults: 0 },
      { status: 500 }
    );
  }
}

// Also support GET for simple queries
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'nl';
  const limit = parseInt(searchParams.get('limit') || '10');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }
  
  const results = await searchContent({
    query,
    locale,
    limit,
    includeContext: false,
  });
  
  return NextResponse.json(results);
}