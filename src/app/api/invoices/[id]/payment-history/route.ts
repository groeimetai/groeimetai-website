import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyIdToken } from '@/lib/firebase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/invoices/[id]/payment-history
// Gets all payment attempts for an invoice
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const verificationResult = await verifyIdToken(token);

    if (!verificationResult.valid || !verificationResult.decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id: invoiceId } = await params;

    // Get all payments for this invoice
    const paymentsSnapshot = await adminDb
      .collection('payments')
      .where('invoiceId', '==', invoiceId)
      .orderBy('createdAt', 'desc')
      .get();

    const payments = paymentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        molliePaymentId: data.molliePaymentId || null,
        amount: data.amount || null,
        status: data.status || 'unknown',
        method: data.method || null,
        description: data.description || null,
        checkoutUrl: data.checkoutUrl || null,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
        paidAt: data.paidAt?.toDate?.() || data.paidAt || null,
        failedAt: data.failedAt?.toDate?.() || data.failedAt || null,
        cancelledAt: data.cancelledAt?.toDate?.() || data.cancelledAt || null,
        expiresAt: data.expiresAt?.toDate?.() || data.expiresAt || null,
      };
    });

    // Get invoice details including sync info
    const invoiceDoc = await adminDb.collection('invoices').doc(invoiceId).get();
    const invoiceData = invoiceDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        payments,
        invoiceStatus: invoiceData?.status || null,
        molliePaymentStatus: invoiceData?.molliePaymentStatus || null,
        lastPaymentSync: invoiceData?.lastPaymentSync?.toDate?.() || invoiceData?.lastPaymentSync || null,
      },
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get payment history' },
      { status: 500 }
    );
  }
}
