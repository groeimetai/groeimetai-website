import { db, collections } from '@/lib/firebase/config';
import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Invoice, InvoiceStatus, InvoiceType, InvoiceItem, InvoiceFinancial } from '@/types';
import { emailService } from './emailService';
// PDF generation is handled by invoicePdfService when needed

class InvoiceService {
  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Get the last invoice of the current month
    const q = query(
      collection(db, collections.invoices || 'invoices'),
      where('invoiceNumber', '>=', `INV-${year}${month}-001`),
      where('invoiceNumber', '<=', `INV-${year}${month}-999`),
      orderBy('invoiceNumber', 'desc')
    );

    const snapshot = await getDocs(q);
    let nextNumber = 1;

    if (!snapshot.empty) {
      const lastInvoice = snapshot.docs[0].data();
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `INV-${year}${month}-${String(nextNumber).padStart(3, '0')}`;
  }

  /**
   * Calculate invoice financial totals
   */
  private calculateFinancials(items: InvoiceItem[], discount: number = 0): InvoiceFinancial {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = items.reduce((sum, item) => sum + item.tax, 0);
    const total = subtotal + tax - discount;

    return {
      subtotal,
      discount,
      tax,
      total,
      paid: 0,
      balance: total,
      currency: 'EUR',
    };
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoiceData: {
    clientId: string;
    organizationId?: string;
    billingAddress: any;
    projectId?: string;
    quoteId?: string;
    milestoneId?: string;
    type: InvoiceType;
    items: InvoiceItem[];
    dueDate: Date;
    issueDate?: Date;
    createdBy: string;
  }): Promise<Invoice> {
    try {
      const invoiceNumber = await this.generateInvoiceNumber();
      const financial = this.calculateFinancials(invoiceData.items);

      const invoice: Invoice = {
        id: doc(collection(db, collections.invoices || 'invoices')).id,
        invoiceNumber,
        clientId: invoiceData.clientId,
        organizationId: invoiceData.organizationId,
        billingAddress: invoiceData.billingAddress,
        projectId: invoiceData.projectId,
        quoteId: invoiceData.quoteId,
        milestoneId: invoiceData.milestoneId,
        status: 'draft',
        type: invoiceData.type,
        items: invoiceData.items,
        financial,
        issueDate: invoiceData.issueDate || new Date(),
        dueDate: invoiceData.dueDate,
        reminders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: invoiceData.createdBy,
      };

      // Save to Firestore
      await setDoc(doc(db, collections.invoices || 'invoices', invoice.id), {
        ...invoice,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    try {
      const invoiceDoc = await getDoc(doc(db, collections.invoices || 'invoices', invoiceId));

      if (!invoiceDoc.exists()) {
        return null;
      }

      return {
        id: invoiceDoc.id,
        ...invoiceDoc.data(),
      } as Invoice;
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw error;
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<void> {
    try {
      await updateDoc(doc(db, collections.invoices || 'invoices', invoiceId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  /**
   * Send invoice email to customer
   */
  async sendInvoice(
    invoiceId: string,
    recipientEmail: string,
    recipientName?: string
  ): Promise<void> {
    try {
      const invoice = await this.getInvoice(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Generate PDF if not already generated
      if (!invoice.pdfUrl) {
        // PDF is generated on-demand via the API endpoint
        const pdfUrl = `/api/invoices/${invoice.id}/pdf`;
        await this.updateInvoice(invoiceId, {
          pdfUrl,
          pdfGeneratedAt: new Date(),
        });
        invoice.pdfUrl = pdfUrl;
      }

      // Send email with invoice
      await emailService.sendInvoiceEmail({
        recipientEmail,
        recipientName,
        invoice,
        pdfUrl: invoice.pdfUrl,
      });

      // Update invoice status
      await this.updateInvoice(invoiceId, {
        status: 'sent',
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  /**
   * Update invoice payment status
   */
  async updatePaymentStatus(
    invoiceId: string,
    status: InvoiceStatus,
    paymentDetails?: {
      paymentId?: string;
      paymentMethod?: string;
      paidAmount?: number;
      transactionId?: string;
    }
  ): Promise<void> {
    try {
      const updates: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === 'paid' && paymentDetails) {
        updates.paidDate = serverTimestamp();
        updates.paymentMethod = paymentDetails.paymentMethod;
        updates.paymentDetails = {
          transactionId: paymentDetails.transactionId,
          paymentId: paymentDetails.paymentId,
        };

        // Update financial data
        const invoice = await this.getInvoice(invoiceId);
        if (invoice) {
          updates.financial = {
            ...invoice.financial,
            paid: paymentDetails.paidAmount || invoice.financial.total,
            balance: 0,
          };
        }
      }

      await this.updateInvoice(invoiceId, updates);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Get invoices for a client
   */
  async getClientInvoices(clientId: string): Promise<Invoice[]> {
    try {
      const q = query(
        collection(db, collections.invoices || 'invoices'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Invoice
      );
    } catch (error) {
      console.error('Error getting client invoices:', error);
      throw error;
    }
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(): Promise<Invoice[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, collections.invoices || 'invoices'),
        where('status', 'in', ['sent', 'viewed', 'partial']),
        where('dueDate', '<', now),
        orderBy('dueDate', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Invoice
      );
    } catch (error) {
      console.error('Error getting overdue invoices:', error);
      throw error;
    }
  }

  /**
   * Send invoice reminder
   */
  async sendReminder(
    invoiceId: string,
    reminderType: 'due_soon' | 'overdue' | 'final_notice'
  ): Promise<void> {
    try {
      const invoice = await this.getInvoice(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Get client details
      const clientDoc = await getDoc(doc(db, collections.users, invoice.clientId));
      const client = clientDoc.data();

      if (client) {
        await emailService.sendInvoiceReminderEmail({
          recipientEmail: client.email,
          recipientName: client.fullName,
          invoice,
          reminderType,
        });

        // Update invoice with reminder info
        const reminders = invoice.reminders || [];
        reminders.push({
          sentAt: new Date(),
          type: reminderType,
        });

        await this.updateInvoice(invoiceId, { reminders });
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
