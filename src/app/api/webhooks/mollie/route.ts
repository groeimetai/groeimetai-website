import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';

// Mollie webhook IP allowlist (Mollie's production IPs)
// See: https://docs.mollie.com/overview/webhooks#webhook-endpoint-requirements
const MOLLIE_IPS = [
  '87.233.217.240', // Mollie production
  '87.233.217.241',
  '87.233.217.242',
  '87.233.217.243',
];

// Track processed webhook IDs to prevent replay attacks (simple in-memory cache)
const processedWebhooks = new Map<string, number>();
const WEBHOOK_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Clean up old entries periodically
function cleanupProcessedWebhooks() {
  const now = Date.now();
  const entries = Array.from(processedWebhooks.entries());
  for (const [key, timestamp] of entries) {
    if (now - timestamp > WEBHOOK_CACHE_TTL) {
      processedWebhooks.delete(key);
    }
  }
}

// POST /api/webhooks/mollie
export async function POST(request: NextRequest) {
  try {
    // Log webhook received
    console.log('Mollie webhook received');

    // Get client IP for validation
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // In production, verify the request comes from Mollie's IPs
    if (process.env.NODE_ENV === 'production' && process.env.MOLLIE_IP_VALIDATION !== 'false') {
      if (!MOLLIE_IPS.includes(clientIp)) {
        console.error('Webhook request from unauthorized IP:', clientIp);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Mollie sends webhooks as application/x-www-form-urlencoded
    // The body contains: id=tr_xxxxx or id=payment_xxxxx
    const body = await request.text();

    // Parse form-urlencoded body
    const params = new URLSearchParams(body);
    const paymentId = params.get('id');

    // Validate payment ID
    if (!paymentId) {
      console.error('Missing payment ID in webhook. Body:', body);
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 });
    }

    // Check for replay attacks
    const webhookKey = `${paymentId}-${Date.now().toString().slice(0, -4)}`; // ~10 second granularity
    if (processedWebhooks.has(paymentId)) {
      console.log('Duplicate webhook received for payment:', paymentId);
      // Still return 200 to acknowledge receipt
      return NextResponse.json({ status: 'ok', message: 'Already processed' }, { status: 200 });
    }

    // Mark as processed
    processedWebhooks.set(paymentId, Date.now());

    // Cleanup old entries (non-blocking)
    setTimeout(cleanupProcessedWebhooks, 0);

    // Log payment ID
    console.log('Processing payment webhook for:', paymentId);

    // Handle the webhook - this fetches the actual payment from Mollie's API
    // This is the security model: never trust webhook data, always verify with Mollie
    await paymentService.handleWebhook(paymentId);

    // Return success response
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);

    // For actual errors, return 500 so we can investigate
    // Mollie will retry webhooks that don't return 200
    // But we should not hide real errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
