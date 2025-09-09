import { NextRequest, NextResponse } from 'next/server';

// Simple manual email scheduler trigger for development/testing
export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Manual email scheduler trigger');

    // Process any due emails immediately 
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/process-scheduled`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Email scheduler triggered',
        result
      });
    } else {
      throw new Error(`Scheduler failed: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Email scheduler trigger failed:', error);
    return NextResponse.json(
      { error: 'Failed to trigger email scheduler' },
      { status: 500 }
    );
  }
}

// GET endpoint to check scheduler status
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    status: 'ready',
    message: 'Email scheduler available - use POST to trigger processing'
  });
}