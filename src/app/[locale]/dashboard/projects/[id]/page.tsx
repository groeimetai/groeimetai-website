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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@/i18n/routing';
import { firestoreProjectService as projectService } from '@/services/firestore/projects';
import { Project, ProjectStatus, ProjectPriority } from '@/types';
import { format } from 'date-fns';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = params.id as string;

  // Subscribe to real-time project updates
  useEffect(() => {
    if (!user || !projectId) return;

    setIsLoading(true);
    setError(null);

    // First, check if the project exists in quotes collection
    const quoteRef = doc(db, 'quotes', projectId);
    const projectRef = doc(db, 'projects', projectId);

    // Try both collections since projects can be stored in either
    let unsubscribeQuote: (() => void) | undefined;
    let unsubscribeProject: (() => void) | undefined;

    // Listen to quotes collection
    unsubscribeQuote = onSnapshot(
      quoteRef,
      (docSnapshot) => {
        if (docSnapshot.exists() && docSnapshot.data().status === 'approved') {
          const data = docSnapshot.data();
          
          // Verify user has access
          if (data.userId !== user.uid && user.role !== 'admin') {
            setError('You do not have permission to view this project');
            setIsLoading(false);
            return;
          }

          // Transform quote data to project format
          const projectData: Project = {
            id: docSnapshot.id,
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

          setProject(projectData);
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to quote:', error);
      }
    );

    // Also listen to projects collection
    unsubscribeProject = onSnapshot(
      projectRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          
          // Verify user has access
          if (data.clientId !== user.uid && user.role !== 'admin') {
            setError('You do not have permission to view this project');
            setIsLoading(false);
            return;
          }

          const projectData: Project = {
            id: docSnapshot.id,
            ...data,
            startDate: data.startDate?.toDate?.() || new Date(),
            endDate: data.endDate?.toDate?.(),
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as Project;

          setProject(projectData);
          setIsLoading(false);
        } else {
          // If not found in projects collection, rely on quotes collection
          if (!project) {
            setIsLoading(false);
          }
        }
      },
      (error) => {
        console.error('Error listening to project:', error);
        if (!project) {
          setError('Failed to load project details. Please try again.');
          setIsLoading(false);
        }
      }
    );

    // Cleanup function
    return () => {
      if (unsubscribeQuote) unsubscribeQuote();
      if (unsubscribeProject) unsubscribeProject();
    };
  }, [user, projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <Link href="/dashboard/projects">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">Project not found</p>
          <Link href="/dashboard/projects">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
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
            href="/dashboard/projects"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Projects
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange/20 rounded-lg">
                  <Briefcase className="w-6 h-6 text-orange" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(project.status)} bg-opacity-20 border-0 mt-1`}
                  >
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
              </div>
              <p className="text-white/60 mt-2 max-w-2xl">{project.description}</p>
            </div>

            <div className="flex gap-3">
              <Link href="/dashboard/messages">
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Team
                </Button>
              </Link>
              <Button className="bg-orange hover:bg-orange/90">
                <FileText className="w-4 h-4 mr-2" />
                View Documents
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Project Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60">Overall Progress</span>
                <span className="text-white font-semibold">{calculateProgress(project)}%</span>
              </div>
              <Progress value={calculateProgress(project)} className="h-3" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-white/60 text-sm">Start Date</p>
                <p className="text-white font-semibold">
                  {project.startDate
                    ? format(new Date(project.startDate), 'MMM dd, yyyy')
                    : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Estimated End</p>
                <p className="text-white font-semibold">
                  {project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Budget</p>
                <p className="text-white font-semibold">{formatBudget(project.budget)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Hours Logged</p>
                <p className="text-white font-semibold">
                  {project.actualHours || 0} / {project.estimatedHours || 0}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10 flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Details Card */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange" />
                  Project Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 text-sm">Services</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {project.categories.map((service, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-orange/10 border-orange/30"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Technologies</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Budget Type</p>
                    <p className="text-white font-semibold capitalize">{project.budget.type}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Priority</p>
                    <Badge
                      className={`${
                        project.priority === 'urgent'
                          ? 'bg-red-500'
                          : project.priority === 'high'
                            ? 'bg-orange'
                            : project.priority === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                      }`}
                    >
                      {project.priority}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Key Metrics Card */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange" />
                  Key Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Milestones</p>
                    <p className="text-2xl font-bold text-white">
                      {project.milestones?.filter((m) => m.status === 'completed').length || 0}/
                      {project.milestones?.length || 0}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Time Elapsed</p>
                    <p className="text-2xl font-bold text-white">
                      {project.startDate
                        ? Math.floor(
                            (new Date().getTime() - new Date(project.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : 0}
                      d
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Hours Used</p>
                    <p className="text-2xl font-bold text-white">
                      {(((project.actualHours || 0) / (project.estimatedHours || 1)) * 100).toFixed(
                        0
                      )}
                      %
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Documents</p>
                    <p className="text-2xl font-bold text-white">
                      {project.documentIds?.length || 0}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Next Steps Card */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 md:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-orange" />
                  Next Steps
                </h3>
                <div className="space-y-3">
                  {project.milestones
                    ?.filter((m) => m.status !== 'completed')
                    .slice(0, 3)
                    .map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      >
                        <Circle className="w-5 h-5 text-white/40" />
                        <div className="flex-1">
                          <p className="text-white font-medium">{milestone.name}</p>
                          <p className="text-white/60 text-sm">
                            Due: {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    )) || <p className="text-white/60">No upcoming milestones</p>}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Milestones</h3>
              {project.milestones && project.milestones.length > 0 ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start gap-4">
                      <div className="mt-1">
                        {milestone.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">{milestone.name}</h4>
                            <p className="text-white/60 text-sm mt-1">{milestone.description}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`ml-4 ${
                              milestone.status === 'completed'
                                ? 'border-green-500 text-green-500'
                                : milestone.status === 'in_progress'
                                  ? 'border-yellow-500 text-yellow-500'
                                  : 'border-white/40 text-white/40'
                            }`}
                          >
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
                          </span>
                          {milestone.payment && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />€{milestone.payment.amount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60">No milestones have been set for this project yet.</p>
              )}
            </Card>
          </TabsContent>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Project Deliverables</h3>
                <Button variant="outline" size="sm">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Deliverable
                </Button>
              </div>

              {project.milestones && project.milestones.length > 0 ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone) => (
                    <div key={milestone.id} className="border border-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{milestone.name}</h4>
                          <p className="text-white/60 text-sm">
                            Due: {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            milestone.status === 'completed'
                              ? 'border-green-500 text-green-500'
                              : 'border-white/40 text-white/40'
                          }`}
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60">
                  No deliverables have been defined for this project yet.
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Project Documents</h3>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>

              {project.documentIds && project.documentIds.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Mock documents for now */}
                  <div className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <FileText className="w-8 h-8 text-orange" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Project Proposal</h4>
                        <p className="text-white/60 text-sm">PDF • 2.3 MB • Updated 2 days ago</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4 text-white/60" />
                      </Button>
                    </div>
                  </div>
                  <div className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <FileText className="w-8 h-8 text-orange" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Technical Specifications</h4>
                        <p className="text-white/60 text-sm">DOCX • 1.7 MB • Updated 5 days ago</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4 text-white/60" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No documents uploaded yet</p>
                  <p className="text-white/40 text-sm mt-1">
                    Upload project documents to keep everything in one place
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Project Team</h3>
                <div className="space-y-4">
                  {/* Project Manager */}
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 bg-orange/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Project Manager</p>
                      <p className="text-white/60 text-sm">GroeimetAI Team</p>
                    </div>
                    <Badge variant="outline" className="text-orange border-orange/30">
                      Lead
                    </Badge>
                  </div>

                  {/* Tech Lead */}
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Technical Lead</p>
                      <p className="text-white/60 text-sm">AI Engineering</p>
                    </div>
                    <Badge variant="outline">Tech</Badge>
                  </div>

                  {/* Client Contact */}
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Client Contact</p>
                      <p className="text-white/60 text-sm">{user?.displayName || 'You'}</p>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-500/30">
                      Client
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Communication</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-orange" />
                      <span className="text-white">Project Chat</span>
                    </div>
                    <Link href="/dashboard/messages">
                      <Button size="sm" variant="outline">
                        Open Chat
                      </Button>
                    </Link>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="text-white">Schedule Meeting</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Book Time
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-5 h-5 text-green-500" />
                      <span className="text-white">Shared Links</span>
                    </div>
                    <Badge variant="outline">3 links</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-orange" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {/* Recent activities - mock data */}
                <div className="flex gap-3 pb-4 border-b border-white/10">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white">Project created</p>
                    <p className="text-white/60 text-sm">
                      Project initialized with requirements and timeline
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      {project.createdAt
                        ? format(new Date(project.createdAt), 'MMM dd, yyyy at HH:mm')
                        : 'Recently'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pb-4 border-b border-white/10">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white">Team assigned</p>
                    <p className="text-white/60 text-sm">
                      Project manager and technical lead assigned
                    </p>
                    <p className="text-white/40 text-xs mt-1">2 days ago</p>
                  </div>
                </div>

                <div className="flex gap-3 pb-4 border-b border-white/10">
                  <div className="w-2 h-2 bg-orange rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white">Kickoff meeting scheduled</p>
                    <p className="text-white/60 text-sm">
                      Initial project meeting set for next week
                    </p>
                    <p className="text-white/40 text-xs mt-1">1 day ago</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white">Documents uploaded</p>
                    <p className="text-white/60 text-sm">
                      Project proposal and technical specs added
                    </p>
                    <p className="text-white/40 text-xs mt-1">Today at 14:30</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <Button variant="outline" className="w-full">
                  View Full History
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
