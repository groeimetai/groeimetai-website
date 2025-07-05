'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isGroeimetAI: boolean;
  };
  attachments?: Attachment[];
}

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  lastMessage: Message;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  projectName?: string;
  subject?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with Firebase queries
  const mockConversations: Conversation[] = useMemo(() => [
    {
      id: '1',
      participants: [
        {
          id: 'groeimetai-team',
          name: 'GroeimetAI Team',
          email: 'team@groeimetai.com',
          avatar: '/logo.png',
        },
      ],
      lastMessage: {
        id: 'm1',
        content: 'Welcome to GroeimetAI! We\'re excited to work with you on your AI transformation journey.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: true,
        sender: {
          id: 'groeimetai-team',
          name: 'GroeimetAI Team',
          email: 'team@groeimetai.com',
          isGroeimetAI: true,
        },
      },
      unreadCount: 0,
      isStarred: true,
      isArchived: false,
      subject: 'Welcome to GroeimetAI',
    },
    {
      id: '2',
      participants: [
        {
          id: 'project-manager',
          name: 'Sarah Chen',
          email: 'sarah@groeimetai.com',
        },
      ],
      lastMessage: {
        id: 'm2',
        content: 'I\'ve reviewed your project requirements and prepared a detailed timeline. Let\'s discuss this in our next meeting.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: false,
        sender: {
          id: 'project-manager',
          name: 'Sarah Chen',
          email: 'sarah@groeimetai.com',
          isGroeimetAI: true,
        },
      },
      unreadCount: 2,
      isStarred: false,
      isArchived: false,
      projectName: 'E-commerce AI Integration',
      subject: 'Project Timeline Update',
    },
    {
      id: '3',
      participants: [
        {
          id: 'tech-lead',
          name: 'Michael Brown',
          email: 'michael@groeimetai.com',
        },
      ],
      lastMessage: {
        id: 'm3',
        content: 'The API integration is complete. Please review the documentation attached.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        isRead: true,
        sender: {
          id: 'tech-lead',
          name: 'Michael Brown',
          email: 'michael@groeimetai.com',
          isGroeimetAI: true,
        },
        attachments: [
          {
            id: 'att1',
            name: 'API_Documentation.pdf',
            size: 2048000,
            type: 'application/pdf',
            url: '#',
          },
        ],
      },
      unreadCount: 0,
      isStarred: false,
      isArchived: false,
      projectName: 'Data Analytics Dashboard',
      subject: 'API Integration Complete',
    },
  ], []);

  // Load conversations
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Simulate loading conversations
      setTimeout(() => {
        setConversations(mockConversations);
        setIsLoading(false);
      }, 1000);
    }
  }, [user, loading, router, mockConversations]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = 
      conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase());

    switch (filter) {
      case 'unread':
        return matchesSearch && conv.unreadCount > 0;
      case 'starred':
        return matchesSearch && conv.isStarred;
      case 'archived':
        return matchesSearch && conv.isArchived;
      default:
        return matchesSearch && !conv.isArchived;
    }
  });

  // Load messages for selected conversation
  const loadMessages = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mock messages - replace with Firebase query
    const mockMessages: Message[] = [
      {
        id: 'm1',
        content: conversation.lastMessage.content,
        timestamp: conversation.lastMessage.timestamp,
        isRead: true,
        sender: conversation.lastMessage.sender,
        attachments: conversation.lastMessage.attachments,
      },
      {
        id: 'm2',
        content: 'Thank you for reaching out! I\'d be happy to help with your questions.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: true,
        sender: {
          id: user?.uid || '',
          name: user?.displayName || 'You',
          email: user?.email || '',
          isGroeimetAI: false,
        },
      },
      {
        id: 'm3',
        content: 'Great! I\'ve prepared some initial recommendations for your project. Let me share the key points with you.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isRead: true,
        sender: conversation.lastMessage.sender,
      },
    ];

    setMessages(mockMessages);
    
    // Mark conversation as read
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
          : conv
      )
    );
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    
    try {
      const message: Message = {
        id: `m${Date.now()}`,
        content: newMessage,
        timestamp: new Date(),
        isRead: false,
        sender: {
          id: user.uid,
          name: user.displayName || 'You',
          email: user.email || '',
          isGroeimetAI: false,
        },
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate response after 2 seconds
      setTimeout(() => {
        const response: Message = {
          id: `m${Date.now() + 1}`,
          content: 'Thank you for your message! Our team will respond within 24 hours during business hours.',
          timestamp: new Date(),
          isRead: false,
          sender: selectedConversation.lastMessage.sender,
        };
        setMessages(prev => [...prev, response]);
      }, 2000);

      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Format timestamp
  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday ' + format(date, 'h:mm a');
    }
    return format(date, 'MMM d, h:mm a');
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Toggle star
  const toggleStar = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, isStarred: !conv.isStarred } : conv
      )
    );
  };

  // Archive conversation
  const archiveConversation = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, isArchived: !conv.isArchived } : conv
      )
    );
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
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
                      onClick={() => loadMessages(conversation)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-orange/20 text-orange">
                              {conversation.participants[0].name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-white">
                                {conversation.participants[0].name}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-orange text-white px-1.5 py-0 text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              {conversation.isStarred && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            {conversation.subject && (
                              <p className="text-sm text-white/80">{conversation.subject}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-white/60 line-clamp-1 mb-1">
                        {conversation.lastMessage.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">
                          {formatMessageTime(conversation.lastMessage.timestamp)}
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
                    <AvatarFallback className="bg-orange/20 text-orange">
                      {selectedConversation.participants[0].name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-white">
                      {selectedConversation.participants[0].name}
                    </h3>
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
                      <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-white/10">
                      <DropdownMenuItem
                        onClick={() => archiveConversation(selectedConversation.id)}
                        className="text-white hover:bg-white/10"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {selectedConversation.isArchived ? 'Unarchive' : 'Archive'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.sender.isGroeimetAI ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          message.sender.isGroeimetAI
                            ? 'bg-white/10'
                            : 'bg-orange/20'
                        } rounded-lg p-4`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-white">
                            {message.sender.name}
                          </span>
                          <span className="text-xs text-white/40">
                            {formatMessageTime(message.timestamp)}
                          </span>
                          {message.isRead && !message.sender.isGroeimetAI && (
                            <CheckCheck className="w-3 h-3 text-blue-400" />
                          )}
                        </div>
                        <p className="text-white/90">{message.content}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center justify-between bg-white/5 rounded p-2"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-white/60" />
                                  <div>
                                    <p className="text-sm text-white">{attachment.name}</p>
                                    <p className="text-xs text-white/40">
                                      {formatFileSize(attachment.size)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-white/60 hover:text-white"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:text-white"
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
                    disabled={!newMessage.trim() || isSending}
                    className="bg-orange hover:bg-orange/90"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                <p className="text-white/60">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}