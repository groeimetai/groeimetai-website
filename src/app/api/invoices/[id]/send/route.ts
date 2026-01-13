import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, adminDb, serverTimestamp } from '@/lib/firebase/admin';
import { isAdminEmail } from '@/lib/constants/adminEmails';

// POST /api/invoices/[id]/send
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Get invoice using Admin SDK
    const invoiceDoc = await adminDb.collection('invoices').doc(params.id).get();

    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() } as any;
    const userEmail = decodedToken.email as string | undefined;

    // Check permissions: admin, consultant, admin email, or the client who owns the invoice
    const hasPermission =
      decodedToken.role === 'admin' ||
      decodedToken.role === 'consultant' ||
      (userEmail && isAdminEmail(userEmail)) ||
      invoice.clientId === decodedToken.uid;

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to send this invoice' },
        { status: 403 }
      );
    }

    // Parse request body for optional email override
    const body = await request.json();
    const recipientEmail = body.recipientEmail;
    const recipientName = body.recipientName;

    // Determine email recipient:
    // 1. Use provided recipientEmail
    // 2. Use stored clientEmail on invoice
    // 3. Look up from users collection
    let email = recipientEmail;
    let name = recipientName;

    if (!email) {
      // Try stored clientEmail on invoice first
      if (invoice.clientEmail) {
        email = invoice.clientEmail;
        name = name || invoice.clientName;
      } else {
        // Fall back to looking up from users collection
        const clientDoc = await adminDb.collection('users').doc(invoice.clientId).get();
        const client = clientDoc.exists ? clientDoc.data() : null;

        if (!client?.email) {
          return NextResponse.json(
            { error: 'No email address found for invoice recipient. Please provide a recipient email.' },
            { status: 400 }
          );
        }

        email = client.email;
        name = name || client.fullName || client.displayName;
      }
    }

    // Set PDF URL if not already set
    if (!invoice.pdfUrl) {
      const pdfUrl = `/api/invoices/${invoice.id}/pdf`;
      await adminDb.collection('invoices').doc(params.id).update({
        pdfUrl,
        pdfGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      invoice.pdfUrl = pdfUrl;
    }

    // Send email using emailService
    const { emailService } = await import('@/services/emailService');
    await emailService.sendInvoiceEmail({
      recipientEmail: email,
      recipientName: name,
      invoice,
      pdfUrl: invoice.pdfUrl,
    });

    // Update invoice status to 'sent' using Admin SDK
    await adminDb.collection('invoices').doc(params.id).update({
      status: 'sent',
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `Invoice ${invoice.invoiceNumber} sent successfully to ${email}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending invoice:', error);

    return NextResponse.json(
      {
        error: 'Failed to send invoice',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
