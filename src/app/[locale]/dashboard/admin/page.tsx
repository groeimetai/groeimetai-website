'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@/i18n/routing';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QuoteChat from '@/components/QuoteChat';
import ProjectTimelineManager from '@/components/ProjectTimelineManager';

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
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Fetch all quotes
  const fetchQuotes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const quotesQuery = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(quotesQuery);
      
      const quotesData: Quote[] = [];
      snapshot.forEach((doc) => {
        quotesData.push({ id: doc.id, ...doc.data() } as Quote);
      });
      
      setQuotes(quotesData);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Failed to load project requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update quote status
  const updateQuoteStatus = async (quoteId: string, newStatus: Quote['status']) => {
    try {
      await updateDoc(doc(db, 'quotes', quoteId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      
      // Update local state
      setQuotes(quotes.map(quote => 
        quote.id === quoteId ? { ...quote, status: newStatus } : quote
      ));
    } catch (err) {
      console.error('Error updating quote status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    } else if (!authLoading && isAdmin) {
      fetchQuotes();
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto"></div>
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

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
      default:
        return AlertCircle;
    }
  };

  const filteredQuotes = statusFilter === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.status === statusFilter);

  // Stats
  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    reviewed: quotes.filter(q => q.status === 'reviewed').length,
    approved: quotes.filter(q => q.status === 'approved').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
  };

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

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/60 mt-2">Manage project requests and system overview</p>
            </div>
            <Link
              href="/dashboard/admin/support"
              className="bg-orange hover:bg-orange/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Support Chats
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-orange" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Reviewed</p>
                <p className="text-2xl font-bold text-blue-500">{stats.reviewed}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </motion.div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            className={statusFilter === 'all' ? 'bg-orange' : ''}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
            className={statusFilter === 'pending' ? 'bg-orange' : ''}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'reviewed' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('reviewed')}
            className={statusFilter === 'reviewed' ? 'bg-orange' : ''}
          >
            Reviewed
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('approved')}
            className={statusFilter === 'approved' ? 'bg-orange' : ''}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('rejected')}
            className={statusFilter === 'rejected' ? 'bg-orange' : ''}
          >
            Rejected
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange animate-spin" />
          </div>
        )}

        {/* Quotes List */}
        {!isLoading && filteredQuotes.length > 0 && (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => {
              const StatusIcon = getStatusIcon(quote.status);
              
              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{quote.projectName}</h3>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(quote.status)} bg-opacity-20 border-0`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {quote.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/60 mb-3">
                        <p><span className="font-medium">Name:</span> {quote.fullName}</p>
                        <p><span className="font-medium">Email:</span> {quote.email}</p>
                        <p><span className="font-medium">Company:</span> {quote.company}</p>
                        <p><span className="font-medium">Budget:</span> {quote.budget}</p>
                        <p><span className="font-medium">Timeline:</span> {quote.timeline}</p>
                        <p><span className="font-medium">Submitted:</span> {formatDistanceToNow(quote.createdAt.toDate())} ago</p>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-white/60 mb-1">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {quote.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-sm text-white/80 line-clamp-2">{quote.projectDescription}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedQuote(quote);
                          setIsChatOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedQuote(quote);
                          setIsTimelineOpen(true);
                        }}
                      >
                        <GitBranch className="w-4 h-4 mr-1" />
                        Timeline
                      </Button>
                      {quote.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuoteStatus(quote.id, 'reviewed')}
                          >
                            Mark Reviewed
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => updateQuoteStatus(quote.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateQuoteStatus(quote.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {quote.status === 'reviewed' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => updateQuoteStatus(quote.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateQuoteStatus(quote.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-24 h-24 text-white/20 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-2">No project requests</h3>
            <p className="text-white/60">
              {statusFilter === 'all' 
                ? 'No project requests have been submitted yet.'
                : `No ${statusFilter} project requests found.`}
            </p>
          </div>
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Project Request Chat</DialogTitle>
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

      {/* Timeline Dialog */}
      <Dialog open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
        <DialogContent className="bg-black/95 border-white/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Project Timeline</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <ProjectTimelineManager 
              quoteId={selectedQuote.id} 
              projectName={selectedQuote.projectName}
              onClose={() => setIsTimelineOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}