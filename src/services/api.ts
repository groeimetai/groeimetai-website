import { auth } from '@/lib/firebase/config';
import { ApiResponse, PaginatedResponse } from '@/types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || '1.0';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request configuration interface
interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
}

// Base API client class
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Version': API_VERSION,
    };
  }

  // Get auth token
  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Build URL with query parameters
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  // Make HTTP request
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { params, timeout = 30000, headers = {}, ...fetchConfig } = config;

    // Get auth token
    const token = await this.getAuthToken();

    // Build headers
    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...(headers as Record<string, string>),
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Generate request ID
    requestHeaders['X-Request-ID'] = this.generateRequestId();

    // Build URL
    const url = this.buildURL(endpoint, params);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        throw new ApiError(
          data.error?.code || 'UNKNOWN_ERROR',
          data.error?.message || 'An error occurred',
          response.status,
          data.error?.details
        );
      }

      return data as ApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle network errors
      if (error.name === 'AbortError') {
        throw new ApiError('TIMEOUT', 'Request timed out');
      }

      // Re-throw API errors
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle other errors
      throw new ApiError('NETWORK_ERROR', error.message || 'Network error occurred');
    }
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convenience methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  // File upload method
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary
      },
    });
  }
}

// Create default API client instance
export const api = new ApiClient();

// Helper function for paginated requests
export async function fetchPaginated<T>(
  endpoint: string,
  params?: Record<string, any>
): Promise<PaginatedResponse<T>> {
  const response = await api.get<PaginatedResponse<T>>(endpoint, params);
  if (!response.success || !response.data) {
    throw new Error('Failed to fetch paginated data');
  }
  return response.data;
}

// Helper function for handling API errors
export function handleApiError(error: any): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'AUTH_REQUIRED':
        return 'Please log in to continue';
      case 'PERMISSION_DENIED':
        return 'You do not have permission to perform this action';
      case 'NOT_FOUND':
        return 'The requested resource was not found';
      case 'VALIDATION_ERROR':
        return error.details?.message || 'Please check your input and try again';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please try again later';
      case 'SERVER_ERROR':
        return 'An unexpected error occurred. Please try again';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection';
      case 'TIMEOUT':
        return 'Request timed out. Please try again';
      default:
        return error.message || 'An error occurred';
    }
  }

  return error.message || 'An unexpected error occurred';
}

// Retry configuration
interface RetryConfig {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

// Helper function for retrying failed requests
export async function withRetry<T>(fn: () => Promise<T>, config: RetryConfig = {}): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2,
    shouldRetry = (error) => error instanceof ApiError && (error.status ?? 0) >= 500,
  } = config;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}
