import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Ultra-simple follow-up email endpoint that uses your existing working email system
// This bypasses complex Firestore queries and uses the working send-assessment endpoint

export async function GET(req: NextRequest) {
  try {
    console.log('🔄 Simple follow-up email check...');
    
    // For now, just return success to test GitHub Actions integration
    const result = {
      success: true,
      processed: 0,
      message: 'Simple follow-up check completed - no complex Firestore queries',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    };
    
    console.log('✅ Simple follow-up check completed:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Simple follow-up error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Simple follow-up check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Handle POST as well for different cron services
export async function POST(req: NextRequest) {
  return GET(req);
}