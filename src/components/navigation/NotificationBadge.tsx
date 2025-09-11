'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationBadgeProps } from '@/types/navigation';
import { cn } from '@/lib/utils';

export default function NotificationBadge({
  count,
  hasUrgent = false,
  size = 'md',
  onClick,
  className = ''
}: NotificationBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const badgeSizeClasses = {
    sm: 'w-3 h-3 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      onClick={onClick}
      aria-label={`${count} notifications${hasUrgent ? ', including urgent messages' : ''}`}
    >
      {/* Bell Icon */}
      <Bell className={cn(sizeClasses[size], "text-white")} />
      
      {/* Notification Count Badge */}
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "absolute -top-1 -right-1 rounded-full flex items-center justify-center font-medium",
            badgeSizeClasses[size],
            hasUrgent 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-orange text-white"
          )}
        >
          {count > 99 ? '99+' : count}
        </motion.div>
      )}

      {/* Urgent Indicator */}
      {hasUrgent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -top-0.5 -right-0.5"
        >
          <AlertCircle className="w-2 h-2 text-red-400" />
        </motion.div>
      )}

      {/* Pulse Animation for New Notifications */}
      {count > 0 && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-2",
            hasUrgent ? "border-red-500/50" : "border-orange/50"
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </Button>
  );
}