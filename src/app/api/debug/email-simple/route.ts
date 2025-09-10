import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Simple test - no Firebase dependencies
    const testData = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasFirebaseKeys: {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        adminProjectId: !!process.env.FIREBASE_PROJECT_ID,
        adminPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      },
      hasEmailConfig: {
        contactEmail: !!process.env.CONTACT_EMAIL,
        smtpHost: !!process.env.SMTP_HOST,
        smtpUser: !!process.env.SMTP_USER,
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Simple test endpoint working',
      debug: testData
    });

  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json(
      { 
        error: 'Simple test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Email debug endpoint is working',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasFirebaseConfig: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasAdminConfig: !!process.env.FIREBASE_PROJECT_ID
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}