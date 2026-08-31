import Link from 'next/link';

/**
 * Root-level 404.
 *
 * The `<html>`/`<body>` shell lives in `src/app/[locale]/layout.tsx` so that
 * `<html lang>` can reflect the actual locale. Everything rendered *outside*
 * that segment — this page most of all — therefore has to bring its own
 * document shell, otherwise Next emits a fragment starting at `<meta charSet>`
 * with no `<html>` element at all. Crawlers and AI fetchers treat that as a
 * malformed document.
 *
 * `src/app/[locale]/not-found.tsx` handles the localised, designed 404 for real
 * pages; this one only catches URLs that never matched a locale segment.
 */
export default function NotFound() {
  return (
    <html lang="nl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0a0a0b',
          color: '#f4f4f1',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        }}
      >
        <main style={{ textAlign: 'center', padding: '48px 24px', maxWidth: 520 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#71717a',
            }}
          >
            404
          </p>
          <h1 style={{ margin: '16px 0 0', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Deze pagina bestaat niet
          </h1>
          <p style={{ margin: '16px 0 32px', fontSize: 16, lineHeight: 1.5, color: '#a1a1aa' }}>
            De link klopt niet meer of is verkeerd overgenomen.
          </p>
          <Link
            href="/nl"
            style={{
              display: 'inline-block',
              padding: '11px 18px',
              borderRadius: 8,
              background: '#ff5a1f',
              color: '#1a0d05',
              fontWeight: 500,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Naar de homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
