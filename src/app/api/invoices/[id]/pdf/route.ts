import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import { isAdminEmail } from '@/lib/constants/adminEmails';

// GET /api/invoices/[id]/pdf
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get invoice using dynamic imports
    const { getDoc, doc } = await import('firebase/firestore');
    const { db, collections } = await import('@/lib/firebase/config');

    const invoiceDoc = await getDoc(doc(db, collections.invoices, params.id));

    if (!invoiceDoc.exists()) {
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
        { error: 'Insufficient permissions to view this invoice' },
        { status: 403 }
      );
    }

    // Check if we should return existing PDF URL or generate new one
    const action = request.nextUrl.searchParams.get('action');

    if (action === 'url' && invoice.pdfUrl) {
      // Return existing PDF URL
      return NextResponse.json(
        {
          success: true,
          pdfUrl: invoice.pdfUrl,
          generatedAt: invoice.pdfGeneratedAt,
        },
        { status: 200 }
      );
    }

    // Generate PDF buffer for direct download using dynamic import
    const { invoicePdfService } = await import('@/services/invoicePdfService');
    const pdfBuffer = Buffer.from(await invoicePdfService.generateInvoicePDF(invoice), 'base64');

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate invoice PDF',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
