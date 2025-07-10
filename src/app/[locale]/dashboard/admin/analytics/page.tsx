'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { collection, query, getDocs, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Target,
  Award,
  Zap,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, eachMonthOfInterval, subDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
    byMonth: { month: string; amount: number }[];
    byService: { service: string; amount: number }[];
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    byStatus: { status: string; count: number }[];
    averageDuration: number;
    completionRate: number;
  };
  users: {
    total: number;
    new: number;
    active: number;
    growth: number;
    byMonth: { month: string; count: number }[];
  };
  quotes: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    conversionRate: number;
    averageValue: number;
    totalValue: number;
  };
  team: {
    members: { id: string; name: string; projects: number; revenue: number; performance: number }[];
    topPerformer: string;
    averagePerformance: number;
  };
}

const getDefaultAnalyticsData = (): AnalyticsData => ({
  revenue: {
    current: 0,
    previous: 0,
    change: 0,
    byMonth: [],
    byService: [],
  },
  projects: {
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    byStatus: [],
    averageDuration: 0,
    completionRate: 0,
  },
  users: {
    total: 0,
    new: 0,
    active: 0,
    growth: 0,
    byMonth: [],
  },
  quotes: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    conversionRate: 0,
    averageValue: 0,
    totalValue: 0,
  },
  team: {
    members: [],
    topPerformer: '',
    averagePerformance: 0,
  },
});

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(getDefaultAnalyticsData());
  const [isLoading, setIsLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Fetch analytics data
  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Calculate date range
        const now = new Date();
        let startDate: Date;
        
        switch (timeRange) {
          case '7d':
            startDate = subDays(now, 7);
            break;
          case '30d':
            startDate = subDays(now, 30);
            break;
          case '90d':
            startDate = subDays(now, 90);
            break;
          case '1y':
            startDate = startOfYear(now);
            break;
          default:
            startDate = subDays(now, 30);
        }

        // Fetch users data from custom collection
        // Note: Firebase Auth doesn't support querying all users from client-side
        // We need the custom users collection for analytics features like:
        // - Filtering by date
        // - Sorting
        // - Custom fields (company, role, etc.)
        // - Activity tracking
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const usersSnapshot = await getDocs(usersQuery);
        const allUsers = usersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as any)); // Type assertion needed due to Firestore's generic document type
        
        // Filter out deleted users
        const users = allUsers.filter(user => !user.isDeleted);
        
        const totalUsers = users.length;
        const newUsers = users.filter(user => 
          user.createdAt?.toDate() >= startDate
        ).length;
        
        // Calculate active users (logged in within last 7 days)
        const sevenDaysAgo = subDays(now, 7);
        const activeUsers = users.filter(user => 
          user.lastActive?.toDate() >= sevenDaysAgo
        ).length;
        
        const previousPeriodStart = subDays(startDate, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const previousNewUsers = users.filter(user => 
          user.createdAt?.toDate() >= previousPeriodStart && 
          user.createdAt?.toDate() < startDate
        ).length;
        
        const userGrowth = previousNewUsers > 0 ? ((newUsers - previousNewUsers) / previousNewUsers) * 100 : 0;

        // Fetch quotes data
        const quotesQuery = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
        const quotesSnapshot = await getDocs(quotesQuery);
        const quotes = quotesSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as any));
        
        const quotesInRange = quotes.filter(quote => 
          quote.createdAt?.toDate() >= startDate
        );
        
        const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
        const approvedQuotes = quotes.filter(q => q.status === 'approved').length;
        const rejectedQuotes = quotes.filter(q => q.status === 'rejected').length;
        const conversionRate = quotes.length > 0 ? (approvedQuotes / quotes.length) * 100 : 0;
        
        // Calculate revenue from approved quotes
        let totalRevenue = 0;
        let currentRevenue = 0;
        let previousRevenue = 0;
        
        quotes.forEach(quote => {
          if (quote.status === 'approved' && quote.totalCost) {
            const amount = typeof quote.totalCost === 'number' ? quote.totalCost : 0;
            totalRevenue += amount;
            
            if (quote.createdAt?.toDate() >= startDate) {
              currentRevenue += amount;
            } else if (quote.createdAt?.toDate() >= previousPeriodStart) {
              previousRevenue += amount;
            }
          }
        });
        
        const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        const averageQuoteValue = approvedQuotes > 0 ? totalRevenue / approvedQuotes : 0;
        
        // Revenue by service
        const serviceRevenue: { [key: string]: number } = {};
        quotes.forEach(quote => {
          if (quote.status === 'approved' && quote.services && quote.totalCost) {
            const amount = typeof quote.totalCost === 'number' ? quote.totalCost : 0;
            quote.services.forEach((service: string) => {
              serviceRevenue[service] = (serviceRevenue[service] || 0) + (amount / quote.services.length);
            });
          }
        });
        
        const byService = Object.entries(serviceRevenue)
          .map(([service, amount]) => ({ service, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        // Fetch projects data
        const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as any));
        
        // Also count approved quotes as projects
        const totalProjects = projects.length + approvedQuotes;
        const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress').length + 
                             quotes.filter(q => q.status === 'approved' && !q.projectCompleted).length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const cancelledProjects = projects.filter(p => p.status === 'cancelled').length;
        
        const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
        
        // Calculate project status breakdown
        const projectsByStatus = [
          { status: 'Active', count: activeProjects },
          { status: 'Completed', count: completedProjects },
          { status: 'Cancelled', count: cancelledProjects },
        ];
        
        // Calculate monthly data
        const monthsToShow = timeRange === '1y' ? 12 : 6;
        const monthsInterval = eachMonthOfInterval({
          start: subMonths(now, monthsToShow - 1),
          end: now,
        });
        
        const revenueByMonth = monthsInterval.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const monthRevenue = quotes
            .filter(q => 
              q.status === 'approved' && 
              q.createdAt?.toDate() >= monthStart && 
              q.createdAt?.toDate() <= monthEnd &&
              q.totalCost
            )
            .reduce((sum, q) => sum + (typeof q.totalCost === 'number' ? q.totalCost : 0), 0);
          
          return {
            month: format(month, 'MMM'),
            amount: monthRevenue,
          };
        });
        
        const usersByMonth = monthsInterval.map(month => {
          const monthEnd = endOfMonth(month);
          const count = users.filter(u => 
            u.createdAt?.toDate() <= monthEnd
          ).length;
          
          return {
            month: format(month, 'MMM'),
            count,
          };
        });

        // Set analytics data
        setAnalyticsData({
          revenue: {
            current: currentRevenue,
            previous: previousRevenue,
            change: revenueChange,
            byMonth: revenueByMonth,
            byService,
          },
          projects: {
            total: totalProjects,
            active: activeProjects,
            completed: completedProjects,
            cancelled: cancelledProjects,
            byStatus: projectsByStatus,
            averageDuration: 45, // This would need project timeline data
            completionRate,
          },
          users: {
            total: totalUsers,
            new: newUsers,
            active: activeUsers,
            growth: userGrowth,
            byMonth: usersByMonth,
          },
          quotes: {
            total: quotes.length,
            pending: pendingQuotes,
            approved: approvedQuotes,
            rejected: rejectedQuotes,
            conversionRate,
            averageValue: averageQuoteValue,
            totalValue: totalRevenue,
          },
          team: {
            members: [], // This would need team member data
            topPerformer: '',
            averagePerformance: 0,
          },
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user, isAdmin, timeRange]);

  const exportReport = () => {
    // Mock export functionality
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      data: analyticsData,
    };

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      // Create CSV for revenue by month
      const csv = [
        ['Month', 'Revenue', 'Projects', 'Users'],
        ...analyticsData.revenue.byMonth.map((item, index) => [
          item.month,
          item.amount,
          analyticsData.projects.total,
          analyticsData.users.byMonth[index]?.count || 0,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
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

  const MetricCard = ({ title, value, change, icon: Icon, color, prefix = '' }: any) => (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className={`w-8 h-8 ${color}`} />
          {change !== undefined && (
            <Badge
              variant="outline"
              className={`${
                change > 0 ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'
              }`}
            >
              {change > 0 ? (
                <ArrowUp className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(change)}%
            </Badge>
          )}
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        <p className="text-white/60 text-sm">{title}</p>
      </CardContent>
    </Card>
  );

  const ChartCard = ({ title, children, action }: any) => (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-white/60">Comprehensive insights into your business performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">This year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-orange" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Revenue"
                value={analyticsData.revenue.current}
                change={analyticsData.revenue.change}
                icon={DollarSign}
                color="text-purple-500"
                prefix="€"
              />
              <MetricCard
                title="Active Projects"
                value={analyticsData.projects.active}
                change={analyticsData.projects.active > 0 ? 
                  Math.round(((analyticsData.projects.active - (analyticsData.projects.active * 0.8)) / (analyticsData.projects.active * 0.8)) * 100) : 0
                }
                icon={Briefcase}
                color="text-green-500"
              />
              <MetricCard
                title="Total Users"
                value={analyticsData.users.total}
                change={analyticsData.users.growth}
                icon={Users}
                color="text-blue-500"
              />
              <MetricCard
                title="Quote Conversion"
                value={`${analyticsData.quotes.conversionRate.toFixed(1)}%`}
                change={0}
                icon={Target}
                color="text-orange"
              />
            </div>

            {/* Revenue Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Revenue Trend">
                <div className="h-64 flex items-end justify-between gap-2">
                  {analyticsData.revenue.byMonth.length > 0 ? (
                    analyticsData.revenue.byMonth.map((item, index) => {
                      const maxAmount = Math.max(...analyticsData.revenue.byMonth.map((m) => m.amount));
                      const height = maxAmount > 0 ? (item.amount / maxAmount) * 200 : 0;
                      return (
                        <div key={item.month} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex flex-col items-center">
                            <span className="text-xs text-white/60 mb-2">
                              €{(item.amount / 1000).toFixed(0)}k
                            </span>
                            <div
                              className="w-full bg-orange/80 rounded-t"
                              style={{
                                height: `${height}px`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-white/60 mt-2">{item.month}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/40">No revenue data available</p>
                        <p className="text-sm text-white/30 mt-1">Revenue will appear here once quotes are approved</p>
                      </div>
                    </div>
                  )}
                </div>
              </ChartCard>

              <ChartCard title="Revenue by Service">
                <div className="space-y-4">
                  {analyticsData.revenue.byService.length > 0 ? analyticsData.revenue.byService.map((service) => {
                    const totalServiceRevenue = analyticsData.revenue.byService.reduce((sum, s) => sum + s.amount, 0);
                    const percentage = totalServiceRevenue > 0 ? (service.amount / totalServiceRevenue) * 100 : 0;
                    return (
                      <div key={service.service}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-white">{service.service}</span>
                          <span className="text-sm text-white/60">
                            €{service.amount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8 text-white/40">
                      <DollarSign className="w-12 h-12 mx-auto mb-2" />
                      <p>No revenue data available</p>
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>

            {/* Project Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <ChartCard title="Project Status Distribution">
                <div className="flex items-center justify-center h-48">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      {(() => {
                        let cumulativePercentage = 0;
                        return analyticsData.projects.byStatus.map((status, index) => {
                          const percentage = (status.count / analyticsData.projects.total) * 100;
                          const strokeDasharray = `${percentage * 3.6} ${360 - percentage * 3.6}`;
                          const strokeDashoffset = -cumulativePercentage * 3.6;
                          cumulativePercentage += percentage;

                          const colors = ['#10b981', '#f59e0b', '#ef4444'];

                          return (
                            <circle
                              key={status.status}
                              cx="96"
                              cy="96"
                              r="80"
                              fill="none"
                              stroke={colors[index]}
                              strokeWidth="32"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">
                          {analyticsData.projects.total}
                        </p>
                        <p className="text-sm text-white/60">Total Projects</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.projects.byStatus.map((status, index) => {
                    const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                    return (
                      <div key={status.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
                          <span className="text-sm text-white/80">{status.status}</span>
                        </div>
                        <span className="text-sm text-white/60">{status.count}</span>
                      </div>
                    );
                  })}
                </div>
              </ChartCard>

              <ChartCard title="Project Metrics">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/60">Completion Rate</span>
                      <span className="text-white font-medium">
                        {analyticsData.projects.completionRate}%
                      </span>
                    </div>
                    <Progress value={analyticsData.projects.completionRate} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/60">Average Duration</span>
                      <span className="text-white font-medium">
                        {analyticsData.projects.averageDuration} days
                      </span>
                    </div>
                    <Progress
                      value={analyticsData.projects.averageDuration}
                      max={90}
                      className="h-3"
                    />
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-white/60">Active Projects</span>
                      </div>
                      <span className="text-xl font-bold text-white">
                        {analyticsData.projects.active}
                      </span>
                    </div>
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="User Growth">
                <div className="h-48 flex items-end justify-between gap-2">
                  {analyticsData.users.byMonth.map((item) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500/80 rounded-t"
                        style={{
                          height: `${(item.count / Math.max(...analyticsData.users.byMonth.map((m) => m.count))) * 160}px`,
                        }}
                      />
                      <span className="text-xs text-white/60 mt-2">{item.month.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-white/60">New Users This Period</span>
                  <span className="text-lg font-medium text-white">{analyticsData.users.new}</span>
                </div>
              </ChartCard>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-6 h-6 text-yellow-500" />
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                      Quotes
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-white">{analyticsData.quotes.total}</p>
                  <p className="text-sm text-white/60">Total quotes received</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                      Pending
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-white">{analyticsData.quotes.pending}</p>
                  <p className="text-sm text-white/60">Awaiting review</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-purple-500" />
                    <Badge variant="outline" className="text-purple-500 border-purple-500/30">
                      Active
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-white">{analyticsData.users.active}</p>
                  <p className="text-sm text-white/60">Active users (7d)</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <Badge variant="outline" className="text-green-500 border-green-500/30">
                      Growth
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-white">{analyticsData.users.growth.toFixed(1)}%</p>
                  <p className="text-sm text-white/60">User growth rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Quote Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-6 h-6 text-yellow-500" />
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                      {analyticsData.quotes.pending} pending
                    </Badge>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Quote Pipeline</h3>
                  <p className="text-2xl font-bold text-white">
                    €{analyticsData.quotes.totalValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    Avg. value: €{analyticsData.quotes.averageValue.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-6 h-6 text-purple-500" />
                    <span className="text-sm text-white/60">This month</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Processing Time</h3>
                  <p className="text-2xl font-bold text-white">-</p>
                  <p className="text-sm text-white/60 mt-1">Data coming soon</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-sm text-white/60">All time</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Success Rate</h3>
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.quotes.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    {analyticsData.quotes.approved} of {analyticsData.quotes.total} quotes
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
