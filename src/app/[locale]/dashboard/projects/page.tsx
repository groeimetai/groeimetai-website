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
import { Project, ProjectStatus } from '@/types';

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch projects from API
  const fetchProjects = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await projectService.list({
        userId: user.uid,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
        sort: 'createdAt',
        order: 'desc',
      });

      setProjects(response.items);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects when component mounts or filters change
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        fetchProjects();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle project cancellation
  const handleCancelProject = async () => {
    if (!selectedProject) return;
    
    setIsDeleting(true);
    try {
      await projectService.update(selectedProject.id, {
        status: 'cancelled' as ProjectStatus,
      });
      
      // Refresh projects list
      await fetchProjects();
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
      
      // Refresh projects list
      await fetchProjects();
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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

  // Calculate actual progress based on milestones
  const calculateProgress = (project: Project): number => {
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
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white/60">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProject(project);
                            setCancelDialogOpen(true);
                          }}
                          className="text-yellow-600"
                          disabled={project.status === 'completed' || project.status === 'cancelled'}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Project
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProject(project);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

            <Link href="/contact?type=project">
              <Button size="lg" className="bg-orange hover:bg-orange/90">
                <Plus className="w-5 h-5 mr-2" />
                Request Your First Project
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Cancel Project Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel &ldquo;{selectedProject?.name}&rdquo;? This action cannot be undone.
              The project will be marked as cancelled and all associated tasks will be stopped.
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
            <Button
              variant="destructive"
              onClick={handleCancelProject}
              disabled={isDeleting}
            >
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
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
            >
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
    </main>
  );
}
