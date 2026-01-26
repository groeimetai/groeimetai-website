import { NextRequest, NextResponse } from 'next/server';
import { adminDb, serverTimestamp } from '@/lib/firebase/admin';
import { getMollieService } from '@/services/mollieService';
import { invoiceService } from '@/services/invoiceService';
import { verifyIdToken } from '@/lib/firebase/admin';

// POST /api/invoices/sync-all-payments
// Batch syncs all open invoices with Mollie payment status
export async function POST(request: NextRequest) {
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

    // Get all invoices with status 'sent', 'viewed', or 'overdue'
    const openStatuses = ['sent', 'viewed', 'overdue'];
    const invoicesSnapshot = await adminDb
      .collection('invoices')
      .where('status', 'in', openStatuses)
      .get();

    const results = {
      total: invoicesSnapshot.docs.length,
      synced: 0,
      updated: 0,
      noPayment: 0,
      errors: 0,
      details: [] as Array<{
        invoiceId: string;
        invoiceNumber: string;
        status: string;
        mollieStatus: string | null;
        updated: boolean;
        error?: string;
      }>,
    };

    const mollieService = getMollieService();

    // Process each invoice
    for (const doc of invoicesSnapshot.docs) {
      const invoice = { id: doc.id, ...doc.data() } as any;

      try {
        // Find Mollie payment for this invoice
        let molliePaymentId = invoice.paymentDetails?.transactionId;

        if (!molliePaymentId) {
          // Check payments collection
          const paymentsSnapshot = await adminDb
            .collection('payments')
            .where('invoiceId', '==', invoice.id)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

          if (!paymentsSnapshot.empty) {
            molliePaymentId = paymentsSnapshot.docs[0].data().molliePaymentId;
          }
        }

        if (!molliePaymentId) {
          results.noPayment++;
          results.details.push({
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            status: invoice.status,
            mollieStatus: null,
            updated: false,
          });
          continue;
        }

        // Fetch status from Mollie
        const molliePayment = await mollieService.getPayment(molliePaymentId);
        const mollieStatus = molliePayment.status;

        let updated = false;

        // Update invoice if payment is now paid
        if (mollieStatus === 'paid' && invoice.status !== 'paid') {
          await invoiceService.updatePaymentStatus(invoice.id, 'paid', {
            paymentMethod: molliePayment.method || 'unknown',
            paidAmount: parseFloat(molliePayment.amount.value),
            transactionId: molliePayment.id,
          });
          updated = true;
          results.updated++;
        }

        // Update sync timestamp and Mollie status on invoice
        await adminDb.collection('invoices').doc(invoice.id).update({
          lastPaymentSync: serverTimestamp(),
          molliePaymentStatus: mollieStatus,
        });

        results.synced++;
        results.details.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          status: updated ? 'paid' : invoice.status,
          mollieStatus,
          updated,
        });

      } catch (error) {
        results.errors++;
        results.details.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          mollieStatus: null,
          updated: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Store last sync timestamp
    await adminDb.collection('system').doc('paymentSync').set({
      lastSyncAt: serverTimestamp(),
      syncedBy: decodedToken.uid,
      results: {
        total: results.total,
        synced: results.synced,
        updated: results.updated,
        noPayment: results.noPayment,
        errors: results.errors,
      },
    }, { merge: true });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error syncing all payments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync payments' },
      { status: 500 }
    );
  }
}

// GET /api/invoices/sync-all-payments
// Get last sync status
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get last sync info
    const syncDoc = await adminDb.collection('system').doc('paymentSync').get();

    if (!syncDoc.exists) {
      return NextResponse.json({
        success: true,
        data: {
          lastSyncAt: null,
          syncedBy: null,
          results: null,
        },
      });
    }

    const syncData = syncDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        lastSyncAt: syncData?.lastSyncAt?.toDate?.() || syncData?.lastSyncAt || null,
        syncedBy: syncData?.syncedBy || null,
        results: syncData?.results || null,
      },
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
