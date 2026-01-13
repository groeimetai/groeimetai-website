/**
 * Security Layer for Agent
 * Handles authentication and user context extraction
 */

import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import type { AgentContext } from './types';

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Detect language from message content
 * Simple heuristic based on common words
 */
function detectLocale(message: string): 'nl' | 'en' {
  const englishWords = /\b(what|how|can|you|the|are|is|do|does|have|has|will|would|could|should|my|your|their|this|that|which|when|where|why|who)\b/i;
  const dutchWords = /\b(wat|hoe|kan|kun|jij|je|de|het|zijn|is|doe|doet|heb|heeft|zal|zou|kunnen|mijn|jouw|hun|dit|dat|welke|wanneer|waar|waarom|wie)\b/i;

  const englishMatches = (message.match(englishWords) || []).length;
  const dutchMatches = (message.match(dutchWords) || []).length;

  // Default to Dutch if equal or more Dutch words
  return englishMatches > dutchMatches ? 'en' : 'nl';
}

/**
 * Create agent context from request
 * Verifies authentication and extracts user info
 */
export async function createAgentContext(
  request: NextRequest,
  message: string
): Promise<AgentContext> {
  const locale = detectLocale(message);

  // Try to extract and verify token
  const token = extractBearerToken(request);

  if (!token) {
    // Guest context - no authentication
    return {
      userId: null,
      isAuthenticated: false,
      locale,
    };
  }

  try {
    const { valid, decodedToken } = await verifyIdToken(token);

    if (!valid || !decodedToken) {
      // Invalid token - treat as guest
      return {
        userId: null,
        isAuthenticated: false,
        locale,
      };
    }

    // Authenticated context
    return {
      userId: decodedToken.uid,
      isAuthenticated: true,
      locale,
      userEmail: decodedToken.email,
      userName: decodedToken.name || decodedToken.email?.split('@')[0],
    };
  } catch (error) {
    console.error('Token verification error:', error);
    // Error during verification - treat as guest
    return {
      userId: null,
      isAuthenticated: false,
      locale,
    };
  }
}

/**
 * Check if user is authorized to access a specific tool
 */
export function isAuthorizedForTool(
  toolName: string,
  context: AgentContext
): boolean {
  // Tools that require authentication
  const authRequiredTools = [
    'getProjects',
    'getAssessment',
  ];

  // Tools available to everyone
  const publicTools = [
    'getServiceInfo',
    'getContactInfo',
  ];

  if (publicTools.includes(toolName)) {
    return true;
  }

  if (authRequiredTools.includes(toolName)) {
    return context.isAuthenticated && !!context.userId;
  }

  // Unknown tool - deny by default
  return false;
}

/**
 * Get available tools based on authentication status
 */
export function getAvailableTools(context: AgentContext): string[] {
  const publicTools = ['getServiceInfo', 'getContactInfo'];

  if (context.isAuthenticated) {
    return [...publicTools, 'getProjects', 'getAssessment'];
  }

  return publicTools;
}
