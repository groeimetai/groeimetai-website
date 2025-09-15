'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  X,
  Loader2,
  Smile,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { MessageItem } from '@/types/unified-menu';
import { useUnifiedMenuContext } from './UnifiedMenuProvider';
import { cn } from '@/lib/utils';

interface QuickReplyComponentProps {
  message: MessageItem;
  onClose?: () => void;
  className?: string;
}

export function QuickReplyComponent({ message, onClose, className }: QuickReplyComponentProps) {
  const { quickReply } = useUnifiedMenuContext();
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Quick reply templates
  const quickReplies = [
    "Thanks for your message! I'll get back to you soon.",
    "Got it, I'll review this and respond shortly.",
    "Thanks for the update. Looking good!",
    "Can you provide more details about this?",
    "Let me check on this and get back to you.",
    "Perfect! Let's proceed with this.",
  ];

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      await quickReply(message.id, replyText);
      setReplyText('');
      setAttachments([]);
      onClose?.();
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "bg-black/95 border border-white/20 rounded-lg p-4 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.senderName}`} />
            <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-white font-medium text-sm">
              Replying to {message.senderName}
            </h3>
            <p className="text-white/60 text-xs">
              {message.senderRole === 'admin' ? 'Admin' : 'User'}
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Original Message Preview */}
      <div className="bg-white/5 rounded-lg p-3 border-l-2 border-orange">
        <p className="text-white/80 text-sm line-clamp-2">
          {message.content}
        </p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Paperclip className="h-3 w-3 text-white/40" />
            <span className="text-white/40 text-xs">
              {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Quick Reply Templates */}
      <div className="space-y-2">
        <p className="text-white/60 text-xs">Quick replies:</p>
        <div className="flex flex-wrap gap-2">
          {quickReplies.slice(0, 3).map((template, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs border-white/20 hover:border-orange"
              onClick={() => setReplyText(template)}
            >
              {template}
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs border-white/20">
                More...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-black/95 border-white/20">
              <div className="space-y-2">
                {quickReplies.slice(3).map((template, index) => (
                  <Button
                    key={index + 3}
                    variant="ghost"
                    className="w-full justify-start text-left text-sm h-auto p-2"
                    onClick={() => {
                      setReplyText(template);
                    }}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Reply Text Area */}
      <div className="space-y-3">
        <Textarea
          placeholder="Type your reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
          rows={3}
        />

        {/* Attachments */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-white/60 text-xs">Attachments:</p>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="h-4 w-4 text-blue-400" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-400" />
                      )}
                      <div>
                        <p className="text-white text-sm">{file.name}</p>
                        <p className="text-white/40 text-xs">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file-upload"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Smile className="h-4 w-4" />
          </Button>
          {attachments.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {attachments.length} file{attachments.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <p className="text-white/40 text-xs">
            {replyText.length}/1000
          </p>
          <Button
            onClick={handleSendReply}
            disabled={!replyText.trim() || isReplying}
            className="bg-orange hover:bg-orange-600"
            size="sm"
          >
            {isReplying ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      <p className="text-white/30 text-xs text-center">
        Press ⌘+Enter (Ctrl+Enter) to send
      </p>
    </motion.div>
  );
}