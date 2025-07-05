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
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Download,
  Filter,
  Search,
  ChevronRight,
  Mail,
  ArrowRight,
  Briefcase,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { format, formatDistanceToNow } from 'date-fns';
import { BulkActions, useBulkSelection } from '@/components/admin/BulkActions';
import type { BulkActionType } from '@/components/admin/BulkActions';
import { notificationService } from '@/services/notificationService';
import QuoteChat from '@/components/QuoteChat';

interface Quote {
  id: string;
  userId?: string | null;
  accountType: string;
  fullName: string;
  email: string;
  phone?: string | null;
  company: string;
  jobTitle?: string | null;
  projectName: string;
  services: string[];
  projectDescription: string;
  budget: string;
  timeline: string;
  additionalRequirements?: string | null;
  attachmentCount: number;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'expired';
  createdAt: any;
  updatedAt: any;
  totalCost?: number;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: any;
  expiresAt?: any;
}

export default function AdminQuotesPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    clearSelection,
  } = useBulkSelection(quotes);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Fetch quotes
  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchQuotes = async () => {
      setIsLoading(true);
      try {
        const quotesQuery = query(
          collection(db, 'quotes'),
          orderBy('createdAt', 'desc')
        );
        const quotesSnapshot = await getDocs(quotesQuery);
        
        const quotesData: Quote[] = [];
        quotesSnapshot.forEach((doc) => {
          quotesData.push({ id: doc.id, ...doc.data() } as Quote);
        });
        
        setQuotes(quotesData);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, [user, isAdmin]);

  // Filter and sort quotes
  const filteredQuotes = quotes.filter(quote => {
    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      if (!quote.projectName.toLowerCase().includes(search) &&
          !quote.fullName.toLowerCase().includes(search) &&
          !quote.company.toLowerCase().includes(search) &&
          !quote.email.toLowerCase().includes(search)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all' && quote.status !== statusFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const quoteDate = quote.createdAt?.toDate() || new Date();
      const daysDiff = Math.floor((now.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === '7days' && daysDiff > 7) return false;
      if (dateFilter === '30days' && daysDiff > 30) return false;
      if (dateFilter === '90days' && daysDiff > 90) return false;
    }

    return true;
  }).sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'projectName':
        compareValue = a.projectName.localeCompare(b.projectName);
        break;
      case 'company':
        compareValue = a.company.localeCompare(b.company);
        break;
      case 'budget':
        compareValue = (a.totalCost || 0) - (b.totalCost || 0);
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
      default:
        compareValue = (a.createdAt?.toDate() || new Date()).getTime() - 
                      (b.createdAt?.toDate() || new Date()).getTime();
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // Update quote status
  const updateQuoteStatus = async (quoteId: string, newStatus: Quote['status']) => {
    try {
      const quote = quotes.find(q => q.id === quoteId);
      if (!quote) return;
      
      await updateDoc(doc(db, 'quotes', quoteId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        reviewedBy: user?.uid,
        reviewedAt: serverTimestamp(),
      });
      
      // Send email notification
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'quote-status-change',
            data: {
              recipientName: quote.fullName,
              recipientEmail: quote.email,
              projectName: quote.projectName,
              oldStatus: quote.status,
              newStatus: newStatus,
              quoteId: quoteId,
            },
          }),
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
      
      // Send in-app notification
      if (quote.userId) {
        await notificationService.sendToUser(
          quote.userId,
          notificationService.templates.quoteStatusUpdate(quote.projectName, newStatus)
        );
      }
      
      // Update local state
      setQuotes(quotes.map(q => 
        q.id === quoteId 
          ? { ...q, status: newStatus, reviewedBy: user?.uid, reviewedAt: Timestamp.now() } 
          : q
      ));
    } catch (error) {
      console.error('Error updating quote status:', error);
    }
  };

  // Convert quote to project
  const convertToProject = async (quote: Quote) => {
    try {
      // Create project from quote
      const projectData = {
        name: quote.projectName,
        description: quote.projectDescription,
        clientId: quote.userId || null,
        clientName: quote.fullName,
        clientEmail: quote.email,
        clientCompany: quote.company,
        status: 'active',
        type: 'consultation',
        services: quote.services,
        budget: {
          amount: quote.totalCost || 0,
          currency: 'EUR',
          type: 'fixed' as const,
        },
        timeline: quote.timeline,
        quoteId: quote.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.uid,
        progress: 0,
        milestones: [],
        assignedTo: [],
      };

      const projectRef = await addDoc(collection(db, 'projects'), projectData);

      // Update quote status
      await updateQuoteStatus(quote.id, 'approved');

      // Navigate to the new project
      router.push(`/dashboard/admin/projects/${projectRef.id}`);
    } catch (error) {
      console.error('Error converting quote to project:', error);
    }
  };

  // Send quote email
  const sendQuoteEmail = async () => {
    if (!selectedQuote) return;

    setSendingEmail(true);
    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'custom',
          data: {
            recipientName: selectedQuote.fullName,
            recipientEmail: selectedQuote.email,
            subject: emailSubject,
            message: emailMessage,
            quoteId: selectedQuote.id,
            projectName: selectedQuote.projectName,
          },
        }),
      });

      setIsEmailDialogOpen(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: BulkActionType, data?: any) => {
    try {
      switch (action) {
        case 'delete':
          for (const quoteId of data.ids) {
            await updateDoc(doc(db, 'quotes', quoteId), {
              status: 'rejected',
              updatedAt: serverTimestamp(),
            });
          }
          setQuotes(quotes.filter(q => !data.ids.includes(q.id)));
          break;

        case 'updateStatus':
          for (const quoteId of data.ids) {
            await updateQuoteStatus(quoteId, data.status);
          }
          break;

        case 'export':
          const selectedQuotes = quotes.filter(q => data.ids.includes(q.id));
          const csv = [
            ['ID', 'Project Name', 'Company', 'Contact', 'Email', 'Status', 'Budget', 'Timeline', 'Services', 'Created'],
            ...selectedQuotes.map(q => [
              q.id,
              q.projectName,
              q.company,
              q.fullName,
              q.email,
              q.status,
              q.budget,
              q.timeline,
              q.services.join('; '),
              format(q.createdAt?.toDate() || new Date(), 'yyyy-MM-dd'),
            ]),
          ]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `quotes-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          break;

        case 'archive':
          for (const quoteId of data.ids) {
            await updateDoc(doc(db, 'quotes', quoteId), {
              status: 'expired',
              archivedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          break;
      }

      clearSelection();
    } catch (error) {
      console.error('Error executing bulk action:', error);
    }
  };

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'reviewed':
        return 'bg-blue-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'expired':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'reviewed':
        return Eye;
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      case 'expired':
        return AlertCircle;
      default:
        return AlertCircle;
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

  // Stats
  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    approved: quotes.filter(q => q.status === 'approved').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
    totalValue: quotes.filter(q => q.status === 'approved')
      .reduce((sum, q) => sum + (q.totalCost || 0), 0),
    conversionRate: quotes.length > 0 
      ? Math.round((quotes.filter(q => q.status === 'approved').length / quotes.length) * 100)
      : 0,
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quotes Management</h1>
          <p className="text-white/60">Review and manage all quote requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Quotes</span>
                <FileText className="w-4 h-4 text-white/40" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Pending</span>
                <Clock className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Approved</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Rejected</span>
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.rejected}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Value</span>
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-white">€{stats.totalValue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Conversion</span>
                <ArrowRight className="w-4 h-4 text-orange" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
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
                  placeholder="Search projects, companies, or contacts..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="projectName">Project Name</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
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
          items={filteredQuotes}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onAction={handleBulkAction}
          actions={['updateStatus', 'export', 'archive', 'delete']}
          statusOptions={[
            { value: 'pending', label: 'Pending' },
            { value: 'reviewed', label: 'Reviewed' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'expired', label: 'Expired' },
          ]}
        />

        {/* Quotes Table */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin h-8 w-8 text-orange mx-auto mb-4" />
                <p className="text-white/60">Loading quotes...</p>
              </div>
            ) : filteredQuotes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="w-12 text-white/60">
                      <Checkbox
                        checked={selectedIds.size === filteredQuotes.length && filteredQuotes.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(filteredQuotes.map(q => q.id)));
                          } else {
                            clearSelection();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="text-white/60">Project</TableHead>
                    <TableHead className="text-white/60">Company</TableHead>
                    <TableHead className="text-white/60">Contact</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Budget</TableHead>
                    <TableHead className="text-white/60">Timeline</TableHead>
                    <TableHead className="text-white/60">Submitted</TableHead>
                    <TableHead className="text-right text-white/60">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => {
                    const StatusIcon = getStatusIcon(quote.status);
                    
                    return (
                      <TableRow key={quote.id} className="border-white/10">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(quote.id)}
                            onChange={() => toggleSelection(quote.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{quote.projectName}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {quote.services.slice(0, 2).map((service, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                              {quote.services.length > 2 && (
                                <span className="text-xs text-white/60">+{quote.services.length - 2}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">{quote.company}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white">{quote.fullName}</p>
                            <p className="text-sm text-white/60">{quote.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(quote.status)} bg-opacity-20 border-0`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {quote.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/80">{quote.budget}</TableCell>
                        <TableCell className="text-white/80">{quote.timeline}</TableCell>
                        <TableCell className="text-white/60 text-sm">
                          {formatDistanceToNow(quote.createdAt?.toDate() || new Date())} ago
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedQuote(quote);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedQuote(quote);
                                setIsChatOpen(true);
                              }}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            {quote.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuoteStatus(quote.id, 'reviewed')}
                                >
                                  Review
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => updateQuoteStatus(quote.id, 'approved')}
                                >
                                  Approve
                                </Button>
                              </>
                            )}
                            {quote.status === 'approved' && (
                              <Button
                                size="sm"
                                className="bg-orange hover:bg-orange/90"
                                onClick={() => convertToProject(quote)}
                              >
                                <Briefcase className="w-4 h-4 mr-1" />
                                Convert
                              </Button>
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
                <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No quotes found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Quote Details</DialogTitle>
            </DialogHeader>
            {selectedQuote && (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <p className="text-white"><strong>Name:</strong> {selectedQuote.fullName}</p>
                      <p className="text-white"><strong>Email:</strong> {selectedQuote.email}</p>
                      {selectedQuote.phone && (
                        <p className="text-white"><strong>Phone:</strong> {selectedQuote.phone}</p>
                      )}
                      <p className="text-white"><strong>Company:</strong> {selectedQuote.company}</p>
                      {selectedQuote.jobTitle && (
                        <p className="text-white"><strong>Title:</strong> {selectedQuote.jobTitle}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-2">Project Information</h3>
                    <div className="space-y-2">
                      <p className="text-white"><strong>Project:</strong> {selectedQuote.projectName}</p>
                      <p className="text-white"><strong>Budget:</strong> {selectedQuote.budget}</p>
                      <p className="text-white"><strong>Timeline:</strong> {selectedQuote.timeline}</p>
                      <p className="text-white"><strong>Status:</strong> 
                        <Badge
                          variant="outline"
                          className={`ml-2 ${getStatusColor(selectedQuote.status)} bg-opacity-20 border-0`}
                        >
                          {selectedQuote.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">Services Requested</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuote.services.map((service, idx) => (
                      <Badge key={idx} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">Project Description</h3>
                  <p className="text-white whitespace-pre-wrap">{selectedQuote.projectDescription}</p>
                </div>

                {selectedQuote.additionalRequirements && (
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-2">Additional Requirements</h3>
                    <p className="text-white whitespace-pre-wrap">{selectedQuote.additionalRequirements}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailSubject(`Re: ${selectedQuote.projectName} Quote Request`);
                      setEmailMessage('');
                      setIsEmailDialogOpen(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Email Client
                  </Button>
                  {selectedQuote.status !== 'approved' && selectedQuote.status !== 'rejected' && (
                    <>
                      <Button
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          updateQuoteStatus(selectedQuote.id, 'approved');
                          setIsDetailsDialogOpen(false);
                        }}
                      >
                        Approve Quote
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          updateQuoteStatus(selectedQuote.id, 'rejected');
                          setIsDetailsDialogOpen(false);
                        }}
                      >
                        Reject Quote
                      </Button>
                    </>
                  )}
                  {selectedQuote.status === 'approved' && (
                    <Button
                      className="bg-orange hover:bg-orange/90"
                      onClick={() => {
                        convertToProject(selectedQuote);
                        setIsDetailsDialogOpen(false);
                      }}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Convert to Project
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Email Dialog */}
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Send Email to Client</DialogTitle>
              <DialogDescription className="text-white/60">
                Compose an email to {selectedQuote?.fullName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-white/80">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white/80">Message</label>
                <Textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={10}
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="Type your message here..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={sendQuoteEmail}
                className="bg-orange hover:bg-orange/90"
                disabled={!emailSubject || !emailMessage || sendingEmail}
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat Dialog */}
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Quote Discussion</DialogTitle>
            </DialogHeader>
            {selectedQuote && (
              <div className="h-full flex flex-col">
                <QuoteChat 
                  quoteId={selectedQuote.id} 
                  quoteName={selectedQuote.projectName}
                  userName={selectedQuote.fullName}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}