'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  AlertCircle,
  FolderOpen,
  Loader2,
  Plus,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@/i18n/routing';
import { Project, ProjectStatus, ProjectPriority } from '@/types';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTimelines, setProjectTimelines] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time project updates
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    const allProjects: { [key: string]: Project } = {};

    // Query for quotes collection
    const quotesQuery = query(
      collection(db, 'quotes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    // Query for projects collection
    const projectsQuery = query(
      collection(db, 'projects'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeQuotes = onSnapshot(
      quotesQuery,
      (snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
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
                return 'pending_approval';
            }
          };

          allProjects[doc.id] = {
            id: doc.id,
            name: data.projectName || 'Untitled Project',
            description: data.projectDetails || '',
            type: 'consultation' as const,
            status: getProjectStatus(data.status),
            priority: (data.priority || 'medium') as ProjectPriority,
            clientId: data.userId || user.uid,
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
            createdBy: data.userId || user.uid,
            originalQuoteStatus: data.status,
          };
        });
        updateProjectsList(allProjects);
      },
      (error) => {
        console.error('Error listening to quotes:', error);
        setError('Kon projecten niet laden. Probeer opnieuw.');
        setIsLoading(false);
      }
    );

    const unsubscribeProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          if (!allProjects[docSnapshot.id]) {
            allProjects[docSnapshot.id] = {
              id: docSnapshot.id,
              ...data,
              startDate: data.startDate?.toDate?.() || new Date(),
              endDate: data.endDate?.toDate?.(),
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
            } as Project;
          }
        });
        updateProjectsList(allProjects);
      },
      (error) => {
        console.error('Error listening to projects:', error);
        setIsLoading(false);
      }
    );

    const updateProjectsList = (projectsMap: { [key: string]: Project }) => {
      let projectsList = Object.values(projectsMap);

      // Apply filters
      if (statusFilter === 'active') {
        projectsList = projectsList.filter(
          (p) =>
            p.status === 'active' ||
            p.status === 'pending_approval' ||
            (p as any).originalQuoteStatus === 'pending' ||
            (p as any).originalQuoteStatus === 'reviewed' ||
            (p as any).originalQuoteStatus === 'approved'
        );
      } else if (statusFilter === 'completed') {
        projectsList = projectsList.filter((p) => p.status === 'completed');
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        projectsList = projectsList.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
        );
      }

      projectsList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setProjects(projectsList);
      setIsLoading(false);
    };

    return () => {
      unsubscribeQuotes();
      unsubscribeProjects();
    };
  }, [user, statusFilter, searchQuery]);

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
          <p className="mt-4 text-white/60">Laden...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (project: Project) => {
    if ((project as any).originalQuoteStatus) {
      const quoteStatus = (project as any).originalQuoteStatus;
      switch (quoteStatus) {
        case 'pending':
          return 'bg-yellow-500';
        case 'reviewed':
          return 'bg-blue-500';
        case 'approved':
          return 'bg-green-500';
        case 'rejected':
          return 'bg-red-500';
        default:
          return 'bg-gray-500';
      }
    }
    switch (project.status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'pending_approval':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (project: Project) => {
    if ((project as any).originalQuoteStatus) {
      const quoteStatus = (project as any).originalQuoteStatus;
      switch (quoteStatus) {
        case 'pending':
          return 'In Behandeling';
        case 'reviewed':
          return 'Onder Review';
        case 'approved':
          return 'Actief';
        case 'rejected':
          return 'Afgewezen';
        default:
          return 'Concept';
      }
    }
    switch (project.status) {
      case 'active':
        return 'Actief';
      case 'completed':
        return 'Voltooid';
      case 'pending_approval':
        return 'In Behandeling';
      case 'cancelled':
        return 'Geannuleerd';
      default:
        return project.status;
    }
  };

  const calculateProgress = (project: Project): number => {
    const timeline = projectTimelines[project.id];
    if (timeline?.stages && timeline.stages.length > 0) {
      const completedStages = timeline.stages.filter((s: any) => s.status === 'completed').length;
      const currentStage = timeline.stages.find((s: any) => s.status === 'current');
      const currentProgress = currentStage?.progress || 0;
      return Math.round((completedStages * 100 + currentProgress) / timeline.stages.length);
    }
    if (!project.milestones || project.milestones.length === 0) return 0;
    const completedMilestones = project.milestones.filter((m) => m.status === 'completed').length;
    return Math.round((completedMilestones / project.milestones.length) * 100);
  };

  const formatBudget = (budget: Project['budget']): string => {
    const formatter = new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: budget.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (budget.type === 'hourly' && budget.hourlyRate) {
      return `${formatter.format(budget.hourlyRate)}/uur`;
    }
    return formatter.format(budget.amount);
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Terug naar Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Je Projecten</h1>
              <p className="text-white/60 mt-2">Beheer en volg al je projecten</p>
            </div>

            <Link href="/contact?type=project">
              <Button className="bg-orange hover:bg-orange/90">
                <Plus className="w-4 h-4 mr-2" />
                Nieuw Project
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
              placeholder="Zoek projecten..."
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
              Alle
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
              className={statusFilter === 'active' ? 'bg-orange' : ''}
            >
              Actief
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
              className={statusFilter === 'completed' ? 'bg-orange' : ''}
            >
              Voltooid
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
                          className={`${getStatusColor(project)} bg-opacity-20 border-0 mt-1`}
                        >
                          {getStatusLabel(project)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{project.description}</p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Voortgang</span>
                        <span className="text-white">{calculateProgress(project)}%</span>
                      </div>
                      <Progress value={calculateProgress(project)} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-white/60">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(project.startDate).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-white/60">{formatBudget(project.budget)}</div>
                    </div>

                    {project.technologies && project.technologies.length > 0 && (
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
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="ghost" className="w-full text-orange hover:bg-orange/10">
                        Bekijk Details
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

            <h3 className="text-xl font-semibold text-white mb-2">Nog geen projecten</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Start je AI-transformatie door een nieuw project aan te vragen. We helpen je graag
              met je digitale groei.
            </p>

            <Link href="/contact?type=project">
              <Button size="lg" className="bg-orange hover:bg-orange/90">
                <Plus className="w-5 h-5 mr-2" />
                Vraag je eerste project aan
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
