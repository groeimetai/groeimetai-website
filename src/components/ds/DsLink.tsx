import type { ReactNode, MouseEventHandler } from 'react';
import NextLink from 'next/link';
import { IconArrow } from './icons';

export function DsLink({
  children,
  onClick,
  href,
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  href?: string;
}) {
  const inner = (
    <>
      <span>{children}</span>
      <span className="arrow">
        <IconArrow size={14} />
      </span>
    </>
  );

  if (href && href.startsWith('http')) {
    return (
      <a className="btn-link" onClick={onClick} href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  if (href) {
    return (
      <NextLink className="btn-link" onClick={onClick} href={href}>
        {inner}
      </NextLink>
    );
  }
  return (
    <a className="btn-link" onClick={onClick} href="#">
      {inner}
    </a>
  );
}

export default DsLink;
