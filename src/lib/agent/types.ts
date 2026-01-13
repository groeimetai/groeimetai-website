/**
 * Agent Type Definitions for Firestore-based Chatbot
 */

// Agent context passed to all tools
export interface AgentContext {
  userId: string | null;
  isAuthenticated: boolean;
  locale: 'nl' | 'en';
  userEmail?: string;
  userName?: string;
}

// Tool call from Gemini function calling
export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

// Result from tool execution
export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Conversation message for history
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Agent response
export interface AgentResponse {
  text: string;
  toolsUsed?: string[];
  error?: string;
}

// Tool definition for Gemini
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  enum?: string[];
}

// Project summary for chat responses
export interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  progress: number;
  startDate: string;
  endDate?: string;
  nextMilestone?: {
    name: string;
    dueDate: string;
    status: string;
  };
  budget?: {
    amount: number;
    currency: string;
    type: string;
  };
}

// Assessment summary for chat responses
export interface AssessmentSummary {
  score: number;
  level: 'Beginner' | 'Developing' | 'Advanced' | 'Expert';
  submittedAt: string;
  factors: {
    apiConnectivity: string;
    dataAccess: string;
    processDocumentation: string;
    teamReadiness: string;
  };
  recommendations: string[];
}

// Service info for static responses
export interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
}

// Contact info for static responses
export interface ContactInfo {
  email: string;
  phone?: string;
  bookingUrl: string;
  officeHours: string;
  location: string;
}
