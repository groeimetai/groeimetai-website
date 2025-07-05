'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Download,
  Filter,
  RefreshCw,
  Search,
  Shield,
  AlertTriangle,
  Activity,
  User,
  Clock,
  FileText,
  TrendingUp,
  Eye,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  activityLogger,
  ActivityLog,
  ActivityType,
  ResourceType,
} from '@/services/activityLogger';
import { DocumentSnapshot } from 'firebase/firestore';

interface ActivityFilters {
  userId?: string;
  action?: ActivityType;
  resourceType?: ResourceType;
  startDate?: Date;
  endDate?: Date;
  severity?: 'info' | 'warning' | 'error';
  searchQuery?: string;
}

interface ActivityStats {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesBySeverity: Record<string, number>;
  mostActiveUsers: Array<{ userId: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot>();
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState<ActivityLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  // Load activity logs
  const loadLogs = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setLastDoc(undefined);
      } else {
        setLoadingMore(true);
      }

      const { logs: newLogs, lastDoc: newLastDoc } = await activityLogger.getActivityLogs({
        ...filters,
        pageSize: 50,
        lastDoc: reset ? undefined : lastDoc,
      });

      if (reset) {
        setLogs(newLogs);
      } else {
        setLogs((prev) => [...prev, ...newLogs]);
      }

      setLastDoc(newLastDoc);
      setHasMore(newLogs.length === 50);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, lastDoc, toast]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await activityLogger.getActivityStats({
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: filters.userId,
      });
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [filters]);

  // Load suspicious activities
  const loadSuspiciousActivities = useCallback(async () => {
    try {
      const suspicious = await activityLogger.detectSuspiciousActivities();
      setSuspiciousActivities(suspicious);
    } catch (error) {
      console.error('Error loading suspicious activities:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadLogs(true);
    loadStats();
    loadSuspiciousActivities();
  }, [filters]);

  // Export to CSV
  const handleExport = async () => {
    try {
      setExporting(true);
      const csv = await activityLogger.exportToCSV(filters);
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Activity logs exported successfully',
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to export activity logs',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // Refresh logs
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs(true);
    await loadStats();
    await loadSuspiciousActivities();
    setRefreshing(false);
  };

  // Clean up old logs
  const handleCleanup = async () => {
    try {
      const deletedCount = await activityLogger.cleanupOldLogs();
      toast({
        title: 'Success',
        description: `Cleaned up ${deletedCount} old activity logs`,
      });
      await handleRefresh();
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to clean up old logs',
        variant: 'destructive',
      });
    }
  };

  // Get severity badge variant
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get action icon
  const getActionIcon = (action: ActivityType) => {
    if (action.startsWith('auth.')) return Shield;
    if (action.startsWith('project.')) return FileText;
    if (action.startsWith('user.')) return User;
    if (action.startsWith('file.')) return FileText;
    return Activity;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor and analyze system activity across your application
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleCleanup}>
                Clean up old logs (30+ days)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Suspicious Activities Alert */}
      {suspiciousActivities.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Suspicious Activities Detected</AlertTitle>
          <AlertDescription>
            {suspiciousActivities.length} suspicious activities detected in the last hour.
            Review these activities for potential security issues.
          </AlertDescription>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => {
              setFilters({ severity: 'error' });
            }}
          >
            View Suspicious Activities
          </Button>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-2" />
            Activity Feed
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Activity Feed Tab */}
        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by user, resource, description..."
                  value={filters.searchQuery || ''}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action Type</Label>
                <Select
                  value={filters.action || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, action: value as ActivityType || undefined })
                  }
                >
                  <SelectTrigger id="action">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All actions</SelectItem>
                    <SelectItem value="auth.login">Login</SelectItem>
                    <SelectItem value="auth.logout">Logout</SelectItem>
                    <SelectItem value="project.create">Project Create</SelectItem>
                    <SelectItem value="project.update">Project Update</SelectItem>
                    <SelectItem value="project.delete">Project Delete</SelectItem>
                    <SelectItem value="file.upload">File Upload</SelectItem>
                    <SelectItem value="file.download">File Download</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={filters.severity || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, severity: value as 'info' | 'warning' | 'error' || undefined })
                  }
                >
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All severities</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value ? new Date(e.target.value) : undefined })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value ? new Date(e.target.value) : undefined })
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => setFilters({})}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Showing {logs.length} activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No activity logs found
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => {
                        const Icon = getActionIcon(log.action);
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                              {log.timestamp && (
                                <div className="text-sm">
                                  <div>{format(log.timestamp.toDate(), 'MMM d, yyyy')}</div>
                                  <div className="text-muted-foreground">
                                    {format(log.timestamp.toDate(), 'HH:mm:ss')}
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{log.userEmail}</div>
                                {log.userName && (
                                  <div className="text-muted-foreground">{log.userName}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{log.action}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {log.resourceName && (
                                <div className="text-sm">
                                  <div className="font-medium">{log.resourceType}</div>
                                  <div className="text-muted-foreground">{log.resourceName}</div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getSeverityVariant(log.severity)}>
                                {log.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {log.description}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedLog(log);
                                  setShowDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {hasMore && (
                    <div className="mt-4 text-center">
                      <Button
                        onClick={() => loadLogs(false)}
                        disabled={loadingMore}
                        variant="outline"
                      >
                        {loadingMore ? 'Loading...' : 'Load More'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalActivities}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Info Events</CardTitle>
                    <Activity className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activitiesBySeverity.info || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activitiesBySeverity.warning || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Errors</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activitiesBySeverity.error || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Most Active Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Users</CardTitle>
                  <CardDescription>Top 10 users by activity count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.mostActiveUsers.map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-muted-foreground">#{index + 1}</div>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.userId}</span>
                        </div>
                        <Badge variant="secondary">{user.count} activities</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity by Hour</CardTitle>
                  <CardDescription>24-hour activity distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.peakHours.map((hour) => {
                      const maxCount = Math.max(...stats.peakHours.map(h => h.count));
                      const percentage = (hour.count / maxCount) * 100;
                      return (
                        <div key={hour.hour} className="flex items-center gap-2">
                          <div className="w-12 text-sm text-muted-foreground">
                            {hour.hour.toString().padStart(2, '0')}:00
                          </div>
                          <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                            <div className="absolute inset-0 flex items-center px-2">
                              <span className="text-xs font-medium">{hour.count}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Types</CardTitle>
                  <CardDescription>Distribution of activity types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.activitiesByType)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([type, count]) => {
                        const Icon = getActionIcon(type as ActivityType);
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{type}</span>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Log Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
            <DialogDescription>
              Complete information about this activity log entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Timestamp</Label>
                  <p className="text-sm">
                    {selectedLog.timestamp && format(selectedLog.timestamp.toDate(), 'PPpp')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Severity</Label>
                  <Badge variant={getSeverityVariant(selectedLog.severity)}>
                    {selectedLog.severity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="text-sm">
                    {selectedLog.userEmail}
                    {selectedLog.userName && ` (${selectedLog.userName})`}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Action</Label>
                  <p className="text-sm">{selectedLog.action}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Resource</Label>
                  <p className="text-sm">
                    {selectedLog.resourceType}
                    {selectedLog.resourceName && ` - ${selectedLog.resourceName}`}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IP Address</Label>
                  <p className="text-sm">{selectedLog.ip || 'Not available'}</p>
                </div>
              </div>

              {selectedLog.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedLog.description}</p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <Label className="text-muted-foreground">User Agent</Label>
                  <p className="text-sm font-mono text-xs bg-muted p-2 rounded">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Additional Data</Label>
                  <pre className="text-sm font-mono text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}