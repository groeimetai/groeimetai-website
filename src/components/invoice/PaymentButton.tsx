'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentButtonProps {
  invoiceId: string;
  amount: number;
  currency: string;
  status?: string;
  onPaymentInitiated?: () => void;
}

export function PaymentButton({
  invoiceId,
  amount,
  currency,
  status = 'unpaid',
  onPaymentInitiated,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Create payment link for the invoice
      const response = await fetch(`/api/invoices/${invoiceId}/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment link');
      }

      if (data.checkoutUrl) {
        // Notify parent component
        onPaymentInitiated?.();

        // Show success message
        toast.success('Redirecting to payment page...');

        // Redirect to Mollie checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to initiate payment'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for paid invoices
  if (status === 'paid') {
    return (
      <div className="text-green-600 font-medium">
        ✓ Paid
      </div>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full sm:w-auto"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating payment link...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay {currency} {amount.toFixed(2)}
          <ExternalLink className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

/**
 * Example usage in an invoice component:
 * 
 * <PaymentButton
 *   invoiceId={invoice.id}
 *   amount={invoice.totalAmount}
 *   currency={invoice.currency}
 *   status={invoice.status}
 *   onPaymentInitiated={() => {
 *     // Optional: Update UI or show loading state
 *   }}
 * />
 */