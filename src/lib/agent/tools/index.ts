/**
 * Tools Index
 * Central registry for all agent tools
 */

import type { AgentContext, ToolResult } from '../types';
import { executeGetProjects, executeGetAssessment } from './firestore';
import { executeGetServiceInfo, executeGetContactInfo } from './static';
import { isAuthorizedForTool } from '../security';

// Re-export tool definitions
export { allTools, authenticatedTools, guestTools } from './definitions';

/**
 * Tool executor function type
 */
type ToolExecutor = (
  args: Record<string, unknown>,
  context: AgentContext
) => Promise<ToolResult>;

/**
 * Registry mapping tool names to their executors
 */
const toolRegistry: Record<string, ToolExecutor> = {
  getProjects: executeGetProjects,
  getAssessment: executeGetAssessment,
  getServiceInfo: executeGetServiceInfo,
  getContactInfo: executeGetContactInfo,
};

/**
 * Execute a tool by name
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  context: AgentContext
): Promise<ToolResult> {
  // Check authorization
  if (!isAuthorizedForTool(toolName, context)) {
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? 'Je moet ingelogd zijn om deze functie te gebruiken.'
          : 'You must be logged in to use this feature.',
    };
  }

  // Get executor
  const executor = toolRegistry[toolName];
  if (!executor) {
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? `Onbekende functie: ${toolName}`
          : `Unknown function: ${toolName}`,
    };
  }

  // Execute tool
  try {
    return await executor(args, context);
  } catch (error) {
    console.error(`Tool execution error (${toolName}):`, error);
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? 'Er ging iets mis bij het uitvoeren van deze functie.'
          : 'Something went wrong while executing this function.',
    };
  }
}
