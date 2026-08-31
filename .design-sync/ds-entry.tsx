/**
 * design-sync entry for the GroeimetAI design system.
 *
 * This file exists only so the sync has one module that (a) pulls in the
 * design-system stylesheet closure and (b) exposes the `.ds` root wrapper the
 * app applies on every design-system page. It adds no styling and no markup
 * of its own — every component below is the repo's real implementation from
 * src/components/ds/.
 */
import '../src/styles/design-system/index.css';
import './fonts/bridge.css';
import type { ReactNode } from 'react';

export * from '../src/components/ds';

/**
 * Root wrapper for every design-system page.
 *
 * All GroeimetAI design-system styles are scoped under `.ds` (see
 * src/styles/design-system/base.css) so they never bleed into the
 * shadcn-styled admin and dashboard pages. Anything built with this design
 * system must therefore be rendered inside `DsRoot` — outside it, components
 * fall back to unstyled browser defaults.
 *
 * In the app this is written inline as `<div className="ds">…</div>`.
 *
 * @category Layout
 */
export function DsRoot({ children }: { children: ReactNode }) {
  return <div className="ds">{children}</div>;
}
