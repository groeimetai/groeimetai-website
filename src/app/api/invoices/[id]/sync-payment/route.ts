import { NextRequest, NextResponse } from 'next/server';
import { adminDb, serverTimestamp } from '@/lib/firebase/admin';
import { getMollieService } from '@/services/mollieService';
import { invoiceService } from '@/services/invoiceService';
import { verifyIdToken } from '@/lib/firebase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/invoices/[id]/sync-payment
// Syncs the payment status of a single invoice with Mollie
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const verificationResult = await verifyIdToken(token);

    if (!verificationResult.valid || !verificationResult.decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const decodedToken = verificationResult.decodedToken;

    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: invoiceId } = await params;

    // Get invoice
    const invoice = await invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if invoice has payment details with a Mollie transaction ID
    const paymentDetails = (invoice as any).paymentDetails;
    const molliePaymentId = paymentDetails?.transactionId;

    if (!molliePaymentId) {
      // No Mollie payment exists for this invoice
      // Check if there are any payments in the payments collection
      const paymentsSnapshot = await adminDb
        .collection('payments')
        .where('invoiceId', '==', invoiceId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (paymentsSnapshot.empty) {
        return NextResponse.json({
          success: true,
          data: {
            invoiceId,
            mollieStatus: null,
            invoiceStatus: invoice.status,
            message: 'No Mollie payment found for this invoice',
            synced: false,
          },
        });
      }

      // Use the most recent payment
      const latestPayment = paymentsSnapshot.docs[0].data();
      if (!latestPayment.molliePaymentId) {
        return NextResponse.json({
          success: true,
          data: {
            invoiceId,
            mollieStatus: null,
            invoiceStatus: invoice.status,
            message: 'No Mollie payment ID found',
            synced: false,
          },
        });
      }
    }

    // Find the payment record
    let paymentId = molliePaymentId;
    if (!paymentId) {
      const paymentsSnapshot = await adminDb
        .collection('payments')
        .where('invoiceId', '==', invoiceId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!paymentsSnapshot.empty) {
        paymentId = paymentsSnapshot.docs[0].data().molliePaymentId;
      }
    }

    if (!paymentId) {
      return NextResponse.json({
        success: true,
        data: {
          invoiceId,
          mollieStatus: null,
          invoiceStatus: invoice.status,
          message: 'No Mollie payment found',
          synced: false,
        },
      });
    }

    // Fetch current status from Mollie
    const mollieService = getMollieService();
    const molliePayment = await mollieService.getPayment(paymentId);

    // Map Mollie status
    const statusMap: { [key: string]: string } = {
      open: 'pending',
      pending: 'pending',
      authorized: 'pending',
      paid: 'paid',
      failed: 'failed',
      canceled: 'canceled',
      expired: 'expired',
    };

    const mollieStatus = molliePayment.status;
    const mappedStatus = statusMap[mollieStatus] || mollieStatus;

    // Determine if we need to update the invoice
    let invoiceUpdated = false;
    let newInvoiceStatus = invoice.status;

    if (mollieStatus === 'paid' && invoice.status !== 'paid') {
      // Update invoice to paid
      await invoiceService.updatePaymentStatus(invoiceId, 'paid', {
        paymentMethod: molliePayment.method || 'unknown',
        paidAmount: parseFloat(molliePayment.amount.value),
        transactionId: molliePayment.id,
      });
      invoiceUpdated = true;
      newInvoiceStatus = 'paid';
    } else if (['failed', 'canceled', 'expired'].includes(mollieStatus) && invoice.status !== 'paid') {
      // Update payment record but keep invoice as sent/overdue
      const paymentsSnapshot = await adminDb
        .collection('payments')
        .where('molliePaymentId', '==', paymentId)
        .limit(1)
        .get();

      if (!paymentsSnapshot.empty) {
        await adminDb.collection('payments').doc(paymentsSnapshot.docs[0].id).update({
          status: mappedStatus,
          updatedAt: serverTimestamp(),
          ...(mollieStatus === 'failed' && { failedAt: serverTimestamp() }),
          ...(mollieStatus === 'canceled' && { cancelledAt: serverTimestamp() }),
        });
        invoiceUpdated = true;
      }
    }

    // Update last sync timestamp on invoice
    await adminDb.collection('invoices').doc(invoiceId).update({
      lastPaymentSync: serverTimestamp(),
      molliePaymentStatus: mollieStatus,
    });

    return NextResponse.json({
      success: true,
      data: {
        invoiceId,
        molliePaymentId: paymentId,
        mollieStatus,
        invoiceStatus: newInvoiceStatus,
        invoiceUpdated,
        paidAt: molliePayment.paidAt || null,
        method: molliePayment.method || null,
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error syncing payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync payment' },
      { status: 500 }
    );
  }
}
