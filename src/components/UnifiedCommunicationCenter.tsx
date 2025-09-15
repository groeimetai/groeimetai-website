'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  MessageSquare,
  X,
  Check,
  CheckCheck,
  Send,
  Search,
  Filter,
  Archive,
  Star,
  MoreVertical,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  AlertCircle,
  Info,
  BellOff,
  Inbox,
  Reply,
  Trash2,
  Settings,
  Loader2,
  UserCircle2,
  ArrowRight,
  FileDown,
  Package,
  MessageCircle,
  Zap,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
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
  getDoc,
  addDoc,
  setDoc,
  writeBatch,
  Timestamp,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import toast from 'react-hot-toast';
import { uploadFile, formatFileSize, FileAttachment } from '@/utils/fileUpload';

// Types and Interfaces
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

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  content: string;
  createdAt: Timestamp | null;
  isRead?: boolean;
  attachments?: FileAttachment[];
}

interface ChatChannel {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  projectId?: string;
  projectName?: string;
  type: 'support' | 'project';
  lastMessage?: string;
  lastMessageAt: Timestamp | null;
  unreadCount?: number;
  isStarred?: boolean;
  isArchived?: boolean;
}

interface CommunicationPreferences {
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
  messageSettings: {
    quickReply: boolean;
    threading: boolean;
    soundNotifications: boolean;
    showPreviews: boolean;
  };
}

interface UnifiedCommunicationState {
  notifications: Notification[];
  conversations: ChatChannel[];
  messages: Message[];
  selectedConversation: ChatChannel | null;
  unreadNotificationCount: number;
  unreadMessageCount: number;
  totalUnreadCount: number;
  searchQuery: string;
  filter: 'all' | 'unread' | 'starred' | 'archived' | 'actionRequired';
  activeTab: 'messages' | 'notifications' | 'settings';
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

export default function UnifiedCommunicationCenter() {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Communication state
  const [state, setState] = useState<UnifiedCommunicationState>({
    notifications: [],
    conversations: [],
    messages: [],
    selectedConversation: null,
    unreadNotificationCount: 0,
    unreadMessageCount: 0,
    totalUnreadCount: 0,
    searchQuery: '',
    filter: 'all',
    activeTab: 'messages',
  });

  // Preferences state
  const [preferences, setPreferences] = useState<CommunicationPreferences>({
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
    },
    messageSettings: {
      quickReply: true,
      threading: true,
      soundNotifications: true,
      showPreviews: true,
    },
  });

  // Load conversations and notifications
  useEffect(() => {
    if (!user) return;

    let notificationUnsubscribe: (() => void) | undefined;
    let messageUnsubscribe: (() => void) | undefined;

    const loadData = async () => {
      try {
        // Load notifications
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        notificationUnsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
          const notificationData: Notification[] = [];
          snapshot.forEach((doc) => {
            notificationData.push({ id: doc.id, ...doc.data() } as Notification);
          });

          const unreadNotifications = notificationData.filter((n) => !n.read).length;

          setState((prev) => ({
            ...prev,
            notifications: notificationData,
            unreadNotificationCount: unreadNotifications,
            totalUnreadCount: unreadNotifications + prev.unreadMessageCount,
          }));

          // Play notification sound for new notifications
          if (preferences.messageSettings.soundNotifications && notificationData.length > 0) {
            playNotificationSound();
          }
        });

        // Load conversations
        const conversationData: ChatChannel[] = [];

        if (isAdmin) {
          // Admin: Load all support chats and project chats
          const supportChatsSnapshot = await getDocs(
            query(collection(db, 'supportChats'), orderBy('lastMessageAt', 'desc'))
          );

          supportChatsSnapshot.forEach((doc) => {
            const data = doc.data();
            conversationData.push({
              id: doc.id,
              userId: data.userId,
              userName: data.userName || 'Unknown User',
              userEmail: data.userEmail,
              type: 'support',
              lastMessage: data.lastMessage,
              lastMessageAt: data.lastMessageAt,
              unreadCount: 0,
              isStarred: data.isStarred || false,
              isArchived: data.isArchived || false,
            });
          });

          // Load project chats
          const projectsSnapshot = await getDocs(collection(db, 'projects'));
          for (const projectDoc of projectsSnapshot.docs) {
            const projectData = projectDoc.data();
            const chatId = `project_${projectDoc.id}`;
            const chatRef = doc(db, 'projectChats', chatId);
            const chatDoc = await getDoc(chatRef);

            if (chatDoc.exists()) {
              const chatData = chatDoc.data();
              conversationData.push({
                id: chatId,
                projectId: projectDoc.id,
                projectName: projectData.name,
                userName: projectData.clientName || 'Project Chat',
                type: 'project',
                lastMessage: chatData.lastMessage,
                lastMessageAt: chatData.lastMessageAt,
                unreadCount: 0,
                isStarred: chatData.isStarred || false,
                isArchived: chatData.isArchived || false,
              });
            }
          }
        } else {
          // User: Load their support chat and project chats
          const supportChatId = `support_${user.uid}`;
          const supportRef = doc(db, 'supportChats', supportChatId);
          const supportDoc = await getDoc(supportRef);

          if (supportDoc.exists()) {
            const data = supportDoc.data();
            conversationData.push({
              id: supportChatId,
              userName: 'GroeimetAI Support',
              type: 'support',
              lastMessage: data.lastMessage,
              lastMessageAt: data.lastMessageAt,
              unreadCount: 0,
              isStarred: data.isStarred || false,
              isArchived: data.isArchived || false,
            });
          } else {
            // Create default support chat entry
            conversationData.push({
              id: supportChatId,
              userName: 'GroeimetAI Support',
              type: 'support',
              lastMessage: 'Start a conversation with our support team',
              lastMessageAt: null,
              unreadCount: 0,
              isStarred: false,
              isArchived: false,
            });
          }

          // Load user's project chats
          const userProjectsSnapshot = await getDocs(
            query(collection(db, 'projects'), where('clientId', '==', user.uid))
          );

          for (const projectDoc of userProjectsSnapshot.docs) {
            const projectData = projectDoc.data();
            const chatId = `project_${projectDoc.id}`;
            const chatRef = doc(db, 'projectChats', chatId);
            const chatDoc = await getDoc(chatRef);

            if (chatDoc.exists()) {
              const chatData = chatDoc.data();
              conversationData.push({
                id: chatId,
                projectId: projectDoc.id,
                projectName: projectData.name,
                userName: `${projectData.name} Team`,
                type: 'project',
                lastMessage: chatData.lastMessage,
                lastMessageAt: chatData.lastMessageAt,
                unreadCount: 0,
                isStarred: chatData.isStarred || false,
                isArchived: chatData.isArchived || false,
              });
            }
          }
        }

        // Calculate unread message counts
        const unreadMessageNotifications = await getDocs(
          query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('type', '==', 'message'),
            where('read', '==', false)
          )
        );

        const unreadMessages = unreadMessageNotifications.size;

        setState((prev) => ({
          ...prev,
          conversations: conversationData,
          unreadMessageCount: unreadMessages,
          totalUnreadCount: prev.unreadNotificationCount + unreadMessages,
        }));

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading communication data:', error);
        toast.error('Failed to load messages and notifications');
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (notificationUnsubscribe) notificationUnsubscribe();
      if (messageUnsubscribe) messageUnsubscribe();
    };
  }, [user, isAdmin, preferences.messageSettings.soundNotifications]);

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!state.selectedConversation || !user) return;

    const collectionName =
      state.selectedConversation.type === 'support' ? 'supportChats' : 'projectChats';
    const messagesRef = collection(db, collectionName, state.selectedConversation.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages: Message[] = [];
        snapshot.forEach((doc) => {
          newMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        setState((prev) => ({ ...prev, messages: newMessages }));
      },
      (error) => {
        console.error('Error loading messages:', error);
      }
    );

    return () => unsubscribe();
  }, [state.selectedConversation, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && state.messages.length > 0) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [state.messages]);

  // Utility functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return 'Yesterday ' + format(date, 'h:mm a');
      }
      return format(date, 'MMM d, h:mm a');
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'quote':
        return FileText;
      case 'project':
        return Package;
      case 'payment':
        return DollarSign;
      case 'meeting':
        return Calendar;
      case 'system':
      default:
        return Info;
    }
  };

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

  // Action handlers
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const batch = writeBatch(db);
    state.notifications
      .filter((n) => !n.read)
      .forEach((notification) => {
        batch.update(doc(db, 'notifications', notification.id), {
          read: true,
          readAt: new Date(),
        });
      });

    try {
      await batch.commit();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const selectConversation = (conversation: ChatChannel) => {
    setState((prev) => ({ ...prev, selectedConversation: conversation }));

    // Mark related message notifications as read
    markConversationNotificationsAsRead(conversation);
  };

  const markConversationNotificationsAsRead = async (conversation: ChatChannel) => {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user!.uid),
        where('type', '==', 'message'),
        where('read', '==', false)
      );

      const snapshot = await getDocs(notificationsQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        const notification = doc.data();
        if (
          (conversation.type === 'support' && notification.title?.includes('Support')) ||
          (conversation.userName && notification.title?.includes(conversation.userName)) ||
          (conversation.projectName && notification.description?.includes(conversation.projectName))
        ) {
          batch.update(doc.ref, { read: true, readAt: serverTimestamp() });
        }
      });

      if (snapshot.docs.length > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error('Error marking conversation notifications as read:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !state.selectedConversation || !user) {
      return;
    }

    setIsSending(true);

    try {
      const collectionName =
        state.selectedConversation.type === 'support' ? 'supportChats' : 'projectChats';

      // Ensure chat document exists
      const chatRef = doc(db, collectionName, state.selectedConversation.id);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          userId: state.selectedConversation.userId || user.uid,
          userName: state.selectedConversation.userName,
          projectId: state.selectedConversation.projectId,
          projectName: state.selectedConversation.projectName,
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          status: 'active',
        });
      }

      // Upload files if any
      let attachments: FileAttachment[] = [];
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map((file) =>
          uploadFile(
            file,
            user.uid,
            user.displayName || user.email || 'Unknown User',
            user.email || '',
            state.selectedConversation?.projectId
          )
        );
        attachments = await Promise.all(uploadPromises);
      }

      // Add message
      const messagesRef = collection(db, collectionName, state.selectedConversation.id, 'messages');
      const messageData: any = {
        senderId: user.uid,
        senderName: isAdmin ? 'GroeimetAI Support' : user.displayName || user.email,
        senderRole: isAdmin ? 'admin' : 'user',
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
      };

      if (attachments.length > 0) {
        messageData.attachments = attachments;
      }

      await addDoc(messagesRef, messageData);

      // Create notification for recipient
      const notificationData = {
        type: 'message' as const,
        title: isAdmin
          ? 'New message from Support'
          : `New message from ${user.displayName || user.email}`,
        description:
          newMessage.trim().substring(0, 100) + (newMessage.trim().length > 100 ? '...' : ''),
        read: false,
        createdAt: serverTimestamp(),
        link: isAdmin ? '/dashboard' : '/dashboard/admin',
        priority: 'medium' as const,
        actionRequired: false,
      };

      if (isAdmin && state.selectedConversation.userId) {
        await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          userId: state.selectedConversation.userId,
        });
      } else if (!isAdmin) {
        const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
        const adminsSnapshot = await getDocs(adminsQuery);

        const notificationPromises = adminsSnapshot.docs.map((adminDoc) =>
          addDoc(collection(db, 'notifications'), {
            ...notificationData,
            userId: adminDoc.id,
          })
        );

        await Promise.all(notificationPromises);
      }

      // Update last message
      await setDoc(
        chatRef,
        {
          lastMessageAt: serverTimestamp(),
          lastMessage: newMessage.trim(),
          lastMessageBy: user.uid,
        },
        { merge: true }
      );

      setNewMessage('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Quick reply function
  const sendQuickReply = async (replyText: string) => {
    if (!state.selectedConversation || !user) return;

    const originalMessage = newMessage;
    setNewMessage(replyText);
    await sendMessage();
    setNewMessage(originalMessage);
  };

  // Export functions
  const exportConversation = (conversation: ChatChannel) => {
    const data = {
      conversation,
      messages: state.messages,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversation.userName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Conversation exported');
  };

  const exportNotifications = () => {
    const data = {
      notifications: state.notifications,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Notifications exported');
  };

  // Filter functions
  const filteredNotifications = useMemo(() => {
    let filtered = state.notifications;

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(query) ||
          notification.description.toLowerCase().includes(query)
      );
    }

    switch (state.filter) {
      case 'unread':
        return filtered.filter((n) => !n.read);
      case 'actionRequired':
        return filtered.filter((n) => n.actionRequired);
      default:
        return filtered;
    }
  }, [state.notifications, state.searchQuery, state.filter]);

  const filteredConversations = useMemo(() => {
    let filtered = state.conversations;

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.userName.toLowerCase().includes(query) ||
          conv.projectName?.toLowerCase().includes(query) ||
          conv.lastMessage?.toLowerCase().includes(query)
      );
    }

    switch (state.filter) {
      case 'unread':
        return filtered.filter((conv) => (conv.unreadCount || 0) > 0);
      case 'starred':
        return filtered.filter((conv) => conv.isStarred);
      case 'archived':
        return filtered.filter((conv) => conv.isArchived);
      default:
        return filtered.filter((conv) => !conv.isArchived);
    }
  }, [state.conversations, state.searchQuery, state.filter]);

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="relative" disabled>
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageCircle className="w-5 h-5" />
          {state.totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange text-white text-xs rounded-full flex items-center justify-center">
              {state.totalUnreadCount > 9 ? '9+' : state.totalUnreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-2xl bg-black/95 border-white/20 flex flex-col h-full">
        <SheetHeader className="pb-4 border-b border-white/10">
          <SheetTitle className="text-white flex items-center justify-between">
            <span>Messages & Notifications</span>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={state.searchQuery}
                  onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 w-48 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-8"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setState((prev) => ({ ...prev, filter: 'all' }))}>
                    All Items
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setState((prev) => ({ ...prev, filter: 'unread' }))}>
                    Unread Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setState((prev) => ({ ...prev, filter: 'starred' }))}>
                    Starred
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setState((prev) => ({ ...prev, filter: 'actionRequired' }))}>
                    Action Required
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetTitle>
          <SheetDescription className="text-white/60">
            {state.totalUnreadCount > 0
              ? `${state.unreadMessageCount} unread messages, ${state.unreadNotificationCount} unread notifications`
              : 'All caught up!'
            }
          </SheetDescription>
        </SheetHeader>

        <Tabs
          value={state.activeTab}
          onValueChange={(tab) => setState((prev) => ({ ...prev, activeTab: tab as any }))}
          className="flex-1 flex flex-col mt-4"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="messages" className="relative">
              Messages
              {state.unreadMessageCount > 0 && (
                <Badge className="ml-2 bg-orange text-white px-1.5 py-0 text-xs">
                  {state.unreadMessageCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {state.unreadNotificationCount > 0 && (
                <Badge className="ml-2 bg-orange text-white px-1.5 py-0 text-xs">
                  {state.unreadNotificationCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages" className="flex-1 flex flex-col mt-4">
            <div className="flex flex-1 gap-4">
              {/* Conversations List */}
              <div className="w-80 bg-white/5 rounded-lg border border-white/10 flex flex-col">
                <div className="p-3 border-b border-white/10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-medium">Conversations</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportConversation(state.selectedConversation!)}>
                          <FileDown className="w-4 h-4 mr-2" />
                          Export Selected
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <Inbox className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No conversations found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {filteredConversations.map((conversation) => (
                        <motion.div
                          key={conversation.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-3 cursor-pointer hover:bg-white/5 transition-colors ${
                            state.selectedConversation?.id === conversation.id ? 'bg-white/10' : ''
                          }`}
                          onClick={() => selectConversation(conversation)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback
                                  className={`${
                                    conversation.type === 'support'
                                      ? 'bg-green/20 text-green'
                                      : 'bg-orange/20 text-orange'
                                  }`}
                                >
                                  {getInitials(conversation.userName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-white text-sm truncate">
                                    {conversation.userName}
                                  </h4>
                                  {(conversation.unreadCount || 0) > 0 && (
                                    <Badge className="bg-orange text-white px-1.5 py-0 text-xs">
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                  {conversation.isStarred && (
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  )}
                                </div>
                                {conversation.projectName && (
                                  <p className="text-xs text-white/60">{conversation.projectName}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-xs text-white/60 line-clamp-1 mb-1">
                              {conversation.lastMessage}
                            </p>
                          )}
                          <span className="text-xs text-white/40">
                            {formatMessageTime(conversation.lastMessageAt)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Message Thread */}
              {state.selectedConversation ? (
                <div className="flex-1 bg-white/5 rounded-lg border border-white/10 flex flex-col">
                  {/* Message Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback
                          className={`${
                            state.selectedConversation.type === 'support'
                              ? 'bg-green/20 text-green'
                              : 'bg-orange/20 text-orange'
                          }`}
                        >
                          {getInitials(state.selectedConversation.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-white">{state.selectedConversation.userName}</h3>
                        {state.selectedConversation.projectName && (
                          <p className="text-sm text-white/60">{state.selectedConversation.projectName}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportConversation(state.selectedConversation!)}>
                          <FileDown className="w-4 h-4 mr-2" />
                          Export Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Messages */}
                  <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                    <div className="space-y-4">
                      {state.messages.length === 0 && (
                        <div className="text-center text-white/40 py-8">
                          <p className="text-sm">No messages yet</p>
                          <p className="text-xs mt-1">Start the conversation!</p>
                        </div>
                      )}
                      {state.messages.map((message) => {
                        const isOwnMessage = message.senderId === user?.uid;
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] ${
                                isOwnMessage ? 'bg-orange/20' : 'bg-white/10'
                              } rounded-lg p-3`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-white">
                                  {message.senderName}
                                </span>
                                <span className="text-xs text-white/40">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                              </div>
                              {message.content && <p className="text-white/90 text-sm">{message.content}</p>}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {message.attachments.map((attachment, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between bg-white/5 rounded p-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        {attachment.type.startsWith('image/') ? (
                                          <ImageIcon className="w-4 h-4 text-white/60" />
                                        ) : (
                                          <FileText className="w-4 h-4 text-white/60" />
                                        )}
                                        <div>
                                          <p className="text-sm text-white">{attachment.name}</p>
                                          <p className="text-xs text-white/40">
                                            {formatFileSize(attachment.size)}
                                          </p>
                                        </div>
                                      </div>
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white/60 hover:text-white"
                                      >
                                        <Download className="w-3 h-3" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {preferences.messageSettings.quickReply && !isOwnMessage && (
                                <div className="mt-2 flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-white/60 hover:text-white"
                                    onClick={() => sendQuickReply('Thank you!')}
                                  >
                                    <Reply className="w-3 h-3 mr-1" />
                                    Thank you
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-white/60 hover:text-white"
                                    onClick={() => sendQuickReply('I need more information.')}
                                  >
                                    <Reply className="w-3 h-3 mr-1" />
                                    More info
                                  </Button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/10">
                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white/5 rounded p-2"
                          >
                            <div className="flex items-center gap-2">
                              {file.type.startsWith('image/') ? (
                                <ImageIcon className="w-4 h-4 text-white/60" />
                              ) : (
                                <FileText className="w-4 h-4 text-white/60" />
                              )}
                              <div>
                                <p className="text-sm text-white">{file.name}</p>
                                <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSelectedFile(index)}
                              className="text-white/60 hover:text-white h-6 w-6"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-white/60 hover:text-white"
                        disabled={isSending}
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 min-h-[44px] max-h-32 bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
                        rows={1}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending}
                        className="bg-orange hover:bg-orange/90"
                      >
                        {isSending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                    <p className="text-white/60">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="flex-1 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Notifications</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllNotificationsAsRead}
                  disabled={state.unreadNotificationCount === 0}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportNotifications}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Export Notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
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
                              markNotificationAsRead(notification.id);
                            }
                            if (notification.link) {
                              window.location.href = notification.link;
                              setIsOpen(false);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-white/5`}>
                              <Icon
                                className={`w-4 h-4 ${getNotificationColor(notification.type)}`}
                              />
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
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-orange/20 border-orange"
                                    >
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
                                  {formatDistanceToNow(notification.createdAt.toDate(), {
                                    addSuffix: true,
                                  })}
                                </span>
                                <div className="flex gap-1">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(notification.id);
                                      }}
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                  )}
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
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 mt-4 space-y-6">
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
                        setPreferences((prev) => ({
                          ...prev,
                          email: { ...prev.email, [key]: checked },
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
                        if (Notification.permission === 'default') {
                          const permission = await Notification.requestPermission();
                          if (permission !== 'granted') {
                            return;
                          }
                        } else if (Notification.permission === 'denied') {
                          alert('Please enable notifications in your browser settings');
                          return;
                        }
                      }
                      setPreferences((prev) => ({
                        ...prev,
                        push: { ...prev.push, enabled: checked },
                      }));
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
                              setPreferences((prev) => ({
                                ...prev,
                                push: { ...prev.push, [key]: checked },
                              }))
                            }
                          />
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Message Settings</h3>
              <div className="space-y-3">
                {Object.entries(preferences.messageSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`message-${key}`} className="text-white/80 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                    <Switch
                      id={`message-${key}`}
                      checked={value}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          messageSettings: { ...prev.messageSettings, [key]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
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