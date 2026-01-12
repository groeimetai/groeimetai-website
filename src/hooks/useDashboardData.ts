'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardService, Project, AgentActivity, SystemMetrics } from '@/services/firestore/dashboard';
import { activityLogger } from '@/services/activityLogger';
import { useAuth } from '@/contexts/AuthContext';

// Dashboard stats interface
export interface DashboardStats {
  activeProjects: number;
  messages: number;
  consultations: number;
  teamMembers: number;
  // Additional real metrics
  totalUsers: number;
  systemUptime: number;
  monthlyGrowth: number;
  activeSessions: number;
}

// Real-time activity interface
export interface RealtimeActivity {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

// Journey data interface for type safety
export interface JourneyData {
  stage: string;
  projects: Project[];
  activities: ActivityLog[];
  milestonesCompleted: number;
  nextMilestone: string;
}

// Activity log interface
interface ActivityLog {
  id?: string;
  timestamp: { toDate: () => Date };
  action: string;
  userName?: string;
  userEmail: string;
  description?: string;
  severity?: 'info' | 'warning' | 'error';
}

// Performance metric interface
export interface PerformanceMetric {
  name: string;
  current: string;
  target: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

// Hook for dashboard overview data
export const useDashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<RealtimeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track mounted state and prevent memory leaks
  const isMountedRef = useRef(true);

  const fetchStats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Fetch user's projects
      const userProjects = await DashboardService.getUserProjects(user.uid);

      // Only update state if still mounted
      if (!isMountedRef.current) return;

      setProjects(userProjects);

      // Calculate stats from real data
      const activeProjectsCount = userProjects.filter(p =>
        ['pilot', 'implementation', 'live'].includes(p.status)
      ).length;

      // Fetch activity logs for the user
      const activityData = await activityLogger.getActivityLogs({
        userId: user.uid,
        pageSize: 10
      });

      if (!isMountedRef.current) return;

      // Convert activity logs to dashboard activities
      const realtimeActivities: RealtimeActivity[] = activityData.logs.map(log => ({
        id: log.id || '',
        timestamp: log.timestamp.toDate(),
        action: log.action,
        user: log.userName || log.userEmail,
        description: log.description || getActionDescription(log.action),
        type: log.severity === 'error' ? 'error' :
              log.severity === 'warning' ? 'warning' : 'info'
      }));

      setActivities(realtimeActivities);

      // Get system metrics if available
      const systemMetrics = await DashboardService.getSystemMetrics(user.uid);

      if (!isMountedRef.current) return;

      // Build dashboard stats
      const dashboardStats: DashboardStats = {
        activeProjects: activeProjectsCount,
        messages: realtimeActivities.filter(a => a.action.includes('message')).length,
        consultations: userProjects.filter(p => p.status === 'assessment').length,
        teamMembers: systemMetrics?.activeAgents || 0,
        totalUsers: 1,
        systemUptime: systemMetrics?.uptime || 99.9,
        monthlyGrowth: calculateMonthlyGrowth(userProjects),
        activeSessions: 1
      };

      setStats(dashboardStats);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.uid]);

  // Initial fetch and cleanup
  useEffect(() => {
    isMountedRef.current = true;
    fetchStats();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchStats]);

  // Real-time subscription for projects - separate from initial fetch
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = DashboardService.subscribeToProjects(user.uid, (updatedProjects) => {
      if (!isMountedRef.current) return;

      setProjects(updatedProjects);

      // Update only activeProjects count in stats using functional update
      // This prevents dependency on stats and avoids infinite loops
      const activeCount = updatedProjects.filter(p =>
        ['pilot', 'implementation', 'live'].includes(p.status)
      ).length;

      setStats(prev => prev ? { ...prev, activeProjects: activeCount } : null);
    });

    return unsubscribe;
  }, [user?.uid]);

  return {
    stats,
    projects,
    activities,
    loading,
    error,
    refresh: fetchStats
  };
};

// Hook for system metrics and performance
export const useSystemMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchMetrics = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const systemMetrics = await DashboardService.getSystemMetrics(user.uid);

      if (!isMountedRef.current) return;

      setMetrics(systemMetrics);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error fetching system metrics:', err);
      setError('Failed to load system metrics');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchMetrics();

    // Poll every 2 minutes for system metrics updates
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        fetchMetrics();
      }
    }, 120000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics
  };
};

// Hook for real-time activity feed
export const useActivityFeed = (limit: number = 50) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Subscribe to real-time activity updates
    const unsubscribe = DashboardService.subscribeToActivityFeed(user.uid, (newActivities) => {
      setActivities(newActivities.slice(0, limit));
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [user, limit]);

  return {
    activities,
    loading,
    error
  };
};

// Hook for user journey tracking
export const useUserJourney = () => {
  const { user } = useAuth();
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('assessment');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchJourneyData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Get user's projects to determine journey stage
      const userProjects = await DashboardService.getUserProjects(user.uid);

      if (!isMountedRef.current) return;

      // Determine current stage based on project status
      let stage = 'assessment';
      if (userProjects.some(p => p.status === 'live')) {
        stage = 'live';
      } else if (userProjects.some(p => p.status === 'implementation')) {
        stage = 'implementation';
      } else if (userProjects.some(p => p.status === 'pilot')) {
        stage = 'pilot';
      }

      setCurrentStage(stage);

      // Get activity history for journey tracking
      const activityData = await activityLogger.getActivityLogs({
        userId: user.uid,
        pageSize: 100
      });

      if (!isMountedRef.current) return;

      setJourneyData({
        stage,
        projects: userProjects,
        activities: activityData.logs,
        milestonesCompleted: calculateMilestonesCompleted(userProjects, activityData.logs),
        nextMilestone: getNextMilestone(stage, userProjects)
      });

      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error fetching journey data:', err);
      setError('Failed to load journey data');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchJourneyData();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchJourneyData]);

  return {
    journeyData,
    currentStage,
    loading,
    error,
    refresh: fetchJourneyData
  };
};

// Hook for performance metrics
export const usePerformanceMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchMetrics = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const performanceData = await DashboardService.getPerformanceMetrics(user.uid);

      if (!isMountedRef.current) return;

      setMetrics(performanceData as PerformanceMetric[]);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error fetching performance metrics:', err);
      setError('Failed to load performance metrics');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchMetrics();

    // Poll every 5 minutes for performance metrics updates
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        fetchMetrics();
      }
    }, 300000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics
  };
};

// Helper functions
function getActionDescription(action: string): string {
  const descriptions: Record<string, string> = {
    'auth.login': 'User logged in',
    'auth.logout': 'User logged out',
    'project.create': 'Created new project',
    'project.update': 'Updated project',
    'project.status_change': 'Changed project status',
    'quote.create': 'Submitted new quote',
    'quote.update': 'Updated quote request',
    'user.update': 'Updated profile',
    'file.upload': 'Uploaded document',
    'consultation.book': 'Booked consultation',
    'message.send': 'Sent message'
  };
  
  return descriptions[action] || action.replace(/\./g, ' ').replace(/_/g, ' ');
}

function calculateMonthlyGrowth(projects: Project[]): number {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  
  const thisMonthProjects = projects.filter(p => p.startDate >= lastMonth);
  const previousMonthProjects = projects.filter(p => 
    p.startDate < lastMonth && p.startDate >= new Date(now.getFullYear(), now.getMonth() - 2)
  );
  
  if (previousMonthProjects.length === 0) return 0;
  
  return ((thisMonthProjects.length - previousMonthProjects.length) / previousMonthProjects.length) * 100;
}

function calculateMilestonesCompleted(projects: Project[], activities: any[]): number {
  let completed = 0;
  
  projects.forEach(project => {
    if (project.milestones) {
      completed += project.milestones.filter(m => m.status === 'completed').length;
    }
  });
  
  return completed;
}

function getNextMilestone(stage: string, projects: Project[]): string {
  switch (stage) {
    case 'assessment':
      return 'Start Pilot Project';
    case 'pilot':
      return 'Full Implementation';
    case 'implementation':
      return 'Go Live';
    case 'live':
      return 'System Expansion';
    default:
      return 'Complete Assessment';
  }
}

export default {
  useDashboardOverview,
  useSystemMetrics,
  useActivityFeed,
  useUserJourney,
  usePerformanceMetrics
};