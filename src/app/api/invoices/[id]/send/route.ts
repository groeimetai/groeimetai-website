import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';

// POST /api/invoices/[id]/send
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get invoice to check permissions using dynamic import
    const { getDoc, doc } = await import('firebase/firestore');
    const { db, collections } = await import('@/lib/firebase');
    
    const invoiceDoc = await getDoc(doc(db, collections.invoices, params.id));
    
    if (!invoiceDoc.exists()) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() } as any;

    // Check permissions: admin, consultant, or the client who owns the invoice
    const hasPermission = 
      decodedToken.role === 'admin' || 
      decodedToken.role === 'consultant' ||
      (invoice.clientId === decodedToken.uid);

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

    // If no email provided, get from client
    let email = recipientEmail;
    let name = recipientName;
    
    if (!email) {
      const { getDoc, doc } = await import('firebase/firestore');
      const { db, collections } = await import('@/lib/firebase');
      
      const clientDoc = await getDoc(doc(db, collections.users, invoice.clientId));
      const client = clientDoc.data();
      
      if (!client?.email) {
        return NextResponse.json(
          { error: 'No email address found for invoice recipient' },
          { status: 400 }
        );
      }
      
      email = client.email;
      name = client.fullName || client.displayName || undefined;
    }

    // Send the invoice using dynamic import
    const { invoiceService } = await import('@/services/invoiceService');
    await invoiceService.sendInvoice(params.id, email, name);

    return NextResponse.json(
      {
        success: true,
        message: `Invoice ${invoice.invoiceNumber} sent successfully to ${email}`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending invoice:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to send invoice',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}