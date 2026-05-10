/**
 * Tool definitions for the site-assistant.
 *
 * The assistant follows the meta-agent pattern: its knowledge lives in
 * markdown files inside `src/agents/site-assistant/knowledge/` and it
 * reads those files via two file-system tools rather than relying on
 * hard-coded static answers.
 */

import Anthropic from '@anthropic-ai/sdk';

type Tool = Anthropic.Tool;

/**
 * List every available knowledge markdown file with a short summary.
 * Always available, no auth required.
 */
export const listKnowledgeTool: Tool = {
  name: 'listKnowledge',
  description:
    'Geeft een lijst van alle knowledge-bestanden waar de site-assistent uit kan putten, elk met een korte beschrijving. Gebruik dit altijd vóór readKnowledge zodat je weet welk bestand het meest relevant is. / Lists every knowledge markdown file the site assistant can read, each with a short summary. Use this first to pick the right file before readKnowledge.',
  input_schema: {
    type: 'object' as const,
    properties: {},
  },
};

/**
 * Read one knowledge markdown file by path.
 * Always available, no auth required.
 */
export const readKnowledgeTool: Tool = {
  name: 'readKnowledge',
  description:
    'Leest één markdown-bestand uit de knowledge folder. Gebruik dit om concrete content terug te geven in plaats van te raden. Pad-formaat: "knowledge/<bestand>.md". / Reads a single markdown file from the knowledge folder. Use this to ground answers in concrete content instead of guessing. Path format: "knowledge/<file>.md".',
  input_schema: {
    type: 'object' as const,
    properties: {
      path: {
        type: 'string',
        description:
          'Pad naar het bestand, zoals teruggegeven door listKnowledge. Bijv. "knowledge/trainingen.md". / Path returned by listKnowledge, e.g. "knowledge/trainingen.md".',
      },
    },
    required: ['path'],
  },
};

/**
 * Authenticated-only: get the logged-in user's projects from Firestore.
 */
export const getProjectsTool: Tool = {
  name: 'getProjects',
  description:
    'Haal projecten op voor de ingelogde gebruiker. / Get projects for the logged-in user.',
  input_schema: {
    type: 'object' as const,
    properties: {
      status: {
        type: 'string',
        description: 'Filter by project status.',
        enum: ['all', 'active', 'completed', 'on_hold', 'cancelled'],
      },
      limit: {
        type: 'number',
        description: 'Maximum number of projects to return (default: 5).',
      },
    },
  },
};

/**
 * Authenticated-only: get the logged-in user's assessment results.
 */
export const getAssessmentTool: Tool = {
  name: 'getAssessment',
  description:
    'Haal de assessment-resultaten op voor de ingelogde gebruiker. / Get assessment results for the logged-in user.',
  input_schema: {
    type: 'object' as const,
    properties: {},
  },
};

/** Tools available to guests (anyone visiting the public site). */
export const guestTools: Tool[] = [listKnowledgeTool, readKnowledgeTool];

/** Tools available to authenticated admin/team-members. */
export const authenticatedTools: Tool[] = [
  ...guestTools,
  getProjectsTool,
  getAssessmentTool,
];

/** Every tool, for completeness. */
export const allTools: Tool[] = authenticatedTools;
