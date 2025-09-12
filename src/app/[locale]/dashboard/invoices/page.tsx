'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  CreditCard,
  TrendingUp,
  Receipt,
  MoreVertical,
  Send,
  Printer,
  Euro,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from '@/i18n/routing';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { toast } from 'react-hot-toast';
// Invoice operations are handled through API routes
import { PaymentButton } from '@/components/invoice/PaymentButton';
import { Invoice, InvoiceStatus } from '@/types';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, collections } from '@/lib/firebase/config';

interface InvoiceStats {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  recentPayments: number;
  averagePaymentTime: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [stats, setStats] = useState<InvoiceStats>({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    recentPayments: 0,
    averagePaymentTime: 7,
  });

  // Load invoices with real-time updates
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!user) return;

    // Create real-time listener for user's invoices
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
            // Convert Firestore timestamps to Date objects
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
        setFilteredInvoices(updatedInvoices);
        calculateStats(updatedInvoices);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading invoices:', error);
        toast.error('Failed to load invoices');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, loading, router]);

  // Calculate stats
  const calculateStats = (invoicesList: Invoice[]) => {
    const paidInvoices = invoicesList.filter((inv) => inv.status === 'paid');
    const pendingInvoices = invoicesList.filter(
      (inv) => inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'partial'
    );
    const overdueInvoices = invoicesList.filter((inv) => inv.status === 'overdue');

    // Calculate average payment time for paid invoices
    let totalPaymentDays = 0;
    let paymentCount = 0;

    paidInvoices.forEach((inv) => {
      if (inv.paidDate) {
        const daysToPay = Math.floor(
          (inv.paidDate.getTime() - inv.issueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalPaymentDays += daysToPay;
        paymentCount++;
      }
    });

    const avgPaymentTime = paymentCount > 0 ? Math.round(totalPaymentDays / paymentCount) : 0;

    setStats({
      totalPaid: paidInvoices.reduce((sum, inv) => sum + inv.financial.total, 0),
      totalPending: pendingInvoices.reduce((sum, inv) => sum + inv.financial.total, 0),
      totalOverdue: overdueInvoices.reduce((sum, inv) => sum + inv.financial.total, 0),
      recentPayments: paidInvoices.filter((inv) => {
        const paidDate = inv.paidDate || new Date();
        const daysSincePaid = (Date.now() - paidDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSincePaid <= 30;
      }).length,
      averagePaymentTime: avgPaymentTime,
    });
  };

  // Filter invoices
  useEffect(() => {
    let filtered = invoices;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((inv) => {
        // Search in invoice number
        if (inv.invoiceNumber.toLowerCase().includes(query)) return true;

        // Search in project name if available
        if (inv.projectId) {
          // You might want to fetch project name from projects collection
          // For now, we'll search in items descriptions
          return inv.items.some((item) => item.description.toLowerCase().includes(query));
        }

        return false;
      });
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchQuery, statusFilter]);

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'sent':
      case 'viewed':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'partial':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default:
        return 'bg-white/20 text-white border-white/30';
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'sent':
      case 'viewed':
        return <Clock className="w-4 h-4" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    setDownloadingInvoiceId(invoice.id);
    try {
      // For now, show a message that PDF generation is coming soon
      // The PDF API requires proper authentication setup which needs to be configured
      toast('PDF download will be available soon', {
        icon: '📄',
      });

      // When authentication is properly set up, use this code:
      /*
      const idToken = await user?.getIdToken();
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Downloaded invoice ${invoice.invoiceNumber}`);
      */
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const handleSendReminder = async (invoice: Invoice) => {
    try {
      // TODO: Implement reminder API endpoint
      toast('Reminder functionality coming soon', {
        icon: '📧',
      });
      return;
      /*await invoiceService.sendReminder(
        invoice.id,
        invoice.status === 'overdue' ? 'overdue' : 'due_soon'
      );
      toast.success(`Payment reminder sent for invoice ${invoice.invoiceNumber}`);*/
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send payment reminder');
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // For now, show a message that printing is coming soon
    toast('Invoice printing will be available soon', {
      icon: '🖨️',
    });

    // When authentication is properly set up, use this code:
    // window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  };

  const getStatusDisplayName = (status: InvoiceStatus): string => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent';
      case 'viewed':
        return 'Viewed';
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partial';
      case 'overdue':
        return 'Overdue';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto"></div>
          <p className="mt-4 text-white/60">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Invoices</h1>
              <p className="text-white/60 mt-2">Manage your invoices and payment history</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60">Total Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(stats.totalPaid, 'EUR')}
                  </p>
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(stats.totalPending, 'EUR')}
                  </p>
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60">Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(stats.totalOverdue, 'EUR')}
                  </p>
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60">
                  Avg. Payment Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-white">{stats.averagePaymentTime} days</p>
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search invoices..."
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
              All
            </Button>
            <Button
              variant={statusFilter === 'paid' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('paid')}
              className={statusFilter === 'paid' ? 'bg-orange' : ''}
            >
              Paid
            </Button>
            <Button
              variant={statusFilter === 'sent' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('sent')}
              className={statusFilter === 'sent' ? 'bg-orange' : ''}
            >
              Sent
            </Button>
            <Button
              variant={statusFilter === 'overdue' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('overdue')}
              className={statusFilter === 'overdue' ? 'bg-orange' : ''}
            >
              Overdue
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
                {invoices.length === 0 ? 'No invoices yet' : 'No invoices found'}
              </h3>
              <p className="text-white/60">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Your invoices will appear here once you receive your first invoice.'}
              </p>
              {invoices.length === 0 && (
                <Link href="/dashboard">
                  <Button className="mt-4 bg-orange hover:bg-orange/90">Back to Dashboard</Button>
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Invoice</th>
                    <th className="text-left p-4 text-white/60 font-medium">Project</th>
                    <th className="text-left p-4 text-white/60 font-medium">Amount</th>
                    <th className="text-left p-4 text-white/60 font-medium">Status</th>
                    <th className="text-left p-4 text-white/60 font-medium hidden md:table-cell">
                      Due Date
                    </th>
                    <th className="text-right p-4 text-white/60 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredInvoices.map((invoice, index) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-white/60 mt-1">
                              Issued {format(invoice.issueDate, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white">
                              {invoice.items.length > 0 ? invoice.items[0].description : 'Invoice'}
                            </p>
                            {invoice.items.length > 1 && (
                              <p className="text-sm text-white/60">
                                +{invoice.items.length - 1} more items
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium">
                            {formatCurrency(invoice.financial.total, invoice.financial.currency)}
                          </p>
                          <p className="text-sm text-white/60">
                            incl.{' '}
                            {formatCurrency(invoice.financial.tax, invoice.financial.currency)} tax
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(invoice.status)} w-fit`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(invoice.status)}
                              {getStatusDisplayName(invoice.status)}
                            </span>
                          </Badge>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div>
                            <p className="text-white">{format(invoice.dueDate, 'MMM d, yyyy')}</p>
                            {invoice.status === 'overdue' && (
                              <p className="text-sm text-red-400 mt-1">
                                {formatDistanceToNow(invoice.dueDate, { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                              <PaymentButton
                                invoiceId={invoice.id}
                                amount={invoice.financial.total}
                                currency={invoice.financial.currency}
                                status={invoice.status}
                                onPaymentInitiated={() => {
                                  toast.success('Redirecting to payment page...');
                                }}
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowInvoiceDialog(true);
                              }}
                              className="text-white/60 hover:text-white"
                              title="View invoice details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadInvoice(invoice)}
                              disabled={downloadingInvoiceId === invoice.id}
                              className="text-white/60 hover:text-white"
                              title="Download PDF"
                            >
                              {downloadingInvoiceId === invoice.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-white/60 hover:text-white"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-gray-900 border-white/10"
                              >
                                <DropdownMenuItem
                                  onClick={() => handlePrintInvoice(invoice)}
                                  className="text-white hover:bg-white/10"
                                >
                                  <Printer className="w-4 h-4 mr-2" />
                                  Print Invoice
                                </DropdownMenuItem>
                                {(invoice.status === 'sent' ||
                                  invoice.status === 'viewed' ||
                                  invoice.status === 'overdue') && (
                                  <DropdownMenuItem
                                    onClick={() => handleSendReminder(invoice)}
                                    className="text-white hover:bg-white/10"
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Reminder
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        {selectedInvoice && (
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
              <DialogDescription className="text-white/60">
                Invoice details and payment information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status and Dates */}
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(selectedInvoice.status)} w-fit`}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(selectedInvoice.status)}
                    {getStatusDisplayName(selectedInvoice.status)}
                  </span>
                </Badge>
                <div className="text-right text-sm">
                  <p className="text-white/60">
                    Issued: {format(selectedInvoice.issueDate, 'MMM d, yyyy')}
                  </p>
                  <p className="text-white/60">
                    Due: {format(selectedInvoice.dueDate, 'MMM d, yyyy')}
                  </p>
                  {selectedInvoice.paidDate && (
                    <p className="text-green-400">
                      Paid: {format(selectedInvoice.paidDate, 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              {selectedInvoice.billingAddress && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">Billing Address</h3>
                  <div className="text-white">
                    <p>{selectedInvoice.billingAddress.street}</p>
                    <p>
                      {selectedInvoice.billingAddress.city}, {selectedInvoice.billingAddress.state}{' '}
                      {selectedInvoice.billingAddress.postalCode}
                    </p>
                    <p>{selectedInvoice.billingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Invoice Items */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-2">Items</h3>
                <div className="bg-white/5 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-3 text-white/60 text-sm">Description</th>
                        <th className="text-center p-3 text-white/60 text-sm">Qty</th>
                        <th className="text-right p-3 text-white/60 text-sm">Unit Price</th>
                        <th className="text-right p-3 text-white/60 text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id} className="border-b border-white/5">
                          <td className="p-3 text-white">{item.description}</td>
                          <td className="p-3 text-center text-white">{item.quantity}</td>
                          <td className="p-3 text-right text-white">
                            {formatCurrency(item.unitPrice, selectedInvoice.financial.currency)}
                          </td>
                          <td className="p-3 text-right text-white">
                            {formatCurrency(item.total, selectedInvoice.financial.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>
                    {formatCurrency(
                      selectedInvoice.financial.subtotal,
                      selectedInvoice.financial.currency
                    )}
                  </span>
                </div>
                {selectedInvoice.financial.discount > 0 && (
                  <div className="flex justify-between text-white/60">
                    <span>Discount</span>
                    <span>
                      -
                      {formatCurrency(
                        selectedInvoice.financial.discount,
                        selectedInvoice.financial.currency
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-white/60">
                  <span>Tax</span>
                  <span>
                    {formatCurrency(
                      selectedInvoice.financial.tax,
                      selectedInvoice.financial.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-white font-medium text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      selectedInvoice.financial.total,
                      selectedInvoice.financial.currency
                    )}
                  </span>
                </div>
                {selectedInvoice.financial.paid > 0 &&
                  selectedInvoice.financial.paid < selectedInvoice.financial.total && (
                    <>
                      <div className="flex justify-between text-green-400">
                        <span>Paid</span>
                        <span>
                          {formatCurrency(
                            selectedInvoice.financial.paid,
                            selectedInvoice.financial.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-orange font-medium">
                        <span>Balance Due</span>
                        <span>
                          {formatCurrency(
                            selectedInvoice.financial.balance,
                            selectedInvoice.financial.currency
                          )}
                        </span>
                      </div>
                    </>
                  )}
              </div>

              {/* Payment Info */}
              {selectedInvoice.paymentMethod && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">Payment Information</h3>
                  <p className="text-white">Method: {selectedInvoice.paymentMethod}</p>
                  {selectedInvoice.paymentDetails?.transactionId && (
                    <p className="text-white">
                      Transaction ID: {selectedInvoice.paymentDetails.transactionId}
                    </p>
                  )}
                  {selectedInvoice.paymentDetails?.reference && (
                    <p className="text-white">
                      Reference: {selectedInvoice.paymentDetails.reference}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  disabled={downloadingInvoiceId === selectedInvoice.id}
                  className="flex-1 bg-orange hover:bg-orange/90"
                >
                  {downloadingInvoiceId === selectedInvoice.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
                {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (
                  <PaymentButton
                    invoiceId={selectedInvoice.id}
                    amount={selectedInvoice.financial.total}
                    currency={selectedInvoice.financial.currency}
                    status={selectedInvoice.status}
                    onPaymentInitiated={() => {
                      setShowInvoiceDialog(false);
                      toast.success('Redirecting to payment page...');
                    }}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </main>
  );
}
