'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Search,
  ChevronLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/routing';
import { format, isAfter } from 'date-fns';
import { nl } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Invoice, InvoiceStatus } from '@/types';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, collections } from '@/lib/firebase/config';

export default function InvoicesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'open' | 'overdue'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  // Load invoices with real-time updates
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!user) return;

    const q = query(
      collection(db, collections.invoices || 'invoices'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const invoicesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            issueDate:
              data.issueDate instanceof Timestamp
                ? data.issueDate.toDate()
                : new Date(data.issueDate),
            dueDate:
              data.dueDate instanceof Timestamp ? data.dueDate.toDate() : new Date(data.dueDate),
            paidDate:
              data.paidDate instanceof Timestamp
                ? data.paidDate.toDate()
                : data.paidDate
                  ? new Date(data.paidDate)
                  : undefined,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(data.createdAt),
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate()
                : new Date(data.updatedAt),
          } as Invoice;
        });

        // Check for overdue invoices
        const now = new Date();
        const updatedInvoices = invoicesData.map((invoice) => {
          if (
            invoice.status !== 'paid' &&
            invoice.status !== 'cancelled' &&
            isAfter(now, invoice.dueDate)
          ) {
            return { ...invoice, status: 'overdue' as InvoiceStatus };
          }
          return invoice;
        });

        setInvoices(updatedInvoices);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading invoices:', error);
        toast.error('Kon facturen niet laden');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, loading, router]);

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    // Apply status filter
    if (statusFilter === 'paid' && invoice.status !== 'paid') return false;
    if (statusFilter === 'open' && invoice.status === 'paid') return false;
    if (statusFilter === 'overdue' && invoice.status !== 'overdue') return false;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (invoice.invoiceNumber.toLowerCase().includes(query)) return true;
      if (invoice.items.some((item) => item.description.toLowerCase().includes(query))) return true;
      return false;
    }

    return true;
  });

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'sent':
      case 'viewed':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'Betaald';
      case 'sent':
        return 'Verzonden';
      case 'viewed':
        return 'Bekeken';
      case 'overdue':
        return 'Verlopen';
      case 'cancelled':
        return 'Geannuleerd';
      case 'draft':
        return 'Concept';
      case 'partial':
        return 'Deels betaald';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    setDownloadingInvoiceId(invoice.id);
    try {
      toast('PDF download wordt binnenkort beschikbaar', {
        icon: '📄',
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Kon factuur niet downloaden');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange mx-auto" />
          <p className="mt-4 text-white/60">Facturen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Terug naar Dashboard
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-white">Facturen</h1>
            <p className="text-white/60 mt-2">Bekijk je facturen en betalingsgeschiedenis</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <Input
              type="text"
              placeholder="Zoek facturen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' ? 'bg-orange' : ''}
            >
              Alle
            </Button>
            <Button
              variant={statusFilter === 'open' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('open')}
              className={statusFilter === 'open' ? 'bg-orange' : ''}
            >
              Open
            </Button>
            <Button
              variant={statusFilter === 'paid' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('paid')}
              className={statusFilter === 'paid' ? 'bg-orange' : ''}
            >
              Betaald
            </Button>
            <Button
              variant={statusFilter === 'overdue' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('overdue')}
              className={statusFilter === 'overdue' ? 'bg-orange' : ''}
            >
              Verlopen
            </Button>
          </div>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-12"
          >
            <div className="text-center">
              <Receipt className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {invoices.length === 0 ? 'Nog geen facturen' : 'Geen facturen gevonden'}
              </h3>
              <p className="text-white/60">
                {searchQuery || statusFilter !== 'all'
                  ? 'Probeer je zoekopdracht of filters aan te passen'
                  : 'Je facturen verschijnen hier zodra je je eerste factuur ontvangt.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Factuurnummer</th>
                    <th className="text-left p-4 text-white/60 font-medium hidden md:table-cell">
                      Datum
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">Bedrag</th>
                    <th className="text-left p-4 text-white/60 font-medium">Status</th>
                    <th className="text-right p-4 text-white/60 font-medium">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice, index) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-orange" />
                          <div>
                            <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-white/60 md:hidden">
                              {format(invoice.issueDate, 'd MMM yyyy', { locale: nl })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div>
                          <p className="text-white">
                            {format(invoice.issueDate, 'd MMMM yyyy', { locale: nl })}
                          </p>
                          <p className="text-sm text-white/60">
                            Vervaldatum: {format(invoice.dueDate, 'd MMM yyyy', { locale: nl })}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">
                          {formatCurrency(invoice.financial.total, invoice.financial.currency)}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(invoice.status)} w-fit`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(invoice.status)}
                            {getStatusLabel(invoice.status)}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                            disabled={downloadingInvoiceId === invoice.id}
                          >
                            {downloadingInvoiceId === invoice.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
