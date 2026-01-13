import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskComment,
  Subtask,
  TaskFilter,
} from '@/types';

const TASKS_COLLECTION = 'tasks';
const COMMENTS_COLLECTION = 'comments';

// Helper to convert Firestore timestamps to Dates
const convertTimestamps = (data: any): any => {
  const result = { ...data };
  if (result.dueDate?.toDate) result.dueDate = result.dueDate.toDate();
  if (result.startDate?.toDate) result.startDate = result.startDate.toDate();
  if (result.createdAt?.toDate) result.createdAt = result.createdAt.toDate();
  if (result.updatedAt?.toDate) result.updatedAt = result.updatedAt.toDate();
  if (result.completedAt?.toDate) result.completedAt = result.completedAt.toDate();
  if (result.subtasks) {
    result.subtasks = result.subtasks.map((st: any) => ({
      ...st,
      completedAt: st.completedAt?.toDate?.() || st.completedAt,
    }));
  }
  if (result.attachments) {
    result.attachments = result.attachments.map((att: any) => ({
      ...att,
      uploadedAt: att.uploadedAt?.toDate?.() || att.uploadedAt,
    }));
  }
  return result;
};

export const taskService = {
  // Get all tasks for a project
  async getTasksByProject(projectId: string): Promise<Task[]> {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Task[];
  },

  // Get a single task by ID
  async getTask(taskId: string): Promise<Task | null> {
    const docRef = doc(db, TASKS_COLLECTION, taskId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...convertTimestamps(docSnap.data()),
    } as Task;
  },

  // Create a new task
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
      ...taskData,
      subtasks: taskData.subtasks || [],
      attachments: taskData.attachments || [],
      tags: taskData.tags || [],
      watchers: taskData.watchers || [],
      dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null,
      startDate: taskData.startDate ? Timestamp.fromDate(new Date(taskData.startDate)) : null,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  // Update a task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const docRef = doc(db, TASKS_COLLECTION, taskId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Convert dates to Timestamps
    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
    }
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
    }
    if (updates.completedAt) {
      updateData.completedAt = Timestamp.fromDate(new Date(updates.completedAt));
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(docRef, updateData);
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    const docRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(docRef);
  },

  // Update task status (for Kanban drag & drop)
  async updateTaskStatus(taskId: string, status: TaskStatus, newOrder?: number): Promise<void> {
    const updates: Partial<Task> = { status };
    if (newOrder !== undefined) {
      updates.order = newOrder;
    }
    if (status === 'done') {
      updates.completedAt = new Date();
    }
    await this.updateTask(taskId, updates);
  },

  // Reorder tasks within a column (batch update)
  async reorderTasks(tasks: { id: string; order: number }[]): Promise<void> {
    const batch = writeBatch(db);
    tasks.forEach(({ id, order }) => {
      const docRef = doc(db, TASKS_COLLECTION, id);
      batch.update(docRef, { order, updatedAt: Timestamp.now() });
    });
    await batch.commit();
  },

  // Add subtask to task
  async addSubtask(taskId: string, subtask: Omit<Subtask, 'id'>): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error('Task not found');

    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      ...subtask,
    };

    await this.updateTask(taskId, {
      subtasks: [...task.subtasks, newSubtask],
    });
  },

  // Toggle subtask completion
  async toggleSubtask(
    taskId: string,
    subtaskId: string,
    completed: boolean,
    userId?: string
  ): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error('Task not found');

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId
        ? {
            ...st,
            completed,
            completedAt: completed ? new Date() : undefined,
            completedBy: completed ? userId : undefined,
          }
        : st
    );

    await this.updateTask(taskId, { subtasks: updatedSubtasks });
  },

  // Delete subtask
  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error('Task not found');

    await this.updateTask(taskId, {
      subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
    });
  },

  // Get comments for a task
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    const q = query(
      collection(db, TASKS_COLLECTION, taskId, COMMENTS_COLLECTION),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        taskId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        content: data.content,
        mentions: data.mentions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        edited: data.edited || false,
      } as TaskComment;
    });
  },

  // Add comment to task
  async addComment(
    taskId: string,
    comment: Omit<TaskComment, 'id' | 'taskId' | 'createdAt'>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION, taskId, COMMENTS_COLLECTION), {
      ...comment,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Update comment
  async updateComment(taskId: string, commentId: string, content: string): Promise<void> {
    const docRef = doc(db, TASKS_COLLECTION, taskId, COMMENTS_COLLECTION, commentId);
    await updateDoc(docRef, {
      content,
      updatedAt: Timestamp.now(),
      edited: true,
    });
  },

  // Delete comment
  async deleteComment(taskId: string, commentId: string): Promise<void> {
    const docRef = doc(db, TASKS_COLLECTION, taskId, COMMENTS_COLLECTION, commentId);
    await deleteDoc(docRef);
  },

  // Subscribe to project tasks (real-time)
  subscribeToProjectTasks(
    projectId: string,
    callback: (tasks: Task[]) => void
  ): () => void {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('order', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertTimestamps(doc.data()),
      })) as Task[];
      callback(tasks);
    });
  },

  // Get tasks by assignee
  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('assigneeId', '==', assigneeId),
      orderBy('dueDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Task[];
  },

  // Get overdue tasks
  async getOverdueTasks(projectId?: string): Promise<Task[]> {
    const now = new Date();
    let q = query(
      collection(db, TASKS_COLLECTION),
      where('status', 'in', ['todo', 'in_progress', 'review']),
      where('dueDate', '<', Timestamp.fromDate(now)),
      orderBy('dueDate', 'asc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    let tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Task[];

    if (projectId) {
      tasks = tasks.filter((t) => t.projectId === projectId);
    }

    return tasks;
  },

  // Get task statistics for a project
  async getProjectTaskStats(projectId: string): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
    overdue: number;
  }> {
    const tasks = await this.getTasksByProject(projectId);
    const now = new Date();

    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      review: tasks.filter((t) => t.status === 'review').length,
      done: tasks.filter((t) => t.status === 'done').length,
      blocked: tasks.filter((t) => t.status === 'blocked').length,
      overdue: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
      ).length,
    };
  },

  // Search tasks
  async searchTasks(searchQuery: string, projectId?: string): Promise<Task[]> {
    // Note: Firestore doesn't support full-text search, so we fetch and filter client-side
    // For production, consider using Algolia or similar
    let tasks: Task[];

    if (projectId) {
      tasks = await this.getTasksByProject(projectId);
    } else {
      const snapshot = await getDocs(collection(db, TASKS_COLLECTION));
      tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertTimestamps(doc.data()),
      })) as Task[];
    }

    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  },

  // Assign task to user
  async assignTask(
    taskId: string,
    assigneeId: string,
    assigneeName: string,
    assigneeAvatar?: string
  ): Promise<void> {
    await this.updateTask(taskId, {
      assigneeId,
      assigneeName,
      assigneeAvatar,
    });
  },

  // Unassign task
  async unassignTask(taskId: string): Promise<void> {
    const docRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(docRef, {
      assigneeId: null,
      assigneeName: null,
      assigneeAvatar: null,
      updatedAt: Timestamp.now(),
    });
  },

  // Add watcher to task
  async addWatcher(taskId: string, userId: string): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error('Task not found');

    if (!task.watchers.includes(userId)) {
      await this.updateTask(taskId, {
        watchers: [...task.watchers, userId],
      });
    }
  },

  // Remove watcher from task
  async removeWatcher(taskId: string, userId: string): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error('Task not found');

    await this.updateTask(taskId, {
      watchers: task.watchers.filter((w) => w !== userId),
    });
  },

  // Get next order number for new task
  async getNextOrder(projectId: string, status: TaskStatus): Promise<number> {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('projectId', '==', projectId),
      where('status', '==', status),
      orderBy('order', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return 0;
    const lastTask = snapshot.docs[0].data();
    return (lastTask.order || 0) + 1;
  },
};

export default taskService;
