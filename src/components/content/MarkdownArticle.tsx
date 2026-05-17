// Minimal markdown-to-React renderer for content pages.
// Skips the @tailwindcss/typography dependency the playbook flags — we
// own ~30 articles so we want full control over how each block renders.
//
// Supports: # h1, ## h2, ### h3, paragraphs, **bold**, *italic*, `inline code`,
// [links](url), - / 1. lists, > blockquote, --- horizontal rule.
// Anything fancier (tables, images, code fences) is intentionally out of
// scope; if a post needs more, it can render raw JSX instead of markdown.

import type { ReactNode } from 'react';

type Block =
  | { type: 'h1' | 'h2' | 'h3'; text: string; id: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'hr' };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed === '---') {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      blocks.push({ type: 'h3', text, id: slugify(text) });
      i += 1;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      blocks.push({ type: 'h2', text, id: slugify(text) });
      i += 1;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      const text = trimmed.slice(2);
      blocks.push({ type: 'h1', text, id: slugify(text) });
      i += 1;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        buf.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push({ type: 'quote', text: buf.join(' ') });
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Paragraph: collect consecutive non-empty lines.
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('> ') &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('* ') &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      lines[i].trim() !== '---'
    ) {
      buf.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'p', text: buf.join(' ') });
  }

  return blocks;
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  // Order matters: links before bold/italic so we don't break url parens.
  const nodes: ReactNode[] = [];
  let remaining = text;
  let k = 0;

  const patterns: Array<{
    regex: RegExp;
    render: (m: RegExpExecArray, key: string) => ReactNode;
  }> = [
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m, key) => (
        <a key={key} href={m[2]} className="content-link">
          {m[1]}
        </a>
      ),
    },
    {
      regex: /`([^`]+)`/,
      render: (m, key) => (
        <code key={key} className="content-code">
          {m[1]}
        </code>
      ),
    },
    {
      regex: /\*\*([^*]+)\*\*/,
      render: (m, key) => <strong key={key}>{m[1]}</strong>,
    },
    {
      regex: /\*([^*]+)\*/,
      render: (m, key) => <em key={key}>{m[1]}</em>,
    },
  ];

  while (remaining) {
    let earliest: { idx: number; match: RegExpExecArray; pattern: typeof patterns[number] } | null = null;
    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      const match = pattern.regex.exec(remaining);
      if (match && (earliest === null || match.index < earliest.idx)) {
        earliest = { idx: match.index, match, pattern };
      }
    }

    if (!earliest) {
      nodes.push(remaining);
      break;
    }

    if (earliest.idx > 0) {
      nodes.push(remaining.slice(0, earliest.idx));
    }
    nodes.push(earliest.pattern.render(earliest.match, `${keyBase}-${k++}`));
    remaining = remaining.slice(earliest.idx + earliest.match[0].length);
  }

  return nodes;
}

export function MarkdownArticle({ source }: { source: string }) {
  const blocks = parseBlocks(source);

  return (
    <div className="content-article">
      {blocks.map((block, i) => {
        const key = `b-${i}`;
        switch (block.type) {
          case 'h1':
            return (
              <h1 key={key} id={block.id} className="content-h1">
                {block.text}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={key} id={block.id} className="content-h2">
                {block.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={key} id={block.id} className="content-h3">
                {block.text}
              </h3>
            );
          case 'p':
            return (
              <p key={key} className="content-p">
                {renderInline(block.text, key)}
              </p>
            );
          case 'ul':
            return (
              <ul key={key} className="content-ul">
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key} className="content-ol">
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ol>
            );
          case 'quote':
            return (
              <blockquote key={key} className="content-quote">
                {renderInline(block.text, key)}
              </blockquote>
            );
          case 'hr':
            return <hr key={key} className="content-hr" />;
        }
      })}
    </div>
  );
}

/**
 * Plain-text rendering of a markdown body, used for llms-full.txt and
 * meta-description generation. Inline emphasis is stripped, structure kept.
 */
export function markdownToPlain(source: string): string {
  return source
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^>\s?/gm, '')
    .trim();
}
