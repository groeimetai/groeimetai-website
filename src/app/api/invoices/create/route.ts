import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, adminDb, serverTimestamp } from '@/lib/firebase/admin';
import { InvoiceItem, InvoiceType, InvoiceBillingDetails, Invoice } from '@/types';
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

    // Calculate item totals and tax - filter out undefined values for Firestore Admin SDK
    const items: InvoiceItem[] = body.items.map((item: any) => {
      const invoiceItem: any = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        tax: item.tax || item.unitPrice * item.quantity * 0.21, // Default 21% VAT
        total: item.unitPrice * item.quantity,
      };
      // Only add optional fields if they have values
      if (item.projectId) invoiceItem.projectId = item.projectId;
      if (item.timeEntryIds && item.timeEntryIds.length > 0) invoiceItem.timeEntryIds = item.timeEntryIds;
      return invoiceItem;
    });

    // Fetch client info using Admin SDK
    const clientDoc = await adminDb.collection('users').doc(body.clientId).get();
    const clientData = clientDoc.exists ? clientDoc.data() : null;
    const clientName = clientData?.displayName || clientData?.fullName || clientData?.firstName
      ? `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim()
      : 'Unknown';
    const clientEmail = clientData?.email || '';

    // Generate invoice number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Get last invoice number for this month using Admin SDK
    const invoicesRef = adminDb.collection('invoices');
    const lastInvoiceQuery = await invoicesRef
      .where('invoiceNumber', '>=', `INV-${year}${month}-001`)
      .where('invoiceNumber', '<=', `INV-${year}${month}-999`)
      .orderBy('invoiceNumber', 'desc')
      .limit(1)
      .get();

    let nextNumber = 1;
    if (!lastInvoiceQuery.empty) {
      const lastInvoice = lastInvoiceQuery.docs[0].data();
      const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      nextNumber = lastNum + 1;
    }
    const invoiceNumber = `INV-${year}${month}-${String(nextNumber).padStart(3, '0')}`;

    // Calculate financials
    const subtotal = items.reduce((sum: number, item: InvoiceItem) => sum + item.total, 0);
    const tax = items.reduce((sum: number, item: InvoiceItem) => sum + item.tax, 0);
    const total = subtotal + tax;

    // Create invoice document
    const invoiceRef = invoicesRef.doc();
    const invoice: Invoice = {
      id: invoiceRef.id,
      invoiceNumber,
      clientId: body.clientId,
      billingAddress: body.billingAddress,
      status: 'draft',
      type: body.type as InvoiceType,
      items,
      financial: {
        subtotal,
        discount: 0,
        tax,
        total,
        paid: 0,
        balance: total,
        currency: 'EUR',
      },
      issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
      dueDate: new Date(body.dueDate),
      reminders: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: decodedToken.uid,
    };

    // Build document data, only including defined optional fields
    // Firestore Admin SDK doesn't accept undefined values
    const docData: Record<string, any> = {
      ...invoice,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add client info
    docData.clientName = clientName;
    if (clientEmail) docData.clientEmail = clientEmail;

    // Add optional fields only if they have values
    if (body.organizationId) docData.organizationId = body.organizationId;
    if (body.projectId) docData.projectId = body.projectId;
    if (body.quoteId) docData.quoteId = body.quoteId;
    if (body.milestoneId) docData.milestoneId = body.milestoneId;
    if (billingDetails) docData.billingDetails = billingDetails;

    // Save with Admin SDK (bypasses Firestore rules)
    await invoiceRef.set(docData);

    // Add client info to response object
    const responseInvoice = { ...invoice, clientName, clientEmail };

    // Send invoice email if requested
    if (body.sendEmail) {
      // Get client email using Admin SDK
      const clientDoc = await adminDb.collection('users').doc(body.clientId).get();
      const client = clientDoc.data();

      if (client?.email) {
        const { invoiceService } = await import('@/services/invoiceService');
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
        data: responseInvoice,
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
