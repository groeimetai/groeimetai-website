/**
 * System-prompt loader for the site-assistant.
 *
 * Following the meta-agent pattern, the agent's instructions live in a
 * markdown file (`src/agents/site-assistant/CLAUDE.md`) — not in code.
 * This module reads that file and appends a small per-request header
 * (locale + auth status) so the model knows what context it's in.
 */

import type { AgentContext } from '../types';
import { readClaudeMd } from '../tools';

let claudeMdPromise: Promise<string> | null = null;

function loadClaudeMdOnce(): Promise<string> {
  if (!claudeMdPromise) {
    claudeMdPromise = readClaudeMd().catch((error) => {
      console.error('Failed to load CLAUDE.md, using inline fallback:', error);
      claudeMdPromise = null; // allow retry on next call
      return FALLBACK_PROMPT_NL;
    });
  }
  return claudeMdPromise;
}

const FALLBACK_PROMPT_NL = `Je bent de assistent op de GroeimetAI website. Antwoord direct, scherp en zonder marketingtaal. Geen prijzen. Verwijs voor een gesprek naar /contact.`;

function buildContextHeader(context: AgentContext): string {
  const lines: string[] = ['# Sessie-context', ''];
  lines.push(`- Locale gebruiker: **${context.locale}** (antwoord in deze taal).`);
  if (context.isAuthenticated && context.userName) {
    lines.push(`- Ingelogd als: **${context.userName}** (admin/team-lid).`);
    lines.push('- Je hebt toegang tot getProjects en getAssessment voor deze gebruiker.');
  } else {
    lines.push('- Niet ingelogd. Login is alleen voor admin/team-leden van GroeimetAI; pusht niet om in te loggen.');
  }
  return lines.join('\n');
}

export async function getSystemPrompt(context: AgentContext): Promise<string> {
  const claudeMd = await loadClaudeMdOnce();
  return `${claudeMd}\n\n---\n\n${buildContextHeader(context)}`;
}

/** Used when the agent fails entirely (network / API error). */
export function getFallbackResponse(topic: string | null, locale: 'nl' | 'en'): string {
  if (locale === 'nl') {
    if (topic === 'services' || topic === 'diensten' || topic === 'trainingen') {
      return 'GroeimetAI traint teams om AI agents zelf te bouwen — agents zijn folders met instructies en tools, niet een black box. Bekijk /trainingen of /agents voor meer.';
    }
    if (topic === 'contact') {
      return 'Stuur een bericht via info@groeimetai.io of plan een verkennend gesprek via /contact.';
    }
    if (topic === 'prijzen' || topic === 'kosten') {
      return 'Geen prijzen op de site. Voor een offerte op maat: plan een gesprek via /contact.';
    }
    if (topic === 'serac' || topic === 'open-source') {
      return 'Serac is onze open source toolkit (github.com/serac-labs/serac, Elastic v2). Architecten gebruiken het in productie.';
    }
    return 'Mijn excuses — ik heb even geen verbinding. Mail info@groeimetai.io of plan een gesprek via /contact.';
  }

  if (topic === 'services' || topic === 'training') {
    return "GroeimetAI trains teams to build agents themselves — agents are folders with instructions and tools, not a black box. See /trainingen or /agents for more.";
  }
  if (topic === 'contact') {
    return 'Send a message to info@groeimetai.io or book an intro call at /contact.';
  }
  if (topic === 'pricing' || topic === 'cost') {
    return 'No prices on the site. For a tailored quote, book a call at /contact.';
  }
  if (topic === 'serac' || topic === 'open-source') {
    return 'Serac is our open source toolkit (github.com/serac-labs/serac, Elastic v2). Architects run it in production.';
  }
  return "Sorry — I'm offline for a moment. Email info@groeimetai.io or book a call at /contact.";
}
