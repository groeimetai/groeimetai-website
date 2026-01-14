import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// POST /api/invoices/[id]/pay - Public endpoint to create payment for invoice
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get invoice using Admin SDK (no auth required for this endpoint)
    const invoiceDoc = await adminDb.collection('invoices').doc(params.id).get();

    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() } as any;

    // Check if invoice can be paid
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Deze factuur is al betaald' }, { status: 400 });
    }

    if (invoice.status === 'cancelled') {
      return NextResponse.json({ error: 'Deze factuur is geannuleerd' }, { status: 400 });
    }

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;
    const redirectUrl = `${baseUrl}/betalen/${params.id}/success`;
    const cancelUrl = `${baseUrl}/betalen/${params.id}`;
    const webhookUrl = `${baseUrl}/api/webhooks/mollie`;

    // Create payment using dynamic import
    const { paymentService } = await import('@/services/paymentService');
    const payment = await paymentService.createPayment({
      invoiceId: params.id,
      redirectUrl,
      webhookUrl,
      cancelUrl,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          paymentId: payment.id,
          checkoutUrl: payment.checkoutUrl,
          expiresAt: payment.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating public payment:', error);

    if (error instanceof Error) {
      if (error.message === 'Payment service not configured') {
        return NextResponse.json(
          { error: 'Betalingsservice is niet geconfigureerd. Neem contact op met support.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Kon betaling niet aanmaken',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// GET /api/invoices/[id]/pay - Get invoice details for payment page (public)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get invoice using Admin SDK
    const invoiceDoc = await adminDb.collection('invoices').doc(params.id).get();

    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoiceData = invoiceDoc.data() as any;

    // Return only public-safe invoice data
    return NextResponse.json({
      success: true,
      data: {
        id: invoiceDoc.id,
        invoiceNumber: invoiceData.invoiceNumber,
        status: invoiceData.status,
        total: invoiceData.financial?.total || 0,
        balance: invoiceData.financial?.balance || invoiceData.financial?.total || 0,
        currency: invoiceData.financial?.currency || 'EUR',
        dueDate: invoiceData.dueDate?.toDate?.()?.toISOString() || invoiceData.dueDate,
        clientName: invoiceData.clientName || invoiceData.billingDetails?.companyName || invoiceData.billingDetails?.contactName,
        items: invoiceData.items?.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          total: item.total,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching invoice for payment:', error);

    return NextResponse.json(
      { error: 'Kon factuurgegevens niet ophalen' },
      { status: 500 }
    );
  }
}
