import { api, fetchPaginated, withRetry } from './api';
import { Project, Milestone, ApiResponse, PaginatedResponse } from '@/types';

// Project service for handling all project-related API calls
export const projectService = {
  // List projects with pagination and filters
  async list(params?: {
    status?: string;
    type?: string;
    consultantId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Project>> {
    return fetchPaginated<Project>('/projects', params);
  },

  // Get single project by ID
  async get(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch project');
    }
    return response.data;
  },

  // Create new project
  async create(data: {
    name: string;
    description: string;
    type: string;
    startDate: string;
    estimatedHours: number;
    budget: {
      amount: number;
      currency: string;
      type: string;
      hourlyRate?: number;
    };
    milestones?: Array<{
      name: string;
      description: string;
      dueDate: string;
      deliverables: string[];
    }>;
    tags?: string[];
    technologies?: string[];
  }): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    if (!response.success || !response.data) {
      throw new Error('Failed to create project');
    }
    return response.data;
  },

  // Update project
  async update(id: string, data: Partial<Project>): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to update project');
    }
    return response.data;
  },

  // Delete project (soft delete)
  async delete(id: string): Promise<void> {
    const response = await api.delete(`/projects/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete project');
    }
  },

  // Mark project as completed
  async complete(id: string): Promise<Project> {
    const response = await api.post<Project>(`/projects/${id}/complete`);
    if (!response.success || !response.data) {
      throw new Error('Failed to complete project');
    }
    return response.data;
  },

  // Add milestone to project
  async addMilestone(
    projectId: string,
    milestone: {
      name: string;
      description: string;
      dueDate: string;
      deliverables: string[];
    }
  ): Promise<Milestone> {
    const response = await api.post<Milestone>(
      `/projects/${projectId}/milestones`,
      milestone
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to add milestone');
    }
    return response.data;
  },

  // Update milestone
  async updateMilestone(
    projectId: string,
    milestoneId: string,
    data: Partial<Milestone>
  ): Promise<Milestone> {
    const response = await api.put<Milestone>(
      `/projects/${projectId}/milestones/${milestoneId}`,
      data
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to update milestone');
    }
    return response.data;
  },

  // Complete milestone
  async completeMilestone(
    projectId: string,
    milestoneId: string
  ): Promise<Milestone> {
    const response = await api.post<Milestone>(
      `/projects/${projectId}/milestones/${milestoneId}/complete`
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to complete milestone');
    }
    return response.data;
  },

  // Get project tasks
  async getTasks(projectId: string, params?: {
    status?: string;
    assignee?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    return fetchPaginated<any>(`/projects/${projectId}/tasks`, params);
  },

  // Add task to project
  async addTask(projectId: string, task: {
    title: string;
    description: string;
    assignee?: string;
    dueDate?: string;
    priority?: string;
  }): Promise<any> {
    const response = await api.post<any>(`/projects/${projectId}/tasks`, task);
    if (!response.success || !response.data) {
      throw new Error('Failed to add task');
    }
    return response.data;
  },

  // Get project documents
  async getDocuments(projectId: string): Promise<any[]> {
    const response = await api.get<any[]>(`/projects/${projectId}/documents`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch documents');
    }
    return response.data;
  },

  // Upload document to project
  async uploadDocument(
    projectId: string,
    file: File,
    metadata?: {
      description?: string;
      tags?: string[];
    }
  ): Promise<any> {
    const response = await api.upload<any>(
      `/projects/${projectId}/documents`,
      file,
      metadata
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to upload document');
    }
    return response.data;
  },

  // Get project time entries
  async getTimeEntries(projectId: string, params?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    return fetchPaginated<any>(`/projects/${projectId}/time-entries`, params);
  },

  // Add time entry to project
  async addTimeEntry(projectId: string, entry: {
    duration: number;
    description: string;
    date: string;
    taskId?: string;
  }): Promise<any> {
    const response = await api.post<any>(
      `/projects/${projectId}/time-entries`,
      entry
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to add time entry');
    }
    return response.data;
  },

  // Get project analytics
  async getAnalytics(projectId: string): Promise<any> {
    const response = await api.get<any>(`/analytics/projects/${projectId}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch project analytics');
    }
    return response.data;
  },

  // Export project data
  async export(projectId: string, format: 'pdf' | 'csv' | 'json'): Promise<Blob> {
    const response = await api.get(`/projects/${projectId}/export`, {
      format
    });
    // Handle blob response
    return new Blob();
  },

  // Batch operations
  async batchUpdate(updates: Array<{
    id: string;
    data: Partial<Project>;
  }>): Promise<Project[]> {
    const response = await api.post<Project[]>('/projects/batch-update', {
      updates
    });
    if (!response.success || !response.data) {
      throw new Error('Failed to batch update projects');
    }
    return response.data;
  },

  // Archive project
  async archive(id: string): Promise<void> {
    const response = await api.post(`/projects/${id}/archive`);
    if (!response.success) {
      throw new Error('Failed to archive project');
    }
  },

  // Restore archived project
  async restore(id: string): Promise<Project> {
    const response = await api.post<Project>(`/projects/${id}/restore`);
    if (!response.success || !response.data) {
      throw new Error('Failed to restore project');
    }
    return response.data;
  },

  // Clone project
  async clone(id: string, data: {
    name: string;
    includeTeam?: boolean;
    includeTasks?: boolean;
    includeDocuments?: boolean;
  }): Promise<Project> {
    const response = await api.post<Project>(`/projects/${id}/clone`, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to clone project');
    }
    return response.data;
  },

  // Get project templates
  async getTemplates(): Promise<any[]> {
    const response = await api.get<any[]>('/projects/templates');
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch project templates');
    }
    return response.data;
  },

  // Create project from template
  async createFromTemplate(templateId: string, data: {
    name: string;
    clientId: string;
    startDate: string;
  }): Promise<Project> {
    const response = await api.post<Project>(
      `/projects/templates/${templateId}/create`,
      data
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to create project from template');
    }
    return response.data;
  }
};

// Helper function to get project with retry
export async function getProjectWithRetry(id: string): Promise<Project> {
  return withRetry(() => projectService.get(id), {
    maxAttempts: 3,
    delay: 1000,
    shouldRetry: (error, attempt) => {
      // Retry on network errors or 5xx status codes
      return error.status >= 500 || error.code === 'NETWORK_ERROR';
    }
  });
}