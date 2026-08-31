'use client';

import { useId, useState } from 'react';

export type FAQItem = { q: string; a: string };

/**
 * Accordion: one item open at a time, nothing open on load.
 *
 * The open/close animation is entirely CSS — `.faq-item.open` drives the
 * `.faq-a` max-height 0 → 300px + margin-top 0 → 14px over .35s, and rotates
 * the `+` toggle 45° onto the accent. Every answer stays in the DOM, so the
 * copy is in the server-rendered HTML.
 */
export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const uid = useId();

  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-faq-a-${i}`;
        return (
          <div key={i} className={'faq-item' + (isOpen ? ' open' : '')}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: '100%',
                gap: 20,
                textAlign: 'left',
                lineHeight: 'inherit',
                background: 'transparent',
                border: 'none',
                appearance: 'none',
                padding: 0,
              }}
            >
              <span>{it.q}</span>
              <span className="faq-toggle" aria-hidden>
                +
              </span>
            </button>
            <div className="faq-a" id={panelId}>
              <p>{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FAQ;
