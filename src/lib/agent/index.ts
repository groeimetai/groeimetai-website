/**
 * Agent Module
 * Exports all agent functionality
 */

// Core functionality
export { runAgent, runSimpleAgent } from './core';

// Security
export { createAgentContext, isAuthorizedForTool, getAvailableTools } from './security';

// Types
export type {
  AgentContext,
  AgentResponse,
  ConversationMessage,
  ToolCall,
  ToolResult,
  ProjectSummary,
  AssessmentSummary,
  ServiceInfo,
  ContactInfo,
} from './types';

// Prompts
export { getSystemPrompt, getFallbackResponse } from './prompts/system';
