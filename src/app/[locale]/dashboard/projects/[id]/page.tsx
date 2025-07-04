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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@/i18n/routing';
import { firestoreProjectService as projectService } from '@/services/firestore/projects';
import { Project, ProjectStatus } from '@/types';
import { format } from 'date-fns';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const projectId = params.id as string;

  // Fetch project details
  const fetchProject = async () => {
    if (!user || !projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      const projectData = await projectService.get(projectId);
      
      // Verify user has access to this project
      if (projectData.clientId !== user.uid && user.role !== 'admin') {
        setError('You do not have permission to view this project');
        return;
      }
      
      setProject(projectData);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && projectId) {
      fetchProject();
    }
  }, [user, projectId]);

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
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Team
              </Button>
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
                  {project.startDate ? format(new Date(project.startDate), 'MMM dd, yyyy') : 'Not set'}
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
        <Tabs defaultValue="milestones" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

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
                              <DollarSign className="w-4 h-4" />
                              €{milestone.payment.amount}
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

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Services Included</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {project.categories.map((service, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange" />
                    <span className="text-white">{service}</span>
                  </div>
                ))}
              </div>
              
              {project.technologies.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-3">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="bg-orange/10 border-orange/30">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Team</h3>
              <div className="flex items-center gap-2 text-white/60">
                <Users className="w-5 h-5" />
                <span>Team information will be available soon</span>
              </div>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-5 h-5" />
                <span>Activity feed will be available soon</span>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}