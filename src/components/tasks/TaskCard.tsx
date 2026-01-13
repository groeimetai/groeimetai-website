'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, isToday } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  MoreVertical,
  User,
  CheckSquare,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Task, TaskPriority, TaskStatus } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onClick?: (task: Task) => void;
  isDragging?: boolean;
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'text-gray-400 bg-gray-400/10',
  medium: 'text-blue-400 bg-blue-400/10',
  high: 'text-orange bg-orange/10',
  urgent: 'text-red-500 bg-red-500/10',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Laag',
  medium: 'Medium',
  high: 'Hoog',
  urgent: 'Urgent',
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onClick,
  isDragging,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const isOverdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={`
          bg-white/[0.03] border-white/10 cursor-pointer
          hover:border-white/20 hover:bg-white/[0.06]
          transition-all duration-200
          ${isDragging || isSortableDragging ? 'shadow-lg ring-2 ring-orange/50' : ''}
          ${isOverdue ? 'border-red-500/50' : ''}
        `}
        onClick={() => onClick?.(task)}
      >
        <CardContent className="p-4">
          {/* Header with Priority and Menu */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className={`${priorityColors[task.priority]} text-xs`}>
                <Flag className="w-3 h-3 mr-1" />
                {priorityLabels[task.priority]}
              </Badge>
              {task.type && (
                <Badge variant="outline" className="text-xs text-white/60 border-white/20">
                  {task.type}
                </Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-4 h-4 text-white/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(task)}>
                  Bewerken
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {task.status !== 'todo' && (
                  <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'todo')}>
                    Naar Te doen
                  </DropdownMenuItem>
                )}
                {task.status !== 'in_progress' && (
                  <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'in_progress')}>
                    Naar In behandeling
                  </DropdownMenuItem>
                )}
                {task.status !== 'review' && (
                  <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'review')}>
                    Naar Review
                  </DropdownMenuItem>
                )}
                {task.status !== 'done' && (
                  <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'done')}>
                    Naar Voltooid
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(task.id)}
                  className="text-red-500"
                >
                  Verwijderen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <h4
            className="text-white font-medium mb-2 line-clamp-2 cursor-grab"
            {...listeners}
          >
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-white/60 text-sm mb-3 line-clamp-2">{task.description}</p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 3).map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs text-white/50 border-white/10"
                >
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs text-white/50 border-white/10"
                >
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/60 flex items-center">
                  <CheckSquare className="w-3 h-3 mr-1" />
                  Subtaken
                </span>
                <span className="text-xs text-white/60">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
              <Progress value={subtaskProgress} className="h-1" />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            {/* Due Date */}
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <div
                  className={`flex items-center text-xs ${
                    isOverdue
                      ? 'text-red-500'
                      : isDueToday
                      ? 'text-orange'
                      : 'text-white/60'
                  }`}
                >
                  {isOverdue && <AlertTriangle className="w-3 h-3 mr-1" />}
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(task.dueDate), 'd MMM', { locale: nl })}
                </div>
              )}
              {task.estimatedHours && (
                <div className="flex items-center text-xs text-white/60">
                  <Clock className="w-3 h-3 mr-1" />
                  {task.estimatedHours}u
                </div>
              )}
            </div>

            {/* Assignee */}
            {task.assigneeId ? (
              <Avatar className="w-6 h-6">
                {task.assigneeAvatar ? (
                  <AvatarImage src={task.assigneeAvatar} alt={task.assigneeName || ''} />
                ) : null}
                <AvatarFallback className="bg-orange/20 text-orange text-xs">
                  {task.assigneeName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                <User className="w-3 h-3 text-white/40" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
