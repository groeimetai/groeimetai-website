import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import { paymentService } from '@/services/paymentService';
import { invoiceService } from '@/services/invoiceService';

// POST /api/payments/create
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const { valid, decodedToken } = await verifyIdToken(token);
    
    if (!valid || !decodedToken) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.invoiceId) {
      return NextResponse.json(
        { error: 'Missing required field: invoiceId' },
        { status: 400 }
      );
    }

    // Get invoice to check permissions
    const invoice = await invoiceService.getInvoice(body.invoiceId);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check permissions: anyone can pay their own invoice, admin/consultant can create payment links for any invoice
    const hasPermission = 
      invoice.clientId === decodedToken.uid ||
      decodedToken.role === 'admin' || 
      decodedToken.role === 'consultant';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create payment for this invoice' },
        { status: 403 }
      );
    }

    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      );
    }

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;
    const redirectUrl = body.redirectUrl || `${baseUrl}/dashboard/invoices/${body.invoiceId}/payment-success`;
    const cancelUrl = body.cancelUrl || `${baseUrl}/dashboard/invoices/${body.invoiceId}`;
    const webhookUrl = `${baseUrl}/api/webhooks/mollie`;

    // Create payment
    const payment = await paymentService.createPayment({
      invoiceId: body.invoiceId,
      redirectUrl,
      webhookUrl,
      cancelUrl
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          paymentId: payment.id,
          checkoutUrl: payment.checkoutUrl,
          expiresAt: payment.expiresAt
        },
        message: 'Payment created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message === 'Payment service not configured') {
        return NextResponse.json(
          { error: 'Payment service is not configured. Please contact support.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error: 'Failed to create payment',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}