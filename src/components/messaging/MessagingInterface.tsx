'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

const conversations = [
  {
    id: 1,
    name: 'Sarah Chen',
    company: 'TechCorp Solutions',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Thanks for the AI implementation proposal!',
    timestamp: '2 min ago',
    unread: 3,
    online: true,
    project: 'AI Chatbot Integration',
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    company: 'Global Finance Inc',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'Can we schedule a follow-up call?',
    timestamp: '1 hour ago',
    unread: 0,
    online: false,
    project: 'ServiceNow Migration',
  },
  {
    id: 3,
    name: 'Emma Thompson',
    company: 'Healthcare Plus',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'The RAG architecture looks promising',
    timestamp: 'Yesterday',
    unread: 0,
    online: true,
    project: 'RAG Architecture Setup',
  },
];

const messages = [
  {
    id: 1,
    sender: 'Sarah Chen',
    content: 'Hi! I wanted to discuss the AI chatbot integration proposal you sent.',
    timestamp: '10:00 AM',
    type: 'received',
    read: true,
  },
  {
    id: 2,
    sender: 'You',
    content: 'Of course! I\'d be happy to go over the details. Which aspects would you like to focus on?',
    timestamp: '10:05 AM',
    type: 'sent',
    read: true,
  },
  {
    id: 3,
    sender: 'Sarah Chen',
    content: 'I\'m particularly interested in the multi-agent orchestration system you mentioned. Can you elaborate on how it would work for our customer service use case?',
    timestamp: '10:08 AM',
    type: 'received',
    read: true,
  },
  {
    id: 4,
    sender: 'You',
    content: 'Absolutely! The multi-agent system would consist of specialized AI agents:\n\n1. Query Understanding Agent - Analyzes customer intent\n2. Knowledge Retrieval Agent - Searches your documentation\n3. Response Generation Agent - Creates personalized responses\n4. Quality Assurance Agent - Ensures accuracy\n\nThey work together through a shared memory pool for optimal results.',
    timestamp: '10:15 AM',
    type: 'sent',
    read: true,
  },
  {
    id: 5,
    sender: 'Sarah Chen',
    content: 'Thanks for the AI implementation proposal! This sounds exactly like what we need.',
    timestamp: '10:18 AM',
    type: 'received',
    read: false,
  },
];

export default function MessagingInterface() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const sendMessage = () => {
    if (!messageText.trim()) return;
    
    // TODO: Implement actual message sending
    console.log('Sending message:', messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-background rounded-lg border border-border overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-border bg-card">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="h-[calc(100%-5rem)]">
          <div className="p-2">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  selectedConversation.id === conversation.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conversation.avatar} alt={conversation.name} />
                      <AvatarFallback>{conversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium truncate">{conversation.name}</h4>
                      <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.company}</p>
                    <p className="text-sm truncate mt-1">{conversation.lastMessage}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {conversation.project}
                    </Badge>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                <AvatarFallback>{selectedConversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{selectedConversation.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedConversation.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.type === 'sent' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === 'sent'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-2 mt-1 ${
                      message.type === 'sent' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      {message.type === 'sent' && (
                        message.read ? (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Check className="h-3 w-3 text-muted-foreground" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="bg-muted p-3 rounded-lg">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <Textarea
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[40px] max-h-[120px] resize-none"
                rows={1}
              />
            </div>
            <Button 
              onClick={sendMessage}
              disabled={!messageText.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}