'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Invoice {
  id: string;
  invoiceNumber: string;
  projectName: string;
  projectId?: string;
  amount: number;
  currency: 'EUR' | 'USD';
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  description: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  taxRate: number;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [stats, setStats] = useState<InvoiceStats>({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    recentPayments: 0,
    averagePaymentTime: 7,
  });

  // Mock data - replace with Firebase queries
  const mockInvoices: Invoice[] = useMemo(() => [
    {
      id: '1',
      invoiceNumber: 'INV-2025-001',
      projectName: 'E-commerce AI Integration',
      projectId: 'proj-1',
      amount: 15000,
      currency: 'EUR',
      status: 'paid',
      issueDate: new Date('2025-01-01'),
      dueDate: new Date('2025-01-15'),
      paidDate: new Date('2025-01-10'),
      description: 'Initial payment for AI integration project',
      items: [
        {
          description: 'AI Model Development',
          quantity: 1,
          rate: 10000,
          amount: 10000,
        },
        {
          description: 'Integration Services',
          quantity: 20,
          rate: 250,
          amount: 5000,
        },
      ],
      subtotal: 15000,
      tax: 3150,
      taxRate: 21,
      paymentMethod: 'Bank Transfer',
      paymentReference: 'REF-2025-001',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2025-002',
      projectName: 'Corporate Website Redesign',
      projectId: 'proj-2',
      amount: 8500,
      currency: 'EUR',
      status: 'pending',
      issueDate: new Date('2025-01-15'),
      dueDate: new Date('2025-01-30'),
      description: 'Website redesign milestone 1',
      items: [
        {
          description: 'UI/UX Design',
          quantity: 1,
          rate: 5000,
          amount: 5000,
        },
        {
          description: 'Frontend Development',
          quantity: 14,
          rate: 250,
          amount: 3500,
        },
      ],
      subtotal: 8500,
      tax: 1785,
      taxRate: 21,
      notes: 'Payment due upon completion of design phase',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-048',
      projectName: 'Data Analytics Dashboard',
      projectId: 'proj-3',
      amount: 12000,
      currency: 'EUR',
      status: 'overdue',
      issueDate: new Date('2024-12-01'),
      dueDate: new Date('2024-12-15'),
      description: 'Final payment for analytics dashboard',
      items: [
        {
          description: 'Dashboard Development',
          quantity: 1,
          rate: 8000,
          amount: 8000,
        },
        {
          description: 'Data Pipeline Setup',
          quantity: 1,
          rate: 4000,
          amount: 4000,
        },
      ],
      subtotal: 12000,
      tax: 2520,
      taxRate: 21,
      notes: 'Please process payment as soon as possible',
    },
  ], []);

  // Load invoices
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Simulate loading invoices
      setTimeout(() => {
        setInvoices(mockInvoices);
        setFilteredInvoices(mockInvoices);
        
        // Calculate stats
        const paidInvoices = mockInvoices.filter(inv => inv.status === 'paid');
        const pendingInvoices = mockInvoices.filter(inv => inv.status === 'pending');
        const overdueInvoices = mockInvoices.filter(inv => inv.status === 'overdue');
        
        setStats({
          totalPaid: paidInvoices.reduce((sum, inv) => sum + inv.amount, 0),
          totalPending: pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0),
          totalOverdue: overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0),
          recentPayments: paidInvoices.filter(inv => {
            const paidDate = inv.paidDate || new Date();
            const daysSincePaid = (Date.now() - paidDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSincePaid <= 30;
          }).length,
          averagePaymentTime: 7,
        });
        
        setIsLoading(false);
      }, 1000);
    }
  }, [user, loading, router, mockInvoices]);

  // Filter invoices
  useEffect(() => {
    let filtered = invoices;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        inv =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.projectName.toLowerCase().includes(query) ||
          inv.description.toLowerCase().includes(query)
      );
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchQuery, statusFilter]);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default:
        return 'bg-white/20 text-white border-white/30';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number, currency: 'EUR' | 'USD') => {
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simulate PDF download
    toast.success(`Downloading invoice ${invoice.invoiceNumber}...`);
  };

  const handleSendReminder = (invoice: Invoice) => {
    toast.success(`Payment reminder sent for invoice ${invoice.invoiceNumber}`);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    window.print();
    toast.success(`Preparing invoice ${invoice.invoiceNumber} for printing...`);
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
                <CardTitle className="text-sm font-medium text-white/60">Avg. Payment Time</CardTitle>
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
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
              className={statusFilter === 'pending' ? 'bg-orange' : ''}
            >
              Pending
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
              <h3 className="text-xl font-semibold text-white mb-2">No invoices found</h3>
              <p className="text-white/60">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Your invoices will appear here once generated'}
              </p>
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
                          <p className="text-white">{invoice.projectName}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium">
                            {formatCurrency(invoice.amount + invoice.tax, invoice.currency)}
                          </p>
                          <p className="text-sm text-white/60">
                            + {formatCurrency(invoice.tax, invoice.currency)} tax
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(invoice.status)} w-fit`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(invoice.status)}
                              {invoice.status}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowInvoiceDialog(true);
                              }}
                              className="text-white/60 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="text-white/60 hover:text-white"
                            >
                              <Download className="w-4 h-4" />
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
                              <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
                                <DropdownMenuItem
                                  onClick={() => handlePrintInvoice(invoice)}
                                  className="text-white hover:bg-white/10"
                                >
                                  <Printer className="w-4 h-4 mr-2" />
                                  Print Invoice
                                </DropdownMenuItem>
                                {invoice.status === 'pending' && (
                                  <DropdownMenuItem className="text-white hover:bg-white/10">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay Now
                                  </DropdownMenuItem>
                                )}
                                {(invoice.status === 'pending' || invoice.status === 'overdue') && (
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
                    {selectedInvoice.status}
                  </span>
                </Badge>
                <div className="text-right text-sm">
                  <p className="text-white/60">Issued: {format(selectedInvoice.issueDate, 'MMM d, yyyy')}</p>
                  <p className="text-white/60">Due: {format(selectedInvoice.dueDate, 'MMM d, yyyy')}</p>
                  {selectedInvoice.paidDate && (
                    <p className="text-green-400">Paid: {format(selectedInvoice.paidDate, 'MMM d, yyyy')}</p>
                  )}
                </div>
              </div>

              {/* Project Info */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-2">Project</h3>
                <p className="text-white">{selectedInvoice.projectName}</p>
                <p className="text-sm text-white/60 mt-1">{selectedInvoice.description}</p>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-2">Items</h3>
                <div className="bg-white/5 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-3 text-white/60 text-sm">Description</th>
                        <th className="text-center p-3 text-white/60 text-sm">Qty</th>
                        <th className="text-right p-3 text-white/60 text-sm">Rate</th>
                        <th className="text-right p-3 text-white/60 text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-white/5">
                          <td className="p-3 text-white">{item.description}</td>
                          <td className="p-3 text-center text-white">{item.quantity}</td>
                          <td className="p-3 text-right text-white">
                            {formatCurrency(item.rate, selectedInvoice.currency)}
                          </td>
                          <td className="p-3 text-right text-white">
                            {formatCurrency(item.amount, selectedInvoice.currency)}
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
                  <span>{formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Tax ({selectedInvoice.taxRate}%)</span>
                  <span>{formatCurrency(selectedInvoice.tax, selectedInvoice.currency)}</span>
                </div>
                <div className="flex justify-between text-white font-medium text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.amount + selectedInvoice.tax, selectedInvoice.currency)}</span>
                </div>
              </div>

              {/* Payment Info */}
              {selectedInvoice.paymentMethod && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">Payment Information</h3>
                  <p className="text-white">Method: {selectedInvoice.paymentMethod}</p>
                  {selectedInvoice.paymentReference && (
                    <p className="text-white">Reference: {selectedInvoice.paymentReference}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">Notes</h3>
                  <p className="text-white/80">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="flex-1 bg-orange hover:bg-orange/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                {selectedInvoice.status === 'pending' && (
                  <Button variant="outline" className="flex-1">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </main>
  );
}