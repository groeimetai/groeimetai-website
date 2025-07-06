'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Search,
  Filter,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@/i18n/routing';
import { collection, query, orderBy, onSnapshot, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminSupportChat from '@/components/AdminSupportChat';

interface SupportChat {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
  lastMessage?: string;
  lastMessageBy?: string;
  status: 'active' | 'resolved' | 'waiting';
  unreadCount?: number;
}

interface ChatWithUser extends SupportChat {
  userDetails?: {
    displayName: string;
    email: string;
    photoURL?: string;
  };
}

export default function AdminSupportPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedChat, setSelectedChat] = useState<ChatWithUser | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch all support chats
  const fetchSupportChats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const chatsQuery = query(collection(db, 'supportChats'), orderBy('lastMessageAt', 'desc'));

      const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
        const chatsData: ChatWithUser[] = [];

        // Fetch user details for each chat
        for (const chatDoc of snapshot.docs) {
          const chatData = { id: chatDoc.id, ...chatDoc.data() } as SupportChat;
          const chatWithUser: ChatWithUser = { ...chatData };

          // Try to get user details
          if (chatData.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', chatData.userId));
              if (userDoc.exists()) {
                chatWithUser.userDetails = userDoc.data() as ChatWithUser['userDetails'];
              }
            } catch (err) {
              console.log('Could not fetch user details for', chatData.userId);
            }
          }

          chatsData.push(chatWithUser);
        }

        setChats(chatsData);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error fetching support chats:', err);
      setError('Failed to load support chats. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    } else if (!authLoading && isAdmin) {
      fetchSupportChats();
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto"></div>
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'waiting':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      searchTerm === '' ||
      chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: chats.length,
    active: chats.filter((c) => c.status === 'active').length,
    waiting: chats.filter((c) => c.status === 'waiting').length,
    resolved: chats.filter((c) => c.status === 'resolved').length,
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Admin Dashboard
          </Link>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Support Chats</h1>
              <p className="text-white/60 mt-2">Manage all customer support conversations</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Chats</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-orange" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Waiting</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.waiting}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-gray-500">{stats.resolved}</p>
              </div>
              <Circle className="w-8 h-8 text-gray-500" />
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' ? 'bg-orange' : ''}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
              className={statusFilter === 'active' ? 'bg-orange' : ''}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'waiting' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('waiting')}
              className={statusFilter === 'waiting' ? 'bg-orange' : ''}
            >
              Waiting
            </Button>
            <Button
              variant={statusFilter === 'resolved' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('resolved')}
              className={statusFilter === 'resolved' ? 'bg-orange' : ''}
            >
              Resolved
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange animate-spin" />
          </div>
        )}

        {/* Chats List */}
        {!isLoading && filteredChats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedChat(chat);
                  setIsChatOpen(true);
                }}
                className="cursor-pointer"
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
                        <span className="text-orange font-medium">
                          {chat.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{chat.userName}</h3>
                        <p className="text-sm text-white/60">{chat.userEmail}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(chat.status)} bg-opacity-20 border-0`}
                    >
                      {chat.status}
                    </Badge>
                  </div>

                  {chat.lastMessage && (
                    <p className="text-sm text-white/80 line-clamp-2 mb-3">{chat.lastMessage}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>
                      Last activity:{' '}
                      {chat.lastMessageAt &&
                        formatDistanceToNow(chat.lastMessageAt.toDate(), { addSuffix: true })}
                    </span>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <Badge className="bg-orange text-white">{chat.unreadCount}</Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredChats.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-24 h-24 text-white/20 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-2">No support chats found</h3>
            <p className="text-white/60">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No support conversations have been started yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Support Chat - {selectedChat?.userName}</DialogTitle>
          </DialogHeader>
          {selectedChat && (
            <div className="h-full flex flex-col">
              <AdminSupportChat
                chatId={selectedChat.id}
                userId={selectedChat.userId}
                userName={selectedChat.userName}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
