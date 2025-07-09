'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Briefcase,
  Target,
  Rocket,
  Flag,
  CheckCircle,
  Circle,
  Clock,
  Edit,
  Save,
  User,
  Mail,
  Calendar,
  AlertCircle,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProjectStage {
  id: number;
  name: string;
  icon: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
  progress?: number;
  completedAt?: Timestamp;
  startedAt?: Timestamp;
  estimatedCompletion?: string;
}

interface UserProject {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  projectName: string;
  status: string;
  createdAt: Timestamp;
  stages?: ProjectStage[];
  milestone?: string;
}

// Default stages template - moved outside component to avoid dependency issues
const defaultStages: ProjectStage[] = [
  {
    id: 1,
    name: 'Approval',
    icon: 'shield',
    status: 'current',
    description: 'Awaiting admin approval',
  },
  {
    id: 2,
    name: 'Discovery',
    icon: 'briefcase',
    status: 'upcoming',
    description: 'Understanding your needs',
  },
  {
    id: 3,
    name: 'Planning',
    icon: 'target',
    status: 'upcoming',
    description: 'Defining project scope',
  },
  {
    id: 4,
    name: 'Development',
    icon: 'rocket',
    status: 'upcoming',
    description: 'Building your solution',
  },
  {
    id: 5,
    name: 'Delivery',
    icon: 'flag',
    status: 'upcoming',
    description: 'Final implementation',
  },
];

export default function ProjectTimelineManager() {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<UserProject | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<ProjectStage | null>(null);
  const [loading, setLoading] = useState(true);

  // Icon components mapping
  const stageIcons = {
    shield: Shield,
    briefcase: Briefcase,
    target: Target,
    rocket: Rocket,
    flag: Flag,
  };

  useEffect(() => {
    if (!user || !isAdmin) return;

    // Subscribe to all approved quotes
    const q = query(
      collection(db, 'quotes'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const projectsData: UserProject[] = [];

      for (const docSnapshot of snapshot.docs) {
        const quoteData = docSnapshot.data();

        // Get the timeline data for this project
        const timelineDoc = await getDoc(doc(db, 'projectTimelines', docSnapshot.id));
        const timelineData = timelineDoc.exists() ? timelineDoc.data() : {};

        projectsData.push({
          id: docSnapshot.id,
          userId: quoteData.userId || '',
          userName:
            quoteData.fullName || quoteData.firstName + ' ' + quoteData.lastName || 'Unknown',
          userEmail: quoteData.email || '',
          projectName: quoteData.projectTitle || 'Untitled Project',
          status: quoteData.status,
          createdAt: quoteData.createdAt,
          stages: timelineData.stages || defaultStages,
          milestone: timelineData.milestone || '',
        });
      }

      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const handleStageEdit = (stage: ProjectStage) => {
    setEditingStage(stage);
    setIsEditDialogOpen(true);
  };

  const handleSaveStage = async () => {
    if (!selectedProject || !editingStage) return;

    try {
      const updatedStages =
        selectedProject.stages?.map((stage) =>
          stage.id === editingStage.id ? editingStage : stage
        ) || defaultStages;

      // Update Firestore
      await setDoc(doc(db, 'projectTimelines', selectedProject.id), {
        stages: updatedStages,
        milestone: selectedProject.milestone || '',
        projectName: selectedProject.projectName,
        updatedAt: Timestamp.now(),
      });

      toast.success('Timeline updated successfully');
      setIsEditDialogOpen(false);
      setEditingStage(null);
    } catch (error) {
      console.error('Error updating timeline:', error);
      toast.error('Failed to update timeline');
    }
  };

  const handleUpdateMilestone = async (milestone: string) => {
    if (!selectedProject) return;

    try {
      await setDoc(
        doc(db, 'projectTimelines', selectedProject.id),
        {
          stages: selectedProject.stages || defaultStages,
          milestone: milestone,
          projectName: selectedProject.projectName,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      toast.success('Milestone updated');
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  const calculateProgress = (stages: ProjectStage[]) => {
    const completedCount = stages.filter((s) => s.status === 'completed').length;
    const currentStage = stages.find((s) => s.status === 'current');
    const currentProgress = currentStage?.progress || 0;
    return Math.round((completedCount * 100 + currentProgress) / stages.length);
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-white/60">You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-white/60 text-center py-8">Loading projects...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Projects List */}
      <div className="lg:col-span-1">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Active Projects</CardTitle>
            <CardDescription className="text-white/60">
              Select a project to manage its timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedProject?.id === project.id
                    ? 'bg-orange/20 border-orange/50'
                    : 'bg-white/5 hover:bg-white/10'
                } border border-white/10`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{project.userName}</p>
                    <p className="text-sm text-white/60">{project.projectName}</p>
                    <p className="text-xs text-white/40">{project.userEmail}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {calculateProgress(project.stages || defaultStages)}%
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Timeline Editor */}
      <div className="lg:col-span-2">
        {selectedProject ? (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Project Timeline</CardTitle>
                  <CardDescription className="text-white/60">
                    {selectedProject.projectName} - {selectedProject.userName}
                  </CardDescription>
                </div>
                <Badge className="bg-orange/20 text-orange">
                  {calculateProgress(selectedProject.stages || defaultStages)}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Milestone */}
              <div>
                <Label className="text-white mb-2">Next Milestone</Label>
                <div className="flex gap-2">
                  <Input
                    value={selectedProject.milestone || ''}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        milestone: e.target.value,
                      })
                    }
                    placeholder="Enter next milestone..."
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Button
                    onClick={() => handleUpdateMilestone(selectedProject.milestone || '')}
                    className="bg-orange hover:bg-orange/90"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Timeline Stages */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/80">Project Stages</h3>
                {(selectedProject.stages || defaultStages).map((stage, index) => {
                  const StageIcon = stageIcons[stage.icon as keyof typeof stageIcons] || Briefcase;

                  return (
                    <div key={stage.id} className="relative">
                      {index < (selectedProject.stages || defaultStages).length - 1 && (
                        <div
                          className={`absolute left-5 top-12 bottom-0 w-0.5 ${
                            stage.status === 'completed' ? 'bg-green-500' : 'bg-white/20'
                          }`}
                        />
                      )}

                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            stage.status === 'completed'
                              ? 'bg-green-500'
                              : stage.status === 'current'
                                ? 'bg-orange'
                                : 'bg-white/20'
                          }`}
                        >
                          {stage.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : stage.status === 'current' ? (
                            <Circle className="w-5 h-5 text-white animate-pulse" />
                          ) : (
                            <StageIcon className="w-5 h-5 text-white/60" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white">{stage.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStageEdit(stage)}
                              className="text-white/60 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-white/60 mt-1">{stage.description}</p>
                          {stage.status === 'current' && stage.progress !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-white/60 mb-1">
                                <span>Progress</span>
                                <span>{stage.progress}%</span>
                              </div>
                              <Progress value={stage.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Select a project to manage its timeline</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Stage Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-black/95 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Stage: {editingStage?.name}</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the stage details and progress
            </DialogDescription>
          </DialogHeader>

          {editingStage && (
            <div className="space-y-4">
              <div>
                <Label className="text-white">Status</Label>
                <Select
                  value={editingStage.status}
                  onValueChange={(value) =>
                    setEditingStage({
                      ...editingStage,
                      status: value as 'completed' | 'current' | 'upcoming',
                    })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Description</Label>
                <Textarea
                  value={editingStage.description}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      description: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>

              {editingStage.status === 'current' && (
                <div>
                  <Label className="text-white">Progress (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingStage.progress || 0}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        progress: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              )}

              {editingStage.status !== 'upcoming' && (
                <div>
                  <Label className="text-white">Estimated Completion</Label>
                  <Input
                    value={editingStage.estimatedCompletion || ''}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        estimatedCompletion: e.target.value,
                      })
                    }
                    placeholder="e.g., March 2024"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-white/20"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveStage} className="bg-orange hover:bg-orange/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
