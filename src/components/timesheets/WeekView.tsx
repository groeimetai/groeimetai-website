'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import TimeEntryForm from './TimeEntryForm';
import TimeEntryCard from './TimeEntryCard';
import { timesheetService } from '@/services/timesheetService';
import type { TimeEntry, TimesheetWeek, TimesheetWeekStatus } from '@/types';

interface Project {
  id: string;
  name: string;
}

interface WeekViewProps {
  userId: string;
  userName: string;
  projects: Project[];
  targetHoursPerWeek?: number;
}

const statusColors: Record<TimesheetWeekStatus, string> = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  partially_approved: 'bg-yellow-500',
};

const statusLabels: Record<TimesheetWeekStatus, string> = {
  draft: 'Concept',
  submitted: 'Ingediend',
  partially_approved: 'Gedeeltelijk goedgekeurd',
  approved: 'Goedgekeurd',
  rejected: 'Afgekeurd',
};

export default function WeekView({
  userId,
  userName,
  projects,
  targetHoursPerWeek = 40,
}: WeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [weekStatus, setWeekStatus] = useState<TimesheetWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Calculate week dates
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const year = weekStart.getFullYear();
  const weekNumber = timesheetService.getWeekNumber(weekStart);

  // Load entries for current week
  useEffect(() => {
    setLoading(true);
    const weekEnd = addDays(weekStart, 6);

    // Subscribe to real-time updates
    const unsubscribe = timesheetService.subscribeToUserTimeEntries(
      userId,
      year,
      weekNumber,
      (fetchedEntries) => {
        setEntries(fetchedEntries);
        setLoading(false);
      }
    );

    // Load week status
    timesheetService.getTimesheetWeek(userId, year, weekNumber).then(setWeekStatus);

    return () => unsubscribe();
  }, [userId, weekStart, year, weekNumber]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalHours = entries.reduce((sum, e) => sum + e.hours + e.minutes / 60, 0);
    const billableHours = entries
      .filter((e) => e.billable)
      .reduce((sum, e) => sum + e.hours + e.minutes / 60, 0);

    const byDay = weekDays.reduce((acc, day) => {
      const dayEntries = entries.filter((e) => isSameDay(new Date(e.date), day));
      acc[format(day, 'yyyy-MM-dd')] = dayEntries.reduce(
        (sum, e) => sum + e.hours + e.minutes / 60,
        0
      );
      return acc;
    }, {} as Record<string, number>);

    return {
      totalHours,
      billableHours,
      byDay,
      progress: (totalHours / targetHoursPerWeek) * 100,
    };
  }, [entries, weekDays, targetHoursPerWeek]);

  // Navigation
  const goToPreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const goToToday = () => setCurrentDate(new Date());

  // Handlers
  const handleAddEntry = (date: Date) => {
    setSelectedDate(date);
    setEditingEntry(null);
    setShowEntryForm(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setSelectedDate(new Date(entry.date));
    setShowEntryForm(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Weet je zeker dat je deze registratie wilt verwijderen?')) return;
    try {
      await timesheetService.deleteTimeEntry(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleSaveEntry = async (entryData: Partial<TimeEntry>) => {
    try {
      if (editingEntry) {
        await timesheetService.updateTimeEntry(editingEntry.id, entryData);
      } else {
        await timesheetService.createTimeEntry({
          ...entryData,
          userId,
          userName,
        } as any);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  };

  const handleSubmitTimesheet = async () => {
    if (!confirm('Weet je zeker dat je deze week wilt indienen voor goedkeuring?')) return;
    setSubmitting(true);
    try {
      await timesheetService.submitTimesheet(userId, year, weekNumber);
      setWeekStatus((prev) => prev ? { ...prev, status: 'submitted' } : null);
    } catch (error) {
      console.error('Error submitting timesheet:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const currentStatus = weekStatus?.status || 'draft';
  const canEdit = currentStatus === 'draft' || currentStatus === 'rejected';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Urenregistratie</h2>
          <p className="text-white/60">Week {weekNumber}, {year}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[currentStatus]} text-white`}>
            {statusLabels[currentStatus]}
          </Badge>
          {canEdit && entries.length > 0 && (
            <Button
              onClick={handleSubmitTimesheet}
              disabled={submitting}
              className="bg-orange hover:bg-orange/90"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Indienen
            </Button>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="text-center">
              <p className="text-lg font-medium text-white">
                {format(weekStart, 'd MMMM', { locale: nl })} -{' '}
                {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: nl })}
              </p>
              <Button variant="link" className="text-orange" onClick={goToToday}>
                Naar vandaag
              </Button>
            </div>

            <Button variant="ghost" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Week Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60">Totale uren</span>
              <Clock className="w-4 h-4 text-orange" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalHours.toFixed(1)}</p>
            <Progress value={stats.progress} className="h-1 mt-2" />
            <p className="text-xs text-white/40 mt-1">
              {Math.round(stats.progress)}% van {targetHoursPerWeek}u doel
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60">Factureerbaar</span>
              <span className="text-xs text-white/40">
                {stats.totalHours > 0
                  ? Math.round((stats.billableHours / stats.totalHours) * 100)
                  : 0}
                %
              </span>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.billableHours.toFixed(1)}u</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60">Niet-factureerbaar</span>
            </div>
            <p className="text-2xl font-bold text-white/60">
              {(stats.totalHours - stats.billableHours).toFixed(1)}u
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Week Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEntries = entries.filter((e) => isSameDay(new Date(e.date), day));
            const dayHours = stats.byDay[dayKey] || 0;
            const isToday = isSameDay(day, new Date());
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <Card
                key={dayKey}
                className={`bg-white/[0.02] border-white/10 ${
                  isToday ? 'ring-2 ring-orange' : ''
                } ${isWeekend ? 'opacity-70' : ''}`}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {format(day, 'EEEE', { locale: nl })}
                      </p>
                      <p className="text-xs text-white/60">{format(day, 'd MMM', { locale: nl })}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        dayHours >= 8 ? 'border-green-500 text-green-400' : 'border-white/20 text-white/60'
                      }`}
                    >
                      {dayHours.toFixed(1)}u
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {dayEntries.map((entry) => (
                    <TimeEntryCard
                      key={entry.id}
                      entry={entry}
                      projectName={projects.find((p) => p.id === entry.projectId)?.name || 'Unknown'}
                      onEdit={canEdit ? () => handleEditEntry(entry) : undefined}
                      onDelete={canEdit ? () => handleDeleteEntry(entry.id) : undefined}
                    />
                  ))}

                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-white/60 hover:text-white border border-dashed border-white/10 hover:border-white/30"
                      onClick={() => handleAddEntry(day)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Toevoegen
                    </Button>
                  )}

                  {!canEdit && dayEntries.length === 0 && (
                    <p className="text-xs text-white/40 text-center py-2">Geen uren</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Entry Form Dialog */}
      <TimeEntryForm
        open={showEntryForm}
        onOpenChange={setShowEntryForm}
        entry={editingEntry}
        projects={projects}
        defaultDate={selectedDate}
        onSave={handleSaveEntry}
      />
    </div>
  );
}
