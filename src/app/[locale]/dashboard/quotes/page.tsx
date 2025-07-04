'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@/i18n/routing';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

export default function QuotesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to user's quotes
    const quotesQuery = query(
      collection(db, 'quotes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      quotesQuery, 
      (snapshot) => {
        const quotesData: Quote[] = [];
        snapshot.forEach((doc) => {
          quotesData.push({ id: doc.id, ...doc.data() } as Quote);
        });
        setQuotes(quotesData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching quotes:', error);
        // Also try to get quotes by email
        const emailQuery = query(
          collection(db, 'quotes'),
          where('email', '==', user.email),
          orderBy('createdAt', 'desc')
        );
        
        onSnapshot(emailQuery, (snapshot) => {
          const quotesData: Quote[] = [];
          snapshot.forEach((doc) => {
            quotesData.push({ id: doc.id, ...doc.data() } as Quote);
          });
          setQuotes(quotesData);
          setIsLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, [user]);

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

          <div>
            <h1 className="text-3xl font-bold text-white">Your Project Requests</h1>
            <p className="text-white/60 mt-2">Track the status of your project requests and communicate with our team</p>
          </div>
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
        {!isLoading && quotes.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {quotes.map((quote) => {
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
                          <p><span className="font-medium">Budget:</span> {quote.budget}</p>
                          <p><span className="font-medium">Timeline:</span> {quote.timeline}</p>
                          <p><span className="font-medium">Submitted:</span> {formatDistanceToNow(quote.createdAt.toDate())} ago</p>
                          {quote.updatedAt && (
                            <p><span className="font-medium">Last Updated:</span> {formatDistanceToNow(quote.updatedAt.toDate())} ago</p>
                          )}
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
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedQuote(quote);
                          setIsChatOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat with Team
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!isLoading && quotes.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FileText className="w-24 h-24 text-white/20 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-2">No Project Requests Yet</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Start your journey with GroeimetAI by requesting a new project. We'll help you
              transform your business with cutting-edge AI solutions.
            </p>
            <Link href="/contact?type=project">
              <Button size="lg" className="bg-orange hover:bg-orange/90">
                Request a Project
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat with GroeimetAI Team</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="h-full flex flex-col">
              <QuoteChat 
                quoteId={selectedQuote.id} 
                quoteName={selectedQuote.projectName}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}