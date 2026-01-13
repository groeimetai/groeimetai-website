'use client';

import { Clock, Edit, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TimeEntry } from '@/types';

interface TimeEntryCardProps {
  entry: TimeEntry;
  projectName: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TimeEntryCard({
  entry,
  projectName,
  onEdit,
  onDelete,
}: TimeEntryCardProps) {
  const hours = entry.hours + entry.minutes / 60;

  return (
    <div className="bg-white/[0.03] rounded-lg p-2 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">{projectName}</p>
          {entry.description && (
            <p className="text-xs text-white/60 truncate mt-0.5">{entry.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {entry.billable && (
            <Receipt className="w-3 h-3 text-green-400" />
          )}
          <Badge
            variant="outline"
            className="text-xs border-white/20 text-white/80 px-1 py-0"
          >
            {hours.toFixed(1)}u
          </Badge>
        </div>
      </div>

      {/* Actions on hover */}
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-white/60 hover:text-white"
              onClick={onEdit}
            >
              <Edit className="w-3 h-3 mr-1" />
              Bewerk
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Verwijder
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
