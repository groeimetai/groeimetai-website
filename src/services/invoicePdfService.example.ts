import { generateInvoicePDF, generateInvoicePDFBlob, invoicePdfService } from './invoicePdfService';
import { Invoice, InvoiceStatus, InvoiceType } from '@/types';

// Example usage of the Invoice PDF generation service

async function exampleUsage() {
  // Sample invoice data
  const sampleInvoice: Invoice = {
    id: 'inv_123456',
    invoiceNumber: 'INV-2025-001',
    clientId: 'client_abc123',
    organizationId: 'org_xyz789',
    billingAddress: {
      street: 'Keizersgracht 123',
      city: 'Amsterdam',
      state: 'Noord-Holland',
      country: 'Netherlands',
      postalCode: '1015 CJ'
    },
    projectId: 'proj_123',
    status: 'sent' as InvoiceStatus,
    type: 'standard' as InvoiceType,
    items: [
      {
        id: 'item_1',
        description: 'AI Strategy Consultation - Initial Assessment',
        quantity: 8,
        unitPrice: 250,
        tax: 420,
        total: 2420
      },
      {
        id: 'item_2',
        description: 'ServiceNow Integration - Custom Development',
        quantity: 16,
        unitPrice: 200,
        tax: 672,
        total: 3872
      },
      {
        id: 'item_3',
        description: 'Training Workshop - AI Implementation Best Practices',
        quantity: 2,
        unitPrice: 1500,
        tax: 630,
        total: 3630
      }
    ],
    financial: {
      subtotal: 9200,
      discount: 460, // 5% discount
      tax: 1722,
      total: 10462,
      paid: 0,
      balance: 10462,
      currency: 'EUR'
    },
    issueDate: new Date('2025-01-05'),
    dueDate: new Date('2025-02-04'), // 30 days payment terms
    reminders: [],
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05'),
    createdBy: 'admin_user'
  };

  try {
    // Method 1: Generate as base64 string (useful for storing in database or sending via API)
    const base64Pdf = await generateInvoicePDF(sampleInvoice);
    console.log('PDF generated as base64:', base64Pdf.substring(0, 50) + '...');
    
    // To use base64 in an iframe or download link:
    // const dataUri = `data:application/pdf;base64,${base64Pdf}`;
    
    // Method 2: Generate as Blob (useful for direct download or file upload)
    const pdfBlob = await generateInvoicePDFBlob(sampleInvoice);
    console.log('PDF generated as Blob:', pdfBlob.size, 'bytes');
    
    // To download the PDF in browser:
    // const url = URL.createObjectURL(pdfBlob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = `invoice_${sampleInvoice.invoiceNumber}.pdf`;
    // link.click();
    // URL.revokeObjectURL(url);
    
    // Method 3: Using the service class directly (for more control)
    const anotherBase64 = await invoicePdfService.generateInvoicePDF(sampleInvoice);
    
    // Example: Save to Firebase Storage
    // import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
    // const storage = getStorage();
    // const storageRef = ref(storage, `invoices/${sampleInvoice.invoiceNumber}.pdf`);
    // const uploadResult = await uploadBytes(storageRef, pdfBlob);
    // const downloadUrl = await getDownloadURL(uploadResult.ref);
    
    // Example: Send as email attachment
    // The base64 string can be used directly as an attachment in email services
    // emailService.sendInvoiceEmail({
    //   to: 'client@example.com',
    //   invoice: sampleInvoice,
    //   attachments: [{
    //     filename: `invoice_${sampleInvoice.invoiceNumber}.pdf`,
    //     content: base64Pdf,
    //     encoding: 'base64'
    //   }]
    // });
    
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
  }
}

// Integration with Next.js API route example
export async function handleInvoiceDownload(invoiceId: string) {
  // Fetch invoice from database
  // const invoice = await getInvoice(invoiceId);
  
  // Generate PDF
  // const pdfBase64 = await generateInvoicePDF(invoice);
  
  // Return as response
  // return new Response(Buffer.from(pdfBase64, 'base64'), {
  //   headers: {
  //     'Content-Type': 'application/pdf',
  //     'Content-Disposition': `attachment; filename="invoice_${invoice.invoiceNumber}.pdf"`
  //   }
  // });
}

// Export for testing
export { exampleUsage };