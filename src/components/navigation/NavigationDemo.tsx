'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  UnifiedNavigationLayout, 
  SimpleNavigationLayout,
  navigationThemes,
  AccessibleNavigationWrapper,
  FullyAccessibleNavigation 
} from './index';

interface NavigationDemoProps {
  showDemo?: boolean;
}

export default function NavigationDemo({ showDemo = false }: NavigationDemoProps) {
  const [currentDemo, setCurrentDemo] = useState<'basic' | 'themed' | 'accessible'>('basic');

  if (!showDemo) {
    return null;
  }

  const demoContent = (
    <div className="p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Unified Navigation System Demo
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">
          This demonstrates the unified navigation system with role-based content, 
          notification integration, and full accessibility support.
        </p>
      </div>

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Navigation Features</CardTitle>
          <CardDescription className="text-white/80">
            Current implementation includes all requested features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-white font-medium">✅ User Role-Based Content</h3>
              <p className="text-white/60 text-sm">
                Navigation items filter based on authentication status and admin privileges
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-medium">✅ Notification Integration</h3>
              <p className="text-white/60 text-sm">
                Badge counter with urgent indicators and sound notifications
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-medium">✅ Settings Button</h3>
              <p className="text-white/60 text-sm">
                User menu with settings access and logout functionality
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-medium">✅ Responsive Design</h3>
              <p className="text-white/60 text-sm">
                Mobile-optimized with collapsible menu and touch-friendly interactions
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-medium">✅ Accessibility Features</h3>
              <p className="text-white/60 text-sm">
                ARIA labels, keyboard navigation, screen reader support
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-medium">✅ Page Context Awareness</h3>
              <p className="text-white/60 text-sm">
                Dynamic breadcrumbs and page titles with color-coded contexts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentDemo} onValueChange={(v) => setCurrentDemo(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5">
              <TabsTrigger value="basic">Basic Usage</TabsTrigger>
              <TabsTrigger value="themed">Themed</TabsTrigger>
              <TabsTrigger value="accessible">Accessible</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <h3 className="text-white font-medium">Simple Integration</h3>
              <pre className="bg-black/50 p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
{`import { SimpleNavigationLayout } from '@/components/navigation';

export default function App() {
  return (
    <SimpleNavigationLayout>
      <YourPageContent />
    </SimpleNavigationLayout>
  );
}`}
              </pre>
            </TabsContent>
            
            <TabsContent value="themed" className="space-y-4">
              <h3 className="text-white font-medium">Custom Theme Configuration</h3>
              <pre className="bg-black/50 p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
{`import { UnifiedNavigationLayout, navigationThemes } from '@/components/navigation';

export default function App() {
  return (
    <UnifiedNavigationLayout
      config={{
        theme: navigationThemes.light,
        showNotifications: true,
        showSearch: false
      }}
      onSettingsClick={() => console.log('Settings clicked')}
    >
      <YourPageContent />
    </UnifiedNavigationLayout>
  );
}`}
              </pre>
            </TabsContent>
            
            <TabsContent value="accessible" className="space-y-4">
              <h3 className="text-white font-medium">Full Accessibility Support</h3>
              <pre className="bg-black/50 p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
{`import { FullyAccessibleNavigation } from '@/components/navigation';

export default function App() {
  return (
    <FullyAccessibleNavigation
      config={navigationConfig}
      userContext={userContext}
      navigationContext={navigationContext}
      items={navigationItems}
      announceNavigation={true}
      enableKeyboardShortcuts={true}
    >
      <YourPageContent />
    </FullyAccessibleNavigation>
  );
}`}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20">Alt + N</Badge>
              <span className="text-white/80">Focus Navigation Menu</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20">Alt + S</Badge>
              <span className="text-white/80">Focus Search</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20">Alt + U</Badge>
              <span className="text-white/80">Focus User Menu</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20">Escape</Badge>
              <span className="text-white/80">Close All Menus</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div>
      {currentDemo === 'basic' && (
        <SimpleNavigationLayout>
          {demoContent}
        </SimpleNavigationLayout>
      )}
      
      {currentDemo === 'themed' && (
        <UnifiedNavigationLayout
          config={{
            theme: navigationThemes.dark,
            showNotifications: true,
            showSearch: true
          }}
        >
          {demoContent}
        </UnifiedNavigationLayout>
      )}
      
      {currentDemo === 'accessible' && (
        <FullyAccessibleNavigation
          config={{
            logoSrc: '/groeimet-ai-logo.svg',
            logoAlt: 'GroeimetAI',
            theme: navigationThemes.dark,
            showNotifications: true,
            showSearch: true,
            showUserMenu: true,
            showLanguageSwitcher: true
          }}
          userContext={{
            isAuthenticated: true,
            isAdmin: false,
            user: {
              id: 'demo',
              name: 'Demo User',
              email: 'demo@groeimetai.nl'
            },
            notifications: {
              unreadCount: 3,
              hasUrgent: true
            }
          }}
          navigationContext={{
            currentPath: '/demo',
            pageTitle: 'Navigation Demo',
            pageSubtitle: 'Testing the unified navigation system'
          }}
          items={[]}
          announceNavigation={true}
          enableKeyboardShortcuts={true}
        >
          {demoContent}
        </FullyAccessibleNavigation>
      )}
    </div>
  );
}