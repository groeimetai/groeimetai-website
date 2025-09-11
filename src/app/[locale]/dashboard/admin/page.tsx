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
  limit,
  Timestamp,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Settings,
  MessageSquare,
  Shield,
  BarChart3,
  Database,
  Bell,
  Eye,
  XCircle,
  GitBranch,
  ChevronLeft,
  Loader2,
  Mail,
  Video,
  Phone,
  Target,
  Rocket,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@/i18n/routing';
import ChatManagement from '@/components/admin/ChatManagement';
import { formatDistanceToNow, format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QuoteChat from '@/components/QuoteChat';
import ProjectTimelineManager from '@/components/admin/ProjectTimelineManager';
import { notificationService } from '@/services/notificationService';
import { BulkActions, SelectableListItem, useBulkSelection } from '@/components/admin/BulkActions';
import type { BulkActionType } from '@/components/admin/BulkActions';

interface Metric {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'project' | 'quote' | 'chat';
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  conversationType: string;
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'archived';
  submittedAt: any;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
}

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
  totalCost?: number;
}

interface Meeting {
  id: string;
  userId?: string | null;
  type: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  title: string;
  description?: string;
  startTime: any;
  endTime: any;
  location: {
    type: 'physical' | 'virtual';
    platform?: string;
    address?: string;
  };
  requestedBy: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
  };
  createdAt: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [activeProjects, setActiveProjects] = useState(0);
  const [pendingQuotes, setPendingQuotes] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Contact submissions and modern features
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [todaysMeetings, setTodaysMeetings] = useState<any[]>([]);
  
  // Legacy states for quote management
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState({
    status: 'operational',
    messagesProcessed: 0,
    avgResponseTime: 0,
    errorRate: 0
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Bulk selection state
  const { selectedIds, setSelectedIds, toggleSelection, clearSelection } = useBulkSelection(quotes);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Real-time metrics with calculated trends and live data
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribers: (() => void)[] = [];
    setIsLoadingMetrics(true);

    // Get time range for trend calculations
    const now = new Date();
    const startDate = new Date();
    const previousPeriodStart = new Date();
    
    if (timeRange === '7d') {
      startDate.setDate(now.getDate() - 7);
      previousPeriodStart.setDate(now.getDate() - 14);
    } else if (timeRange === '30d') {
      startDate.setDate(now.getDate() - 30);
      previousPeriodStart.setDate(now.getDate() - 60);
    } else if (timeRange === '90d') {
      startDate.setDate(now.getDate() - 90);
      previousPeriodStart.setDate(now.getDate() - 180);
    }

    // Real-time users listener
    const usersUnsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const allUsers = snapshot.docs.filter(doc => !doc.data().isDeleted);
        const currentPeriodUsers = allUsers.filter(doc => {
          const createdAt = doc.data().createdAt?.toDate();
          return createdAt && createdAt >= startDate;
        });
        const previousPeriodUsers = allUsers.filter(doc => {
          const createdAt = doc.data().createdAt?.toDate();
          return createdAt && createdAt >= previousPeriodStart && createdAt < startDate;
        });
        
        const currentCount = currentPeriodUsers.length;
        const previousCount = previousPeriodUsers.length;
        const userGrowthRate = previousCount > 0 
          ? ((currentCount - previousCount) / previousCount) * 100 
          : currentCount > 0 ? 100 : 0;

        setMetrics(prev => prev.map(m => 
          m.title === 'Total Users' 
            ? {
                ...m,
                value: allUsers.length,
                change: Math.round(userGrowthRate),
                trend: userGrowthRate > 0 ? 'up' : userGrowthRate < 0 ? 'down' : 'neutral'
              }
            : m
        ));
      },
      (error) => console.error('Error in users listener:', error)
    );
    unsubscribers.push(usersUnsubscribe);

    // Real-time quotes listener with revenue calculations
    const quotesUnsubscribe = onSnapshot(
      collection(db, 'quotes'),
      (snapshot) => {
        const quotesData: Quote[] = [];
        snapshot.forEach((doc) => {
          quotesData.push({ id: doc.id, ...doc.data() } as Quote);
        });
        setQuotes(quotesData);

        // Calculate revenue trends
        const currentPeriodRevenue = quotesData
          .filter(q => q.status === 'approved' && q.createdAt?.toDate() >= startDate)
          .reduce((sum, q) => sum + (q.totalCost || 0), 0);
        
        const previousPeriodRevenue = quotesData
          .filter(q => {
            const createdAt = q.createdAt?.toDate();
            return q.status === 'approved' && 
                   createdAt && 
                   createdAt >= previousPeriodStart && 
                   createdAt < startDate;
          })
          .reduce((sum, q) => sum + (q.totalCost || 0), 0);

        const totalRevenue = quotesData
          .filter(q => q.status === 'approved')
          .reduce((sum, q) => sum + (q.totalCost || 0), 0);
        
        const revenueGrowthRate = previousPeriodRevenue > 0 
          ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
          : currentPeriodRevenue > 0 ? 100 : 0;

        setTotalRevenue(totalRevenue);
        
        // Calculate quote conversion trends
        const currentPeriodTotal = quotesData.filter(q => q.createdAt?.toDate() >= startDate).length;
        const currentPeriodApproved = quotesData.filter(q => 
          q.status === 'approved' && q.createdAt?.toDate() >= startDate
        ).length;
        
        const previousPeriodTotal = quotesData.filter(q => {
          const createdAt = q.createdAt?.toDate();
          return createdAt && createdAt >= previousPeriodStart && createdAt < startDate;
        }).length;
        const previousPeriodApproved = quotesData.filter(q => {
          const createdAt = q.createdAt?.toDate();
          return q.status === 'approved' && 
                 createdAt && 
                 createdAt >= previousPeriodStart && 
                 createdAt < startDate;
        }).length;

        const currentConversionRate = currentPeriodTotal > 0 ? (currentPeriodApproved / currentPeriodTotal) * 100 : 0;
        const previousConversionRate = previousPeriodTotal > 0 ? (previousPeriodApproved / previousPeriodTotal) * 100 : 0;
        const conversionTrend = currentConversionRate - previousConversionRate;

        const pendingCount = quotesData.filter(q => q.status === 'pending').length;
        setPendingQuotes(pendingCount);

        // Update metrics with real data
        setMetrics(prev => prev.map(m => {
          if (m.title === 'Revenue') {
            return {
              ...m,
              value: `€${totalRevenue.toLocaleString()}`,
              change: Math.round(revenueGrowthRate),
              trend: revenueGrowthRate > 0 ? 'up' : revenueGrowthRate < 0 ? 'down' : 'neutral'
            };
          }
          if (m.title === 'Pending Quotes') {
            return {
              ...m,
              value: pendingCount,
              change: Math.round(conversionTrend),
              trend: conversionTrend > 0 ? 'up' : conversionTrend < 0 ? 'down' : 'neutral'
            };
          }
          return m;
        }));

        // Update recent activities
        const activities: RecentActivity[] = [];
        quotesData.slice(0, 5).forEach((quote) => {
          activities.push({
            id: quote.id,
            type: 'quote',
            title: 'New quote request',
            description: `${quote.projectName} - ${quote.company}`,
            timestamp: quote.createdAt?.toDate() || new Date(),
            status: quote.status,
          });
        });
        
        setRecentActivities(prev => {
          // Merge and sort all activities
          const allActivities = [...activities, ...prev.filter(a => a.type !== 'quote')];
          return allActivities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        });
      },
      (error) => console.error('Error in quotes listener:', error)
    );
    unsubscribers.push(quotesUnsubscribe);

    // Real-time projects listener
    const projectsUnsubscribe = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const projectsData: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          projectsData.push({
            id: doc.id,
            name: data.name || data.projectName || 'Untitled Project',
            clientName: data.clientName || 'Unknown Client',
            status: data.status || 'active',
            progress: data.progress || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            type: 'project'
          });
        });

        // Calculate project trends
        const currentPeriodProjects = projectsData.filter(p => p.createdAt >= startDate);
        const previousPeriodProjects = projectsData.filter(p => 
          p.createdAt >= previousPeriodStart && p.createdAt < startDate
        );
        
        const projectGrowthRate = previousPeriodProjects.length > 0 
          ? ((currentPeriodProjects.length - previousPeriodProjects.length) / previousPeriodProjects.length) * 100 
          : currentPeriodProjects.length > 0 ? 100 : 0;
        
        const activeProjectsCount = projectsData.filter(p => 
          p.status === 'active' || p.status === 'in_progress'
        ).length;
        
        setActiveProjects(activeProjectsCount);
        setProjects(projectsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        
        setMetrics(prev => prev.map(m => 
          m.title === 'Active Projects' 
            ? {
                ...m,
                value: activeProjectsCount,
                change: Math.round(projectGrowthRate),
                trend: projectGrowthRate > 0 ? 'up' : projectGrowthRate < 0 ? 'down' : 'neutral'
              }
            : m
        ));
      },
      (error) => console.error('Error in projects listener:', error)
    );
    unsubscribers.push(projectsUnsubscribe);

    // Real-time contact submissions listener
    const contactsUnsubscribe = onSnapshot(
      query(
        collection(db, 'contact_submissions'),
        orderBy('submittedAt', 'desc'),
        limit(50)
      ),
      (snapshot) => {
        const contacts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ContactSubmission));
        setContactSubmissions(contacts);
      },
      (error) => console.error('Error in contacts listener:', error)
    );
    unsubscribers.push(contactsUnsubscribe);

    // Real-time users activity listener for recent activities
    const recentUsersUnsubscribe = onSnapshot(
      query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(10)
      ),
      (snapshot) => {
        const activities: RecentActivity[] = [];
        let userActivitiesAdded = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.isDeleted && userActivitiesAdded < 5) {
            activities.push({
              id: doc.id,
              type: 'user',
              title: 'New user registered',
              description: `${data.displayName || data.email} joined GroeimetAI`,
              timestamp: data.createdAt?.toDate() || new Date(),
            });
            userActivitiesAdded++;
          }
        });
        
        setRecentActivities(prev => {
          const allActivities = [...activities, ...prev.filter(a => a.type !== 'user')];
          return allActivities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        });
      },
      (error) => console.error('Error in recent users listener:', error)
    );
    unsubscribers.push(recentUsersUnsubscribe);

    // Real-time messages listener for communication metrics
    const messagesUnsubscribe = onSnapshot(
      query(
        collection(db, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(100)
      ),
      (snapshot) => {
        const messages = snapshot.docs.map(doc => doc.data());
        const todayMessages = messages.filter(msg => {
          const timestamp = msg.timestamp?.toDate();
          return timestamp && timestamp >= startDate;
        });
        
        // Calculate communication metrics
        const totalMessages = todayMessages.length;
        const avgResponseTime = todayMessages.length > 0 
          ? todayMessages.reduce((acc, msg) => acc + (msg.responseTime || 300), 0) / todayMessages.length
          : 0;
        
        const errorMessages = todayMessages.filter(msg => msg.status === 'error').length;
        const errorRate = totalMessages > 0 ? (errorMessages / totalMessages) * 100 : 0;
        
        setSystemHealth({
          status: errorRate < 5 ? 'operational' : errorRate < 15 ? 'degraded' : 'critical',
          messagesProcessed: totalMessages,
          avgResponseTime: Math.round(avgResponseTime),
          errorRate: Math.round(errorRate * 10) / 10
        });

        // Add message activities
        const messageActivities: RecentActivity[] = todayMessages.slice(0, 3).map(msg => ({
          id: msg.id || Date.now().toString(),
          type: 'chat',
          title: 'Support message',
          description: `${msg.senderName || 'User'} sent a message`,
          timestamp: msg.timestamp?.toDate() || new Date(),
          status: msg.status
        }));
        
        setRecentActivities(prev => {
          const allActivities = [...messageActivities, ...prev.filter(a => a.type !== 'chat')];
          return allActivities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        });
      },
      (error) => {
        console.error('Error in messages listener:', error);
        setSystemHealth(prev => ({ ...prev, status: 'critical' }));
      }
    );
    unsubscribers.push(messagesUnsubscribe);

    // Initialize metrics with empty state
    setMetrics([
      {
        title: 'Total Users',
        value: 0,
        change: 0,
        trend: 'neutral',
        icon: Users,
        color: 'text-blue-500',
      },
      {
        title: 'Active Projects',
        value: 0,
        change: 0,
        trend: 'neutral',
        icon: Briefcase,
        color: 'text-green-500',
      },
      {
        title: 'Pending Quotes',
        value: 0,
        change: 0,
        trend: 'neutral',
        icon: FileText,
        color: 'text-yellow-500',
      },
      {
        title: 'Revenue',
        value: '€0',
        change: 0,
        trend: 'neutral',
        icon: DollarSign,
        color: 'text-purple-500',
      },
    ]);

    setIsLoadingMetrics(false);
    setIsLoading(false);

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [user, isAdmin, timeRange]);

  // Real-time active users tracking
  useEffect(() => {
    if (!user || !isAdmin) return;

    // Track this admin as online
    const markUserOnline = async () => {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          lastActive: serverTimestamp(),
          isOnline: true,
        });
      }
    };

    // Query for online users (active in last 5 minutes)
    const checkOnlineUsers = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const onlineQuery = query(
        collection(db, 'users'),
        where('lastActive', '>=', Timestamp.fromDate(fiveMinutesAgo))
      );

      const snapshot = await getDocs(onlineQuery);
      const onlineUserIds = snapshot.docs
        .filter((doc) => !doc.data().isDeleted) // Exclude deleted users
        .map((doc) => doc.id);
      setOnlineUsers(onlineUserIds);
      setActiveUsers(onlineUserIds.length);
    };

    // Mark user as online initially
    markUserOnline();
    checkOnlineUsers();

    // Update online status periodically
    const interval = setInterval(() => {
      markUserOnline();
      checkOnlineUsers();
    }, 30000); // Check every 30 seconds

    // Mark user as offline on unmount
    return () => {
      clearInterval(interval);
      if (user) {
        updateDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastActive: serverTimestamp(),
        }).catch(console.error);
      }
    };
  }, [user, isAdmin]);

  // Fetch all meetings
  const fetchMeetings = async () => {
    try {
      const meetingsQuery = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(meetingsQuery);

      const meetingsData: Meeting[] = [];
      snapshot.forEach((doc) => {
        meetingsData.push({ id: doc.id, ...doc.data() } as Meeting);
      });

      setMeetings(meetingsData);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  // Update quote status
  const updateQuoteStatus = async (quoteId: string, newStatus: Quote['status']) => {
    try {
      const quote = quotes.find((q) => q.id === quoteId);
      if (!quote) return;

      const oldStatus = quote.status;

      await updateDoc(doc(db, 'quotes', quoteId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Send email notification to client
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
              oldStatus: oldStatus,
              newStatus: newStatus,
              quoteId: quoteId,
            },
          }),
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the status update if email fails
      }

      // Send in-app notification if user has an account
      if (quote.userId) {
        try {
          await notificationService.sendToUser(
            quote.userId,
            notificationService.templates.quoteStatusUpdate(quote.projectName, newStatus)
          );
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      }

      // Update local state
      setQuotes(
        quotes.map((quote) => (quote.id === quoteId ? { ...quote, status: newStatus } : quote))
      );
    } catch (err) {
      console.error('Error updating quote status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: BulkActionType, data?: any) => {
    try {
      switch (action) {
        case 'delete':
          // Delete selected quotes
          for (const quoteId of data.ids) {
            await updateDoc(doc(db, 'quotes', quoteId), {
              status: 'rejected',
              updatedAt: new Date(),
            });
          }
          setQuotes(quotes.filter((q) => !data.ids.includes(q.id)));
          break;

        case 'updateStatus':
          // Update status for selected quotes
          for (const quoteId of data.ids) {
            await updateQuoteStatus(quoteId, data.status);
          }
          break;

        case 'export':
          // Export selected quotes
          const selectedQuotes = quotes.filter((q) => data.ids.includes(q.id));
          const csv = [
            [
              'ID',
              'Project Name',
              'Company',
              'Full Name',
              'Email',
              'Status',
              'Budget',
              'Timeline',
              'Created At',
            ],
            ...selectedQuotes.map((q) => [
              q.id,
              q.projectName,
              q.company,
              q.fullName,
              q.email,
              q.status,
              q.budget,
              q.timeline,
              q.createdAt.toDate().toISOString(),
            ]),
          ]
            .map((row) => row.join(','))
            .join('\n');

          // Download CSV
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `quotes-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          break;

        case 'archive':
          // Archive selected quotes
          for (const quoteId of data.ids) {
            await updateDoc(doc(db, 'quotes', quoteId), {
              status: 'archived',
              archivedAt: new Date(),
              updatedAt: new Date(),
            });
          }
          break;
      }

      clearSelection();
    } catch (error) {
      console.error('Error executing bulk action:', error);
      setError(`Failed to ${action} quotes. Please try again.`);
      throw error;
    }
  };

  useEffect(() => {
    if (!loading && isAdmin) {
      fetchMeetings();
    }
  }, [isAdmin, loading]);

  if (loading || !user || !isAdmin) {
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

  const filteredQuotes =
    statusFilter === 'all' ? quotes : quotes.filter((quote) => quote.status === statusFilter);

  // Stats
  const stats = {
    total: quotes.length,
    pending: quotes.filter((q) => q.status === 'pending').length,
    reviewed: quotes.filter((q) => q.status === 'reviewed').length,
    approved: quotes.filter((q) => q.status === 'approved').length,
    rejected: quotes.filter((q) => q.status === 'rejected').length,
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/60">Monitor and manage your GroeimetAI platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Live Status Bar */}
        <Card className={`${systemHealth.status === 'operational' ? 'bg-green-500/10 border-green-500/30' : systemHealth.status === 'degraded' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'} mb-6`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Activity className={`w-5 h-5 ${systemHealth.status === 'operational' ? 'text-green-500' : systemHealth.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'}`} />
                  <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse ${
                    systemHealth.status === 'operational' ? 'bg-green-500' : 
                    systemHealth.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <span className="text-white font-medium">System Status: {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/60" />
                  <span className="text-white">{activeUsers} users online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-white/60" />
                  <span className="text-white">{activeProjects} active projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-white/60" />
                  <span className="text-white">{systemHealth.messagesProcessed} messages today</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/60" />
                  <span className="text-white">{systemHealth.avgResponseTime}ms avg</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/30 mb-6">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <AlertDescription className="text-white">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoadingMetrics ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>
                    <div className="w-16 h-6 bg-white/20 rounded animate-pulse"></div>
                  </div>
                  <div className="w-20 h-8 bg-white/20 rounded animate-pulse mb-1"></div>
                  <div className="w-24 h-4 bg-white/20 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            metrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <metric.icon className={`w-8 h-8 ${metric.color}`} />
                      <Badge
                        variant="outline"
                        className={`${
                          metric.trend === 'up'
                            ? 'text-green-500 border-green-500/30'
                            : metric.trend === 'down'
                              ? 'text-red-500 border-red-500/30'
                              : 'text-white/60 border-white/20'
                        }`}
                      >
                        {metric.trend === 'up' ? (
                          <ArrowUp className="w-3 h-3 mr-1" />
                        ) : metric.trend === 'down' ? (
                          <ArrowDown className="w-3 h-3 mr-1" />
                        ) : null}
                        {Math.abs(metric.change)}%
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                    <p className="text-white/60 text-sm">{metric.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="timelines">Timelines</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="chats">Support Chats</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Recent Activity
                    <Link href="/dashboard/admin/activity">
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            activity.type === 'user'
                              ? 'bg-blue-500/20'
                              : activity.type === 'project'
                                ? 'bg-green-500/20'
                                : activity.type === 'quote'
                                  ? 'bg-yellow-500/20'
                                  : 'bg-purple-500/20'
                          }`}
                        >
                          {activity.type === 'user' ? (
                            <Users className="w-4 h-4 text-blue-500" />
                          ) : activity.type === 'project' ? (
                            <Briefcase className="w-4 h-4 text-green-500" />
                          ) : activity.type === 'quote' ? (
                            <FileText className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{activity.title}</p>
                          <p className="text-white/60 text-xs">{activity.description}</p>
                          <p className="text-white/40 text-xs mt-1">
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                        {activity.status && (
                          <Badge variant="outline" className="text-xs">
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/dashboard/admin/users">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Users
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/projects">
                      <Button variant="outline" className="w-full justify-start">
                        <Briefcase className="w-4 h-4 mr-2" />
                        View Projects
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/quotes">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Review Quotes
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/analytics">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/settings">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/database">
                      <Button variant="outline" className="w-full justify-start">
                        <Database className="w-4 h-4 mr-2" />
                        Database
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/workflows">
                      <Button variant="outline" className="w-full justify-start">
                        <GitBranch className="w-4 h-4 mr-2" />
                        Workflows
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/activity">
                      <Button variant="outline" className="w-full justify-start">
                        <Activity className="w-4 h-4 mr-2" />
                        Activity Logs
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Management Summary */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  User Management Overview
                  <Link href="/dashboard/admin/users">
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-white">{metrics.find(m => m.title === 'Total Users')?.value || 0}</p>
                    <p className="text-xs text-green-500 mt-1">
                      <ArrowUp className="w-3 h-3 inline mr-1" />
                      {metrics.find(m => m.title === 'Total Users')?.change || 0}% this period
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-white">{activeUsers}</p>
                    <Badge variant="outline" className="text-xs mt-1 border-green-500/30 text-green-500">
                      Online Now
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">User Roles</p>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">Clients</span>
                        <span className="text-white">{Math.round(((metrics.find(m => m.title === 'Total Users')?.value as number || 0) - 1) / (metrics.find(m => m.title === 'Total Users')?.value as number || 1) * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">Admins</span>
                        <span className="text-white">{Math.round(1 / (metrics.find(m => m.title === 'Total Users')?.value as number || 1) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Account Types</p>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">Business</span>
                        <span className="text-white">{quotes.length > 0 ? Math.round((quotes.filter(q => q.accountType === 'business').length / quotes.length) * 100) : 0}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">Personal</span>
                        <span className="text-white">{quotes.length > 0 ? Math.round((quotes.filter(q => q.accountType === 'personal').length / quotes.length) * 100) : 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Summary */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Analytics Summary
                  <Link href="/dashboard/admin/analytics">
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Revenue Summary */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Revenue (This Month)</p>
                      <p className="text-2xl font-bold text-white">€{totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-500 mt-1">
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        {metrics.find(m => m.title === 'Revenue')?.change > 0 ? '+' : ''}{metrics.find(m => m.title === 'Revenue')?.change || 0}% from last {timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : 'quarter'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-2">Revenue by Service</p>
                      <div className="space-y-2">
                        {(() => {
                          const serviceStats = quotes
                            .filter(q => q.status === 'approved' && q.services)
                            .reduce((acc, quote) => {
                              quote.services.forEach(service => {
                                const revenue = quote.totalCost || 0;
                                acc[service] = (acc[service] || 0) + revenue;
                              });
                              return acc;
                            }, {} as Record<string, number>);
                          
                          const totalServiceRevenue = Object.values(serviceStats).reduce((sum, val) => sum + val, 0);
                          const topServices = Object.entries(serviceStats)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3);
                          
                          return topServices.map(([service, revenue]) => {
                            const percentage = totalServiceRevenue > 0 ? (revenue / totalServiceRevenue) * 100 : 0;
                            return (
                              <div key={service}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-white/80">{service}</span>
                                  <span className="text-white">{Math.round(percentage)}%</span>
                                </div>
                                <Progress value={percentage} className="h-1" />
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Project Summary */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Project Completion Rate</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{projects.length > 0 ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100) : 0}%</p>
                        <p className="text-xs text-white/60 mb-1">({projects.filter(p => p.status === 'completed').length} completed)</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-2">Project Status</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/80">Active</span>
                          <span className="text-green-500">{activeProjects}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/80">Completed</span>
                          <span className="text-blue-500">{projects.filter(p => p.status === 'completed').length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/80">On Hold</span>
                          <span className="text-yellow-500">{projects.filter(p => p.status === 'on_hold').length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quote Summary */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Quote Conversion Rate</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{quotes.length > 0 ? ((quotes.filter(q => q.status === 'approved').length / quotes.length) * 100).toFixed(1) : 0}%</p>
                        <p className={`text-xs mt-1 ${(metrics.find(m => m.title === 'Pending Quotes')?.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(metrics.find(m => m.title === 'Pending Quotes')?.change || 0) >= 0 ? 
                            <ArrowUp className="w-3 h-3 inline mr-1" /> : 
                            <ArrowDown className="w-3 h-3 inline mr-1" />
                          }
                          {Math.abs(metrics.find(m => m.title === 'Pending Quotes')?.change || 0)}% from last {timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : 'quarter'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-2">Quote Pipeline</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/80">Pending Review</span>
                          <span className="text-yellow-500">{pendingQuotes}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/80">Approved</span>
                          <span className="text-green-500">{quotes.filter(q => q.status === 'approved').length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/80">Average Value</span>
                          <span className="text-white">€{quotes.filter(q => q.status === 'approved' && q.totalCost).length > 0 ? Math.round(quotes.filter(q => q.status === 'approved' && q.totalCost).reduce((sum, q) => sum + (q.totalCost || 0), 0) / quotes.filter(q => q.status === 'approved' && q.totalCost).length).toLocaleString() : '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            <div className="space-y-4">
              {/* Bulk Actions */}
              <BulkActions
                items={quotes}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onAction={handleBulkAction}
                actions={['updateStatus', 'export', 'archive', 'delete']}
                statusOptions={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'reviewed', label: 'Reviewed' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />

              {/* Filter */}
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  className={statusFilter === 'all' ? 'bg-orange' : ''}
                >
                  All ({quotes.length})
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                  className={statusFilter === 'pending' ? 'bg-orange' : ''}
                >
                  Pending ({quotes.filter((q) => q.status === 'pending').length})
                </Button>
                <Button
                  variant={statusFilter === 'reviewed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('reviewed')}
                  className={statusFilter === 'reviewed' ? 'bg-orange' : ''}
                >
                  Reviewed ({quotes.filter((q) => q.status === 'reviewed').length})
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('approved')}
                  className={statusFilter === 'approved' ? 'bg-orange' : ''}
                >
                  Approved ({quotes.filter((q) => q.status === 'approved').length})
                </Button>
                <Button
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('rejected')}
                  className={statusFilter === 'rejected' ? 'bg-orange' : ''}
                >
                  Rejected ({quotes.filter((q) => q.status === 'rejected').length})
                </Button>
              </div>

              {/* Quotes List */}
              {filteredQuotes.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuotes.map((quote) => {
                    const StatusIcon = getStatusIcon(quote.status);

                    return (
                      <SelectableListItem
                        key={quote.id}
                        id={quote.id}
                        isSelected={selectedIds.has(quote.id)}
                        onSelect={toggleSelection}
                        className="bg-white/5 border border-white/10 rounded-lg mb-4"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-white">
                                {quote.projectName}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(quote.status)} bg-opacity-20 border-0`}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {quote.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/60 mb-3">
                              <p>
                                <span className="font-medium">Name:</span> {quote.fullName}
                              </p>
                              <p>
                                <span className="font-medium">Email:</span> {quote.email}
                              </p>
                              <p>
                                <span className="font-medium">Company:</span> {quote.company}
                              </p>
                              <p>
                                <span className="font-medium">Budget:</span> {quote.budget}
                              </p>
                              <p>
                                <span className="font-medium">Timeline:</span> {quote.timeline}
                              </p>
                              <p>
                                <span className="font-medium">Submitted:</span>{' '}
                                {formatDistanceToNow(quote.createdAt.toDate())} ago
                              </p>
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

                            <p className="text-sm text-white/80 line-clamp-2">
                              {quote.projectDescription}
                            </p>
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
                      </SelectableListItem>
                    );
                  })}
                </div>
              ) : (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="py-12 text-center">
                    <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No quotes found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Timelines Tab */}
          <TabsContent value="timelines">
            <ProjectTimelineManager />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  All Projects
                  <Link href="/dashboard/admin/projects">
                    <Button size="sm" className="bg-orange hover:bg-orange/90">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-orange mr-3" />
                    <span className="text-white/60">Loading projects...</span>
                  </div>
                ) : projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.slice(0, 10).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{project.name}</h4>
                          <p className="text-sm text-white/60 mb-2">{project.clientName} • {project.status === 'active' ? 'Planning Phase' : project.status}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Progress value={project.progress} className="w-20 h-2" />
                              <span className="text-xs text-white/60">{project.progress}%</span>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">
                              {project.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400">
                              {project.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/admin/projects/${project.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {projects.length > 10 && (
                      <div className="text-center py-4">
                        <Link href="/dashboard/admin/projects">
                          <Button variant="outline">
                            View {projects.length - 10} more projects
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/40">
                    <Briefcase className="w-16 h-16 mx-auto mb-4" />
                    <p>No active projects found</p>
                    <Link href="/dashboard/admin/projects">
                      <Button className="mt-4 bg-orange hover:bg-orange/90">
                        Go to Project Management
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Chats Tab */}
          <TabsContent value="chats">
            <Card className="bg-white/5 border-white/10 h-[600px]">
              <ChatManagement />
            </Card>
          </TabsContent>
        </Tabs>
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
    </main>
  );
}
