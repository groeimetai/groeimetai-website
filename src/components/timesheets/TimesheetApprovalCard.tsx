'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Check, X, Clock, User, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { TimesheetWeek, TimeEntry } from '@/types';

interface TimesheetApprovalCardProps {
  timesheet: TimesheetWeek;
  userName: string;
  userAvatar?: string;
  entries?: TimeEntry[];
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

export default function TimesheetApprovalCard({
  timesheet,
  userName,
  userAvatar,
  entries = [],
  onApprove,
  onReject,
}: TimesheetApprovalCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove();
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsRejecting(true);
    try {
      await onReject(rejectReason.trim());
      setShowRejectDialog(false);
      setRejectReason('');
    } finally {
      setIsRejecting(false);
    }
  };

  // Calculate week dates
  const weekStart = new Date(timesheet.year, 0, 1 + (timesheet.weekNumber - 1) * 7);
  const weekDay = weekStart.getDay();
  const diff = weekStart.getDate() - weekDay + (weekDay === 0 ? -6 : 1);
  const adjustedWeekStart = new Date(weekStart.setDate(diff));

  // Group entries by project
  const byProject: Record<string, { name: string; hours: number }> = {};
  entries.forEach((entry) => {
    if (!byProject[entry.projectId]) {
      byProject[entry.projectId] = { name: entry.projectId, hours: 0 };
    }
    byProject[entry.projectId].hours += entry.hours + entry.minutes / 60;
  });

  return (
    <>
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
                <AvatarFallback className="bg-orange/20 text-orange">
                  {userName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{userName}</CardTitle>
                <p className="text-sm text-white/60">
                  Week {timesheet.weekNumber}, {timesheet.year}
                </p>
              </div>
            </div>
            <Badge className="bg-blue-500 text-white">Ter goedkeuring</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Calendar className="w-4 h-4" />
            {format(adjustedWeekStart, 'd MMM', { locale: nl })} -{' '}
            {format(new Date(adjustedWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000), 'd MMM yyyy', { locale: nl })}
          </div>

          {/* Hours summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.03] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/60">Totaal</span>
              </div>
              <p className="text-xl font-bold text-white">{timesheet.totalHours.toFixed(1)}u</p>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-white/60">Factureerbaar</span>
              </div>
              <p className="text-xl font-bold text-green-400">{timesheet.billableHours.toFixed(1)}u</p>
            </div>
          </div>

          {/* Projects breakdown */}
          {Object.keys(byProject).length > 0 && (
            <div>
              <p className="text-sm text-white/60 mb-2">Per project:</p>
              <div className="space-y-1">
                {Object.values(byProject).map((project, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm bg-white/[0.02] rounded px-2 py-1"
                  >
                    <span className="text-white/80 truncate">{project.name}</span>
                    <span className="text-white/60">{project.hours.toFixed(1)}u</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submitted date */}
          {timesheet.submittedAt && (
            <p className="text-xs text-white/40">
              Ingediend op: {format(new Date(timesheet.submittedAt), 'PPp', { locale: nl })}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Goedkeuren
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Afkeuren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-[#0a0f1a] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Urenstaat afkeuren</DialogTitle>
            <DialogDescription className="text-white/60">
              Geef een reden op waarom deze urenstaat wordt afgekeurd.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reden voor afkeuring..."
            className="bg-white/5 border-white/10 text-white min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              className="border-white/20"
            >
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || isRejecting}
            >
              {isRejecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Afkeuren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
