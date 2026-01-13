/**
 * Tool Definitions for Anthropic Claude Function Calling
 * These schemas define what tools the agent can use
 */

import Anthropic from '@anthropic-ai/sdk';

type Tool = Anthropic.Tool;

/**
 * Get user's projects from Firestore
 * Requires authentication
 */
export const getProjectsTool: Tool = {
  name: 'getProjects',
  description:
    'Haal projecten op voor de ingelogde gebruiker. Geeft project status, voortgang, milestones en budget informatie terug. / Get projects for the logged-in user. Returns project status, progress, milestones, and budget information.',
  input_schema: {
    type: 'object' as const,
    properties: {
      status: {
        type: 'string',
        description:
          'Filter op project status. Mogelijke waarden: all, active, completed, on_hold, cancelled. / Filter by project status.',
        enum: ['all', 'active', 'completed', 'on_hold', 'cancelled'],
      },
      limit: {
        type: 'number',
        description:
          'Maximum aantal projecten om terug te geven (standaard: 5). / Maximum number of projects to return (default: 5).',
      },
    },
  },
};

/**
 * Get user's AI readiness assessment results
 * Requires authentication
 */
export const getAssessmentTool: Tool = {
  name: 'getAssessment',
  description:
    'Haal de AI-readiness assessment resultaten op voor de gebruiker. Geeft score, niveau en aanbevelingen terug. / Get AI readiness assessment results for the user. Returns score, level, and recommendations.',
  input_schema: {
    type: 'object' as const,
    properties: {},
  },
};

/**
 * Get information about GroeimetAI services
 * Available to all users (including guests)
 */
export const getServiceInfoTool: Tool = {
  name: 'getServiceInfo',
  description:
    'Haal informatie op over GroeimetAI diensten zoals GenAI implementatie, ServiceNow integratie, Multi-agent orchestration, RAG architectuur. / Get information about GroeimetAI services like GenAI implementation, ServiceNow integration, Multi-agent orchestration, RAG architecture.',
  input_schema: {
    type: 'object' as const,
    properties: {
      service: {
        type: 'string',
        description:
          'Specifieke dienst om informatie over op te halen. / Specific service to get information about.',
        enum: ['all', 'genai', 'servicenow', 'multi-agent', 'rag', 'custom'],
      },
    },
  },
};

/**
 * Get contact information for GroeimetAI
 * Available to all users (including guests)
 */
export const getContactInfoTool: Tool = {
  name: 'getContactInfo',
  description:
    'Haal contactgegevens op voor GroeimetAI inclusief email, telefoon en afspraak links. / Get contact information for GroeimetAI including email, phone, and booking links.',
  input_schema: {
    type: 'object' as const,
    properties: {},
  },
};

/**
 * All available tools for the agent
 */
export const allTools: Tool[] = [
  getProjectsTool,
  getAssessmentTool,
  getServiceInfoTool,
  getContactInfoTool,
];

/**
 * Tools available to authenticated users only
 */
export const authenticatedTools: Tool[] = [
  getProjectsTool,
  getAssessmentTool,
  getServiceInfoTool,
  getContactInfoTool,
];

/**
 * Tools available to guests (unauthenticated users)
 */
export const guestTools: Tool[] = [
  getServiceInfoTool,
  getContactInfoTool,
];
