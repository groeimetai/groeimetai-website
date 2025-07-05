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
  doc
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
  Loader2
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QuoteChat from '@/components/QuoteChat';
import ProjectTimelineManager from '@/components/ProjectTimelineManager';

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
  const [activeProjects, setActiveProjects] = useState(0);
  const [pendingQuotes, setPendingQuotes] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // Legacy states for quote management
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Fetch metrics
  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchMetrics = async () => {
      setIsLoadingMetrics(true);
      try {
        // Get time range
        const now = new Date();
        const startDate = new Date();
        if (timeRange === '7d') {
          startDate.setDate(now.getDate() - 7);
        } else if (timeRange === '30d') {
          startDate.setDate(now.getDate() - 30);
        } else if (timeRange === '90d') {
          startDate.setDate(now.getDate() - 90);
        }

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;
        const newUsers = usersSnapshot.docs.filter(doc => {
          const createdAt = doc.data().createdAt?.toDate();
          return createdAt && createdAt >= startDate;
        }).length;

        // Fetch projects
        const projectsQuery = query(
          collection(db, 'projects'),
          where('status', 'in', ['active', 'in_progress'])
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        setActiveProjects(projectsSnapshot.size);

        // Fetch quotes
        const quotesQuery = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
        const quotesSnapshot = await getDocs(quotesQuery);
        const quotesData: Quote[] = [];
        quotesSnapshot.forEach((doc) => {
          quotesData.push({ id: doc.id, ...doc.data() } as Quote);
        });
        setQuotes(quotesData);
        
        const pendingCount = quotesData.filter(q => q.status === 'pending').length;
        setPendingQuotes(pendingCount);

        // Calculate revenue (from approved quotes)
        let revenue = 0;
        quotesData.forEach(quote => {
          if (quote.status === 'approved' && quote.totalCost) {
            revenue += quote.totalCost;
          }
        });
        setTotalRevenue(revenue);

        // Set metrics
        setMetrics([
          {
            title: 'Total Users',
            value: totalUsers,
            change: newUsers > 0 ? (newUsers / totalUsers) * 100 : 0,
            trend: newUsers > 0 ? 'up' : 'neutral',
            icon: Users,
            color: 'text-blue-500'
          },
          {
            title: 'Active Projects',
            value: projectsSnapshot.size,
            change: 12, // Mock change
            trend: 'up',
            icon: Briefcase,
            color: 'text-green-500'
          },
          {
            title: 'Pending Quotes',
            value: pendingCount,
            change: -5, // Mock change
            trend: 'down',
            icon: FileText,
            color: 'text-yellow-500'
          },
          {
            title: 'Revenue',
            value: `€${revenue.toLocaleString()}`,
            change: 23, // Mock change
            trend: 'up',
            icon: DollarSign,
            color: 'text-purple-500'
          }
        ]);

        // Fetch recent activities
        const activities: RecentActivity[] = [];
        
        // Recent users
        const recentUsersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        recentUsersSnapshot.forEach(doc => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            type: 'user',
            title: 'New user registered',
            description: data.displayName || data.email,
            timestamp: data.createdAt?.toDate() || new Date()
          });
        });

        // Recent quotes
        quotesData.slice(0, 5).forEach(quote => {
          activities.push({
            id: quote.id,
            type: 'quote',
            title: 'New quote request',
            description: quote.projectName || 'Untitled Project',
            timestamp: quote.createdAt?.toDate() || new Date(),
            status: quote.status
          });
        });

        // Sort activities by timestamp
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivities(activities.slice(0, 10));

      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [user, isAdmin, timeRange]);

  // Real-time active users (mock for now)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(Math.floor(Math.random() * 20) + 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      const quote = quotes.find(q => q.id === quoteId);
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
        <Card className="bg-orange/10 border-orange/30 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Activity className="w-5 h-5 text-orange" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-white font-medium">System Status: Operational</span>
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
                  <span className="text-white">{pendingQuotes} pending quotes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
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
                        metric.trend === 'up' ? 'text-green-500 border-green-500/30' : 
                        metric.trend === 'down' ? 'text-red-500 border-red-500/30' : 
                        'text-white/60 border-white/20'
                      }`}
                    >
                      {metric.trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : 
                       metric.trend === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : null}
                      {Math.abs(metric.change)}%
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                  <p className="text-white/60 text-sm">{metric.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="chats">Support Chats</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Recent Activity
                    <Button variant="ghost" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'user' ? 'bg-blue-500/20' :
                          activity.type === 'project' ? 'bg-green-500/20' :
                          activity.type === 'quote' ? 'bg-yellow-500/20' :
                          'bg-purple-500/20'
                        }`}>
                          {activity.type === 'user' ? <Users className="w-4 h-4 text-blue-500" /> :
                           activity.type === 'project' ? <Briefcase className="w-4 h-4 text-green-500" /> :
                           activity.type === 'quote' ? <FileText className="w-4 h-4 text-yellow-500" /> :
                           <MessageSquare className="w-4 h-4 text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{activity.title}</p>
                          <p className="text-white/60 text-xs">{activity.description}</p>
                          <p className="text-white/40 text-xs mt-1">
                            {activity.timestamp.toLocaleString()}
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
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart Placeholder */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-white/40">
                  <BarChart3 className="w-12 h-12 mr-3" />
                  Performance charts will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            <div className="space-y-4">
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
                  Pending ({quotes.filter(q => q.status === 'pending').length})
                </Button>
                <Button
                  variant={statusFilter === 'reviewed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('reviewed')}
                  className={statusFilter === 'reviewed' ? 'bg-orange' : ''}
                >
                  Reviewed ({quotes.filter(q => q.status === 'reviewed').length})
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('approved')}
                  className={statusFilter === 'approved' ? 'bg-orange' : ''}
                >
                  Approved ({quotes.filter(q => q.status === 'approved').length})
                </Button>
                <Button
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('rejected')}
                  className={statusFilter === 'rejected' ? 'bg-orange' : ''}
                >
                  Rejected ({quotes.filter(q => q.status === 'rejected').length})
                </Button>
              </div>

              {/* Quotes List */}
              {filteredQuotes.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuotes.map((quote) => {
                    const StatusIcon = getStatusIcon(quote.status);
                    
                    return (
                      <Card key={quote.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-6">
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
                        </CardContent>
                      </Card>
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

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-white/40">
                  <Briefcase className="w-16 h-16 mx-auto mb-4" />
                  <p>Project management interface coming soon</p>
                  <Link href="/dashboard/admin/projects">
                    <Button className="mt-4 bg-orange hover:bg-orange/90">
                      Go to Project Management
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Chats Tab */}
          <TabsContent value="chats">
            <Card className="bg-white/5 border-white/10 h-[600px]">
              <ChatManagement />
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-white/40">
                  <Users className="w-16 h-16 mx-auto mb-4" />
                  <p>User management interface coming soon</p>
                  <Link href="/dashboard/admin/users">
                    <Button className="mt-4 bg-orange hover:bg-orange/90">
                      Go to User Management
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-white/40">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                  <p>Advanced analytics coming soon</p>
                  <Link href="/dashboard/admin/analytics">
                    <Button className="mt-4 bg-orange hover:bg-orange/90">
                      Go to Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
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