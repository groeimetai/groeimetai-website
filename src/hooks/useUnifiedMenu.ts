'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  writeBatch,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  UnifiedItem,
  MessageItem,
  NotificationItem,
  UnifiedMenuState,
  BadgeCounts,
  ContextMenuActions,
  UseUnifiedMenuReturn,
  UnifiedMenuConfig,
  SearchFilters,
} from '@/types/unified-menu';
import { notificationService } from '@/services/notificationService';
import { toast } from 'react-hot-toast';

const DEFAULT_CONFIG: UnifiedMenuConfig = {
  maxItemsPerPage: 50,
  autoRefreshInterval: 30000,
  enableRealTimeUpdates: true,
  enableNotificationSounds: true,
  enableQuickReply: true,
  enableSearch: true,
  enableFilters: true,
  mobileBreakpoint: 768,
};

export function useUnifiedMenu(config: Partial<UnifiedMenuConfig> = {}): UseUnifiedMenuReturn {
  const { user, isAdmin } = useAuth();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // State management
  const [state, setState] = useState<UnifiedMenuState>({
    isOpen: false,
    activeTab: 'messages',
    searchQuery: '',
    filter: 'all',
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });

  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [badges, setBadges] = useState<BadgeCounts>({
    totalUnread: 0,
    messagesUnread: 0,
    notificationsUnread: 0,
    priorityCount: 0,
    actionRequiredCount: 0,
  });
  const [hasMore, setHasMore] = useState(false);

  // Transform messages to unified items
  const transformMessage = useCallback((messageData: any): MessageItem => ({
    id: messageData.id,
    type: 'message',
    title: `Message from ${messageData.senderName}`,
    content: messageData.content,
    timestamp: messageData.createdAt,
    isRead: messageData.isRead || false,
    priority: 'medium',
    senderId: messageData.senderId,
    senderName: messageData.senderName,
    senderRole: messageData.senderRole,
    conversationId: messageData.conversationId || messageData.id,
    attachments: messageData.attachments || [],
    canReply: true,
    link: `/dashboard/messages?conversation=${messageData.conversationId || messageData.id}`,
  }), []);

  // Transform notifications to unified items
  const transformNotification = useCallback((notificationData: any): NotificationItem => ({
    id: notificationData.id,
    type: 'notification',
    title: notificationData.title,
    content: notificationData.description,
    timestamp: notificationData.createdAt,
    isRead: notificationData.read || false,
    priority: notificationData.priority || 'low',
    actionRequired: notificationData.actionRequired || false,
    userId: notificationData.userId,
    notificationType: notificationData.type,
    link: notificationData.link,
    metadata: notificationData.metadata || {},
  }), []);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!user) return [];

    try {
      const messagesQuery = isAdmin
        ? query(
            collection(db, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(mergedConfig.maxItemsPerPage)
          )
        : query(
            collection(db, 'messages'),
            where('senderId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(mergedConfig.maxItemsPerPage)
          );

      const snapshot = await getDocs(messagesQuery);
      return snapshot.docs.map(doc => transformMessage({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }, [user, isAdmin, mergedConfig.maxItemsPerPage, transformMessage]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return [];

    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(mergedConfig.maxItemsPerPage)
      );

      const snapshot = await getDocs(notificationsQuery);
      return snapshot.docs.map(doc => transformNotification({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }, [user, mergedConfig.maxItemsPerPage, transformNotification]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!user || !mergedConfig.enableRealTimeUpdates) return;

    const messagesQuery = isAdmin
      ? query(
          collection(db, 'messages'),
          orderBy('createdAt', 'desc'),
          limit(mergedConfig.maxItemsPerPage)
        )
      : query(
          collection(db, 'messages'),
          where('senderId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(mergedConfig.maxItemsPerPage)
        );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageItems = snapshot.docs.map(doc =>
        transformMessage({ id: doc.id, ...doc.data() })
      );

      setItems(prevItems => {
        const notifications = prevItems.filter(item => item.type === 'notification');
        return [...messageItems, ...notifications].sort((a, b) =>
          b.timestamp.toMillis() - a.timestamp.toMillis()
        );
      });
    });

    return () => unsubscribe();
  }, [user, isAdmin, mergedConfig.enableRealTimeUpdates, mergedConfig.maxItemsPerPage, transformMessage]);

  // Real-time subscription for notifications
  useEffect(() => {
    if (!user || !mergedConfig.enableRealTimeUpdates) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(mergedConfig.maxItemsPerPage)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationItems = snapshot.docs.map(doc =>
        transformNotification({ id: doc.id, ...doc.data() })
      );

      setItems(prevItems => {
        const messages = prevItems.filter(item => item.type === 'message');
        return [...messages, ...notificationItems].sort((a, b) =>
          b.timestamp.toMillis() - a.timestamp.toMillis()
        );
      });

      // Play notification sound for new notifications
      if (mergedConfig.enableNotificationSounds && notificationItems.length > 0) {
        const hasNewUnread = notificationItems.some(item => !item.isRead);
        if (hasNewUnread) {
          playNotificationSound();
        }
      }
    });

    return () => unsubscribe();
  }, [user, mergedConfig.enableRealTimeUpdates, mergedConfig.maxItemsPerPage, mergedConfig.enableNotificationSounds, transformNotification]);

  // Calculate badge counts
  useEffect(() => {
    const messages = items.filter(item => item.type === 'message') as MessageItem[];
    const notifications = items.filter(item => item.type === 'notification') as NotificationItem[];

    const messagesUnread = messages.filter(item => !item.isRead).length;
    const notificationsUnread = notifications.filter(item => !item.isRead).length;
    const priorityCount = items.filter(item => item.priority === 'high' && !item.isRead).length;
    const actionRequiredCount = items.filter(item => item.actionRequired && !item.isRead).length;

    setBadges({
      totalUnread: messagesUnread + notificationsUnread,
      messagesUnread,
      notificationsUnread,
      priorityCount,
      actionRequiredCount,
    });
  }, [items]);

  // Load initial data
  useEffect(() => {
    if (!user) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [messageItems, notificationItems] = await Promise.all([
          loadMessages(),
          loadNotifications(),
        ]);

        const allItems = [...messageItems, ...notificationItems].sort((a, b) =>
          b.timestamp.toMillis() - a.timestamp.toMillis()
        );

        setItems(allItems);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load messages and notifications');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user, loadMessages, loadNotifications]);

  // Notification sound function
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Could not play notification sound:', err));
    } catch (error) {
      console.log('Notification sound not available');
    }
  }, []);

  // Context menu actions
  const actions: ContextMenuActions = useMemo(() => ({
    markAsRead: async (id: string) => {
      try {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const collectionName = item.type === 'message' ? 'messages' : 'notifications';
        await updateDoc(doc(db, collectionName, id), {
          [item.type === 'message' ? 'isRead' : 'read']: true,
          readAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error marking as read:', error);
        toast.error('Failed to mark as read');
      }
    },

    markAsUnread: async (id: string) => {
      try {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const collectionName = item.type === 'message' ? 'messages' : 'notifications';
        await updateDoc(doc(db, collectionName, id), {
          [item.type === 'message' ? 'isRead' : 'read']: false,
        });
      } catch (error) {
        console.error('Error marking as unread:', error);
        toast.error('Failed to mark as unread');
      }
    },

    deleteItem: async (id: string) => {
      try {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const collectionName = item.type === 'message' ? 'messages' : 'notifications';
        await deleteDoc(doc(db, collectionName, id));
        toast.success(`${item.type === 'message' ? 'Message' : 'Notification'} deleted`);
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete');
      }
    },

    starItem: async (id: string) => {
      try {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const collectionName = item.type === 'message' ? 'messages' : 'notifications';
        await updateDoc(doc(db, collectionName, id), {
          isStarred: true,
        });
      } catch (error) {
        console.error('Error starring item:', error);
        toast.error('Failed to star');
      }
    },

    archiveItem: async (id: string) => {
      try {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const collectionName = item.type === 'message' ? 'messages' : 'notifications';
        await updateDoc(doc(db, collectionName, id), {
          isArchived: true,
        });
      } catch (error) {
        console.error('Error archiving item:', error);
        toast.error('Failed to archive');
      }
    },

    replyToMessage: async (messageId: string, content: string) => {
      try {
        const messageItem = items.find(i => i.id === messageId && i.type === 'message') as MessageItem;
        if (!messageItem || !user) return;

        await addDoc(collection(db, 'messages'), {
          senderId: user.uid,
          senderName: user.displayName || user.email,
          senderRole: isAdmin ? 'admin' : 'user',
          content,
          conversationId: messageItem.conversationId,
          createdAt: serverTimestamp(),
          isRead: false,
        });

        toast.success('Reply sent');
      } catch (error) {
        console.error('Error replying to message:', error);
        toast.error('Failed to send reply');
      }
    },

    markAllAsRead: async (type?: 'message' | 'notification') => {
      try {
        const batch = writeBatch(db);
        let itemsToUpdate = items.filter(item => !item.isRead);

        if (type) {
          itemsToUpdate = itemsToUpdate.filter(item => item.type === type);
        }

        itemsToUpdate.forEach(item => {
          const collectionName = item.type === 'message' ? 'messages' : 'notifications';
          const readField = item.type === 'message' ? 'isRead' : 'read';
          batch.update(doc(db, collectionName, item.id), {
            [readField]: true,
            readAt: serverTimestamp(),
          });
        });

        await batch.commit();
        toast.success('All items marked as read');
      } catch (error) {
        console.error('Error marking all as read:', error);
        toast.error('Failed to mark all as read');
      }
    },
  }), [items, user, isAdmin]);

  // UI Controls
  const openMenu = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const closeMenu = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const setActiveTab = useCallback((tab: 'messages' | 'notifications') => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setFilter = useCallback((filter: string) => {
    setState(prev => ({ ...prev, filter: filter as any }));
  }, []);

  const loadMore = useCallback(async () => {
    // Implementation for pagination
    setHasMore(false);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;

    try {
      const [messageItems, notificationItems] = await Promise.all([
        loadMessages(),
        loadNotifications(),
      ]);

      const allItems = [...messageItems, ...notificationItems].sort((a, b) =>
        b.timestamp.toMillis() - a.timestamp.toMillis()
      );

      setItems(allItems);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh');
    }
  }, [user, loadMessages, loadNotifications]);

  const quickReply = useCallback(async (messageId: string, content: string) => {
    await actions.replyToMessage(messageId, content);
  }, [actions]);

  const quickAction = useCallback(async (itemId: string, action: string) => {
    switch (action) {
      case 'markRead':
        await actions.markAsRead(itemId);
        break;
      case 'markUnread':
        await actions.markAsUnread(itemId);
        break;
      case 'delete':
        await actions.deleteItem(itemId);
        break;
      case 'star':
        await actions.starItem(itemId);
        break;
      case 'archive':
        await actions.archiveItem(itemId);
        break;
      default:
        console.warn('Unknown quick action:', action);
    }
  }, [actions]);

  return {
    state,
    items,
    isLoading,
    badges,
    hasMore,
    actions,
    openMenu,
    closeMenu,
    setActiveTab,
    setSearchQuery,
    setFilter,
    loadMore,
    refresh,
    quickReply,
    quickAction,
  };
}