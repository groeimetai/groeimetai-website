'use client';

import { useState } from 'react';

export type FAQItem = { q: string; a: string };

export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number>(0);
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} className={'faq-item ' + (open === i ? 'open' : '')}>
          <div className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{it.q}</span>
            <span className="faq-toggle">+</span>
          </div>
          <div className="faq-a">
            <p>{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FAQ;
