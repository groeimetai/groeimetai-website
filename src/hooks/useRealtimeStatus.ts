import { useState, useEffect } from 'react';

interface RealtimeStatus {
  leadId: string;
  customerStatus: string;
  adminStatus: string;
  stage: string;
  lastUpdate: Date;
  notifications: any[];
}

export function useRealtimeStatus(leadId: string) {
  const [status, setStatus] = useState<RealtimeStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!leadId) return;

    // Simulate real-time updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/status-sync?leadId=${leadId}`);
        const data = await response.json();
        
        if (data.success) {
          setStatus(data.status);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Status update error:', error);
        setIsConnected(false);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [leadId]);

  const updateStatus = async (newStatus: string, context?: any) => {
    try {
      const response = await fetch('/api/admin/status-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          newStatus,
          context
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Immediately update local state
        setStatus(prev => prev ? {
          ...prev,
          customerStatus: newStatus,
          lastUpdate: new Date()
        } : null);
      }
      
      return data;
    } catch (error) {
      console.error('Status update error:', error);
      return { error: 'Failed to update status' };
    }
  };

  return {
    status,
    isConnected,
    updateStatus
  };
}

// Hook for admin dashboard notifications
export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Simulate notification polling
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/notifications');
        const data = await response.json();
        
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error('Notification fetch error:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  return {
    notifications,
    markAsRead,
    unreadCount: notifications.length
  };
}

// Hook for customer dashboard real-time updates
export function useCustomerDashboard(clientId: string) {
  const [metrics, setMetrics] = useState<any>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!clientId) return;

    // Real-time updates for customer dashboard
    const interval = setInterval(async () => {
      try {
        // Fetch latest metrics
        const metricsResponse = await fetch(`/api/client/metrics?clientId=${clientId}`);
        const metricsData = await metricsResponse.json();
        
        // Fetch latest activities
        const activitiesResponse = await fetch(`/api/client/activities?clientId=${clientId}`);
        const activitiesData = await activitiesResponse.json();
        
        // Fetch alerts
        const alertsResponse = await fetch(`/api/client/alerts?clientId=${clientId}`);
        const alertsData = await alertsResponse.json();
        
        setMetrics(metricsData.metrics || {});
        setActivities(activitiesData.activities || []);
        setAlerts(alertsData.alerts || []);
        
      } catch (error) {
        console.error('Dashboard update error:', error);
      }
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [clientId]);

  const reportIssue = async (issueData: any) => {
    try {
      const response = await fetch('/api/client/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          ...issueData
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Issue reporting error:', error);
      return { error: 'Failed to report issue' };
    }
  };

  return {
    metrics,
    activities,
    alerts,
    reportIssue
  };
}