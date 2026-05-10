'use client';

import { useState } from 'react';
import { IconFolder, IconNotes } from '@/components/ds/icons';

type Lang = 'md' | 'py' | 'json' | 'txt';

type FileNode = {
  type: 'file';
  name: string;
  size: string;
  lang: Lang;
  path: string;
};
type DirNode = {
  type: 'dir';
  name: string;
  open?: boolean;
  children: TreeNode[];
};
type TreeNode = FileNode | DirNode;

/* The whole agent — one folder. Instructions (CLAUDE.md), knowledge,
   slash commands (.claude/commands/), tools (mcp-servers/), examples,
   logs. Same pattern as github.com/groeimetai/meta-agent. */
const tree: TreeNode[] = [
  {
    type: 'file',
    name: 'CLAUDE.md',
    size: '2.1kb',
    lang: 'md',
    path: 'CLAUDE.md',
  },
  {
    type: 'dir',
    name: '.claude/',
    open: true,
    children: [
      {
        type: 'dir',
        name: 'commands/',
        open: true,
        children: [
          {
            type: 'file',
            name: 'plan-meeting.md',
            size: '1.4kb',
            lang: 'md',
            path: '.claude/commands/plan-meeting.md',
          },
          {
            type: 'file',
            name: 'lookup-invoice.md',
            size: '0.8kb',
            lang: 'md',
            path: '.claude/commands/lookup-invoice.md',
          },
          {
            type: 'file',
            name: 'create-draft.md',
            size: '2.3kb',
            lang: 'md',
            path: '.claude/commands/create-draft.md',
          },
        ],
      },
    ],
  },
  {
    type: 'dir',
    name: 'knowledge/',
    open: true,
    children: [
      {
        type: 'file',
        name: 'klant-onboarding.md',
        size: '4.2kb',
        lang: 'md',
        path: 'knowledge/klant-onboarding.md',
      },
      {
        type: 'file',
        name: 'tone-of-voice.md',
        size: '1.1kb',
        lang: 'md',
        path: 'knowledge/tone-of-voice.md',
      },
      {
        type: 'file',
        name: 'product-specs.json',
        size: '12kb',
        lang: 'json',
        path: 'knowledge/product-specs.json',
      },
    ],
  },
  {
    type: 'dir',
    name: 'voorbeelden/',
    children: [
      {
        type: 'file',
        name: 'goede-reactie.md',
        size: '2.3kb',
        lang: 'md',
        path: 'voorbeelden/goede-reactie.md',
      },
      {
        type: 'file',
        name: 'afgewezen-deal.md',
        size: '1.7kb',
        lang: 'md',
        path: 'voorbeelden/afgewezen-deal.md',
      },
    ],
  },
  {
    type: 'dir',
    name: 'mcp-servers/',
    open: true,
    children: [
      {
        type: 'dir',
        name: 'exact-online/',
        children: [
          {
            type: 'file',
            name: 'server.py',
            size: '3.2kb',
            lang: 'py',
            path: 'mcp-servers/exact-online/server.py',
          },
          {
            type: 'file',
            name: 'requirements.txt',
            size: '0.1kb',
            lang: 'txt',
            path: 'mcp-servers/exact-online/requirements.txt',
          },
        ],
      },
      {
        type: 'dir',
        name: 'google-calendar/',
        children: [
          {
            type: 'file',
            name: 'server.py',
            size: '4.1kb',
            lang: 'py',
            path: 'mcp-servers/google-calendar/server.py',
          },
        ],
      },
    ],
  },
  {
    type: 'dir',
    name: 'logs/',
    children: [
      {
        type: 'dir',
        name: 'conversations/',
        children: [
          {
            type: 'file',
            name: '2026-05-09-offerte-acme.md',
            size: '3.4kb',
            lang: 'md',
            path: 'logs/conversations/2026-05-09-offerte-acme.md',
          },
        ],
      },
    ],
  },
];

const fileSamples: Record<string, string[]> = {
  'CLAUDE.md': [
    '# AccountAgent v3',
    '',
    'Jij bent een account-assistent voor sales engineers.',
    'Antwoord in NL, kort en concreet. Geen marketing-taal.',
    '',
    '## Regels',
    '1. Lees altijd eerst de relevante folder uit knowledge/',
    '2. Twijfel? Vraag door — geen aannames over prijs of scope.',
    '3. Plan-acties via planMeeting() — niet inline beantwoorden.',
    '4. Buiten scope? Escaleer naar Niels.',
    '',
    '## Tools',
    '- mcp-servers/exact-online (lookupInvoice)',
    '- mcp-servers/google-calendar (planMeeting)',
  ],
  '.claude/commands/plan-meeting.md': [
    '# /plan-meeting',
    '',
    'Boek een slot in de agenda.',
    '',
    '## Stappen',
    '1. Vraag de gewenste datum/tijd.',
    '2. Roep tool `planMeeting(slot, met)` aan.',
    '3. Bevestig in NL.',
  ],
  '.claude/commands/lookup-invoice.md': [
    '# /lookup-invoice',
    '',
    'Zoek een factuur op uit Exact Online.',
    '',
    '## Stappen',
    '1. Vraag klant-id of factuurnummer.',
    '2. Roep tool `lookupInvoice(klantId)` aan.',
    '3. Geef status en bedrag terug.',
  ],
  '.claude/commands/create-draft.md': [
    '# /create-draft',
    '',
    'Genereer een offerte-concept op basis van scope.',
    '',
    '## Stappen',
    '1. Lees voorbeelden/goede-reactie.md.',
    '2. Roep tool `createDraft(scope)` aan.',
    '3. Lever het concept op voor review.',
  ],
  'knowledge/klant-onboarding.md': [
    '# Onboarding stappen',
    '',
    '1. Kickoff binnen 5 werkdagen.',
    '2. Workshop met use-case eigenaar.',
    '3. Eerste pilot live binnen 3 weken.',
    '4. Wekelijkse check-ins met team.',
  ],
  'knowledge/tone-of-voice.md': [
    '# Tone of Voice',
    '',
    "- Direct. Geen 'wij geloven dat'.",
    '- Nederlands, met Engelse tech-termen waar nodig.',
    '- Voorbeelden boven beweringen.',
    "- Geen emoji's in zakelijke mail.",
  ],
  'knowledge/product-specs.json': [
    '{',
    '  "model": "sonnet-4",',
    '  "context_window": 200000,',
    '  "tools": ["lookupInvoice", "planMeeting"],',
    '  "temperature": 0.2',
    '}',
  ],
  'voorbeelden/goede-reactie.md': [
    '# Voorbeeld: goede reactie',
    '',
    "Vraag: 'Kunnen we dit ook zonder Microsoft?'",
    '',
    "Antwoord: 'Ja. Standaard draait dit op AWS,",
    'maar we kunnen Azure of self-hosted leveren.',
    "Wat is voor jullie de doorslag?'",
  ],
  'voorbeelden/afgewezen-deal.md': [
    '# Waarom we deze deal lieten lopen',
    '',
    '- Scope onhelder na 3 calls.',
    "- Klant wilde 'agent' zonder use case.",
    '- Geen eigenaar binnen org.',
  ],
  'mcp-servers/exact-online/server.py': [
    '# Exact Online MCP server',
    'from mcp.server import Server',
    'import os',
    '',
    'app = Server("exact-online")',
    '',
    '@app.tool()',
    'def lookupInvoice(klantId: str) -> dict:',
    '    """Haalt openstaande facturen op."""',
    '    token = os.environ["EXACT_TOKEN"]',
    '    # ...request to Exact API',
    '    return {"open": 2, "totaal": 1840.00}',
  ],
  'mcp-servers/exact-online/requirements.txt': [
    'mcp>=1.0',
    'httpx>=0.27',
  ],
  'mcp-servers/google-calendar/server.py': [
    '# Google Calendar MCP server',
    'from mcp.server import Server',
    'from datetime import datetime',
    '',
    'app = Server("google-calendar")',
    '',
    '@app.tool()',
    'def planMeeting(slot: datetime, met: str) -> dict:',
    '    """Boekt een slot + verstuurt invite."""',
    '    # ...calendar API call',
    '    return {"event_id": "abc", "status": "booked"}',
  ],
  'logs/conversations/2026-05-09-offerte-acme.md': [
    '# 2026-05-09 — Offerte ACME',
    '',
    '## Samenvatting',
    '- Klant: ACME',
    '- Scope: pilot agent voor service desk',
    '- Eigenaar: Sander',
    '',
    '## Acties',
    '- [ ] Volg op met klant binnen week 21',
  ],
};

export function AgentAnatomy() {
  const [openFile, setOpenFile] = useState<FileNode | null>(null);

  return (
    <div className="anatomy">
      <div className="anatomy-chrome">
        <div className="anatomy-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="anatomy-title mono">~/agents/account-assistent</div>
        <div className="anatomy-status mono">
          <span className="dot" />
          active
        </div>
      </div>

      <div className="anatomy-body">
        <div className="anatomy-folders">
          <div className="anatomy-tree">
            {tree.map((node, i) => (
              <FolderNode key={i} node={node} onOpen={setOpenFile} openFile={openFile} />
            ))}
          </div>
          <div className="anatomy-preview">
            {openFile ? (
              <FilePreview file={openFile} />
            ) : (
              <div className="anatomy-empty">
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)', marginBottom: 12 }}>
                  // preview
                </div>
                <div style={{ color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.6 }}>
                  Een agent is één map. <em>CLAUDE.md</em> is de instructie, <em>knowledge/</em> is wat hij weet,{' '}
                  <em>mcp-servers/</em> zijn de tools. Klik een bestand om te kijken.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="anatomy-foot mono">
        <span>$ agent.invoke()</span>
        <span className="anatomy-foot-spacer">→</span>
        <span style={{ color: 'var(--accent)' }}>1 map. 1 antwoord. Geen black box.</span>
      </div>
    </div>
  );
}

function FolderNode({
  node,
  depth = 0,
  onOpen,
  openFile,
}: {
  node: TreeNode;
  depth?: number;
  onOpen: (f: FileNode) => void;
  openFile: FileNode | null;
}) {
  const [open, setOpen] = useState(node.type === 'dir' ? node.open !== false : false);
  const isActive = openFile && node.type === 'file' && openFile.path === node.path;

  if (node.type === 'dir') {
    return (
      <div className="tree-node">
        <button
          className="tree-row"
          onClick={() => setOpen(!open)}
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          <span className="tree-caret" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>
            ▸
          </span>
          <span className="tree-glyph">
            <IconFolder size={13} />
          </span>
          <span className="tree-name">{node.name}</span>
        </button>
        {open && (
          <div>
            {node.children.map((c, i) => (
              <FolderNode key={i} node={c} depth={depth + 1} onOpen={onOpen} openFile={openFile} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      className={'tree-row tree-file ' + (isActive ? 'is-active' : '')}
      onClick={() => onOpen(node)}
      style={{ paddingLeft: 8 + depth * 16 }}
    >
      <span className="tree-caret" style={{ visibility: 'hidden' }}>
        ▸
      </span>
      <span className="tree-glyph">
        {node.lang === 'json' ? (
          <span className="mono" style={{ fontSize: 10 }}>
            {'{ }'}
          </span>
        ) : node.lang === 'py' ? (
          <span className="mono" style={{ fontSize: 10, color: 'var(--accent-hot)' }}>
            py
          </span>
        ) : node.lang === 'txt' ? (
          <span className="mono" style={{ fontSize: 10 }}>
            txt
          </span>
        ) : (
          <IconNotes size={13} />
        )}
      </span>
      <span className="tree-name">{node.name}</span>
      <span className="tree-size mono">{node.size}</span>
    </button>
  );
}

function FilePreview({ file }: { file: FileNode }) {
  const lines = fileSamples[file.path] ?? ['// no preview available'];
  return (
    <div className="file-preview">
      <div className="file-preview-head mono">{file.path}</div>
      <pre className="file-preview-body mono">
        {lines.map((l, i) => (
          <div
            key={i}
            className={'fp-line ' + (l.startsWith('#') ? 'fp-h' : l.startsWith('//') || l.startsWith('# ') ? 'fp-c' : '')}
          >
            <span className="fp-ln">{(i + 1).toString().padStart(2, '0')}</span>
            <span>{l || ' '}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

export default AgentAnatomy;
