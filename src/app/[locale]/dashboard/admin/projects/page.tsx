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
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Archive,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  XCircle,
  Timer,
  ArrowUpDown,
  UserPlus,
  Mail,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { format, formatDistanceToNow } from 'date-fns';
import { BulkActions, useBulkSelection } from '@/components/admin/BulkActions';
import type { BulkActionType } from '@/components/admin/BulkActions';
import { notificationService } from '@/services/notificationService';
import { Checkbox } from '@/components/ui/checkbox';

interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  type: string;
  assignedTo?: string[];
  startDate: Date;
  endDate?: Date;
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  progress: number;
  milestones: any[];
  services: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', email: 'john@groeimetai.nl', role: 'Developer' },
  { id: '2', name: 'Jane Smith', email: 'jane@groeimetai.nl', role: 'Designer' },
  { id: '3', name: 'Mike Johnson', email: 'mike@groeimetai.nl', role: 'Project Manager' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@groeimetai.nl', role: 'Marketing' },
];

export default function AdminProjectsPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { selectedIds, setSelectedIds, toggleSelection, clearSelection } =
    useBulkSelection(projects);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Fetch projects
  useEffect(() => {
    if (!user || !isAdmin) return;

    setIsLoading(true);
    
    // First, get all user data for client information
    const fetchUsersData = async () => {
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersMap = new Map();
      usersSnapshot.forEach((doc) => {
        usersMap.set(doc.id, doc.data());
      });
      return usersMap;
    };

    fetchUsersData().then((usersMap) => {
      const unsubscribes: (() => void)[] = [];
      const allProjects: { [key: string]: Project } = {};

      // Listen to projects collection
      const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const unsubscribeProjects = onSnapshot(
        projectsQuery,
        (snapshot) => {
          snapshot.forEach((doc) => {
            const data = doc.data();
            const clientData = usersMap.get(data.clientId || data.userId);

            allProjects[doc.id] = {
              id: doc.id,
              name: data.name || data.projectName || 'Untitled Project',
              clientId: data.clientId || data.userId || '',
              clientName: clientData?.displayName || clientData?.fullName || 'Unknown Client',
              clientEmail: clientData?.email || '',
              status: data.status || 'active',
              type: data.type || 'consultation',
              assignedTo: data.assignedTo || [],
              startDate: data.startDate?.toDate() || data.createdAt?.toDate() || new Date(),
              endDate: data.endDate?.toDate(),
              budget: data.budget || {
                amount: 0,
                currency: 'EUR',
                type: 'fixed',
              },
              progress: data.progress || 0,
              milestones: data.milestones || [],
              services: data.services || data.technologies || [],
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            };
          });

          // Also listen to approved quotes (which are projects)
          const quotesQuery = query(
            collection(db, 'quotes'),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc')
          );
          
          const unsubscribeQuotes = onSnapshot(
            quotesQuery,
            (quotesSnapshot) => {
              quotesSnapshot.forEach((doc) => {
                const data = doc.data();
                const clientData = usersMap.get(data.userId);

                // Only add if not already in projects collection
                if (!allProjects[doc.id]) {
                  allProjects[doc.id] = {
                    id: doc.id,
                    name: data.projectName || 'Untitled Project',
                    clientId: data.userId || '',
                    clientName: data.fullName || data.userName || clientData?.displayName || 'Unknown Client',
                    clientEmail: data.email || clientData?.email || '',
                    status: 'active',
                    type: data.projectType || 'consultation',
                    assignedTo: [],
                    startDate: data.startDate?.toDate() || data.createdAt?.toDate() || new Date(),
                    endDate: data.endDate?.toDate(),
                    budget: data.budget || {
                      amount: 0,
                      currency: 'EUR',
                      type: 'fixed',
                    },
                    progress: 0,
                    milestones: data.milestones || [],
                    services: data.services || [],
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                  };
                }
              });

              // Update projects state
              setProjects(Object.values(allProjects));
              setIsLoading(false);
            },
            (error) => {
              console.error('Error listening to quotes:', error);
              setIsLoading(false);
            }
          );
          
          unsubscribes.push(unsubscribeQuotes);
        },
        (error) => {
          console.error('Error listening to projects:', error);
          setIsLoading(false);
        }
      );

      unsubscribes.push(unsubscribeProjects);

      // Cleanup function
      return () => {
        unsubscribes.forEach(unsubscribe => unsubscribe());
      };
    });
  }, [user, isAdmin]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        if (
          !project.name.toLowerCase().includes(search) &&
          !project.clientName?.toLowerCase().includes(search) &&
          !project.services.some((s) => s.toLowerCase().includes(search))
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        const projectDate = project.startDate;
        const daysDiff = Math.floor(
          (now.getTime() - projectDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dateFilter === '7days' && daysDiff > 7) return false;
        if (dateFilter === '30days' && daysDiff > 30) return false;
        if (dateFilter === '90days' && daysDiff > 90) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'client':
          compareValue = (a.clientName || '').localeCompare(b.clientName || '');
          break;
        case 'startDate':
          compareValue = a.startDate.getTime() - b.startDate.getTime();
          break;
        case 'budget':
          compareValue = a.budget.amount - b.budget.amount;
          break;
        case 'progress':
          compareValue = a.progress - b.progress;
          break;
        default:
          compareValue = a.createdAt.getTime() - b.createdAt.getTime();
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  // Handle bulk actions
  const handleBulkAction = async (action: BulkActionType, data?: any) => {
    try {
      switch (action) {
        case 'delete':
          for (const projectId of data.ids) {
            await deleteDoc(doc(db, 'projects', projectId));
          }
          setProjects(projects.filter((p) => !data.ids.includes(p.id)));
          break;

        case 'updateStatus':
          for (const projectId of data.ids) {
            await updateDoc(doc(db, 'projects', projectId), {
              status: data.status,
              updatedAt: Timestamp.now(),
            });
          }
          setProjects(
            projects.map((p) => (data.ids.includes(p.id) ? { ...p, status: data.status } : p))
          );
          break;

        case 'export':
          const selectedProjects = projects.filter((p) => data.ids.includes(p.id));
          const csv = [
            [
              'ID',
              'Project Name',
              'Client',
              'Email',
              'Status',
              'Type',
              'Budget',
              'Progress',
              'Start Date',
              'Services',
            ],
            ...selectedProjects.map((p) => [
              p.id,
              p.name,
              p.clientName || '',
              p.clientEmail || '',
              p.status,
              p.type,
              `${p.budget.currency} ${p.budget.amount}`,
              `${p.progress}%`,
              format(p.startDate, 'yyyy-MM-dd'),
              p.services.join(', '),
            ]),
          ]
            .map((row) => row.join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          break;

        case 'archive':
          for (const projectId of data.ids) {
            await updateDoc(doc(db, 'projects', projectId), {
              status: 'cancelled',
              archivedAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
          }
          setProjects(
            projects.map((p) => (data.ids.includes(p.id) ? { ...p, status: 'cancelled' } : p))
          );
          break;
      }

      clearSelection();
    } catch (error) {
      console.error('Error executing bulk action:', error);
    }
  };

  // Update project status
  const updateProjectStatus = async (projectId: string, newStatus: Project['status']) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      setProjects(projects.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)));

      // Send notification
      const project = projects.find((p) => p.id === projectId);
      if (project?.clientId) {
        await notificationService.sendToUser(
          project.clientId,
          notificationService.templates.projectUpdate(
            project.name,
            `Status changed to ${newStatus}`
          )
        );
      }
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  // Assign team members
  const assignTeamMembers = async () => {
    if (!selectedProject) return;

    try {
      await updateDoc(doc(db, 'projects', selectedProject.id), {
        assignedTo: selectedTeamMembers,
        updatedAt: Timestamp.now(),
      });

      setProjects(
        projects.map((p) =>
          p.id === selectedProject.id ? { ...p, assignedTo: selectedTeamMembers } : p
        )
      );

      setIsAssignDialogOpen(false);
      setSelectedTeamMembers([]);
    } catch (error) {
      console.error('Error assigning team members:', error);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return Timer;
      case 'completed':
        return CheckCircle;
      case 'on_hold':
        return Clock;
      case 'cancelled':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const toggleRowExpansion = (projectId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
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

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    totalRevenue: projects.reduce((sum, p) => sum + (p.budget.amount || 0), 0),
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Projects Management</h1>
          <p className="text-white/60">Manage all projects across all clients</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Total Projects</span>
                <Briefcase className="w-5 h-5 text-white/40" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Active Projects</span>
                <Timer className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Completed</span>
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Total Revenue</span>
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                €{stats.totalRevenue.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Search projects, clients, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="name">Project Name</SelectItem>
                  <SelectItem value="client">Client Name</SelectItem>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        <BulkActions
          items={filteredProjects}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onAction={handleBulkAction}
          actions={['updateStatus', 'export', 'archive', 'delete']}
          statusOptions={[
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />

        {/* Projects Table */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin h-8 w-8 text-orange mx-auto mb-4" />
                <p className="text-white/60">Loading projects...</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="w-12 text-white/60">
                      <Checkbox
                        checked={
                          selectedIds.size === filteredProjects.length &&
                          filteredProjects.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(filteredProjects.map((p) => p.id)));
                          } else {
                            clearSelection();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="text-white/60">Project</TableHead>
                    <TableHead className="text-white/60">Client</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Team</TableHead>
                    <TableHead className="text-white/60">Progress</TableHead>
                    <TableHead className="text-white/60">Budget</TableHead>
                    <TableHead className="text-white/60">Timeline</TableHead>
                    <TableHead className="text-right text-white/60">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => {
                    const StatusIcon = getStatusIcon(project.status);
                    const isExpanded = expandedRows.has(project.id);

                    return (
                      <>
                        <TableRow key={project.id} className="border-white/10">
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(project.id)}
                              onChange={() => toggleSelection(project.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-auto"
                                onClick={() => toggleRowExpansion(project.id)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-white/40" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-white/40" />
                                )}
                              </Button>
                              <div>
                                <p className="font-medium text-white">{project.name}</p>
                                <p className="text-sm text-white/60">{project.type}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-white">{project.clientName}</p>
                              <p className="text-sm text-white/60">{project.clientEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(project.status)} bg-opacity-20 border-0`}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {project.assignedTo && project.assignedTo.length > 0 ? (
                                <>
                                  <div className="flex -space-x-2">
                                    {project.assignedTo.slice(0, 3).map((memberId, idx) => {
                                      const member = mockTeamMembers.find((m) => m.id === memberId);
                                      return (
                                        <div
                                          key={idx}
                                          className="w-8 h-8 rounded-full bg-orange/20 border-2 border-black flex items-center justify-center"
                                          title={member?.name}
                                        >
                                          <span className="text-xs text-white">
                                            {member?.name
                                              .split(' ')
                                              .map((n) => n[0])
                                              .join('')}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {project.assignedTo.length > 3 && (
                                    <span className="text-xs text-white/60">
                                      +{project.assignedTo.length - 3}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-white/40 text-sm">Unassigned</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Progress value={project.progress} className="h-2 mb-1" />
                              <span className="text-xs text-white/60">{project.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-white">
                                {project.budget.currency} {project.budget.amount.toLocaleString()}
                              </p>
                              <p className="text-xs text-white/60">{project.budget.type}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-white">
                                {format(project.startDate, 'MMM d, yyyy')}
                              </p>
                              {project.endDate && (
                                <p className="text-xs text-white/60">
                                  to {format(project.endDate, 'MMM d, yyyy')}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/dashboard/admin/projects/${project.id}`)
                                  }
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setSelectedTeamMembers(project.assignedTo || []);
                                    setIsAssignDialogOpen(true);
                                  }}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Assign Team
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {project.status !== 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => updateProjectStatus(project.id, 'active')}
                                  >
                                    <Timer className="w-4 h-4 mr-2" />
                                    Set Active
                                  </DropdownMenuItem>
                                )}
                                {project.status !== 'on_hold' && (
                                  <DropdownMenuItem
                                    onClick={() => updateProjectStatus(project.id, 'on_hold')}
                                  >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Put On Hold
                                  </DropdownMenuItem>
                                )}
                                {project.status !== 'completed' && (
                                  <DropdownMenuItem
                                    onClick={() => updateProjectStatus(project.id, 'completed')}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleBulkAction('archive', { ids: [project.id] })}
                                  className="text-yellow-500"
                                >
                                  <Archive className="w-4 h-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleBulkAction('delete', { ids: [project.id] })}
                                  className="text-red-500"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-white/[0.02] border-white/10">
                              <div className="p-4 space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium text-white mb-2">Services</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {project.services.map((service, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                {project.milestones.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-white mb-2">
                                      Milestones
                                    </h4>
                                    <div className="space-y-2">
                                      {project.milestones.map((milestone, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                          <div
                                            className={`w-2 h-2 rounded-full ${
                                              milestone.completed ? 'bg-green-500' : 'bg-white/20'
                                            }`}
                                          />
                                          <span className="text-sm text-white/80">
                                            {milestone.name}
                                          </span>
                                          {milestone.dueDate && (
                                            <span className="text-xs text-white/60">
                                              Due {format(milestone.dueDate.toDate(), 'MMM d')}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center gap-4 text-xs text-white/60">
                                  <span>Created {formatDistanceToNow(project.createdAt)} ago</span>
                                  <span>•</span>
                                  <span>Updated {formatDistanceToNow(project.updatedAt)} ago</span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No projects found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assign Team Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Assign Team Members</DialogTitle>
              <DialogDescription className="text-white/60">
                Select team members to assign to {selectedProject?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {mockTeamMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/5"
                >
                  <Checkbox
                    checked={selectedTeamMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTeamMembers([...selectedTeamMembers, member.id]);
                      } else {
                        setSelectedTeamMembers(
                          selectedTeamMembers.filter((id) => id !== member.id)
                        );
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-sm text-white/60">
                      {member.role} • {member.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={assignTeamMembers} className="bg-orange hover:bg-orange/90">
                Assign Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
