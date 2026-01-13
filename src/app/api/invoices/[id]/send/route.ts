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

    // Determine email recipient (in order of priority):
    // 1. Use provided recipientEmail from request
    // 2. Use stored clientEmail on invoice
    // 3. Use email from billingDetails
    // 4. Look up from users collection
    let email = recipientEmail;
    let name = recipientName;

    if (!email) {
      // Try stored clientEmail on invoice first
      if (invoice.clientEmail) {
        email = invoice.clientEmail;
        name = name || invoice.clientName;
        console.log('Using clientEmail from invoice:', email);
      }
      // Try billingDetails email
      else if (invoice.billingDetails?.email) {
        email = invoice.billingDetails.email;
        name = name || invoice.billingDetails.contactName || invoice.billingDetails.companyName;
        console.log('Using email from billingDetails:', email);
      }
      // Fall back to looking up from users collection
      else if (invoice.clientId) {
        const clientDoc = await adminDb.collection('users').doc(invoice.clientId).get();
        const client = clientDoc.exists ? clientDoc.data() : null;

        if (client?.email) {
          email = client.email;
          name = name || client.fullName || client.displayName;
          console.log('Using email from users collection:', email);
        }
      }
    }

    // Final check - if still no email, return detailed error
    if (!email) {
      console.error('No email found for invoice:', {
        invoiceId: params.id,
        clientId: invoice.clientId,
        hasClientEmail: !!invoice.clientEmail,
        hasBillingDetails: !!invoice.billingDetails,
      });
      return NextResponse.json(
        {
          error: 'No email address found for invoice recipient.',
          hint: 'Please provide a recipientEmail in the request body.',
          invoiceId: params.id,
        },
        { status: 400 }
      );
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
