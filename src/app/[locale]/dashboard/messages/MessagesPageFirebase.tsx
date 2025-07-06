'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Search,
  ChevronLeft,
  MessageSquare,
  MoreVertical,
  Archive,
  Trash2,
  Star,
  Clock,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Download,
  X,
  Inbox,
  UserCircle2,
  Circle,
  Filter,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/routing';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  Timestamp,
  addDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { uploadFile, formatFileSize, FileAttachment } from '@/utils/fileUpload';

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

export default function MessagesPageFirebase() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [conversations, setConversations] = useState<ChatChannel[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load conversations
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!user) return;

    const loadConversations = async () => {
      try {
        const chatsList: ChatChannel[] = [];

        if (isAdmin) {
          // Admin: Load all support chats and project chats
          const supportChatsSnapshot = await getDocs(
            query(collection(db, 'supportChats'), orderBy('lastMessageAt', 'desc'))
          );

          supportChatsSnapshot.forEach((doc) => {
            const data = doc.data();
            chatsList.push({
              id: doc.id,
              userId: data.userId,
              userName: data.userName || 'Unknown User',
              userEmail: data.userEmail,
              type: 'support',
              lastMessage: data.lastMessage,
              lastMessageAt: data.lastMessageAt,
              unreadCount: 0, // TODO: Calculate from notifications
              isStarred: data.isStarred || false,
              isArchived: data.isArchived || false,
            });
          });

          // Also load project chats
          const projectsSnapshot = await getDocs(collection(db, 'projects'));
          for (const projectDoc of projectsSnapshot.docs) {
            const projectData = projectDoc.data();
            const chatId = `project_${projectDoc.id}`;
            const chatRef = doc(db, 'projectChats', chatId);
            const chatDoc = await getDoc(chatRef);

            if (chatDoc.exists()) {
              const chatData = chatDoc.data();
              chatsList.push({
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
            chatsList.push({
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
            // Create support chat if it doesn't exist
            chatsList.push({
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
              chatsList.push({
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

        // Calculate unread counts from notifications
        const unreadNotificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          where('type', '==', 'message'),
          where('read', '==', false)
        );
        const unreadNotifications = await getDocs(unreadNotificationsQuery);

        // Update unread counts
        chatsList.forEach((chat) => {
          const unreadCount = unreadNotifications.docs.filter((doc) => {
            const notification = doc.data();
            if (chat.type === 'support' && notification.title?.includes('Support')) {
              return true;
            }
            if (chat.userName && notification.title?.includes(chat.userName)) {
              return true;
            }
            if (chat.projectName && notification.description?.includes(chat.projectName)) {
              return true;
            }
            return false;
          }).length;
          chat.unreadCount = unreadCount;
        });

        setConversations(chatsList);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user, loading, router, isAdmin]);

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !user) return;

    let unsubscribe: (() => void) | undefined;

    // Mark notifications as read when opening chat
    const markChatNotificationsAsRead = async () => {
      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          where('type', '==', 'message'),
          where('read', '==', false)
        );

        const snapshot = await getDocs(notificationsQuery);
        const batch = writeBatch(db);

        snapshot.docs.forEach((doc) => {
          const notification = doc.data();
          // Check if notification is related to this chat
          if (selectedConversation.type === 'support' && notification.title?.includes('Support')) {
            batch.update(doc.ref, { read: true, readAt: serverTimestamp() });
          } else if (
            selectedConversation.userName &&
            notification.title?.includes(selectedConversation.userName)
          ) {
            batch.update(doc.ref, { read: true, readAt: serverTimestamp() });
          } else if (
            selectedConversation.projectName &&
            notification.description?.includes(selectedConversation.projectName)
          ) {
            batch.update(doc.ref, { read: true, readAt: serverTimestamp() });
          }
        });

        if (snapshot.docs.length > 0) {
          await batch.commit();
        }
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    };

    markChatNotificationsAsRead();

    const loadMessages = async () => {
      try {
        const collectionName =
          selectedConversation.type === 'support' ? 'supportChats' : 'projectChats';
        const messagesRef = collection(db, collectionName, selectedConversation.id, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const newMessages: Message[] = [];
            snapshot.forEach((doc) => {
              newMessages.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(newMessages);
          },
          (error) => {
            console.error('Error loading messages:', error);
          }
        );
      } catch (error) {
        console.error('Error setting up message listener:', error);
      }
    };

    loadMessages();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedConversation, user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    switch (filter) {
      case 'unread':
        return matchesSearch && (conv.unreadCount || 0) > 0;
      case 'starred':
        return matchesSearch && conv.isStarred;
      case 'archived':
        return matchesSearch && conv.isArchived;
      default:
        return matchesSearch && !conv.isArchived;
    }
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit file size to 10MB
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

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedConversation || !user) return;

    setIsSending(true);
    setIsUploading(selectedFiles.length > 0);
    
    try {
      const collectionName =
        selectedConversation.type === 'support' ? 'supportChats' : 'projectChats';

      // Ensure chat document exists
      const chatRef = doc(db, collectionName, selectedConversation.id);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        // Create chat document for new chats
        await setDoc(chatRef, {
          userId: selectedConversation.userId || user.uid,
          userName: selectedConversation.userName,
          projectId: selectedConversation.projectId,
          projectName: selectedConversation.projectName,
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
            selectedConversation.projectId
          )
        );
        attachments = await Promise.all(uploadPromises);
      }

      // Add message
      const messagesRef = collection(db, collectionName, selectedConversation.id, 'messages');
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

      // Create notification for the recipient
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

      if (isAdmin && selectedConversation.userId) {
        // Admin sending to user
        await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          userId: selectedConversation.userId,
        });
      } else if (!isAdmin) {
        // User sending to admin
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

  // Format timestamp
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

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Toggle star
  const toggleStar = async (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const collectionName = conversation.type === 'support' ? 'supportChats' : 'projectChats';
    const chatRef = doc(db, collectionName, conversationId);

    try {
      await updateDoc(chatRef, {
        isStarred: !conversation.isStarred,
      });

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, isStarred: !conv.isStarred } : conv
        )
      );
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  // Archive conversation
  const archiveConversation = async (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const collectionName = conversation.type === 'support' ? 'supportChats' : 'projectChats';
    const chatRef = doc(db, collectionName, conversationId);

    try {
      await updateDoc(chatRef, {
        isArchived: !conversation.isArchived,
      });

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, isArchived: !conv.isArchived } : conv
        )
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto"></div>
          <p className="mt-4 text-white/60">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Messages</h1>
              <p className="text-white/60 mt-2">Stay connected with the GroeimetAI team</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <div className="w-full lg:w-96 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b border-white/10">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-orange' : ''}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                  className={filter === 'unread' ? 'bg-orange' : ''}
                >
                  Unread
                </Button>
                <Button
                  variant={filter === 'starred' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('starred')}
                  className={filter === 'starred' ? 'bg-orange' : ''}
                >
                  Starred
                </Button>
              </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <Inbox className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No messages found</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredConversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 cursor-pointer hover:bg-white/5 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-white/10' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
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
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-white">{conversation.userName}</h3>
                              {(conversation.unreadCount || 0) > 0 && (
                                <Badge className="bg-orange text-white px-1.5 py-0 text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              {conversation.isStarred && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            {conversation.projectName && (
                              <p className="text-sm text-white/80">{conversation.projectName}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-white/60 line-clamp-1 mb-1">
                          {conversation.lastMessage}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">
                          {formatMessageTime(conversation.lastMessageAt)}
                        </span>
                        {conversation.projectName && (
                          <Badge variant="outline" className="text-xs">
                            {conversation.projectName}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Thread */}
          {selectedConversation ? (
            <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex flex-col">
              {/* Message Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback
                      className={`${
                        selectedConversation.type === 'support'
                          ? 'bg-green/20 text-green'
                          : 'bg-orange/20 text-orange'
                      }`}
                    >
                      {getInitials(selectedConversation.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-white">{selectedConversation.userName}</h3>
                    {selectedConversation.projectName && (
                      <p className="text-sm text-white/60">{selectedConversation.projectName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleStar(selectedConversation.id)}
                    className="text-white/60 hover:text-white"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        selectedConversation.isStarred ? 'fill-yellow-500 text-yellow-500' : ''
                      }`}
                    />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/60 hover:text-white"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border border-white/10 z-50" align="end" sideOffset={5}>
                      <DropdownMenuItem
                        onClick={() => archiveConversation(selectedConversation.id)}
                        className="text-white hover:bg-white/10 cursor-pointer px-3 py-2"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {selectedConversation.isArchived ? 'Unarchive' : 'Archive'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-white/40 py-8">
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                  )}
                  {messages.map((message) => {
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
                          } rounded-lg p-4`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-white">
                              {message.senderName}
                            </span>
                            <span className="text-xs text-white/40">
                              {formatMessageTime(message.createdAt)}
                            </span>
                          </div>
                          {message.content && <p className="text-white/90">{message.content}</p>}
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
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[44px] max-h-32 bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending}
                    className="bg-orange hover:bg-orange/90"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center">
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
      </div>
    </main>
  );
}