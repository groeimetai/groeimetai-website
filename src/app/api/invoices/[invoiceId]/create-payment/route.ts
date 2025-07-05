import { NextRequest, NextResponse } from 'next/server';
import { mollieService, InvoiceData } from '@/services/mollieService';
import { firebaseDocumentService } from '@/services/firebaseDocumentService';
import { getServerSession } from 'next-auth';

/**
 * POST /api/invoices/[invoiceId]/create-payment
 * Create a Mollie payment link for an invoice
 */
export async function POST(
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
    const invoice = await firebaseDocumentService.getDocument({
      collection: 'invoices',
      docId: invoiceId,
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      );
    }

    // Check if invoice has a pending payment
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

    // Prepare invoice data for Mollie
    const invoiceData: InvoiceData = {
      id: invoiceId,
      customerId: invoice.customerId || session.user?.id || 'unknown',
      customerName: invoice.customerName || session.user?.name || 'Customer',
      amount: invoice.totalAmount || invoice.amount,
      currency: invoice.currency || 'EUR',
      description: invoice.description,
      items: invoice.items?.map((item: any) => ({
        description: item.description || item.name,
        quantity: item.quantity || 1,
        price: item.price || item.amount,
      })),
    };

    // Create payment
    const paymentResult = await mollieService.createPayment(invoiceData);

    // Update invoice with payment details
    await firebaseDocumentService.updateDocument({
      collection: 'invoices',
      docId: invoiceId,
      data: {
        paymentDetails: {
          paymentId: paymentResult.paymentId,
          checkoutUrl: paymentResult.checkoutUrl,
          status: paymentResult.status,
          createdAt: new Date().toISOString(),
        },
        status: 'pending_payment',
        updatedAt: new Date().toISOString(),
      },
    });

    // Log activity
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
    const invoice = await firebaseDocumentService.getDocument({
      collection: 'invoices',
      docId: invoiceId,
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if invoice has payment details
    if (!invoice.paymentDetails?.paymentId) {
      return NextResponse.json({
        status: 'no_payment',
        message: 'No payment has been created for this invoice',
      });
    }

    // Get payment status from Mollie
    const payment = await mollieService.getPayment(invoice.paymentDetails.paymentId);

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      statusText: mollieService.getPaymentStatusText(payment.status),
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