'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  FileText,
  Upload,
  Calendar,
  MessageSquare,
  BarChart3,
  Command,
  Zap,
  Briefcase,
  Users,
  Settings,
  Search,
  ClipboardList,
  Shield,
  Activity,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProjectRequestDialog } from '@/components/dialogs/ProjectRequestDialog';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  requiredRole?: string[];
  pageRestriction?: string[];
  category: 'project' | 'document' | 'communication' | 'analytics' | 'admin';
}

interface QuickActionsProps {
  onOpenCommandPalette: () => void;
}

const RECENT_ACTIONS_KEY = 'groeimet-quick-actions-recent';
const MAX_RECENT_ACTIONS = 5;

export default function QuickActions({ onOpenCommandPalette }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentActionIds, setRecentActionIds] = useState<string[]>([]);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe navigation helper
  const navigateTo = useCallback(
    (path: string) => {
      if (mounted) {
        router.push(path);
      }
    },
    [mounted, router]
  );

  // Define all available quick actions
  const allActions: QuickAction[] = [
    // Project Actions
    {
      id: 'create-project',
      label: 'Create New Project',
      icon: Briefcase,
      action: () => {
        setProjectDialogOpen(true);
        trackAction('create-project');
        setIsOpen(false);
      },
      shortcut: 'Ctrl+Shift+P',
      category: 'project',
    },
    {
      id: 'view-projects',
      label: 'View All Projects',
      icon: ClipboardList,
      action: () => {
        navigateTo('/dashboard/projects');
        trackAction('view-projects');
        setIsOpen(false);
      },
      category: 'project',
    },
    {
      id: 'new-quote',
      label: 'View Quote Requests',
      icon: FileText,
      action: () => {
        navigateTo('/dashboard/quotes');
        trackAction('new-quote');
        setIsOpen(false);
      },
      shortcut: 'Ctrl+Q',
      category: 'project',
    },

    // Document Actions
    {
      id: 'upload-document',
      label: 'View Documents',
      icon: Upload,
      action: () => {
        navigateTo('/dashboard/documents');
        trackAction('upload-document');
        setIsOpen(false);
      },
      shortcut: 'Ctrl+U',
      category: 'document',
    },

    // Communication Actions
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: Bot,
      action: () => {
        // Trigger custom event to open chatbot
        const event = new CustomEvent('openChatbot');
        window.dispatchEvent(event);
        trackAction('ai-assistant');
        setIsOpen(false);
      },
      shortcut: 'Ctrl+B',
      category: 'communication',
    },
    {
      id: 'schedule-meeting',
      label: 'View Consultations',
      icon: Calendar,
      action: () => {
        navigateTo('/dashboard/consultations');
        trackAction('schedule-meeting');
        setIsOpen(false);
      },
      shortcut: 'Ctrl+M',
      category: 'communication',
    },
    {
      id: 'contact-support',
      label: 'Contact Support',
      icon: MessageSquare,
      action: () => {
        // Find and open chat widget
        const chatWidget = document.querySelector('[data-help="chat-widget"]');
        if (chatWidget) {
          chatWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Trigger click to open chat if it has click handler
          const button = chatWidget.querySelector('button');
          if (button) button.click();
        } else {
          // If no chat widget found, navigate to messages
          navigateTo('/dashboard/messages');
        }
        trackAction('contact-support');
        setIsOpen(false);
      },
      shortcut: 'Ctrl+H',
      category: 'communication',
    },

    // Admin Actions
    {
      id: 'admin-dashboard',
      label: 'Admin Dashboard',
      icon: Shield,
      action: () => {
        navigateTo('/dashboard/admin');
        trackAction('admin-dashboard');
        setIsOpen(false);
      },
      requiredRole: ['admin'],
      category: 'admin',
    },
    {
      id: 'manage-users',
      label: 'Manage Users',
      icon: Users,
      action: () => {
        navigateTo('/dashboard/admin/users');
        trackAction('manage-users');
        setIsOpen(false);
      },
      requiredRole: ['admin'],
      category: 'admin',
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: Settings,
      action: () => {
        navigateTo('/dashboard/admin/settings');
        trackAction('system-settings');
        setIsOpen(false);
      },
      requiredRole: ['admin'],
      category: 'admin',
    },
    {
      id: 'admin-analytics',
      label: 'System Analytics',
      icon: Activity,
      action: () => {
        navigateTo('/dashboard/admin/analytics');
        trackAction('admin-analytics');
        setIsOpen(false);
      },
      requiredRole: ['admin'],
      category: 'admin',
    },

    // Command Palette
    {
      id: 'command-palette',
      label: 'Open Command Palette',
      icon: Command,
      action: () => {
        onOpenCommandPalette();
        trackAction('command-palette');
        setIsOpen(false);
      },
      shortcut: 'Ctrl+K',
      category: 'communication',
    },
  ];

  // Filter actions based on user role and current page
  const availableActions = allActions.filter((action) => {
    // Check role requirements
    if (action.requiredRole && user) {
      if (!action.requiredRole.includes(user.role)) {
        return false;
      }
    }

    // Check page restrictions
    if (action.pageRestriction) {
      if (!action.pageRestriction.some((page) => pathname.includes(page))) {
        return false;
      }
    }

    return true;
  });

  // Get context-aware suggested actions based on current page
  const getSuggestedActions = () => {
    const suggested: string[] = [];

    if (pathname.includes('/projects')) {
      suggested.push('create-project', 'upload-document', 'ai-assistant');
    } else if (pathname.includes('/documents')) {
      suggested.push('upload-document', 'create-project', 'ai-assistant');
    } else if (pathname.includes('/consultations')) {
      suggested.push('schedule-meeting', 'contact-support', 'ai-assistant');
    } else if (pathname.includes('/admin')) {
      suggested.push('manage-users', 'system-settings', 'data-export');
    } else {
      // Default suggestions
      suggested.push('create-project', 'schedule-meeting', 'upload-document', 'ai-assistant');
    }

    // Always include command palette
    suggested.push('command-palette');

    return suggested;
  };

  // Load recent actions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_ACTIONS_KEY);
    if (stored) {
      try {
        setRecentActionIds(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent actions:', e);
      }
    }
  }, []);

  // Track action usage
  const trackAction = (actionId: string) => {
    const newRecent = [actionId, ...recentActionIds.filter((id) => id !== actionId)].slice(
      0,
      MAX_RECENT_ACTIONS
    );
    setRecentActionIds(newRecent);
    localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(newRecent));
  };

  // Group and sort actions
  const groupedActions = () => {
    const suggested = getSuggestedActions();
    const recentActions = recentActionIds
      .map((id) => availableActions.find((a) => a.id === id))
      .filter(Boolean) as QuickAction[];

    const groups: { [key: string]: QuickAction[] } = {
      'Recently Used': recentActions.slice(0, 3),
      Suggested: availableActions.filter(
        (a) => suggested.includes(a.id) && !recentActionIds.includes(a.id)
      ),
    };

    // Add remaining actions by category
    const categorized = availableActions.reduce(
      (acc, action) => {
        if (!suggested.includes(action.id) && !recentActionIds.includes(action.id)) {
          const category = action.category.charAt(0).toUpperCase() + action.category.slice(1);
          if (!acc[category]) acc[category] = [];
          acc[category].push(action);
        }
        return acc;
      },
      {} as { [key: string]: QuickAction[] }
    );

    return { ...groups, ...categorized };
  };

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Toggle FAB with Ctrl/Cmd + Shift + A
      if (isCtrlOrCmd && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Handle action shortcuts when FAB is open
      if (isOpen) {
        const action = availableActions.find((a) => {
          if (!a.shortcut) return false;
          const shortcutKey = a.shortcut.split('+').pop()?.toLowerCase();
          return isCtrlOrCmd && e.key.toLowerCase() === shortcutKey;
        });

        if (action) {
          e.preventDefault();
          action.action();
        }
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, availableActions]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const actionGroups = groupedActions();

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40" ref={fabRef}>
      {/* FAB Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200',
            'bg-orange hover:bg-orange-600 text-white',
            'flex items-center justify-center group relative overflow-hidden'
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </motion.div>

          {/* Pulse animation when closed */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 bg-orange"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* Tooltip */}
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute right-full mr-3 px-3 py-1.5 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap pointer-events-none"
            >
              Quick Actions
              <kbd className="ml-2 text-xs px-1.5 py-0.5 bg-white/20 rounded">⌘⇧A</kbd>
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Actions Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-80 bg-black/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange" />
                    Quick Actions
                  </h3>
                  <p className="text-xs text-white/60 mt-1">Press shortcuts for faster access</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search hint */}
            <button
              onClick={onOpenCommandPalette}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/10 group"
            >
              <Search className="w-4 h-4 text-white/60 group-hover:text-orange transition-colors" />
              <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                Search all commands...
              </span>
              <kbd className="ml-auto text-xs px-2 py-1 bg-white/10 rounded text-white/60">⌘K</kbd>
            </button>

            {/* Actions List */}
            <div className="max-h-[400px] overflow-y-auto">
              {Object.entries(actionGroups).map(([group, actions]) => {
                if (actions.length === 0) return null;

                return (
                  <div key={group}>
                    <div className="px-4 py-2 text-xs font-semibold text-white/40 uppercase">
                      {group}
                    </div>
                    {actions.map((action) => {
                      const Icon = action.icon;
                      const isHovered = hoveredAction === action.id;

                      return (
                        <motion.button
                          key={action.id}
                          onClick={action.action}
                          onMouseEnter={() => setHoveredAction(action.id)}
                          onMouseLeave={() => setHoveredAction(null)}
                          className={cn(
                            'w-full px-4 py-3 flex items-center gap-3 transition-all duration-200',
                            'hover:bg-orange/20 hover:pl-6 group relative'
                          )}
                          whileHover={{ x: 2 }}
                        >
                          {/* Highlight bar */}
                          <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: isHovered ? 1 : 0 }}
                            className="absolute left-0 top-0 bottom-0 w-1 bg-orange origin-center"
                          />

                          <Icon
                            className={cn(
                              'w-4 h-4 transition-colors',
                              isHovered ? 'text-orange' : 'text-white/60'
                            )}
                          />
                          <span className="text-sm text-white group-hover:text-white/90">
                            {action.label}
                          </span>

                          {action.shortcut && (
                            <kbd className="ml-auto text-xs px-2 py-1 bg-white/10 rounded text-white/60">
                              {action.shortcut.replace('Ctrl', '⌘')}
                            </kbd>
                          )}

                          <ChevronRight className="w-3 h-3 text-white/40 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 text-center">
              <p className="text-xs text-white/40">
                Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded mx-1">ESC</kbd> to close
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ProjectRequestDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
    </div>
  );
}
