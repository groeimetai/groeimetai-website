/**
 * Build-time stand-in for `next/link`, used only by the design-system sync.
 *
 * DsLink renders a NextLink for internal hrefs. Next's client Link reads
 * `process.env.__NEXT_*` at module scope, so bundling it outside a Next build
 * throws `ReferenceError: process is not defined` and takes the whole
 * window.GroeimetAI bundle down with it.
 *
 * The DOM Next's Link produces for a plain string href is an <a> carrying the
 * same className, children and handlers, so this shim renders exactly that.
 * Router-only props (prefetch, replace, scroll, shallow, locale, …) are
 * accepted and dropped — there is no router in a design environment.
 *
 * Wired through .design-sync/tsconfig.sync.json `paths`, so it applies to both
 * the shipped bundle and the preview cards. Nothing in src/ is affected.
 */
import * as React from 'react';

type NextLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string | { pathname?: string };
  as?: string | object;
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  locale?: string | false;
  legacyBehavior?: boolean;
};

const Link = React.forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  { href, as: _as, prefetch: _p, replace: _r, scroll: _s, shallow: _sh, passHref: _ph, locale: _l, legacyBehavior: _lb, children, ...rest },
  ref,
) {
  const url = typeof href === 'string' ? href : (href?.pathname ?? '#');
  return (
    <a ref={ref} href={url} {...rest}>
      {children}
    </a>
  );
});

export default Link;
