'use client';

import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  User,
  CheckSquare,
  Plus,
  Send,
  Flag,
  Tag,
  MessageSquare,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { taskService } from '@/services/taskService';
import type { Task, TaskStatus, TaskComment } from '@/types';

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
}

const priorityColors: Record<string, string> = {
  low: 'text-gray-400 bg-gray-400/10',
  medium: 'text-blue-400 bg-blue-400/10',
  high: 'text-orange bg-orange/10',
  urgent: 'text-red-500 bg-red-500/10',
};

const statusLabels: Record<TaskStatus, string> = {
  todo: 'Te doen',
  in_progress: 'In behandeling',
  review: 'Review',
  done: 'Voltooid',
  blocked: 'Geblokkeerd',
};

export default function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: TaskDetailDialogProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load comments
  useEffect(() => {
    if (open && task) {
      setLoadingComments(true);
      taskService.getTaskComments(task.id).then((fetchedComments) => {
        setComments(fetchedComments);
        setLoadingComments(false);
      });
    }
  }, [open, task]);

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const commentId = await taskService.addComment(task.id, {
        userId: currentUserId,
        userName: currentUserName,
        userAvatar: currentUserAvatar,
        content: newComment.trim(),
        mentions: [],
      });
      setComments([
        ...comments,
        {
          id: commentId,
          taskId: task.id,
          userId: currentUserId,
          userName: currentUserName,
          userAvatar: currentUserAvatar,
          content: newComment.trim(),
          mentions: [],
          createdAt: new Date(),
        },
      ]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    try {
      await taskService.addSubtask(task.id, {
        title: newSubtask.trim(),
        completed: false,
      });
      setNewSubtask('');
      // Refresh task data here if needed
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      await taskService.toggleSubtask(task.id, subtaskId, completed, currentUserId);
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0f1a] border-white/20 text-white max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={priorityColors[task.priority]}>
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority}
                </Badge>
                <Badge variant="outline" className="text-white/60 border-white/20">
                  {task.type}
                </Badge>
                <Badge variant="outline" className="text-white/60 border-white/20">
                  {statusLabels[task.status]}
                </Badge>
              </div>
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(task);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-400"
                onClick={() => {
                  if (confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
                    onDelete(task.id);
                    onOpenChange(false);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-150px)]">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-white/5 w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="subtasks" className="flex-1">
                Subtaken ({totalSubtasks})
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex-1">
                Opmerkingen ({comments.length})
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-4">
              {/* Description */}
              {task.description && (
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Beschrijving</h4>
                  <p className="text-white/80">{task.description}</p>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                {/* Assignee */}
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Toegewezen aan</h4>
                  {task.assigneeId ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        {task.assigneeAvatar && (
                          <AvatarImage src={task.assigneeAvatar} alt={task.assigneeName || ''} />
                        )}
                        <AvatarFallback className="bg-orange/20 text-orange">
                          {task.assigneeName?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white">{task.assigneeName}</span>
                    </div>
                  ) : (
                    <span className="text-white/40">Niet toegewezen</span>
                  )}
                </div>

                {/* Reporter */}
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Aangemaakt door</h4>
                  <span className="text-white">{task.reporterName}</span>
                </div>

                {/* Due Date */}
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Deadline</h4>
                  {task.dueDate ? (
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="w-4 h-4 text-white/60" />
                      {format(new Date(task.dueDate), 'PPP', { locale: nl })}
                    </div>
                  ) : (
                    <span className="text-white/40">Geen deadline</span>
                  )}
                </div>

                {/* Estimated Hours */}
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Geschatte uren</h4>
                  {task.estimatedHours ? (
                    <div className="flex items-center gap-2 text-white">
                      <Clock className="w-4 h-4 text-white/60" />
                      {task.estimatedHours} uur
                    </div>
                  ) : (
                    <span className="text-white/40">Niet ingeschat</span>
                  )}
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-white/80 border-white/20"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-white/40 pt-4 border-t border-white/10">
                <p>
                  Aangemaakt: {format(new Date(task.createdAt), 'PPp', { locale: nl })}
                </p>
                <p>
                  Laatst bijgewerkt: {formatDistanceToNow(new Date(task.updatedAt), {
                    addSuffix: true,
                    locale: nl,
                  })}
                </p>
              </div>
            </TabsContent>

            {/* Subtasks Tab */}
            <TabsContent value="subtasks" className="mt-4">
              {totalSubtasks > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Voortgang</span>
                    <span className="text-sm text-white/60">
                      {completedSubtasks}/{totalSubtasks}
                    </span>
                  </div>
                  <Progress value={subtaskProgress} className="h-2" />
                </div>
              )}

              <div className="space-y-2">
                {task.subtasks?.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg"
                  >
                    <Checkbox
                      checked={subtask.completed}
                      onChange={(e) =>
                        handleToggleSubtask(subtask.id, e.target.checked)
                      }
                    />
                    <span
                      className={`flex-1 ${
                        subtask.completed ? 'text-white/40 line-through' : 'text-white'
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Subtask */}
              <div className="flex gap-2 mt-4">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Nieuwe subtaak..."
                  className="bg-white/5 border-white/10 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddSubtask}
                  className="border-white/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="mt-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      {comment.userAvatar && (
                        <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                      )}
                      <AvatarFallback className="bg-orange/20 text-orange text-xs">
                        {comment.userName?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{comment.userName}</span>
                        <span className="text-xs text-white/40">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: nl,
                          })}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && !loadingComments && (
                  <p className="text-center text-white/40 py-8">
                    Nog geen opmerkingen
                  </p>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Avatar className="w-8 h-8">
                  {currentUserAvatar && (
                    <AvatarImage src={currentUserAvatar} alt={currentUserName} />
                  )}
                  <AvatarFallback className="bg-orange/20 text-orange text-xs">
                    {currentUserName?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Schrijf een opmerking..."
                    className="bg-white/5 border-white/10 text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="bg-orange hover:bg-orange/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
