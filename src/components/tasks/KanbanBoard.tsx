'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Loader2, Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskDetailDialog from './TaskDetailDialog';
import { taskService } from '@/services/taskService';
import type { Task, TaskStatus, KanbanColumn as KanbanColumnType, TaskPriority } from '@/types';

interface KanbanBoardProps {
  projectId: string;
  projectName?: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  teamMembers?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

const COLUMNS: KanbanColumnType[] = [
  { id: 'todo', title: 'Te doen', tasks: [], color: 'bg-gray-500' },
  { id: 'in_progress', title: 'In behandeling', tasks: [], color: 'bg-blue-500' },
  { id: 'review', title: 'Review', tasks: [], color: 'bg-purple-500' },
  { id: 'done', title: 'Voltooid', tasks: [], color: 'bg-green-500' },
];

export default function KanbanBoard({
  projectId,
  projectName,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  teamMembers = [],
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load tasks
  useEffect(() => {
    setLoading(true);
    const unsubscribe = taskService.subscribeToProjectTasks(projectId, (fetchedTasks) => {
      setTasks(fetchedTasks);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [projectId]);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !task.title.toLowerCase().includes(query) &&
        !task.description.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned' && task.assigneeId) return false;
      if (assigneeFilter !== 'unassigned' && task.assigneeId !== assigneeFilter) return false;
    }
    return true;
  });

  // Group tasks by status
  const getTasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dragging over a column
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    if (isOverColumn) {
      const newStatus = overId as TaskStatus;
      if (activeTask.status !== newStatus) {
        setTasks((prev) =>
          prev.map((t) => (t.id === activeId ? { ...t, status: newStatus } : t))
        );
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine new status
    let newStatus = activeTask.status;
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    if (isOverColumn) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Calculate new order
    const columnTasks = tasks
      .filter((t) => t.status === newStatus && t.id !== activeId)
      .sort((a, b) => a.order - b.order);

    let newOrder = 0;
    if (!isOverColumn) {
      const overIndex = columnTasks.findIndex((t) => t.id === overId);
      if (overIndex !== -1) {
        newOrder = overIndex;
      }
    } else {
      newOrder = columnTasks.length;
    }

    // Update task in database
    try {
      await taskService.updateTaskStatus(activeId, newStatus, newOrder);

      // Update local state
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.id === activeId ? { ...t, status: newStatus, order: newOrder } : t
        );
        return updated;
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Task actions
  const handleAddTask = (status: TaskStatus) => {
    setInitialStatus(status);
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Weet je zeker dat je deze taak wilt verwijderen?')) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const order = await taskService.getNextOrder(projectId, status);
      await taskService.updateTaskStatus(taskId, status, order);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status, order } : t)));
    } catch (error) {
      console.error('Error changing task status:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskData);
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } : t))
        );
      } else {
        const order = await taskService.getNextOrder(projectId, initialStatus);
        const id = await taskService.createTask({
          ...taskData,
          projectId,
          projectName,
          status: initialStatus,
          order,
          reporterId: currentUserId,
          reporterName: currentUserName,
          subtasks: [],
          attachments: [],
          tags: taskData.tags || [],
          watchers: [],
        } as any);
        const newTask = await taskService.getTask(id);
        if (newTask) {
          setTasks((prev) => [...prev, newTask]);
        }
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Zoek taken..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Prioriteit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">Hoog</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Laag</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Toegewezen aan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Iedereen</SelectItem>
              <SelectItem value="unassigned">Niet toegewezen</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => handleAddTask('todo')}
          className="bg-orange hover:bg-orange/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe taak
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={getTasksByStatus(column.id)}
              color={column.color}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Task Form Dialog */}
      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        task={editingTask}
        initialStatus={initialStatus}
        teamMembers={teamMembers}
        onSave={handleTaskSave}
      />

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog
          open={showTaskDetail}
          onOpenChange={setShowTaskDetail}
          task={selectedTask}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatar}
        />
      )}
    </div>
  );
}
