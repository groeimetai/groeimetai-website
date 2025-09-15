/**
 * Integration Example: How to replace NotificationCenter with UnifiedCommunicationCenter
 *
 * This example shows how to update existing navigation components to use the new
 * unified communication center instead of the separate notification center.
 */

import React from 'react';
import UnifiedCommunicationCenter from '@/components/UnifiedCommunicationCenter';

// Example 1: Simple replacement in navigation bar
export function NavigationWithUnifiedComms() {
  return (
    <div className="flex items-center gap-4">
      {/* Other navigation items */}
      <div className="flex items-center space-x-2">
        {/* Replace this: */}
        {/* <NotificationCenter /> */}

        {/* With this: */}
        <UnifiedCommunicationCenter />
      </div>
    </div>
  );
}

// Example 2: Update to UnifiedNavigation.tsx
export const UnifiedNavigationUpdate = `
// In src/components/navigation/UnifiedNavigation.tsx

// OLD IMPORT:
// import NotificationCenter from '@/components/NotificationCenter';

// NEW IMPORT:
import UnifiedCommunicationCenter from '@/components/UnifiedCommunicationCenter';

// OLD USAGE (around lines 304 and 516):
// <NotificationCenter />

// NEW USAGE:
<UnifiedCommunicationCenter />
`;

// Example 3: Complete navigation bar example
export function ExampleNavigationBar() {
  return (
    <nav className="bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-white font-bold text-xl">GroeimetAI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-white/80 hover:text-white">
              Dashboard
            </a>
            <a href="/projects" className="text-white/80 hover:text-white">
              Projects
            </a>
            <a href="/reports" className="text-white/80 hover:text-white">
              Reports
            </a>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Unified Communication Center */}
            <UnifiedCommunicationCenter />

            {/* User menu */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Example 4: Dashboard layout integration
export function DashboardLayoutWithComms() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>

            {/* Action buttons including unified comms */}
            <div className="flex items-center space-x-3">
              <UnifiedCommunicationCenter />
              <button className="bg-orange hover:bg-orange/90 text-white px-4 py-2 rounded-lg">
                New Project
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Your dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard widgets */}
        </div>
      </main>
    </div>
  );
}

// Example 5: Mobile-first responsive integration
export function MobileResponsiveNavigation() {
  return (
    <div className="bg-black/95 backdrop-blur-sm">
      {/* Mobile header */}
      <div className="flex items-center justify-between p-4 md:hidden">
        <button className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="text-white font-bold">GroeimetAI</span>

        {/* Mobile communication center */}
        <UnifiedCommunicationCenter />
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between p-4">
        <div className="flex items-center space-x-8">
          <span className="text-white font-bold text-xl">GroeimetAI</span>
          <nav className="flex space-x-6">
            <a href="/dashboard" className="text-white/80 hover:text-white">Dashboard</a>
            <a href="/projects" className="text-white/80 hover:text-white">Projects</a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <UnifiedCommunicationCenter />
          <div className="w-8 h-8 bg-orange rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedCommunicationCenter;