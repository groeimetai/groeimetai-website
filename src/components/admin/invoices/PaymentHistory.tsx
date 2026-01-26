'use client';

import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  AlertCircle,
  CreditCard,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { PaymentStatusBadge, MolliePaymentStatus } from './PaymentStatusBadge';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  molliePaymentId: string | null;
  amount: { value: string; currency: string } | null;
  status: string;
  method: string | null;
  description: string | null;
  checkoutUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  expiresAt: string | null;
}

interface PaymentHistoryProps {
  invoiceId: string;
  className?: string;
}

const methodLabels: Record<string, string> = {
  ideal: 'iDEAL',
  creditcard: 'Creditcard',
  banktransfer: 'Bankoverschrijving',
  paypal: 'PayPal',
  applepay: 'Apple Pay',
  googlepay: 'Google Pay',
  bancontact: 'Bancontact',
  sofort: 'SOFORT',
  eps: 'EPS',
  giropay: 'Giropay',
  kbc: 'KBC/CBC',
  belfius: 'Belfius',
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'canceled':
      return <Ban className="w-4 h-4 text-gray-500" />;
    case 'expired':
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    case 'open':
    case 'pending':
      return <Clock className="w-4 h-4 text-blue-500" />;
    default:
      return <CreditCard className="w-4 h-4 text-gray-400" />;
  }
};

export function PaymentHistory({ invoiceId, className }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [mollieStatus, setMollieStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, [invoiceId]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Niet ingelogd');
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/invoices/${invoiceId}/payment-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kon betalingsgeschiedenis niet ophalen');
      }

      const { data } = await response.json();
      setPayments(data.payments || []);
      setMollieStatus(data.molliePaymentStatus);
      if (data.lastPaymentSync) {
        setLastSync(new Date(data.lastPaymentSync));
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-orange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-white/60">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPaymentHistory}
          className="mt-4"
        >
          Opnieuw proberen
        </Button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <CreditCard className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">Geen betalingspogingen gevonden</p>
        <p className="text-white/40 text-sm mt-1">
          Er is nog geen Mollie betaallink aangemaakt voor deze factuur
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Mollie Status */}
      {mollieStatus && (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <span className="text-white/60 text-sm">Huidige Mollie status:</span>
          <PaymentStatusBadge status={mollieStatus as MolliePaymentStatus} />
        </div>
      )}

      {/* Last Sync Info */}
      {lastSync && (
        <div className="text-xs text-white/40 text-right">
          Laatste sync: {formatDistanceToNow(lastSync, { addSuffix: true, locale: nl })}
        </div>
      )}

      {/* Payment Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-white/10" />

        <div className="space-y-4">
          {payments.map((payment, index) => (
            <div key={payment.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-white/20">
                {getStatusIcon(payment.status)}
              </div>

              {/* Payment details */}
              <div className="flex-1 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <PaymentStatusBadge
                        status={payment.status as MolliePaymentStatus}
                        size="sm"
                      />
                      {payment.method && (
                        <span className="text-sm text-white/60">
                          via {methodLabels[payment.method] || payment.method}
                        </span>
                      )}
                    </div>
                    {payment.amount && (
                      <p className="text-white font-medium mt-1">
                        {payment.amount.currency} {payment.amount.value}
                      </p>
                    )}
                  </div>
                  {payment.checkoutUrl && payment.status === 'open' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(payment.checkoutUrl!, '_blank')}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Betaallink
                    </Button>
                  )}
                </div>

                {/* Timestamps */}
                <div className="text-xs text-white/40 space-y-1">
                  {payment.createdAt && (
                    <p>
                      Aangemaakt: {format(new Date(payment.createdAt), 'd MMMM yyyy HH:mm', { locale: nl })}
                    </p>
                  )}
                  {payment.paidAt && (
                    <p className="text-green-400">
                      Betaald: {format(new Date(payment.paidAt), 'd MMMM yyyy HH:mm', { locale: nl })}
                    </p>
                  )}
                  {payment.failedAt && (
                    <p className="text-red-400">
                      Mislukt: {format(new Date(payment.failedAt), 'd MMMM yyyy HH:mm', { locale: nl })}
                    </p>
                  )}
                  {payment.cancelledAt && (
                    <p className="text-gray-400">
                      Geannuleerd: {format(new Date(payment.cancelledAt), 'd MMMM yyyy HH:mm', { locale: nl })}
                    </p>
                  )}
                  {payment.expiresAt && payment.status === 'open' && (
                    <p className="text-orange-400">
                      Verloopt: {format(new Date(payment.expiresAt), 'd MMMM yyyy HH:mm', { locale: nl })}
                    </p>
                  )}
                </div>

                {/* Mollie Payment ID */}
                {payment.molliePaymentId && (
                  <p className="text-xs text-white/30 mt-2 font-mono">
                    ID: {payment.molliePaymentId}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
