import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';

// POST /api/webhooks/mollie
export async function POST(request: NextRequest) {
  try {
    // Log webhook received
    console.log('Mollie webhook received');

    // Get the raw body for signature verification
    const body = await request.text();

    // Get signature from headers (if Mollie implements this in the future)
    const signature = request.headers.get('x-mollie-signature') || '';

    // Verify webhook signature (currently Mollie doesn't sign webhooks by default)
    const isValid = paymentService.verifyWebhookSignature(body, signature);

    if (!isValid && process.env.NODE_ENV === 'production') {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the body
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('Failed to parse webhook body:', error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate webhook data
    if (!webhookData.id) {
      console.error('Missing payment ID in webhook');
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 });
    }

    // Log payment ID
    console.log('Processing payment webhook for:', webhookData.id);

    // Handle the webhook
    await paymentService.handleWebhook(webhookData.id);

    // Return success response
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);

    // Return success to prevent Mollie from retrying
    // Log the error for investigation
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }
}

// Mollie requires GET endpoint for webhook verification
export async function GET(request: NextRequest) {
  // This endpoint is used by Mollie to verify the webhook URL
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Mollie webhook endpoint active',
    },
    { status: 200 }
  );
}
