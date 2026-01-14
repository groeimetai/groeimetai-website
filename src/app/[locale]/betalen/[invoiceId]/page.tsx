'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, CheckCircle, AlertCircle, FileText, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl, enUS } from 'date-fns/locale';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  balance: number;
  currency: string;
  dueDate: string;
  clientName?: string;
  billingDetails?: {
    companyName?: string;
    contactName?: string;
  };
  items?: Array<{
    description: string;
    quantity: number;
    total: number;
  }>;
}

// Translations
const translations = {
  nl: {
    title: 'Factuur betalen',
    titlePaid: 'Factuur betaald',
    subtitle: 'Betaal veilig en snel via iDEAL, creditcard of andere betaalmethodes',
    subtitlePaid: 'Deze factuur is al betaald. Bedankt!',
    invoiceLines: 'Factuurregels',
    dueDate: 'Vervaldatum',
    toPay: 'Te betalen',
    payNow: 'Nu betalen',
    redirecting: 'Bezig met doorsturen...',
    alreadyPaid: 'Deze factuur is al betaald',
    cancelled: 'Deze factuur is geannuleerd',
    paymentMethods: 'Veilig betalen via Mollie - iDEAL, Creditcard, Bancontact, en meer',
    footer: 'GroeimetAI - AI-gedreven groeioplossingen',
    loading: 'Factuur laden...',
    notFound: 'Factuur niet gevonden',
    status: {
      draft: 'Concept',
      sent: 'Verzonden',
      viewed: 'Bekeken',
      paid: 'Betaald',
      overdue: 'Verlopen',
      cancelled: 'Geannuleerd',
    },
  },
  en: {
    title: 'Pay Invoice',
    titlePaid: 'Invoice Paid',
    subtitle: 'Pay securely and quickly via iDEAL, credit card, or other payment methods',
    subtitlePaid: 'This invoice has already been paid. Thank you!',
    invoiceLines: 'Invoice Lines',
    dueDate: 'Due Date',
    toPay: 'Amount Due',
    payNow: 'Pay Now',
    redirecting: 'Redirecting...',
    alreadyPaid: 'This invoice has already been paid',
    cancelled: 'This invoice has been cancelled',
    paymentMethods: 'Secure payment via Mollie - iDEAL, Credit Card, Bancontact, and more',
    footer: 'GroeimetAI - AI-powered growth solutions',
    loading: 'Loading invoice...',
    notFound: 'Invoice not found',
    status: {
      draft: 'Draft',
      sent: 'Sent',
      viewed: 'Viewed',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
    },
  },
};

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;
  const locale = (params.locale as string) || 'nl';

  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.nl;
  const dateLocale = locale === 'en' ? enUS : nl;

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
          throw new Error(data.error || t.notFound);
        }

        setInvoice(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.notFound);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId, t.notFound]);

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
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { variant: 'secondary' },
      sent: { variant: 'default' },
      viewed: { variant: 'default' },
      paid: { variant: 'outline' },
      overdue: { variant: 'destructive' },
      cancelled: { variant: 'secondary' },
    };

    const config = statusConfig[status] || { variant: 'secondary' as const };
    const label = t.status[status as keyof typeof t.status] || status;
    return <Badge variant={config.variant}>{label}</Badge>;
  };

  // Get display name from invoice data
  const getDisplayName = () => {
    if (invoice?.billingDetails?.companyName) return invoice.billingDetails.companyName;
    if (invoice?.billingDetails?.contactName) return invoice.billingDetails.contactName;
    if (invoice?.clientName) return invoice.clientName;
    return null;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080D14' }}>
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange mx-auto" />
          <p className="mt-4 text-white/60">{t.loading}</p>
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
            <h2 className="text-xl font-semibold text-white mb-2">{t.notFound}</h2>
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

  const displayName = getDisplayName();

  return (
    <main className="min-h-screen py-12 px-4" style={{ backgroundColor: '#080D14' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isPaid ? t.titlePaid : t.title}
          </h1>
          <p className="text-white/60">
            {isPaid ? t.subtitlePaid : t.subtitle}
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
            {displayName && (
              <div className="flex items-center gap-3 text-white/80">
                <Building2 className="h-5 w-5 text-white/40" />
                <span>{displayName}</span>
              </div>
            )}

            {/* Due date */}
            {invoice.dueDate && (
              <div className="flex items-center gap-3 text-white/80">
                <Calendar className="h-5 w-5 text-white/40" />
                <span>
                  {t.dueDate}: {format(new Date(invoice.dueDate), 'd MMMM yyyy', { locale: dateLocale })}
                </span>
              </div>
            )}

            {/* Items */}
            {invoice.items && invoice.items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">{t.invoiceLines}</h3>
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
              <span className="text-lg font-medium text-white">{t.toPay}</span>
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
                <p className="text-green-400">{t.alreadyPaid}</p>
              </div>
            ) : isCancelled ? (
              <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4 text-center">
                <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">{t.cancelled}</p>
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
                    {t.redirecting}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    {t.payNow} - {formatCurrency(invoice.balance || invoice.total)}
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
              {t.paymentMethods}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm">
            {t.footer}
          </p>
        </div>
      </div>
    </main>
  );
}
