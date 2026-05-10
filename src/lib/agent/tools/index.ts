/**
 * Tool registry for the site-assistant.
 */

import type { AgentContext, ToolResult } from '../types';
import { executeGetProjects, executeGetAssessment } from './firestore';
import { executeListKnowledge, executeReadKnowledge } from './knowledge';
import { isAuthorizedForTool } from '../security';

export { allTools, authenticatedTools, guestTools } from './definitions';
export { readClaudeMd } from './knowledge';

type ToolExecutor = (
  args: Record<string, unknown>,
  context: AgentContext
) => Promise<ToolResult>;

const toolRegistry: Record<string, ToolExecutor> = {
  // File-system tools — available to everyone.
  listKnowledge: executeListKnowledge,
  readKnowledge: executeReadKnowledge,
  // Authenticated-only Firestore tools.
  getProjects: executeGetProjects,
  getAssessment: executeGetAssessment,
};

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  context: AgentContext
): Promise<ToolResult> {
  if (!isAuthorizedForTool(toolName, context)) {
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? 'Je moet ingelogd zijn om deze functie te gebruiken.'
          : 'You must be logged in to use this feature.',
    };
  }

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
