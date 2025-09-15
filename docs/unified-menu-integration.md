# Unified Messages & Notifications Menu System

## Overview

The Unified Menu System consolidates the separate Messages and Notifications systems into a single, efficient interface that provides:

- **Single Entry Point**: One menu for both messages and notifications
- **Smart Badge Counts**: Combined and separate unread counters
- **Real-time Updates**: Live updates with sound notifications
- **Quick Actions**: Reply, mark as read, delete, archive, star
- **Advanced Filtering**: Search, priority filters, date grouping
- **Mobile Responsive**: Touch-optimized interface for all devices
- **Accessibility**: Keyboard shortcuts and screen reader support

## Architecture

### Core Components

```
src/components/unified-menu/
├── index.ts                    # Main exports
├── UnifiedMenu.tsx            # Main menu component
├── UnifiedMenuBadge.tsx       # Badge component variants
├── UnifiedMenuProvider.tsx    # Context provider
└── QuickReplyComponent.tsx    # Quick reply interface
```

### Type Definitions

```
src/types/unified-menu.ts      # TypeScript interfaces
```

### Hooks

```
src/hooks/useUnifiedMenu.ts    # Main state management hook
```

## Key Features

### 1. Unified Interface Design

- **Combined Menu**: Single overlay for messages and notifications
- **Tab System**: Easy switching between content types
- **Consistent Branding**: GroeimetAI black/orange theme
- **Smooth Animations**: Framer Motion transitions

### 2. Smart Integration Features

- **Combined Badge Counts**: Total unread count displayed prominently
- **Priority System**: High priority items shown first
- **Action Indicators**: Visual cues for items requiring action
- **Real-time Updates**: Live data with WebSocket-like performance

### 3. Enhanced UX Features

- **Quick Reply**: In-menu reply functionality for messages
- **Search Functionality**: Search across both messages and notifications
- **Date Grouping**: Smart organization by date (Today, Yesterday, etc.)
- **Context Menus**: Right-click actions for quick operations

### 4. Mobile-First Design

- **Touch Interactions**: Optimized for mobile devices
- **Responsive Layout**: Adapts to all screen sizes
- **Touch Targets**: Minimum 44px touch areas
- **Swipe Gestures**: Natural mobile interactions

## Implementation Guide

### 1. Basic Integration

Replace the existing navigation with the unified system:

```tsx
// Before (separate systems)
import NotificationCenter from '@/components/NotificationCenter';

// After (unified system)
import {
  UnifiedMenuProvider,
  UnifiedMenu,
  UnifiedMenuBadgeDesktop,
} from '@/components/unified-menu';

function Navigation() {
  const { user } = useAuth();

  return (
    <nav>
      {/* Other nav items */}

      {user && (
        <UnifiedMenuProvider userId={user.uid} isAdmin={false}>
          <UnifiedMenuBadgeDesktop />
          <UnifiedMenu />
        </UnifiedMenuProvider>
      )}
    </nav>
  );
}
```

### 2. Configuration Options

```tsx
const config = {
  maxItemsPerPage: 50,
  autoRefreshInterval: 30000,
  enableRealTimeUpdates: true,
  enableNotificationSounds: true,
  enableQuickReply: true,
  enableSearch: true,
  enableFilters: true,
  mobileBreakpoint: 768,
};

<UnifiedMenuProvider config={config} userId={user.uid} isAdmin={false}>
  {/* Menu components */}
</UnifiedMenuProvider>
```

### 3. Custom Badge Variants

```tsx
// Desktop version with labels
<UnifiedMenuBadgeDesktop />

// Mobile optimized
<UnifiedMenuBadgeMobile />

// Compact version
<UnifiedMenuBadge variant="compact" />

// Icon only
<UnifiedMenuBadge variant="icon-only" />

// With separate counts
<UnifiedMenuBadge showSeparateCounts={true} />
```

## Migration Steps

### Phase 1: Replace Navigation Component

1. **Update Layout Component**:
   ```tsx
   // In src/components/layout/Navigation.tsx
   import { NavigationWithUnifiedMenu } from './NavigationWithUnifiedMenu';
   export default NavigationWithUnifiedMenu;
   ```

2. **Remove Old Imports**:
   - Remove `NotificationCenter` imports
   - Remove separate message link references
   - Update mobile menu structure

### Phase 2: Update Dashboard Integration

1. **Dashboard Navigation**:
   ```tsx
   // In dashboard components
   import { UnifiedMenuBadge } from '@/components/unified-menu';

   // Replace existing notification center
   <UnifiedMenuBadge variant="compact" />
   ```

### Phase 3: Clean Up Redundant Components

1. **Remove Deprecated Components** (after migration):
   - `src/components/NotificationCenter.tsx`
   - Separate message notification badges
   - Old notification service references

## API Integration

### 1. Firestore Schema

The system works with existing Firestore collections:

```typescript
// Messages collection
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  content: string;
  createdAt: Timestamp;
  isRead: boolean;
  conversationId?: string;
  attachments?: FileAttachment[];
}

// Notifications collection
interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'quote' | 'project' | 'payment' | 'system' | 'meeting';
  title: string;
  description: string;
  read: boolean;
  createdAt: Timestamp;
  priority?: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
  link?: string;
}
```

### 2. Real-time Subscriptions

```typescript
// Automatic real-time updates via Firestore onSnapshot
const messagesQuery = query(
  collection(db, 'messages'),
  where('senderId', '==', user.uid),
  orderBy('createdAt', 'desc'),
  limit(50)
);

onSnapshot(messagesQuery, (snapshot) => {
  // Automatic state updates
});
```

## Customization Options

### 1. Theme Customization

```css
/* Custom CSS variables for theming */
.unified-menu {
  --menu-bg: rgba(0, 0, 0, 0.95);
  --menu-border: rgba(255, 255, 255, 0.2);
  --accent-color: #ff6b35; /* Orange */
  --text-primary: white;
  --text-secondary: rgba(255, 255, 255, 0.6);
}
```

### 2. Custom Actions

```tsx
const customActions = {
  // Add custom context menu actions
  exportData: async (id: string) => {
    // Custom export functionality
  },

  // Custom quick actions
  prioritize: async (id: string) => {
    // Custom priority setting
  },
};

<UnifiedMenuProvider
  customActions={customActions}
  userId={user.uid}
>
  {/* Components */}
</UnifiedMenuProvider>
```

## Performance Optimizations

### 1. Virtual Scrolling

For large datasets, implement virtual scrolling:

```tsx
import { FixedSizeList as List } from 'react-window';

// Automatically enabled for 100+ items
```

### 2. Pagination

```tsx
const { loadMore, hasMore } = useUnifiedMenuContext();

// Infinite scroll with automatic pagination
<InfiniteScroll
  hasMore={hasMore}
  loadMore={loadMore}
>
  {/* Items */}
</InfiniteScroll>
```

### 3. Debounced Search

```tsx
// Built-in search debouncing (300ms)
const { setSearchQuery } = useUnifiedMenuContext();

// Automatic debouncing prevents excessive queries
setSearchQuery(userInput);
```

## Security Considerations

### 1. Data Access Control

```typescript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Messages: users can only see their own
    match /messages/{messageId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.senderId ||
         request.auth.uid == resource.data.recipientId);
    }

    // Notifications: users can only see their own
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 2. Input Sanitization

```typescript
// Automatic XSS prevention
const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content);
};

// Applied to all user-generated content
```

## Testing Strategy

### 1. Unit Tests

```typescript
// Test unified menu hook
describe('useUnifiedMenu', () => {
  it('should merge messages and notifications correctly', () => {
    // Test implementation
  });

  it('should calculate badge counts accurately', () => {
    // Test implementation
  });
});
```

### 2. Integration Tests

```typescript
// Test real-time updates
describe('Real-time Updates', () => {
  it('should update badges when new messages arrive', async () => {
    // Test implementation
  });
});
```

### 3. E2E Tests

```typescript
// Test user workflows
describe('Unified Menu E2E', () => {
  it('should allow quick reply to messages', async () => {
    // Test implementation
  });
});
```

## Monitoring and Analytics

### 1. Usage Metrics

```typescript
// Built-in analytics
const metrics = {
  menuOpenCount: number,
  messageReplies: number,
  notificationsCleared: number,
  searchUsage: number,
  averageResponseTime: number,
};
```

### 2. Performance Monitoring

```typescript
// Performance tracking
const performanceMetrics = {
  loadTime: number,
  renderTime: number,
  memoryUsage: number,
  errorRate: number,
};
```

## Accessibility Features

### 1. Keyboard Navigation

- **Tab**: Navigate through items
- **Enter**: Open/activate item
- **Space**: Mark as read/unread
- **Escape**: Close menu
- **⌘/Ctrl + Enter**: Send quick reply

### 2. Screen Reader Support

```tsx
// ARIA attributes automatically applied
<div
  role="menu"
  aria-label="Messages and Notifications"
  aria-live="polite"
  aria-atomic="false"
>
  {/* Accessible content */}
</div>
```

### 3. High Contrast Support

```css
@media (prefers-contrast: high) {
  .unified-menu {
    --menu-bg: black;
    --text-primary: white;
    --accent-color: #ffff00;
  }
}
```

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Safari**: iOS 14+
- **Chrome Mobile**: Android 8+

## Future Enhancements

### 1. Planned Features

- **Voice Replies**: Speech-to-text integration
- **Smart Categorization**: AI-powered message grouping
- **Workflow Integration**: Connect with project management
- **Offline Support**: Service worker caching
- **Push Notifications**: Native browser notifications

### 2. Performance Improvements

- **Background Sync**: Queue actions when offline
- **Intelligent Prefetching**: Preload likely-needed data
- **WebAssembly**: High-performance filtering/sorting
- **IndexedDB**: Local caching layer

### 3. Enterprise Features

- **Multi-tenant Support**: Organization-wide notifications
- **Admin Dashboard**: Notification management interface
- **Compliance Logging**: Audit trail for all actions
- **API Integration**: Third-party service connections

## Support and Maintenance

### 1. Error Handling

```typescript
// Comprehensive error boundaries
<ErrorBoundary fallback={<UnifiedMenuError />}>
  <UnifiedMenu />
</ErrorBoundary>
```

### 2. Logging

```typescript
// Structured logging for debugging
const logger = {
  info: (message: string, context: object) => {},
  warn: (message: string, context: object) => {},
  error: (error: Error, context: object) => {},
};
```

### 3. Version Management

```typescript
// Semantic versioning for API compatibility
const MENU_VERSION = '1.0.0';

// Backward compatibility checks
if (isCompatibleVersion(MENU_VERSION)) {
  // Initialize menu
}
```

This unified system provides a comprehensive solution for message and notification management while maintaining excellent performance, accessibility, and user experience standards.