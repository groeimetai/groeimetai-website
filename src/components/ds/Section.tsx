import type { ReactNode, CSSProperties } from 'react';

export function Section({
  id,
  light = false,
  tight = false,
  children,
  style,
}: {
  id?: string;
  light?: boolean;
  tight?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const cls = 'section' + (light ? ' light' : '') + (tight ? ' tight' : '');
  return (
    <section id={id} className={cls} style={style}>
      <div className="container">{children}</div>
    </section>
  );
}

export default Section;
