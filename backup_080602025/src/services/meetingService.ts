import { api, fetchPaginated, withRetry } from './api';
import { Meeting, MeetingParticipant, ActionItem, ApiResponse, PaginatedResponse } from '@/types';

// Meeting service for handling all meeting-related API calls
export const meetingService = {
  // List meetings with pagination and filters
  async list(params?: {
    projectId?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Meeting>> {
    return fetchPaginated<Meeting>('/meetings', params);
  },

  // Get single meeting by ID
  async get(id: string): Promise<Meeting> {
    const response = await api.get<Meeting>(`/meetings/${id}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch meeting');
    }
    return response.data;
  },

  // Create new meeting
  async create(data: {
    title: string;
    description?: string;
    type: string;
    startTime: Date;
    endTime: Date;
    projectId?: string;
    location?: {
      type: 'physical' | 'virtual';
      address?: string;
      roomName?: string;
      link?: string;
      instructions?: string;
    };
    participantIds: string[];
    agenda?: Array<{
      topic: string;
      duration: number;
      presenter?: string;
      notes?: string;
    }>;
    platform?: string;
    recurring?: {
      pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
      interval: number;
      daysOfWeek?: number[];
      dayOfMonth?: number;
      endDate?: Date;
      occurrences?: number;
    };
  }): Promise<Meeting> {
    const response = await api.post<Meeting>('/meetings', data);
    if (!response.success || !response.data) {
      throw new Error('Failed to create meeting');
    }
    return response.data;
  },

  // Update meeting
  async update(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const response = await api.put<Meeting>(`/meetings/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to update meeting');
    }
    return response.data;
  },

  // Delete meeting
  async delete(id: string): Promise<void> {
    const response = await api.delete(`/meetings/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete meeting');
    }
  },

  // Cancel meeting
  async cancel(id: string, reason?: string): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${id}/cancel`, { reason });
    if (!response.success || !response.data) {
      throw new Error('Failed to cancel meeting');
    }
    return response.data;
  },

  // Reschedule meeting
  async reschedule(
    id: string,
    data: {
      startTime: Date;
      endTime: Date;
      notifyParticipants?: boolean;
    }
  ): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${id}/reschedule`, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to reschedule meeting');
    }
    return response.data;
  },

  // Start meeting
  async start(id: string): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${id}/start`);
    if (!response.success || !response.data) {
      throw new Error('Failed to start meeting');
    }
    return response.data;
  },

  // End meeting
  async end(id: string): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${id}/end`);
    if (!response.success || !response.data) {
      throw new Error('Failed to end meeting');
    }
    return response.data;
  },

  // Update participant status
  async updateParticipantStatus(
    meetingId: string,
    participantId: string,
    status: 'accepted' | 'declined' | 'tentative'
  ): Promise<MeetingParticipant> {
    const response = await api.put<MeetingParticipant>(
      `/meetings/${meetingId}/participants/${participantId}`,
      { status }
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to update participant status');
    }
    return response.data;
  },

  // Add participants
  async addParticipants(
    meetingId: string,
    participants: Array<{
      userId: string;
      role: 'required' | 'optional';
    }>
  ): Promise<MeetingParticipant[]> {
    const response = await api.post<MeetingParticipant[]>(`/meetings/${meetingId}/participants`, {
      participants,
    });
    if (!response.success || !response.data) {
      throw new Error('Failed to add participants');
    }
    return response.data;
  },

  // Remove participant
  async removeParticipant(meetingId: string, participantId: string): Promise<void> {
    const response = await api.delete(`/meetings/${meetingId}/participants/${participantId}`);
    if (!response.success) {
      throw new Error('Failed to remove participant');
    }
  },

  // Update meeting notes
  async updateNotes(id: string, notes: string): Promise<Meeting> {
    const response = await api.put<Meeting>(`/meetings/${id}/notes`, { notes });
    if (!response.success || !response.data) {
      throw new Error('Failed to update meeting notes');
    }
    return response.data;
  },

  // Add action item
  async addActionItem(
    meetingId: string,
    actionItem: {
      title: string;
      description?: string;
      assigneeId: string;
      dueDate?: Date;
      priority: 'low' | 'medium' | 'high';
    }
  ): Promise<ActionItem> {
    const response = await api.post<ActionItem>(`/meetings/${meetingId}/action-items`, actionItem);
    if (!response.success || !response.data) {
      throw new Error('Failed to add action item');
    }
    return response.data;
  },

  // Update action item
  async updateActionItem(
    meetingId: string,
    actionItemId: string,
    data: Partial<ActionItem>
  ): Promise<ActionItem> {
    const response = await api.put<ActionItem>(
      `/meetings/${meetingId}/action-items/${actionItemId}`,
      data
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to update action item');
    }
    return response.data;
  },

  // Complete action item
  async completeActionItem(meetingId: string, actionItemId: string): Promise<ActionItem> {
    const response = await api.post<ActionItem>(
      `/meetings/${meetingId}/action-items/${actionItemId}/complete`
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to complete action item');
    }
    return response.data;
  },

  // Delete action item
  async deleteActionItem(meetingId: string, actionItemId: string): Promise<void> {
    const response = await api.delete(`/meetings/${meetingId}/action-items/${actionItemId}`);
    if (!response.success) {
      throw new Error('Failed to delete action item');
    }
  },

  // Upload meeting recording
  async uploadRecording(meetingId: string, file: File): Promise<{ url: string }> {
    const response = await api.upload<{ url: string }>(`/meetings/${meetingId}/recording`, file);
    if (!response.success || !response.data) {
      throw new Error('Failed to upload recording');
    }
    return response.data;
  },

  // Get upcoming meetings
  async getUpcoming(params?: {
    days?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Meeting>> {
    return fetchPaginated<Meeting>('/meetings/upcoming', params);
  },

  // Get past meetings
  async getPast(params?: {
    days?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Meeting>> {
    return fetchPaginated<Meeting>('/meetings/past', params);
  },

  // Get meeting availability
  async checkAvailability(params: {
    participantIds: string[];
    duration: number;
    startDate: Date;
    endDate: Date;
    workingHoursOnly?: boolean;
  }): Promise<Array<{ start: Date; end: Date }>> {
    const response = await api.post<Array<{ start: Date; end: Date }>>(
      '/meetings/availability',
      params
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to check availability');
    }
    return response.data;
  },

  // Send meeting invites
  async sendInvites(
    meetingId: string,
    params?: {
      participantIds?: string[];
      message?: string;
    }
  ): Promise<void> {
    const response = await api.post(`/meetings/${meetingId}/invite`, params);
    if (!response.success) {
      throw new Error('Failed to send invites');
    }
  },

  // Send reminders
  async sendReminders(
    meetingId: string,
    params?: {
      participantIds?: string[];
      minutesBefore?: number;
    }
  ): Promise<void> {
    const response = await api.post(`/meetings/${meetingId}/remind`, params);
    if (!response.success) {
      throw new Error('Failed to send reminders');
    }
  },

  // Export meeting to calendar
  async exportToCalendar(
    meetingId: string,
    format: 'ics' | 'google' | 'outlook'
  ): Promise<Blob | string> {
    const response = await api.get<Blob | string>(`/meetings/${meetingId}/export`, { format });
    if (!response.success || !response.data) {
      throw new Error('Failed to export meeting');
    }
    return response.data;
  },

  // Generate meeting summary
  async generateSummary(meetingId: string): Promise<{
    summary: string;
    keyPoints: string[];
    actionItems: ActionItem[];
  }> {
    const response = await api.post<{
      summary: string;
      keyPoints: string[];
      actionItems: ActionItem[];
    }>(`/meetings/${meetingId}/summary`);
    if (!response.success || !response.data) {
      throw new Error('Failed to generate summary');
    }
    return response.data;
  },

  // Get meeting analytics
  async getAnalytics(meetingId: string): Promise<{
    attendanceRate: number;
    averageRating: number;
    actionItemsCompleted: number;
    duration: number;
  }> {
    const response = await api.get<{
      attendanceRate: number;
      averageRating: number;
      actionItemsCompleted: number;
      duration: number;
    }>(`/meetings/${meetingId}/analytics`);
    if (!response.success || !response.data) {
      throw new Error('Failed to get analytics');
    }
    return response.data;
  },

  // Batch operations
  async batchUpdate(
    updates: Array<{
      id: string;
      data: Partial<Meeting>;
    }>
  ): Promise<Meeting[]> {
    const response = await api.post<Meeting[]>('/meetings/batch-update', {
      updates,
    });
    if (!response.success || !response.data) {
      throw new Error('Failed to batch update meetings');
    }
    return response.data;
  },

  async batchDelete(ids: string[]): Promise<void> {
    const response = await api.post('/meetings/batch-delete', { ids });
    if (!response.success) {
      throw new Error('Failed to batch delete meetings');
    }
  },

  // Clone meeting
  async clone(
    id: string,
    data: {
      title: string;
      startTime: Date;
      endTime: Date;
      includeAgenda?: boolean;
      includeParticipants?: boolean;
    }
  ): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${id}/clone`, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to clone meeting');
    }
    return response.data;
  },

  // Get meeting templates
  async getTemplates(): Promise<any[]> {
    const response = await api.get<any[]>('/meetings/templates');
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch meeting templates');
    }
    return response.data;
  },

  // Create meeting from template
  async createFromTemplate(
    templateId: string,
    data: {
      title: string;
      startTime: Date;
      endTime: Date;
      participantIds: string[];
    }
  ): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/templates/${templateId}/create`, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to create meeting from template');
    }
    return response.data;
  },
};

// Helper function to get meeting with retry
export async function getMeetingWithRetry(id: string): Promise<Meeting> {
  return withRetry(() => meetingService.get(id), {
    maxAttempts: 3,
    delay: 1000,
    shouldRetry: (error, attempt) => {
      // Retry on network errors or 5xx status codes
      return error.status >= 500 || error.code === 'NETWORK_ERROR';
    },
  });
}

// Helper function to check if user can join meeting
export async function canJoinMeeting(meetingId: string): Promise<{
  canJoin: boolean;
  reason?: string;
  meetingLink?: string;
}> {
  try {
    const meeting = await meetingService.get(meetingId);
    const now = new Date();

    if (meeting.status === 'cancelled') {
      return { canJoin: false, reason: 'Meeting has been cancelled' };
    }

    if (meeting.status === 'completed') {
      return { canJoin: false, reason: 'Meeting has already ended' };
    }

    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);

    if (now < startTime) {
      const minutesUntilStart = Math.floor((startTime.getTime() - now.getTime()) / 60000);
      if (minutesUntilStart > 15) {
        return { canJoin: false, reason: `Meeting starts in ${minutesUntilStart} minutes` };
      }
    }

    if (now > endTime) {
      return { canJoin: false, reason: 'Meeting has ended' };
    }

    return { canJoin: true, meetingLink: meeting.meetingLink };
  } catch (error) {
    return { canJoin: false, reason: 'Failed to check meeting status' };
  }
}
