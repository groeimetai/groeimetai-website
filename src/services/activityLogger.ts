import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export type ActivityType =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.register'
  | 'auth.password_reset'
  | 'auth.email_verified'
  | 'auth.mfa_enabled'
  | 'auth.mfa_disabled'
  | 'project.create'
  | 'project.update'
  | 'project.delete'
  | 'project.status_change'
  | 'quote.create'
  | 'quote.update'
  | 'quote.delete'
  | 'quote.status_change'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.role_change'
  | 'file.upload'
  | 'file.download'
  | 'file.delete'
  | 'api.call'
  | 'admin.action'
  | 'error.occurred'
  | 'consultation.book'
  | 'consultation.cancel'
  | 'message.send'
  | 'notification.send';

export type ResourceType = 
  | 'user'
  | 'project'
  | 'quote'
  | 'file'
  | 'consultation'
  | 'message'
  | 'notification'
  | 'system';

export interface ActivityLog {
  id?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  action: ActivityType;
  resourceType: ResourceType;
  resourceId?: string;
  resourceName?: string;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
  ip?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  severity: 'info' | 'warning' | 'error';
  description?: string;
}

interface BatchQueue {
  logs: Omit<ActivityLog, 'id'>[];
  timeout: NodeJS.Timeout | null;
}

class ActivityLogger {
  private static instance: ActivityLogger;
  private batchQueue: BatchQueue = {
    logs: [],
    timeout: null,
  };
  private readonly BATCH_SIZE = 50;
  private readonly BATCH_DELAY = 5000; // 5 seconds
  private readonly COLLECTION_NAME = 'activityLogs';
  private readonly RETENTION_DAYS = 30;

  private constructor() {}

  static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  /**
   * Log an activity
   */
  async log(
    activity: Omit<ActivityLog, 'id' | 'timestamp'>
  ): Promise<void> {
    try {
      // Build log object without undefined values
      const log: Omit<ActivityLog, 'id'> = {
        ...activity,
        timestamp: serverTimestamp() as Timestamp,
      };

      // Only add optional fields if they have values
      const ip = this.getClientIP();
      if (ip !== undefined) {
        log.ip = ip;
      }

      const userAgent = this.getUserAgent();
      if (userAgent !== undefined) {
        log.userAgent = userAgent;
      }

      const location = await this.getLocation();
      if (location !== undefined) {
        log.location = location;
      }

      // Add to batch queue
      this.batchQueue.logs.push(log);

      // Process batch if size limit reached
      if (this.batchQueue.logs.length >= this.BATCH_SIZE) {
        await this.processBatch();
      } else {
        // Schedule batch processing
        this.scheduleBatch();
      }

      // Log critical activities immediately
      if (activity.severity === 'error' || this.isCriticalActivity(activity.action)) {
        await this.logImmediately(log);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Log an activity immediately (bypass batching)
   */
  private async logImmediately(
    log: Omit<ActivityLog, 'id'>
  ): Promise<void> {
    try {
      await addDoc(collection(db, this.COLLECTION_NAME), log);
    } catch (error) {
      console.error('Error logging activity immediately:', error);
    }
  }

  /**
   * Schedule batch processing
   */
  private scheduleBatch(): void {
    if (this.batchQueue.timeout) {
      clearTimeout(this.batchQueue.timeout);
    }

    this.batchQueue.timeout = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  /**
   * Process batch logs
   */
  private async processBatch(): Promise<void> {
    if (this.batchQueue.logs.length === 0) return;

    try {
      const batch = writeBatch(db);
      const logs = [...this.batchQueue.logs];
      this.batchQueue.logs = [];

      logs.forEach((log) => {
        const docRef = doc(collection(db, this.COLLECTION_NAME));
        batch.set(docRef, log);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error processing batch logs:', error);
      // Re-add logs to queue on failure
      this.batchQueue.logs.unshift(...this.batchQueue.logs);
    }
  }

  /**
   * Force flush all pending logs
   */
  async flush(): Promise<void> {
    await this.processBatch();
  }

  /**
   * Get activity logs with filters
   */
  async getActivityLogs(filters: {
    userId?: string;
    action?: ActivityType;
    resourceType?: ResourceType;
    startDate?: Date;
    endDate?: Date;
    severity?: 'info' | 'warning' | 'error';
    pageSize?: number;
    lastDoc?: DocumentSnapshot;
  }): Promise<{ logs: ActivityLog[]; lastDoc?: DocumentSnapshot }> {
    try {
      const constraints: QueryConstraint[] = [
        orderBy('timestamp', 'desc'),
      ];

      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }

      if (filters.action) {
        constraints.push(where('action', '==', filters.action));
      }

      if (filters.resourceType) {
        constraints.push(where('resourceType', '==', filters.resourceType));
      }

      if (filters.severity) {
        constraints.push(where('severity', '==', filters.severity));
      }

      if (filters.startDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(filters.startDate)));
      }

      if (filters.endDate) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(filters.endDate)));
      }

      if (filters.lastDoc) {
        constraints.push(startAfter(filters.lastDoc));
      }

      constraints.push(limit(filters.pageSize || 50));

      const q = query(collection(db, this.COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      const logs: ActivityLog[] = [];
      snapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data(),
        } as ActivityLog);
      });

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return { logs, lastDoc };
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(filters: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }): Promise<{
    totalActivities: number;
    activitiesByType: Record<ActivityType, number>;
    activitiesBySeverity: Record<string, number>;
    mostActiveUsers: Array<{ userId: string; count: number }>;
    peakHours: Array<{ hour: number; count: number }>;
  }> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters.startDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(filters.startDate)));
      }

      if (filters.endDate) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(filters.endDate)));
      }

      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }

      const q = query(collection(db, this.COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      const stats = {
        totalActivities: 0,
        activitiesByType: {} as Record<ActivityType, number>,
        activitiesBySeverity: {} as Record<string, number>,
        userActivityCount: {} as Record<string, number>,
        hourlyActivity: {} as Record<number, number>,
      };

      snapshot.forEach((doc) => {
        const data = doc.data() as ActivityLog;
        stats.totalActivities++;

        // Count by type
        stats.activitiesByType[data.action] = (stats.activitiesByType[data.action] || 0) + 1;

        // Count by severity
        stats.activitiesBySeverity[data.severity] = (stats.activitiesBySeverity[data.severity] || 0) + 1;

        // Count by user
        stats.userActivityCount[data.userId] = (stats.userActivityCount[data.userId] || 0) + 1;

        // Count by hour
        if (data.timestamp) {
          const hour = data.timestamp.toDate().getHours();
          stats.hourlyActivity[hour] = (stats.hourlyActivity[hour] || 0) + 1;
        }
      });

      // Get most active users
      const mostActiveUsers = Object.entries(stats.userActivityCount)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get peak hours
      const peakHours = Object.entries(stats.hourlyActivity)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => a.hour - b.hour);

      return {
        totalActivities: stats.totalActivities,
        activitiesByType: stats.activitiesByType,
        activitiesBySeverity: stats.activitiesBySeverity,
        mostActiveUsers,
        peakHours,
      };
    } catch (error) {
      console.error('Error getting activity stats:', error);
      throw error;
    }
  }

  /**
   * Clean up old logs
   */
  async cleanupOldLogs(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_DAYS);

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('timestamp', '<', Timestamp.fromDate(cutoffDate)),
        limit(500) // Process in batches to avoid timeout
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return 0;
      }

      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Recursively clean more if needed
      if (snapshot.size === 500) {
        const additionalDeleted = await this.cleanupOldLogs();
        return snapshot.size + additionalDeleted;
      }

      return snapshot.size;
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      throw error;
    }
  }

  /**
   * Export logs to CSV
   */
  async exportToCSV(filters: Parameters<typeof this.getActivityLogs>[0]): Promise<string> {
    try {
      const allLogs: ActivityLog[] = [];
      let lastDoc: DocumentSnapshot | undefined;

      // Fetch all logs matching filters
      do {
        const { logs, lastDoc: newLastDoc } = await this.getActivityLogs({
          ...filters,
          pageSize: 100,
          lastDoc,
        });
        allLogs.push(...logs);
        lastDoc = newLastDoc;
      } while (lastDoc);

      // Convert to CSV
      const headers = [
        'Timestamp',
        'User Email',
        'User Name',
        'Action',
        'Resource Type',
        'Resource Name',
        'Severity',
        'Description',
        'IP Address',
        'User Agent',
        'Location',
      ];

      const rows = allLogs.map((log) => [
        log.timestamp?.toDate().toISOString() || '',
        log.userEmail,
        log.userName || '',
        log.action,
        log.resourceType,
        log.resourceName || '',
        log.severity,
        log.description || '',
        log.ip || '',
        log.userAgent || '',
        log.location ? `${log.location.city || ''}, ${log.location.country || ''}` : '',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return csv;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  /**
   * Detect suspicious activities
   */
  async detectSuspiciousActivities(): Promise<ActivityLog[]> {
    try {
      const suspiciousActivities: ActivityLog[] = [];
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      // Check for multiple failed login attempts
      const failedLogins = await this.getActivityLogs({
        action: 'auth.login',
        severity: 'error',
        startDate: oneHourAgo,
      });

      // Group by user/IP
      const failedByUser: Record<string, ActivityLog[]> = {};
      failedLogins.logs.forEach((log) => {
        const key = `${log.userId}-${log.ip}`;
        if (!failedByUser[key]) failedByUser[key] = [];
        failedByUser[key].push(log);
      });

      // Flag users with > 5 failed attempts
      Object.values(failedByUser).forEach((logs) => {
        if (logs.length > 5) {
          suspiciousActivities.push(...logs);
        }
      });

      // Check for unusual activity patterns
      const recentActivities = await this.getActivityLogs({
        startDate: oneHourAgo,
        pageSize: 500,
      });

      // Check for rapid API calls
      const apiCallsByUser: Record<string, number> = {};
      recentActivities.logs.forEach((log) => {
        if (log.action === 'api.call') {
          apiCallsByUser[log.userId] = (apiCallsByUser[log.userId] || 0) + 1;
        }
      });

      // Flag users with excessive API calls
      Object.entries(apiCallsByUser).forEach(([userId, count]) => {
        if (count > 100) {
          const userLogs = recentActivities.logs.filter(
            (log) => log.userId === userId && log.action === 'api.call'
          );
          suspiciousActivities.push(...userLogs);
        }
      });

      return suspiciousActivities;
    } catch (error) {
      console.error('Error detecting suspicious activities:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private isCriticalActivity(action: ActivityType): boolean {
    const criticalActions: ActivityType[] = [
      'user.delete',
      'user.role_change',
      'auth.mfa_disabled',
      'project.delete',
      'quote.delete',
    ];
    return criticalActions.includes(action);
  }

  private getClientIP(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    // In a real implementation, this would come from the server
    // For now, return undefined as we can't get real IP from browser
    return undefined;
  }

  private getUserAgent(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return window.navigator.userAgent;
  }

  private async getLocation(): Promise<ActivityLog['location'] | undefined> {
    // In a real implementation, this would use an IP geolocation service
    // For now, return undefined
    return undefined;
  }
}

// Export singleton instance
export const activityLogger = ActivityLogger.getInstance();

// Helper functions for common logging scenarios
export const logAuthActivity = async (
  action: Extract<ActivityType, `auth.${string}`>,
  userId: string,
  userEmail: string,
  metadata?: Record<string, any>
) => {
  await activityLogger.log({
    userId,
    userEmail,
    action,
    resourceType: 'user',
    resourceId: userId,
    severity: action === 'auth.login' || action === 'auth.logout' ? 'info' : 'warning',
    description: getActivityDescription(action),
    metadata,
  });
};

export const logResourceActivity = async (
  action: ActivityType,
  resourceType: ResourceType,
  resourceId: string,
  resourceName: string,
  user: { uid: string; email: string; displayName?: string },
  metadata?: Record<string, any>
) => {
  await activityLogger.log({
    userId: user.uid,
    userEmail: user.email,
    userName: user.displayName,
    action,
    resourceType,
    resourceId,
    resourceName,
    severity: action.includes('delete') ? 'warning' : 'info',
    description: getActivityDescription(action, resourceName),
    metadata,
  });
};

export const logErrorActivity = async (
  action: ActivityType,
  error: Error,
  user: { uid: string; email: string; displayName?: string },
  context?: Record<string, any>
) => {
  await activityLogger.log({
    userId: user.uid,
    userEmail: user.email,
    userName: user.displayName,
    action,
    resourceType: 'system',
    severity: 'error',
    description: error.message,
    metadata: {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
    },
  });
};

// Get human-readable description for activities
function getActivityDescription(action: ActivityType, resourceName?: string): string {
  const descriptions: Record<ActivityType, string> = {
    'auth.login': 'User logged in',
    'auth.logout': 'User logged out',
    'auth.register': 'New user registered',
    'auth.password_reset': 'Password reset requested',
    'auth.email_verified': 'Email verified',
    'auth.mfa_enabled': 'Two-factor authentication enabled',
    'auth.mfa_disabled': 'Two-factor authentication disabled',
    'project.create': `Created project${resourceName ? ` "${resourceName}"` : ''}`,
    'project.update': `Updated project${resourceName ? ` "${resourceName}"` : ''}`,
    'project.delete': `Deleted project${resourceName ? ` "${resourceName}"` : ''}`,
    'project.status_change': `Changed project status${resourceName ? ` for "${resourceName}"` : ''}`,
    'quote.create': `Created quote${resourceName ? ` "${resourceName}"` : ''}`,
    'quote.update': `Updated quote${resourceName ? ` "${resourceName}"` : ''}`,
    'quote.delete': `Deleted quote${resourceName ? ` "${resourceName}"` : ''}`,
    'quote.status_change': `Changed quote status${resourceName ? ` for "${resourceName}"` : ''}`,
    'user.create': 'Created user account',
    'user.update': 'Updated user profile',
    'user.delete': 'Deleted user account',
    'user.role_change': 'Changed user role',
    'file.upload': `Uploaded file${resourceName ? ` "${resourceName}"` : ''}`,
    'file.download': `Downloaded file${resourceName ? ` "${resourceName}"` : ''}`,
    'file.delete': `Deleted file${resourceName ? ` "${resourceName}"` : ''}`,
    'api.call': 'Made API call',
    'admin.action': 'Performed admin action',
    'error.occurred': 'Error occurred',
    'consultation.book': 'Booked consultation',
    'consultation.cancel': 'Cancelled consultation',
    'message.send': 'Sent message',
    'notification.send': 'Sent notification',
  };

  return descriptions[action] || action;
}