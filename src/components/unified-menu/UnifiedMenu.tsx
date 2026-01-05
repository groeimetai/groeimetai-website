'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  MessageSquare,
  Search,
  Filter,
  MoreHorizontal,
  X,
  CheckCheck,
  Star,
  Archive,
  Trash2,
  Reply,
  ExternalLink,
  Loader2,
  RefreshCw,
  Circle,
  AlertCircle,
  Clock,
  Send,
  type LucideIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUnifiedMenuContext } from './UnifiedMenuProvider';
import { UnifiedItem, MessageItem, NotificationItem } from '@/types/unified-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface UnifiedMenuProps {
  className?: string;
  variant?: 'default' | 'compact';
  placement?: 'left' | 'right';
}

export function UnifiedMenu({ className, variant = 'default', placement = 'right' }: UnifiedMenuProps) {
  const {
    state,
    items,
    isLoading,
    badges,
    actions,
    openMenu,
    closeMenu,
    setActiveTab,
    setSearchQuery,
    setFilter,
    refresh,
    quickReply,
    quickAction,
  } = useUnifiedMenuContext();

  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [isQuickReplying, setIsQuickReplying] = useState(false);

  // Filter items based on active tab and search
  const filteredItems = items.filter(item => {
    // Tab filter
    if (state.activeTab === 'messages' && item.type !== 'message') return false;
    if (state.activeTab === 'notifications' && item.type !== 'notification') return false;

    // Search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesContent = item.content.toLowerCase().includes(query);
      const matchesSender = item.type === 'message' &&
        (item as MessageItem).senderName.toLowerCase().includes(query);

      if (!matchesTitle && !matchesContent && !matchesSender) return false;
    }

    // Status filters
    switch (state.filter) {
      case 'unread':
        return !item.isRead;
      case 'priority':
        return item.priority === 'high';
      case 'actionRequired':
        return item.actionRequired;
      default:
        return true;
    }
  });

  // Group items by date for better organization
  const groupedItems = filteredItems.reduce((groups, item) => {
    const date = item.timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey = '';
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, UnifiedItem[]>);

  // Handle quick reply
  const handleQuickReply = async (messageId: string) => {
    if (!quickReplyText.trim()) return;

    setIsQuickReplying(true);
    try {
      await quickReply(messageId, quickReplyText);
      setQuickReplyText('');
      setSelectedItem(null);
    } catch (error) {
      console.error('Quick reply error:', error);
    } finally {
      setIsQuickReplying(false);
    }
  };

  // Get icon for item type
  const getItemIcon = (item: UnifiedItem): LucideIcon => {
    if (item.type === 'message') {
      return MessageSquare;
    }

    const notificationItem = item as NotificationItem;
    switch (notificationItem.notificationType) {
      case 'quote':
        return Circle;
      case 'project':
        return Circle;
      case 'payment':
        return Circle;
      case 'meeting':
        return Clock;
      case 'system':
        return Bell;
      default:
        return Bell;
    }
  };

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange';
      case 'low':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Sheet open={state.isOpen} onOpenChange={(open) => open ? openMenu() : closeMenu()}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          onClick={openMenu}
        >
          <Bell className="h-5 w-5" />
          {badges.totalUnread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-orange text-white text-xs rounded-full flex items-center justify-center font-medium"
            >
              {badges.totalUnread > 99 ? '99+' : badges.totalUnread}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side={placement}
        className="w-full sm:max-w-lg bg-black/95 border-white/20 p-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Messages & Notifications
              </SheetTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refresh}
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => actions.markAllAsRead()}>
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Mark all as read
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => actions.markAllAsRead('message')}>
                      Mark all messages as read
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => actions.markAllAsRead('notification')}>
                      Mark all notifications as read
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>{badges.messagesUnread} unread messages</span>
              <span>{badges.notificationsUnread} unread notifications</span>
              {badges.actionRequiredCount > 0 && (
                <span className="text-orange">{badges.actionRequiredCount} need action</span>
              )}
            </div>
          </SheetHeader>

          {/* Search and Filters */}
          <div className="px-6 py-4 space-y-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search messages and notifications..."
                value={state.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-white/20">
                    <Filter className="h-4 w-4 mr-2" />
                    {state.filter === 'all' ? 'All' :
                     state.filter === 'unread' ? 'Unread' :
                     state.filter === 'priority' ? 'Priority' : 'Action Required'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All items
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')}>
                    Unread only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('priority')}>
                    High priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('actionRequired')}>
                    Action required
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={state.activeTab} onValueChange={(tab) => setActiveTab(tab as any)} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-6 mt-4">
              <TabsTrigger value="messages" className="relative">
                Messages
                {badges.messagesUnread > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {badges.messagesUnread > 9 ? '9+' : badges.messagesUnread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="relative">
                Notifications
                {badges.notificationsUnread > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {badges.notificationsUnread > 9 ? '9+' : badges.notificationsUnread}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="flex-1 mt-4">
              <UnifiedItemsList
                items={filteredItems.filter(item => item.type === 'message')}
                groupedItems={groupedItems}
                isLoading={isLoading}
                onItemClick={setSelectedItem}
                onQuickAction={quickAction}
                getItemIcon={getItemIcon}
                getPriorityColor={getPriorityColor}
              />
            </TabsContent>

            <TabsContent value="notifications" className="flex-1 mt-4">
              <UnifiedItemsList
                items={filteredItems.filter(item => item.type === 'notification')}
                groupedItems={groupedItems}
                isLoading={isLoading}
                onItemClick={setSelectedItem}
                onQuickAction={quickAction}
                getItemIcon={getItemIcon}
                getPriorityColor={getPriorityColor}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick Reply Dialog */}
        <Dialog
          open={!!selectedItem && selectedItem.type === 'message'}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        >
          <DialogContent className="bg-black/95 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Quick Reply</DialogTitle>
            </DialogHeader>
            {selectedItem && selectedItem.type === 'message' && (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/80 text-sm">{selectedItem.content}</p>
                  <p className="text-white/40 text-xs mt-2">
                    From: {(selectedItem as MessageItem).senderName}
                  </p>
                </div>
                <Textarea
                  placeholder="Type your reply..."
                  value={quickReplyText}
                  onChange={(e) => setQuickReplyText(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleQuickReply(selectedItem.id)}
                    disabled={!quickReplyText.trim() || isQuickReplying}
                  >
                    {isQuickReplying ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Reply
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

// Separate component for items list to reduce complexity
interface UnifiedItemsListProps {
  items: UnifiedItem[];
  groupedItems: Record<string, UnifiedItem[]>;
  isLoading: boolean;
  onItemClick: (item: UnifiedItem) => void;
  onQuickAction: (itemId: string, action: string) => void;
  getItemIcon: (item: UnifiedItem) => React.ComponentType;
  getPriorityColor: (priority?: string) => string;
}

function UnifiedItemsList({
  items,
  groupedItems,
  isLoading,
  onItemClick,
  onQuickAction,
  getItemIcon,
  getPriorityColor,
}: UnifiedItemsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/60">
        <Bell className="h-12 w-12 mb-4 opacity-20" />
        <p>No items to display</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-6">
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([date, groupItems]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-white/60 mb-3">{date}</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {groupItems.map((item) => {
                  const Icon = getItemIcon(item);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={cn(
                        "group p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-white/5",
                        item.isRead
                          ? "bg-white/5 border-white/10"
                          : "bg-orange/10 border-orange/30"
                      )}
                      onClick={() => onItemClick(item)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          item.isRead ? "bg-white/5" : "bg-orange/20"
                        )}>
                          <Icon {...{ className: cn("h-4 w-4", getPriorityColor(item.priority)) } as React.ComponentProps<typeof Icon>} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={cn(
                              "font-medium text-sm truncate",
                              item.isRead ? "text-white/80" : "text-white"
                            )}>
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.actionRequired && (
                                <AlertCircle className="h-3 w-3 text-orange" />
                              )}
                              <span className="text-xs text-white/40">
                                {formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true })}
                              </span>
                            </div>
                          </div>

                          <p className="text-white/60 text-sm mt-1 line-clamp-2">
                            {item.content}
                          </p>

                          {item.type === 'message' && (
                            <p className="text-white/40 text-xs mt-2">
                              From: {(item as MessageItem).senderName}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              {item.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">
                                  High Priority
                                </Badge>
                              )}
                              {item.actionRequired && (
                                <Badge variant="outline" className="text-xs border-orange text-orange">
                                  Action Required
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickAction(item.id, item.isRead ? 'markUnread' : 'markRead');
                                }}
                              >
                                <CheckCheck className="h-3 w-3" />
                              </Button>

                              {item.type === 'message' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onItemClick(item);
                                  }}
                                >
                                  <Reply className="h-3 w-3" />
                                </Button>
                              )}

                              {item.link && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = item.link!;
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onQuickAction(item.id, 'star')}>
                                    <Star className="h-4 w-4 mr-2" />
                                    Star
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onQuickAction(item.id, 'archive')}>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onQuickAction(item.id, 'delete')}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}