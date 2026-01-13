'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  FolderKanban,
  Calendar,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from '@/i18n/routing';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  startDate?: Date;
  updatedAt: Date;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-yellow-500', label: 'In afwachting' },
  reviewed: { color: 'bg-blue-500', label: 'Wordt beoordeeld' },
  approved: { color: 'bg-green-500', label: 'Goedgekeurd' },
  in_progress: { color: 'bg-blue-500', label: 'In behandeling' },
  completed: { color: 'bg-green-500', label: 'Voltooid' },
  rejected: { color: 'bg-red-500', label: 'Afgewezen' },
};

export default function PortalProjectsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        const projectsRef = collection(db, 'quotes');
        const projectsQuery = query(
          projectsRef,
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );
        const snapshot = await getDocs(projectsQuery);
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().projectName || 'Untitled Project',
          description: doc.data().projectDescription || '',
          status: doc.data().status || 'pending',
          progress: doc.data().progress || 0,
          startDate: doc.data().startDate?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        }));
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && project.status !== statusFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="p-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Mijn Projecten</h1>
          <p className="text-white/60 mt-1">Bekijk de voortgang van uw projecten</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Zoek projecten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statussen</SelectItem>
              <SelectItem value="pending">In afwachting</SelectItem>
              <SelectItem value="approved">Goedgekeurd</SelectItem>
              <SelectItem value="in_progress">In behandeling</SelectItem>
              <SelectItem value="completed">Voltooid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60 text-lg">Geen projecten gevonden</p>
              <p className="text-white/40 text-sm mt-1">
                Wanneer u een offerte aanvraagt verschijnen uw projecten hier
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              const status = statusConfig[project.status] || { color: 'bg-gray-500', label: project.status };
              return (
                <Link key={project.id} href={`/portal/projects/${project.id}`}>
                  <Card className="bg-white/[0.02] border-white/10 hover:bg-white/[0.04] transition-colors cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white line-clamp-2">
                          {project.name}
                        </h3>
                        <Badge className={`${status.color} text-white ml-2 flex-shrink-0`}>
                          {status.label}
                        </Badge>
                      </div>

                      {project.description && (
                        <p className="text-white/60 text-sm line-clamp-2 mb-4">
                          {project.description}
                        </p>
                      )}

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-white/60">Voortgang</span>
                            <span className="text-white">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-1.5" />
                        </div>

                        {project.startDate && (
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <Calendar className="w-4 h-4" />
                            Gestart: {format(project.startDate, 'dd MMM yyyy', { locale: nl })}
                          </div>
                        )}

                        <p className="text-xs text-white/40">
                          Laatst bijgewerkt: {format(project.updatedAt, 'dd MMM yyyy', { locale: nl })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
