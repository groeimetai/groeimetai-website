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
  Settings,
  MessageSquare,
  Bell,
  Eye,
  XCircle,
  Loader2,
  Mail,
  Kanban,
  Receipt,
  ChevronRight,
  AlertTriangle,
  FolderKanban,
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
import { Link } from '@/i18n/routing';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Metric {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

interface ActionItem {
  id: string;
  type: 'contact' | 'quote' | 'invoice' | 'project';
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  link: string;
  createdAt: Date;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'project' | 'quote' | 'contact';
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [systemHealth, setSystemHealth] = useState({
    status: 'operational',
    messagesProcessed: 0,
    avgResponseTime: 0,
    errorRate: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Upcoming meetings state
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Load data and calculate metrics
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribers: (() => void)[] = [];
    setIsLoadingMetrics(true);

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

    // Users listener
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
          m.title === 'Klanten'
            ? {
                ...m,
                value: allUsers.length,
                change: Math.round(userGrowthRate),
                trend: userGrowthRate > 0 ? 'up' : userGrowthRate < 0 ? 'down' : 'neutral'
              }
            : m
        ));

        // Recent user activities
        const activities: RecentActivity[] = [];
        allUsers.slice(0, 3).forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            type: 'user',
            title: 'Nieuwe klant',
            description: `${data.displayName || data.email} heeft zich aangemeld`,
            timestamp: data.createdAt?.toDate() || new Date(),
          });
        });
        setRecentActivities(prev => {
          const otherActivities = prev.filter(a => a.type !== 'user');
          return [...activities, ...otherActivities]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        });
      },
      (error) => console.error('Error in users listener:', error)
    );
    unsubscribers.push(usersUnsubscribe);

    // Quotes listener for revenue and action items
    const quotesUnsubscribe = onSnapshot(
      collection(db, 'quotes'),
      (snapshot) => {
        const quotesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate revenue
        const totalRev = quotesData
          .filter((q: any) => q.status === 'approved')
          .reduce((sum, q: any) => sum + (q.totalCost || 0), 0);
        setTotalRevenue(totalRev);

        const currentPeriodRevenue = quotesData
          .filter((q: any) => q.status === 'approved' && q.createdAt?.toDate() >= startDate)
          .reduce((sum, q: any) => sum + (q.totalCost || 0), 0);
        const previousPeriodRevenue = quotesData
          .filter((q: any) => {
            const createdAt = q.createdAt?.toDate();
            return q.status === 'approved' && createdAt && createdAt >= previousPeriodStart && createdAt < startDate;
          })
          .reduce((sum, q: any) => sum + (q.totalCost || 0), 0);

        const revenueGrowthRate = previousPeriodRevenue > 0
          ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
          : currentPeriodRevenue > 0 ? 100 : 0;

        // Pending quotes count
        const pendingQuotes = quotesData.filter((q: any) => q.status === 'pending').length;

        setMetrics(prev => prev.map(m => {
          if (m.title === 'Omzet') {
            return {
              ...m,
              value: `€${totalRev.toLocaleString()}`,
              change: Math.round(revenueGrowthRate),
              trend: revenueGrowthRate > 0 ? 'up' : revenueGrowthRate < 0 ? 'down' : 'neutral'
            };
          }
          if (m.title === 'Open Offertes') {
            return { ...m, value: pendingQuotes };
          }
          return m;
        }));

        // Action items for pending quotes
        const quoteActions: ActionItem[] = quotesData
          .filter((q: any) => q.status === 'pending')
          .slice(0, 5)
          .map((q: any) => ({
            id: q.id,
            type: 'quote' as const,
            title: `Offerte: ${q.projectName}`,
            description: `${q.company} - ${q.fullName}`,
            urgency: 'high' as const,
            link: '/dashboard/admin/pipeline',
            createdAt: q.createdAt?.toDate() || new Date(),
          }));

        setActionItems(prev => {
          const otherItems = prev.filter(a => a.type !== 'quote');
          return [...quoteActions, ...otherItems].slice(0, 10);
        });

        // Quote activities
        const activities: RecentActivity[] = quotesData.slice(0, 3).map((q: any) => ({
          id: q.id,
          type: 'quote' as const,
          title: 'Nieuwe offerte aanvraag',
          description: `${q.projectName} - ${q.company}`,
          timestamp: q.createdAt?.toDate() || new Date(),
          status: q.status,
        }));
        setRecentActivities(prev => {
          const otherActivities = prev.filter(a => a.type !== 'quote');
          return [...activities, ...otherActivities]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        });
      },
      (error) => console.error('Error in quotes listener:', error)
    );
    unsubscribers.push(quotesUnsubscribe);

    // Contact submissions listener for action items
    const contactsUnsubscribe = onSnapshot(
      query(
        collection(db, 'contact_submissions'),
        orderBy('submittedAt', 'desc'),
        limit(50)
      ),
      (snapshot) => {
        const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Action items for new contacts
        const contactActions: ActionItem[] = contacts
          .filter((c: any) => c.status === 'new')
          .slice(0, 5)
          .map((c: any) => ({
            id: c.id,
            type: 'contact' as const,
            title: `Nieuwe aanvraag: ${c.name}`,
            description: `${c.company} - ${c.conversationType || 'Contact'}`,
            urgency: 'high' as const,
            link: '/dashboard/admin/pipeline',
            createdAt: c.submittedAt?.toDate() || new Date(),
          }));

        setActionItems(prev => {
          const otherItems = prev.filter(a => a.type !== 'contact');
          return [...contactActions, ...otherItems].slice(0, 10);
        });

        // Contact activities
        const activities: RecentActivity[] = contacts.slice(0, 3).map((c: any) => ({
          id: c.id,
          type: 'contact' as const,
          title: 'Nieuwe contact aanvraag',
          description: `${c.name} - ${c.company}`,
          timestamp: c.submittedAt?.toDate() || new Date(),
          status: c.status,
        }));
        setRecentActivities(prev => {
          const otherActivities = prev.filter(a => a.type !== 'contact');
          return [...activities, ...otherActivities]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        });
      },
      (error) => console.error('Error in contacts listener:', error)
    );
    unsubscribers.push(contactsUnsubscribe);

    // Projects listener
    const projectsUnsubscribe = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const projectsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || data.projectName || 'Naamloos Project',
            clientName: data.clientName || 'Onbekende klant',
            status: data.status || 'active',
            progress: data.progress || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });

        const activeCount = projectsData.filter(p =>
          p.status === 'active' || p.status === 'in_progress'
        ).length;

        setActiveProjects(activeCount);

        // Calculate growth
        const currentPeriodProjects = projectsData.filter(p => p.createdAt >= startDate);
        const previousPeriodProjects = projectsData.filter(p =>
          p.createdAt >= previousPeriodStart && p.createdAt < startDate
        );
        const projectGrowthRate = previousPeriodProjects.length > 0
          ? ((currentPeriodProjects.length - previousPeriodProjects.length) / previousPeriodProjects.length) * 100
          : currentPeriodProjects.length > 0 ? 100 : 0;

        setMetrics(prev => prev.map(m =>
          m.title === 'Actieve Projecten'
            ? {
                ...m,
                value: activeCount,
                change: Math.round(projectGrowthRate),
                trend: projectGrowthRate > 0 ? 'up' : projectGrowthRate < 0 ? 'down' : 'neutral'
              }
            : m
        ));

        // Project activities
        const activities: RecentActivity[] = projectsData.slice(0, 3).map(p => ({
          id: p.id,
          type: 'project' as const,
          title: p.status === 'active' ? 'Project gestart' : 'Project update',
          description: `${p.name} - ${p.clientName}`,
          timestamp: p.createdAt,
          status: p.status,
        }));
        setRecentActivities(prev => {
          const otherActivities = prev.filter(a => a.type !== 'project');
          return [...activities, ...otherActivities]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        });
      },
      (error) => console.error('Error in projects listener:', error)
    );
    unsubscribers.push(projectsUnsubscribe);

    // Invoices listener for overdue action items
    const invoicesUnsubscribe = onSnapshot(
      query(collection(db, 'invoices'), where('status', '==', 'overdue')),
      (snapshot) => {
        const overdueInvoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const invoiceActions: ActionItem[] = overdueInvoices.slice(0, 3).map((inv: any) => ({
          id: inv.id,
          type: 'invoice' as const,
          title: `Factuur overdue: ${inv.invoiceNumber || inv.id.slice(0, 8)}`,
          description: `€${(inv.total || 0).toLocaleString()} - ${inv.clientName || 'Klant'}`,
          urgency: 'high' as const,
          link: '/dashboard/admin/invoices',
          createdAt: inv.dueDate?.toDate() || new Date(),
        }));

        setActionItems(prev => {
          const otherItems = prev.filter(a => a.type !== 'invoice');
          return [...invoiceActions, ...otherItems].slice(0, 10);
        });
      },
      (error) => console.error('Error in invoices listener:', error)
    );
    unsubscribers.push(invoicesUnsubscribe);

    // Meetings listener
    const meetingsUnsubscribe = onSnapshot(
      query(
        collection(db, 'meetings'),
        where('startTime', '>=', Timestamp.now()),
        orderBy('startTime', 'asc'),
        limit(5)
      ),
      (snapshot) => {
        const meetings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUpcomingMeetings(meetings);
      },
      (error) => console.error('Error in meetings listener:', error)
    );
    unsubscribers.push(meetingsUnsubscribe);

    // Initialize metrics
    setMetrics([
      {
        title: 'Klanten',
        value: 0,
        change: 0,
        trend: 'neutral',
        icon: Users,
        color: 'text-blue-500',
      },
      {
        title: 'Actieve Projecten',
        value: 0,
        change: 0,
        trend: 'neutral',
        icon: Briefcase,
        color: 'text-green-500',
      },
      {
        title: 'Open Offertes',
        value: 0,
        change: 0,
        trend: 'neutral',
        icon: FileText,
        color: 'text-yellow-500',
      },
      {
        title: 'Omzet',
        value: '€0',
        change: 0,
        trend: 'neutral',
        icon: DollarSign,
        color: 'text-purple-500',
      },
    ]);

    setIsLoadingMetrics(false);
    setSystemHealth({ status: 'operational', messagesProcessed: 0, avgResponseTime: 0, errorRate: 0 });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [user, isAdmin, timeRange]);

  // Active users tracking
  useEffect(() => {
    if (!user || !isAdmin) return;

    let isMounted = true;

    const checkOnlineUsers = async () => {
      if (!isMounted) return;
      try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const onlineQuery = query(
          collection(db, 'users'),
          where('lastActive', '>=', Timestamp.fromDate(fiveMinutesAgo))
        );
        const snapshot = await getDocs(onlineQuery);
        if (isMounted) {
          const count = snapshot.docs.filter(d => !d.data().isDeleted).length;
          setActiveUsers(count);
        }
      } catch (error) {
        console.error('Error checking online users:', error);
      }
    };

    checkOnlineUsers();
    const interval = setInterval(checkOnlineUsers, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, isAdmin]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080D14' }}>
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange mx-auto" />
          <p className="mt-4 text-white/60">Laden...</p>
        </div>
      </div>
    );
  }

  const getUrgencyColor = (urgency: ActionItem['urgency']) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'low': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    }
  };

  const getTypeIcon = (type: ActionItem['type']) => {
    switch (type) {
      case 'contact': return Mail;
      case 'quote': return FileText;
      case 'invoice': return Receipt;
      case 'project': return FolderKanban;
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/60">Overzicht van je GroeimetAI platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Selecteer periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Laatste 7 dagen</SelectItem>
                <SelectItem value="30d">Laatste 30 dagen</SelectItem>
                <SelectItem value="90d">Laatste 90 dagen</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/dashboard/admin/settings">
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Status Bar */}
        <Card className={`${systemHealth.status === 'operational' ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'} mb-6`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Activity className="w-5 h-5 text-green-500" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                </div>
                <span className="text-white font-medium">Systeem Status: Operationeel</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/60" />
                  <span className="text-white">{activeUsers} online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-white/60" />
                  <span className="text-white">{activeProjects} actieve projecten</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/30 mb-6">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <AlertDescription className="text-white">{error}</AlertDescription>
          </Alert>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoadingMetrics ? (
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actielijst - Takes up 2 columns */}
          <Card className="bg-white/5 border-white/10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange" />
                  Actielijst
                </span>
                {actionItems.length > 0 && (
                  <Badge className="bg-orange text-white">{actionItems.length} items</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {actionItems.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-white/60">Alles is bijgewerkt! Geen openstaande items.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actionItems.map((item) => {
                    const Icon = getTypeIcon(item.type);
                    return (
                      <Link href={item.link} key={item.id}>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className={`flex items-center gap-4 p-4 rounded-lg border ${getUrgencyColor(item.urgency)} cursor-pointer hover:bg-white/5 transition-colors`}
                        >
                          <div className="p-2 rounded-lg bg-white/5">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{item.title}</p>
                            <p className="text-white/60 text-sm truncate">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/40 text-xs">
                              {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: nl })}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/40" />
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Meetings */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Snelle Acties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/dashboard/admin/pipeline">
                    <Button variant="outline" className="w-full justify-start">
                      <Kanban className="w-4 h-4 mr-2" />
                      Pipeline
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/projects">
                    <Button variant="outline" className="w-full justify-start">
                      <FolderKanban className="w-4 h-4 mr-2" />
                      Projecten
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/invoices">
                    <Button variant="outline" className="w-full justify-start">
                      <Receipt className="w-4 h-4 mr-2" />
                      Facturatie
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/users">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Klanten
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/calendar">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Agenda
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Komende Afspraken
                  </span>
                  <Link href="/dashboard/admin/calendar">
                    <Button variant="ghost" size="sm">Bekijk alle</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMeetings.length === 0 ? (
                  <p className="text-white/60 text-sm text-center py-4">
                    Geen komende afspraken
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingMeetings.slice(0, 3).map((meeting: any) => (
                      <div key={meeting.id} className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white font-medium text-sm">{meeting.title}</p>
                        <p className="text-white/60 text-xs mt-1">
                          {meeting.startTime?.toDate ?
                            formatDistanceToNow(meeting.startTime.toDate(), { addSuffix: true, locale: nl }) :
                            'Datum onbekend'}
                        </p>
                        {meeting.requestedBy && (
                          <p className="text-white/40 text-xs mt-1">
                            Met: {meeting.requestedBy.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white/5 border-white/10 mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Recente Activiteit
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentActivities.slice(0, 6).map((activity) => (
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
                      <Mail className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-white/60 text-xs truncate">{activity.description}</p>
                    <p className="text-white/40 text-xs mt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: nl })}
                    </p>
                  </div>
                  {activity.status && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {activity.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Summary */}
        <Card className="bg-white/5 border-white/10 mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Prestatie Overzicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-white/60 mb-1">Totale Omzet</p>
                <p className="text-2xl font-bold text-white">€{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {metrics.find(m => m.title === 'Omzet')?.trend === 'up' ? (
                    <ArrowUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${metrics.find(m => m.title === 'Omzet')?.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.find(m => m.title === 'Omzet')?.change || 0}% deze periode
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Actieve Projecten</p>
                <p className="text-2xl font-bold text-white">{activeProjects}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-white/40">van {metrics.find(m => m.title === 'Actieve Projecten')?.value || 0} totaal</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Nieuwe Klanten</p>
                <p className="text-2xl font-bold text-white">{metrics.find(m => m.title === 'Klanten')?.value || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  {metrics.find(m => m.title === 'Klanten')?.trend === 'up' ? (
                    <ArrowUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${metrics.find(m => m.title === 'Klanten')?.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.find(m => m.title === 'Klanten')?.change || 0}% deze periode
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
