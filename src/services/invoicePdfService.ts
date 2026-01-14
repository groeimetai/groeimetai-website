import jsPDF from 'jspdf';
import { Invoice, InvoiceItem, CompanySettings, InvoiceBillingDetails } from '@/types';
import { companySettingsService } from './companySettingsService';
import fs from 'fs';
import path from 'path';

/**
 * Invoice PDF generation service for GroeiMetAI
 * Creates professional invoices with company branding and Dutch compliance
 */
export class InvoicePdfService {
  private readonly brandOrange = '#ff7a00'; // GroeiMetAI orange
  private readonly brandBlack = '#1a1a1a';
  private readonly primaryTextColor = '#1a202c';
  private readonly secondaryTextColor = '#64748b';
  private readonly lightGray = '#f1f5f9';
  private readonly borderColor = '#e2e8f0';

  // Dutch month names for date formatting
  private readonly dutchMonths = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
  ];

  /**
   * Generate a PDF invoice with company settings from Firestore
   * @param invoice - Invoice data
   * @param companySettings - Optional company settings (will fetch from Firestore if not provided)
   * @param paymentUrl - Optional Mollie payment URL for online payment button
   * @returns Base64 encoded PDF string
   */
  async generateInvoicePDF(invoice: Invoice, companySettings?: CompanySettings, paymentUrl?: string): Promise<string> {
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
    this.addPaymentTerms(doc, invoice, settings, paymentUrl);
    this.addFooter(doc, settings);

    // Return as base64 string
    return doc.output('datauristring').split(',')[1];
  }

  /**
   * Generate a PDF invoice and return as Blob
   * @param invoice - Invoice data
   * @param companySettings - Optional company settings
   * @param paymentUrl - Optional Mollie payment URL for online payment button
   * @returns PDF as Blob
   */
  async generateInvoicePDFBlob(invoice: Invoice, companySettings?: CompanySettings, paymentUrl?: string): Promise<Blob> {
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
    this.addPaymentTerms(doc, invoice, settings, paymentUrl);
    this.addFooter(doc, settings);

    // Return as Blob
    return doc.output('blob');
  }

  // Base64 logo image (PNG) - loaded from public folder
  private logoBase64: string | null = null;
  private logoLoaded = false;

  /**
   * Load logo from public folder
   */
  private loadLogo(): void {
    if (this.logoLoaded) return;
    this.logoLoaded = true;

    try {
      // Try multiple possible paths for the logo
      const possiblePaths = [
        path.join(process.cwd(), 'public', 'GroeimetAi_logo_small.png'),
        path.join(process.cwd(), 'public', 'GroeimetAi_logo_text_black.png'),
        '/app/public/GroeimetAi_logo_small.png', // Docker/Cloud Run path
        '/app/public/GroeimetAi_logo_text_black.png',
      ];

      for (const logoPath of possiblePaths) {
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          this.logoBase64 = logoBuffer.toString('base64');
          console.log('Logo loaded from:', logoPath);
          break;
        }
      }

      if (!this.logoBase64) {
        console.warn('Logo file not found, using text fallback');
      }
    } catch (error) {
      console.warn('Could not load logo:', error);
    }
  }

  /**
   * Set the logo image as base64 string (manual override)
   * @param base64 - Base64 encoded PNG image (without data:image/png;base64, prefix)
   */
  setLogo(base64: string): void {
    this.logoBase64 = base64;
    this.logoLoaded = true;
  }

  /**
   * Add company header with logo and branding - Modern minimal design
   */
  private addHeader(doc: jsPDF, settings: CompanySettings): void {
    // Load logo if not already loaded
    this.loadLogo();

    // Clean white header with subtle bottom border
    doc.setDrawColor(226, 232, 240); // borderColor
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

    // Try to add logo image if available
    if (this.logoBase64) {
      try {
        // Logo aspect ratio is approximately 6:1 (1178x200 original)
        // Width 55mm, height ~9mm maintains proper proportions
        doc.addImage(this.logoBase64, 'PNG', 15, 12, 55, 9);
      } catch (e) {
        // Fallback to text logo if image fails
        console.warn('Failed to add logo image:', e);
        this.addTextLogo(doc);
      }
    } else {
      // Text-based logo fallback
      this.addTextLogo(doc);
    }

    // Company address on the left under logo
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // secondaryTextColor

    let yPos = 32;
    if (settings.street) {
      doc.text(settings.street, 15, yPos);
      yPos += 4;
    }
    if (settings.postalCode || settings.city) {
      doc.text(`${settings.postalCode || ''} ${settings.city || ''}`.trim(), 15, yPos);
    }

    // Company details on the right
    doc.setTextColor(100, 116, 139);
    doc.text(settings.email || '', 195, 12, { align: 'right' });
    doc.text(settings.phone || '', 195, 17, { align: 'right' });
    doc.text(settings.website || '', 195, 22, { align: 'right' });

    // KvK and BTW (required for Dutch invoices)
    let rightYPos = 32;
    if (settings.kvkNumber) {
      doc.text(`KvK: ${settings.kvkNumber}`, 195, rightYPos, { align: 'right' });
      rightYPos += 4;
    }
    if (settings.btwNumber) {
      doc.text(`BTW: ${settings.btwNumber}`, 195, rightYPos, { align: 'right' });
    }

    // Reset text color
    doc.setTextColor(26, 32, 44); // primaryTextColor
  }

  /**
   * Draw text-based logo as fallback when no image is available
   * Mimics the italic bold style with orange accent
   */
  private addTextLogo(doc: jsPDF): void {
    // "Groeimet" in bold italic style with orange underline accent
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bolditalic');
    doc.setTextColor(26, 26, 26); // brandBlack

    // Draw "Groeimet" with slight orange stroke effect (simulated by drawing twice)
    const xStart = 15;
    const yLogo = 20;

    // Orange "shadow" slightly offset
    doc.setTextColor(255, 122, 0);
    doc.text('Groeimet', xStart + 0.3, yLogo + 0.3);

    // Black text on top
    doc.setTextColor(26, 26, 26);
    doc.text('Groeimet', xStart, yLogo);

    // "AI" part - with white stroke effect
    const groeimetWidth = doc.getTextWidth('Groeimet');

    // White "shadow"
    doc.setTextColor(255, 255, 255);
    doc.text('AI', xStart + groeimetWidth + 0.3, yLogo + 0.3);

    // Black text on top
    doc.setTextColor(26, 26, 26);
    doc.text('AI', xStart + groeimetWidth, yLogo);

    // Orange accent bar under the logo
    doc.setDrawColor(255, 122, 0);
    doc.setLineWidth(1.5);
    const totalWidth = groeimetWidth + doc.getTextWidth('AI');
    doc.line(xStart, yLogo + 3, xStart + totalWidth, yLogo + 3);
  }

  /**
   * Add invoice details section - Modern card-style
   */
  private addInvoiceDetails(doc: jsPDF, invoice: Invoice): void {
    let yPos = 58;

    // Invoice title with large number
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // secondaryTextColor
    doc.text('FACTUUR', 15, yPos);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 32, 44); // primaryTextColor
    doc.text(invoice.invoiceNumber, 15, yPos + 8);

    // Status badge next to invoice number
    this.addStatusBadge(doc, invoice.status, 15 + doc.getTextWidth(invoice.invoiceNumber) + 5, yPos + 5);

    // Invoice dates - right aligned in a subtle box
    doc.setFillColor(241, 245, 249); // lightGray
    doc.roundedRect(130, yPos - 6, 65, 22, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    doc.text('Factuurdatum:', 135, yPos);
    doc.text('Vervaldatum:', 135, yPos + 7);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 32, 44);
    doc.text(this.formatDateDutch(invoice.issueDate), 190, yPos, { align: 'right' });
    doc.text(this.formatDateDutch(invoice.dueDate), 190, yPos + 7, { align: 'right' });
  }

  /**
   * Add billing details section - Modern card style
   */
  private addBillingDetails(doc: jsPDF, invoice: Invoice): void {
    const yPos = 85;

    // Bill to section with subtle background
    doc.setFillColor(241, 245, 249); // lightGray
    doc.roundedRect(15, yPos - 5, 85, 45, 2, 2, 'F');

    // Section label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // secondaryTextColor
    doc.text('FACTUURADRES', 20, yPos + 2);

    // Reset colors for content
    doc.setTextColor(26, 32, 44);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Check if we have the extended billing details or legacy address
    const billingDetails = (invoice as any).billingDetails as InvoiceBillingDetails | undefined;
    const address = invoice.billingAddress;

    let addressY = yPos + 10;

    // Company name (if available)
    if (billingDetails?.companyName) {
      doc.setFont('helvetica', 'bold');
      doc.text(billingDetails.companyName, 20, addressY);
      addressY += 5;
      doc.setFont('helvetica', 'normal');
    }

    // Contact name (if available)
    if (billingDetails?.contactName) {
      doc.text(billingDetails.contactName, 20, addressY);
      addressY += 5;
    }

    // Address
    if (billingDetails) {
      doc.text(billingDetails.street, 20, addressY);
      addressY += 5;
      doc.text(`${billingDetails.postalCode} ${billingDetails.city}`, 20, addressY);
      addressY += 5;
      if (billingDetails.country && billingDetails.country !== 'Nederland') {
        doc.text(billingDetails.country, 20, addressY);
        addressY += 5;
      }

      // Client KvK and BTW (if available)
      if (billingDetails.kvkNumber || billingDetails.btwNumber) {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
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
      } else if (address.country && address.country !== 'Nederland') {
        doc.text(address.country, 20, addressY);
      }
    }
  }

  /**
   * Add line items table - Modern clean design
   */
  private addLineItems(doc: jsPDF, items: InvoiceItem[]): void {
    let yPos = 140;

    // Table header with orange accent
    doc.setDrawColor(255, 122, 0); // brandOrange
    doc.setLineWidth(0.5);
    doc.line(15, yPos - 2, 195, yPos - 2);

    // Table headers (Dutch)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // secondaryTextColor

    doc.text('OMSCHRIJVING', 15, yPos + 4);
    doc.text('AANTAL', 110, yPos + 4, { align: 'right' });
    doc.text('PRIJS', 138, yPos + 4, { align: 'right' });
    doc.text('BTW', 162, yPos + 4, { align: 'right' });
    doc.text('TOTAAL', 195, yPos + 4, { align: 'right' });

    // Header bottom line
    doc.setDrawColor(226, 232, 240); // borderColor
    doc.setLineWidth(0.3);
    doc.line(15, yPos + 7, 195, yPos + 7);

    // Table items
    yPos += 14;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 32, 44);
    doc.setFontSize(10);

    items.forEach((item, index) => {
      // Subtle alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yPos - 4, 180, 10, 'F');
      }

      // Truncate long descriptions
      const maxDescLength = 45;
      const description = item.description.length > maxDescLength
        ? item.description.substring(0, maxDescLength) + '...'
        : item.description;

      doc.text(description, 15, yPos);
      doc.text(item.quantity.toString(), 110, yPos, { align: 'right' });
      doc.text(this.formatCurrencyDutch(item.unitPrice), 138, yPos, { align: 'right' });
      doc.text(this.formatCurrencyDutch(item.tax), 162, yPos, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrencyDutch(item.total), 195, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      yPos += 10;
    });

    // Bottom line
    doc.setDrawColor(226, 232, 240);
    doc.line(15, yPos - 2, 195, yPos - 2);
  }

  /**
   * Add totals section - Modern card style
   */
  private addTotals(doc: jsPDF, invoice: Invoice): void {
    const financial = invoice.financial;
    let yPos = 195;

    // Totals box with subtle background
    doc.setFillColor(241, 245, 249); // lightGray
    doc.roundedRect(130, yPos - 5, 65, financial.paid > 0 ? 50 : 35, 2, 2, 'F');

    // Subtotal (Dutch: Subtotaal)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Subtotaal', 135, yPos + 2);
    doc.setTextColor(26, 32, 44);
    doc.text(this.formatCurrencyDutch(financial.subtotal), 190, yPos + 2, {
      align: 'right',
    });

    // Discount (Dutch: Korting)
    if (financial.discount > 0) {
      yPos += 7;
      doc.setTextColor(100, 116, 139);
      doc.text('Korting', 135, yPos + 2);
      doc.setTextColor(16, 185, 129); // green
      doc.text(`-${this.formatCurrencyDutch(financial.discount)}`, 190, yPos + 2, {
        align: 'right',
      });
    }

    // Tax (Dutch: BTW 21%)
    yPos += 7;
    doc.setTextColor(100, 116, 139);
    doc.text('BTW 21%', 135, yPos + 2);
    doc.setTextColor(26, 32, 44);
    doc.text(this.formatCurrencyDutch(financial.tax), 190, yPos + 2, { align: 'right' });

    // Total line
    yPos += 5;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(135, yPos + 2, 190, yPos + 2);

    // Total (Dutch: Totaal) - prominent
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 32, 44);
    doc.text('Totaal', 135, yPos);
    doc.setTextColor(255, 122, 0); // brandOrange
    doc.text(this.formatCurrencyDutch(financial.total), 190, yPos, {
      align: 'right',
    });

    // Amount paid and balance (Dutch: Betaald / Openstaand)
    if (financial.paid > 0) {
      yPos += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Betaald', 135, yPos);
      doc.setTextColor(16, 185, 129); // green
      doc.text(this.formatCurrencyDutch(financial.paid), 190, yPos, {
        align: 'right',
      });

      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('Openstaand', 135, yPos);
      doc.setTextColor(26, 32, 44);
      doc.text(this.formatCurrencyDutch(financial.balance), 190, yPos, {
        align: 'right',
      });
    }
  }

  /**
   * Add payment terms section - Clean modern design with online payment option
   */
  private addPaymentTerms(doc: jsPDF, invoice: Invoice, settings: CompanySettings, paymentUrl?: string): void {
    const yPos = 240;

    // Payment info box
    doc.setFillColor(241, 245, 249); // lightGray
    doc.roundedRect(15, yPos - 5, 100, 45, 2, 2, 'F');

    // Bank details header with orange accent
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 122, 0); // brandOrange
    doc.text('BETALINGSGEGEVENS', 20, yPos + 2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 32, 44);
    doc.setFontSize(10);

    let bankY = yPos + 10;
    if (settings.iban) {
      doc.setFont('helvetica', 'bold');
      doc.text(settings.iban, 20, bankY);
      doc.setFont('helvetica', 'normal');
      bankY += 6;
    }
    if (settings.bic) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text(`BIC: ${settings.bic}`, 20, bankY);
      bankY += 5;
    }
    if (settings.bankName) {
      doc.text(`Bank: ${settings.bankName}`, 20, bankY);
      bankY += 6;
    }

    // Payment reference
    doc.setTextColor(26, 32, 44);
    doc.setFontSize(9);
    doc.text(`Referentie: ${invoice.invoiceNumber}`, 20, bankY + 2);

    // Online payment section (right side)
    const rightBoxX = 130;

    // Due date reminder on the right
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Gelieve te betalen voor:', 195, yPos + 2, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 32, 44);
    doc.setFontSize(11);
    doc.text(this.formatDateDutch(invoice.dueDate), 195, yPos + 10, { align: 'right' });

    // Online payment button/link (if invoice is not paid)
    if (invoice.status !== 'paid' && invoice.status !== 'cancelled') {
      // Generate payment URL if not provided
      const payUrl = paymentUrl || `https://groeimetai.io/betalen/${invoice.id}`;

      // Draw orange payment button
      const buttonY = yPos + 20;
      doc.setFillColor(255, 122, 0); // brandOrange
      doc.roundedRect(rightBoxX, buttonY, 65, 12, 2, 2, 'F');

      // Button text
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255); // white
      doc.text('BETAAL ONLINE', rightBoxX + 32.5, buttonY + 7.5, { align: 'center' });

      // Add clickable link annotation
      doc.link(rightBoxX, buttonY, 65, 12, { url: payUrl });

      // Payment URL text below button
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('of ga naar:', rightBoxX + 32.5, buttonY + 17, { align: 'center' });
      doc.setTextColor(255, 122, 0);
      doc.text(payUrl, rightBoxX + 32.5, buttonY + 21, { align: 'center' });

      // Also make the URL clickable
      doc.link(rightBoxX, buttonY + 14, 65, 10, { url: payUrl });
    }
  }

  /**
   * Add footer - Minimal clean design
   */
  private addFooter(doc: jsPDF, settings: CompanySettings): void {
    const yPos = 285;

    // Subtle footer line with orange accent
    doc.setDrawColor(255, 122, 0); // brandOrange
    doc.setLineWidth(0.5);
    doc.line(15, yPos - 3, 40, yPos - 3);

    doc.setDrawColor(226, 232, 240); // borderColor
    doc.setLineWidth(0.3);
    doc.line(40, yPos - 3, 195, yPos - 3);

    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    // Thank you message
    doc.text('Bedankt voor uw vertrouwen!', 105, yPos + 2, { align: 'center' });

    // Company details line
    const footerParts = [];
    if (settings.email) footerParts.push(settings.email);
    if (settings.phone) footerParts.push(settings.phone);
    if (settings.website) footerParts.push(settings.website);

    doc.text(footerParts.join('  •  '), 105, yPos + 7, { align: 'center' });
  }

  /**
   * Add status badge - Modern pill design
   */
  private addStatusBadge(doc: jsPDF, status: string, x: number, y: number): void {
    // Dutch status labels
    const statusLabels: { [key: string]: string } = {
      paid: 'Betaald',
      overdue: 'Verlopen',
      sent: 'Verstuurd',
      viewed: 'Bekeken',
      draft: 'Concept',
      cancelled: 'Geannuleerd',
      partial: 'Deels betaald',
    };

    // Softer, more modern colors
    const statusColors: { [key: string]: { bg: number[]; text: number[] } } = {
      paid: { bg: [220, 252, 231], text: [22, 101, 52] },       // soft green
      overdue: { bg: [254, 226, 226], text: [153, 27, 27] },    // soft red
      sent: { bg: [219, 234, 254], text: [29, 78, 216] },       // soft blue
      viewed: { bg: [237, 233, 254], text: [91, 33, 182] },     // soft purple
      pending: { bg: [254, 249, 195], text: [161, 98, 7] },     // soft yellow
      draft: { bg: [241, 245, 249], text: [71, 85, 105] },      // soft gray
      cancelled: { bg: [243, 244, 246], text: [107, 114, 128] }, // gray
      partial: { bg: [255, 237, 213], text: [194, 65, 12] },    // soft orange
    };

    const colors = statusColors[status] || statusColors.draft;
    const label = statusLabels[status] || status;

    // Modern pill badge
    doc.setFontSize(8);
    const badgeWidth = doc.getTextWidth(label) + 8;
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.roundedRect(x, y - 3.5, badgeWidth, 6, 3, 3, 'F');

    // Badge text
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
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
export const generateInvoicePDF = (invoice: Invoice, companySettings?: CompanySettings, paymentUrl?: string) =>
  invoicePdfService.generateInvoicePDF(invoice, companySettings, paymentUrl);

export const generateInvoicePDFBlob = (invoice: Invoice, companySettings?: CompanySettings, paymentUrl?: string) =>
  invoicePdfService.generateInvoicePDFBlob(invoice, companySettings, paymentUrl);
