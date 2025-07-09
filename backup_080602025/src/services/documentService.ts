import { api, fetchPaginated, withRetry } from './api';
import { Document, DocumentShare, DocumentVersion, ApiResponse, PaginatedResponse } from '@/types';

// Document service for handling all document-related API calls
export const documentService = {
  // List documents with pagination and filters
  async list(params?: {
    projectId?: string;
    category?: string;
    type?: string;
    status?: string;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Document>> {
    return fetchPaginated<Document>('/documents', params);
  },

  // Get single document by ID
  async get(id: string): Promise<Document> {
    const response = await api.get<Document>(`/documents/${id}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch document');
    }
    return response.data;
  },

  // Create new document
  async create(data: {
    name: string;
    description?: string;
    type: string;
    projectId?: string;
    category?: string;
    tags?: string[];
    metadata?: {
      author?: string;
      keywords?: string[];
      expiresAt?: Date;
      isConfidential?: boolean;
    };
  }): Promise<Document> {
    const response = await api.post<Document>('/documents', data);
    if (!response.success || !response.data) {
      throw new Error('Failed to create document');
    }
    return response.data;
  },

  // Update document
  async update(id: string, data: Partial<Document>): Promise<Document> {
    const response = await api.put<Document>(`/documents/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to update document');
    }
    return response.data;
  },

  // Delete document (soft delete)
  async delete(id: string): Promise<void> {
    const response = await api.delete(`/documents/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete document');
    }
  },

  // Upload document file
  async upload(
    file: File,
    metadata?: {
      name?: string;
      description?: string;
      projectId?: string;
      category?: string;
      tags?: string[];
    }
  ): Promise<Document> {
    const response = await api.upload<Document>('/documents/upload', file, metadata);
    if (!response.success || !response.data) {
      throw new Error('Failed to upload document');
    }
    return response.data;
  },

  // Download document
  async download(id: string): Promise<Blob> {
    const response = await api.get(`/documents/${id}/download`);
    if (!response.success) {
      throw new Error('Failed to download document');
    }
    return response.data as Blob;
  },

  // Get document versions
  async getVersions(id: string): Promise<DocumentVersion[]> {
    const response = await api.get<DocumentVersion[]>(`/documents/${id}/versions`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch document versions');
    }
    return response.data;
  },

  // Create new version
  async createVersion(id: string, file: File, comment?: string): Promise<DocumentVersion> {
    const response = await api.upload<DocumentVersion>(`/documents/${id}/versions`, file, {
      comment,
    });
    if (!response.success || !response.data) {
      throw new Error('Failed to create document version');
    }
    return response.data;
  },

  // Restore document version
  async restoreVersion(documentId: string, versionId: string): Promise<Document> {
    const response = await api.post<Document>(
      `/documents/${documentId}/versions/${versionId}/restore`
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to restore document version');
    }
    return response.data;
  },

  // Share document
  async share(
    id: string,
    shares: Array<{
      userId?: string;
      email?: string;
      permission: 'view' | 'edit' | 'comment';
      expiresAt?: Date;
    }>
  ): Promise<DocumentShare[]> {
    const response = await api.post<DocumentShare[]>(`/documents/${id}/share`, {
      shares,
    });
    if (!response.success || !response.data) {
      throw new Error('Failed to share document');
    }
    return response.data;
  },

  // Update share permissions
  async updateShare(
    documentId: string,
    shareId: string,
    permission: 'view' | 'edit' | 'comment'
  ): Promise<DocumentShare> {
    const response = await api.put<DocumentShare>(`/documents/${documentId}/shares/${shareId}`, {
      permission,
    });
    if (!response.success || !response.data) {
      throw new Error('Failed to update share permissions');
    }
    return response.data;
  },

  // Remove share
  async removeShare(documentId: string, shareId: string): Promise<void> {
    const response = await api.delete(`/documents/${documentId}/shares/${shareId}`);
    if (!response.success) {
      throw new Error('Failed to remove share');
    }
  },

  // Get shared documents
  async getShared(params?: {
    sharedBy?: string;
    permission?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Document>> {
    return fetchPaginated<Document>('/documents/shared', params);
  },

  // Archive document
  async archive(id: string): Promise<void> {
    const response = await api.post(`/documents/${id}/archive`);
    if (!response.success) {
      throw new Error('Failed to archive document');
    }
  },

  // Restore archived document
  async restore(id: string): Promise<Document> {
    const response = await api.post<Document>(`/documents/${id}/restore`);
    if (!response.success || !response.data) {
      throw new Error('Failed to restore document');
    }
    return response.data;
  },

  // Search documents
  async search(
    query: string,
    params?: {
      projectId?: string;
      category?: string;
      type?: string;
      tags?: string[];
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Document>> {
    return fetchPaginated<Document>('/documents/search', { query, ...params });
  },

  // Batch operations
  async batchUpdate(
    updates: Array<{
      id: string;
      data: Partial<Document>;
    }>
  ): Promise<Document[]> {
    const response = await api.post<Document[]>('/documents/batch-update', {
      updates,
    });
    if (!response.success || !response.data) {
      throw new Error('Failed to batch update documents');
    }
    return response.data;
  },

  async batchDelete(ids: string[]): Promise<void> {
    const response = await api.post('/documents/batch-delete', { ids });
    if (!response.success) {
      throw new Error('Failed to batch delete documents');
    }
  },

  async batchArchive(ids: string[]): Promise<void> {
    const response = await api.post('/documents/batch-archive', { ids });
    if (!response.success) {
      throw new Error('Failed to batch archive documents');
    }
  },

  // Generate public link
  async generatePublicLink(
    id: string,
    options?: {
      expiresAt?: Date;
      password?: string;
      maxDownloads?: number;
    }
  ): Promise<{ url: string; token: string }> {
    const response = await api.post<{ url: string; token: string }>(
      `/documents/${id}/public-link`,
      options
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to generate public link');
    }
    return response.data;
  },

  // Revoke public link
  async revokePublicLink(id: string, token: string): Promise<void> {
    const response = await api.delete(`/documents/${id}/public-link/${token}`);
    if (!response.success) {
      throw new Error('Failed to revoke public link');
    }
  },

  // Get document preview
  async getPreview(id: string): Promise<{ url: string; type: string }> {
    const response = await api.get<{ url: string; type: string }>(`/documents/${id}/preview`);
    if (!response.success || !response.data) {
      throw new Error('Failed to get document preview');
    }
    return response.data;
  },

  // Check user permissions
  async checkPermissions(id: string): Promise<{
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
  }> {
    const response = await api.get<{
      canView: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canShare: boolean;
    }>(`/documents/${id}/permissions`);
    if (!response.success || !response.data) {
      throw new Error('Failed to check permissions');
    }
    return response.data;
  },
};

// Helper function to get document with retry
export async function getDocumentWithRetry(id: string): Promise<Document> {
  return withRetry(() => documentService.get(id), {
    maxAttempts: 3,
    delay: 1000,
    shouldRetry: (error, attempt) => {
      // Retry on network errors or 5xx status codes
      return error.status >= 500 || error.code === 'NETWORK_ERROR';
    },
  });
}

// Helper function to upload document with progress
export async function uploadDocumentWithProgress(
  file: File,
  metadata?: any,
  onProgress?: (progress: number) => void
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        if (response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error('Upload failed'));
        }
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.open('POST', '/api/documents/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
    xhr.send(formData);
  });
}
