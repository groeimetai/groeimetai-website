'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  initialStatus?: TaskStatus;
  teamMembers?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  onSave: (taskData: Partial<Task>) => void;
}

export default function TaskForm({
  open,
  onOpenChange,
  task,
  initialStatus = 'todo',
  teamMembers = [],
  onSave,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [type, setType] = useState<TaskType>('task');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [estimatedHours, setEstimatedHours] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setType(task.type);
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setEstimatedHours(task.estimatedHours?.toString() || '');
      setTags(task.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setType('task');
      setAssigneeId('');
      setDueDate(undefined);
      setEstimatedHours('');
      setTags([]);
    }
  }, [task, open]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const assignee = teamMembers.find((m) => m.id === assigneeId);

      const taskData: Partial<Task> = {
        title: title.trim(),
        description: description.trim(),
        priority,
        type,
        assigneeId: assigneeId || undefined,
        assigneeName: assignee?.name,
        assigneeAvatar: assignee?.avatar,
        dueDate,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
        tags,
      };

      await onSave(taskData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0f1a] border-white/20 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? 'Taak bewerken' : 'Nieuwe taak'}</DialogTitle>
          <DialogDescription className="text-white/60">
            {task ? 'Pas de taakgegevens aan.' : 'Voeg een nieuwe taak toe aan het project.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Voer een titel in..."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Voeg een beschrijving toe..."
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>

          {/* Priority and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioriteit</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Laag</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">Hoog</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Taak</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="improvement">Verbetering</SelectItem>
                  <SelectItem value="documentation">Documentatie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label>Toegewezen aan</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Selecteer iemand..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Niet toegewezen</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Selecteer datum'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Geschatte uren</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="0"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Voeg tag toe..."
                className="bg-white/5 border-white/10 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTag}
                className="border-white/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-white/80 border-white/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20"
          >
            Annuleren
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="bg-orange hover:bg-orange/90"
          >
            {isSubmitting ? 'Opslaan...' : task ? 'Opslaan' : 'Toevoegen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
