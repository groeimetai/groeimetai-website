'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  FileText,
  MessageSquare,
  DollarSign,
  Clock,
  Target,
  Activity,
  BarChart3,
  Users,
  Settings,
  Plus,
  X,
  GripVertical,
  Maximize2,
  Minimize2,
  AlertCircle,
  Send,
  Check,
  CheckCheck,
  Video,
  MapPin,
  Loader2,
  Briefcase,
  Rocket,
  Flag,
  CheckCircle,
  Circle,
  Edit,
  Save,
  User,
  Mail,
  ExternalLink,
  Paperclip,
  Image as ImageIcon,
  Download,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  limitToLast,
  startAfter,
  endAt,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  formatDistanceToNow,
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Link } from '@/i18n/routing';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ProjectRequestDialog } from '@/components/dialogs/ProjectRequestDialog';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { uploadFile, formatFileSize, FileAttachment } from '@/utils/fileUpload';

interface Widget {
  id: string;
  type:
    | 'stats'
    | 'recentActivity'
    | 'projectProgress'
    | 'upcomingMeetings'
    | 'quickActions'
    | 'revenue'
    | 'tasks'
    | 'projectTimeline'
    | 'messages'
    | 'documents';
  title: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  position: { x: number; y: number };
  isExpanded?: boolean;
}

interface WidgetData {
  [key: string]: any;
}

// Messaging Widget Component
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
}

const MessagingWidget = ({
  isAdmin,
  widgetData,
  user,
}: {
  isAdmin: boolean;
  widgetData: any;
  user: any;
}) => {
  const [selectedChat, setSelectedChat] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chats, setChats] = useState<ChatChannel[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [filePreviewUrls, setFilePreviewUrls] = useState<Map<string, string>>(new Map());
  
  // Pagination state
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const MESSAGES_PER_PAGE = 10;

  const scrollToBottom = (smooth = false) => {
    if (scrollAreaRef.current) {
      if (smooth) {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }
  };

  const isAtBottom = () => {
    if (!scrollAreaRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    return scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
  };

  useEffect(() => {
    // Scroll to bottom only on initial load
    if (messages.length > 0 && isInitialLoad) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
        setIsInitialLoad(false);
      }, 100);
      
      if (!hasScrolledToBottom) {
        setHasScrolledToBottom(true);
      }
    }
  }, [messages.length, isInitialLoad]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up all preview URLs when component unmounts
      filePreviewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Load chats based on user role
  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
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
              unreadCount: 0, // TODO: Implement unread count
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
              });
            }
          }
        }

        setChats(chatsList);

        // Auto-select first chat if none selected
        if (chatsList.length > 0 && !selectedChat) {
          setSelectedChat(chatsList[0]);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };

    loadChats();
  }, [user, isAdmin, selectedChat]);

  // Subscribe to messages for selected chat
  useEffect(() => {
    if (!selectedChat || !user) return;

    setIsLoading(true);
    // Reset pagination state when switching chats
    setMessages([]);
    setHasMoreMessages(true);
    setFirstVisible(null);
    setIsInitialLoad(true); // Reset initial load flag
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
          if (selectedChat.type === 'support' && notification.title?.includes('Support')) {
            batch.update(doc.ref, { read: true, readAt: serverTimestamp() });
          } else if (selectedChat.userName && notification.title?.includes(selectedChat.userName)) {
            batch.update(doc.ref, { read: true, readAt: serverTimestamp() });
          } else if (
            selectedChat.projectName &&
            notification.description?.includes(selectedChat.projectName)
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
        const collectionName = selectedChat.type === 'support' ? 'supportChats' : 'projectChats';
        const messagesRef = collection(db, collectionName, selectedChat.id, 'messages');
        
        // Load only the last 10 messages initially
        const initialQuery = query(
          messagesRef, 
          orderBy('createdAt', 'desc'), 
          limit(MESSAGES_PER_PAGE)
        );
        
        const snapshot = await getDocs(initialQuery);
        
        if (snapshot.empty) {
          setMessages([]);
          setHasMoreMessages(false);
          setIsLoading(false);
          return;
        }
        
        const initialMessages: Message[] = [];
        snapshot.forEach((doc) => {
          initialMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        
        // Reverse to show in chronological order
        initialMessages.reverse();
        setMessages(initialMessages);
        
        // Save the first document for pagination
        setFirstVisible(snapshot.docs[0]);
        
        // Check if there are more messages
        setHasMoreMessages(snapshot.docs.length === MESSAGES_PER_PAGE);
        setIsLoading(false);
        
        // Set up real-time listener for new messages only
        const realtimeQuery = query(
          messagesRef,
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        
        unsubscribe = onSnapshot(
          realtimeQuery,
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const newMessage = { id: change.doc.id, ...change.doc.data() } as Message;
                
                // Check if user is at bottom before adding new message
                const wasAtBottom = isAtBottom();
                
                setMessages((prev) => {
                  // Check if message already exists
                  if (prev.some(msg => msg.id === newMessage.id)) {
                    return prev;
                  }
                  return [...prev, newMessage];
                });
                
                // If user was at bottom, scroll to show new message
                if (wasAtBottom) {
                  setTimeout(() => {
                    scrollToBottom();
                  }, 50);
                }
              }
            });
          },
          (error) => {
            console.error('Error in real-time listener:', error);
          }
        );
      } catch (error) {
        console.error('Error setting up message listener:', error);
        setIsLoading(false);
      }
    };

    loadMessages();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedChat, user]);

  // Load more messages when scrolling up
  const loadMoreMessages = async () => {
    if (!selectedChat || !firstVisible || !hasMoreMessages || loadingMoreMessages) return;

    setLoadingMoreMessages(true);
    
    // Save current scroll height before loading more messages
    const scrollContainer = scrollAreaRef.current;
    const previousScrollHeight = scrollContainer?.scrollHeight || 0;
    
    try {
      const collectionName = selectedChat.type === 'support' ? 'supportChats' : 'projectChats';
      const messagesRef = collection(db, collectionName, selectedChat.id, 'messages');
      
      const moreQuery = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        startAfter(firstVisible),
        limit(MESSAGES_PER_PAGE)
      );
      
      const snapshot = await getDocs(moreQuery);
      
      if (snapshot.empty) {
        setHasMoreMessages(false);
        setLoadingMoreMessages(false);
        return;
      }
      
      const moreMessages: Message[] = [];
      snapshot.forEach((doc) => {
        moreMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      
      // Reverse to show in chronological order
      moreMessages.reverse();
      
      // Prepend the new messages
      setMessages((prev) => [...moreMessages, ...prev]);
      
      // Update the first visible document
      setFirstVisible(snapshot.docs[0]);
      
      // Check if there are more messages
      setHasMoreMessages(snapshot.docs.length === MESSAGES_PER_PAGE);
      
      // Restore scroll position after DOM update
      setTimeout(() => {
        if (scrollContainer) {
          const newScrollHeight = scrollContainer.scrollHeight;
          const scrollDiff = newScrollHeight - previousScrollHeight;
          scrollContainer.scrollTop = scrollDiff;
        }
      }, 50);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  // Handle scroll to detect when to load more messages
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollContainer = e.currentTarget;
    const { scrollTop } = scrollContainer;
    
    // Load more messages when scrolled to top
    if (scrollTop === 0 && hasMoreMessages && !loadingMoreMessages) {
      loadMoreMessages();
    }
    
    // Show/hide scroll to bottom button
    const atBottom = isAtBottom();
    setShowScrollToBottom(!atBottom && messages.length > 0);
  };

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

    // Create preview URLs for images
    const newPreviewUrls = new Map(filePreviewUrls);
    validFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newPreviewUrls.set(file.name, url);
      }
    });
    setFilePreviewUrls(newPreviewUrls);

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    
    // Clean up preview URL if it's an image
    if (fileToRemove && filePreviewUrls.has(fileToRemove.name)) {
      const url = filePreviewUrls.get(fileToRemove.name);
      if (url) URL.revokeObjectURL(url);
      
      const newPreviewUrls = new Map(filePreviewUrls);
      newPreviewUrls.delete(fileToRemove.name);
      setFilePreviewUrls(newPreviewUrls);
    }
    
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedChat || !user) return;

    setIsSending(true);
    setIsUploading(selectedFiles.length > 0);
    try {
      const collectionName = selectedChat.type === 'support' ? 'supportChats' : 'projectChats';

      // Ensure chat document exists
      const chatRef = doc(db, collectionName, selectedChat.id);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        // Create chat document for new chats
        await setDoc(chatRef, {
          userId: selectedChat.userId || user.uid,
          userName: selectedChat.userName,
          projectId: selectedChat.projectId,
          projectName: selectedChat.projectName,
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
            selectedChat.projectId,
            selectedChat.projectName
          )
        );
        attachments = await Promise.all(uploadPromises);
      }

      // Add message
      const messagesRef = collection(db, collectionName, selectedChat.id, 'messages');
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

      if (isAdmin && selectedChat.userId) {
        // Admin sending to user - create notification for the user
        await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          userId: selectedChat.userId,
        });
      } else if (!isAdmin) {
        // User sending to admin - create notifications for all admins
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
      
      // Clean up preview URLs
      filePreviewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      setFilePreviewUrls(new Map());
      
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const formatMessageTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ height: '600px' }}>
      {/* Chat List - 1/3 width */}
      <div className="w-1/3 border-r border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/10">
          <h3 className="text-sm font-medium text-white">Conversations</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-2 rounded-lg text-left transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={`${
                        chat.type === 'support'
                          ? 'bg-green/20 text-green'
                          : 'bg-orange/20 text-orange'
                      } text-xs`}
                    >
                      {getInitials(chat.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{chat.userName}</p>
                    {chat.lastMessage && (
                      <p className="text-xs text-white/60 truncate">{chat.lastMessage}</p>
                    )}
                  </div>
                  {(chat.unreadCount ?? 0) > 0 && (
                    <Badge className="bg-orange text-white text-xs h-5 min-w-[20px] px-1">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area - 2/3 width */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={`${
                      selectedChat.type === 'support'
                        ? 'bg-green/20 text-green'
                        : 'bg-orange/20 text-orange'
                    } text-xs`}
                  >
                    {getInitials(selectedChat.userName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{selectedChat.userName}</p>
                  {selectedChat.type === 'project' && selectedChat.projectName && (
                    <p className="text-xs text-white/60">{selectedChat.projectName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
              <div 
                ref={scrollAreaRef} 
                className="h-full overflow-auto p-3 pb-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                onScroll={handleScroll}
              >
                <div className="space-y-3">
                  {/* Loading more messages indicator */}
                  {loadingMoreMessages && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-orange mr-2" />
                      <span className="text-xs text-white/60">Loading more messages...</span>
                    </div>
                  )}
                  
                  {/* Load more button (optional - shown when there are more messages) */}
                  {!loadingMoreMessages && hasMoreMessages && messages.length > 0 && (
                    <div className="flex justify-center py-2">
                      <button
                        onClick={loadMoreMessages}
                        className="text-xs text-orange hover:text-orange/80 transition-colors"
                      >
                        Load older messages
                      </button>
                    </div>
                  )}

                  {isLoading && messages.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-orange" />
                    </div>
                  )}

                  {!isLoading && messages.length === 0 && (
                    <div className="text-center text-white/40 py-8">
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isOwnMessage = msg.senderId === user?.uid;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`flex items-end gap-2 max-w-[70%] ${
                            isOwnMessage ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <Avatar className="w-6 h-6 flex-shrink-0">
                            <AvatarFallback
                              className={`text-xs ${
                                msg.senderRole === 'admin'
                                  ? 'bg-green/20 text-green'
                                  : 'bg-orange/20 text-orange'
                              }`}
                            >
                              {getInitials(msg.senderName)}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isOwnMessage ? 'bg-orange text-white' : 'bg-white/10 text-white'
                            }`}
                          >
                            {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.attachments.map((attachment, idx) => (
                                  <div key={idx}>
                                    {attachment.type.startsWith('image/') ? (
                                      // Image preview
                                      <div className="relative group">
                                        <a
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block"
                                        >
                                          <img
                                            src={attachment.url}
                                            alt={attachment.name}
                                            className="max-w-full max-h-48 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                          />
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <ExternalLink className="w-6 h-6 text-white" />
                                          </div>
                                        </a>
                                        <div className="mt-1 text-xs text-white/60">
                                          {attachment.name} • {formatFileSize(attachment.size)}
                                        </div>
                                      </div>
                                    ) : (
                                      // Other file types
                                      <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2 text-xs min-w-0">
                                          <FileText className="w-4 h-4 flex-shrink-0 text-white/60" />
                                          <div className="min-w-0">
                                            <p className="truncate font-medium">{attachment.name}</p>
                                            <p className="text-white/40">{formatFileSize(attachment.size)}</p>
                                          </div>
                                        </div>
                                        <a
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-white/60 hover:text-white ml-2 flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                                        >
                                          <Download className="w-4 h-4" />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-white/70' : 'text-white/50'
                              }`}
                            >
                              {formatMessageTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} style={{ height: 1 }} />
                </div>
              </div>
              
              {/* Scroll to bottom button */}
              {showScrollToBottom && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
                  <Button
                    onClick={() => scrollToBottom(true)}
                    size="sm"
                    className="bg-orange hover:bg-orange/90 shadow-lg flex items-center gap-1 px-3 py-1"
                  >
                    <ChevronDown className="w-3 h-3" />
                    <span className="text-xs">New messages</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-white/10">
              <form onSubmit={sendMessage} className="p-3">
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <ScrollArea className="max-h-[120px] mb-2">
                    <div className="space-y-2 pr-2">
                      {selectedFiles.map((file, index) => {
                        const isImage = file.type.startsWith('image/');
                        const previewUrl = filePreviewUrls.get(file.name);
                        
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-white/5 rounded p-2"
                          >
                            {/* File preview */}
                            {isImage && previewUrl ? (
                              <img
                                src={previewUrl}
                                alt={file.name}
                                className="w-12 h-12 object-cover rounded flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-white/60" />
                              </div>
                            )}
                            
                            {/* File info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{file.name}</p>
                              <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
                            </div>
                            
                            {/* Remove button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSelectedFile(index)}
                              className="text-white/60 hover:text-white h-6 w-6 p-0 flex-shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white/60 hover:text-white"
                    disabled={isSending}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40 text-sm"
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-orange hover:bg-orange/90"
                    disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending}
                  >
                    {isSending ? (
                      isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Project Progress Component with Timeline Editing
interface ProjectStage {
  id: number;
  name: string;
  icon: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
  progress?: number;
  completedAt?: Timestamp;
  startedAt?: Timestamp;
  estimatedCompletion?: string;
}

const AdminProjectProgress = ({
  projects,
  onRefresh,
}: {
  projects: any[];
  onRefresh: () => void;
}) => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<ProjectStage | null>(null);
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [projectTimelines, setProjectTimelines] = useState<{ [key: string]: any }>({});

  // Default stages template
  const defaultStages: ProjectStage[] = [
    {
      id: 1,
      name: 'Approval',
      icon: 'shield',
      status: 'current',
      description: 'Awaiting admin approval',
    },
    {
      id: 2,
      name: 'Discovery',
      icon: 'briefcase',
      status: 'upcoming',
      description: 'Understanding your needs',
    },
    {
      id: 3,
      name: 'Planning',
      icon: 'target',
      status: 'upcoming',
      description: 'Defining project scope',
    },
    {
      id: 4,
      name: 'Development',
      icon: 'rocket',
      status: 'upcoming',
      description: 'Building your solution',
    },
    {
      id: 5,
      name: 'Delivery',
      icon: 'flag',
      status: 'upcoming',
      description: 'Final implementation',
    },
  ];

  // Fetch all approved and pending quotes and their timelines with real-time updates
  useEffect(() => {
    const q = query(
      collection(db, 'quotes'),
      where('status', 'in', ['approved', 'pending']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const projectsList = [];
      const timelines: { [key: string]: any } = {};

      // Process each approved quote document
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const project = {
          id: docSnapshot.id,
          userId: data.userId,
          userName: data.fullName || data.userName || 'Unknown User',
          userEmail: data.email,
          projectName: data.projectName,
          status: data.status,
          createdAt: data.createdAt,
        };
        projectsList.push(project);

        // Set up real-time listener for each project's timeline
        const timelineRef = doc(db, 'projectTimelines', docSnapshot.id);
        onSnapshot(timelineRef, (timelineDoc: any) => {
          if (timelineDoc.exists()) {
            timelines[docSnapshot.id] = timelineDoc.data();
            setProjectTimelines((prev) => ({ ...prev, [docSnapshot.id]: timelineDoc.data() }));
          }
        });
      }

      setAllProjects(projectsList);
    });

    return () => unsubscribe();
  }, []);

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleEditStage = (stage: ProjectStage) => {
    setEditingStage(stage);
    setIsEditingStage(true);
  };

  const handleSaveStage = async () => {
    if (!selectedProject || !editingStage) return;

    setIsSaving(true);
    try {
      const timeline = projectTimelines[selectedProject.id] || {
        stages: defaultStages,
        milestone: '',
        projectName: selectedProject.projectName,
      };

      const updatedStages = timeline.stages.map((stage: ProjectStage) =>
        stage.id === editingStage.id ? editingStage : stage
      );

      // Update stage statuses based on the current stage
      if (editingStage.status === 'current') {
        updatedStages.forEach((stage: ProjectStage) => {
          if (stage.id < editingStage.id) {
            stage.status = 'completed';
            if (!stage.completedAt) {
              stage.completedAt = Timestamp.now();
            }
          } else if (stage.id > editingStage.id) {
            stage.status = 'upcoming';
          }
        });
      } else if (editingStage.status === 'completed') {
        updatedStages.forEach((stage: ProjectStage) => {
          if (stage.id <= editingStage.id) {
            stage.status = 'completed';
            if (!stage.completedAt && stage.id === editingStage.id) {
              stage.completedAt = Timestamp.now();
            }
          }
        });
      }

      await setDoc(doc(db, 'projectTimelines', selectedProject.id), {
        stages: updatedStages,
        milestone: timeline.milestone || '',
        projectName: selectedProject.projectName,
        updatedAt: Timestamp.now(),
      });

      toast.success('Stage updated successfully');
      setIsEditingStage(false);
      setEditingStage(null);
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
    } finally {
      setIsSaving(false);
    }
  };

  const getStageIcon = (icon: string) => {
    const icons: { [key: string]: any } = {
      shield: Shield,
      briefcase: Briefcase,
      target: Target,
      rocket: Rocket,
      flag: Flag,
    };
    const Icon = icons[icon] || Circle;
    return Icon;
  };

  const calculateProjectProgress = (stages: ProjectStage[]) => {
    const completedStages = stages.filter((s) => s.status === 'completed').length;
    const currentStage = stages.find((s) => s.status === 'current');
    const currentProgress = currentStage?.progress || 0;
    return (completedStages * 100 + currentProgress) / stages.length;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {allProjects.length > 0 ? (
        <ScrollArea className="flex-1 h-full">
          <div className="p-3 space-y-2">
            {allProjects.map((project) => {
            const timeline = projectTimelines[project.id];
            const stages = timeline?.stages || defaultStages;
            const progress = calculateProjectProgress(stages);
            const currentStage = stages.find((s: ProjectStage) => s.status === 'current');

            return (
              <div
                key={project.id}
                className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => handleProjectClick(project)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white text-sm font-medium">{project.projectName}</h4>
                    <p className="text-white/60 text-xs flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      {project.userName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {project.status === 'pending' && (
                      <Badge variant="outline" className="text-xs bg-orange/20 text-orange border-orange">
                        Pending Approval
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {currentStage?.name || 'Planning'}
                    </Badge>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-white/60 text-xs text-right mt-1">{Math.round(progress)}%</p>
              </div>
            );
          })}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm">No projects yet</p>
        </div>
      )}

      {/* Timeline Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-black/95 border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Project Timeline: {selectedProject?.projectName}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Update the project stages and track progress
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/60 text-sm">Client: {selectedProject.userName}</p>
                <p className="text-white/60 text-sm">Email: {selectedProject.userEmail}</p>
              </div>

              <div className="space-y-3">
                {(projectTimelines[selectedProject.id]?.stages || defaultStages).map(
                  (stage: ProjectStage) => {
                    const StageIcon = getStageIcon(stage.icon);
                    return (
                      <div
                        key={stage.id}
                        className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                stage.status === 'completed'
                                  ? 'bg-green-500'
                                  : stage.status === 'current'
                                    ? 'bg-orange'
                                    : 'bg-white/20'
                              }`}
                            >
                              {stage.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : (
                                <StageIcon className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{stage.name}</h4>
                              <p className="text-white/60 text-sm">{stage.description}</p>
                              {stage.status === 'current' && stage.progress !== undefined && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Progress value={stage.progress} className="h-1 flex-1" />
                                  <span className="text-white/60 text-xs">{stage.progress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStage(stage);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stage Edit Dialog */}
      <Dialog open={isEditingStage} onOpenChange={setIsEditingStage}>
        <DialogContent className="bg-black/95 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Stage: {editingStage?.name}</DialogTitle>
          </DialogHeader>

          {editingStage && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingStage.status}
                  onValueChange={(value) =>
                    setEditingStage({ ...editingStage, status: value as any })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingStage.description}
                  onChange={(e) =>
                    setEditingStage({ ...editingStage, description: e.target.value })
                  }
                  className="bg-white/10 border-white/20"
                />
              </div>

              {editingStage.status === 'current' && (
                <div>
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={editingStage.progress || 0}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        progress: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-white/10 border-white/20"
                  />
                </div>
              )}

              {editingStage.status !== 'upcoming' && (
                <div>
                  <Label htmlFor="estimatedCompletion">Estimated Completion</Label>
                  <Input
                    id="estimatedCompletion"
                    type="date"
                    value={editingStage.estimatedCompletion || ''}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        estimatedCompletion: e.target.value,
                      })
                    }
                    className="bg-white/10 border-white/20"
                  />
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditingStage(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-orange hover:bg-orange/90"
                  onClick={handleSaveStage}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Different default widgets for users vs admins
const DEFAULT_USER_WIDGETS: Widget[] = [
  {
    id: '1',
    type: 'projectTimeline',
    title: 'Project Timeline',
    size: 'large',
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'messages',
    title: 'Messages & Communication',
    size: 'large',
    position: { x: 1, y: 0 },
  },
  {
    id: '3',
    type: 'quickActions',
    title: 'Quick Actions',
    size: 'small',
    position: { x: 0, y: 1 },
  },
  {
    id: '4',
    type: 'documents',
    title: 'Recent Documents',
    size: 'small',
    position: { x: 1, y: 1 },
  },
  {
    id: '5',
    type: 'upcomingMeetings',
    title: 'Upcoming Consultations',
    size: 'small',
    position: { x: 2, y: 1 },
  },
  {
    id: '6',
    type: 'recentActivity',
    title: 'Recent Activity',
    size: 'small',
    position: { x: 3, y: 1 },
  },
];

const DEFAULT_ADMIN_WIDGETS: Widget[] = [
  {
    id: '1',
    type: 'projectProgress',
    title: 'All Projects',
    size: 'large',
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'messages',
    title: 'Client Communications',
    size: 'large',
    position: { x: 1, y: 0 },
  },
  {
    id: '3',
    type: 'stats',
    title: 'Business Metrics',
    size: 'small',
    position: { x: 0, y: 1 },
  },
  {
    id: '4',
    type: 'revenue',
    title: 'Revenue Overview',
    size: 'small',
    position: { x: 1, y: 1 },
  },
  {
    id: '5',
    type: 'tasks',
    title: 'Team Tasks',
    size: 'small',
    position: { x: 2, y: 1 },
  },
  {
    id: '6',
    type: 'recentActivity',
    title: 'Recent Activity',
    size: 'small',
    position: { x: 3, y: 1 },
  },
];

const WIDGET_TYPES = [
  {
    type: 'stats',
    title: 'Business Metrics',
    icon: BarChart3,
    description: 'Key business performance indicators',
    adminOnly: true,
  },
  {
    type: 'recentActivity',
    title: 'Recent Activity',
    icon: Activity,
    description: 'Latest updates and changes',
  },
  {
    type: 'projectProgress',
    title: 'Active Projects',
    icon: Target,
    description: 'Overview of all active projects',
    adminOnly: true,
  },
  {
    type: 'projectTimeline',
    title: 'Project Timeline',
    icon: Clock,
    description: 'Your project milestones and progress',
    userOnly: true,
  },
  {
    type: 'upcomingMeetings',
    title: 'Upcoming Consultations',
    icon: Calendar,
    description: 'Scheduled meetings with consultants',
  },
  {
    type: 'quickActions',
    title: 'Quick Actions',
    icon: Plus,
    description: 'Common actions and shortcuts',
  },
  {
    type: 'tasks',
    title: 'Team Tasks',
    icon: FileText,
    description: 'Task management for team',
    adminOnly: true,
  },
  {
    type: 'messages',
    title: 'Messages',
    icon: MessageSquare,
    description: 'All your conversations in one place',
  },
  {
    type: 'documents',
    title: 'Documents',
    icon: FileText,
    description: 'Recent contracts and deliverables',
    userOnly: true,
  },
  {
    type: 'revenue',
    title: 'Revenue',
    icon: DollarSign,
    description: 'Financial performance metrics',
    adminOnly: true,
  },
];

export default function DashboardWidgets() {
  const { user, isAdmin } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>(
    isAdmin ? DEFAULT_ADMIN_WIDGETS : DEFAULT_USER_WIDGETS
  );
  const [widgetData, setWidgetData] = useState<WidgetData>({
    timelineProgress: 0,
    timelineStages: [],
    allProjects: [], // SECURITY: Always initialize as empty array
    projectProgress: [], // Initialize for consistency
  });
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalWidgets, setOriginalWidgets] = useState<Widget[]>([]);
  const timelineUnsubscribes = useRef<(() => void)[]>([]);

  // Load user's widget preferences function (defined outside useEffect for reusability)
  const loadWidgetPreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.dashboardWidgets) {
          setWidgets(userData.dashboardWidgets);
          setOriginalWidgets(userData.dashboardWidgets);
        } else {
          // No saved preferences, use role-based defaults
          const defaultWidgets = isAdmin ? DEFAULT_ADMIN_WIDGETS : DEFAULT_USER_WIDGETS;
          setWidgets(defaultWidgets);
          setOriginalWidgets(defaultWidgets);
        }
      } else {
        // No user doc, use role-based defaults
        const defaultWidgets = isAdmin ? DEFAULT_ADMIN_WIDGETS : DEFAULT_USER_WIDGETS;
        setWidgets(defaultWidgets);
        setOriginalWidgets(defaultWidgets);
      }
    } catch (error) {
      console.error('Error loading widget preferences:', error);
      toast.error('Failed to load dashboard preferences');
      // On error, use role-based defaults
      const defaultWidgets = isAdmin ? DEFAULT_ADMIN_WIDGETS : DEFAULT_USER_WIDGETS;
      setWidgets(defaultWidgets);
      setOriginalWidgets(defaultWidgets);
    } finally {
      setIsLoading(false);
    }
  };

  // Load preferences on mount
  useEffect(() => {
    loadWidgetPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  // SECURITY: Clear sensitive data when user role changes
  useEffect(() => {
    if (!isAdmin) {
      // Clear any admin-only data when user is not an admin
      setWidgetData((prevData) => ({
        ...prevData,
        allProjects: [], // Clear all projects data
        stats: undefined, // Clear admin stats
        activeChats: undefined, // Clear admin chats
        totalRevenue: undefined,
        monthlyRevenue: undefined,
        pendingRevenue: undefined,
        revenueGrowth: undefined,
        upcomingMeetings: undefined,
      }));
    }
  }, [isAdmin]);

  // Save widget preferences with proper error handling
  const saveWidgetPreferences = async (updatedWidgets?: Widget[]) => {
    if (!user) return false;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          dashboardWidgets: updatedWidgets || widgets,
          updatedAt: new Date(),
        });
        // Update original widgets to reflect saved state
        setOriginalWidgets(updatedWidgets || widgets);
        return true;
      } else {
        toast.error('User profile not found. Please contact support.');
        return false;
      }
    } catch (error) {
      console.error('Error saving widget preferences:', error);
      toast.error('Failed to save dashboard preferences. Please try again.');
      return false;
    }
  };

  // Fetch widget data
  useEffect(() => {
    if (!user) return;

    const fetchWidgetData = async () => {
      const data: WidgetData = {};

      try {
        if (isAdmin) {
          // Admin data fetching
          // Fetch all projects for stats
          const allProjectsSnapshot = await getDocs(collection(db, 'projects'));
          const allQuotesSnapshot = await getDocs(collection(db, 'quotes'));
          const allInvoicesSnapshot = await getDocs(collection(db, 'invoices'));

          data.stats = {
            projects: allProjectsSnapshot.size,
            activeProjects: allProjectsSnapshot.docs.filter((doc) => doc.data().status === 'active')
              .length,
            quotes: allQuotesSnapshot.size,
            pendingQuotes: allQuotesSnapshot.docs.filter((doc) => doc.data().status === 'pending')
              .length,
            totalClients: new Set(allProjectsSnapshot.docs.map((doc) => doc.data().clientId)).size,
            revenue: allInvoicesSnapshot.docs
              .filter((doc) => doc.data().status === 'paid')
              .reduce((sum, doc) => sum + (doc.data().amount || 0), 0),
          };

          // Fetch active chats for messages widget
          const chatsSnapshot = await getDocs(
            query(collection(db, 'supportChats'), orderBy('lastMessageAt', 'desc'))
          );

          // Get unread notifications for admin
          const adminUnreadQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('type', '==', 'message'),
            where('read', '==', false)
          );
          const adminUnreadNotifications = await getDocs(adminUnreadQuery);

          data.activeChats = await Promise.all(
            chatsSnapshot.docs.map(async (chatDoc) => {
              const chatData = chatDoc.data();

              // Count unread messages from this user
              const unreadFromUser = adminUnreadNotifications.docs.filter((doc) => {
                const notification = doc.data();
                return (
                  notification.title?.includes(chatData.userName) ||
                  notification.description?.includes(chatData.userName)
                );
              }).length;

              return {
                id: chatDoc.id,
                userId: chatData.userId,
                userName: chatData.userName,
                projectName: chatData.projectName,
                lastMessage: chatData.lastMessage,
                lastMessageAt: chatData.lastMessageAt,
                unreadCount: unreadFromUser,
              };
            })
          );

          // Fetch revenue data
          const paidInvoices = allInvoicesSnapshot.docs.filter(
            (doc) => doc.data().status === 'paid'
          );
          const currentMonth = new Date().getMonth();
          const monthlyInvoices = paidInvoices.filter((doc) => {
            const date = doc.data().paidAt?.toDate();
            return date && date.getMonth() === currentMonth;
          });

          data.totalRevenue = paidInvoices.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
          data.monthlyRevenue = monthlyInvoices.reduce(
            (sum, doc) => sum + (doc.data().amount || 0),
            0
          );
          data.pendingRevenue = allInvoicesSnapshot.docs
            .filter((doc) => doc.data().status === 'pending')
            .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

          // Calculate revenue growth
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthInvoices = paidInvoices.filter((doc) => {
            const date = doc.data().paidAt?.toDate();
            return date && date.getMonth() === lastMonth;
          });
          const lastMonthRevenue = lastMonthInvoices.reduce(
            (sum, doc) => sum + (doc.data().amount || 0),
            0
          );
          data.revenueGrowth =
            lastMonthRevenue > 0
              ? Math.round(((data.monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
              : 0;

          // Fetch upcoming meetings for admins
          const meetingsQuery = query(
            collection(db, 'meetings'),
            where('status', 'in', ['scheduled', 'rescheduled']),
            where('startTime', '>', Timestamp.now()),
            orderBy('startTime', 'asc'),
            limit(5)
          );
          const meetingsSnapshot = await getDocs(meetingsQuery);

          data.upcomingMeetings = meetingsSnapshot.docs.map((doc) => {
            const meeting = doc.data();
            return {
              id: doc.id,
              title: meeting.title,
              type: meeting.type,
              startTime: meeting.startTime.toDate(),
              endTime: meeting.endTime.toDate(),
              location: meeting.location,
              platform: meeting.platform,
              meetingLink: meeting.meetingLink,
              participants: meeting.participants || [],
              clientName:
                meeting.participants?.find((p: any) => p.role !== 'organizer')?.name ||
                'Unknown Client',
            };
          });

          // Fetch all projects for admin projectProgress widget
          const allQuotesQuery = query(
            collection(db, 'quotes'),
            where('status', 'in', ['approved', 'pending']),
            orderBy('createdAt', 'desc')
          );
          const allApprovedQuotesSnapshot = await getDocs(allQuotesQuery);

          data.allProjects = allApprovedQuotesSnapshot.docs.map((doc) => {
            const quote = doc.data();
            return {
              id: doc.id,
              userId: quote.userId,
              userName: quote.fullName || quote.userName || 'Unknown User',
              userEmail: quote.email,
              projectName: quote.projectName,
              status: quote.status,
              createdAt: quote.createdAt,
            };
          });
        } else {
          // User data fetching
          // CRITICAL SECURITY FIX: Explicitly clear allProjects for non-admin users
          data.allProjects = [];
          
          // Query quotes by userId
          const quotesQuery = query(
            collection(db, 'quotes'), 
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const quotesSnapshot = await getDocs(quotesQuery);
          
          // Also query for quotes by email (fallback for quotes created before account creation)
          let quotesEmailSnapshot: any = { docs: [] };
          if (user.email) {
            const quotesEmailQuery = query(
              collection(db, 'quotes'),
              where('email', '==', user.email),
              orderBy('createdAt', 'desc')
            );
            quotesEmailSnapshot = await getDocs(quotesEmailQuery);
          }
          
          // Combine quotes from both queries, avoiding duplicates
          const allQuoteDocs = new Map();
          quotesSnapshot.docs.forEach(doc => allQuoteDocs.set(doc.id, doc));
          quotesEmailSnapshot.docs.forEach((doc: any) => {
            if (!allQuoteDocs.has(doc.id)) {
              allQuoteDocs.set(doc.id, doc);
            }
          });
          
          // Transform quotes to project format
          const projectsFromQuotes = Array.from(allQuoteDocs.values()).map(doc => {
            const data = doc.data();
            
            // Map quote status to appropriate project status
            const getProjectStatus = (quoteStatus: string) => {
              switch (quoteStatus) {
                case 'pending':
                case 'reviewed':
                  return 'pending_approval';
                case 'approved':
                  return 'active';
                case 'rejected':
                  return 'cancelled';
                default:
                  return 'pending_approval';
              }
            };
            
            return {
              id: doc.id,
              data() {
                return {
                  name: data.projectName || 'Untitled Project',
                  status: getProjectStatus(data.status),
                  clientId: data.userId || user.uid,
                  estimatedCompletion: data.estimatedCompletion,
                  ...data
                };
              }
            };
          });
          
          // Use transformed quotes as "projects" for consistency
          const projectsSnapshot = { 
            docs: projectsFromQuotes, 
            size: projectsFromQuotes.length 
          };

          // For project timeline widget - check both projects and approved quotes
          let activeProject = null;
          let activeProjectId = null;

          // First check for actual projects
          if (projectsSnapshot.docs.length > 0) {
            const activeProjects = projectsSnapshot.docs.filter((doc) => {
              const project = doc.data();
              return project.status === 'active' || project.status === 'in_progress';
            });

            if (activeProjects.length > 0) {
              activeProject = activeProjects[0].data();
              activeProjectId = activeProjects[0].id;
            } else {
              // No active projects, use the most recent
              activeProject = projectsSnapshot.docs[0].data();
              activeProjectId = projectsSnapshot.docs[0].id;
            }
          }

          // If no active projects found, check for approved or pending quotes (already transformed to projects)
          if (!activeProject && projectsSnapshot.docs.length > 0) {
            // Find projects with 'active' or 'pending_approval' status (which come from approved/pending quotes)
            const availableProjects = projectsSnapshot.docs.filter(
              (doc) => {
                const projectData = doc.data();
                return projectData.status === 'active' || projectData.status === 'pending_approval';
              }
            );
            if (availableProjects.length > 0) {
              const projectData = availableProjects[0].data();
              activeProject = {
                name: projectData.name || 'My AI Project',
                status: 'active',
                estimatedCompletion: projectData.estimatedCompletion,
              };
              activeProjectId = availableProjects[0].id;
            }
          }

          if (activeProject && activeProjectId) {
            data.projectName = activeProject.name || 'My AI Project';

            // Set up real-time listener for timeline
            const timelineRef = doc(db, 'projectTimelines', activeProjectId);

            // Store unsubscribe function
            const unsubscribeTimeline = onSnapshot(timelineRef, (timelineDoc) => {
              if (timelineDoc.exists()) {
                const timelineData = timelineDoc.data();

                setWidgetData((prevData) => {
                  const newData = { ...prevData };
                  newData.timelineStages = timelineData.stages || [];
                  newData.projectName = activeProject.name || 'My AI Project';

                  // Calculate overall progress
                  if (timelineData.stages) {
                    const completedStages = timelineData.stages.filter(
                      (s: any) => s.status === 'completed'
                    ).length;
                    const currentStage = timelineData.stages.find(
                      (s: any) => s.status === 'current'
                    );
                    const currentProgress = currentStage?.progress || 0;

                    // Overall progress includes partial progress of current stage
                    newData.timelineProgress = Math.round(
                      (completedStages * 100 + currentProgress) / timelineData.stages.length
                    );
                  } else {
                    newData.timelineProgress = 0;
                  }

                  // Add milestone and estimated completion
                  newData.milestone = timelineData.milestone || null;
                  newData.estimatedCompletion = activeProject.estimatedCompletion || null;
                  newData.projectId = activeProjectId;

                  return newData;
                });
              } else {
                // No timeline document exists yet - use default data
                setWidgetData((prevData) => ({
                  ...prevData,
                  projectName: activeProject.name || 'My AI Project',
                  timelineStages: [],
                  timelineProgress: 0,
                  projectId: activeProjectId,
                }));
              }
            });

            // Store unsubscribe function for cleanup
            timelineUnsubscribes.current.push(unsubscribeTimeline);
          } else {
            // No projects at all - set empty data
            data.projectName = 'Your AI Project';
            // Don't set timeline data here - let it come from real-time listener or stay as initialized
          }

          // For messages widget - get unread message counts from notifications
          const unreadNotificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('type', '==', 'message'),
            where('read', '==', false)
          );
          const unreadNotifications = await getDocs(unreadNotificationsQuery);

          // Count unread support messages
          const supportUnread = unreadNotifications.docs.filter((doc) => {
            const notification = doc.data();
            return notification.title?.includes('Support');
          }).length;

          data.supportUnread = supportUnread;

          // Get project chats with unread counts
          data.projectChats = await Promise.all(
            projectsSnapshot.docs.map(async (projectDoc) => {
              const projectData = projectDoc.data();

              // Count unread messages for this project
              const projectUnread = unreadNotifications.docs.filter((doc) => {
                const notification = doc.data();
                return (
                  notification.description?.includes(projectData.name) ||
                  notification.link?.includes(projectDoc.id)
                );
              }).length;

              return {
                id: projectDoc.id,
                projectId: projectDoc.id,
                projectName: projectData.name,
                unreadCount: projectUnread,
              };
            })
          );

          // For documents widget - wrapped in try/catch to handle permissions
          try {
            const documentsQuery = query(
              collection(db, 'documents'),
              where('uploadedBy.uid', '==', user.uid),
              orderBy('createdAt', 'desc'),
              limit(5)
            );
            const documentsSnapshot = await getDocs(documentsQuery);

            data.recentDocuments = documentsSnapshot.docs.map((doc) => {
              const docData = doc.data();
              return {
                id: doc.id,
                name: docData.name,
                type: docData.type,
                date: docData.createdAt?.toDate().toLocaleDateString() || 'Unknown',
              };
            });
          } catch (documentsError) {
            console.log('Documents collection not accessible or empty, skipping...');
            data.recentDocuments = [];
          }

          // Stats for users (simplified)
          data.stats = {
            projects: projectsSnapshot.size,
            activeProjects: projectsSnapshot.docs.filter((doc) => doc.data().status === 'active')
              .length,
            quotes: projectsSnapshot.size, // Same as projects since they're transformed quotes
            documents: data.recentDocuments?.length || 0,
          };

          // Fetch upcoming meetings for users - wrapped in try/catch to handle permissions
          try {
            const meetingsQuery = query(
              collection(db, 'meetings'),
              where('participantIds', 'array-contains', user.uid),
              where('status', 'in', ['scheduled', 'rescheduled']),
              where('startTime', '>', Timestamp.now()),
              orderBy('startTime', 'asc'),
              limit(5)
            );
            const meetingsSnapshot = await getDocs(meetingsQuery);

            data.upcomingMeetings = meetingsSnapshot.docs.map((doc) => {
              const meeting = doc.data();
              return {
                id: doc.id,
                title: meeting.title,
                type: meeting.type,
                startTime: meeting.startTime.toDate(),
                endTime: meeting.endTime.toDate(),
                location: meeting.location,
                platform: meeting.platform,
                meetingLink: meeting.meetingLink,
                participants: meeting.participants || [],
              };
            });
          } catch (meetingsError) {
            console.log('Meetings collection not accessible or empty, skipping...');
            data.upcomingMeetings = [];
          }

          // Recent activity
          const activities: Array<{
            id: string;
            type: string;
            title: string;
            time: Date;
          }> = [];

          projectsSnapshot.docs.slice(0, 5).forEach((doc) => {
            const project = doc.data();
            activities.push({
              id: doc.id,
              type: 'project',
              title: `Project ${project.name} updated`,
              time: project.updatedAt?.toDate() || new Date(),
            });
          });

          data.recentActivity = activities
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, 5);

          // Project progress
          data.projectProgress = projectsSnapshot.docs.slice(0, 3).map((doc) => {
            const project = doc.data();
            const progress = project.milestones
              ? (project.milestones.filter((m: any) => m.status === 'completed').length /
                  project.milestones.length) *
                100
              : 0;
            return {
              id: doc.id,
              name: project.name,
              progress: Math.round(progress),
              status: project.status,
            };
          });
        }

        setWidgetData((prevData) => {
          // SECURITY: Final check to ensure non-admin users never get allProjects data
          const sanitizedData = { ...data };
          if (!isAdmin && sanitizedData.allProjects && sanitizedData.allProjects.length > 0) {
            console.error('SECURITY: Preventing allProjects data leak to non-admin user');
            sanitizedData.allProjects = [];
          }
          
          return {
            ...prevData,
            ...sanitizedData,
            // Preserve timeline data if it was already set by real-time listener
            timelineStages: prevData.timelineStages || sanitizedData.timelineStages,
            timelineProgress:
              prevData.timelineProgress !== undefined
                ? prevData.timelineProgress
                : sanitizedData.timelineProgress,
          };
        });
      } catch (error) {
        // Only log actual errors, not permission issues that are already handled
        if (
          error instanceof Error &&
          !error.message.includes('Missing or insufficient permissions')
        ) {
          console.error('Error fetching widget data:', error);
        }
      }
    };

    fetchWidgetData();

    // Cleanup timeline listeners when component unmounts
    return () => {
      timelineUnsubscribes.current.forEach((unsubscribe) => unsubscribe());
      timelineUnsubscribes.current = [];
    };
  }, [user, widgets, isAdmin]);

  const addWidget = (type: string) => {
    const widgetType = WIDGET_TYPES.find((w) => w.type === type);
    if (!widgetType) return;

    // Determine size based on widget type
    let widgetSize: Widget['size'] = 'medium';
    if (type === 'messages') {
      widgetSize = 'xlarge';
    } else if (type === 'projectTimeline') {
      widgetSize = 'large';
    } else if (type === 'quickActions') {
      widgetSize = 'small';
    }

    const newWidget: Widget = {
      id: Date.now().toString(),
      type: type as Widget['type'],
      title: widgetType.title,
      size: widgetSize,
      position: { x: widgets.length % 3, y: Math.floor(widgets.length / 3) },
    };

    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    setShowAddWidget(false);
    setHasUnsavedChanges(true);
  };

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter((w) => w.id !== widgetId);
    setWidgets(updatedWidgets);
    setHasUnsavedChanges(true);
  };

  const toggleWidgetSize = async (widgetId: string) => {
    const updatedWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, isExpanded: !w.isExpanded } : w
    );
    setWidgets(updatedWidgets);
    if (!isEditMode) {
      // Auto-save size changes when not in edit mode
      const saved = await saveWidgetPreferences(updatedWidgets);
      if (!saved) {
        // Revert on failure
        setWidgets(widgets);
      }
    } else {
      setHasUnsavedChanges(true);
    }
  };

  const handleReorder = (newOrder: Widget[]) => {
    const updatedWidgets = newOrder.map((w, index) => ({
      ...w,
      position: { x: index % 3, y: Math.floor(index / 3) },
    }));
    setWidgets(updatedWidgets);
    setHasUnsavedChanges(true);
  };

  // Auto-save when exiting edit mode with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isEditMode) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isEditMode]);

  const handleSaveChanges = async () => {
    const saved = await saveWidgetPreferences(widgets);
    if (saved) {
      setHasUnsavedChanges(false);
      setIsEditMode(false);
      toast.success('Dashboard saved successfully');
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        // Restore original widgets
        setWidgets(originalWidgets);
        setIsEditMode(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setIsEditMode(false);
    }
  };

  const resetToDefault = async () => {
    if (
      confirm(
        'Are you sure you want to reset to default layout? This will remove all your customizations.'
      )
    ) {
      const defaultWidgets = isAdmin ? DEFAULT_ADMIN_WIDGETS : DEFAULT_USER_WIDGETS;
      setWidgets(defaultWidgets);
      setHasUnsavedChanges(true);
      toast('Dashboard reset to default. Save to apply changes.', { icon: 'ℹ️' });
    }
  };

  const renderWidget = (widget: Widget, isTopWidget: boolean = false) => {
    const WidgetContent = () => {
      switch (widget.type) {
        case 'stats':
          return (
            <div className="grid grid-cols-2 gap-4 overflow-y-auto h-full">
              {isAdmin ? (
                // Admin stats - more comprehensive business metrics
                <>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Active Projects</p>
                    <p className="text-2xl font-bold text-green-500">
                      {widgetData.stats?.activeProjects || 0}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Total Clients</p>
                    <p className="text-2xl font-bold text-white">
                      {widgetData.stats?.totalClients || 0}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Revenue</p>
                    <p className="text-2xl font-bold text-orange">
                      €{(widgetData.stats?.revenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/60 text-sm">Pending Quotes</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {widgetData.stats?.pendingQuotes || 0}
                    </p>
                  </div>
                </>
              ) : (
                // User stats - simplified view focused on their projects
                <>
                  <div className="bg-white/5 rounded-lg p-4 col-span-2">
                    <p className="text-white/60 text-sm mb-1">Your Active Projects</p>
                    <p className="text-3xl font-bold text-green-500">
                      {widgetData.stats?.activeProjects || 0}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      {widgetData.stats?.projects || 0} total projects with GroeimetAI
                    </p>
                  </div>
                </>
              )}
            </div>
          );

        case 'recentActivity':
          return (
            <div className="flex flex-col h-full overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {widgetData.recentActivity?.length > 0 ? (
                    widgetData.recentActivity.slice(0, 5).map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{activity.title}</p>
                          <p className="text-white/40 text-xs">
                            {formatDistanceToNow(activity.time, { addSuffix: true })}
                          </p>
                        </div>
                        <Activity className="w-4 h-4 text-white/60 ml-2 flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <p className="text-white/60 text-center py-4">No recent activity</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          );

        case 'projectProgress':
          if (!isAdmin) {
            // SECURITY: For non-admin users, ONLY show their own projects
            // Double-check that we're not accidentally using allProjects
            const userProjects = widgetData.projectProgress || [];
            
            // Additional security check: ensure no allProjects data leaks to non-admin users
            if (widgetData.allProjects && widgetData.allProjects.length > 0) {
              console.error('SECURITY WARNING: allProjects should be empty for non-admin users');
            }
            
            return (
              <div className="space-y-3">
                {userProjects.length > 0 ? (
                  userProjects.map((project: any) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-white text-sm font-medium">{project.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <p className="text-white/60 text-xs text-right">{project.progress}%</p>
                    </div>
                  ))
                ) : (
                  <p className="text-white/60 text-center py-4">No projects yet</p>
                )}
              </div>
            );
          }

          // Admin version with clickable projects and timeline editing
          // SECURITY: Double-check admin status before showing all projects
          if (isAdmin && widgetData.allProjects) {
            return (
              <AdminProjectProgress projects={widgetData.allProjects} onRefresh={() => {}} />
            );
          }
          
          // Fallback: If somehow we reach here, show empty state
          return <p className="text-white/60 text-center py-4">No projects available</p>;

        case 'quickActions':
          return (
            <div className="space-y-4">
              {isAdmin ? (
                // Admin quick actions
                <>
                  <Link href="/dashboard/admin/quotes">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Review Quotes
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/projects">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Target className="w-4 h-4 mr-2" />
                      Manage Projects
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/users">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Client Management
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/invoices">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Invoices
                    </Button>
                  </Link>
                </>
              ) : (
                // User quick actions - focused on requesting services
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => setProjectDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request New Project
                  </Button>
                  <Link href="/dashboard/consultations">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Consultation
                    </Button>
                  </Link>
                  <Link href="/dashboard/documents">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View Deliverables
                    </Button>
                  </Link>
                  <Link href="/dashboard/invoices">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <DollarSign className="w-4 h-4 mr-2" />
                      View Invoices
                    </Button>
                  </Link>
                </>
              )}
            </div>
          );

        case 'upcomingMeetings':
          const meetings = widgetData.upcomingMeetings || [];

          const formatMeetingTime = (startTime: Date, endTime: Date) => {
            return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
          };

          const getMeetingBadge = (startTime: Date) => {
            if (isToday(startTime)) return 'Today';
            if (isTomorrow(startTime)) return 'Tomorrow';
            if (isThisWeek(startTime)) return format(startTime, 'EEEE');
            return format(startTime, 'MMM d');
          };

          const getMeetingIcon = (platform?: string) => {
            if (
              platform === 'video' ||
              platform === 'zoom' ||
              platform === 'teams' ||
              platform === 'meet'
            ) {
              return <Video className="w-3 h-3" />;
            }
            if (platform === 'in_person') {
              return <MapPin className="w-3 h-3" />;
            }
            return <Calendar className="w-3 h-3" />;
          };

          return (
            <div className="space-y-3">
              {meetings.length > 0 ? (
                meetings.map((meeting: any) => (
                  <div
                    key={meeting.id}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white text-sm font-medium flex items-center gap-2">
                        {getMeetingIcon(meeting.platform)}
                        {meeting.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {getMeetingBadge(meeting.startTime)}
                      </Badge>
                    </div>
                    <p className="text-white/60 text-xs">
                      {formatMeetingTime(meeting.startTime, meeting.endTime)}
                    </p>
                    {meeting.location?.type === 'physical' && meeting.location.roomName && (
                      <p className="text-white/40 text-xs mt-1">
                        Location: {meeting.location.roomName}
                      </p>
                    )}
                    {isAdmin && meeting.clientName && (
                      <p className="text-white/40 text-xs mt-1">Client: {meeting.clientName}</p>
                    )}
                    {!isAdmin && meeting.participants.length > 0 && (
                      <p className="text-white/40 text-xs mt-1">
                        With:{' '}
                        {meeting.participants.find((p: any) => p.role === 'organizer')?.name ||
                          'GroeimetAI Team'}
                      </p>
                    )}
                    {meeting.meetingLink && (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange text-xs mt-2 inline-flex items-center gap-1 hover:underline"
                      >
                        Join Meeting
                        <Video className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 text-sm mb-4">No upcoming meetings scheduled</p>
                  <Link href="/dashboard/consultations">
                    <Button variant="outline" size="sm">
                      {isAdmin ? 'Schedule Meeting' : 'Book Consultation'}
                    </Button>
                  </Link>
                </div>
              )}

              {meetings.length > 0 && (
                <Link href="/dashboard/consultations">
                  <Button variant="outline" className="w-full" size="sm">
                    {isAdmin ? 'View All Meetings' : 'View All Consultations'}
                  </Button>
                </Link>
              )}
            </div>
          );

        case 'tasks':
          return (
            <div className="space-y-2">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-white text-sm">Review project proposal</span>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-white text-sm">Approve timeline changes</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          );

        case 'projectTimeline':
          // Default timeline stages with proper icons
          const defaultStages = [
            {
              id: 1,
              name: 'Approval',
              icon: 'shield',
              status: 'current',
              description: 'Awaiting admin approval',
            },
            {
              id: 2,
              name: 'Discovery',
              icon: 'briefcase',
              status: 'upcoming',
              description: 'Understanding your needs',
            },
            {
              id: 3,
              name: 'Planning',
              icon: 'target',
              status: 'upcoming',
              description: 'Defining project scope',
            },
            {
              id: 4,
              name: 'Development',
              icon: 'rocket',
              status: 'upcoming',
              description: 'Building your solution',
            },
            {
              id: 5,
              name: 'Delivery',
              icon: 'flag',
              status: 'upcoming',
              description: 'Final implementation',
            },
          ];

          const stages =
            widgetData.timelineStages?.length > 0 ? widgetData.timelineStages : defaultStages;
          const currentStage = stages.find((stage: any) => stage.status === 'current');
          const completedCount = stages.filter((stage: any) => stage.status === 'completed').length;
          const currentStageProgress = currentStage?.progress || 0;
          const totalProgress =
            widgetData.timelineProgress !== undefined
              ? widgetData.timelineProgress
              : (completedCount * 100 + currentStageProgress) / stages.length;

          // Map icon strings to components
          const stageIcons = {
            shield: Shield,
            briefcase: Briefcase,
            target: Target,
            rocket: Rocket,
            flag: Flag,
          };

          // Check if user has no projects
          if (!widgetData.projectId && widgetData.timelineStages?.length === 0) {
            return (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Briefcase className="w-16 h-16 text-white/20 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Active Projects</h3>
                <p className="text-white/60 text-sm mb-6">
                  Request a project to see your progress timeline here
                </p>
                <Link href="/contact?type=project">
                  <Button className="bg-orange hover:bg-orange/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Request New Project
                  </Button>
                </Link>
              </div>
            );
          }

          return (
            <div className="h-full flex flex-col">
              {/* Project Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {widgetData.projectName || 'Project Timeline'}
                </h3>
                <Badge variant="outline" className="text-orange border-orange mt-2">
                  {currentStage?.name || 'Planning'}
                </Badge>
              </div>

              {/* Overall Progress */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/60">Overall Progress</span>
                  <span className="text-sm font-medium text-white">
                    {Math.round(totalProgress)}%
                  </span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>

              {/* Timeline Stages */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {stages.map((stage: any, index: number) => {
                  const StageIcon = stageIcons[stage.icon as keyof typeof stageIcons] || Briefcase;

                  return (
                    <div key={stage.id || index} className="relative">
                      {/* Connection Line */}
                      {index < stages.length - 1 && (
                        <div
                          className={`absolute left-5 top-10 bottom-0 w-0.5 ${
                            stage.status === 'completed' ? 'bg-green-500' : 'bg-white/20'
                          }`}
                        />
                      )}

                      <div className="flex items-start space-x-4">
                        {/* Stage Icon */}
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                            stage.status === 'completed'
                              ? 'bg-green-500'
                              : stage.status === 'current'
                                ? 'bg-orange'
                                : 'bg-white/20'
                          }`}
                        >
                          {stage.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : stage.status === 'current' ? (
                            <Circle className="w-5 h-5 text-white animate-pulse" />
                          ) : (
                            <StageIcon className="w-5 h-5 text-white/60" />
                          )}
                        </div>

                        {/* Stage Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`font-medium ${
                                stage.status === 'completed'
                                  ? 'text-white'
                                  : stage.status === 'current'
                                    ? 'text-white'
                                    : 'text-white/60'
                              }`}
                            >
                              {stage.name}
                            </h4>
                          </div>
                          <p className="text-sm text-white/60 mt-1">{stage.description}</p>

                          {/* Stage Progress Bar (for current stage) */}
                          {stage.status === 'current' && stage.progress && (
                            <div className="mt-2">
                              <Progress value={stage.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next Milestone */}
              {(widgetData.milestone || !widgetData.timelineStages) && (
                <div className="mt-4 p-4 bg-orange/10 rounded-lg border border-orange/20">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange" />
                    <div>
                      <p className="text-sm font-medium text-white">Next Milestone</p>
                      <p className="text-xs text-white/60">
                        {widgetData.milestone ||
                          'Your project timeline will be updated once your request is approved'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* View Project Button */}
              {widgetData.projectId ? (
                <Link href={`/dashboard/projects/${widgetData.projectId}`} className="mt-4 block">
                  <Button variant="outline" className="w-full" size="sm">
                    View Project Details
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard/projects" className="mt-4 block">
                  <Button variant="outline" className="w-full" size="sm">
                    View All Projects
                  </Button>
                </Link>
              )}
            </div>
          );

        case 'messages':
          // Use a component for complex messaging widget
          return (
            <div className="h-full">
              <MessagingWidget isAdmin={isAdmin} widgetData={widgetData} user={user} />
            </div>
          );

        case 'documents':
          return (
            <div className="space-y-3">
              {widgetData.recentDocuments?.map((doc: any) => (
                <div key={doc.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-orange" />
                      <div>
                        <p className="text-white text-sm font-medium">{doc.name}</p>
                        <p className="text-white/60 text-xs">
                          {doc.type} • {doc.date}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Link href="/dashboard/documents">
                <Button variant="outline" className="w-full" size="sm">
                  View All Documents
                </Button>
              </Link>
            </div>
          );

        case 'revenue':
          return (
            <div className="space-y-4 overflow-y-auto h-full">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  €{widgetData.totalRevenue?.toLocaleString() || '0'}
                </p>
                <p className="text-white/60 text-sm">Total Revenue</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xl font-semibold text-green-400">
                    €{widgetData.monthlyRevenue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-white/60 text-xs">This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-orange">
                    €{widgetData.pendingRevenue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-white/60 text-xs">Pending</p>
                </div>
              </div>

              <Progress value={widgetData.revenueGrowth || 0} className="h-2" />
              <p className="text-white/60 text-xs text-center">
                {widgetData.revenueGrowth || 0}% growth vs last month
              </p>
            </div>
          );

        default:
          return null;
      }
    };

    // Top widgets (project/messages) always span full width in their container
    const widgetSizeClass = isTopWidget
      ? 'col-span-1' // Full width in 2-column grid
      : widget.size === 'small'
        ? 'col-span-1 h-[250px]' // Fixed height for small widgets
        : 'col-span-1';

    return (
      <div key={widget.id} className={`${widgetSizeClass}`}>
        <Card
          className={`bg-white/5 border-white/10 h-full flex flex-col ${
            isTopWidget
              ? 'min-h-[650px]'
              : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">{widget.title}</CardTitle>
            <div className="flex items-center gap-1">
              {widget.type === 'messages' && (
                <Link href="/dashboard/messages" title="Open full messages page">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white/60 hover:text-white"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent
            className={`flex-1 ${widget.type === 'messages' || widget.type === 'projectProgress' || widget.type === 'recentActivity' ? 'p-0 overflow-hidden' : 'p-6 pt-0'}`}
          >
            <WidgetContent />
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Widget Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isAdmin ? 'Operations Dashboard' : 'Your Project Dashboard'}
        </h2>
        <div className="flex items-center gap-3">{/* Customization removed - static layout */}</div>
      </div>

      {/* Widgets Grid */}
      {(() => {
        // Separate top widgets (project/messages) from other widgets
        const topWidgetTypes = isAdmin
          ? ['projectProgress', 'messages']
          : ['projectTimeline', 'messages'];
        const topWidgets = widgets.filter((w) => topWidgetTypes.includes(w.type));
        const otherWidgets = widgets.filter((w) => !topWidgetTypes.includes(w.type));

        return (
          <div className="space-y-6" data-help="dashboard-widgets-grid">
            {/* Top row - Project and Messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {topWidgets.map((widget) => (
                  <motion.div
                    key={widget.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    {renderWidget(widget, true)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Other widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {otherWidgets.map((widget) => (
                  <motion.div
                    key={widget.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    {renderWidget(widget, false)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })()}

      {/* Empty State */}

      {/* Project Request Dialog */}
      <ProjectRequestDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
    </div>
  );
}
