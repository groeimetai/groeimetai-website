import { NextRequest, NextResponse } from 'next/server';
import { adminDb, serverTimestamp } from '@/lib/firebase/admin';
import { createMollieClient } from '@mollie/api-client';

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

    // Check Mollie API key
    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      console.error('MOLLIE_API_KEY not configured');
      return NextResponse.json(
        { error: 'Betalingsservice is niet geconfigureerd. Neem contact op met support.' },
        { status: 503 }
      );
    }

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;
    const redirectUrl = `${baseUrl}/betalen/${params.id}/success`;
    const cancelUrl = `${baseUrl}/betalen/${params.id}`;
    const webhookUrl = `${baseUrl}/api/webhooks/mollie`;

    // Get client details using Admin SDK
    let clientLocale = 'nl_NL';
    if (invoice.clientId && invoice.clientId !== 'manual') {
      try {
        const clientDoc = await adminDb.collection('users').doc(invoice.clientId).get();
        if (clientDoc.exists) {
          const client = clientDoc.data();
          clientLocale = client?.preferences?.language === 'en' ? 'en_US' : 'nl_NL';
        }
      } catch (e) {
        console.warn('Could not fetch client for locale:', e);
      }
    }

    // Create Mollie payment directly
    const mollieClient = createMollieClient({ apiKey });
    const paymentAmount = invoice.financial?.balance || invoice.financial?.total || 0;

    const molliePayment = await mollieClient.payments.create({
      amount: {
        value: paymentAmount.toFixed(2),
        currency: invoice.financial?.currency || 'EUR',
      },
      description: `Factuur ${invoice.invoiceNumber}`,
      redirectUrl: redirectUrl,
      webhookUrl: webhookUrl,
      metadata: {
        invoiceId: invoice.id,
        clientId: invoice.clientId || 'manual',
        invoiceNumber: invoice.invoiceNumber,
      },
      locale: clientLocale as any,
    });

    // Create payment record using Admin SDK
    const paymentRef = adminDb.collection('payments').doc();
    await paymentRef.set({
      id: paymentRef.id,
      invoiceId: invoice.id,
      clientId: invoice.clientId || 'manual',
      amount: molliePayment.amount,
      status: molliePayment.status,
      description: molliePayment.description,
      metadata: {
        invoiceId: invoice.id,
        clientId: invoice.clientId || 'manual',
        invoiceNumber: invoice.invoiceNumber,
      },
      molliePaymentId: molliePayment.id,
      checkoutUrl: (molliePayment as any)._links?.checkout?.href,
      webhookUrl: webhookUrl,
      redirectUrl: redirectUrl,
      cancelUrl: cancelUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt: molliePayment.expiresAt ? new Date(molliePayment.expiresAt) : null,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          paymentId: paymentRef.id,
          checkoutUrl: (molliePayment as any)._links?.checkout?.href,
          expiresAt: molliePayment.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating public payment:', error);

    return NextResponse.json(
      {
        error: 'Kon betaling niet aanmaken',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
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
