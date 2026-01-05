'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  MessageSquare,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Activity,
  Database,
  Brain,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDashboardOverview } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DashboardStatsSkeleton, 
  ProjectListSkeleton, 
  ActivityFeedSkeleton, 
  QuickActionsSkeleton 
} from '@/components/ui/LoadingSkeleton';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { stats, projects, activities, loading, error, refresh } = useDashboardOverview();

  const getUserName = () => {
    if (!user) return 'User';
    return user.displayName || user.firstName || user.email?.split('@')[0] || 'User';
  };

  const getStatIcon = (title: string) => {
    switch (title) {
      case 'Active Projects': return FileText;
      case 'Messages': return MessageSquare;
      case 'Consultations': return Calendar;
      case 'Team Members': return Users;
      case 'System Uptime': return Activity;
      case 'Active Sessions': return Database;
      default: return Brain;
    }
  };

  const getStatColor = (title: string) => {
    switch (title) {
      case 'Active Projects': return 'bg-blue-500';
      case 'Messages': return 'bg-purple-500';
      case 'Consultations': return 'bg-green-500';
      case 'Team Members': return 'bg-orange-500';
      case 'System Uptime': return 'bg-cyan-500';
      case 'Active Sessions': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const formatStatValue = (title: string, value: number) => {
    switch (title) {
      case 'System Uptime': return `${value.toFixed(1)}%`;
      case 'Monthly Growth': return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
      default: return value.toString();
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-400">Failed to Load Dashboard</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
          <Button 
            onClick={refresh} 
            variant="outline" 
            className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-2 text-white">
          Welcome back, {getUserName()}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your projects and consultations.
        </p>
      </motion.div>

      {/* Stats grid */}
      {loading ? (
        <DashboardStatsSkeleton />
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Active Projects', value: stats.activeProjects, change: stats.monthlyGrowth },
            { title: 'Messages', value: stats.messages, change: 5 },
            { title: 'Consultations', value: stats.consultations, change: -2 },
            { title: 'System Uptime', value: stats.systemUptime, change: 0.1 }
          ].map((stat, index) => {
            const Icon = getStatIcon(stat.title);
            const isPositive = stat.change >= 0;
            
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover-lift bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${getStatColor(stat.title)}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatStatValue(stat.title, stat.value)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                        {isPositive ? '+' : ''}{stat.change.toFixed(1)}
                        {stat.title === 'System Uptime' ? '%' : ''}
                      </span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : null}

      {/* Projects and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="h-full bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Projects</CardTitle>
              <CardDescription className="text-white/60">Your active and recent projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <ProjectListSkeleton />
              ) : projects && projects.length > 0 ? (
                <>
                  {projects.slice(0, 3).map((project) => {
                    const getStatusIcon = (status: string) => {
                      switch (status) {
                        case 'live':
                        case 'completed':
                          return <CheckCircle2 className="h-4 w-4 text-green-500" />;
                        case 'implementation':
                        case 'pilot':
                          return <Clock className="h-4 w-4 text-blue-500" />;
                        default:
                          return <AlertCircle className="h-4 w-4 text-orange-500" />;
                      }
                    };

                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'live':
                        case 'completed':
                          return 'text-green-400';
                        case 'implementation':
                        case 'pilot':
                          return 'text-blue-400';
                        default:
                          return 'text-orange-400';
                      }
                    };

                    return (
                      <div key={project.id} className="space-y-2 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{project.name}</p>
                            <p className="text-sm text-white/60">
                              {project.type} • {project.status}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(project.status)}
                            <Badge className={`${getStatusColor(project.status)} bg-transparent border-current`}>
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/60">
                          <span>Started: {project.startDate.toLocaleDateString()}</span>
                          {(project.estimatedHours ?? 0) > 0 && (
                            <span>{project.actualHours || 0}/{project.estimatedHours}h</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="outline" className="w-full mt-4 border-white/20 text-white hover:bg-white/10">
                    View All Projects
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h4 className="text-white font-medium mb-2">No Projects Yet</h4>
                  <p className="text-white/60 text-sm mb-4">
                    Start by taking our Agent Readiness Assessment
                  </p>
                  <Button className="bg-[#F87315] hover:bg-[#F87315]/90 text-white">
                    Start Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="h-full bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activities</CardTitle>
              <CardDescription className="text-white/60">Your latest system activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <ActivityFeedSkeleton />
              ) : activities && activities.length > 0 ? (
                <>
                  {activities.slice(0, 5).map((activity) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
                        case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
                        case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
                        default: return <Activity className="h-4 w-4 text-blue-500" />;
                      }
                    };

                    return (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {getActivityIcon(activity.type)}
                          <div>
                            <p className="font-medium text-white text-sm">{activity.description}</p>
                            <p className="text-xs text-white/60">{activity.user}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/60">
                            {activity.timestamp.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-white/40">
                            {activity.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="outline" className="w-full mt-4 border-white/20 text-white hover:bg-white/10">
                    View All Activities
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h4 className="text-white font-medium mb-2">No Activities Yet</h4>
                  <p className="text-white/60 text-sm">
                    Activities will appear as you use the system
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {loading ? (
          <QuickActionsSkeleton />
        ) : (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-white/60">Common tasks and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.location.href = '/agent-readiness'}
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Start Assessment
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.location.href = '/contact'}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Consultation
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.location.href = '/dashboard/messages'}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start border-white/20 text-white hover:bg-white/10"
                  onClick={refresh}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}