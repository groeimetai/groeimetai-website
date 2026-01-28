'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Kanban,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Filter,
  Search,
  ChevronRight,
  Loader2,
  MoreVertical,
  User,
  FileText,
  DollarSign,
  Target,
  ArrowRight,
  Briefcase,
  MessageCircle,
  Plus,
  GripVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { toast } from 'sonner';

// Pipeline stages
type PipelineStage = 'nieuw' | 'gekwalificeerd' | 'offerte_verstuurd' | 'onderhandeling' | 'gewonnen' | 'verloren';

interface PipelineItem {
  id: string;
  type: 'contact' | 'quote';
  stage: PipelineStage;
  name: string;
  email: string;
  phone?: string;
  company: string;
  message?: string;
  projectName?: string;
  services?: string[];
  budget?: string;
  timeline?: string;
  value?: number;
  createdAt: any;
  updatedAt?: any;
  originalStatus: string;
  originalData: any;
}

const PIPELINE_STAGES: { id: PipelineStage; label: string; color: string; icon: any }[] = [
  { id: 'nieuw', label: 'Nieuw', color: 'bg-blue-500', icon: Mail },
  { id: 'gekwalificeerd', label: 'Gekwalificeerd', color: 'bg-cyan-500', icon: Target },
  { id: 'offerte_verstuurd', label: 'Offerte Verstuurd', color: 'bg-yellow-500', icon: FileText },
  { id: 'onderhandeling', label: 'Onderhandeling', color: 'bg-purple-500', icon: MessageCircle },
  { id: 'gewonnen', label: 'Gewonnen', color: 'bg-green-500', icon: CheckCircle },
  { id: 'verloren', label: 'Verloren', color: 'bg-gray-500', icon: XCircle },
];

// Map contact status to pipeline stage
function contactStatusToStage(status: string): PipelineStage {
  switch (status) {
    case 'new': return 'nieuw';
    case 'contacted': return 'gekwalificeerd';
    case 'scheduled': return 'gekwalificeerd';
    case 'completed': return 'gewonnen';
    case 'archived': return 'verloren';
    default: return 'nieuw';
  }
}

// Map quote status to pipeline stage
function quoteStatusToStage(status: string): PipelineStage {
  switch (status) {
    case 'pending': return 'offerte_verstuurd';
    case 'reviewed': return 'onderhandeling';
    case 'approved': return 'gewonnen';
    case 'rejected': return 'verloren';
    case 'expired': return 'verloren';
    default: return 'offerte_verstuurd';
  }
}

// Map pipeline stage back to contact status
function stageToContactStatus(stage: PipelineStage): string {
  switch (stage) {
    case 'nieuw': return 'new';
    case 'gekwalificeerd': return 'contacted';
    case 'offerte_verstuurd': return 'contacted'; // Contacts don't go here normally
    case 'onderhandeling': return 'contacted';
    case 'gewonnen': return 'completed';
    case 'verloren': return 'archived';
    default: return 'new';
  }
}

// Map pipeline stage back to quote status
function stageToQuoteStatus(stage: PipelineStage): string {
  switch (stage) {
    case 'nieuw': return 'pending';
    case 'gekwalificeerd': return 'pending';
    case 'offerte_verstuurd': return 'pending';
    case 'onderhandeling': return 'reviewed';
    case 'gewonnen': return 'approved';
    case 'verloren': return 'rejected';
    default: return 'pending';
  }
}

export default function PipelinePage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  const [items, setItems] = useState<PipelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<PipelineItem | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Fetch contacts and quotes
  useEffect(() => {
    if (!user || !isAdmin) return;

    setIsLoading(true);
    const pipelineItems: PipelineItem[] = [];

    // Listen to contacts
    const contactsQuery = query(
      collection(db, 'contact_submissions'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribeContacts = onSnapshot(contactsQuery, (snapshot) => {
      const contactItems: PipelineItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: `contact_${doc.id}`,
          type: 'contact' as const,
          stage: contactStatusToStage(data.status),
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          message: data.message,
          createdAt: data.submittedAt,
          originalStatus: data.status,
          originalData: { ...data, id: doc.id },
        };
      });

      setItems((prev) => {
        const quoteItems = prev.filter((i) => i.type === 'quote');
        return [...contactItems, ...quoteItems];
      });
    });

    // Listen to quotes
    const quotesQuery = query(
      collection(db, 'quotes'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeQuotes = onSnapshot(quotesQuery, (snapshot) => {
      const quoteItems: PipelineItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: `quote_${doc.id}`,
          type: 'quote' as const,
          stage: quoteStatusToStage(data.status),
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          projectName: data.projectName,
          services: data.services,
          budget: data.budget,
          timeline: data.timeline,
          value: data.totalCost,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          originalStatus: data.status,
          originalData: { ...data, id: doc.id },
        };
      });

      setItems((prev) => {
        const contactItems = prev.filter((i) => i.type === 'contact');
        return [...contactItems, ...quoteItems];
      });
      setIsLoading(false);
    });

    return () => {
      unsubscribeContacts();
      unsubscribeQuotes();
    };
  }, [user, isAdmin]);

  // Filter items
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(search) ||
      item.company.toLowerCase().includes(search) ||
      item.email.toLowerCase().includes(search) ||
      (item.projectName && item.projectName.toLowerCase().includes(search))
    );
  });

  // Group items by stage
  const itemsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredItems.filter((item) => item.stage === stage.id);
    return acc;
  }, {} as Record<PipelineStage, PipelineItem[]>);

  // Calculate stats
  const stats = {
    total: items.length,
    contacts: items.filter((i) => i.type === 'contact').length,
    quotes: items.filter((i) => i.type === 'quote').length,
    pipelineValue: items
      .filter((i) => i.stage !== 'verloren' && i.value)
      .reduce((sum, i) => sum + (i.value || 0), 0),
    wonValue: items
      .filter((i) => i.stage === 'gewonnen' && i.value)
      .reduce((sum, i) => sum + (i.value || 0), 0),
  };

  // Handle drag start
  const handleDragStart = (item: PipelineItem) => {
    setDraggedItem(item);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  // Handle drop
  const handleDrop = async (stage: PipelineStage) => {
    if (!draggedItem || draggedItem.stage === stage) {
      setDraggedItem(null);
      setDragOverStage(null);
      return;
    }

    try {
      const originalId = draggedItem.id.replace('contact_', '').replace('quote_', '');

      if (draggedItem.type === 'contact') {
        const newStatus = stageToContactStatus(stage);
        await updateDoc(doc(db, 'contact_submissions', originalId), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      } else {
        const newStatus = stageToQuoteStatus(stage);
        await updateDoc(doc(db, 'quotes', originalId), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });

        // If moving to "gewonnen", offer to create project
        if (stage === 'gewonnen' && draggedItem.type === 'quote') {
          toast.success('Offerte goedgekeurd! Ga naar Projecten om een project aan te maken.');
        }
      }

      toast.success(`${draggedItem.name} verplaatst naar ${PIPELINE_STAGES.find(s => s.id === stage)?.label}`);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Fout bij het verplaatsen');
    }

    setDraggedItem(null);
    setDragOverStage(null);
  };

  // Handle item click
  const handleItemClick = (item: PipelineItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  // Convert quote to project
  const convertToProject = async (item: PipelineItem) => {
    if (item.type !== 'quote') return;

    try {
      const projectData = {
        name: item.projectName,
        description: item.originalData.projectDescription,
        clientId: item.originalData.userId || null,
        clientName: item.name,
        clientEmail: item.email,
        clientCompany: item.company,
        status: 'active',
        type: 'consultation',
        services: item.services,
        budget: {
          amount: item.value || 0,
          currency: 'EUR',
          type: 'fixed' as const,
        },
        timeline: item.timeline,
        quoteId: item.originalData.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.uid,
        progress: 0,
        milestones: [],
        assignedTo: [],
      };

      const projectRef = await addDoc(collection(db, 'projects'), projectData);

      // Update quote to approved
      await updateDoc(doc(db, 'quotes', item.originalData.id), {
        status: 'approved',
        updatedAt: serverTimestamp(),
      });

      toast.success('Project aangemaakt!');
      router.push(`/dashboard/admin/projects/${projectRef.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Fout bij het aanmaken van project');
    }
  };

  // Quick actions
  const sendEmail = (item: PipelineItem) => {
    window.location.href = `mailto:${item.email}?subject=Betreft: ${item.projectName || item.company}`;
  };

  const callPhone = (item: PipelineItem) => {
    if (item.phone) {
      window.location.href = `tel:${item.phone}`;
    }
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080D14' }}>
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange mx-auto" />
          <p className="mt-4 text-white/60">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Kanban className="h-8 w-8 text-orange" />
                Sales Pipeline
              </h1>
              <p className="text-white/60">Beheer leads en offertes van begin tot eind</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-white/60">
                <span className="text-white font-semibold">{stats.total}</span> items
              </div>
              <div className="text-white/60">
                Pipeline waarde: <span className="text-green-400 font-semibold">€{stats.pipelineValue.toLocaleString()}</span>
              </div>
              <div className="text-white/60">
                Gewonnen: <span className="text-orange font-semibold">€{stats.wonValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Zoek op naam, bedrijf of email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {stats.contacts} Contacten
                </Badge>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {stats.quotes} Offertes
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-80 bg-white/5 border border-white/10 rounded-xl transition-all ${
                dragOverStage === stage.id ? 'ring-2 ring-orange bg-orange/5' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Stage Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-white">{stage.label}</h3>
                  </div>
                  <Badge variant="outline" className="bg-white/5 text-white/60 border-white/20">
                    {itemsByStage[stage.id]?.length || 0}
                  </Badge>
                </div>
              </div>

              {/* Stage Items */}
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="p-3 space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="animate-spin h-6 w-6 text-white/40 mx-auto" />
                    </div>
                  ) : itemsByStage[stage.id]?.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-sm">
                      Geen items
                    </div>
                  ) : (
                    <AnimatePresence>
                      {itemsByStage[stage.id]?.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          draggable
                          onDragStart={() => handleDragStart(item)}
                          className={`bg-white/5 border border-white/10 rounded-lg p-4 cursor-move hover:bg-white/10 transition-all ${
                            draggedItem?.id === item.id ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-white/30" />
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  item.type === 'contact'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                }`}
                              >
                                {item.type === 'contact' ? 'Contact' : 'Offerte'}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreVertical className="h-4 w-4 text-white/40" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-black/95 border-white/20">
                                <DropdownMenuItem
                                  onClick={() => handleItemClick(item)}
                                  className="text-white hover:bg-white/10"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Bekijk details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => sendEmail(item)}
                                  className="text-white hover:bg-white/10"
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Stuur email
                                </DropdownMenuItem>
                                {item.phone && (
                                  <DropdownMenuItem
                                    onClick={() => callPhone(item)}
                                    className="text-white hover:bg-white/10"
                                  >
                                    <Phone className="h-4 w-4 mr-2" />
                                    Bel
                                  </DropdownMenuItem>
                                )}
                                {item.type === 'quote' && item.stage === 'gewonnen' && (
                                  <>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem
                                      onClick={() => convertToProject(item)}
                                      className="text-orange hover:bg-orange/10"
                                    >
                                      <Briefcase className="h-4 w-4 mr-2" />
                                      Maak project aan
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div
                            onClick={() => handleItemClick(item)}
                            className="cursor-pointer"
                          >
                            <h4 className="font-medium text-white mb-1 truncate">
                              {item.projectName || item.name}
                            </h4>
                            <div className="flex items-center gap-1 text-sm text-white/60 mb-2">
                              <Building className="h-3 w-3" />
                              <span className="truncate">{item.company}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-white/60 mb-2">
                              <User className="h-3 w-3" />
                              <span className="truncate">{item.name}</span>
                            </div>

                            {item.value && (
                              <div className="flex items-center gap-1 text-sm text-green-400 mb-2">
                                <DollarSign className="h-3 w-3" />
                                <span>€{item.value.toLocaleString()}</span>
                              </div>
                            )}

                            {item.services && item.services.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.services.slice(0, 2).map((service, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs bg-white/5 text-white/60 border-white/10"
                                  >
                                    {service}
                                  </Badge>
                                ))}
                                {item.services.length > 2 && (
                                  <span className="text-xs text-white/40">+{item.services.length - 2}</span>
                                )}
                              </div>
                            )}

                            <div className="text-xs text-white/40 mt-2">
                              {formatDistanceToNow(item.createdAt?.toDate?.() || new Date(), {
                                addSuffix: true,
                                locale: nl,
                              })}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedItem?.type === 'contact' ? (
                  <Mail className="h-5 w-5 text-blue-400" />
                ) : (
                  <FileText className="h-5 w-5 text-purple-400" />
                )}
                {selectedItem?.projectName || selectedItem?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60">Naam</label>
                    <p className="text-white">{selectedItem.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Bedrijf</label>
                    <p className="text-white">{selectedItem.company}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Email</label>
                    <p className="text-white">{selectedItem.email}</p>
                  </div>
                  {selectedItem.phone && (
                    <div>
                      <label className="text-sm text-white/60">Telefoon</label>
                      <p className="text-white">{selectedItem.phone}</p>
                    </div>
                  )}
                </div>

                {selectedItem.type === 'quote' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedItem.budget && (
                        <div>
                          <label className="text-sm text-white/60">Budget</label>
                          <p className="text-white">{selectedItem.budget}</p>
                        </div>
                      )}
                      {selectedItem.timeline && (
                        <div>
                          <label className="text-sm text-white/60">Timeline</label>
                          <p className="text-white">{selectedItem.timeline}</p>
                        </div>
                      )}
                      {selectedItem.value && (
                        <div>
                          <label className="text-sm text-white/60">Waarde</label>
                          <p className="text-green-400 font-semibold">€{selectedItem.value.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {selectedItem.services && selectedItem.services.length > 0 && (
                      <div>
                        <label className="text-sm text-white/60">Services</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedItem.services.map((service, idx) => (
                            <Badge key={idx} variant="outline" className="bg-white/5 text-white border-white/20">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItem.originalData?.projectDescription && (
                      <div>
                        <label className="text-sm text-white/60">Beschrijving</label>
                        <p className="text-white/80 text-sm mt-1 whitespace-pre-wrap">
                          {selectedItem.originalData.projectDescription}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {selectedItem.type === 'contact' && selectedItem.message && (
                  <div>
                    <label className="text-sm text-white/60">Bericht</label>
                    <p className="text-white/80 text-sm mt-1 whitespace-pre-wrap">
                      {selectedItem.message}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <label className="text-sm text-white/60">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${PIPELINE_STAGES.find(s => s.id === selectedItem.stage)?.color} text-white`}>
                      {PIPELINE_STAGES.find(s => s.id === selectedItem.stage)?.label}
                    </Badge>
                    <span className="text-white/40 text-sm">
                      • Aangemaakt {formatDistanceToNow(selectedItem.createdAt?.toDate?.() || new Date(), {
                        addSuffix: true,
                        locale: nl,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => sendEmail(selectedItem!)}
                className="border-white/20 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              {selectedItem?.phone && (
                <Button
                  variant="outline"
                  onClick={() => callPhone(selectedItem!)}
                  className="border-white/20 text-white"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Bel
                </Button>
              )}
              {selectedItem?.type === 'quote' && selectedItem?.stage === 'gewonnen' && (
                <Button
                  onClick={() => {
                    convertToProject(selectedItem);
                    setIsDetailOpen(false);
                  }}
                  className="bg-orange text-white"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Maak Project
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
