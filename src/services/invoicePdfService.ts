import jsPDF from 'jspdf';
import { Invoice, InvoiceItem, Address } from '@/types';

/**
 * Invoice PDF generation service for GroeiMetAI
 * Creates professional invoices with company branding
 */
export class InvoicePdfService {
  private readonly brandColor = '#ff7a00'; // GroeiMetAI orange
  private readonly primaryTextColor = '#1a202c';
  private readonly secondaryTextColor = '#4a5568';
  private readonly backgroundColor = '#f7fafc';

  /**
   * Generate a PDF invoice
   * @param invoice - Invoice data
   * @returns Base64 encoded PDF string
   */
  async generateInvoicePDF(invoice: Invoice): Promise<string> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set up fonts and colors
    doc.setFont('helvetica');

    // Add content to PDF
    this.addHeader(doc);
    this.addInvoiceDetails(doc, invoice);
    this.addBillingDetails(doc, invoice);
    this.addLineItems(doc, invoice.items);
    this.addTotals(doc, invoice);
    this.addPaymentTerms(doc, invoice);
    this.addFooter(doc);

    // Return as base64 string
    return doc.output('datauristring').split(',')[1];
  }

  /**
   * Generate a PDF invoice and return as Blob
   * @param invoice - Invoice data
   * @returns PDF as Blob
   */
  async generateInvoicePDFBlob(invoice: Invoice): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set up fonts and colors
    doc.setFont('helvetica');

    // Add content to PDF
    this.addHeader(doc);
    this.addInvoiceDetails(doc, invoice);
    this.addBillingDetails(doc, invoice);
    this.addLineItems(doc, invoice.items);
    this.addTotals(doc, invoice);
    this.addPaymentTerms(doc, invoice);
    this.addFooter(doc);

    // Return as Blob
    return doc.output('blob');
  }

  /**
   * Add company header with logo and branding
   */
  private addHeader(doc: jsPDF): void {
    // Add orange header background
    doc.setFillColor(255, 122, 0); // RGB for #ff7a00
    doc.rect(0, 0, 210, 40, 'F');

    // Add company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('GroeiMetAI', 20, 20);

    // Add tagline
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Grow Your Business with AI', 20, 28);

    // Add company details (right side)
    doc.setFontSize(9);
    doc.text('info@groeimetai.nl', 190, 15, { align: 'right' });
    doc.text('+31 (0) 20 123 4567', 190, 20, { align: 'right' });
    doc.text('www.groeimetai.nl', 190, 25, { align: 'right' });
    doc.text('KvK: 12345678', 190, 30, { align: 'right' });

    // Reset text color
    doc.setTextColor(26, 32, 44); // primaryTextColor
  }

  /**
   * Add invoice details section
   */
  private addInvoiceDetails(doc: jsPDF, invoice: Invoice): void {
    let yPos = 55;

    // Invoice title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, yPos);

    // Invoice number and dates
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(74, 85, 104); // secondaryTextColor

    const detailsX = 130;
    doc.text('Invoice Number:', detailsX, yPos - 5);
    doc.text('Issue Date:', detailsX, yPos);
    doc.text('Due Date:', detailsX, yPos + 5);

    // Values
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 32, 44); // primaryTextColor
    doc.text(invoice.invoiceNumber, 170, yPos - 5);
    doc.text(this.formatDate(invoice.issueDate), 170, yPos);
    doc.text(this.formatDate(invoice.dueDate), 170, yPos + 5);

    // Status badge
    this.addStatusBadge(doc, invoice.status, 20, yPos + 5);
  }

  /**
   * Add billing details section
   */
  private addBillingDetails(doc: jsPDF, invoice: Invoice): void {
    const yPos = 80;

    // Bill to section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 122, 0); // brandColor
    doc.text('BILL TO', 20, yPos);

    // Reset colors
    doc.setTextColor(26, 32, 44);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Billing address
    const address = invoice.billingAddress;
    let addressY = yPos + 7;

    doc.text(address.street, 20, addressY);
    addressY += 5;
    doc.text(`${address.postalCode} ${address.city}`, 20, addressY);
    addressY += 5;
    doc.text(`${address.state}, ${address.country}`, 20, addressY);
  }

  /**
   * Add line items table
   */
  private addLineItems(doc: jsPDF, items: InvoiceItem[]): void {
    let yPos = 115;

    // Table header background
    doc.setFillColor(247, 250, 252); // backgroundColor
    doc.rect(15, yPos - 5, 180, 10, 'F');

    // Table headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(74, 85, 104);

    doc.text('Description', 20, yPos);
    doc.text('Qty', 120, yPos, { align: 'right' });
    doc.text('Unit Price', 145, yPos, { align: 'right' });
    doc.text('Tax', 165, yPos, { align: 'right' });
    doc.text('Total', 190, yPos, { align: 'right' });

    // Draw header line
    doc.setDrawColor(229, 231, 235);
    doc.line(15, yPos + 3, 195, yPos + 3);

    // Table items
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 32, 44);

    items.forEach((item, index) => {
      // Add alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(15, yPos - 5, 180, 8, 'F');
      }

      doc.text(item.description, 20, yPos);
      doc.text(item.quantity.toString(), 120, yPos, { align: 'right' });
      doc.text(this.formatCurrency(item.unitPrice, 'EUR'), 145, yPos, { align: 'right' });
      doc.text(this.formatCurrency(item.tax, 'EUR'), 165, yPos, { align: 'right' });
      doc.text(this.formatCurrency(item.total, 'EUR'), 190, yPos, { align: 'right' });

      yPos += 8;
    });

    // Draw bottom line
    doc.line(15, yPos, 195, yPos);
  }

  /**
   * Add totals section
   */
  private addTotals(doc: jsPDF, invoice: Invoice): void {
    const financial = invoice.financial;
    let yPos = 200;

    // Subtotal
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(74, 85, 104);
    doc.text('Subtotal:', 145, yPos);
    doc.setTextColor(26, 32, 44);
    doc.text(this.formatCurrency(financial.subtotal, financial.currency), 190, yPos, {
      align: 'right',
    });

    // Discount
    if (financial.discount > 0) {
      yPos += 6;
      doc.setTextColor(74, 85, 104);
      doc.text('Discount:', 145, yPos);
      doc.setTextColor(26, 32, 44);
      doc.text(`-${this.formatCurrency(financial.discount, financial.currency)}`, 190, yPos, {
        align: 'right',
      });
    }

    // Tax
    yPos += 6;
    doc.setTextColor(74, 85, 104);
    doc.text('Tax:', 145, yPos);
    doc.setTextColor(26, 32, 44);
    doc.text(this.formatCurrency(financial.tax, financial.currency), 190, yPos, { align: 'right' });

    // Total line
    yPos += 3;
    doc.setDrawColor(229, 231, 235);
    doc.line(140, yPos, 195, yPos);

    // Total
    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 122, 0); // brandColor
    doc.text('Total:', 145, yPos);
    doc.text(this.formatCurrency(financial.total, financial.currency), 190, yPos, {
      align: 'right',
    });

    // Amount paid and balance
    if (financial.paid > 0) {
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(74, 85, 104);
      doc.text('Amount Paid:', 145, yPos);
      doc.setTextColor(26, 32, 44);
      doc.text(this.formatCurrency(financial.paid, financial.currency), 190, yPos, {
        align: 'right',
      });

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(74, 85, 104);
      doc.text('Balance Due:', 145, yPos);
      doc.setTextColor(26, 32, 44);
      doc.text(this.formatCurrency(financial.balance, financial.currency), 190, yPos, {
        align: 'right',
      });
    }
  }

  /**
   * Add payment terms section
   */
  private addPaymentTerms(doc: jsPDF, invoice: Invoice): void {
    const yPos = 240;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(74, 85, 104);
    doc.text('Payment Terms:', 20, yPos);

    doc.setFont('helvetica', 'normal');
    doc.text(`Payment is due by ${this.formatDate(invoice.dueDate)}`, 20, yPos + 6);

    // Bank details
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details:', 20, yPos + 16);

    doc.setFont('helvetica', 'normal');
    doc.text('Bank: ABN AMRO', 20, yPos + 22);
    doc.text('IBAN: NL91 ABNA 0417 1643 00', 20, yPos + 28);
    doc.text('BIC/SWIFT: ABNANL2A', 20, yPos + 34);
  }

  /**
   * Add footer
   */
  private addFooter(doc: jsPDF): void {
    const yPos = 280;

    // Footer line
    doc.setDrawColor(229, 231, 235);
    doc.line(15, yPos - 5, 195, yPos - 5);

    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);

    doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
    doc.text(
      'GroeiMetAI B.V. | Herengracht 100, 1015 BS Amsterdam | BTW: NL123456789B01',
      105,
      yPos + 5,
      { align: 'center' }
    );
  }

  /**
   * Add status badge
   */
  private addStatusBadge(doc: jsPDF, status: string, x: number, y: number): void {
    const statusColors: { [key: string]: { bg: number[]; text: number[] } } = {
      paid: { bg: [16, 185, 129], text: [255, 255, 255] },
      overdue: { bg: [239, 68, 68], text: [255, 255, 255] },
      pending: { bg: [251, 191, 36], text: [255, 255, 255] },
      draft: { bg: [156, 163, 175], text: [255, 255, 255] },
    };

    const colors = statusColors[status] || statusColors.draft;

    // Badge background
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.roundedRect(x, y - 4, 25, 7, 1, 1, 'F');

    // Badge text
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(status.toUpperCase(), x + 12.5, y, { align: 'center' });

    // Reset text color
    doc.setTextColor(26, 32, 44);
  }

  /**
   * Format date
   */
  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

// Export singleton instance
export const invoicePdfService = new InvoicePdfService();

// Export main function for convenience
export const generateInvoicePDF = (invoice: Invoice) =>
  invoicePdfService.generateInvoicePDF(invoice);

export const generateInvoicePDFBlob = (invoice: Invoice) =>
  invoicePdfService.generateInvoicePDFBlob(invoice);
