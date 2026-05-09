import type { ReactNode } from 'react';

export function Pill({ children, withDot = true }: { children: ReactNode; withDot?: boolean }) {
  return (
    <span className="pill">
      {withDot && <span className="dot" />}
      {children}
    </span>
  );
}

export default Pill;
