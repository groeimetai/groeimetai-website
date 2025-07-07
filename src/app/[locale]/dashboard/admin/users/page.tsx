'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  deleteDoc,
  Timestamp,
  writeBatch,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format, formatDistanceToNow } from 'date-fns';
import { User, UserRole } from '@/types';
import UserBulkActions from '@/components/admin/UserBulkActions';
import type { BulkAction } from '@/components/admin/UserBulkActions';
import { notificationService } from '@/services/notificationService';
import {
  Users,
  Search,
  Filter,
  Download,
  Send,
  Edit,
  Shield,
  Ban,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Mail,
  Phone,
  Building,
  Briefcase,
  Activity,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  UserPlus,
  UserMinus,
  Bell,
  History,
  FileText,
  ExternalLink,
  Globe,
  Settings,
  Key,
  CreditCard,
  Package,
  TrendingUp,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toaster';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserActivity {
  id: string;
  userId: string;
  type:
    | 'login'
    | 'logout'
    | 'profile_update'
    | 'project_created'
    | 'quote_submitted'
    | 'payment_made';
  description: string;
  metadata?: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  accountType: string;
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

const ITEMS_PER_PAGE = 25;

export default function UsersManagementPage() {
  const router = useRouter();
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [processingExport, setProcessingExport] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    accountType: 'all',
    dateRange: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Notification state
  const [notificationData, setNotificationData] = useState<NotificationData>({
    title: '',
    message: '',
    type: 'info',
    link: '',
  });

  // Export options
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    includePersonalData: true,
    includeActivityData: false,
    includeStats: true,
  });

  // Real-time user updates
  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    let unsubscribe: () => void;

    const setupRealtimeUpdates = () => {
      let q = query(collection(db, 'users'));

      // Apply filters
      if (filters.role !== 'all') {
        q = query(q, where('role', '==', filters.role));
      }
      if (filters.status === 'active') {
        q = query(q, where('isActive', '==', true));
      } else if (filters.status === 'inactive') {
        q = query(q, where('isActive', '==', false));
      }
      if (filters.accountType !== 'all') {
        q = query(q, where('accountType', '==', filters.accountType));
      }

      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (filters.dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        q = query(q, where('createdAt', '>=', Timestamp.fromDate(startDate)));
      }

      // Apply sorting
      q = query(q, orderBy(filters.sortBy, filters.sortOrder as any));

      // Pagination
      q = query(q, limit(ITEMS_PER_PAGE));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const usersData: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            ...data,
            uid: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
            lastActivityAt: data.lastActivityAt?.toDate() || new Date(),
          } as User);
        });

        // Apply search filter (client-side)
        let filteredUsers = usersData;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredUsers = usersData.filter(
            (user) =>
              user.displayName.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower) ||
              user.company?.toLowerCase().includes(searchLower) ||
              user.firstName?.toLowerCase().includes(searchLower) ||
              user.lastName?.toLowerCase().includes(searchLower)
          );
        }

        setUsers(filteredUsers);
        setTotalUsers(snapshot.size);
        setHasMore(snapshot.size === ITEMS_PER_PAGE);
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
        setLoading(false);
      });
    };

    setupRealtimeUpdates();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, isAdmin, filters, page]);

  // Fetch user activities
  const fetchUserActivities = useCallback(async (userId: string) => {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(activitiesQuery);
      const activities: UserActivity[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as UserActivity);
      });

      setUserActivities(activities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  }, []);

  // Handle user selection
  const handleUserSelect = useCallback(
    (user: User) => {
      setSelectedUser(user);
      setShowUserDetails(true);
      fetchUserActivities(user.uid);
    },
    [fetchUserActivities]
  );

  // Update user
  const handleUserUpdate = async () => {
    if (!editingUser) return;

    try {
      const userRef = doc(db, 'users', editingUser.uid);
      await updateDoc(userRef, {
        ...editingUser,
        updatedAt: new Date(),
      });

      toast({
        title: 'User updated',
        description: 'User information has been successfully updated.',
      });

      setEditingUser(null);
      setShowUserDetails(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update user information. Please try again.',
        type: 'error',
      });
    }
  };

  // Change user role
  const changeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date(),
      });

      // Send notification to user
      await notificationService.sendToUser(userId, {
        type: 'system',
        title: 'Role Updated',
        description: `Your account role has been changed to ${newRole}`,
        priority: 'high',
      });

      toast({
        title: 'Role updated',
        description: `User role has been changed to ${newRole}.`,
      });
    } catch (error) {
      console.error('Error changing user role:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to change user role. Please try again.',
        type: 'error',
      });
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !isActive,
        updatedAt: new Date(),
      });

      const action = isActive ? 'deactivated' : 'activated';

      // Send notification
      await notificationService.sendToUser(userId, {
        type: 'system',
        title: 'Account Status Changed',
        description: `Your account has been ${action}`,
        priority: 'high',
      });

      toast({
        title: 'Status updated',
        description: `User account has been ${action}.`,
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to change user status. Please try again.',
        type: 'error',
      });
    }
  };

  // Send notification
  const handleSendNotification = async () => {
    if (!selectedUser || !notificationData.title || !notificationData.message) return;

    try {
      await notificationService.sendToUser(selectedUser.uid, {
        type: notificationData.type === 'error' ? 'system' : (notificationData.type as any),
        title: notificationData.title,
        description: notificationData.message,
        link: notificationData.link,
        priority: notificationData.type === 'error' ? 'high' : 'medium',
      });

      toast({
        title: 'Notification sent',
        description: 'Notification has been sent to the user.',
      });

      setShowSendNotification(false);
      setNotificationData({
        title: '',
        message: '',
        type: 'info',
        link: '',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Send failed',
        description: 'Failed to send notification. Please try again.',
        type: 'error',
      });
    }
  };

  // Export users data
  const handleExportUsers = async () => {
    setProcessingExport(true);

    try {
      const exportData = users.map((user) => ({
        id: user.uid,
        email: exportOptions.includePersonalData ? user.email : 'hidden',
        name: user.displayName,
        firstName: exportOptions.includePersonalData ? user.firstName : '',
        lastName: exportOptions.includePersonalData ? user.lastName : '',
        role: user.role,
        accountType: user.accountType,
        company: user.company,
        jobTitle: user.jobTitle,
        status: user.isActive ? 'active' : 'inactive',
        verified: user.isVerified,
        createdAt: format(user.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        lastLoginAt: format(user.lastLoginAt, 'yyyy-MM-dd HH:mm:ss'),
        ...(exportOptions.includeStats && {
          projectsCount: user.stats.projectsCount,
          consultationsCount: user.stats.consultationsCount,
          messagesCount: user.stats.messagesCount,
          totalSpent: user.stats.totalSpent,
        }),
      }));

      if (exportOptions.format === 'csv') {
        // Convert to CSV
        const headers = Object.keys(exportData[0] || {}).join(',');
        const rows = exportData.map((row) =>
          Object.values(row)
            .map((value) =>
              typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            )
            .join(',')
        );
        const csv = [headers, ...rows].join('\n');

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Download JSON
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: 'Export completed',
        description: 'User data has been exported successfully.',
      });

      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export user data. Please try again.',
        type: 'error',
      });
    } finally {
      setProcessingExport(false);
    }
  };

  // Bulk actions
  // Generate avatars for users without photos
  const generateAvatarsForUsers = async (userIds: string[]) => {
    try {
      const batch = writeBatch(db);
      let generatedCount = 0;

      for (const userId of userIds) {
        const user = users.find(u => u.uid === userId);
        if (user && !user.photoURL) {
          const { generateAvatarDataUri } = await import('@/lib/utils/avatar');
          const avatarDataUri = generateAvatarDataUri(user.displayName || user.email);
          
          batch.update(doc(db, 'users', userId), {
            photoURL: avatarDataUri,
            updatedAt: new Date(),
          });
          generatedCount++;
        }
      }

      if (generatedCount > 0) {
        await batch.commit();
        toast({
          title: 'Avatars generated',
          description: `Generated avatars for ${generatedCount} users`,
        });
      } else {
        toast({
          title: 'No avatars generated',
          description: 'All selected users already have profile photos',
          type: 'info',
        });
      }
    } catch (error) {
      console.error('Error generating avatars:', error);
      toast({
        title: 'Generation failed',
        description: 'Failed to generate avatars. Please try again.',
        type: 'error',
      });
    }
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'activate',
      label: 'Activate',
      icon: <CheckCircle className="w-4 h-4" />,
      handler: async (selectedIds: string[]) => {
        const batch = writeBatch(db);
        selectedIds.forEach((id) => {
          batch.update(doc(db, 'users', id), {
            isActive: true,
            updatedAt: new Date(),
          });
        });
        await batch.commit();

        // Send notifications
        const promises = selectedIds.map((id) =>
          notificationService.sendToUser(id, {
            type: 'system',
            title: 'Account Activated',
            description: 'Your account has been activated',
            priority: 'high',
          })
        );
        await Promise.all(promises);
      },
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: <Ban className="w-4 h-4" />,
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationMessage:
        'Are you sure you want to deactivate these users? They will not be able to access their accounts.',
      handler: async (selectedIds: string[]) => {
        const batch = writeBatch(db);
        selectedIds.forEach((id) => {
          batch.update(doc(db, 'users', id), {
            isActive: false,
            updatedAt: new Date(),
          });
        });
        await batch.commit();

        // Send notifications
        const promises = selectedIds.map((id) =>
          notificationService.sendToUser(id, {
            type: 'system',
            title: 'Account Deactivated',
            description: 'Your account has been deactivated',
            priority: 'high',
          })
        );
        await Promise.all(promises);
      },
    },
    {
      id: 'send-notification',
      label: 'Send Notification',
      icon: <Send className="w-4 h-4" />,
      handler: async (selectedIds: string[]) => {
        // This would open a dialog to compose a notification
        toast({
          title: 'Bulk notification',
          description: `Ready to send notification to ${selectedIds.length} users.`,
        });
      },
    },
    {
      id: 'generate-avatars',
      label: 'Generate Avatars',
      icon: <UserPlus className="w-4 h-4" />,
      handler: generateAvatarsForUsers,
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: <Download className="w-4 h-4" />,
      handler: async (selectedIds: string[]) => {
        const selectedUsers = users.filter((u) => selectedIds.includes(u.uid));
        // Export logic here
        toast({
          title: 'Export completed',
          description: `Exported ${selectedUsers.length} users.`,
        });
      },
    },
  ];

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [currentUser, isAdmin, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'consultant':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'client':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'guest':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'login':
        return <Key className="w-4 h-4 text-green-500" />;
      case 'logout':
        return <Key className="w-4 h-4 text-gray-500" />;
      case 'profile_update':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'project_created':
        return <Briefcase className="w-4 h-4 text-purple-500" />;
      case 'quote_submitted':
        return <FileText className="w-4 h-4 text-orange" />;
      case 'payment_made':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8 mt-20">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-white/60">Manage user accounts, roles, and permissions</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Total Users</p>
                    <p className="text-2xl font-bold text-white">{totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Active Users</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter((u) => u.isActive).length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Verified Users</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter((u) => u.isVerified).length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">New This Month</p>
                    <p className="text-2xl font-bold text-white">
                      {
                        users.filter((u) => {
                          const oneMonthAgo = new Date();
                          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                          return u.createdAt > oneMonthAgo;
                        }).length
                      }
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search users..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
                <Select
                  value={filters.role}
                  onValueChange={(value) => setFilters({ ...filters, role: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setShowExportDialog(true)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const usersWithoutAvatar = users.filter(u => !u.photoURL).map(u => u.uid);
                      if (usersWithoutAvatar.length > 0) {
                        await generateAvatarsForUsers(usersWithoutAvatar);
                      } else {
                        toast({
                          title: 'All users have avatars',
                          description: 'No users need avatar generation',
                          type: 'info',
                        });
                      }
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Generate Avatars
                  </Button>
                  <Button
                    className="bg-orange hover:bg-orange/90"
                    onClick={() => router.push('/dashboard/admin/users/new')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List with Bulk Actions */}
          <UserBulkActions
            items={users}
            idField="uid"
            actions={bulkActions}
            renderItem={(user: User, isSelected: boolean, onToggle: () => void) => (
              <Card
                className={`bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer ${
                  isSelected ? 'ring-2 ring-orange' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={isSelected}
                        onChange={onToggle}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={user.photoURL || ''}
                          alt={user.displayName || user.email}
                        />
                        <AvatarFallback className="bg-orange/20 text-orange">
                          {user.displayName?.charAt(0) || user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1" onClick={() => handleUserSelect(user)}>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">
                            {user.displayName || 'Unnamed User'}
                          </h3>
                          <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                          {user.isActive ? (
                            <Badge variant="outline" className="text-green-500 border-green-500/30">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-500 border-red-500/30">
                              Inactive
                            </Badge>
                          )}
                          {user.isVerified && (
                            <Tooltip>
                              <TooltipTrigger>
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Verified Account</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                          {user.company && (
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {user.company}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {formatDistanceToNow(user.createdAt)} ago
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUserSelect(user)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserDetails(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setShowSendNotification(true);
                            }}
                          >
                            <Bell className="w-4 h-4 mr-2" />
                            Send Notification
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => toggleUserStatus(user.uid, user.isActive)}
                            className={user.isActive ? 'text-red-500' : 'text-green-500'}
                          >
                            {user.isActive ? (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          />

          {/* Pagination */}
          {totalUsers > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-white/60">
                Page {page} of {Math.ceil(totalUsers / ITEMS_PER_PAGE)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* User Details Sheet */}
        <Sheet open={showUserDetails} onOpenChange={setShowUserDetails}>
          <SheetContent className="bg-black/95 border-white/20 text-white w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-white">
                {editingUser ? 'Edit User' : 'User Details'}
              </SheetTitle>
              <SheetDescription className="text-white/60">
                {editingUser
                  ? 'Update user information and settings'
                  : 'View detailed user information and activity'}
              </SheetDescription>
            </SheetHeader>

            {(selectedUser || editingUser) && (
              <div className="mt-6 space-y-6">
                {/* User Profile */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={(editingUser || selectedUser)?.photoURL || ''}
                      alt={
                        (editingUser || selectedUser)?.displayName ||
                        (editingUser || selectedUser)?.email ||
                        'User'
                      }
                    />
                    <AvatarFallback className="bg-orange/20 text-orange text-2xl">
                      {(editingUser || selectedUser)?.displayName?.charAt(0) ||
                        (editingUser || selectedUser)?.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {editingUser ? (
                      <Input
                        value={editingUser.displayName}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, displayName: e.target.value })
                        }
                        className="bg-white/5 border-white/10 text-white text-xl font-semibold mb-2"
                      />
                    ) : (
                      <h3 className="text-xl font-semibold text-white">
                        {selectedUser?.displayName || 'Unnamed User'}
                      </h3>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getRoleBadgeColor((editingUser || selectedUser)!.role)}
                      >
                        {(editingUser || selectedUser)!.role}
                      </Badge>
                      {(editingUser || selectedUser)!.isActive ? (
                        <Badge variant="outline" className="text-green-500 border-green-500/30">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-500 border-red-500/30">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Tabs */}
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="bg-white/5">
                    <TabsTrigger value="info">Information</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                  </TabsList>

                  {/* Information Tab */}
                  <TabsContent value="info" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/60">Email</Label>
                        {editingUser ? (
                          <Input
                            value={editingUser.email}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, email: e.target.value })
                            }
                            className="bg-white/5 border-white/10 text-white"
                          />
                        ) : (
                          <p className="text-white">{selectedUser?.email}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white/60">Phone</Label>
                        {editingUser ? (
                          <Input
                            value={editingUser.phoneNumber || ''}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, phoneNumber: e.target.value })
                            }
                            className="bg-white/5 border-white/10 text-white"
                          />
                        ) : (
                          <p className="text-white">
                            {selectedUser?.phoneNumber || 'Not provided'}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white/60">First Name</Label>
                        {editingUser ? (
                          <Input
                            value={editingUser.firstName}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, firstName: e.target.value })
                            }
                            className="bg-white/5 border-white/10 text-white"
                          />
                        ) : (
                          <p className="text-white">{selectedUser?.firstName || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white/60">Last Name</Label>
                        {editingUser ? (
                          <Input
                            value={editingUser.lastName}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, lastName: e.target.value })
                            }
                            className="bg-white/5 border-white/10 text-white"
                          />
                        ) : (
                          <p className="text-white">{selectedUser?.lastName || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white/60">Company</Label>
                        {editingUser ? (
                          <Input
                            value={editingUser.company || ''}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, company: e.target.value })
                            }
                            className="bg-white/5 border-white/10 text-white"
                          />
                        ) : (
                          <p className="text-white">{selectedUser?.company || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white/60">Job Title</Label>
                        {editingUser ? (
                          <Input
                            value={editingUser.jobTitle || ''}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, jobTitle: e.target.value })
                            }
                            className="bg-white/5 border-white/10 text-white"
                          />
                        ) : (
                          <p className="text-white">{selectedUser?.jobTitle || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/60">Role</Label>
                        {editingUser ? (
                          <Select
                            value={editingUser.role}
                            onValueChange={(value) =>
                              setEditingUser({ ...editingUser, role: value as UserRole })
                            }
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="consultant">Consultant</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="guest">Guest</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-white capitalize">{selectedUser?.role}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white/60">Account Type</Label>
                        {editingUser ? (
                          <Select
                            value={editingUser.accountType || 'customer'}
                            onValueChange={(value) =>
                              setEditingUser({ ...editingUser, accountType: value as any })
                            }
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="guest">Guest</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-white capitalize">
                            {selectedUser?.accountType || 'customer'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Account Active</Label>
                          <p className="text-sm text-white/60">User can access the platform</p>
                        </div>
                        {editingUser ? (
                          <Switch
                            checked={editingUser.isActive}
                            onCheckedChange={(checked) =>
                              setEditingUser({ ...editingUser, isActive: checked })
                            }
                          />
                        ) : (
                          <Badge variant={selectedUser?.isActive ? 'default' : 'secondary'}>
                            {selectedUser?.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Email Verified</Label>
                          <p className="text-sm text-white/60">
                            User has verified their email address
                          </p>
                        </div>
                        <Badge variant={selectedUser?.isVerified ? 'default' : 'secondary'}>
                          {selectedUser?.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-3">
                      <div>
                        <Label className="text-white/60">Created At</Label>
                        <p className="text-white">
                          {format((editingUser || selectedUser)!.createdAt, 'PPpp')}
                        </p>
                      </div>
                      <div>
                        <Label className="text-white/60">Last Login</Label>
                        <p className="text-white">
                          {format((editingUser || selectedUser)!.lastLoginAt, 'PPpp')}
                        </p>
                      </div>
                      <div>
                        <Label className="text-white/60">Last Activity</Label>
                        <p className="text-white">
                          {formatDistanceToNow((editingUser || selectedUser)!.lastActivityAt)} ago
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="mt-4">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {userActivities.length > 0 ? (
                          userActivities.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                            >
                              {getActivityIcon(activity.type)}
                              <div className="flex-1">
                                <p className="text-white text-sm">{activity.description}</p>
                                <p className="text-white/40 text-xs mt-1">
                                  {formatDistanceToNow(activity.timestamp)} ago
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-white/60 text-center py-8">No activity recorded</p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <div>
                      <h4 className="text-white font-medium mb-3">Notification Preferences</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-notif" className="text-white/80">
                            Email Notifications
                          </Label>
                          <Switch
                            id="email-notif"
                            checked={(editingUser || selectedUser)?.preferences.notifications.email}
                            disabled={!editingUser}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-notif" className="text-white/80">
                            Push Notifications
                          </Label>
                          <Switch
                            id="push-notif"
                            checked={(editingUser || selectedUser)?.preferences.notifications.push}
                            disabled={!editingUser}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sms-notif" className="text-white/80">
                            SMS Notifications
                          </Label>
                          <Switch
                            id="sms-notif"
                            checked={(editingUser || selectedUser)?.preferences.notifications.sms}
                            disabled={!editingUser}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div>
                      <h4 className="text-white font-medium mb-3">Preferences</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/60">Language</Label>
                          <p className="text-white">
                            {(editingUser || selectedUser)?.preferences.language || 'en'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-white/60">Timezone</Label>
                          <p className="text-white">
                            {(editingUser || selectedUser)?.preferences.timezone}
                          </p>
                        </div>
                        <div>
                          <Label className="text-white/60">Theme</Label>
                          <p className="text-white capitalize">
                            {(editingUser || selectedUser)?.preferences.theme}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Statistics Tab */}
                  <TabsContent value="stats" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white/60">Projects</p>
                              <p className="text-2xl font-bold text-white">
                                {(editingUser || selectedUser)?.stats.projectsCount || 0}
                              </p>
                            </div>
                            <Briefcase className="w-8 h-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white/60">Consultations</p>
                              <p className="text-2xl font-bold text-white">
                                {(editingUser || selectedUser)?.stats.consultationsCount || 0}
                              </p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white/60">Messages</p>
                              <p className="text-2xl font-bold text-white">
                                {(editingUser || selectedUser)?.stats.messagesCount || 0}
                              </p>
                            </div>
                            <Mail className="w-8 h-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white/60">Total Spent</p>
                              <p className="text-2xl font-bold text-white">
                                €
                                {(
                                  (editingUser || selectedUser)?.stats.totalSpent || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                            <CreditCard className="w-8 h-8 text-orange" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Footer Actions */}
                {editingUser && (
                  <SheetFooter className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingUser(null);
                        setShowUserDetails(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button className="bg-orange hover:bg-orange/90" onClick={handleUserUpdate}>
                      Save Changes
                    </Button>
                  </SheetFooter>
                )}

                {!editingUser && selectedUser && (
                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingUser(selectedUser)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedUser(selectedUser);
                        setShowSendNotification(true);
                      }}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Send Notification
                    </Button>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Send Notification Dialog */}
        <Dialog open={showSendNotification} onOpenChange={setShowSendNotification}>
          <DialogContent className="bg-black/95 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Send Notification</DialogTitle>
              <DialogDescription className="text-white/60">
                Send a notification to {selectedUser?.displayName || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="notif-title" className="text-white">
                  Title
                </Label>
                <Input
                  id="notif-title"
                  value={notificationData.title}
                  onChange={(e) =>
                    setNotificationData({ ...notificationData, title: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Notification title"
                />
              </div>
              <div>
                <Label htmlFor="notif-message" className="text-white">
                  Message
                </Label>
                <Textarea
                  id="notif-message"
                  value={notificationData.message}
                  onChange={(e) =>
                    setNotificationData({ ...notificationData, message: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  placeholder="Notification message"
                />
              </div>
              <div>
                <Label htmlFor="notif-type" className="text-white">
                  Type
                </Label>
                <Select
                  value={notificationData.type}
                  onValueChange={(value) =>
                    setNotificationData({ ...notificationData, type: value as any })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notif-link" className="text-white">
                  Link (optional)
                </Label>
                <Input
                  id="notif-link"
                  value={notificationData.link}
                  onChange={(e) =>
                    setNotificationData({ ...notificationData, link: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendNotification(false)}>
                Cancel
              </Button>
              <Button
                className="bg-orange hover:bg-orange/90"
                onClick={handleSendNotification}
                disabled={!notificationData.title || !notificationData.message}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="bg-black/95 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Export User Data</DialogTitle>
              <DialogDescription className="text-white/60">
                Choose export format and options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-white">Format</Label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value) => setExportOptions({ ...exportOptions, format: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="export-personal" className="text-white">
                    Include Personal Data
                  </Label>
                  <Switch
                    id="export-personal"
                    checked={exportOptions.includePersonalData}
                    onCheckedChange={(checked) =>
                      setExportOptions({ ...exportOptions, includePersonalData: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="export-activity" className="text-white">
                    Include Activity Data
                  </Label>
                  <Switch
                    id="export-activity"
                    checked={exportOptions.includeActivityData}
                    onCheckedChange={(checked) =>
                      setExportOptions({ ...exportOptions, includeActivityData: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="export-stats" className="text-white">
                    Include Statistics
                  </Label>
                  <Switch
                    id="export-stats"
                    checked={exportOptions.includeStats}
                    onCheckedChange={(checked) =>
                      setExportOptions({ ...exportOptions, includeStats: checked })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-orange hover:bg-orange/90"
                onClick={handleExportUsers}
                disabled={processingExport}
              >
                {processingExport ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  );
}
