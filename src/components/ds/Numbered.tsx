import type { ReactNode } from 'react';

export function Numbered({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="numbered">
      <div className="numbered-n mono">{n}</div>
      <div className="numbered-body">
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}

export default Numbered;
