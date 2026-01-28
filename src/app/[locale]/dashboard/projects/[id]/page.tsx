'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  Loader2,
  MessageSquare,
  Briefcase,
  Download,
  Upload,
  Target,
  CheckCircle,
  Circle,
  FileText,
  Clock,
  CalendarPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@/i18n/routing';
import { Project, ProjectStatus, ProjectPriority } from '@/types';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { db, storage } from '@/lib/firebase/config';
import { doc, onSnapshot, collection, query, where, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectId = params.id as string;

  // Subscribe to real-time project updates
  useEffect(() => {
    if (!user || !projectId) return;

    setIsLoading(true);
    setError(null);

    const quoteRef = doc(db, 'quotes', projectId);
    const projectRef = doc(db, 'projects', projectId);

    let unsubscribeQuote: (() => void) | undefined;
    let unsubscribeProject: (() => void) | undefined;
    let unsubscribeTimeline: (() => void) | undefined;
    let unsubscribeDocuments: (() => void) | undefined;

    // Listen to quotes collection
    unsubscribeQuote = onSnapshot(
      quoteRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          if (data.userId !== user.uid && user.role !== 'admin') {
            setError('Je hebt geen toegang tot dit project');
            setIsLoading(false);
            return;
          }

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

          const projectData: Project = {
            id: docSnapshot.id,
            name: data.projectName || 'Untitled Project',
            description: data.projectDetails || '',
            type: 'consultation' as const,
            status: getProjectStatus(data.status),
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
            originalQuoteStatus: data.status,
          };

          setProject(projectData);
          setupTimelineAndDocuments(docSnapshot.id);
          setIsLoading(false);
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.error('Error listening to quote:', error);
        }
      }
    );

    // Also listen to projects collection
    unsubscribeProject = onSnapshot(
      projectRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          if (data.clientId !== user.uid && user.role !== 'admin') {
            setError('Je hebt geen toegang tot dit project');
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
          setupTimelineAndDocuments(docSnapshot.id);
          setIsLoading(false);
        } else if (!project) {
          setIsLoading(false);
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.error('Error listening to project:', error);
        }
        if (!project && error.code !== 'permission-denied') {
          setError('Kon project niet laden. Probeer opnieuw.');
          setIsLoading(false);
        }
      }
    );

    const setupTimelineAndDocuments = (projectId: string) => {
      // Timeline listener
      const timelineRef = doc(db, 'projectTimelines', projectId);
      unsubscribeTimeline = onSnapshot(
        timelineRef,
        (timelineDoc) => {
          if (timelineDoc.exists()) {
            setTimelineData(timelineDoc.data());
          }
        },
        (error) => {
          if (error.code !== 'permission-denied') {
            console.error('Error loading timeline:', error);
          }
        }
      );

      // Documents listener
      const documentsQuery = query(
        collection(db, 'documents'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      unsubscribeDocuments = onSnapshot(
        documentsQuery,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDocuments(docs);
        },
        (error) => {
          if (error.code !== 'permission-denied') {
            console.error('Error loading documents:', error);
          }
        }
      );
    };

    return () => {
      if (unsubscribeQuote) unsubscribeQuote();
      if (unsubscribeProject) unsubscribeProject();
      if (unsubscribeTimeline) unsubscribeTimeline();
      if (unsubscribeDocuments) unsubscribeDocuments();
    };
  }, [user, projectId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !project) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Bestand mag niet groter zijn dan 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `projects/${project.id}/documents/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Create document record in Firestore
      await addDoc(collection(db, 'documents'), {
        projectId: project.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        uploadedBy: user.uid,
        uploadedByName: user.displayName || user.email,
        createdAt: Timestamp.now(),
      });

      toast.success('Document succesvol geüpload');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Kon document niet uploaden. Probeer opnieuw.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Project laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Fout</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <Link href="/dashboard/projects">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Projecten
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
          <p className="text-white/60">Project niet gevonden</p>
          <Link href="/dashboard/projects">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Projecten
            </Button>
          </Link>
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

  const calculateProgress = (): number => {
    if (timelineData?.stages && timelineData.stages.length > 0) {
      const completedStages = timelineData.stages.filter((s: any) => s.status === 'completed').length;
      const currentStage = timelineData.stages.find((s: any) => s.status === 'current');
      const currentProgress = currentStage?.progress || 0;
      return Math.round((completedStages * 100 + currentProgress) / timelineData.stages.length);
    }
    if (!project.milestones || project.milestones.length === 0) return 0;
    const completedMilestones = project.milestones.filter((m) => m.status === 'completed').length;
    return Math.round((completedMilestones / project.milestones.length) * 100);
  };

  const formatDate = (date: any): string => {
    if (!date) return 'Niet ingesteld';
    try {
      if (date.toDate && typeof date.toDate === 'function') {
        return format(date.toDate(), 'd MMMM yyyy', { locale: nl });
      }
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return 'Niet ingesteld';
      return format(parsedDate, 'd MMMM yyyy', { locale: nl });
    } catch {
      return 'Niet ingesteld';
    }
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Terug naar Projecten
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
                    className={`${getStatusColor(project)} bg-opacity-20 border-0 mt-1`}
                  >
                    {getStatusLabel(project)}
                  </Badge>
                </div>
              </div>
              <p className="text-white/60 mt-2 max-w-2xl">{project.description}</p>
            </div>

            <Link href="/dashboard/messages">
              <Button className="bg-orange hover:bg-orange/90">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Team
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Project Voortgang</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60">Totale Voortgang</span>
                <span className="text-white font-semibold">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-3" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-white/60 text-sm">Startdatum</p>
                <p className="text-white font-semibold">{formatDate(project.startDate)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Geschatte Einddatum</p>
                <p className="text-white font-semibold">{formatDate(project.endDate)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Budget</p>
                <p className="text-white font-semibold">{formatBudget(project.budget)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Uren</p>
                <p className="text-white font-semibold">
                  {project.actualHours || 0} / {project.estimatedHours || 0}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs - 3 tabs only: Overzicht, Documenten, Communicatie */}
        <Tabs defaultValue="overzicht" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
            <TabsTrigger value="documenten">Documenten</TabsTrigger>
            <TabsTrigger value="communicatie">Communicatie</TabsTrigger>
          </TabsList>

          {/* Overzicht Tab */}
          <TabsContent value="overzicht">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Timeline / Milestones */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange" />
                  Mijlpalen
                </h3>
                <div className="space-y-4">
                  {timelineData?.stages && timelineData.stages.length > 0 ? (
                    timelineData.stages.map((stage: any, index: number) => (
                      <div key={stage.id || index} className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            stage.status === 'completed'
                              ? 'bg-green-500'
                              : stage.status === 'current'
                                ? 'bg-orange'
                                : 'bg-white/20'
                          }`}
                        >
                          {stage.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/60" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{stage.name}</p>
                          <p className="text-white/60 text-sm">{stage.description}</p>
                          {stage.status === 'current' && stage.progress !== undefined && (
                            <div className="mt-2">
                              <Progress value={stage.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : project.milestones && project.milestones.length > 0 ? (
                    project.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            milestone.status === 'completed' ? 'bg-green-500' : 'bg-white/20'
                          }`}
                        >
                          {milestone.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/60" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{milestone.name}</p>
                          <p className="text-white/60 text-sm">{milestone.description}</p>
                          <p className="text-white/40 text-xs mt-1">
                            Deadline: {formatDate(milestone.dueDate)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/60">Nog geen mijlpalen ingesteld</p>
                  )}
                </div>
              </Card>

              {/* Project Details */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-orange" />
                  Project Details
                </h3>
                <div className="space-y-4">
                  {project.categories && project.categories.length > 0 && (
                    <div>
                      <p className="text-white/60 text-sm mb-2">Services</p>
                      <div className="flex flex-wrap gap-2">
                        {project.categories.map((cat, index) => (
                          <Badge key={index} variant="outline" className="bg-orange/10 border-orange/30">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div>
                      <p className="text-white/60 text-sm mb-2">Technologieën</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <Badge key={index} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-white/60 text-sm">Budget Type</p>
                    <p className="text-white font-medium capitalize">{project.budget.type}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Aangemaakt op</p>
                    <p className="text-white font-medium">{formatDate(project.createdAt)}</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Documenten Tab */}
          <TabsContent value="documenten">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Project Documenten</h3>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploaden...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Document Uploaden
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-orange" />
                        <div>
                          <p className="text-white font-medium">{doc.name}</p>
                          <p className="text-white/60 text-sm">
                            {formatFileSize(doc.size)} • Geüpload op{' '}
                            {doc.createdAt?.toDate
                              ? format(doc.createdAt.toDate(), 'd MMM yyyy', { locale: nl })
                              : 'Recent'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        <Download className="w-4 h-4 text-white/60" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">Nog geen documenten</p>
                  <p className="text-white/40 text-sm">
                    Upload documenten om ze met het team te delen
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Communicatie Tab */}
          <TabsContent value="communicatie">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange" />
                  Berichten
                </h3>
                <p className="text-white/60 mb-4">
                  Neem contact op met het GroeimetAI team voor vragen of updates over je project.
                </p>
                <Link href="/dashboard/messages">
                  <Button className="w-full bg-orange hover:bg-orange/90">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Berichten
                  </Button>
                </Link>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-orange" />
                  Meeting Aanvragen
                </h3>
                <p className="text-white/60 mb-4">
                  Plan een meeting met het team om de voortgang te bespreken of vragen te stellen.
                </p>
                <Link href="/contact?type=meeting">
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Meeting Aanvragen
                  </Button>
                </Link>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 md:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange" />
                  Project Team
                </h3>
                <p className="text-white/60 mb-4">
                  Het GroeimetAI team werkt aan je project. Neem gerust contact op via de berichten of
                  plan een meeting.
                </p>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-orange/20 rounded-full flex items-center justify-center">
                    <span className="text-orange font-bold">G</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">GroeimetAI Team</p>
                    <p className="text-white/60 text-sm">Jouw AI-transformatie partner</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
