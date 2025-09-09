import { NextRequest, NextResponse } from 'next/server';

// Build-safe payment webhook handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    
    console.log('Payment webhook received:', {
      bodyLength: body.length,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent')
    });
    
    return NextResponse.json({
      success: true,
      message: 'Webhook received successfully',
      processed: false // Placeholder - implement payment logic later
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Payment webhook endpoint is active',
    status: 'ready',
    timestamp: new Date().toISOString()
  });
}