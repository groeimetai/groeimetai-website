import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string | number;
  description?: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  external?: boolean;
  children?: NavigationItem[];
  onClick?: () => void;
}

export interface UserContextData {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user?: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  notifications?: {
    unreadCount: number;
    hasUrgent: boolean;
  };
}

export interface NavigationContextData {
  currentPath: string;
  pageTitle?: string;
  pageSubtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

export interface NavigationTheme {
  variant: 'dark' | 'light' | 'transparent';
  accentColor: string;
  background: string;
  textColor: string;
  hoverColor: string;
}

export interface NavigationConfig {
  logoSrc: string;
  logoAlt: string;
  theme: NavigationTheme;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  showLanguageSwitcher?: boolean;
  maxMobileItems?: number;
}

export interface UnifiedNavigationProps {
  config: NavigationConfig;
  userContext: UserContextData;
  navigationContext: NavigationContextData;
  items: NavigationItem[];
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onUserMenuClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavigationItem[];
  userContext: UserContextData;
  theme: NavigationTheme;
}

export interface NotificationBadgeProps {
  count: number;
  hasUrgent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export interface UserMenuProps {
  user: UserContextData['user'];
  isAdmin: boolean;
  onLogout: () => void;
  onSettingsClick: () => void;
  theme: NavigationTheme;
}