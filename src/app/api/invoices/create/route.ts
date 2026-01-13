import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import { InvoiceItem, InvoiceType, InvoiceBillingDetails } from '@/types';
import { isAdminEmail } from '@/lib/constants/adminEmails';

// POST /api/invoices/create
export async function POST(request: NextRequest) {
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

    // Check if user has permission to create invoices (admin or consultant)
    const userRole = decodedToken.role as string | undefined;
    const userRoles = (decodedToken.roles as string[] | undefined) || [];
    const userEmail = decodedToken.email as string | undefined;

    // Log for debugging
    console.log('Permission check - Email:', userEmail, 'Role:', userRole, 'IsAdminEmail:', userEmail ? isAdminEmail(userEmail) : false);

    // Check permission: custom claims OR admin email list
    // Note: Firestore role check removed due to Admin SDK auth issues in production
    const hasPermission =
      userRole === 'admin' ||
      userRole === 'consultant' ||
      userRoles.includes('admin') ||
      userRoles.includes('consultant') ||
      (userEmail && isAdminEmail(userEmail));

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create invoices' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['clientId', 'billingAddress', 'items', 'type', 'dueDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Validate billing address (allow empty values for flexibility)
    const { billingAddress, billingDetails } = body;
    if (!billingAddress) {
      return NextResponse.json(
        { error: 'Missing billing address' },
        { status: 400 }
      );
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Invoice must have at least one item' }, { status: 400 });
    }

    // Validate each item
    for (const item of body.items) {
      if (
        !item.description ||
        typeof item.quantity !== 'number' ||
        typeof item.unitPrice !== 'number'
      ) {
        return NextResponse.json(
          { error: 'Invalid item. Each item must have description, quantity, and unitPrice' },
          { status: 400 }
        );
      }
    }

    // Calculate item totals and tax
    const items: InvoiceItem[] = body.items.map((item: any) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      tax: item.tax || item.unitPrice * item.quantity * 0.21, // Default 21% VAT
      total: item.unitPrice * item.quantity,
      projectId: item.projectId,
      timeEntryIds: item.timeEntryIds,
    }));

    // Create invoice using dynamic import
    const { invoiceService } = await import('@/services/invoiceService');
    const invoice = await invoiceService.createInvoice({
      clientId: body.clientId,
      organizationId: body.organizationId,
      billingAddress: body.billingAddress,
      billingDetails: billingDetails as InvoiceBillingDetails | undefined,
      projectId: body.projectId,
      quoteId: body.quoteId,
      milestoneId: body.milestoneId,
      type: body.type as InvoiceType,
      items,
      dueDate: new Date(body.dueDate),
      issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
      createdBy: decodedToken.uid,
    });

    // Send invoice email if requested
    if (body.sendEmail) {
      // Get client email
      const { getDoc, doc } = await import('firebase/firestore');
      const { db, collections } = await import('@/lib/firebase/config');

      const clientDoc = await getDoc(doc(db, collections.users, body.clientId));
      const client = clientDoc.data();

      if (client?.email) {
        await invoiceService.sendInvoice(
          invoice.id,
          client.email,
          client.fullName || client.displayName
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: invoice,
        message: `Invoice ${invoice.invoiceNumber} created successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);

    return NextResponse.json(
      {
        error: 'Failed to create invoice',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
