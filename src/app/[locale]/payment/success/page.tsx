'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PaymentStatus {
  status: 'checking' | 'success' | 'failed' | 'pending';
  message: string;
  invoiceId?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'checking',
    message: 'Checking payment status...',
  });

  const invoiceId = searchParams.get('invoiceId');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!invoiceId) {
        setPaymentStatus({
          status: 'failed',
          message: 'Invalid payment link',
        });
        return;
      }

      try {
        // In a real implementation, you would call an API to check the payment status
        // For now, we'll simulate checking the invoice status
        const response = await fetch(`/api/invoices/${invoiceId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }

        const invoice = await response.json();

        // Check the invoice payment status
        if (invoice.status === 'paid') {
          setPaymentStatus({
            status: 'success',
            message: 'Payment successful! Thank you for your payment.',
            invoiceId,
          });
        } else if (invoice.status === 'failed' || invoice.status === 'canceled') {
          setPaymentStatus({
            status: 'failed',
            message: 'Payment was not completed. Please try again.',
            invoiceId,
          });
        } else {
          setPaymentStatus({
            status: 'pending',
            message: 'Payment is being processed. You will receive a confirmation email shortly.',
            invoiceId,
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentStatus({
          status: 'failed',
          message: 'Unable to verify payment status. Please contact support.',
          invoiceId,
        });
      }
    };

    checkPaymentStatus();
  }, [invoiceId, paymentId]);

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'checking':
        return <Loader2 className="h-16 w-16 text-gray-400 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus.status) {
      case 'checking':
        return 'Verifying Payment';
      case 'success':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Payment Pending';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
          <CardDescription className="text-base mt-2">{paymentStatus.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus.status === 'success' && (
            <>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  Invoice #{invoiceId} has been paid successfully.
                </p>
                <p className="text-sm text-green-800 mt-1">
                  A receipt has been sent to your email address.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push('/dashboard')} className="w-full">
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/invoices/${invoiceId}`)}
                  className="w-full"
                >
                  View Invoice
                </Button>
              </div>
            </>
          )}

          {paymentStatus.status === 'failed' && (
            <>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-800">
                  The payment could not be completed. This could be due to:
                </p>
                <ul className="list-disc list-inside text-sm text-red-800 mt-2">
                  <li>Insufficient funds</li>
                  <li>Payment was canceled</li>
                  <li>Technical issue with the payment provider</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push(`/invoices/${invoiceId}`)} className="w-full">
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}

          {paymentStatus.status === 'pending' && (
            <>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Your payment is being processed by your bank.
                </p>
                <p className="text-sm text-yellow-800 mt-1">
                  This usually takes a few minutes but can take up to 1 business day.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push('/dashboard')} className="w-full">
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/invoices/${invoiceId}`)}
                  className="w-full"
                >
                  View Invoice
                </Button>
              </div>
            </>
          )}

          {paymentStatus.status === 'checking' && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Please wait while we verify your payment...</p>
            </div>
          )}

          <div className="pt-4 border-t text-center">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-orange" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
