'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  MessageSquare,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  Info,
  Clock,
  Settings,
  Filter,
  Archive,
  Trash2,
  BellOff
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

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

interface NotificationPreferences {
  email: {
    messages: boolean;
    quotes: boolean;
    projects: boolean;
    payments: boolean;
    system: boolean;
  };
  push: {
    enabled: boolean;
    messages: boolean;
    quotes: boolean;
    projects: boolean;
  };
}

// Notification sound function
const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Could not play notification sound:', err));
  } catch (error) {
    console.log('Notification sound not available');
  }
};

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionRequired'>('all');
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      messages: true,
      quotes: true,
      projects: true,
      payments: true,
      system: true,
    },
    push: {
      enabled: false,
      messages: true,
      quotes: true,
      projects: true,
    }
  });

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
        // Play sound for new notification
        playNotificationSound();
        
        // Show browser notification if permissions granted
        if ('Notification' in window && Notification.permission === 'granted') {
          const newNotification = notificationData[0]; // Most recent
          new Notification(newNotification.title, {
            body: newNotification.description,
            icon: '/icon-192x192.png',
            tag: newNotification.id,
            requireInteraction: newNotification.actionRequired || false
          });
        }
        
        // Show toast notification
        const newNotification = notificationData[0];
        const toastMessage = `${newNotification.title}: ${newNotification.description}`;
        
        if (newNotification.priority === 'high') {
          toast.error(toastMessage, {
            duration: 5000,
            icon: '🔴'
          });
        } else if (newNotification.type === 'message') {
          toast.success(toastMessage, {
            duration: 4000,
            icon: '💬'
          });
        } else {
          toast(toastMessage, {
            duration: 4000,
            icon: '🔔'
          });
        }
      }
      
      setPreviousNotificationCount(notificationData.length);
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user, previousNotificationCount]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications
      .filter(n => !n.read)
      .forEach(notification => {
        batch.update(doc(db, 'notifications', notification.id), {
          read: true,
          readAt: new Date()
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

  // Archive old notifications
  const archiveOldNotifications = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldNotifications = notifications.filter(
      n => n.createdAt.toDate() < thirtyDaysAgo && n.read
    );
    
    const batch = writeBatch(db);
    oldNotifications.forEach(notification => {
      batch.delete(doc(db, 'notifications', notification.id));
    });
    
    try {
      await batch.commit();
    } catch (error) {
      console.error('Error archiving notifications:', error);
    }
  };

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
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'actionRequired') return notification.actionRequired;
    return true;
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-black/95 border-white/20">
        <SheetHeader className="pb-4 border-b border-white/10">
          <SheetTitle className="text-white flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')}>
                    Unread Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('actionRequired')}>
                    Action Required
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
            </div>
          </SheetTitle>
          <SheetDescription className="text-white/60">
            You have {unreadCount} unread notifications
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="notifications" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-4">
            <ScrollArea className="h-[calc(100vh-280px)]">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <BellOff className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-4 rounded-lg border transition-all cursor-pointer ${
                            notification.read
                              ? 'bg-white/5 border-white/10'
                              : 'bg-orange/10 border-orange/30'
                          }`}
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification.id);
                            }
                            if (notification.link) {
                              window.location.href = notification.link;
                              setIsOpen(false);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-white/5`}>
                              <Icon className={`w-4 h-4 ${getNotificationColor(notification.type)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-white font-medium text-sm">
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {notification.priority === 'high' && (
                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                  )}
                                  {notification.actionRequired && (
                                    <Badge variant="outline" className="text-xs bg-orange/20 border-orange">
                                      Action
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-white/60 text-sm mt-1">
                                {notification.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-white/40 text-xs">
                                  {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-6">
            <div>
              <h3 className="text-white font-medium mb-4">Email Notifications</h3>
              <div className="space-y-3">
                {Object.entries(preferences.email).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`email-${key}`} className="text-white/80 capitalize">
                      {key} updates
                    </Label>
                    <Switch
                      id={`email-${key}`}
                      checked={value}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({
                          ...prev,
                          email: { ...prev.email, [key]: checked }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Push Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-enabled" className="text-white/80">
                    Enable push notifications
                  </Label>
                  <Switch
                    id="push-enabled"
                    checked={preferences.push.enabled}
                    onCheckedChange={async (checked) => {
                      if (checked && 'Notification' in window) {
                        // Request permission if not granted
                        if (Notification.permission === 'default') {
                          const permission = await Notification.requestPermission();
                          if (permission !== 'granted') {
                            return; // Don't enable if permission denied
                          }
                        } else if (Notification.permission === 'denied') {
                          alert('Please enable notifications in your browser settings');
                          return;
                        }
                      }
                      setPreferences(prev => ({
                        ...prev,
                        push: { ...prev.push, enabled: checked }
                      }))
                    }}
                  />
                </div>
                {preferences.push.enabled && (
                  <>
                    {Object.entries(preferences.push)
                      .filter(([key]) => key !== 'enabled')
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between pl-4">
                          <Label htmlFor={`push-${key}`} className="text-white/60 capitalize">
                            {key}
                          </Label>
                          <Switch
                            id={`push-${key}`}
                            checked={value}
                            onCheckedChange={(checked) =>
                              setPreferences(prev => ({
                                ...prev,
                                push: { ...prev.push, [key]: checked }
                              }))
                            }
                          />
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button
                variant="outline"
                className="w-full"
                onClick={archiveOldNotifications}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive old notifications
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6 pt-4 border-t border-white/10">
          <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}