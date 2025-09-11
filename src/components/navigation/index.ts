// Main navigation components
export { default as UnifiedNavigation } from './UnifiedNavigation';
export { default as UnifiedNavigationLayout, SimpleNavigationLayout, navigationThemes } from './UnifiedNavigationLayout';
export { default as AccessibleNavigationWrapper, FullyAccessibleNavigation } from './AccessibleNavigationWrapper';
export { default as NotificationBadge } from './NotificationBadge';

// Existing components (for backward compatibility)
export { default as Navigation } from '../layout/Navigation';
export { default as DynamicNavigation } from './DynamicNavigation';
export { default as AccessibleNav } from './AccessibleNav';

// Hooks and utilities
export {
  useUserContext,
  useNavigationContext,
  useNavigationItems,
  useFilteredNavigationItems
} from '../../hooks/useNavigationContext';

// Types
export type {
  NavigationItem,
  UserContextData,
  NavigationContextData,
  BreadcrumbItem,
  NavigationTheme,
  NavigationConfig,
  UnifiedNavigationProps,
  MobileNavigationProps,
  NotificationBadgeProps,
  UserMenuProps
} from '../../types/navigation';