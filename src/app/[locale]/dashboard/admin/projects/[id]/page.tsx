'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  Circle,
  AlertCircle,
  Loader2,
  MessageSquare,
  Briefcase,
  Download,
  Upload,
  Target,
  GitBranch,
  AlertTriangle,
  TrendingUp,
  History,
  Link as LinkIcon,
  Edit,
  PlusCircle,
  Trash2,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  UserCheck,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@/i18n/routing';
import { firestoreProjectService as projectService } from '@/services/firestore/projects';
import { Project, ProjectStatus, ProjectPriority } from '@/types';
import { format } from 'date-fns';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot, updateDoc, deleteDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const projectId = params.id as string;

  // Subscribe to real-time project updates
  useEffect(() => {
    if (!user || !projectId || user.role !== 'admin') return;

    setIsLoading(true);
    setError(null);

    // Try both collections since projects can be stored in either
    const quoteRef = doc(db, 'quotes', projectId);
    const projectRef = doc(db, 'projects', projectId);

    let unsubscribeQuote: (() => void) | undefined;
    let unsubscribeProject: (() => void) | undefined;
    let unsubscribeTimeline: (() => void) | undefined;

    // Listen to quotes collection first
    unsubscribeQuote = onSnapshot(
      quoteRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          // Transform quote data to project format
          const getProjectStatus = (quoteStatus: string): ProjectStatus => {
            switch (quoteStatus) {
              case 'pending':
              case 'reviewed':
                return 'pending_approval';
              case 'approved':
                return 'active';
              case 'rejected':
                return 'cancelled';
              default:
                return 'draft';
            }
          };

          const transformedProject: Project = {
            id: docSnapshot.id,
            name: data.projectName || 'Untitled Project',
            description: data.projectDescription || '',
            status: getProjectStatus(data.status),
            priority: 'medium' as ProjectPriority,
            progress: data.progress || 0,
            startDate: data.startDate?.toDate() || new Date(),
            endDate: data.endDate?.toDate() || null,
            clientId: data.userId || '',
            clientName: data.fullName || '',
            clientEmail: data.email || '',
            clientPhone: data.phone || '',
            clientCompany: data.companyName || '',
            budget: {
              amount: parseFloat(data.budget) || 0,
              currency: 'USD',
              type: 'fixed',
            },
            assignedTo: data.assignedTo || [],
            tags: data.tags || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            quoteData: data,
            isFromQuote: true,
          };

          setProject(transformedProject);
          setAdminNotes(data.adminNotes || '');
          setIsLoading(false);

          // Subscribe to timeline updates
          const timelineRef = doc(db, 'projectTimelines', projectId);
          unsubscribeTimeline = onSnapshot(timelineRef, (timelineDoc) => {
            if (timelineDoc.exists()) {
              setTimelineData(timelineDoc.data());
            }
          });
        } else {
          // Try projects collection if not found in quotes
          unsubscribeProject = onSnapshot(
            projectRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setProject({
                  id: docSnapshot.id,
                  ...data,
                  createdAt: data.createdAt?.toDate() || new Date(),
                  updatedAt: data.updatedAt?.toDate() || new Date(),
                  startDate: data.startDate?.toDate() || new Date(),
                  endDate: data.endDate?.toDate() || null,
                } as Project);
                setAdminNotes(data.adminNotes || '');
                setIsLoading(false);
              } else {
                setError('Project not found');
                setIsLoading(false);
              }
            },
            (error) => {
              console.error('Error fetching project:', error);
              setError('Failed to load project');
              setIsLoading(false);
            }
          );
        }
      },
      (error) => {
        console.error('Error fetching quote:', error);
        setError('Failed to load project');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeQuote?.();
      unsubscribeProject?.();
      unsubscribeTimeline?.();
    };
  }, [user, projectId]);

  const updateProjectStatus = async (newStatus: ProjectStatus) => {
    if (!project) return;

    setIsUpdating(true);
    try {
      const docRef = project.isFromQuote 
        ? doc(db, 'quotes', projectId)
        : doc(db, 'projects', projectId);

      // Map project status back to quote status if needed
      const getQuoteStatus = (projectStatus: ProjectStatus): string => {
        switch (projectStatus) {
          case 'pending_approval':
            return 'pending';
          case 'active':
            return 'approved';
          case 'cancelled':
            return 'rejected';
          default:
            return 'pending';
        }
      };

      const updateData = project.isFromQuote
        ? { status: getQuoteStatus(newStatus), updatedAt: serverTimestamp() }
        : { status: newStatus, updatedAt: serverTimestamp() };

      await updateDoc(docRef, updateData);

      // Create notification for the client
      await addDoc(collection(db, 'notifications'), {
        userId: project.clientId,
        type: 'project_status_update',
        title: 'Project Status Updated',
        message: `Your project "${project.name}" status has been updated to ${newStatus}`,
        createdAt: serverTimestamp(),
        read: false,
        projectId: projectId,
      });

      toast.success(`Project status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
    } finally {
      setIsUpdating(false);
    }
  };

  const saveAdminNotes = async () => {
    if (!project) return;

    setIsUpdating(true);
    try {
      const docRef = project.isFromQuote 
        ? doc(db, 'quotes', projectId)
        : doc(db, 'projects', projectId);

      await updateDoc(docRef, {
        adminNotes,
        updatedAt: serverTimestamp(),
      });

      toast.success('Admin notes saved');
    } catch (error) {
      console.error('Error saving admin notes:', error);
      toast.error('Failed to save admin notes');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteProject = async () => {
    if (!project) return;

    setIsUpdating(true);
    try {
      const docRef = project.isFromQuote 
        ? doc(db, 'quotes', projectId)
        : doc(db, 'projects', projectId);

      await deleteDoc(docRef);
      
      toast.success('Project deleted successfully');
      router.push('/dashboard/admin/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsUpdating(false);
      setShowDeleteDialog(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg text-red-500">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/dashboard/admin/projects')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'pending_approval':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/admin/projects')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">Admin View</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/dashboard/messages?projectId=${projectId}`)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = `mailto:${project.clientEmail}`}>
              <Mail className="w-4 h-4 mr-2" />
              Email Client
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status and Priority */}
      <div className="flex items-center gap-4 mb-6">
        <Badge className={`${getStatusColor(project.status)} text-white`}>
          {project.status.replace('_', ' ').toUpperCase()}
        </Badge>
        <Badge variant="outline" className={getPriorityColor(project.priority)}>
          {project.priority} priority
        </Badge>
        {project.isFromQuote && (
          <Badge variant="secondary">
            <FileText className="w-3 h-3 mr-1" />
            From Quote
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-muted-foreground mt-1">{project.description || 'No description provided'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <p className="text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {format(project.startDate, 'MMM d, yyyy')}
                  </p>
                </div>
                {project.endDate && (
                  <div>
                    <Label>End Date</Label>
                    <p className="text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {format(project.endDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label>Budget</Label>
                <p className="text-2xl font-bold mt-1">
                  {project.budget?.currency || 'USD'} {project.budget?.amount?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">{project.budget?.type || 'Fixed'} budget</p>
              </div>

              <div>
                <Label>Progress</Label>
                <div className="mt-2">
                  <Progress value={project.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">{project.progress}% complete</p>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <Label>Update Status</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={project.status === 'active' ? 'default' : 'outline'}
                    onClick={() => updateProjectStatus('active')}
                    disabled={isUpdating}
                  >
                    Active
                  </Button>
                  <Button
                    size="sm"
                    variant={project.status === 'on_hold' ? 'default' : 'outline'}
                    onClick={() => updateProjectStatus('on_hold')}
                    disabled={isUpdating}
                  >
                    On Hold
                  </Button>
                  <Button
                    size="sm"
                    variant={project.status === 'completed' ? 'default' : 'outline'}
                    onClick={() => updateProjectStatus('completed')}
                    disabled={isUpdating}
                  >
                    Completed
                  </Button>
                  <Button
                    size="sm"
                    variant={project.status === 'cancelled' ? 'default' : 'outline'}
                    onClick={() => updateProjectStatus('cancelled')}
                    disabled={isUpdating}
                  >
                    Cancelled
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this project..."
                className="min-h-[150px]"
              />
              <Button 
                onClick={saveAdminNotes} 
                className="mt-4"
                disabled={isUpdating}
              >
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Client Info */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="text-muted-foreground mt-1">{project.clientName}</p>
              </div>
              
              <div>
                <Label>Email</Label>
                <a href={`mailto:${project.clientEmail}`} className="text-orange hover:underline mt-1 block">
                  {project.clientEmail}
                </a>
              </div>

              {project.clientPhone && (
                <div>
                  <Label>Phone</Label>
                  <p className="text-muted-foreground mt-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {project.clientPhone}
                  </p>
                </div>
              )}

              {project.clientCompany && (
                <div>
                  <Label>Company</Label>
                  <p className="text-muted-foreground mt-1">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    {project.clientCompany}
                  </p>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/admin/users/${project.clientId}`)}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  View User Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/messages?userId=${project.clientId}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          {timelineData && (
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timelineData.stages?.map((stage: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      {stage.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <p className={stage.completed ? 'line-through text-muted-foreground' : ''}>
                          {stage.name}
                        </p>
                        {stage.completedAt && (
                          <p className="text-xs text-muted-foreground">
                            {format(stage.completedAt.toDate(), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "{project.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteProject}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}