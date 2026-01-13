'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import type { TimeEntry, TimeEntryStatus } from '@/types';

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  projectId: string;
}

interface TimeEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: TimeEntry | null;
  projects: Project[];
  tasks?: Task[];
  defaultDate?: Date;
  onSave: (entryData: Partial<TimeEntry>) => void;
}

export default function TimeEntryForm({
  open,
  onOpenChange,
  entry,
  projects,
  tasks = [],
  defaultDate = new Date(),
  onSave,
}: TimeEntryFormProps) {
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [date, setDate] = useState<Date>(defaultDate);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [hourlyRate, setHourlyRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when entry changes
  useEffect(() => {
    if (entry) {
      setProjectId(entry.projectId);
      setTaskId(entry.taskId || '');
      setDate(new Date(entry.date));
      setHours(entry.hours.toString());
      setMinutes(entry.minutes.toString());
      setDescription(entry.description);
      setBillable(entry.billable);
      setHourlyRate(entry.hourlyRate?.toString() || '');
    } else {
      setProjectId('');
      setTaskId('');
      setDate(defaultDate);
      setHours('0');
      setMinutes('0');
      setDescription('');
      setBillable(true);
      setHourlyRate('');
    }
  }, [entry, open, defaultDate]);

  // Filter tasks by selected project
  const availableTasks = tasks.filter((t) => t.projectId === projectId);

  const handleSubmit = async () => {
    if (!projectId || (parseInt(hours) === 0 && parseInt(minutes) === 0)) return;

    setIsSubmitting(true);
    try {
      const entryData: Partial<TimeEntry> = {
        projectId,
        taskId: taskId || undefined,
        date,
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        description: description.trim(),
        billable,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        status: 'draft' as TimeEntryStatus,
      };

      await onSave(entryData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving time entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDecimalHours = parseInt(hours || '0') + parseInt(minutes || '0') / 60;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0f1a] border-white/20 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? 'Uren bewerken' : 'Uren registreren'}</DialogTitle>
          <DialogDescription className="text-white/60">
            {entry ? 'Pas de geregistreerde uren aan.' : 'Registreer je gewerkte uren.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date */}
          <div className="space-y-2">
            <Label>Datum *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'EEEE d MMMM yyyy', { locale: nl })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select value={projectId} onValueChange={(v) => { setProjectId(v); setTaskId(''); }}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Selecteer een project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task (optional) */}
          {availableTasks.length > 0 && (
            <div className="space-y-2">
              <Label>Taak (optioneel)</Label>
              <Select value={taskId} onValueChange={setTaskId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecteer een taak..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Geen specifieke taak</SelectItem>
                  {availableTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Hours and Minutes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Uren *</Label>
              <Select value={hours} onValueChange={setHours}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i} uur
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">Minuten *</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 15, 30, 45].map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Total display */}
          <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange" />
              <span className="text-white/60">Totaal:</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {totalDecimalHours.toFixed(2)} uur
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Wat heb je gedaan..."
              className="bg-white/5 border-white/10 text-white min-h-[80px]"
            />
          </div>

          {/* Billable and Rate */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
              />
              <Label className="cursor-pointer" onClick={() => setBillable(!billable)}>
                Factureerbaar
              </Label>
            </div>
            {billable && (
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Uurtarief</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="0.00"
                  className="bg-white/5 border-white/10 text-white"
                />
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
            disabled={!projectId || (parseInt(hours) === 0 && parseInt(minutes) === 0) || isSubmitting}
            className="bg-orange hover:bg-orange/90"
          >
            {isSubmitting ? 'Opslaan...' : entry ? 'Opslaan' : 'Registreren'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
