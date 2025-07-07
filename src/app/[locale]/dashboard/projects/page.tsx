'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Clock,
  TrendingUp,
  MoreVertical,
  Plus,
  Filter,
  Search,
  ChevronLeft,
  AlertCircle,
  FolderOpen,
  Loader2,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from '@/i18n/routing';
import { firestoreProjectService as projectService } from '@/services/firestore/projects';
import { Project, ProjectStatus, ProjectPriority } from '@/types';
import { ProjectRequestDialog } from '@/components/dialogs/ProjectRequestDialog';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTimelines, setProjectTimelines] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  // Subscribe to real-time project updates
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    // Build queries for both quotes and projects collections
    const queries = [];

    // Query for approved quotes (these are projects)
    const quotesQuery = query(
      collection(db, 'quotes'),
      where('userId', '==', user.uid),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    queries.push({ query: quotesQuery, type: 'quote' });

    // Query for projects collection
    const projectsQuery = query(
      collection(db, 'projects'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    queries.push({ query: projectsQuery, type: 'project' });

    const unsubscribes: (() => void)[] = [];
    const allProjects: { [key: string]: Project } = {};

    queries.forEach(({ query: q, type }) => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.forEach((doc) => {
            const data = doc.data();

            if (type === 'quote') {
              // Transform quote to project format
              const project: Project = {
                id: doc.id,
                name: data.projectName || 'Untitled Project',
                description: data.projectDetails || '',
                type: 'consultation' as const,
                status: 'active' as const,
                priority: (data.priority || 'medium') as ProjectPriority,
                clientId: data.userId,
                consultantId: '',
                teamIds: [],
                startDate: data.startDate?.toDate?.() || new Date(),
                endDate: data.endDate?.toDate?.(),
                estimatedHours: data.estimatedHours || 0,
                actualHours: 0,
                budget: data.budget || { amount: 0, currency: 'EUR', type: 'fixed' },
                milestones: data.milestones || [],
                tags: [],
                categories: data.services || [],
                technologies: data.technologies || [],
                documentIds: [],
                meetingIds: [],
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
                createdBy: data.userId || '',
              };
              allProjects[doc.id] = project;
            } else {
              // Direct project format
              allProjects[doc.id] = {
                id: doc.id,
                ...data,
                startDate: data.startDate?.toDate?.() || new Date(),
                endDate: data.endDate?.toDate?.(),
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
              } as Project;
            }
          });

          // Update projects list
          let projectsList = Object.values(allProjects);

          // Apply filters
          if (statusFilter !== 'all') {
            projectsList = projectsList.filter((p) => p.status === statusFilter);
          }

          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            projectsList = projectsList.filter(
              (p) =>
                p.name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.categories.some((c) => c.toLowerCase().includes(query))
            );
          }

          // Sort by date
          projectsList.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setProjects(projectsList);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error listening to projects:', error);
          setError('Failed to load projects. Please try again.');
          setIsLoading(false);
        }
      );
      unsubscribes.push(unsubscribe);
    });

    // Cleanup
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [user, statusFilter, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to timeline updates for all projects
  useEffect(() => {
    if (!projects.length) return;

    const unsubscribes: (() => void)[] = [];

    projects.forEach((project) => {
      const timelineRef = doc(db, 'projectTimelines', project.id);
      
      const unsubscribe = onSnapshot(
        timelineRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setProjectTimelines((prev) => ({
              ...prev,
              [project.id]: docSnapshot.data(),
            }));
          }
        },
        (error) => {
          // Ignore permission errors for timeline
          if (error.code !== 'permission-denied') {
            console.error('Error loading timeline:', error);
          }
        }
      );
      
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [projects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  // Handle project cancellation
  const handleCancelProject = async () => {
    if (!selectedProject) return;

    setIsDeleting(true);
    try {
      await projectService.update(selectedProject.id, {
        status: 'cancelled' as ProjectStatus,
      });

      // Projects list will auto-update via real-time listener
      setCancelDialogOpen(false);
      setSelectedProject(null);
    } catch (err) {
      console.error('Error cancelling project:', err);
      setError('Failed to cancel project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    setIsDeleting(true);
    try {
      await projectService.delete(selectedProject.id);

      // Projects list will auto-update via real-time listener
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate project progress based on timeline
  const calculateProjectProgress = (projectId: string): number => {
    const timeline = projectTimelines[projectId];
    if (!timeline?.stages || timeline.stages.length === 0) {
      return 0;
    }
    
    const completedStages = timeline.stages.filter((s: any) => s.status === 'completed').length;
    const currentStage = timeline.stages.find((s: any) => s.status === 'current');
    const currentProgress = currentStage?.progress || 0;
    
    return Math.round((completedStages * 100 + currentProgress) / timeline.stages.length);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto"></div>
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  // Calculate actual progress based on timeline or milestones
  const calculateProgress = (project: Project): number => {
    // First, try to use timeline data
    const timelineProgress = calculateProjectProgress(project.id);
    if (timelineProgress > 0) {
      return timelineProgress;
    }
    
    // Fallback to milestones if no timeline data
    if (!project.milestones || project.milestones.length === 0) return 0;
    const completedMilestones = project.milestones.filter((m) => m.status === 'completed').length;
    return Math.round((completedMilestones / project.milestones.length) * 100);
  };

  // Format budget display
  const formatBudget = (budget: Project['budget']): string => {
    const formatter = new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: budget.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (budget.type === 'hourly' && budget.hourlyRate) {
      return `${formatter.format(budget.hourlyRate)}/hour`;
    }
    return formatter.format(budget.amount);
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Your Projects</h1>
              <p className="text-white/60 mt-2">Manage and track all your projects in one place</p>
            </div>

            <Link href="/contact?type=project">
              <Button className="bg-orange hover:bg-orange/90">
                <Plus className="w-4 h-4 mr-2" />
                Request New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' ? 'bg-orange' : ''}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
              className={statusFilter === 'active' ? 'bg-orange' : ''}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('draft')}
              className={statusFilter === 'draft' ? 'bg-orange' : ''}
            >
              Draft
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
              className={statusFilter === 'completed' ? 'bg-orange' : ''}
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange animate-spin" />
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && projects.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange/20 rounded-lg">
                        <Briefcase className="w-5 h-5 text-orange" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{project.name}</h3>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(project.status)} bg-opacity-20 border-0 mt-1`}
                        >
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/60 hover:text-white focus:outline-none"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === project.id ? null : project.id);
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      {activeDropdown === project.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-black/95 border border-white/20 z-50">
                          <div className="py-1">
                            {project.status !== 'completed' && project.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  setSelectedProject(project);
                                  setCancelDialogOpen(true);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-yellow-600 hover:bg-white/10 w-full text-left"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Project
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedProject(project);
                                setDeleteDialogOpen(true);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-white/10 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Project
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{project.description}</p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Progress</span>
                        <span className="text-white">{calculateProgress(project)}%</span>
                      </div>
                      <Progress value={calculateProgress(project)} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-white/60">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(project.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-white/60">{formatBudget(project.budget)}</div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="ghost" className="w-full text-orange hover:bg-orange/10">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && !error && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-orange/20 blur-3xl animate-pulse"></div>
              <FolderOpen className="w-24 h-24 text-white/20 mx-auto mb-6 relative" />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Start your journey with GroeimetAI by requesting a new project. We&apos;ll help you
              transform your business with cutting-edge AI solutions.
            </p>

            <Button
              size="lg"
              className="bg-orange hover:bg-orange/90"
              onClick={() => setProjectDialogOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Request Your First Project
            </Button>
          </motion.div>
        )}
      </div>

      {/* Cancel Project Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel &ldquo;{selectedProject?.name}&rdquo;? This action
              cannot be undone. The project will be marked as cancelled and all associated tasks
              will be stopped.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isDeleting}
            >
              Keep Project
            </Button>
            <Button variant="destructive" onClick={handleCancelProject} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{selectedProject?.name}&rdquo;?
              This action cannot be undone and all project data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Request Dialog */}
      <ProjectRequestDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
    </main>
  );
}
