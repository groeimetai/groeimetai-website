'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedMenuContext } from './UnifiedMenuProvider';
import { cn } from '@/lib/utils';

interface UnifiedMenuBadgeProps {
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  showLabels?: boolean;
  showSeparateCounts?: boolean;
}

export function UnifiedMenuBadge({
  className,
  variant = 'default',
  showLabels = false,
  showSeparateCounts = false,
}: UnifiedMenuBadgeProps) {
  const { badges, openMenu, state } = useUnifiedMenuContext();

  const handleClick = () => {
    openMenu();
  };

  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative", className)}
        onClick={handleClick}
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
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        className={cn("relative px-3 py-2", className)}
        onClick={handleClick}
      >
        <Bell className="h-4 w-4 mr-2" />
        <span className="text-sm">
          {badges.totalUnread > 0 ? `${badges.totalUnread} new` : 'No new items'}
        </span>
        {badges.actionRequiredCount > 0 && (
          <AlertCircle className="h-3 w-3 ml-2 text-orange" />
        )}
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        className="relative px-4 py-2"
        onClick={handleClick}
      >
        <Bell className="h-4 w-4 mr-2" />
        {showLabels && <span className="text-sm mr-2">Notifications</span>}

        {badges.totalUnread > 0 && (
          <Badge variant="destructive" className="ml-1">
            {badges.totalUnread > 99 ? '99+' : badges.totalUnread}
          </Badge>
        )}

        {badges.actionRequiredCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <AlertCircle className="h-4 w-4 text-orange" />
          </motion.div>
        )}
      </Button>

      {showSeparateCounts && (
        <>
          {/* Messages Badge */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => {
              openMenu();
              // You might want to auto-switch to messages tab here
            }}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            {showLabels && <span className="text-xs mr-1">Messages</span>}
            {badges.messagesUnread > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {badges.messagesUnread}
              </Badge>
            )}
          </Button>

          {/* Notifications Badge */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => {
              openMenu();
              // You might want to auto-switch to notifications tab here
            }}
          >
            <Bell className="h-4 w-4 mr-1" />
            {showLabels && <span className="text-xs mr-1">Alerts</span>}
            {badges.notificationsUnread > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {badges.notificationsUnread}
              </Badge>
            )}
          </Button>
        </>
      )}

      {/* Priority/Action Required Indicator */}
      {(badges.priorityCount > 0 || badges.actionRequiredCount > 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1"
        >
          {badges.priorityCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {badges.priorityCount} priority
            </Badge>
          )}
          {badges.actionRequiredCount > 0 && (
            <Badge variant="outline" className="text-xs border-orange text-orange">
              {badges.actionRequiredCount} action needed
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Simplified version for mobile/responsive use
export function UnifiedMenuBadgeMobile({ className }: { className?: string }) {
  return (
    <UnifiedMenuBadge
      variant="icon-only"
      className={cn("min-h-[44px] min-w-[44px] touch-manipulation", className)}
    />
  );
}

// Desktop version with more details
export function UnifiedMenuBadgeDesktop({ className }: { className?: string }) {
  return (
    <UnifiedMenuBadge
      variant="default"
      showLabels={false}
      showSeparateCounts={false}
      className={className}
    />
  );
}