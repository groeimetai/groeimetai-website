'use client';

/**
 * Slim Help shim.
 *
 * The previous HelpSystem was a 1000+ line dashboard tour-and-tooltip
 * engine with login-page links and old positioning copy. The public
 * marketing site doesn't need any of that — the dashboard is admin-only
 * now, the FAQ lives on /faq, and the chatbot covers ad-hoc questions.
 *
 * This file keeps the original API surface (HelpProvider, useHelp,
 * HelpTrigger) so existing call-sites don't break. Calls become no-ops.
 * If we ever want a real help drawer, we'll replace this with an
 * intentional component, not a tour engine.
 */

import React, { createContext, useContext, useMemo } from 'react';

interface HelpContextType {
  showTooltip: (tooltipId: string) => void;
  hideTooltip: (tooltipId: string) => void;
  startTutorial: (tutorialId: string) => void;
  openHelpCenter: () => void;
}

const NOOP = () => {};

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const ctx = useContext(HelpContext);
  // Never throw — keep it tolerant so consumers (e.g. CommandPalette)
  // outside the provider don't crash.
  return (
    ctx ?? {
      showTooltip: NOOP,
      hideTooltip: NOOP,
      startTutorial: NOOP,
      openHelpCenter: NOOP,
    }
  );
};

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<HelpContextType>(
    () => ({
      showTooltip: NOOP,
      hideTooltip: NOOP,
      startTutorial: NOOP,
      openHelpCenter: NOOP,
    }),
    []
  );
  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

export function HelpTrigger({ children }: { children?: React.ReactNode; tooltipId?: string }) {
  // Trigger is now an inert wrapper. If something needs help, link to
  // /contact or /faq directly from the call-site.
  return <>{children}</>;
}

export default HelpProvider;
