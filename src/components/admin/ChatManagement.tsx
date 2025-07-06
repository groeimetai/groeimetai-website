'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  Timestamp,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { notificationService } from '@/services/notificationService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, MessageSquare, User, Clock, ChevronLeft, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatChannel {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage?: string;
  lastMessageAt: Timestamp | null;
  status: 'active' | 'resolved';
  unreadCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  content: string;
  createdAt: Timestamp | null;
}

export default function ChatManagement() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Subscribe to all support chat channels
  useEffect(() => {
    if (!user) return;

    const channelsRef = collection(db, 'supportChats');
    const q = query(channelsRef, orderBy('lastMessageAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newChannels: ChatChannel[] = [];
        snapshot.forEach((doc) => {
          newChannels.push({ id: doc.id, ...doc.data() } as ChatChannel);
        });
        setChannels(newChannels);
        setIsLoadingChannels(false);
      },
      (error) => {
        console.error('Error loading chat channels:', error);
        setIsLoadingChannels(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to messages for selected channel
  useEffect(() => {
    if (!selectedChannel) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    const messagesRef = collection(db, 'supportChats', selectedChannel.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages: Message[] = [];
        snapshot.forEach((doc) => {
          newMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(newMessages);
        setIsLoadingMessages(false);
      },
      (error) => {
        console.error('Error loading messages:', error);
        setIsLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [selectedChannel]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChannel || !user) return;

    setIsSending(true);
    try {
      // Add message to subcollection
      const messagesRef = collection(db, 'supportChats', selectedChannel.id, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.displayName || 'GroeimetAI Support',
        senderRole: 'admin',
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
      });

      // Update last message timestamp
      const channelRef = doc(db, 'supportChats', selectedChannel.id);
      await setDoc(
        channelRef,
        {
          lastMessageAt: serverTimestamp(),
          lastMessage: newMessage.trim(),
          lastMessageBy: user.uid,
        },
        { merge: true }
      );

      // Send notification to the user
      const notificationData = notificationService.templates.newMessage(
        user.displayName || 'Support Team'
      );

      await notificationService.sendToUser(selectedChannel.userId, {
        ...notificationData,
        link: '/dashboard',
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Just now';
    try {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    } catch {
      return 'Just now';
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

  const filteredChannels = channels.filter(
    (channel) =>
      channel.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Channel list view
  if (!selectedChannel) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white mb-2">Support Chats</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoadingChannels && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange" />
            </div>
          )}

          {!isLoadingChannels && filteredChannels.length === 0 && (
            <div className="text-center text-white/40 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active chats</p>
            </div>
          )}

          <div className="divide-y divide-white/10">
            {filteredChannels.map((channel) => (
              <motion.button
                key={channel.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSelectedChannel(channel)}
                className="w-full p-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-orange/20 text-orange">
                      {getInitials(channel.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-white truncate">{channel.userName}</h3>
                      <span className="text-xs text-white/40">
                        {formatMessageTime(channel.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 truncate">{channel.userEmail}</p>
                    {channel.lastMessage && (
                      <p className="text-sm text-white/40 truncate mt-1">{channel.lastMessage}</p>
                    )}
                  </div>
                  {channel.status === 'active' && (
                    <Badge variant="outline" className="text-green-500 border-green-500/30">
                      Active
                    </Badge>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Chat view
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedChannel(null)}
            className="text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h3 className="font-medium text-white">{selectedChannel.userName}</h3>
            <p className="text-sm text-white/60">{selectedChannel.userEmail}</p>
          </div>
          <Badge variant="outline" className="text-green-500 border-green-500/30">
            Active
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoadingMessages && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange" />
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAdminMessage = msg.senderRole === 'admin';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start space-x-3 ${
                    isAdminMessage ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={
                        isAdminMessage ? 'bg-green/20 text-green' : 'bg-orange/20 text-orange'
                      }
                    >
                      {isAdminMessage ? 'AI' : getInitials(msg.senderName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex-1 ${isAdminMessage ? 'flex justify-end' : ''}`}>
                    <div
                      className={`inline-block rounded-lg p-3 max-w-[80%] ${
                        isAdminMessage
                          ? 'bg-green/20 text-white border border-green/30'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-80">{msg.senderName}</p>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-60">{formatMessageTime(msg.createdAt)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-orange hover:bg-orange/90"
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
