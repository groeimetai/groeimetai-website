import { Timestamp } from 'firebase/firestore';

// Base interface for unified items
export interface UnifiedItem {
  id: string;
  type: 'message' | 'notification';
  title: string;
  content: string;
  timestamp: Timestamp;
  isRead: boolean;
  priority?: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
  link?: string;
}

// Message-specific interface
export interface MessageItem extends UnifiedItem {
  type: 'message';
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  conversationId: string;
  attachments?: FileAttachment[];
  canReply?: boolean;
}

// Notification-specific interface
export interface NotificationItem extends UnifiedItem {
  type: 'notification';
  userId: string;
  notificationType: 'message' | 'quote' | 'project' | 'payment' | 'system' | 'meeting';
  category?: string;
  metadata?: Record<string, any>;
}

// File attachment interface
export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

// Unified menu state interface
export interface UnifiedMenuState {
  isOpen: boolean;
  activeTab: 'messages' | 'notifications';
  searchQuery: string;
  filter: 'all' | 'unread' | 'priority' | 'actionRequired';
  sortBy: 'timestamp' | 'priority' | 'sender';
  sortOrder: 'asc' | 'desc';
}

// Quick reply interface
export interface QuickReply {
  conversationId: string;
  content: string;
  attachments?: File[];
}

// Badge counts interface
export interface BadgeCounts {
  totalUnread: number;
  messagesUnread: number;
  notificationsUnread: number;
  priorityCount: number;
  actionRequiredCount: number;
}

// Search filters interface
export interface SearchFilters {
  type?: 'message' | 'notification';
  dateRange?: {
    start: Date;
    end: Date;
  };
  sender?: string;
  priority?: 'low' | 'medium' | 'high';
  isRead?: boolean;
  hasAttachments?: boolean;
  actionRequired?: boolean;
}

// Menu configuration interface
export interface UnifiedMenuConfig {
  maxItemsPerPage: number;
  autoRefreshInterval: number;
  enableRealTimeUpdates: boolean;
  enableNotificationSounds: boolean;
  enableQuickReply: boolean;
  enableSearch: boolean;
  enableFilters: boolean;
  mobileBreakpoint: number;
}

// Action interfaces
export interface MenuAction {
  id: string;
  label: string;
  icon: React.ComponentType;
  onClick: (item: UnifiedItem) => void;
  condition?: (item: UnifiedItem) => boolean;
  variant?: 'default' | 'destructive' | 'secondary';
}

// Context menu actions
export interface ContextMenuActions {
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  starItem: (id: string) => Promise<void>;
  archiveItem: (id: string) => Promise<void>;
  replyToMessage: (messageId: string, content: string) => Promise<void>;
  markAllAsRead: (type?: 'message' | 'notification') => Promise<void>;
}

// Real-time update events
export type UnifiedMenuEvent =
  | { type: 'NEW_MESSAGE'; payload: MessageItem }
  | { type: 'NEW_NOTIFICATION'; payload: NotificationItem }
  | { type: 'ITEM_READ'; payload: { id: string; type: 'message' | 'notification' } }
  | { type: 'ITEM_DELETED'; payload: { id: string; type: 'message' | 'notification' } }
  | { type: 'BADGE_UPDATE'; payload: BadgeCounts };

// Hook return type
export interface UseUnifiedMenuReturn {
  // State
  state: UnifiedMenuState;
  items: UnifiedItem[];
  isLoading: boolean;
  badges: BadgeCounts;
  hasMore: boolean;

  // Actions
  actions: ContextMenuActions;

  // UI Controls
  openMenu: () => void;
  closeMenu: () => void;
  setActiveTab: (tab: 'messages' | 'notifications') => void;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: string) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;

  // Quick actions
  quickReply: (messageId: string, content: string) => Promise<void>;
  quickAction: (itemId: string, action: string) => Promise<void>;
}

// Provider props
export interface UnifiedMenuProviderProps {
  children: React.ReactNode;
  config?: Partial<UnifiedMenuConfig>;
  userId: string;
  isAdmin?: boolean;
}