import puppeteer from 'puppeteer';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Invoice } from '@/types';

class PdfService {
  /**
   * Generate HTML template for invoice
   */
  private generateInvoiceHtml(invoice: Invoice): string {
    const formatDate = (date: Date | any) => {
      if (date?.toDate) {
        return date.toDate().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: invoice.financial.currency || 'EUR'
      }).format(amount);
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      padding: 40px;
    }
    
    .invoice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 50px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1e3a8a;
    }
    
    .company-info h1 {
      color: #1e3a8a;
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .company-info p {
      color: #666;
      font-size: 14px;
    }
    
    .invoice-details {
      text-align: right;
    }
    
    .invoice-details h2 {
      color: #1e3a8a;
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .invoice-details p {
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .invoice-details .invoice-number {
      font-size: 18px;
      font-weight: bold;
      color: #1e3a8a;
    }
    
    .billing-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    
    .billing-section h3 {
      color: #1e3a8a;
      font-size: 16px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .billing-section p {
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .items-table {
      width: 100%;
      margin-bottom: 40px;
      border-collapse: collapse;
    }
    
    .items-table th {
      background-color: #1e3a8a;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
    
    .text-right {
      text-align: right;
    }
    
    .totals {
      margin-left: auto;
      width: 300px;
      margin-bottom: 40px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    
    .totals-row.subtotal {
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }
    
    .totals-row.total {
      border-top: 2px solid #1e3a8a;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: bold;
      color: #1e3a8a;
    }
    
    .payment-info {
      background-color: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 40px;
    }
    
    .payment-info h3 {
      color: #1e3a8a;
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .payment-info p {
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-paid {
      background-color: #d1fae5;
      color: #065f46;
    }
    
    .status-overdue {
      background-color: #fee2e2;
      color: #991b1b;
    }
    
    .status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div class="company-info">
      <h1>GroeimetAI</h1>
      <p>AI Consulting & ServiceNow Solutions</p>
      <p>Amsterdam, Netherlands</p>
      <p>info@groeimetai.com</p>
    </div>
    <div class="invoice-details">
      <h2>INVOICE</h2>
      <p class="invoice-number">${invoice.invoiceNumber}</p>
      <p>Issue Date: ${formatDate(invoice.issueDate)}</p>
      <p>Due Date: ${formatDate(invoice.dueDate)}</p>
      <p>Status: <span class="status-badge status-${invoice.status}">${invoice.status}</span></p>
    </div>
  </div>
  
  <div class="billing-info">
    <div class="billing-section">
      <h3>Bill To</h3>
      <p><strong>${invoice.billingAddress.name || 'N/A'}</strong></p>
      <p>${invoice.billingAddress.company || ''}</p>
      <p>${invoice.billingAddress.street}</p>
      <p>${invoice.billingAddress.city}, ${invoice.billingAddress.state} ${invoice.billingAddress.postalCode}</p>
      <p>${invoice.billingAddress.country}</p>
    </div>
    <div class="billing-section">
      <h3>Payment Details</h3>
      <p>Payment Terms: Net 30</p>
      <p>Currency: ${invoice.financial.currency}</p>
      ${invoice.paymentMethod ? `<p>Payment Method: ${invoice.paymentMethod}</p>` : ''}
      ${invoice.paidDate ? `<p>Paid Date: ${formatDate(invoice.paidDate)}</p>` : ''}
    </div>
  </div>
  
  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Quantity</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Tax</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.unitPrice)}</td>
          <td class="text-right">${formatCurrency(item.tax)}</td>
          <td class="text-right">${formatCurrency(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="totals">
    <div class="totals-row subtotal">
      <span>Subtotal</span>
      <span>${formatCurrency(invoice.financial.subtotal)}</span>
    </div>
    ${invoice.financial.discount > 0 ? `
      <div class="totals-row">
        <span>Discount</span>
        <span>-${formatCurrency(invoice.financial.discount)}</span>
      </div>
    ` : ''}
    <div class="totals-row">
      <span>Tax</span>
      <span>${formatCurrency(invoice.financial.tax)}</span>
    </div>
    <div class="totals-row total">
      <span>Total</span>
      <span>${formatCurrency(invoice.financial.total)}</span>
    </div>
    ${invoice.financial.paid > 0 ? `
      <div class="totals-row">
        <span>Paid</span>
        <span>${formatCurrency(invoice.financial.paid)}</span>
      </div>
      <div class="totals-row">
        <span>Balance Due</span>
        <span>${formatCurrency(invoice.financial.balance)}</span>
      </div>
    ` : ''}
  </div>
  
  <div class="payment-info">
    <h3>Payment Information</h3>
    <p>Please make payment to:</p>
    <p><strong>Bank:</strong> ABN AMRO</p>
    <p><strong>Account Name:</strong> GroeimetAI B.V.</p>
    <p><strong>IBAN:</strong> NL12 ABNA 0123 4567 89</p>
    <p><strong>BIC/SWIFT:</strong> ABNANL2A</p>
    <p><strong>Reference:</strong> ${invoice.invoiceNumber}</p>
  </div>
  
  <div class="footer">
    <p>Thank you for your business!</p>
    <p>GroeimetAI B.V. | KVK: 12345678 | BTW: NL123456789B01</p>
    <p>This invoice was generated electronically and is valid without signature.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate PDF from invoice
   */
  async generateInvoicePdf(invoice: Invoice): Promise<string> {
    let browser;
    
    try {
      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set content
      const html = this.generateInvoiceHtml(invoice);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });
      
      // Upload to Firebase Storage
      const fileName = `invoices/${invoice.invoiceNumber}.pdf`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, pdfBuffer, {
        contentType: 'application/pdf',
        customMetadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientId: invoice.clientId
        }
      });
      
      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      
      return downloadUrl;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate PDF buffer for direct download
   */
  async generateInvoicePdfBuffer(invoice: Invoice): Promise<Buffer> {
    let browser;
    
    try {
      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set content
      const html = this.generateInvoiceHtml(invoice);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });
      
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF buffer:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

// Export singleton instance
export const pdfService = new PdfService();