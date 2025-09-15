'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  MessageSquare,
  Inbox,
  Settings,
  X,
  Check,
  CheckCheck,
  Star,
  Archive,
  Trash2,
  Filter,
  ChevronDown,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Info,
  BellOff,
  Mail,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from '@/i18n/routing';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// Types
export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'quote' | 'project' | 'payment' | 'system' | 'meeting';
  title: string;
  description: string;
  read: boolean;
  createdAt: Timestamp;
  link?: string;
  priority?: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
}

interface MessagePreview {
  id: string;
  conversationId: string;
  conversationName: string;
  conversationType: 'support' | 'project';
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  unreadCount: number;
  isStarred?: boolean;
}

interface UnifiedCommunicationCenterProps {
  className?: string;
  showBadge?: boolean;
}

// Notification sound function
const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.5;
    audio.play().catch((err) => console.log('Could not play notification sound:', err));
  } catch (error) {
    console.log('Notification sound not available');
  }
};

export default function UnifiedCommunicationCenter({
  className,
  showBadge = true
}: UnifiedCommunicationCenterProps) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messagePreviews, setMessagePreviews] = useState<MessagePreview[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionRequired'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'notifications' | 'messages'>('all');
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);

  // Listen for command palette events
  useEffect(() => {
    const handleOpenCommunications = () => {
      setIsOpen(true);
    };

    window.addEventListener('openCommunications', handleOpenCommunications);
    return () => window.removeEventListener('openCommunications', handleOpenCommunications);
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    if (!user) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationData: Notification[] = [];
      snapshot.forEach((doc) => {
        notificationData.push({ id: doc.id, ...doc.data() } as Notification);
      });

      // Check for new notifications
      if (notificationData.length > previousNotificationCount && previousNotificationCount > 0) {
        playNotificationSound();

        // Show browser notification if permissions granted
        if ('Notification' in window && Notification.permission === 'granted') {
          const newNotification = notificationData[0];
          new Notification(newNotification.title, {
            body: newNotification.description,
            icon: '/icon-192x192.png',
            tag: newNotification.id,
            requireInteraction: newNotification.actionRequired || false,
          });
        }

        // Show toast notification
        const newNotification = notificationData[0];
        const toastMessage = `${newNotification.title}: ${newNotification.description}`;

        if (newNotification.priority === 'high') {
          toast.error(toastMessage, {
            duration: 5000,
            icon: '🔴',
          });
        } else if (newNotification.type === 'message') {
          toast.success(toastMessage, {
            duration: 4000,
            icon: '💬',
          });
        } else {
          toast(toastMessage, {
            duration: 4000,
            icon: '🔔',
          });
        }
      }

      setPreviousNotificationCount(notificationData.length);
      setNotifications(notificationData);
      setUnreadNotificationCount(notificationData.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [user, previousNotificationCount]);

  // Subscribe to message previews
  useEffect(() => {
    if (!user) return;

    const loadMessagePreviews = async () => {
      try {
        const previews: MessagePreview[] = [];

        if (isAdmin) {
          // Admin: Load all support chats
          const supportChatsSnapshot = await getDocs(
            query(collection(db, 'supportChats'), orderBy('lastMessageAt', 'desc'))
          );

          supportChatsSnapshot.forEach((doc) => {
            const data = doc.data();
            previews.push({
              id: doc.id,
              conversationId: doc.id,
              conversationName: data.userName || 'Unknown User',
              conversationType: 'support',
              lastMessage: data.lastMessage || '',
              lastMessageAt: data.lastMessageAt,
              unreadCount: 0, // Will be calculated from notifications
              isStarred: data.isStarred || false,
            });
          });
        } else {
          // User: Load their support chat
          const supportChatId = `support_${user.uid}`;
          const supportRef = doc(db, 'supportChats', supportChatId);
          // Add support chat preview logic here
        }

        // Calculate unread counts from notifications
        const unreadMessageNotifications = notifications.filter(
          (n) => n.type === 'message' && !n.read
        );

        previews.forEach((preview) => {
          const relatedUnread = unreadMessageNotifications.filter((n) =>
            n.title?.includes(preview.conversationName) ||
            n.description?.includes(preview.conversationName)
          ).length;
          preview.unreadCount = relatedUnread;
        });

        setMessagePreviews(previews);
        setUnreadMessageCount(previews.reduce((sum, p) => sum + p.unreadCount, 0));
      } catch (error) {
        console.error('Error loading message previews:', error);
      }
    };

    loadMessagePreviews();
  }, [user, isAdmin, notifications]);

  // Calculate total unread count
  const totalUnreadCount = unreadNotificationCount + unreadMessageCount;

  // Get icon for notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'quote':
        return FileText;
      case 'project':
        return FileText;
      case 'payment':
        return DollarSign;
      case 'meeting':
        return Calendar;
      case 'system':
      default:
        return Info;
    }
  };

  // Get color for notification type
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'text-blue-500';
      case 'quote':
        return 'text-yellow-500';
      case 'project':
        return 'text-green-500';
      case 'payment':
        return 'text-purple-500';
      case 'meeting':
        return 'text-orange';
      case 'system':
      default:
        return 'text-gray-500';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'actionRequired') return notification.actionRequired;
    return true;
  });

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications
      .filter((n) => !n.read)
      .forEach((notification) => {
        batch.update(doc(db, 'notifications', notification.id), {
          read: true,
          readAt: new Date(),
        });
      });

    try {
      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Navigate to messages
  const goToMessages = () => {
    router.push('/dashboard/messages');
    setIsOpen(false);
  };

  // Navigate to specific conversation
  const goToConversation = (conversationId: string) => {
    router.push(`/dashboard/messages?conversation=${conversationId}`);
    setIsOpen(false);
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  };

  // Get initials for avatars
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative h-9 w-9 sm:h-10 sm:w-10", className)}
          aria-label="Open communication center"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {showBadge && totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-5 sm:h-5 bg-orange text-white text-xs rounded-full flex items-center justify-center">
              <span className="hidden sm:block">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-96 p-0 bg-black/95 border-white/20 z-[100]"
        align="end"
        sideOffset={5}
        role="dialog"
        aria-label="Communication center"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-white">Communications</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={markAllAsRead}
                disabled={totalUnreadCount === 0}
                className="h-8 w-8"
                aria-label="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Items
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')}>
                    Unread Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('actionRequired')}>
                    Action Required
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-sm text-white/60">
            {totalUnreadCount > 0
              ? `You have ${totalUnreadCount} unread item${totalUnreadCount === 1 ? '' : 's'}`
              : 'All caught up!'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-3 bg-white/5">
              <TabsTrigger value="all" className="text-xs">
                All ({totalUnreadCount})
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs">
                Alerts ({unreadNotificationCount})
              </TabsTrigger>
              <TabsTrigger value="messages" className="text-xs">
                Messages ({unreadMessageCount})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[400px]">
            <TabsContent value="all" className="mt-0">
              <div className="p-2 space-y-1">
                {/* Combined view showing both notifications and messages */}
                {filteredNotifications.length === 0 && messagePreviews.length === 0 ? (
                  <div className="text-center py-8">
                    <BellOff className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">No items found</p>
                  </div>
                ) : (
                  <>
                    {/* Recent messages */}
                    {messagePreviews.slice(0, 3).map((message) => (
                      <div
                        key={message.id}
                        onClick={() => goToConversation(message.conversationId)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-blue-500 mt-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white truncate">
                              {message.conversationName}
                            </p>
                            {message.unreadCount > 0 && (
                              <Badge className="bg-orange text-white text-xs">
                                {message.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-white/60 truncate mt-1">
                            {message.lastMessage}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {formatDistanceToNow(message.lastMessageAt?.toDate() || new Date(), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Recent notifications */}
                    {filteredNotifications.slice(0, 5).map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            notification.read
                              ? "hover:bg-white/5"
                              : "bg-orange/10 hover:bg-orange/15"
                          )}
                        >
                          <div className="flex-shrink-0">
                            <Icon className={cn("w-4 h-4 mt-1", getNotificationColor(notification.type))} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-white truncate">
                                {notification.title}
                              </p>
                              <div className="flex items-center gap-1">
                                {notification.priority === 'high' && (
                                  <AlertCircle className="w-3 h-3 text-red-500" />
                                )}
                                {notification.actionRequired && (
                                  <Badge variant="outline" className="text-xs">
                                    Action
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-white/60 truncate mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                              {formatDistanceToNow(notification.createdAt.toDate(), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <div className="p-2 space-y-1">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">No notifications</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors group",
                          notification.read
                            ? "hover:bg-white/5"
                            : "bg-orange/10 hover:bg-orange/15"
                        )}
                      >
                        <div className="flex-shrink-0">
                          <Icon className={cn("w-4 h-4 mt-1", getNotificationColor(notification.type))} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-1">
                              {notification.priority === 'high' && (
                                <AlertCircle className="w-3 h-3 text-red-500" />
                              )}
                              {notification.actionRequired && (
                                <Badge variant="outline" className="text-xs">
                                  Action
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-white/60 truncate mt-1">
                            {notification.description}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {formatDistanceToNow(notification.createdAt.toDate(), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <div className="p-2 space-y-1">
                {messagePreviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">No messages</p>
                  </div>
                ) : (
                  messagePreviews.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => goToConversation(message.conversationId)}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={cn(
                            "text-xs",
                            message.conversationType === 'support'
                              ? 'bg-green/20 text-green'
                              : 'bg-orange/20 text-orange'
                          )}
                        >
                          {getInitials(message.conversationName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate">
                            {message.conversationName}
                          </p>
                          <div className="flex items-center gap-1">
                            {message.unreadCount > 0 && (
                              <Badge className="bg-orange text-white text-xs">
                                {message.unreadCount}
                              </Badge>
                            )}
                            {message.isStarred && (
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-white/60 truncate mt-1">
                          {message.lastMessage}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          {formatDistanceToNow(message.lastMessageAt?.toDate() || new Date(), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="border-t border-white/10 p-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={goToMessages}
            >
              <Mail className="w-4 h-4 mr-2" />
              View All Messages
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notification Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Email Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Push Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Sound Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}