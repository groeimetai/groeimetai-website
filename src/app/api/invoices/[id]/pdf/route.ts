import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, adminDb } from '@/lib/firebase/admin';
import { isAdminEmail } from '@/lib/constants/adminEmails';
import { CompanySettings } from '@/types';

// Helper to convert Firestore Timestamp to Date
function toDate(value: any): Date {
  if (!value) return new Date();
  if (value.toDate && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  return new Date();
}

// Default company settings
const DEFAULT_COMPANY_SETTINGS: Partial<CompanySettings> = {
  name: 'GroeimetAI',
  legalName: 'GroeimetAI',
  email: 'info@groeimetai.io',
  phone: '+31 6 81739018',
  website: 'www.groeimetai.io',
  street: 'Fabriekstraat 20',
  postalCode: '7311GP',
  city: 'Apeldoorn',
  country: 'Nederland',
  bankName: 'Bunq',
  iban: 'NL19BUNQ2092545124',
  bic: 'BUNQNL2A',
  defaultPaymentTermsDays: 30,
  defaultTaxRate: 21,
  invoicePrefix: 'INV',
};

// GET /api/invoices/[id]/pdf
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check for token-based access first (for email links)
    const accessToken = request.nextUrl.searchParams.get('token');

    // Get invoice using Admin SDK (needed for both auth methods)
    const invoiceDoc = await adminDb.collection('invoices').doc(params.id).get();

    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoiceData = invoiceDoc.data() as any;

    // Authentication method 1: Token-based access (for email links)
    if (accessToken) {
      const isValidToken = invoiceData.pdfAccessToken === accessToken;
      const isNotExpired = invoiceData.pdfTokenExpiry && invoiceData.pdfTokenExpiry > Date.now();

      if (!isValidToken || !isNotExpired) {
        return NextResponse.json(
          { error: 'Invalid or expired access token' },
          { status: 401 }
        );
      }
      // Token is valid - continue to PDF generation
    } else {
      // Authentication method 2: Bearer token (for dashboard access)
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

      const userEmail = decodedToken.email as string | undefined;

      // Check permissions: admin, consultant, admin email, or the client who owns the invoice
      const hasPermission =
        decodedToken.role === 'admin' ||
        decodedToken.role === 'consultant' ||
        (userEmail && isAdminEmail(userEmail)) ||
        invoiceData.clientId === decodedToken.uid;

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view this invoice' },
          { status: 403 }
        );
      }
    }

    // Check if we should return existing PDF URL or generate new one
    const action = request.nextUrl.searchParams.get('action');

    if (action === 'url' && invoiceData.pdfUrl) {
      // Return existing PDF URL
      return NextResponse.json(
        {
          success: true,
          pdfUrl: invoiceData.pdfUrl,
          generatedAt: invoiceData.pdfGeneratedAt,
        },
        { status: 200 }
      );
    }

    // Convert Firestore Timestamps to Dates for the invoice
    const invoice = {
      id: invoiceDoc.id,
      ...invoiceData,
      issueDate: toDate(invoiceData.issueDate),
      dueDate: toDate(invoiceData.dueDate),
      createdAt: toDate(invoiceData.createdAt),
      updatedAt: toDate(invoiceData.updatedAt),
    };

    // Fetch company settings using Admin SDK
    let companySettings: CompanySettings;
    try {
      const settingsDoc = await adminDb.collection('companySettings').doc('groeimetai').get();
      if (settingsDoc.exists) {
        const data = settingsDoc.data() as any;
        companySettings = {
          id: settingsDoc.id,
          ...data,
          updatedAt: toDate(data.updatedAt),
        };
      } else {
        companySettings = {
          id: 'groeimetai',
          ...DEFAULT_COMPANY_SETTINGS,
          updatedAt: new Date(),
          updatedBy: 'system',
        } as CompanySettings;
      }
    } catch (settingsError) {
      console.warn('Could not fetch company settings, using defaults:', settingsError);
      companySettings = {
        id: 'groeimetai',
        ...DEFAULT_COMPANY_SETTINGS,
        updatedAt: new Date(),
        updatedBy: 'system',
      } as CompanySettings;
    }

    // Generate PDF buffer for direct download using dynamic import
    const { invoicePdfService } = await import('@/services/invoicePdfService');
    const pdfBuffer = Buffer.from(await invoicePdfService.generateInvoicePDF(invoice, companySettings), 'base64');

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
