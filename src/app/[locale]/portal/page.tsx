'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  FolderKanban,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  progress: number;
  updatedAt: Date;
}

interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  dueDate?: Date;
}

export default function ClientPortalDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    pendingInvoices: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch projects where user is the client
        const projectsRef = collection(db, 'quotes');
        const projectsQuery = query(
          projectsRef,
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc'),
          limit(5)
        );
        const projectsSnap = await getDocs(projectsQuery);
        const projectsData = projectsSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().projectName || 'Untitled Project',
          status: doc.data().status || 'pending',
          progress: doc.data().progress || 0,
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        }));
        setProjects(projectsData);

        // Count active and completed projects
        const allProjectsQuery = query(projectsRef, where('userId', '==', user.uid));
        const allProjectsSnap = await getDocs(allProjectsQuery);
        let active = 0;
        let completed = 0;
        allProjectsSnap.docs.forEach((doc) => {
          const status = doc.data().status;
          if (status === 'approved' || status === 'in_progress') active++;
          if (status === 'completed') completed++;
        });
        setStats((prev) => ({ ...prev, activeProjects: active, completedProjects: completed }));

        // Fetch invoices
        const invoicesRef = collection(db, 'invoices');
        const invoicesQuery = query(
          invoicesRef,
          where('clientId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const invoicesSnap = await getDocs(invoicesQuery);
        const invoicesData = invoicesSnap.docs.map((doc) => ({
          id: doc.id,
          invoiceNumber: doc.data().invoiceNumber,
          totalAmount: doc.data().totalAmount || 0,
          status: doc.data().status || 'draft',
          dueDate: doc.data().dueDate?.toDate(),
        }));
        setInvoices(invoicesData);

        // Calculate pending invoices and total spent
        let pending = 0;
        let totalSpent = 0;
        invoicesSnap.docs.forEach((doc) => {
          if (doc.data().status === 'sent' || doc.data().status === 'overdue') {
            pending++;
          }
          if (doc.data().status === 'paid') {
            totalSpent += doc.data().totalAmount || 0;
          }
        });
        setStats((prev) => ({ ...prev, pendingInvoices: pending, totalSpent }));
      } catch (error) {
        console.error('Error fetching portal data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-500', label: 'In afwachting' },
      approved: { color: 'bg-blue-500', label: 'Goedgekeurd' },
      in_progress: { color: 'bg-blue-500', label: 'In behandeling' },
      completed: { color: 'bg-green-500', label: 'Voltooid' },
      rejected: { color: 'bg-red-500', label: 'Afgewezen' },
      sent: { color: 'bg-yellow-500', label: 'Open' },
      paid: { color: 'bg-green-500', label: 'Betaald' },
      overdue: { color: 'bg-red-500', label: 'Verlopen' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-500', label: status };
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

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
          <h1 className="text-3xl font-bold text-white">Welkom terug, {user?.displayName?.split(' ')[0] || 'Klant'}</h1>
          <p className="text-white/60 mt-1">Hier is een overzicht van uw projecten en facturen</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Actieve projecten</p>
                  <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Voltooide projecten</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completedProjects}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Openstaande facturen</p>
                  <p className="text-2xl font-bold text-orange">{stats.pendingInvoices}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Totaal besteed</p>
                  <p className="text-2xl font-bold text-white">
                    &euro;{stats.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects and Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recente projecten</CardTitle>
              <Link href="/portal/projects">
                <Button variant="ghost" size="sm" className="text-orange">
                  Bekijk alle <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderKanban className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">Geen projecten gevonden</p>
                </div>
              ) : (
                projects.map((project) => (
                  <Link key={project.id} href={`/portal/projects/${project.id}`}>
                    <div className="p-4 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{project.name}</h4>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Voortgang</span>
                          <span className="text-white">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1" />
                      </div>
                      <p className="text-xs text-white/40 mt-2">
                        Laatst bijgewerkt: {format(project.updatedAt, 'dd MMM yyyy', { locale: nl })}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recente facturen</CardTitle>
              <Link href="/portal/invoices">
                <Button variant="ghost" size="sm" className="text-orange">
                  Bekijk alle <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">Geen facturen gevonden</p>
                </div>
              ) : (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 bg-white/[0.02] rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                      {invoice.dueDate && (
                        <p className="text-xs text-white/60 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          Vervaldatum: {format(invoice.dueDate, 'dd MMM yyyy', { locale: nl })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        &euro;{invoice.totalAmount.toLocaleString()}
                      </p>
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
