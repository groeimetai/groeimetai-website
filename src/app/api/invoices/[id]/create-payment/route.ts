import { NextRequest, NextResponse } from 'next/server';
import { getMollieService, type InvoiceData } from '@/services/mollieService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { Invoice } from '@/types';

/**
 * POST /api/invoices/[id]/create-payment
 * Create a Mollie payment link for an invoice
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const invoiceId = params.id;

    // Fetch invoice from Firebase
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);

    if (!invoiceSnap.exists()) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice;

    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      );
    }

    // TODO: Check if invoice has a pending payment once we add Mollie payment tracking to the Invoice model
    // For now, always create a new payment link
    /*
    if (invoice.paymentDetails?.paymentId && invoice.paymentDetails?.status === 'open') {
      // Check if the existing payment is still valid
      try {
        const existingPayment = await mollieService.getPayment(invoice.paymentDetails.paymentId);
        
        if (existingPayment.status === 'open' || existingPayment.status === 'pending') {
          // Return existing payment link
          return NextResponse.json({
            paymentId: existingPayment.id,
            checkoutUrl: existingPayment.getCheckoutUrl() || '',
            status: existingPayment.status,
            message: 'Using existing payment link',
          });
        }
      } catch (error) {
        // If we can't fetch the payment, create a new one
        console.log('Could not fetch existing payment, creating new one');
      }
    }
    */

    // Prepare invoice data for Mollie
    const invoiceData: InvoiceData = {
      id: invoiceId,
      customerId: invoice.clientId,
      customerName: 'Customer', // TODO: Fetch customer name from users collection
      amount: invoice.financial.total,
      currency: invoice.financial.currency || 'EUR',
      description: `Invoice ${invoice.invoiceNumber}`,
      items: invoice.items?.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
    };

    // Create payment
    const mollieService = getMollieService();
    const paymentResult = await mollieService.createPayment(invoiceData);

    // Update invoice with payment details
    const { updateDoc, Timestamp } = await import('firebase/firestore');
    await updateDoc(invoiceRef, {
      'paymentDetails.transactionId': paymentResult.paymentId,
      'paymentDetails.reference': paymentResult.checkoutUrl,
      'paymentDetails.notes': `Payment status: ${paymentResult.status}`,
      updatedAt: Timestamp.now(),
    });

    // TODO: Log activity once activity logs collection is set up
    /*
    await firebaseDocumentService.createDocument({
      collection: 'activityLogs',
      data: {
        type: 'payment_link_created',
        entityType: 'invoice',
        entityId: invoiceId,
        userId: session.user?.id || 'unknown',
        action: 'Created payment link',
        details: {
          paymentId: paymentResult.paymentId,
          amount: invoiceData.amount,
          currency: invoiceData.currency,
        },
        timestamp: new Date().toISOString(),
      },
    });
    */

    return NextResponse.json({
      success: true,
      ...paymentResult,
      message: 'Payment link created successfully',
    });

  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      {
        error: 'Failed to create payment link',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invoices/[invoiceId]/create-payment
 * Get payment status for an invoice
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { invoiceId } = params;

    // Fetch invoice from Firebase
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);

    if (!invoiceSnap.exists()) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice;

    // Check if invoice has payment details
    if (!invoice.paymentDetails?.transactionId) {
      return NextResponse.json({
        status: 'no_payment',
        message: 'No payment has been created for this invoice',
      });
    }

    // Get payment status from Mollie
    const mollieServiceInstance = getMollieService();
    const payment = await mollieServiceInstance.getPayment(invoice.paymentDetails.transactionId);

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      statusText: mollieServiceInstance.getPaymentStatusText(payment.status),
      amount: payment.amount,
      paidAt: payment.paidAt,
      method: payment.method,
      checkoutUrl: payment.getCheckoutUrl() || null,
    });

  } catch (error) {
    console.error('Error getting payment status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get payment status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}