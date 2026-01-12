import jsPDF from 'jspdf';
import { Invoice, InvoiceItem, CompanySettings, InvoiceBillingDetails } from '@/types';
import { companySettingsService } from './companySettingsService';

/**
 * Invoice PDF generation service for GroeiMetAI
 * Creates professional invoices with company branding and Dutch compliance
 */
export class InvoicePdfService {
  private readonly brandColor = '#ff7a00'; // GroeiMetAI orange
  private readonly primaryTextColor = '#1a202c';
  private readonly secondaryTextColor = '#4a5568';
  private readonly backgroundColor = '#f7fafc';

  // Dutch month names for date formatting
  private readonly dutchMonths = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
  ];

  /**
   * Generate a PDF invoice with company settings from Firestore
   * @param invoice - Invoice data
   * @param companySettings - Optional company settings (will fetch from Firestore if not provided)
   * @returns Base64 encoded PDF string
   */
  async generateInvoicePDF(invoice: Invoice, companySettings?: CompanySettings): Promise<string> {
    // Fetch company settings if not provided
    const settings = companySettings || await companySettingsService.getCompanySettings();

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set up fonts and colors
    doc.setFont('helvetica');

    // Add content to PDF
    this.addHeader(doc, settings);
    this.addInvoiceDetails(doc, invoice);
    this.addBillingDetails(doc, invoice);
    this.addLineItems(doc, invoice.items);
    this.addTotals(doc, invoice);
    this.addPaymentTerms(doc, invoice, settings);
    this.addFooter(doc, settings);

    // Return as base64 string
    return doc.output('datauristring').split(',')[1];
  }

  /**
   * Generate a PDF invoice and return as Blob
   * @param invoice - Invoice data
   * @param companySettings - Optional company settings
   * @returns PDF as Blob
   */
  async generateInvoicePDFBlob(invoice: Invoice, companySettings?: CompanySettings): Promise<Blob> {
    // Fetch company settings if not provided
    const settings = companySettings || await companySettingsService.getCompanySettings();

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set up fonts and colors
    doc.setFont('helvetica');

    // Add content to PDF
    this.addHeader(doc, settings);
    this.addInvoiceDetails(doc, invoice);
    this.addBillingDetails(doc, invoice);
    this.addLineItems(doc, invoice.items);
    this.addTotals(doc, invoice);
    this.addPaymentTerms(doc, invoice, settings);
    this.addFooter(doc, settings);

    // Return as Blob
    return doc.output('blob');
  }

  /**
   * Add company header with logo and branding
   */
  private addHeader(doc: jsPDF, settings: CompanySettings): void {
    // Add orange header background
    doc.setFillColor(255, 122, 0); // RGB for #ff7a00
    doc.rect(0, 0, 210, 40, 'F');

    // Add company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.name || 'GroeiMetAI', 20, 20);

    // Add tagline
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Grow Your Business with AI', 20, 28);

    // Add company details (right side)
    doc.setFontSize(9);
    doc.text(settings.email || '', 190, 12, { align: 'right' });
    doc.text(settings.phone || '', 190, 17, { align: 'right' });
    doc.text(settings.website || '', 190, 22, { align: 'right' });

    // KvK and BTW (required for Dutch invoices)
    if (settings.kvkNumber) {
      doc.text(`KvK: ${settings.kvkNumber}`, 190, 27, { align: 'right' });
    }
    if (settings.btwNumber) {
      doc.text(`BTW: ${settings.btwNumber}`, 190, 32, { align: 'right' });
    }

    // Reset text color
    doc.setTextColor(26, 32, 44); // primaryTextColor
  }

  /**
   * Add invoice details section
   */
  private addInvoiceDetails(doc: jsPDF, invoice: Invoice): void {
    let yPos = 55;

    // Invoice title (Dutch: FACTUUR)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTUUR', 20, yPos);

    // Invoice number and dates
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(74, 85, 104); // secondaryTextColor

    const detailsX = 125;
    doc.text('Factuurnummer:', detailsX, yPos - 5);
    doc.text('Factuurdatum:', detailsX, yPos);
    doc.text('Vervaldatum:', detailsX, yPos + 5);

    // Values
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 32, 44); // primaryTextColor
    doc.text(invoice.invoiceNumber, 190, yPos - 5, { align: 'right' });
    doc.text(this.formatDateDutch(invoice.issueDate), 190, yPos, { align: 'right' });
    doc.text(this.formatDateDutch(invoice.dueDate), 190, yPos + 5, { align: 'right' });

    // Status badge
    this.addStatusBadge(doc, invoice.status, 20, yPos + 5);
  }

  /**
   * Add billing details section
   */
  private addBillingDetails(doc: jsPDF, invoice: Invoice): void {
    const yPos = 80;

    // Bill to section (Dutch: FACTUURADRES)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 122, 0); // brandColor
    doc.text('FACTUURADRES', 20, yPos);

    // Reset colors
    doc.setTextColor(26, 32, 44);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Check if we have the extended billing details or legacy address
    const billingDetails = (invoice as any).billingDetails as InvoiceBillingDetails | undefined;
    const address = invoice.billingAddress;

    let addressY = yPos + 7;

    // Company name (if available)
    if (billingDetails?.companyName) {
      doc.setFont('helvetica', 'bold');
      doc.text(billingDetails.companyName, 20, addressY);
      addressY += 5;
      doc.setFont('helvetica', 'normal');
    }

    // Contact name (if available)
    if (billingDetails?.contactName) {
      doc.text(`t.a.v. ${billingDetails.contactName}`, 20, addressY);
      addressY += 5;
    }

    // Address
    if (billingDetails) {
      doc.text(billingDetails.street, 20, addressY);
      addressY += 5;
      doc.text(`${billingDetails.postalCode} ${billingDetails.city}`, 20, addressY);
      addressY += 5;
      doc.text(billingDetails.country, 20, addressY);
      addressY += 5;

      // Client KvK and BTW (if available)
      if (billingDetails.kvkNumber || billingDetails.btwNumber) {
        addressY += 2;
        doc.setFontSize(9);
        doc.setTextColor(74, 85, 104);
        if (billingDetails.kvkNumber) {
          doc.text(`KvK: ${billingDetails.kvkNumber}`, 20, addressY);
          addressY += 4;
        }
        if (billingDetails.btwNumber) {
          doc.text(`BTW: ${billingDetails.btwNumber}`, 20, addressY);
        }
      }
    } else if (address) {
      // Fallback to legacy address format
      doc.text(address.street, 20, addressY);
      addressY += 5;
      doc.text(`${address.postalCode} ${address.city}`, 20, addressY);
      addressY += 5;
      if (address.state) {
        doc.text(`${address.state}, ${address.country}`, 20, addressY);
      } else {
        doc.text(address.country, 20, addressY);
      }
    }
  }

  /**
   * Add line items table
   */
  private addLineItems(doc: jsPDF, items: InvoiceItem[]): void {
    let yPos = 115;

    // Table header background
    doc.setFillColor(247, 250, 252); // backgroundColor
    doc.rect(15, yPos - 5, 180, 10, 'F');

    // Table headers (Dutch)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(74, 85, 104);

    doc.text('Omschrijving', 20, yPos);
    doc.text('Aantal', 115, yPos, { align: 'right' });
    doc.text('Prijs', 140, yPos, { align: 'right' });
    doc.text('BTW', 162, yPos, { align: 'right' });
    doc.text('Totaal', 190, yPos, { align: 'right' });

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

      // Truncate long descriptions
      const maxDescLength = 50;
      const description = item.description.length > maxDescLength
        ? item.description.substring(0, maxDescLength) + '...'
        : item.description;

      doc.text(description, 20, yPos);
      doc.text(item.quantity.toString(), 115, yPos, { align: 'right' });
      doc.text(this.formatCurrencyDutch(item.unitPrice), 140, yPos, { align: 'right' });
      doc.text(this.formatCurrencyDutch(item.tax), 162, yPos, { align: 'right' });
      doc.text(this.formatCurrencyDutch(item.total), 190, yPos, { align: 'right' });

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

    // Subtotal (Dutch: Subtotaal)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(74, 85, 104);
    doc.text('Subtotaal:', 145, yPos);
    doc.setTextColor(26, 32, 44);
    doc.text(this.formatCurrencyDutch(financial.subtotal), 190, yPos, {
      align: 'right',
    });

    // Discount (Dutch: Korting)
    if (financial.discount > 0) {
      yPos += 6;
      doc.setTextColor(74, 85, 104);
      doc.text('Korting:', 145, yPos);
      doc.setTextColor(26, 32, 44);
      doc.text(`-${this.formatCurrencyDutch(financial.discount)}`, 190, yPos, {
        align: 'right',
      });
    }

    // Tax (Dutch: BTW)
    yPos += 6;
    doc.setTextColor(74, 85, 104);
    doc.text('BTW:', 145, yPos);
    doc.setTextColor(26, 32, 44);
    doc.text(this.formatCurrencyDutch(financial.tax), 190, yPos, { align: 'right' });

    // Total line
    yPos += 3;
    doc.setDrawColor(229, 231, 235);
    doc.line(140, yPos, 195, yPos);

    // Total (Dutch: Totaal)
    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 122, 0); // brandColor
    doc.text('Totaal:', 145, yPos);
    doc.text(this.formatCurrencyDutch(financial.total), 190, yPos, {
      align: 'right',
    });

    // Amount paid and balance (Dutch: Betaald / Openstaand)
    if (financial.paid > 0) {
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(74, 85, 104);
      doc.text('Betaald:', 145, yPos);
      doc.setTextColor(26, 32, 44);
      doc.text(this.formatCurrencyDutch(financial.paid), 190, yPos, {
        align: 'right',
      });

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(74, 85, 104);
      doc.text('Openstaand:', 145, yPos);
      doc.setTextColor(26, 32, 44);
      doc.text(this.formatCurrencyDutch(financial.balance), 190, yPos, {
        align: 'right',
      });
    }
  }

  /**
   * Add payment terms section
   */
  private addPaymentTerms(doc: jsPDF, invoice: Invoice, settings: CompanySettings): void {
    const yPos = 240;

    // Payment terms (Dutch: Betalingsvoorwaarden)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(74, 85, 104);
    doc.text('Betalingsvoorwaarden:', 20, yPos);

    doc.setFont('helvetica', 'normal');
    doc.text(`Gelieve te betalen voor ${this.formatDateDutch(invoice.dueDate)}`, 20, yPos + 6);

    // Bank details (Dutch: Bankgegevens)
    doc.setFont('helvetica', 'bold');
    doc.text('Bankgegevens:', 20, yPos + 16);

    doc.setFont('helvetica', 'normal');
    if (settings.bankName) {
      doc.text(`Bank: ${settings.bankName}`, 20, yPos + 22);
    }
    if (settings.iban) {
      doc.text(`IBAN: ${settings.iban}`, 20, yPos + 28);
    }
    if (settings.bic) {
      doc.text(`BIC/SWIFT: ${settings.bic}`, 20, yPos + 34);
    }

    // Add payment reference
    doc.text(`Vermeld bij betaling: ${invoice.invoiceNumber}`, 20, yPos + 42);
  }

  /**
   * Add footer
   */
  private addFooter(doc: jsPDF, settings: CompanySettings): void {
    const yPos = 280;

    // Footer line
    doc.setDrawColor(229, 231, 235);
    doc.line(15, yPos - 5, 195, yPos - 5);

    // Footer text (Dutch: Bedankt voor uw vertrouwen!)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);

    doc.text('Bedankt voor uw vertrouwen!', 105, yPos, { align: 'center' });

    // Build footer line with company details
    const footerParts = [settings.legalName || settings.name];
    if (settings.street && settings.postalCode && settings.city) {
      footerParts.push(`${settings.street}, ${settings.postalCode} ${settings.city}`);
    }
    if (settings.btwNumber) {
      footerParts.push(`BTW: ${settings.btwNumber}`);
    }
    if (settings.kvkNumber) {
      footerParts.push(`KvK: ${settings.kvkNumber}`);
    }

    doc.text(footerParts.join(' | '), 105, yPos + 5, { align: 'center' });
  }

  /**
   * Add status badge
   */
  private addStatusBadge(doc: jsPDF, status: string, x: number, y: number): void {
    // Dutch status labels
    const statusLabels: { [key: string]: string } = {
      paid: 'BETAALD',
      overdue: 'VERLOPEN',
      sent: 'VERSTUURD',
      viewed: 'BEKEKEN',
      draft: 'CONCEPT',
      cancelled: 'GEANNULEERD',
      partial: 'DEELS BETAALD',
    };

    const statusColors: { [key: string]: { bg: number[]; text: number[] } } = {
      paid: { bg: [16, 185, 129], text: [255, 255, 255] },
      overdue: { bg: [239, 68, 68], text: [255, 255, 255] },
      sent: { bg: [59, 130, 246], text: [255, 255, 255] },
      viewed: { bg: [99, 102, 241], text: [255, 255, 255] },
      pending: { bg: [251, 191, 36], text: [255, 255, 255] },
      draft: { bg: [156, 163, 175], text: [255, 255, 255] },
      cancelled: { bg: [107, 114, 128], text: [255, 255, 255] },
      partial: { bg: [245, 158, 11], text: [255, 255, 255] },
    };

    const colors = statusColors[status] || statusColors.draft;
    const label = statusLabels[status] || status.toUpperCase();

    // Badge background - make it wider for longer Dutch words
    const badgeWidth = Math.max(30, label.length * 2.5 + 10);
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.roundedRect(x, y - 4, badgeWidth, 7, 1, 1, 'F');

    // Badge text
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + badgeWidth / 2, y, { align: 'center' });

    // Reset text color
    doc.setTextColor(26, 32, 44);
  }

  /**
   * Format date in Dutch (e.g., "1 januari 2025")
   */
  private formatDateDutch(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getDate()} ${this.dutchMonths[d.getMonth()]} ${d.getFullYear()}`;
  }

  /**
   * Format currency in Dutch format (e.g., "€ 1.234,56")
   */
  private formatCurrencyDutch(amount: number): string {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

// Export singleton instance
export const invoicePdfService = new InvoicePdfService();

// Export main function for convenience
export const generateInvoicePDF = (invoice: Invoice, companySettings?: CompanySettings) =>
  invoicePdfService.generateInvoicePDF(invoice, companySettings);

export const generateInvoicePDFBlob = (invoice: Invoice, companySettings?: CompanySettings) =>
  invoicePdfService.generateInvoicePDFBlob(invoice, companySettings);
