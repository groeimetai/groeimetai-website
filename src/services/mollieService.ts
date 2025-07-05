import { createMollieClient, MollieClient, Payment } from '@mollie/api-client';

/**
 * Interface for payment request parameters
 */
interface PaymentRequest {
  amount: {
    value: string; // Format: "10.00"
    currency: string; // e.g., "EUR"
  };
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata: {
    invoiceId: string;
    customerId: string;
  };
}

/**
 * Interface for invoice data when creating payment
 */
interface InvoiceData {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  description?: string;
  items?: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Interface for payment result
 */
interface PaymentResult {
  paymentId: string;
  checkoutUrl: string;
  status: string;
}

/**
 * Mollie payment service for handling payments
 */
class MollieService {
  private mollieClient: MollieClient | null = null;
  private readonly apiKey: string;
  private readonly appUrl: string;

  constructor() {
    this.apiKey = process.env.MOLLIE_API_KEY || '';
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    if (!this.apiKey) {
      console.error('MollieService: Missing MOLLIE_API_KEY environment variable');
    }

    if (!this.appUrl) {
      console.error('MollieService: Missing NEXT_PUBLIC_APP_URL environment variable');
    }
  }

  /**
   * Initialize Mollie client
   */
  private getMollieClient(): MollieClient {
    if (!this.mollieClient) {
      if (!this.apiKey) {
        throw new Error('Mollie API key is not configured');
      }
      this.mollieClient = createMollieClient({ apiKey: this.apiKey });
    }
    return this.mollieClient;
  }

  /**
   * Create a payment link for an invoice
   */
  async createPayment(invoice: InvoiceData): Promise<PaymentResult> {
    try {
      if (!this.appUrl) {
        throw new Error('App URL is not configured');
      }

      const mollieClient = this.getMollieClient();

      // Format amount to string with 2 decimal places
      const formattedAmount = invoice.amount.toFixed(2);

      // Create description from invoice items or use default
      let description = invoice.description || `Invoice #${invoice.id}`;
      if (invoice.items && invoice.items.length > 0) {
        const itemDescriptions = invoice.items
          .slice(0, 3) // Limit to first 3 items
          .map(item => `${item.quantity}x ${item.description}`)
          .join(', ');
        description = `Invoice #${invoice.id}: ${itemDescriptions}`;
        
        // Mollie has a 255 character limit for description
        if (description.length > 255) {
          description = description.substring(0, 252) + '...';
        }
      }

      const paymentRequest: PaymentRequest = {
        amount: {
          value: formattedAmount,
          currency: invoice.currency || 'EUR',
        },
        description,
        redirectUrl: `${this.appUrl}/payment/success?invoiceId=${invoice.id}`,
        webhookUrl: `${this.appUrl}/api/webhooks/mollie`,
        metadata: {
          invoiceId: invoice.id,
          customerId: invoice.customerId,
        },
      };

      console.log('Creating Mollie payment:', {
        invoiceId: invoice.id,
        amount: paymentRequest.amount,
        description: paymentRequest.description,
      });

      const payment = await mollieClient.payments.create(paymentRequest as any);

      console.log('Mollie payment created successfully:', {
        paymentId: payment.id,
        status: payment.status,
      });

      return {
        paymentId: payment.id,
        checkoutUrl: payment.getCheckoutUrl() || '',
        status: payment.status,
      };
    } catch (error) {
      console.error('Error creating Mollie payment:', error);
      throw new Error(
        `Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get payment status and details
   */
  async getPayment(paymentId: string): Promise<Payment> {
    try {
      const mollieClient = this.getMollieClient();

      console.log('Fetching Mollie payment:', paymentId);

      const payment = await mollieClient.payments.get(paymentId);

      console.log('Mollie payment fetched:', {
        paymentId: payment.id,
        status: payment.status,
        paidAt: payment.paidAt,
      });

      return payment;
    } catch (error) {
      console.error('Error fetching Mollie payment:', error);
      throw new Error(
        `Failed to get payment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Handle Mollie webhook
   * @param body - The webhook request body
   * @returns The payment object with updated status
   */
  async handleWebhook(body: { id: string }): Promise<{
    payment: Payment;
    invoiceId: string;
    customerId: string;
    shouldUpdateInvoice: boolean;
  }> {
    try {
      if (!body.id) {
        throw new Error('No payment ID provided in webhook');
      }

      console.log('Processing Mollie webhook for payment:', body.id);

      const payment = await this.getPayment(body.id);

      // Extract metadata
      const metadata = payment.metadata as { invoiceId?: string; customerId?: string } | undefined;
      const invoiceId = metadata?.invoiceId;
      const customerId = metadata?.customerId;

      if (!invoiceId || !customerId) {
        throw new Error('Missing invoice or customer ID in payment metadata');
      }

      // Determine if invoice should be updated based on payment status
      const shouldUpdateInvoice = ['paid', 'failed', 'canceled', 'expired'].includes(
        payment.status
      );

      console.log('Webhook processed:', {
        paymentId: payment.id,
        status: payment.status,
        invoiceId,
        customerId,
        shouldUpdateInvoice,
      });

      return {
        payment,
        invoiceId,
        customerId,
        shouldUpdateInvoice,
      };
    } catch (error) {
      console.error('Error handling Mollie webhook:', error);
      throw new Error(
        `Failed to handle webhook: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if payment is successful
   */
  isPaymentSuccessful(payment: Payment): boolean {
    return payment.status === 'paid';
  }

  /**
   * Check if payment is pending
   */
  isPaymentPending(payment: Payment): boolean {
    return ['open', 'pending', 'authorized'].includes(payment.status);
  }

  /**
   * Check if payment has failed
   */
  isPaymentFailed(payment: Payment): boolean {
    return ['failed', 'canceled', 'expired'].includes(payment.status);
  }

  /**
   * Get human-readable payment status
   */
  getPaymentStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      open: 'Awaiting payment',
      canceled: 'Canceled',
      pending: 'Processing',
      authorized: 'Authorized',
      expired: 'Expired',
      failed: 'Failed',
      paid: 'Paid',
    };

    return statusMap[status] || status;
  }

  /**
   * Calculate payment fee (if applicable)
   * Note: This is a placeholder - actual fees depend on your Mollie contract
   */
  calculatePaymentFee(amount: number, paymentMethod?: string): number {
    // Example fee calculation (adjust based on your Mollie contract)
    const feePercentage = 0.029; // 2.9%
    const fixedFee = 0.25; // €0.25

    // Different fees for different payment methods
    if (paymentMethod === 'ideal') {
      return 0.29; // Fixed fee for iDEAL
    }

    return amount * feePercentage + fixedFee;
  }
}

// Check if API key is configured
const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY || '';
if (!MOLLIE_API_KEY) {
  console.warn('MOLLIE_API_KEY is not configured');
}

// Export a function to get the service instance
// This prevents errors during build time
export function getMollieService() {
  if (!MOLLIE_API_KEY) {
    throw new Error('Payment service not configured');
  }
  return new MollieService();
}

// Export types for use in other modules
export type { PaymentRequest, InvoiceData, PaymentResult };