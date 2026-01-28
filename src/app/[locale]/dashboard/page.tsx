'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import {
  FolderOpen,
  ArrowRight,
  Clock,
  CheckCircle,
  Loader2,
  MessageSquare,
  HelpCircle,
  Briefcase,
  FileText,
  Calendar,
} from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Project, ProjectStatus, ProjectPriority } from '@/types';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time project updates
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    // Query for quotes collection (projects waiting for approval)
    const quotesQuery = query(
      collection(db, 'quotes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    // Query for projects collection
    const projectsQuery = query(
      collection(db, 'projects'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const allProjects: { [key: string]: Project } = {};

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
        console.error('Error loading quotes:', error);
        setIsLoading(false);
      }
    );

    const unsubscribeProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!allProjects[doc.id]) {
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
        updateProjectsList(allProjects);
      },
      (error) => {
        console.error('Error loading projects:', error);
        setIsLoading(false);
      }
    );

    const updateProjectsList = (projectsMap: { [key: string]: Project }) => {
      const projectsList = Object.values(projectsMap);
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
  }, [user]);

  // User guard
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-white/60">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Redirecting to login...</p>
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

  const activeProjects = projects.filter(
    (p) => p.status === 'active' || (p as any).originalQuoteStatus === 'approved'
  );
  const pendingProjects = projects.filter(
    (p) =>
      p.status === 'pending_approval' ||
      (p as any).originalQuoteStatus === 'pending' ||
      (p as any).originalQuoteStatus === 'reviewed'
  );

  // Determine contextual next action
  const getNextAction = () => {
    if (projects.length === 0) {
      return {
        title: 'Start je eerste project',
        description: 'Neem contact op om je eerste AI-project te bespreken.',
        action: 'Vraag project aan',
        href: '/contact?type=project',
      };
    }
    if (pendingProjects.length > 0) {
      return {
        title: 'Je aanvraag wordt beoordeeld',
        description: `We bekijken je projectaanvraag "${pendingProjects[0].name}" en nemen spoedig contact op.`,
        action: 'Bekijk project',
        href: `/dashboard/projects/${pendingProjects[0].id}`,
      };
    }
    if (activeProjects.length > 0) {
      return {
        title: 'Bekijk je actieve project',
        description: `Volg de voortgang van "${activeProjects[0].name}" en upload documenten.`,
        action: 'Bekijk voortgang',
        href: `/dashboard/projects/${activeProjects[0].id}`,
      };
    }
    return {
      title: 'Start een nieuw project',
      description: 'Al je projecten zijn afgerond. Begin een nieuw AI-project.',
      action: 'Nieuw project',
      href: '/contact?type=project',
    };
  };

  const nextAction = getNextAction();

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welkom terug, {user.displayName || user.firstName || user.email?.split('@')[0]}
          </h1>
          <p className="text-white/60">
            Hier is een overzicht van je projecten en volgende stappen.
          </p>
        </motion.div>

        {/* Next Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{nextAction.title}</h2>
                  <p className="text-white/70">{nextAction.description}</p>
                </div>
                <Link href={nextAction.href}>
                  <Button
                    className="text-white font-semibold whitespace-nowrap"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    {nextAction.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Je Projecten</h2>
            <Link href="/dashboard/projects">
              <Button variant="ghost" className="text-orange-500 hover:text-orange-400">
                Bekijk alle
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <Briefcase className="w-5 h-5 text-orange-500" />
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(project)} bg-opacity-20 border-0`}
                        >
                          {getStatusLabel(project)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-white mb-2 line-clamp-1">{project.name}</h3>
                      <p className="text-white/60 text-sm line-clamp-2 mb-4">
                        {project.description || 'Geen beschrijving beschikbaar'}
                      </p>
                      <div className="flex items-center text-white/50 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(project.createdAt).toLocaleDateString('nl-NL')}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Nog geen projecten</h3>
                <p className="text-white/60 mb-6 max-w-md mx-auto">
                  Start je AI-transformatie door een nieuw project aan te vragen.
                </p>
                <Link href="/contact?type=project">
                  <Button style={{ backgroundColor: '#F87315' }} className="text-white">
                    Vraag project aan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Snelle acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/messages">
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Berichten</h3>
                    <p className="text-white/60 text-sm">Bekijk je berichten</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/invoices">
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <FileText className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Facturen</h3>
                    <p className="text-white/60 text-sm">Bekijk je facturen</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contact">
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Hulp nodig?</h3>
                    <p className="text-white/60 text-sm">Neem contact op</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
