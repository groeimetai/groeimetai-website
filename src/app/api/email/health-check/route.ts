import { NextRequest, NextResponse } from 'next/server';

// Simple health check to test if API routes work at all
export async function GET(req: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    
    console.log('🏥 Email automation health check at:', timestamp);
    
    // Test basic API functionality
    const basicTest = {
      timestamp,
      apiWorking: true,
      nodeEnv: process.env.NODE_ENV,
      hasFirebaseConfig: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      hasEmailConfig: !!(process.env.SMTP_HOST)
    };
    
    console.log('📊 Health check results:', basicTest);
    
    return NextResponse.json({
      success: true,
      message: 'Email automation health check passed',
      ...basicTest
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Also handle POST for cron services that might use POST
export async function POST(req: NextRequest) {
  return GET(req);
}