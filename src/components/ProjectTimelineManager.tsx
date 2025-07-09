'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase, Target, Rocket, Flag, Save, AlertCircle, Loader2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectStage {
  id: number;
  name: string;
  icon: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
  progress?: number;
  completedAt?: any;
  startedAt?: any;
  estimatedCompletion?: string;
}

interface ProjectTimelineManagerProps {
  quoteId: string;
  projectName: string;
  onClose?: () => void;
}

const stageIcons = {
  shield: Shield,
  briefcase: Briefcase,
  target: Target,
  rocket: Rocket,
  flag: Flag,
};

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
    description: 'Final deployment',
  },
];

export default function ProjectTimelineManager({
  quoteId,
  projectName,
  onClose,
}: ProjectTimelineManagerProps) {
  const [stages, setStages] = useState<ProjectStage[]>(defaultStages);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [milestone, setMilestone] = useState('');

  // Load existing timeline
  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const timelineRef = doc(db, 'projectTimelines', quoteId);
        const timelineDoc = await getDoc(timelineRef);

        if (timelineDoc.exists()) {
          const data = timelineDoc.data();
          setStages(data.stages || defaultStages);
          setMilestone(data.milestone || '');
        }
      } catch (err) {
        console.error('Error loading timeline:', err);
        setError('Failed to load timeline');
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeline();
  }, [quoteId]);

  const updateStage = (stageId: number, updates: Partial<ProjectStage>) => {
    setStages((prev) =>
      prev.map((stage) => (stage.id === stageId ? { ...stage, ...updates } : stage))
    );
  };

  const handleStageStatusChange = (stageId: number, newStatus: ProjectStage['status']) => {
    const updatedStages = stages.map((stage) => {
      if (stage.id === stageId) {
        const updates: Partial<ProjectStage> = { status: newStatus };

        if (newStatus === 'current' && !stage.startedAt) {
          updates.startedAt = new Date();
          updates.progress = 0;
        } else if (newStatus === 'completed' && !stage.completedAt) {
          updates.completedAt = new Date();
          updates.progress = 100;
        } else if (newStatus === 'upcoming') {
          updates.progress = undefined;
          updates.startedAt = undefined;
          updates.completedAt = undefined;
        }

        return { ...stage, ...updates };
      }

      // Ensure only one stage is current
      if (newStatus === 'current' && stage.status === 'current') {
        return { ...stage, status: 'upcoming' };
      }

      return stage;
    });

    setStages(updatedStages as ProjectStage[]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const timelineRef = doc(db, 'projectTimelines', quoteId);
      await setDoc(
        timelineRef,
        {
          quoteId,
          projectName,
          stages,
          milestone,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccessMessage('Timeline updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving timeline:', err);
      setError('Failed to save timeline');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Project Timeline</h3>
        <p className="text-sm text-white/60">{projectName}</p>
      </div>

      {error && (
        <Alert className="bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <AlertCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const Icon = stageIcons[stage.icon as keyof typeof stageIcons] || Briefcase;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-2 rounded-lg ${
                    stage.status === 'completed'
                      ? 'bg-green/20'
                      : stage.status === 'current'
                        ? 'bg-orange/20'
                        : 'bg-white/10'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      stage.status === 'completed'
                        ? 'text-green'
                        : stage.status === 'current'
                          ? 'text-orange'
                          : 'text-white/60'
                    }`}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{stage.name}</h4>
                      <p className="text-sm text-white/60">{stage.description}</p>
                    </div>

                    <Select
                      value={stage.status}
                      onValueChange={(value) =>
                        handleStageStatusChange(stage.id, value as ProjectStage['status'])
                      }
                    >
                      <SelectTrigger className="w-32 bg-white/5 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {stage.status === 'current' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Label className="text-white/60">Progress</Label>
                        <span className="text-white">{stage.progress || 0}%</span>
                      </div>
                      <Progress value={stage.progress || 0} className="h-2" />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={stage.progress || 0}
                        onChange={(e) =>
                          updateStage(stage.id, { progress: parseInt(e.target.value) || 0 })
                        }
                        className="mt-2 bg-white/5 border-white/20"
                        placeholder="Progress %"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={stage.estimatedCompletion || ''}
                      onChange={(e) =>
                        updateStage(stage.id, { estimatedCompletion: e.target.value })
                      }
                      type="date"
                      className="bg-white/5 border-white/20"
                      placeholder="Estimated completion"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Next Milestone */}
      <div className="space-y-2">
        <Label className="text-white">Next Milestone</Label>
        <Textarea
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
          className="bg-white/5 border-white/20 text-white"
          placeholder="Describe the next major milestone..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-orange hover:bg-orange/90 text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Timeline
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
