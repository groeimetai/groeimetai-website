'use client';

import React, { ReactNode } from 'react';
import UnifiedNavigation from './UnifiedNavigation';
import { 
  useUserContext, 
  useNavigationContext, 
  useNavigationItems,
  useFilteredNavigationItems 
} from '@/hooks/useNavigationContext';
import { NavigationConfig, NavigationTheme } from '@/types/navigation';

interface UnifiedNavigationLayoutProps {
  children: ReactNode;
  className?: string;
  config?: Partial<NavigationConfig>;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onUserMenuClick?: () => void;
}

// Default navigation configuration
const defaultTheme: NavigationTheme = {
  variant: 'dark',
  accentColor: '#f97316', // orange
  background: 'bg-black',
  textColor: 'text-white/80',
  hoverColor: 'hover:text-white'
};

const defaultConfig: NavigationConfig = {
  logoSrc: '/groeimet-ai-logo.svg',
  logoAlt: 'GroeimetAI',
  theme: defaultTheme,
  showSearch: true,
  showNotifications: true,
  showUserMenu: true,
  showLanguageSwitcher: true,
  maxMobileItems: 6
};

export default function UnifiedNavigationLayout({
  children,
  className = '',
  config: userConfig = {},
  onNotificationClick,
  onSettingsClick,
  onUserMenuClick
}: UnifiedNavigationLayoutProps) {
  // Merge user config with defaults
  const config: NavigationConfig = {
    ...defaultConfig,
    ...userConfig,
    theme: {
      ...defaultTheme,
      ...userConfig.theme
    }
  };

  // Get navigation context data
  const userContext = useUserContext();
  const navigationContext = useNavigationContext();
  const allNavigationItems = useNavigationItems(userContext);
  const filteredItems = useFilteredNavigationItems(allNavigationItems, userContext);

  // Default handlers
  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Default behavior - navigate to settings
      window.location.href = '/settings';
    }
  };

  return (
    <div className={`min-h-screen ${config.theme.background} ${className}`}>
      <UnifiedNavigation
        config={config}
        userContext={userContext}
        navigationContext={navigationContext}
        items={filteredItems}
        onNotificationClick={onNotificationClick}
        onSettingsClick={handleSettingsClick}
        onUserMenuClick={onUserMenuClick}
      />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}

// Export a simplified version for easy replacement of existing components
export function SimpleNavigationLayout({ children }: { children: ReactNode }) {
  return (
    <UnifiedNavigationLayout>
      {children}
    </UnifiedNavigationLayout>
  );
}

// Export theme presets for easy customization
export const navigationThemes = {
  dark: {
    variant: 'dark' as const,
    accentColor: '#f97316',
    background: 'bg-black',
    textColor: 'text-white/80',
    hoverColor: 'hover:text-white'
  },
  light: {
    variant: 'light' as const,
    accentColor: '#f97316',
    background: 'bg-white',
    textColor: 'text-gray-700',
    hoverColor: 'hover:text-gray-900'
  },
  transparent: {
    variant: 'transparent' as const,
    accentColor: '#f97316',
    background: 'bg-transparent',
    textColor: 'text-white/80',
    hoverColor: 'hover:text-white'
  }
} as const;