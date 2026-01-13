'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '@/types';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  limit?: number;
  onAddTask?: (status: TaskStatus) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

export default function KanbanColumn({
  id,
  title,
  tasks,
  color,
  limit,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const isOverLimit = limit !== undefined && tasks.length >= limit;

  return (
    <div
      className={`
        flex flex-col min-w-[300px] max-w-[300px]
        bg-white/[0.02] rounded-xl border
        ${isOver ? 'border-orange/50 bg-orange/5' : 'border-white/10'}
        transition-colors duration-200
      `}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <h3 className="font-semibold text-white">{title}</h3>
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-medium
                ${isOverLimit ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'}
              `}
            >
              {tasks.length}
              {limit !== undefined && `/${limit}`}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => onAddTask?.(id)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)]"
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
              onClick={onTaskClick}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-white/40 text-sm">Geen taken</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-white/60 hover:text-white"
              onClick={() => onAddTask?.(id)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Taak toevoegen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
