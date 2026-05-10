/**
 * File-system tools for the site-assistant.
 *
 * These two tools mirror the meta-agent pattern: instead of hard-coded
 * static info functions, the agent reads markdown files from its own
 * folder (`src/agents/site-assistant/knowledge/`) at request time.
 *
 * Behaviour mirrors how a developer would explore a folder:
 *   1. listKnowledge() — see what's available.
 *   2. readKnowledge(path) — read the relevant file.
 *
 * Files are cached in-process after first read; safe because they're
 * static at deploy time.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { AgentContext, ToolResult } from '../types';

const AGENT_ROOT = path.join(process.cwd(), 'src', 'agents', 'site-assistant');
const KNOWLEDGE_ROOT = path.join(AGENT_ROOT, 'knowledge');

/** path → markdown content */
const fileCache = new Map<string, string>();

/** path → first non-heading paragraph, used as the listing description */
const summaryCache = new Map<string, string>();

let listingCache: { path: string; description: string }[] | null = null;

function isAllowedKnowledgePath(rel: string): boolean {
  // Lock-down: only allow paths inside knowledge/ and only .md files.
  if (rel.includes('..') || path.isAbsolute(rel)) return false;
  if (!rel.endsWith('.md')) return false;
  // Allow either "knowledge/foo.md" or "foo.md" (we'll prepend knowledge/).
  if (rel.startsWith('knowledge/')) return true;
  return !rel.includes('/');
}

function resolveKnowledgePath(input: string): string {
  // Accept "knowledge/foo.md" and "foo.md" the same way.
  const rel = input.startsWith('knowledge/')
    ? input.slice('knowledge/'.length)
    : input;
  return path.join(KNOWLEDGE_ROOT, rel);
}

/** Pull a one-line summary out of a markdown file (first non-heading line). */
function summarise(content: string): string {
  const lines = content.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) continue;
    return line.replace(/[*_`]/g, '').slice(0, 200);
  }
  return '';
}

async function loadFile(absPath: string): Promise<string> {
  if (fileCache.has(absPath)) return fileCache.get(absPath)!;
  const content = await fs.readFile(absPath, 'utf8');
  fileCache.set(absPath, content);
  summaryCache.set(absPath, summarise(content));
  return content;
}

async function buildListing(): Promise<{ path: string; description: string }[]> {
  if (listingCache) return listingCache;
  const entries = await fs.readdir(KNOWLEDGE_ROOT);
  const mdFiles = entries.filter((f) => f.endsWith('.md'));
  const items: { path: string; description: string }[] = [];
  for (const file of mdFiles) {
    const abs = path.join(KNOWLEDGE_ROOT, file);
    await loadFile(abs);
    items.push({
      path: `knowledge/${file}`,
      description: summaryCache.get(abs) ?? '',
    });
  }
  // Stable order: index first, then alphabetical.
  items.sort((a, b) => {
    if (a.path === 'knowledge/index.md') return -1;
    if (b.path === 'knowledge/index.md') return 1;
    return a.path.localeCompare(b.path);
  });
  listingCache = items;
  return items;
}

/** Read CLAUDE.md from the agent folder — used by the system-prompt loader. */
export async function readClaudeMd(): Promise<string> {
  const abs = path.join(AGENT_ROOT, 'CLAUDE.md');
  return loadFile(abs);
}

export async function executeListKnowledge(
  _args: Record<string, unknown>,
  _context: AgentContext
): Promise<ToolResult> {
  try {
    const items = await buildListing();
    return {
      success: true,
      data: { files: items },
    };
  } catch (error) {
    console.error('listKnowledge error:', error);
    return {
      success: false,
      error: 'Kon de knowledge folder niet uitlezen.',
    };
  }
}

export async function executeReadKnowledge(
  args: Record<string, unknown>,
  context: AgentContext
): Promise<ToolResult> {
  const requested = String(args?.path ?? '').trim();
  if (!requested) {
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? 'Geef een pad mee, bijvoorbeeld "knowledge/trainingen.md".'
          : 'Provide a path, e.g. "knowledge/trainingen.md".',
    };
  }

  if (!isAllowedKnowledgePath(requested)) {
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? `Pad niet toegestaan: ${requested}. Alleen .md-bestanden in de knowledge folder.`
          : `Path not allowed: ${requested}. Only .md files inside the knowledge folder.`,
    };
  }

  try {
    const abs = resolveKnowledgePath(requested);
    const content = await loadFile(abs);
    return {
      success: true,
      data: { path: requested, content },
    };
  } catch (error) {
    console.error('readKnowledge error:', error);
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? `Bestand niet gevonden: ${requested}.`
          : `File not found: ${requested}.`,
    };
  }
}
