import { createMollieClient } from '@mollie/api-client';
import { db } from '@/lib/firebase/config';
import { doc, collection, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { invoiceService } from './invoiceService';
import { emailService } from './emailService';

// Payment types
export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  amount: {
    value: string;
    currency: string;
  };
  status: PaymentStatus;
  method?: string;
  description: string;
  metadata: {
    invoiceId: string;
    clientId: string;
    organizationId?: string;
  };
  molliePaymentId?: string;
  checkoutUrl?: string;
  webhookUrl: string;
  redirectUrl: string;
  cancelUrl: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  expiresAt?: Date;
}

export type PaymentStatus = 'open' | 'pending' | 'paid' | 'failed' | 'canceled' | 'expired';

class PaymentService {
  private mollieClient: any = null;

  constructor() {
    // Mollie client is initialized lazily when needed
  }

  private getMollieClient() {
    if (!this.mollieClient) {
      const apiKey = process.env.MOLLIE_API_KEY;
      if (!apiKey) {
        throw new Error(
          'MOLLIE_API_KEY is not configured. Please add it to your environment variables.'
        );
      }
      this.mollieClient = createMollieClient({ apiKey });
    }
    return this.mollieClient;
  }

  /**
   * Create a payment for an invoice
   */
  async createPayment(params: {
    invoiceId: string;
    redirectUrl: string;
    webhookUrl: string;
    cancelUrl?: string;
  }): Promise<Payment> {
    try {
      // Get invoice details
      const invoice = await invoiceService.getInvoice(params.invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === 'paid') {
        throw new Error('Invoice is already paid');
      }

      // Get client details
      const clientDoc = await getDoc(doc(db, 'users', invoice.clientId));
      const client = clientDoc.data();
      if (!client) {
        throw new Error('Client not found');
      }

      // Create Mollie payment
      const mollieClient = this.getMollieClient();
      const molliePayment = await mollieClient.payments.create({
        amount: {
          value: invoice.financial.balance.toFixed(2),
          currency: invoice.financial.currency || 'EUR',
        },
        description: `Invoice ${invoice.invoiceNumber}`,
        redirectUrl: params.redirectUrl,
        webhookUrl: params.webhookUrl,
        cancelUrl: params.cancelUrl || params.redirectUrl,
        metadata: {
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          organizationId: invoice.organizationId || '',
        },
        locale: (client.preferences?.language === 'nl' ? 'nl_NL' : 'en_US') as any,
      });

      // Create payment record
      const payment: Payment = {
        id: doc(collection(db, "payments")).id,
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        amount: molliePayment.amount,
        status: this.mapMollieStatus(molliePayment.status),
        method: molliePayment.method || undefined,
        description: molliePayment.description,
        metadata: {
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          organizationId: invoice.organizationId,
        },
        molliePaymentId: molliePayment.id,
        checkoutUrl: molliePayment._links.checkout?.href,
        webhookUrl: params.webhookUrl,
        redirectUrl: params.redirectUrl,
        cancelUrl: params.cancelUrl || params.redirectUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: molliePayment.expiresAt ? new Date(molliePayment.expiresAt) : undefined,
      };

      // Save payment to Firestore
      await setDoc(doc(db, 'payments', payment.id), {
        ...payment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update invoice with payment details
      await invoiceService.updateInvoice(invoice.id, {
        paymentDetails: {
          transactionId: molliePayment.id,
          reference: molliePayment.getCheckoutUrl() || '',
          notes: `Mollie payment: ${molliePayment.status}`,
        },
      });

      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Handle Mollie webhook
   */
  async handleWebhook(paymentId: string): Promise<void> {
    try {
      // Get payment from Mollie
      const mollieClient = this.getMollieClient();
      const molliePayment = await mollieClient.payments.get(paymentId);

      // Find payment in database by Mollie payment ID
      const paymentDoc = await this.getPaymentByMollieId(molliePayment.id);
      if (!paymentDoc) {
        console.error('Payment not found in database:', molliePayment.id);
        return;
      }

      const payment = paymentDoc.data as Payment;
      const newStatus = this.mapMollieStatus(molliePayment.status);

      // Update payment status
      const updates: any = {
        status: newStatus,
        method: molliePayment.method || payment.method,
        updatedAt: serverTimestamp(),
      };

      // Handle different payment statuses
      switch (newStatus) {
        case 'paid':
          updates.paidAt = serverTimestamp();

          // Update invoice status
          await invoiceService.updatePaymentStatus(payment.invoiceId, 'paid', {
            paymentId: payment.id,
            paymentMethod: molliePayment.method || 'unknown',
            paidAmount: parseFloat(molliePayment.amount.value),
            transactionId: molliePayment.id,
          });

          // Send confirmation email
          const invoice = await invoiceService.getInvoice(payment.invoiceId);
          if (invoice) {
            const clientDoc = await getDoc(doc(db, "users", payment.clientId));
            const client = clientDoc.data();
            if (client) {
              await emailService.sendPaymentConfirmationEmail({
                recipientEmail: client.email,
                recipientName: client.fullName,
                invoice,
                paymentMethod: molliePayment.method || 'unknown',
                transactionId: molliePayment.id,
              });
            }
          }
          break;

        case 'failed':
          updates.failedAt = serverTimestamp();
          await invoiceService.updateInvoice(payment.invoiceId, {
            status: 'sent', // Revert to sent status
          });
          break;

        case 'canceled':
          updates.cancelledAt = serverTimestamp();
          await invoiceService.updateInvoice(payment.invoiceId, {
            status: 'sent', // Revert to sent status
          });
          break;

        case 'expired':
          await invoiceService.updateInvoice(payment.invoiceId, {
            status: 'sent', // Revert to sent status
          });
          break;
      }

      // Update payment record
      await updateDoc(doc(db, "payments", paymentDoc.id), updates);
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<Payment | null> {
    try {
      const paymentDoc = await getDoc(doc(db, "payments", paymentId));

      if (!paymentDoc.exists()) {
        return null;
      }

      return {
        id: paymentDoc.id,
        ...paymentDoc.data(),
      } as Payment;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by Mollie payment ID
   */
  private async getPaymentByMollieId(
    molliePaymentId: string
  ): Promise<{ id: string; data: Payment } | null> {
    try {
      // In a real implementation, you would query the payments collection
      // For now, we'll iterate through all payments (not efficient for production)
      const paymentsSnapshot = await getDocs(collection(db, "payments"));

      for (const doc of paymentsSnapshot.docs) {
        const payment = doc.data() as Payment;
        if (payment.molliePaymentId === molliePaymentId) {
          return {
            id: doc.id,
            data: payment,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding payment by Mollie ID:', error);
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // If payment is in a final state, return it
      if (['paid', 'failed', 'canceled', 'expired'].includes(payment.status)) {
        return payment.status;
      }

      // Otherwise, check with Mollie
      if (payment.molliePaymentId) {
        const mollieClient = this.getMollieClient();
        const molliePayment = await mollieClient.payments.get(payment.molliePaymentId);
        const newStatus = this.mapMollieStatus(molliePayment.status);

        // Update local status if different
        if (newStatus !== payment.status) {
          await updateDoc(doc(db, "payments", paymentId), {
            status: newStatus,
            updatedAt: serverTimestamp(),
          });
        }

        return newStatus;
      }

      return payment.status;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  /**
   * Map Mollie status to our payment status
   */
  private mapMollieStatus(mollieStatus: string): PaymentStatus {
    const statusMap: { [key: string]: PaymentStatus } = {
      open: 'open',
      pending: 'pending',
      paid: 'paid',
      failed: 'failed',
      canceled: 'canceled',
      expired: 'expired',
      authorized: 'pending',
      processing: 'pending',
    };

    return statusMap[mollieStatus] || 'pending';
  }

  /**
   * Verify webhook request validity
   * Note: Mollie doesn't sign webhooks. Security is handled by:
   * 1. IP allowlisting in the webhook route
   * 2. Always fetching payment status from Mollie's API (never trusting webhook data)
   * 3. Idempotency checks to prevent replay attacks
   *
   * @deprecated Use IP validation in the webhook route instead
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    // Mollie doesn't sign webhooks - security is handled at the route level
    // by IP validation and by always fetching from Mollie's API
    // Return false to force proper security implementation
    console.warn('verifyWebhookSignature is deprecated - use IP validation in webhook route');
    return false;
  }
}

// Import necessary functions from firebase/firestore
import { getDocs } from 'firebase/firestore';

// Export singleton instance
export const paymentService = new PaymentService();
