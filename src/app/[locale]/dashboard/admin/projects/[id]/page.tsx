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
  Rocket,
  Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@/i18n/routing';
import { firestoreProjectService as projectService } from '@/services/firestore/projects';
import { Project, ProjectStatus, ProjectPriority, ProjectType } from '@/types';
import { KanbanBoard } from '@/components/tasks';
import { format } from 'date-fns';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot, updateDoc, deleteDoc, collection, query, where, getDocs, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [editingTimeline, setEditingTimeline] = useState(false);
  const [timelineStages, setTimelineStages] = useState<any[]>([]);
  const [isSavingTimeline, setIsSavingTimeline] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; avatar?: string }>>([]);

  // Default timeline stages structure
  interface TimelineStage {
    id: number;
    name: string;
    icon: string;
    status: 'upcoming' | 'current' | 'completed';
    description: string;
    progress?: number;
    completedAt?: Date | any;
  }
  
  const defaultStages: TimelineStage[] = [
    {
      id: 1,
      name: 'Approval',
      icon: 'shield',
      status: 'upcoming',
      description: 'Awaiting admin approval',
    },
    {
      id: 2,
      name: 'Discovery',
      icon: 'briefcase',
      status: 'upcoming',
      description: 'Understanding your needs',
    },
    {
      id: 3,
      name: 'Planning',
      icon: 'target',
      status: 'upcoming',
      description: 'Defining project scope',
    },
    {
      id: 4,
      name: 'Development',
      icon: 'rocket',
      status: 'upcoming',
      description: 'Building your solution',
    },
    {
      id: 5,
      name: 'Delivery',
      icon: 'flag',
      status: 'upcoming',
      description: 'Final implementation',
    },
  ];

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
            type: 'consultation' as ProjectType,
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
            consultantId: data.consultantId || '',
            teamIds: data.teamIds || [],
            assignedTo: data.assignedTo || [],
            estimatedHours: data.estimatedHours || 0,
            actualHours: data.actualHours || 0,
            budget: {
              amount: parseFloat(data.budget) || 0,
              currency: 'USD',
              type: 'fixed',
            },
            milestones: data.milestones || [],
            tags: data.tags || [],
            categories: data.categories || [],
            technologies: data.technologies || [],
            documentIds: data.documentIds || [],
            meetingIds: data.meetingIds || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            createdBy: data.createdBy || data.userId || '',
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
              const data = timelineDoc.data();
              setTimelineData(data);
              setTimelineStages(data.stages || defaultStages);
            } else {
              // If no timeline data exists, use default stages
              // Initialize based on project status
              const initialStages = [...defaultStages];
              if (data.status === 'approved' || getProjectStatus(data.status) === 'active') {
                initialStages[0].status = 'completed';
                initialStages[0].progress = 100;
                initialStages[0].completedAt = data.updatedAt || new Date();
                initialStages[1].status = 'current';
                initialStages[1].progress = 0;
              }
              setTimelineStages(initialStages);
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

                // Subscribe to timeline updates for projects collection
                const timelineRef = doc(db, 'projectTimelines', projectId);
                unsubscribeTimeline = onSnapshot(timelineRef, (timelineDoc) => {
                  if (timelineDoc.exists()) {
                    const timelineData = timelineDoc.data();
                    setTimelineData(timelineData);
                    setTimelineStages(timelineData.stages || defaultStages);
                  } else {
                    // If no timeline data exists, use default stages
                    // Initialize based on project status
                    const initialStages = [...defaultStages];
                    if (data.status === 'active') {
                      initialStages[0].status = 'completed';
                      initialStages[0].progress = 100;
                      initialStages[0].completedAt = data.updatedAt || new Date();
                      initialStages[1].status = 'current';
                      initialStages[1].progress = 0;
                    }
                    setTimelineStages(initialStages);
                  }
                });
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

  // Fetch team members (admins and consultants)
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', 'in', ['admin', 'consultant']));
        const snapshot = await getDocs(q);
        const members = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().displayName || doc.data().email || 'Unknown',
          avatar: doc.data().photoURL,
        }));
        setTeamMembers(members);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    if (user) {
      fetchTeamMembers();
    }
  }, [user]);

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
        message: `Your project &quot;${project.name}&quot; status has been updated to ${newStatus}`,
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

  // Timeline management functions
  const updateTimelineStage = (stageId: number, updates: any) => {
    const newStages = [...timelineStages];
    const stageIndex = newStages.findIndex(s => s.id === stageId);
    
    if (stageIndex === -1) return;
    
    // Handle status updates
    if (updates.status) {
      // Reset all stages to upcoming if setting an earlier stage as current
      if (updates.status === 'current') {
        newStages.forEach((stage, idx) => {
          if (idx > stageIndex) {
            stage.status = 'upcoming';
            stage.progress = undefined;
            stage.completedAt = undefined;
          } else if (idx < stageIndex) {
            stage.status = 'completed';
            stage.progress = 100;
            if (!stage.completedAt) {
              stage.completedAt = new Date();
            }
          }
        });
      }
      
      // If marking as completed, update all previous stages
      if (updates.status === 'completed') {
        newStages.forEach((stage, idx) => {
          if (idx <= stageIndex) {
            stage.status = 'completed';
            stage.progress = 100;
            if (!stage.completedAt) {
              stage.completedAt = new Date();
            }
          }
        });
        
        // Set next stage as current if exists
        if (stageIndex < newStages.length - 1) {
          newStages[stageIndex + 1].status = 'current';
          newStages[stageIndex + 1].progress = 0;
        }
      }
    }
    
    // Apply the updates
    newStages[stageIndex] = { ...newStages[stageIndex], ...updates };
    
    setTimelineStages(newStages);
  };

  const saveTimeline = async () => {
    if (!project) return;

    setIsSavingTimeline(true);
    try {
      const timelineRef = doc(db, 'projectTimelines', projectId);
      
      // Calculate overall progress based on stages
      const completedStages = timelineStages.filter(stage => stage.completed).length;
      const overallProgress = timelineStages.length > 0 
        ? Math.round((completedStages / timelineStages.length) * 100)
        : 0;

      await setDoc(timelineRef, {
        projectId,
        stages: timelineStages,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid,
        overallProgress,
      }, { merge: true });

      // Update project progress if it's different
      if (project.progress !== overallProgress) {
        const projectRef = project.isFromQuote 
          ? doc(db, 'quotes', projectId)
          : doc(db, 'projects', projectId);
        
        await updateDoc(projectRef, {
          progress: overallProgress,
          updatedAt: serverTimestamp(),
        });
      }

      toast.success('Timeline updated successfully');
      setEditingTimeline(false);
    } catch (error) {
      console.error('Error saving timeline:', error);
      toast.error('Failed to save timeline');
    } finally {
      setIsSavingTimeline(false);
    }
  };

  const cancelTimelineEdit = () => {
    // Reset to original timeline data
    setTimelineStages(timelineData?.stages || defaultStages);
    setEditingTimeline(false);
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

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/5 mb-6">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="tasks">Taken</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
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

          {/* Deliverables Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Deliverables</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    // TODO: Add deliverable dialog
                    toast.success('Deliverable management coming soon');
                  }}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Deliverable
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project.milestones && project.milestones.length > 0 ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone) => (
                    <div key={milestone.id} className="border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{milestone.name}</h4>
                        <Badge
                          variant="outline"
                          className={
                            milestone.status === 'completed'
                              ? 'border-green-500 text-green-500'
                              : 'border-orange text-orange'
                          }
                        >
                          {milestone.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {milestone.deliverables?.map((deliverable, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {milestone.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-white/40" />
                            )}
                            <span className="text-white/80">{deliverable}</span>
                          </div>
                        )) || <p className="text-white/60 text-sm">No deliverables specified</p>}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // TODO: Edit deliverables
                            toast('Edit functionality coming soon');
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-400"
                          onClick={() => {
                            // TODO: Remove milestone
                            toast('Remove functionality coming soon');
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">No deliverables defined yet</p>
                  <p className="text-white/40 text-sm mt-1">
                    Add deliverables to track project milestones
                  </p>
                </div>
              )}
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
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {editingTimeline ? (
                <div className="space-y-4">
                  {timelineStages.map((stage) => {
                    // Map icon strings to components
                    const stageIcons = {
                      shield: Shield,
                      briefcase: Briefcase,
                      target: Target,
                      rocket: Rocket,
                      flag: Flag,
                    };
                    const StageIcon = stageIcons[stage.icon as keyof typeof stageIcons] || Briefcase;
                    
                    return (
                      <div key={stage.id} className="border border-white/10 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              stage.status === 'completed'
                                ? 'bg-green-500'
                                : stage.status === 'current'
                                  ? 'bg-orange'
                                  : 'bg-white/20'
                            }`}
                          >
                            {stage.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : stage.status === 'current' ? (
                              <Circle className="w-5 h-5 text-white animate-pulse" />
                            ) : (
                              <StageIcon className="w-5 h-5 text-white/60" />
                            )}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <h4 className="font-medium text-white">{stage.name}</h4>
                              <p className="text-sm text-white/60 mt-1">{stage.description}</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Label className="text-sm">Status:</Label>
                              <Select
                                value={stage.status}
                                onValueChange={(value) => updateTimelineStage(stage.id, { status: value })}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="upcoming">Upcoming</SelectItem>
                                  <SelectItem value="current">Current</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {stage.status === 'current' && (
                              <div className="flex items-center gap-3">
                                <Label className="text-sm">Progress:</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={stage.progress || 0}
                                  onChange={(e) => updateTimelineStage(stage.id, { progress: parseInt(e.target.value) || 0 })}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">%</span>
                                <Progress value={stage.progress || 0} className="flex-1 h-2" />
                              </div>
                            )}
                            
                            {stage.status === 'completed' && stage.completedAt && (
                              <p className="text-xs text-muted-foreground">
                                Completed: {stage.completedAt instanceof Date ? format(stage.completedAt, 'MMM d, yyyy') : format(stage.completedAt.toDate(), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={saveTimeline} disabled={isSavingTimeline}>
                      {isSavingTimeline ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Timeline'
                      )}
                    </Button>
                    <Button variant="outline" onClick={cancelTimelineEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {timelineStages.map((stage) => {
                    // Map icon strings to components
                    const stageIcons = {
                      shield: Shield,
                      briefcase: Briefcase,
                      target: Target,
                      rocket: Rocket,
                      flag: Flag,
                    };
                    const StageIcon = stageIcons[stage.icon as keyof typeof stageIcons] || Briefcase;
                    
                    return (
                      <div key={stage.id} className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            stage.status === 'completed'
                              ? 'bg-green-500'
                              : stage.status === 'current'
                                ? 'bg-orange'
                                : 'bg-white/20'
                          }`}
                        >
                          {stage.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : stage.status === 'current' ? (
                            <Circle className="w-5 h-5 text-white animate-pulse" />
                          ) : (
                            <StageIcon className="w-5 h-5 text-white/60" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${
                                stage.status === 'completed' ? 'text-white/60' : 'text-white'
                              }`}>
                                {stage.name}
                              </p>
                              <p className="text-xs text-white/60">{stage.description}</p>
                            </div>
                            {stage.status === 'current' && stage.progress !== undefined && (
                              <span className="text-sm text-muted-foreground">{stage.progress}%</span>
                            )}
                          </div>
                          {stage.status === 'current' && stage.progress !== undefined && (
                            <Progress value={stage.progress} className="h-1 mt-2" />
                          )}
                          {stage.status === 'completed' && stage.completedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Completed: {stage.completedAt instanceof Date ? format(stage.completedAt, 'MMM d, yyyy') : format(stage.completedAt.toDate(), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTimeline(true)}
                    className="mt-4"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Timeline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <KanbanBoard
            projectId={projectId}
            projectName={project.name}
            currentUserId={user?.uid || ''}
            currentUserName={user?.displayName || user?.email || 'Unknown'}
            currentUserAvatar={user?.photoURL}
            teamMembers={teamMembers}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              &quot;{project.name}&quot; and all associated data.
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