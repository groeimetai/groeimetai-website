import type { ReactNode } from 'react';

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export default Eyebrow;
