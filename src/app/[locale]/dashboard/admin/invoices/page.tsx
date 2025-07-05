'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Download,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Mail,
  CreditCard,
  ArrowUpDown,
  Eye,
  Copy,
  Loader2,
  Receipt
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceToNow, addDays, isAfter } from 'date-fns';
import { BulkActions, useBulkSelection } from '@/components/admin/BulkActions';
import type { BulkActionType } from '@/components/admin/BulkActions';
import { notificationService } from '@/services/notificationService';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  projectId?: string;
  projectName?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
  paymentTerms: number; // days
  sentAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    clientId: 'client1',
    clientName: 'Tech Solutions BV',
    clientEmail: 'finance@techsolutions.nl',
    clientCompany: 'Tech Solutions BV',
    projectName: 'AI Chatbot Implementation',
    status: 'paid',
    issueDate: new Date('2024-01-01'),
    dueDate: new Date('2024-01-31'),
    items: [
      { description: 'AI Consulting Services', quantity: 40, rate: 150, amount: 6000 },
      { description: 'Chatbot Development', quantity: 80, rate: 125, amount: 10000 },
      { description: 'Training & Support', quantity: 16, rate: 100, amount: 1600 },
    ],
    subtotal: 17600,
    tax: 3696,
    total: 21296,
    currency: 'EUR',
    paymentTerms: 30,
    paidAt: new Date('2024-01-25'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    clientId: 'client2',
    clientName: 'Global Retail Co',
    clientEmail: 'accounting@globalretail.com',
    clientCompany: 'Global Retail Co',
    projectName: 'Process Automation',
    status: 'overdue',
    issueDate: new Date('2024-01-05'),
    dueDate: new Date('2024-01-20'),
    items: [
      { description: 'Process Analysis', quantity: 24, rate: 150, amount: 3600 },
      { description: 'Automation Development', quantity: 60, rate: 125, amount: 7500 },
    ],
    subtotal: 11100,
    tax: 2331,
    total: 13431,
    currency: 'EUR',
    paymentTerms: 15,
    sentAt: new Date('2024-01-05'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    clientId: 'client3',
    clientName: 'Innovation Labs',
    clientEmail: 'billing@innovationlabs.io',
    clientCompany: 'Innovation Labs',
    projectName: 'Data Analysis Project',
    status: 'sent',
    issueDate: new Date('2024-01-10'),
    dueDate: new Date('2024-02-10'),
    items: [
      { description: 'Data Analysis Services', quantity: 32, rate: 175, amount: 5600 },
      { description: 'Report Generation', quantity: 8, rate: 150, amount: 1200 },
    ],
    subtotal: 6800,
    tax: 1428,
    total: 8228,
    currency: 'EUR',
    paymentTerms: 30,
    sentAt: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    clientId: 'client4',
    clientName: 'StartUp Hub',
    clientEmail: 'finance@startuphub.com',
    clientCompany: 'StartUp Hub',
    status: 'draft',
    issueDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    items: [
      { description: 'AI Strategy Consulting', quantity: 16, rate: 200, amount: 3200 },
    ],
    subtotal: 3200,
    tax: 672,
    total: 3872,
    currency: 'EUR',
    paymentTerms: 30,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

export default function AdminInvoicesPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  // New invoice form state
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    projectName: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    paymentTerms: 30,
    currency: 'EUR',
    notes: '',
  });

  const {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    clearSelection,
  } = useBulkSelection(invoices);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Check for overdue invoices
  useEffect(() => {
    const checkOverdueInvoices = () => {
      const today = new Date();
      setInvoices(prevInvoices =>
        prevInvoices.map(invoice => {
          if (invoice.status === 'sent' && isAfter(today, invoice.dueDate)) {
            return { ...invoice, status: 'overdue' };
          }
          return invoice;
        })
      );
    };

    checkOverdueInvoices();
  }, []);

  // Filter and sort invoices
  const filteredInvoices = invoices.filter(invoice => {
    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      if (!invoice.invoiceNumber.toLowerCase().includes(search) &&
          !invoice.clientName.toLowerCase().includes(search) &&
          !invoice.clientCompany.toLowerCase().includes(search) &&
          !invoice.projectName?.toLowerCase().includes(search)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all' && invoice.status !== statusFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const invoiceDate = invoice.issueDate;
      const daysDiff = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === '7days' && daysDiff > 7) return false;
      if (dateFilter === '30days' && daysDiff > 30) return false;
      if (dateFilter === '90days' && daysDiff > 90) return false;
    }

    return true;
  }).sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'invoiceNumber':
        compareValue = a.invoiceNumber.localeCompare(b.invoiceNumber);
        break;
      case 'clientName':
        compareValue = a.clientName.localeCompare(b.clientName);
        break;
      case 'total':
        compareValue = a.total - b.total;
        break;
      case 'dueDate':
        compareValue = a.dueDate.getTime() - b.dueDate.getTime();
        break;
      default:
        compareValue = a.issueDate.getTime() - b.issueDate.getTime();
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // Calculate stats
  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    outstandingRevenue: invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.total, 0),
  };

  // Generate next invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const lastInvoice = invoices
      .filter(i => i.invoiceNumber.includes(year.toString()))
      .sort((a, b) => b.invoiceNumber.localeCompare(a.invoiceNumber))[0];
    
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
      return `INV-${year}-${String(lastNumber + 1).padStart(3, '0')}`;
    }
    
    return `INV-${year}-001`;
  };

  // Calculate invoice totals
  const calculateInvoiceTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.21; // 21% VAT
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  // Update invoice item
  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...(newInvoice.items || [])];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      amount: field === 'quantity' || field === 'rate' 
        ? updatedItems[index].quantity * updatedItems[index].rate 
        : updatedItems[index].amount
    };
    
    const totals = calculateInvoiceTotals(updatedItems);
    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      ...totals
    });
  };

  // Add invoice item
  const addInvoiceItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...(newInvoice.items || []), { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  // Remove invoice item
  const removeInvoiceItem = (index: number) => {
    const updatedItems = (newInvoice.items || []).filter((_, i) => i !== index);
    const totals = calculateInvoiceTotals(updatedItems);
    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      ...totals
    });
  };

  // Create invoice
  const createInvoice = () => {
    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      clientId: 'new-client',
      clientName: newInvoice.clientName || '',
      clientEmail: newInvoice.clientEmail || '',
      clientCompany: newInvoice.clientCompany || '',
      projectName: newInvoice.projectName,
      status: 'draft',
      issueDate: new Date(),
      dueDate: addDays(new Date(), newInvoice.paymentTerms || 30),
      items: newInvoice.items || [],
      subtotal: newInvoice.subtotal || 0,
      tax: newInvoice.tax || 0,
      total: newInvoice.total || 0,
      currency: newInvoice.currency || 'EUR',
      notes: newInvoice.notes,
      paymentTerms: newInvoice.paymentTerms || 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setInvoices([invoice, ...invoices]);
    setIsCreateDialogOpen(false);
    setNewInvoice({
      clientName: '',
      clientEmail: '',
      clientCompany: '',
      projectName: '',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      paymentTerms: 30,
      currency: 'EUR',
      notes: '',
    });
  };

  // Update invoice status
  const updateInvoiceStatus = async (invoiceId: string, newStatus: Invoice['status']) => {
    setInvoices(invoices.map(invoice => {
      if (invoice.id === invoiceId) {
        const updatedInvoice = { ...invoice, status: newStatus };
        if (newStatus === 'sent') {
          updatedInvoice.sentAt = new Date();
        } else if (newStatus === 'paid') {
          updatedInvoice.paidAt = new Date();
        }
        return updatedInvoice;
      }
      return invoice;
    }));
  };

  // Send invoice
  const sendInvoice = async (invoice: Invoice) => {
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update status
      updateInvoiceStatus(invoice.id, 'sent');
      
      // Send notification
      if (invoice.clientId) {
        await notificationService.sendToUser(
          invoice.clientId,
          {
            title: 'New Invoice',
            description: `Invoice ${invoice.invoiceNumber} has been sent to you.`,
            type: 'payment',
            priority: 'medium',
          }
        );
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  // Send payment reminder
  const sendPaymentReminder = async (invoice: Invoice) => {
    setSendingReminder(true);
    try {
      // Simulate sending reminder
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send notification
      if (invoice.clientId) {
        await notificationService.sendToUser(
          invoice.clientId,
          {
            title: 'Payment Reminder',
            description: `Reminder: Invoice ${invoice.invoiceNumber} is ${invoice.status === 'overdue' ? 'overdue' : 'due soon'}.`,
            type: 'payment',
            priority: 'high',
          }
        );
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setSendingReminder(false);
    }
  };

  // Export invoice as PDF
  const exportInvoice = (invoice: Invoice) => {
    // In a real app, this would generate a PDF
    console.log('Exporting invoice:', invoice);
  };

  // Handle bulk actions
  const handleBulkAction = async (action: BulkActionType, data?: any) => {
    try {
      switch (action) {
        case 'delete':
          setInvoices(invoices.filter(i => !data.ids.includes(i.id)));
          break;

        case 'updateStatus':
          for (const invoiceId of data.ids) {
            await updateInvoiceStatus(invoiceId, data.status);
          }
          break;

        case 'export':
          const selectedInvoices = invoices.filter(i => data.ids.includes(i.id));
          const csv = [
            ['Invoice Number', 'Client', 'Company', 'Status', 'Issue Date', 'Due Date', 'Total', 'Paid'],
            ...selectedInvoices.map(i => [
              i.invoiceNumber,
              i.clientName,
              i.clientCompany,
              i.status,
              format(i.issueDate, 'yyyy-MM-dd'),
              format(i.dueDate, 'yyyy-MM-dd'),
              `${i.currency} ${i.total.toFixed(2)}`,
              i.paidAt ? format(i.paidAt, 'yyyy-MM-dd') : '',
            ]),
          ]
            .map(row => row.join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          break;
      }

      clearSelection();
    } catch (error) {
      console.error('Error executing bulk action:', error);
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'sent':
        return 'bg-blue-500';
      case 'paid':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return Edit;
      case 'sent':
        return Send;
      case 'paid':
        return CheckCircle;
      case 'overdue':
        return AlertCircle;
      case 'cancelled':
        return XCircle;
      default:
        return FileText;
    }
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Invoices Management</h1>
            <p className="text-white/60">Create and manage invoices for all clients</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-orange hover:bg-orange/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">€{stats.totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Outstanding</span>
                <Clock className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-white">€{stats.outstandingRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total</span>
                <FileText className="w-4 h-4 text-white/40" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Paid</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.paid}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Sent</span>
                <Send className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.sent}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Overdue</span>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.overdue}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Search invoices, clients, or projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issueDate">Issue Date</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="invoiceNumber">Invoice Number</SelectItem>
                  <SelectItem value="clientName">Client Name</SelectItem>
                  <SelectItem value="total">Amount</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        <BulkActions
          items={filteredInvoices}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onAction={handleBulkAction}
          actions={['updateStatus', 'export', 'delete']}
          statusOptions={[
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Sent' },
            { value: 'paid', label: 'Paid' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />

        {/* Invoices Table */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin h-8 w-8 text-orange mx-auto mb-4" />
                <p className="text-white/60">Loading invoices...</p>
              </div>
            ) : filteredInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="w-12 text-white/60">
                      <Checkbox
                        checked={selectedIds.size === filteredInvoices.length && filteredInvoices.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(filteredInvoices.map(i => i.id)));
                          } else {
                            clearSelection();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="text-white/60">Invoice</TableHead>
                    <TableHead className="text-white/60">Client</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Issue Date</TableHead>
                    <TableHead className="text-white/60">Due Date</TableHead>
                    <TableHead className="text-white/60">Amount</TableHead>
                    <TableHead className="text-right text-white/60">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const StatusIcon = getStatusIcon(invoice.status);
                    const isOverdue = invoice.status === 'sent' && isAfter(new Date(), invoice.dueDate);
                    
                    return (
                      <TableRow key={invoice.id} className="border-white/10">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(invoice.id)}
                            onChange={() => toggleSelection(invoice.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                            {invoice.projectName && (
                              <p className="text-sm text-white/60">{invoice.projectName}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white">{invoice.clientName}</p>
                            <p className="text-sm text-white/60">{invoice.clientCompany}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(invoice.status)} bg-opacity-20 border-0`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {format(invoice.issueDate, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className={isOverdue ? 'text-red-500' : 'text-white/80'}>
                            {format(invoice.dueDate, 'MMM d, yyyy')}
                            {isOverdue && (
                              <p className="text-xs">Overdue by {formatDistanceToNow(invoice.dueDate)}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          €{invoice.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => exportInvoice(invoice)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {invoice.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendInvoice(invoice)}
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Send
                              </Button>
                            )}
                            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendPaymentReminder(invoice)}
                                  disabled={sendingReminder}
                                >
                                  {sendingReminder ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                  ) : (
                                    <Mail className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Mark Paid
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <Receipt className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Invoice Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription className="text-white/60">
                Fill in the details to create a new invoice
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Client Information */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Client Name</Label>
                    <Input
                      value={newInvoice.clientName}
                      onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Client Email</Label>
                    <Input
                      type="email"
                      value={newInvoice.clientEmail}
                      onChange={(e) => setNewInvoice({ ...newInvoice, clientEmail: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Company</Label>
                    <Input
                      value={newInvoice.clientCompany}
                      onChange={(e) => setNewInvoice({ ...newInvoice, clientCompany: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Project Name (Optional)</Label>
                    <Input
                      value={newInvoice.projectName}
                      onChange={(e) => setNewInvoice({ ...newInvoice, projectName: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Invoice Items</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addInvoiceItem}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {newInvoice.items?.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => updateInvoiceItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="col-span-2 text-right text-white">
                        €{item.amount.toFixed(2)}
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeInvoiceItem(index)}
                          disabled={newInvoice.items?.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-white/80">
                  <span>Subtotal</span>
                  <span>€{(newInvoice.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>VAT (21%)</span>
                  <span>€{(newInvoice.tax || 0).toFixed(2)}</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span>€{(newInvoice.total || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Payment Terms (days)</Label>
                  <Select
                    value={newInvoice.paymentTerms?.toString()}
                    onValueChange={(value) => setNewInvoice({ ...newInvoice, paymentTerms: parseInt(value) })}
                  >
                    <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Net 7</SelectItem>
                      <SelectItem value="15">Net 15</SelectItem>
                      <SelectItem value="30">Net 30</SelectItem>
                      <SelectItem value="60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/80">Currency</Label>
                  <Select
                    value={newInvoice.currency}
                    onValueChange={(value) => setNewInvoice({ ...newInvoice, currency: value })}
                  >
                    <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-white/80">Notes (Optional)</Label>
                <Textarea
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  rows={3}
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="Additional notes or payment instructions..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={createInvoice}
                  className="bg-orange hover:bg-orange/90"
                  disabled={!newInvoice.clientName || !newInvoice.clientEmail || !newInvoice.items?.some(i => i.description && i.amount > 0)}
                >
                  Create Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Invoice Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-6 mt-4">
                {/* Invoice Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedInvoice.invoiceNumber}</h2>
                    <Badge
                      variant="outline"
                      className={`mt-2 ${getStatusColor(selectedInvoice.status)} bg-opacity-20 border-0`}
                    >
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60">Issue Date</p>
                    <p className="text-white">{format(selectedInvoice.issueDate, 'MMMM d, yyyy')}</p>
                    <p className="text-white/60 mt-2">Due Date</p>
                    <p className="text-white">{format(selectedInvoice.dueDate, 'MMMM d, yyyy')}</p>
                  </div>
                </div>

                {/* Client Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-2">Bill To</h3>
                    <p className="text-white font-medium">{selectedInvoice.clientName}</p>
                    <p className="text-white/80">{selectedInvoice.clientCompany}</p>
                    <p className="text-white/80">{selectedInvoice.clientEmail}</p>
                  </div>
                  {selectedInvoice.projectName && (
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-2">Project</h3>
                      <p className="text-white">{selectedInvoice.projectName}</p>
                    </div>
                  )}
                </div>

                {/* Invoice Items */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white/60">Description</TableHead>
                        <TableHead className="text-right text-white/60">Qty</TableHead>
                        <TableHead className="text-right text-white/60">Rate</TableHead>
                        <TableHead className="text-right text-white/60">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index} className="border-white/10">
                          <TableCell className="text-white">{item.description}</TableCell>
                          <TableCell className="text-right text-white">{item.quantity}</TableCell>
                          <TableCell className="text-right text-white">€{item.rate.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-white">€{item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-white/80">
                    <span>Subtotal</span>
                    <span>€{selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>VAT (21%)</span>
                    <span>€{selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total</span>
                    <span>€{selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-2">Notes</h3>
                    <p className="text-white/80 whitespace-pre-wrap">{selectedInvoice.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => exportInvoice(selectedInvoice)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  {selectedInvoice.status === 'draft' && (
                    <Button
                      onClick={() => {
                        sendInvoice(selectedInvoice);
                        setIsEditDialogOpen(false);
                      }}
                      className="bg-orange hover:bg-orange/90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Invoice
                    </Button>
                  )}
                  {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                    <Button
                      onClick={() => {
                        updateInvoiceStatus(selectedInvoice.id, 'paid');
                        setIsEditDialogOpen(false);
                      }}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}