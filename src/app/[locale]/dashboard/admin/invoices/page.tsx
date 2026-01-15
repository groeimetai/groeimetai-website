'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db, collections } from '@/lib/firebase/config';
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
  Receipt,
  Link,
  X,
  BarChart3,
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
import { Switch } from '@/components/ui/switch';
import { format, formatDistanceToNow, addDays, isAfter } from 'date-fns';
import { BulkActions, useBulkSelection } from '@/components/admin/BulkActions';
import type { BulkActionType } from '@/components/admin/BulkActions';
import { notificationService } from '@/services/notificationService';
// Invoice and payment operations are handled through API routes
import { Invoice, InvoiceItem, InvoiceStatus, User } from '@/types';
import { updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { auth } from '@/lib/firebase/config';

// Extend Invoice type to include client info
interface InvoiceWithClient extends Invoice {
  clientName?: string;
  clientEmail?: string;
}

interface InvoiceFormData {
  clientId: string;
  projectId?: string;
  dueDate: Date;
  items: InvoiceItem[];
  notes?: string;
  discount?: number;
  taxRate: number;
  // Manual entry mode (for one-off invoices without a registered client)
  isManualEntry: boolean;
  clientEmail?: string; // Email for sending invoice (manual entry)
  // Billing details (Dutch compliance)
  companyName?: string;
  contactName?: string;
  kvkNumber?: string;
  btwNumber?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

export default function AdminInvoicesPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithClient | null>(null);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [creatingPaymentLink, setCreatingPaymentLink] = useState(false);

  // New invoice form state
  const [formData, setFormData] = useState<InvoiceFormData>({
    clientId: '',
    projectId: '',
    dueDate: addDays(new Date(), 30),
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, tax: 0, total: 0 }],
    notes: '',
    discount: 0,
    taxRate: 21, // Default 21% VAT
    // Manual entry mode
    isManualEntry: true, // Default to manual entry for flexibility
    clientEmail: '',
    // Billing details
    companyName: '',
    contactName: '',
    kvkNumber: '',
    btwNumber: '',
    street: '',
    postalCode: '',
    city: '',
    country: 'Nederland',
  });

  const { selectedIds, setSelectedIds, toggleSelection, clearSelection } =
    useBulkSelection(invoices);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Fetch invoices
  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch invoices
        const invoicesQuery = query(
          collection(db, collections.invoices || 'invoices'),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(invoicesQuery, async (snapshot) => {
          const invoicesList = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const invoiceData = doc.data();

              // Get client data - try users collection first
              let clientData = null;
              if (invoiceData.clientId && invoiceData.clientId !== 'manual') {
                const clientDoc = await getDocs(
                  query(collection(db, collections.users), where('uid', '==', invoiceData.clientId))
                );
                clientData = clientDoc.docs[0]?.data();
              }

              // Determine client name and email from multiple sources
              // Priority: billingDetails > clientName/clientEmail stored on invoice > users collection > Unknown
              const clientName =
                invoiceData.billingDetails?.companyName ||
                invoiceData.billingDetails?.contactName ||
                invoiceData.clientName ||
                clientData?.displayName ||
                clientData?.email ||
                'Unknown';

              const clientEmail =
                invoiceData.billingDetails?.email ||
                invoiceData.clientEmail ||
                clientData?.email ||
                '';

              return {
                id: doc.id,
                ...invoiceData,
                clientName,
                clientEmail,
                issueDate: invoiceData.issueDate?.toDate() || new Date(),
                dueDate: invoiceData.dueDate?.toDate() || new Date(),
                createdAt: invoiceData.createdAt?.toDate() || new Date(),
                updatedAt: invoiceData.updatedAt?.toDate() || new Date(),
                paidDate: invoiceData.paidDate?.toDate(),
              } as InvoiceWithClient;
            })
          );
          setInvoices(invoicesList);
          setIsLoading(false);
        });

        // Fetch clients
        const clientsQuery = query(
          collection(db, collections.users),
          where('role', '==', 'client')
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsList = clientsSnapshot.docs.map(
          (doc) =>
            ({
              uid: doc.id,
              ...doc.data(),
            }) as User
        );
        setClients(clientsList);

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load invoices');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter((invoice) => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        if (
          !invoice.invoiceNumber.toLowerCase().includes(search) &&
          !invoice.clientName?.toLowerCase().includes(search) &&
          !invoice.clientEmail?.toLowerCase().includes(search)
        ) {
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
        const daysDiff = Math.floor(
          (now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dateFilter === '7days' && daysDiff > 7) return false;
        if (dateFilter === '30days' && daysDiff > 30) return false;
        if (dateFilter === '90days' && daysDiff > 90) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'invoiceNumber':
          compareValue = a.invoiceNumber.localeCompare(b.invoiceNumber);
          break;
        case 'clientName':
          compareValue = (a.clientName || '').localeCompare(b.clientName || '');
          break;
        case 'total':
          compareValue = a.financial.total - b.financial.total;
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
    draft: invoices.filter((i) => i.status === 'draft').length,
    sent: invoices.filter((i) => i.status === 'sent').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
    totalRevenue: invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.financial.total, 0),
    outstandingRevenue: invoices
      .filter((i) => ['sent', 'viewed', 'overdue'].includes(i.status))
      .reduce((sum, i) => sum + i.financial.balance, 0),
  };

  // Calculate invoice totals
  const calculateInvoiceTotals = useCallback(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discount = formData.discount || 0;
    const taxableAmount = subtotal - discount;
    const tax = (taxableAmount * formData.taxRate) / 100;
    const total = taxableAmount + tax;

    return { subtotal, discount, tax, total };
  }, [formData.items, formData.discount, formData.taxRate]);

  // Update invoice item
  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalculate item total
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice;
      updatedItems[index].total = quantity * unitPrice;
      updatedItems[index].tax = (updatedItems[index].total * formData.taxRate) / 100;
    }

    setFormData({ ...formData, items: updatedItems });
  };

  // Add invoice item
  const addInvoiceItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Date.now().toString(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          tax: 0,
          total: 0,
        },
      ],
    });
  };

  // Remove invoice item
  const removeInvoiceItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  // Create invoice
  const createInvoice = async () => {
    try {
      if (!user) return;

      const totals = calculateInvoiceTotals();

      // Validate based on mode
      if (formData.isManualEntry) {
        // Manual entry: require at least company name or contact name
        if (!formData.companyName && !formData.contactName) {
          toast.error('Vul minimaal een bedrijfsnaam of contactpersoon in');
          return;
        }
      } else {
        // Client selection mode: require client
        const selectedClient = clients.find((c) => c.uid === formData.clientId);
        if (!selectedClient) {
          toast.error('Selecteer een klant');
          return;
        }
      }

      // Validate items
      const validItems = formData.items.filter((item) => item.description && item.total > 0);
      if (validItems.length === 0) {
        toast.error('Voeg minimaal één regel toe');
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const token = await currentUser.getIdToken();
      if (!token) throw new Error('No authentication token');

      // Get client info for non-manual entry
      const selectedClient = !formData.isManualEntry
        ? clients.find((c) => c.uid === formData.clientId)
        : null;

      const response = await fetch('/api/invoices/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: formData.isManualEntry ? 'manual' : formData.clientId,
          // Legacy billing address for backwards compatibility
          billingAddress: {
            street: formData.street || '',
            city: formData.city || '',
            state: '',
            country: formData.country || 'Nederland',
            postalCode: formData.postalCode || '',
          },
          // Extended billing details with Dutch compliance fields
          billingDetails: {
            companyName: formData.companyName || '',
            contactName: formData.contactName || selectedClient?.displayName || '',
            kvkNumber: formData.kvkNumber || '',
            btwNumber: formData.btwNumber || '',
            street: formData.street || '',
            postalCode: formData.postalCode || '',
            city: formData.city || '',
            country: formData.country || 'Nederland',
            email: formData.clientEmail || selectedClient?.email || '',
          },
          projectId: formData.projectId,
          type: 'standard',
          items: validItems,
          dueDate: formData.dueDate,
          issueDate: new Date(),
          sendEmail: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invoice');
      }

      const { data: invoice } = await response.json();
      toast.success(`Factuur ${invoice.invoiceNumber} aangemaakt`);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Kon factuur niet aanmaken');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      clientId: '',
      projectId: '',
      dueDate: addDays(new Date(), 30),
      items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, tax: 0, total: 0 }],
      notes: '',
      discount: 0,
      taxRate: 21,
      // Manual entry mode
      isManualEntry: true,
      clientEmail: '',
      // Reset billing details
      companyName: '',
      contactName: '',
      kvkNumber: '',
      btwNumber: '',
      street: '',
      postalCode: '',
      city: '',
      country: 'Nederland',
    });
  };

  // Send invoice
  const sendInvoice = async (invoice: InvoiceWithClient) => {
    setSendingInvoice(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const token = await currentUser.getIdToken();
      if (!token) throw new Error('No authentication token');

      // Try multiple sources for email: clientEmail, billingDetails, or find client
      let recipientEmail = invoice.clientEmail;
      let recipientName = invoice.clientName;

      // Try billingDetails if no clientEmail
      if (!recipientEmail && (invoice as any).billingDetails?.email) {
        recipientEmail = (invoice as any).billingDetails.email;
        recipientName = recipientName || (invoice as any).billingDetails.contactName || (invoice as any).billingDetails.companyName;
      }

      // Try to find client email from clients list
      if (!recipientEmail && invoice.clientId) {
        const client = clients.find(c => c.uid === invoice.clientId);
        if (client?.email) {
          recipientEmail = client.email;
          recipientName = recipientName || client.displayName || `${client.firstName} ${client.lastName}`.trim();
        }
      }

      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send invoice');
      }

      toast.success(`Invoice ${invoice.invoiceNumber} sent successfully`);
      // Note: Invoices will auto-refresh via Firestore listener
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast.error(error.message || 'Failed to send invoice');
    } finally {
      setSendingInvoice(false);
    }
  };

  // Send payment reminder
  const sendPaymentReminder = async (invoice: InvoiceWithClient) => {
    setSendingReminder(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const token = await currentUser.getIdToken();
      if (!token) throw new Error('No authentication token');

      // Try multiple sources for email
      let recipientEmail = invoice.clientEmail;
      let recipientName = invoice.clientName;

      if (!recipientEmail && (invoice as any).billingDetails?.email) {
        recipientEmail = (invoice as any).billingDetails.email;
        recipientName = recipientName || (invoice as any).billingDetails.contactName;
      }

      if (!recipientEmail && invoice.clientId) {
        const client = clients.find(c => c.uid === invoice.clientId);
        if (client?.email) {
          recipientEmail = client.email;
          recipientName = recipientName || client.displayName || `${client.firstName} ${client.lastName}`.trim();
        }
      }

      const reminderType = invoice.status === 'overdue' ? 'overdue' : 'due_soon';
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          reminderType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send reminder');
      }

      toast.success('Payment reminder sent successfully');
      // Note: Invoices will auto-refresh via Firestore listener
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      toast.error(error.message || 'Failed to send payment reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  // Create payment link
  const createPaymentLink = async (invoice: InvoiceWithClient) => {
    setCreatingPaymentLink(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const token = await currentUser.getIdToken();
      if (!token) throw new Error('No authentication token');

      const baseUrl = window.location.origin;
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          redirectUrl: `${baseUrl}/payment/success?invoiceId=${invoice.id}`,
          cancelUrl: `${baseUrl}/payment/cancelled?invoiceId=${invoice.id}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment link');
      }

      const { data } = await response.json();
      if (data.checkoutUrl) {
        // Copy payment link to clipboard
        await navigator.clipboard.writeText(data.checkoutUrl);
        toast.success('Payment link copied to clipboard');
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create payment link');
    } finally {
      setCreatingPaymentLink(false);
    }
  };

  // Download invoice PDF
  const downloadInvoicePDF = async (invoice: InvoiceWithClient) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const token = await currentUser.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Invoice PDF downloaded');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  // Mark invoice as paid manually
  const markAsPaid = async (invoice: InvoiceWithClient) => {
    if (!confirm(`Weet je zeker dat je factuur ${invoice.invoiceNumber} als betaald wilt markeren?`)) return;

    try {
      await updateDoc(doc(db, collections.invoices || 'invoices', invoice.id), {
        status: 'paid',
        paidDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
        'financial.paid': invoice.financial.total,
        'financial.balance': 0,
      });
      toast.success(`Factuur ${invoice.invoiceNumber} gemarkeerd als betaald`);
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Kon factuur niet als betaald markeren');
    }
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await deleteDoc(doc(db, collections.invoices || 'invoices', invoiceId));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: BulkActionType, data?: any) => {
    try {
      switch (action) {
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${data.ids.length} invoices?`)) return;

          for (const invoiceId of data.ids) {
            await deleteDoc(doc(db, collections.invoices || 'invoices', invoiceId));
          }
          toast.success(`${data.ids.length} invoices deleted`);
          break;

        case 'updateStatus':
          for (const invoiceId of data.ids) {
            await updateDoc(doc(db, collections.invoices || 'invoices', invoiceId), {
              status: data.status,
              updatedAt: Timestamp.now(),
            });
          }
          toast.success(`${data.ids.length} invoices updated`);
          break;

        case 'export':
          const selectedInvoices = invoices.filter((i) => data.ids.includes(i.id));
          const csv = [
            ['Invoice Number', 'Client', 'Status', 'Issue Date', 'Due Date', 'Total', 'Balance'],
            ...selectedInvoices.map((i) => [
              i.invoiceNumber,
              i.clientName || '',
              i.status,
              format(i.issueDate, 'yyyy-MM-dd'),
              format(i.dueDate, 'yyyy-MM-dd'),
              `${i.financial.currency} ${i.financial.total.toFixed(2)}`,
              `${i.financial.currency} ${i.financial.balance.toFixed(2)}`,
            ]),
          ]
            .map((row) => row.join(','))
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
      toast.error('Failed to execute bulk action');
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'sent':
        return 'bg-blue-500';
      case 'viewed':
        return 'bg-indigo-500';
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

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return Edit;
      case 'sent':
        return Send;
      case 'viewed':
        return Eye;
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080D14' }}>
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Invoices Management</h1>
            <p className="text-white/60">Create and manage invoices for all clients</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/admin/invoices/reports')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Rapportages
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-orange hover:bg-orange/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                €{stats.totalRevenue.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Outstanding</span>
                <Clock className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                €{stats.outstandingRevenue.toLocaleString()}
              </p>
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
                  placeholder="Search invoices, clients..."
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
                  <SelectItem value="viewed">Viewed</SelectItem>
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
                        checked={
                          selectedIds.size === filteredInvoices.length &&
                          filteredInvoices.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(filteredInvoices.map((i) => i.id)));
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
                    const isOverdue =
                      ['sent', 'viewed'].includes(invoice.status) &&
                      isAfter(new Date(), invoice.dueDate);

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
                            {invoice.projectId && (
                              <p className="text-sm text-white/60">
                                Project ID: {invoice.projectId}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white">{invoice.clientName}</p>
                            <p className="text-sm text-white/60">{invoice.clientEmail}</p>
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
                              <p className="text-xs">
                                Overdue by {formatDistanceToNow(invoice.dueDate)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          €{invoice.financial.total.toLocaleString()}
                          {invoice.financial.balance > 0 && (
                            <p className="text-sm text-white/60">
                              Balance: €{invoice.financial.balance.toLocaleString()}
                            </p>
                          )}
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
                              onClick={() => downloadInvoicePDF(invoice)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {invoice.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendInvoice(invoice)}
                                disabled={sendingInvoice}
                              >
                                {sendingInvoice ? (
                                  <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-1" />
                                    Send
                                  </>
                                )}
                              </Button>
                            )}
                            {['sent', 'viewed', 'overdue'].includes(invoice.status) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsPaid(invoice)}
                                  title="Mark as paid"
                                  className="text-green-500 hover:text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => createPaymentLink(invoice)}
                                  disabled={creatingPaymentLink}
                                  title="Create payment link"
                                >
                                  {creatingPaymentLink ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                  ) : (
                                    <Link className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => sendPaymentReminder(invoice)}
                                  disabled={sendingReminder}
                                  title="Send reminder"
                                >
                                  {sendingReminder ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                  ) : (
                                    <Mail className="w-4 h-4" />
                                  )}
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteInvoice(invoice.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
              <DialogTitle>Nieuwe Factuur Aanmaken</DialogTitle>
              <DialogDescription className="text-white/60">
                Vul de gegevens in om een nieuwe factuur aan te maken
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Manual Entry Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <Label className="text-white font-medium">Handmatige invoer</Label>
                  <p className="text-sm text-white/60">
                    {formData.isManualEntry
                      ? 'Voer klantgegevens handmatig in (voor eenmalige opdrachten)'
                      : 'Selecteer een bestaande klant uit het systeem'}
                  </p>
                </div>
                <Switch
                  checked={formData.isManualEntry}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isManualEntry: checked, clientId: '' })
                  }
                />
              </div>

              {/* Client Selection (only when not manual entry) */}
              {!formData.isManualEntry && (
                <div>
                  <Label className="text-white/80">Klant</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecteer een klant" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.uid} value={client.uid}>
                          {client.displayName || client.email}{' '}
                          {client.company && `(${client.company})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Billing Details (Dutch Compliance) */}
              <div className="border border-white/10 rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-medium text-orange">Factuurgegevens klant</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Bedrijfsnaam</Label>
                    <Input
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      placeholder="bijv. Acme B.V."
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Contactpersoon</Label>
                    <Input
                      value={formData.contactName || ''}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      placeholder="bijv. Jan Jansen"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">KvK-nummer (optioneel)</Label>
                    <Input
                      value={formData.kvkNumber || ''}
                      onChange={(e) => setFormData({ ...formData, kvkNumber: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      placeholder="bijv. 12345678"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">BTW-nummer (optioneel)</Label>
                    <Input
                      value={formData.btwNumber || ''}
                      onChange={(e) => setFormData({ ...formData, btwNumber: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      placeholder="bijv. NL123456789B01"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-white/80">Straat en huisnummer</Label>
                    <Input
                      value={formData.street || ''}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      placeholder="bijv. Herengracht 100"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Postcode</Label>
                    <Input
                      value={formData.postalCode || ''}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      placeholder="bijv. 1015 BS"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Plaats</Label>
                    <Input
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      placeholder="bijv. Amsterdam"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Land</Label>
                    <Input
                      value={formData.country || ''}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      placeholder="Nederland"
                    />
                  </div>
                </div>
                {/* Email field for sending invoice (especially important for manual entry) */}
                {formData.isManualEntry && (
                  <div>
                    <Label className="text-white/80">
                      E-mailadres <span className="text-orange">*</span>
                    </Label>
                    <Input
                      type="email"
                      value={formData.clientEmail || ''}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      placeholder="klant@bedrijf.nl"
                    />
                    <p className="text-xs text-white/40 mt-1">
                      Naar dit adres wordt de factuur verstuurd
                    </p>
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Vervaldatum</Label>
                  <Input
                    type="date"
                    value={format(formData.dueDate, 'yyyy-MM-dd')}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: new Date(e.target.value) })
                    }
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white/80">BTW-tarief (%)</Label>
                  <Input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Factuurregels</h3>
                  <Button type="button" size="sm" variant="outline" onClick={addInvoiceItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Regel Toevoegen
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          placeholder="Omschrijving"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Aantal"
                          value={item.quantity}
                          onChange={(e) =>
                            updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)
                          }
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Tarief"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="col-span-2 text-right text-white">
                        €{(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeInvoiceItem(index)}
                          disabled={formData.items.length === 1}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div>
                <Label className="text-white/80">Korting</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <Separator className="bg-white/10" />
                {(() => {
                  const totals = calculateInvoiceTotals();
                  return (
                    <>
                      <div className="flex justify-between text-white/80">
                        <span>Subtotaal</span>
                        <span>€{totals.subtotal.toFixed(2)}</span>
                      </div>
                      {(formData.discount ?? 0) > 0 && (
                        <div className="flex justify-between text-white/80">
                          <span>Korting</span>
                          <span>-€{(formData.discount ?? 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-white/80">
                        <span>BTW ({formData.taxRate}%)</span>
                        <span>€{totals.tax.toFixed(2)}</span>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between text-xl font-bold text-white">
                        <span>Totaal</span>
                        <span>€{totals.total.toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Notes */}
              <div>
                <Label className="text-white/80">Opmerkingen (optioneel)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="Extra opmerkingen of betalingsinstructies..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Annuleren
                </Button>
                <Button
                  onClick={createInvoice}
                  className="bg-orange hover:bg-orange/90"
                  disabled={
                    // Validate based on mode
                    (formData.isManualEntry
                      ? // Manual entry: require email and at least company or contact name
                        !formData.clientEmail ||
                        (!formData.companyName && !formData.contactName)
                      : // Client selection: require client selected
                        !formData.clientId) ||
                    // Always require at least one item
                    !formData.items.some((i) => i.description && i.total > 0)
                  }
                >
                  Factuur Aanmaken
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
                    <h2 className="text-2xl font-bold text-white">
                      {selectedInvoice.invoiceNumber}
                    </h2>
                    <Badge
                      variant="outline"
                      className={`mt-2 ${getStatusColor(selectedInvoice.status)} bg-opacity-20 border-0`}
                    >
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60">Issue Date</p>
                    <p className="text-white">
                      {format(selectedInvoice.issueDate, 'MMMM d, yyyy')}
                    </p>
                    <p className="text-white/60 mt-2">Due Date</p>
                    <p className="text-white">{format(selectedInvoice.dueDate, 'MMMM d, yyyy')}</p>
                  </div>
                </div>

                {/* Client Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-2">Bill To</h3>
                    <p className="text-white font-medium">{selectedInvoice.clientName}</p>
                    <p className="text-white/80">{selectedInvoice.clientEmail}</p>
                    {selectedInvoice.billingAddress && (
                      <>
                        <p className="text-white/80">{selectedInvoice.billingAddress.street}</p>
                        <p className="text-white/80">
                          {selectedInvoice.billingAddress.city}{' '}
                          {selectedInvoice.billingAddress.postalCode}
                        </p>
                        <p className="text-white/80">{selectedInvoice.billingAddress.country}</p>
                      </>
                    )}
                  </div>
                  {selectedInvoice.projectId && (
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-2">Project</h3>
                      <p className="text-white">Project ID: {selectedInvoice.projectId}</p>
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
                        <TableHead className="text-right text-white/60">Tax</TableHead>
                        <TableHead className="text-right text-white/60">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item) => (
                        <TableRow key={item.id} className="border-white/10">
                          <TableCell className="text-white">{item.description}</TableCell>
                          <TableCell className="text-right text-white">{item.quantity}</TableCell>
                          <TableCell className="text-right text-white">
                            €{item.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-white">
                            €{item.tax.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-white">
                            €{item.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-white/80">
                    <span>Subtotal</span>
                    <span>€{selectedInvoice.financial.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.financial.discount > 0 && (
                    <div className="flex justify-between text-white/80">
                      <span>Discount</span>
                      <span>-€{selectedInvoice.financial.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/80">
                    <span>Tax</span>
                    <span>€{selectedInvoice.financial.tax.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total</span>
                    <span>€{selectedInvoice.financial.total.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.financial.paid > 0 && (
                    <>
                      <div className="flex justify-between text-white/80">
                        <span>Paid</span>
                        <span>€{selectedInvoice.financial.paid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white/80">
                        <span>Balance</span>
                        <span>€{selectedInvoice.financial.balance.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => downloadInvoicePDF(selectedInvoice)}>
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
                      disabled={sendingInvoice}
                    >
                      {sendingInvoice ? (
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Invoice
                    </Button>
                  )}
                  {['sent', 'viewed', 'overdue'].includes(selectedInvoice.status) && (
                    <Button
                      onClick={() => {
                        createPaymentLink(selectedInvoice);
                        setIsEditDialogOpen(false);
                      }}
                      className="bg-green-500 hover:bg-green-600"
                      disabled={creatingPaymentLink}
                    >
                      {creatingPaymentLink ? (
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      ) : (
                        <Link className="w-4 h-4 mr-2" />
                      )}
                      Create Payment Link
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
