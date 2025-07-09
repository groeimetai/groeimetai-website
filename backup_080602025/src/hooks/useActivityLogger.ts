import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  activityLogger,
  ActivityType,
  ResourceType,
  logAuthActivity,
  logResourceActivity,
  logErrorActivity,
} from '@/services/activityLogger';

export function useActivityLogger() {
  const { user } = useAuth();

  // Log general activity
  const logActivity = useCallback(
    async (
      action: ActivityType,
      resourceType: ResourceType,
      options?: {
        resourceId?: string;
        resourceName?: string;
        description?: string;
        severity?: 'info' | 'warning' | 'error';
        metadata?: Record<string, any>;
      }
    ) => {
      if (!user) return;

      try {
        await activityLogger.log({
          userId: user.uid,
          userEmail: user.email || '',
          userName: user.displayName || undefined,
          action,
          resourceType,
          resourceId: options?.resourceId,
          resourceName: options?.resourceName,
          description: options?.description,
          severity: options?.severity || 'info',
          metadata: options?.metadata,
        });
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    },
    [user]
  );

  // Log authentication activity
  const logAuth = useCallback(
    async (action: Extract<ActivityType, `auth.${string}`>, metadata?: Record<string, any>) => {
      if (!user) return;

      try {
        await logAuthActivity(action, user.uid, user.email || '', metadata);
      } catch (error) {
        console.error('Failed to log auth activity:', error);
      }
    },
    [user]
  );

  // Log resource activity
  const logResource = useCallback(
    async (
      action: ActivityType,
      resourceType: ResourceType,
      resourceId: string,
      resourceName: string,
      metadata?: Record<string, any>
    ) => {
      if (!user) return;

      try {
        await logResourceActivity(
          action,
          resourceType,
          resourceId,
          resourceName,
          {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || undefined,
          },
          metadata
        );
      } catch (error) {
        console.error('Failed to log resource activity:', error);
      }
    },
    [user]
  );

  // Log error activity
  const logError = useCallback(
    async (action: ActivityType, error: Error, context?: Record<string, any>) => {
      if (!user) return;

      try {
        await logErrorActivity(
          action,
          error,
          {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || undefined,
          },
          context
        );
      } catch (error) {
        console.error('Failed to log error activity:', error);
      }
    },
    [user]
  );

  // Convenience methods for common activities
  const logLogin = useCallback(async () => {
    await logAuth('auth.login');
  }, [logAuth]);

  const logLogout = useCallback(async () => {
    await logAuth('auth.logout');
  }, [logAuth]);

  const logProjectCreate = useCallback(
    async (projectId: string, projectName: string) => {
      await logResource('project.create', 'project', projectId, projectName);
    },
    [logResource]
  );

  const logProjectUpdate = useCallback(
    async (projectId: string, projectName: string, changes?: Record<string, any>) => {
      await logResource('project.update', 'project', projectId, projectName, { changes });
    },
    [logResource]
  );

  const logProjectDelete = useCallback(
    async (projectId: string, projectName: string) => {
      await logResource('project.delete', 'project', projectId, projectName);
    },
    [logResource]
  );

  const logFileUpload = useCallback(
    async (fileId: string, fileName: string, fileSize?: number, fileType?: string) => {
      await logResource('file.upload', 'file', fileId, fileName, {
        fileSize,
        fileType,
      });
    },
    [logResource]
  );

  const logFileDownload = useCallback(
    async (fileId: string, fileName: string) => {
      await logResource('file.download', 'file', fileId, fileName);
    },
    [logResource]
  );

  const logFileDelete = useCallback(
    async (fileId: string, fileName: string) => {
      await logResource('file.delete', 'file', fileId, fileName);
    },
    [logResource]
  );

  const logApiCall = useCallback(
    async (endpoint: string, method: string, statusCode?: number) => {
      await logActivity('api.call', 'system', {
        description: `API call: ${method} ${endpoint}`,
        metadata: { endpoint, method, statusCode },
        severity: statusCode && statusCode >= 400 ? 'error' : 'info',
      });
    },
    [logActivity]
  );

  return {
    logActivity,
    logAuth,
    logResource,
    logError,
    logLogin,
    logLogout,
    logProjectCreate,
    logProjectUpdate,
    logProjectDelete,
    logFileUpload,
    logFileDownload,
    logFileDelete,
    logApiCall,
  };
}
