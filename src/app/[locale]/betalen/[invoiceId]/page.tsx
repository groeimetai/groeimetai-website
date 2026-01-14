'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, CheckCircle, AlertCircle, FileText, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  balance: number;
  currency: string;
  dueDate: string;
  clientName?: string;
  items?: Array<{
    description: string;
    quantity: number;
    total: number;
  }>;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}/pay`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Kon factuur niet laden');
        }

        setInvoice(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handlePayment = async () => {
    setPaying(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kon betaling niet starten');
      }

      // Redirect to Mollie checkout
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error('Geen betaallink ontvangen');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
      setPaying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Concept', variant: 'secondary' },
      sent: { label: 'Verzonden', variant: 'default' },
      viewed: { label: 'Bekeken', variant: 'default' },
      paid: { label: 'Betaald', variant: 'outline' },
      overdue: { label: 'Verlopen', variant: 'destructive' },
      cancelled: { label: 'Geannuleerd', variant: 'secondary' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080D14' }}>
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange mx-auto" />
          <p className="mt-4 text-white/60">Factuur laden...</p>
        </div>
      </main>
    );
  }

  if (error && !invoice) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#080D14' }}>
        <Card className="max-w-md w-full bg-white/5 border-white/10">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Factuur niet gevonden</h2>
            <p className="text-white/60">{error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!invoice) {
    return null;
  }

  const isPaid = invoice.status === 'paid';
  const isCancelled = invoice.status === 'cancelled';

  return (
    <main className="min-h-screen py-12 px-4" style={{ backgroundColor: '#080D14' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isPaid ? 'Factuur betaald' : 'Factuur betalen'}
          </h1>
          <p className="text-white/60">
            {isPaid
              ? 'Deze factuur is al betaald. Bedankt!'
              : 'Betaal veilig en snel via iDEAL, creditcard of andere betaalmethodes'}
          </p>
        </div>

        {/* Invoice Card */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-orange" />
                <CardTitle className="text-white">{invoice.invoiceNumber}</CardTitle>
              </div>
              {getStatusBadge(invoice.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client info */}
            {invoice.clientName && (
              <div className="flex items-center gap-3 text-white/80">
                <Building2 className="h-5 w-5 text-white/40" />
                <span>{invoice.clientName}</span>
              </div>
            )}

            {/* Due date */}
            {invoice.dueDate && (
              <div className="flex items-center gap-3 text-white/80">
                <Calendar className="h-5 w-5 text-white/40" />
                <span>
                  Vervaldatum: {format(new Date(invoice.dueDate), 'd MMMM yyyy', { locale: nl })}
                </span>
              </div>
            )}

            {/* Items */}
            {invoice.items && invoice.items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Factuurregels</h3>
                <div className="space-y-2">
                  {invoice.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                    >
                      <div className="text-white/80">
                        <span>{item.description}</span>
                        {item.quantity > 1 && (
                          <span className="text-white/40 ml-2">x{item.quantity}</span>
                        )}
                      </div>
                      <span className="text-white">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-white/10" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-white">Te betalen</span>
              <span className="text-2xl font-bold text-orange">
                {formatCurrency(invoice.balance || invoice.total)}
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Payment button */}
            {isPaid ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-400">Deze factuur is al betaald</p>
              </div>
            ) : isCancelled ? (
              <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4 text-center">
                <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Deze factuur is geannuleerd</p>
              </div>
            ) : (
              <Button
                onClick={handlePayment}
                disabled={paying}
                className="w-full bg-orange hover:bg-orange/90 text-white py-6 text-lg"
              >
                {paying ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Bezig met doorsturen...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Nu betalen - {formatCurrency(invoice.balance || invoice.total)}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Payment methods info */}
        {!isPaid && !isCancelled && (
          <div className="text-center">
            <p className="text-white/40 text-sm">
              Veilig betalen via Mollie - iDEAL, Creditcard, Bancontact, en meer
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm">
            GroeimetAI - AI-gedreven groeioplossingen
          </p>
        </div>
      </div>
    </main>
  );
}
