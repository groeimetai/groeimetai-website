'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  FileText,
  Calendar,
  Loader2,
  Search,
  Filter,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface Invoice {
  id: string;
  invoiceNumber: string;
  projectName?: string;
  totalAmount: number;
  status: string;
  issueDate: Date;
  dueDate?: Date;
  paymentUrl?: string;
}

const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
  draft: { color: 'bg-gray-500', label: 'Concept', icon: FileText },
  sent: { color: 'bg-yellow-500', label: 'Open', icon: AlertCircle },
  paid: { color: 'bg-green-500', label: 'Betaald', icon: CheckCircle },
  overdue: { color: 'bg-red-500', label: 'Verlopen', icon: AlertCircle },
  cancelled: { color: 'bg-gray-500', label: 'Geannuleerd', icon: FileText },
};

export default function PortalInvoicesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;

      try {
        const invoicesRef = collection(db, 'invoices');
        const invoicesQuery = query(
          invoicesRef,
          where('clientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(invoicesQuery);
        const invoicesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          invoiceNumber: doc.data().invoiceNumber,
          projectName: doc.data().projectName,
          totalAmount: doc.data().totalAmount || 0,
          status: doc.data().status || 'draft',
          issueDate: doc.data().issueDate?.toDate() || doc.data().createdAt?.toDate() || new Date(),
          dueDate: doc.data().dueDate?.toDate(),
          paymentUrl: doc.data().paymentUrl,
        }));
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !invoice.invoiceNumber.toLowerCase().includes(query) &&
        !invoice.projectName?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (statusFilter !== 'all' && invoice.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Calculate totals
  const totals = {
    open: invoices
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.totalAmount, 0),
    paid: invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.totalAmount, 0),
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
    } catch (error) {
      toast.error('Kon PDF niet downloaden');
    }
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    if (invoice.paymentUrl) {
      window.open(invoice.paymentUrl, '_blank');
    } else {
      try {
        const response = await fetch(`/api/invoices/${invoice.id}/create-payment`, {
          method: 'POST',
        });
        const data = await response.json();
        if (data.paymentUrl) {
          window.open(data.paymentUrl, '_blank');
        }
      } catch (error) {
        toast.error('Kon betaling niet starten');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="p-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Facturen</h1>
          <p className="text-white/60 mt-1">Bekijk en betaal uw facturen</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Openstaand bedrag</p>
                  <p className="text-2xl font-bold text-orange">
                    &euro;{totals.open.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Totaal betaald</p>
                  <p className="text-2xl font-bold text-green-400">
                    &euro;{totals.paid.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Zoek facturen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statussen</SelectItem>
              <SelectItem value="sent">Open</SelectItem>
              <SelectItem value="paid">Betaald</SelectItem>
              <SelectItem value="overdue">Verlopen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60 text-lg">Geen facturen gevonden</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/[0.02] border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Factuurnummer</th>
                    <th className="text-left p-4 text-white/60 font-medium">Project</th>
                    <th className="text-left p-4 text-white/60 font-medium">Bedrag</th>
                    <th className="text-left p-4 text-white/60 font-medium">Status</th>
                    <th className="text-left p-4 text-white/60 font-medium">Vervaldatum</th>
                    <th className="text-right p-4 text-white/60 font-medium">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => {
                    const status = statusConfig[invoice.status] || statusConfig.draft;
                    const isOverdue = invoice.dueDate && new Date() > invoice.dueDate && invoice.status === 'sent';
                    const canPay = invoice.status === 'sent' || invoice.status === 'overdue';

                    return (
                      <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-4">
                          <span className="text-white font-medium">{invoice.invoiceNumber}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-white/80">{invoice.projectName || '-'}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-white font-semibold">
                            &euro;{invoice.totalAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge className={`${isOverdue ? 'bg-red-500' : status.color} text-white`}>
                            {isOverdue ? 'Verlopen' : status.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {invoice.dueDate ? (
                            <span className={`text-sm ${isOverdue ? 'text-red-400' : 'text-white/60'}`}>
                              {format(invoice.dueDate, 'dd MMM yyyy', { locale: nl })}
                            </span>
                          ) : (
                            <span className="text-white/40">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPdf(invoice.id)}
                              className="text-white/60 hover:text-white"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                            {canPay && (
                              <Button
                                size="sm"
                                onClick={() => handlePayInvoice(invoice)}
                                className="bg-orange hover:bg-orange/90"
                              >
                                <CreditCard className="w-4 h-4 mr-1" />
                                Betalen
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
