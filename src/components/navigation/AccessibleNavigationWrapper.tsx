'use client';

import React, { useRef, useEffect } from 'react';
import { announce, useKeyboardNavigation } from '@/lib/accessibility';
import UnifiedNavigation from './UnifiedNavigation';
import { UnifiedNavigationProps } from '@/types/navigation';

interface AccessibleNavigationWrapperProps extends UnifiedNavigationProps {
  announceNavigation?: boolean;
  enableKeyboardShortcuts?: boolean;
}

export default function AccessibleNavigationWrapper({
  announceNavigation = true,
  enableKeyboardShortcuts = true,
  ...navigationProps
}: AccessibleNavigationWrapperProps) {
  const navRef = useRef<HTMLElement>(null);

  // Initialize keyboard navigation if enabled
  useKeyboardNavigation(navRef, {
    enabled: enableKeyboardShortcuts,
    loop: true,
    skipDisabled: true
  });

  // Handle navigation announcements
  useEffect(() => {
    if (announceNavigation) {
      const currentPage = navigationProps.navigationContext.pageTitle;
      if (currentPage) {
        announce(`Navigated to ${currentPage}`, 'polite');
      }
    }
  }, [navigationProps.navigationContext.pageTitle, announceNavigation]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + N: Focus navigation
      if (event.altKey && event.key === 'n') {
        event.preventDefault();
        const firstNavItem = navRef.current?.querySelector('a, button');
        if (firstNavItem instanceof HTMLElement) {
          firstNavItem.focus();
          announce('Navigation focused', 'polite');
        }
      }

      // Alt + S: Focus search (if available)
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        const searchButton = navRef.current?.querySelector('[aria-label*="search"], [aria-label*="Search"]');
        if (searchButton instanceof HTMLElement) {
          searchButton.focus();
          announce('Search focused', 'polite');
        }
      }

      // Alt + U: Focus user menu (if authenticated)
      if (event.altKey && event.key === 'u') {
        event.preventDefault();
        const userMenu = navRef.current?.querySelector('[aria-label*="user"], [aria-label*="User"]');
        if (userMenu instanceof HTMLElement) {
          userMenu.focus();
          announce('User menu focused', 'polite');
        }
      }

      // Escape: Close any open menus
      if (event.key === 'Escape') {
        const openMenus = navRef.current?.querySelectorAll('[aria-expanded="true"]');
        if (openMenus) {
          openMenus.forEach((menu) => {
            if (menu instanceof HTMLElement) {
              menu.click(); // Close the menu
            }
          });
          announce('Menus closed', 'polite');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts]);

  return (
    <div ref={navRef}>
      <UnifiedNavigation {...navigationProps} />
      
      {/* Screen reader instructions */}
      <div className="sr-only">
        <p>
          Navigation shortcuts: Alt+N for navigation menu, Alt+S for search, 
          Alt+U for user menu, Escape to close menus.
        </p>
      </div>
    </div>
  );
}

// Enhanced version with additional accessibility features
export function FullyAccessibleNavigation(props: AccessibleNavigationWrapperProps) {
  return (
    <>
      {/* High contrast mode detection */}
      <style jsx>{`
        @media (prefers-contrast: high) {
          .navigation-item {
            border: 2px solid currentColor;
          }
          .navigation-item:focus {
            outline: 3px solid #0066cc;
            outline-offset: 2px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      
      <AccessibleNavigationWrapper {...props} />
    </>
  );
}