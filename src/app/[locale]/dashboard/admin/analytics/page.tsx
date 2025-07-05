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
  Timestamp
} from 'firebase/firestore';
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
  Loader2
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
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';

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

const mockAnalyticsData: AnalyticsData = {
  revenue: {
    current: 287500,
    previous: 245000,
    change: 17.3,
    byMonth: [
      { month: 'Jan', amount: 45000 },
      { month: 'Feb', amount: 52000 },
      { month: 'Mar', amount: 48000 },
      { month: 'Apr', amount: 58000 },
      { month: 'May', amount: 62000 },
      { month: 'Jun', amount: 71000 },
    ],
    byService: [
      { service: 'AI Consulting', amount: 125000 },
      { service: 'Chatbot Development', amount: 85000 },
      { service: 'Process Automation', amount: 45000 },
      { service: 'Data Analysis', amount: 32500 },
    ],
  },
  projects: {
    total: 156,
    active: 42,
    completed: 98,
    cancelled: 16,
    byStatus: [
      { status: 'Completed', count: 98 },
      { status: 'Active', count: 42 },
      { status: 'Cancelled', count: 16 },
    ],
    averageDuration: 45,
    completionRate: 86,
  },
  users: {
    total: 1234,
    new: 187,
    active: 892,
    growth: 15.2,
    byMonth: [
      { month: 'Jan', count: 850 },
      { month: 'Feb', count: 920 },
      { month: 'Mar', count: 980 },
      { month: 'Apr', count: 1050 },
      { month: 'May', count: 1150 },
      { month: 'Jun', count: 1234 },
    ],
  },
  quotes: {
    total: 342,
    pending: 28,
    approved: 187,
    rejected: 127,
    conversionRate: 54.7,
    averageValue: 8500,
    totalValue: 1589500,
  },
  team: {
    members: [
      { id: '1', name: 'John Doe', projects: 28, revenue: 95000, performance: 94 },
      { id: '2', name: 'Jane Smith', projects: 32, revenue: 112000, performance: 98 },
      { id: '3', name: 'Mike Johnson', projects: 24, revenue: 78000, performance: 87 },
      { id: '4', name: 'Sarah Wilson', projects: 20, revenue: 65000, performance: 82 },
    ],
    topPerformer: 'Jane Smith',
    averagePerformance: 90.25,
  },
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData);
  const [isLoading, setIsLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState('pdf');

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
        // For now, we'll use mock data
        // In a real implementation, you would calculate these from your Firestore data
        setAnalyticsData(mockAnalyticsData);
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
        .map(row => row.join(','))
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
              {change > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {Math.abs(change)}%
            </Badge>
          )}
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
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
                <SelectItem value="1y">Last year</SelectItem>
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
                change={12}
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
                value={`${analyticsData.quotes.conversionRate}%`}
                change={8.5}
                icon={Target}
                color="text-orange"
              />
            </div>

            {/* Revenue Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Revenue Trend">
                <div className="h-64 flex items-end justify-between gap-2">
                  {analyticsData.revenue.byMonth.map((item, index) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-xs text-white/60 mb-2">
                          €{(item.amount / 1000).toFixed(0)}k
                        </span>
                        <div
                          className="w-full bg-orange/80 rounded-t"
                          style={{
                            height: `${(item.amount / Math.max(...analyticsData.revenue.byMonth.map(m => m.amount))) * 200}px`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-white/60 mt-2">{item.month}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard title="Revenue by Service">
                <div className="space-y-4">
                  {analyticsData.revenue.byService.map((service) => {
                    const percentage = (service.amount / analyticsData.revenue.current) * 100;
                    return (
                      <div key={service.service}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-white">{service.service}</span>
                          <span className="text-sm text-white/60">€{service.amount.toLocaleString()}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
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
                        <p className="text-3xl font-bold text-white">{analyticsData.projects.total}</p>
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
                      <span className="text-white font-medium">{analyticsData.projects.completionRate}%</span>
                    </div>
                    <Progress value={analyticsData.projects.completionRate} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/60">Average Duration</span>
                      <span className="text-white font-medium">{analyticsData.projects.averageDuration} days</span>
                    </div>
                    <Progress value={analyticsData.projects.averageDuration} max={90} className="h-3" />
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-white/60">Active Projects</span>
                      </div>
                      <span className="text-xl font-bold text-white">{analyticsData.projects.active}</span>
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
                          height: `${(item.count / Math.max(...analyticsData.users.byMonth.map(m => m.count))) * 160}px`,
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

            {/* Team Performance */}
            <ChartCard
              title="Team Performance"
              action={
                <Badge variant="outline" className="text-orange border-orange/30">
                  <Award className="w-3 h-3 mr-1" />
                  Top: {analyticsData.team.topPerformer}
                </Badge>
              }
            >
              <div className="space-y-4">
                {analyticsData.team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{member.name}</p>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span>{member.projects} projects</span>
                          <span>€{member.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={member.performance} className="w-24 h-2" />
                      <span className="text-sm text-white/80 w-12 text-right">{member.performance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

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
                  <p className="text-2xl font-bold text-white">2.4 days</p>
                  <p className="text-sm text-green-500 mt-1">↓ 18% faster than last month</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-sm text-white/60">All time</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Success Rate</h3>
                  <p className="text-2xl font-bold text-white">{analyticsData.quotes.conversionRate}%</p>
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