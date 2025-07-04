'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  content: string;
  createdAt: Timestamp | null;
}

export default function DashboardChat() {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to messages
  useEffect(() => {
    if (!user || !user.uid) {
      setIsLoading(false);
      return;
    }

    const chatChannelId = `support_${user.uid}`;
    if (!chatChannelId) return;

    let unsubscribe: (() => void) | undefined;

    // Create chat channel document if it doesn't exist
    const initializeChatChannel = async () => {
      try {
        const channelRef = doc(db, 'supportChats', chatChannelId);
        const channelDoc = await getDoc(channelRef);
        
        if (!channelDoc.exists()) {
          await setDoc(channelRef, {
            userId: user.uid,
            userName: user.displayName || user.email,
            userEmail: user.email,
            createdAt: serverTimestamp(),
            lastMessageAt: serverTimestamp(),
            status: 'active'
          });
        }

        // Subscribe to messages only after channel exists
        const messagesRef = collection(db, 'supportChats', chatChannelId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        unsubscribe = onSnapshot(
          q, 
          (snapshot) => {
            const newMessages: Message[] = [];
            snapshot.forEach((doc) => {
              newMessages.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(newMessages);
            setIsLoading(false);
          },
          (error) => {
            console.error('Error subscribing to messages:', error);
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('Error initializing chat channel:', error);
        setIsLoading(false);
      }
    };

    initializeChatChannel();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, isAdmin]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const chatChannelId = `support_${user.uid}`;
    if (!chatChannelId) return;

    setIsSending(true);
    try {
      // Add message to subcollection
      const messagesRef = collection(db, 'supportChats', chatChannelId, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.displayName || user.email,
        senderRole: isAdmin ? 'admin' : 'user',
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
      });

      // Update last message timestamp
      const channelRef = doc(db, 'supportChats', chatChannelId);
      await setDoc(channelRef, {
        lastMessageAt: serverTimestamp(),
        lastMessage: newMessage.trim(),
        lastMessageBy: user.uid
      }, { merge: true });

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
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Support Chat</h2>
        <p className="text-sm text-white/60">Chat with our team for quick assistance</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange" />
            </div>
          )}
          
          {!isLoading && messages.length === 0 && (
            <div className="text-center text-white/40 py-8">
              <p>Start a conversation with our support team!</p>
              <p className="text-sm mt-2">We typically respond within a few hours.</p>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwnMessage = msg.senderId === user?.uid;
              const isAdminMessage = msg.senderRole === 'admin';
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start space-x-3 ${
                    isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={isAdminMessage ? 'bg-green/20 text-green' : 'bg-orange/20 text-orange'}>
                      {isAdminMessage ? 'AI' : getInitials(msg.senderName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 ${isOwnMessage ? 'flex justify-end' : ''}`}>
                    <div
                      className={`inline-block rounded-lg p-3 max-w-[80%] ${
                        isOwnMessage
                          ? 'bg-orange text-white'
                          : isAdminMessage
                          ? 'bg-green/20 text-white border border-green/30'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-medium mb-1 opacity-80">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
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