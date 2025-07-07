'use client';

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { useHelp } from '@/components/HelpSystem';
import { ProjectRequestDialog } from '@/components/dialogs/ProjectRequestDialog';
import { useLocale } from 'next-intl';
import {
  Search,
  FileText,
  Users,
  Settings,
  HelpCircle,
  MessageSquare,
  Calendar,
  DollarSign,
  BarChart,
  LogOut,
  User as UserIcon,
  Briefcase as ProjectIcon,
  Plus,
  Home,
  Lightbulb,
  ChevronRight,
  Clock,
  Star,
  Hash,
  Sparkles,
  Command as CommandIcon,
  Zap,
  Archive,
  Bell,
  Shield,
  Palette,
  Keyboard,
  Globe,
  Database,
  Activity,
  CheckCircle,
  CircleDot,
  AlertCircle,
  Upload,
  Download,
  Share2,
  Copy,
  Trash2,
  Edit3,
  Bot,
  Eye,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  GitBranch,
  Package,
  Briefcase,
  Award,
  Target,
  TrendingUp,
  BookOpen,
  Video,
  Mic,
  Camera,
  Headphones,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Server,
  Cpu,
  HardDrive,
  Save,
  FolderOpen,
  Folder,
  File,
  FileCode,
  FileSpreadsheet,
  FileImage,
  FileMinus,
  FilePlus,
  FileCheck,
  FileX,
  Filter,
  Flag,
  Heart,
  Info,
  Layers,
  Layout,
  Link,
  List,
  Loader,
  Navigation,
  PauseCircle,
  PlayCircle,
  Power,
  Printer,
  Radio,
  Repeat,
  RotateCw,
  Rss,
  Send,
  ShoppingCart,
  Shuffle,
  Sidebar,
  SkipBack,
  SkipForward,
  Slash,
  Sliders,
  Speaker,
  Square,
  Tag,
  Terminal,
  Thermometer,
  ToggleLeft,
  ToggleRight,
  Trash,
  Type,
  Umbrella,
  Underline,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Watch,
  Wind,
  X,
  XCircle,
  XSquare,
  ZoomIn,
  ZoomOut,
  Rocket,
  Brain,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Project, User, Service } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Types
interface CommandItem {
  id: string;
  type: 'action' | 'navigation' | 'project' | 'user' | 'help' | 'setting' | 'recent';
  category: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  keywords?: string[];
  action: () => void;
  shortcut?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  isNew?: boolean;
  isPro?: boolean;
  isAdmin?: boolean;
  requiresAuth?: boolean;
  metadata?: any;
}

interface CommandGroup {
  id: string;
  title: string;
  items: CommandItem[];
  icon?: React.ReactNode;
}

interface CommandPaletteContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  recentSearches: string[];
  recentActions: string[];
  addRecentSearch: (search: string) => void;
  addRecentAction: (actionId: string) => void;
}

// Context
const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return context;
};

// Provider
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load recent items from localStorage
  useEffect(() => {
    if (!mounted) return;

    const savedSearches = localStorage.getItem('commandPalette:recentSearches');
    const savedActions = localStorage.getItem('commandPalette:recentActions');

    if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
    if (savedActions) setRecentActions(JSON.parse(savedActions));
  }, [mounted]);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const addRecentSearch = useCallback(
    (search: string) => {
      if (!search.trim() || !mounted) return;

      setRecentSearches((prev) => {
        const updated = [search, ...prev.filter((s) => s !== search)].slice(0, 5);
        localStorage.setItem('commandPalette:recentSearches', JSON.stringify(updated));
        return updated;
      });
    },
    [mounted]
  );

  const addRecentAction = useCallback(
    (actionId: string) => {
      if (!mounted) return;

      setRecentActions((prev) => {
        const updated = [actionId, ...prev.filter((id) => id !== actionId)].slice(0, 10);
        localStorage.setItem('commandPalette:recentActions', JSON.stringify(updated));
        return updated;
      });
    },
    [mounted]
  );

  // Global keyboard shortcut
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle, mounted]);

  return (
    <CommandPaletteContext.Provider
      value={{
        open,
        setOpen,
        toggle,
        recentSearches,
        recentActions,
        addRecentSearch,
        addRecentAction,
      }}
    >
      {children}
      {mounted && <CommandPaletteInternal />}
    </CommandPaletteContext.Provider>
  );
}

// Main Component
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

// Internal component that uses context
function CommandPaletteInternal() {
  const { open, setOpen, recentSearches, recentActions, addRecentSearch, addRecentAction } =
    useCommandPalette();

  return (
    <CommandPaletteBase
      open={open}
      setOpen={setOpen}
      recentSearches={recentSearches}
      recentActions={recentActions}
      addRecentSearch={addRecentSearch}
      addRecentAction={addRecentAction}
    />
  );
}

// Standalone component that uses props
function CommandPaletteStandalone({ isOpen, onClose }: CommandPaletteProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setOpen = (value: boolean) => {
    if (!value) onClose();
  };

  if (!mounted) {
    return null;
  }

  return (
    <CommandPaletteBase
      open={isOpen}
      setOpen={setOpen}
      recentSearches={[]}
      recentActions={[]}
      addRecentSearch={() => {}}
      addRecentAction={() => {}}
    />
  );
}

// Base component with all the logic
interface CommandPaletteBaseProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  recentSearches: string[];
  recentActions: string[];
  addRecentSearch: (search: string) => void;
  addRecentAction: (actionId: string) => void;
}

function CommandPaletteBase({
  open,
  setOpen,
  recentSearches,
  recentActions,
  addRecentSearch,
  addRecentAction,
}: CommandPaletteBaseProps) {
  const [search, setSearch] = useState('');
  const [ragResults, setRagResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { openHelpCenter, startTutorial } = useHelp();
  const locale = useLocale();

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe navigation helper - only use router when mounted
  const navigateTo = useCallback(
    (path: string) => {
      if (mounted && router) {
        router.push(path);
      }
    },
    [mounted, router]
  );

  // Create command items
  const createCommandItems = useCallback((): CommandItem[] => {
    const items: CommandItem[] = [];

    // Actions
    items.push({
      id: 'action-new-project',
      type: 'action',
      category: 'Actions',
      title: 'Create New Project',
      description: 'Start a new AI project',
      icon: <Plus className="w-4 h-4" />,
      keywords: ['new', 'create', 'project', 'start'],
      action: () => {
        setProjectDialogOpen(true);
        setOpen(false);
      },
      shortcut: 'N',
      isNew: true,
    });

    items.push({
      id: 'action-chat',
      type: 'action',
      category: 'Actions',
      title: 'Open Chat',
      description: 'Chat with our team',
      icon: <MessageSquare className="w-4 h-4" />,
      keywords: ['chat', 'message', 'talk', 'support'],
      action: () => {
        // Navigate to messages page
        navigateTo('/dashboard/messages');
        setOpen(false);
      },
      shortcut: 'C',
    });

    items.push({
      id: 'action-chatbot',
      type: 'action',
      category: 'Actions',
      title: 'AI Assistant',
      description: 'Chat with our AI assistant (24/7)',
      icon: <Bot className="w-4 h-4" />,
      keywords: ['ai', 'bot', 'chatbot', 'assistant', 'help', '24/7'],
      action: () => {
        // Trigger chatbot opening
        const event = new CustomEvent('openChatbot');
        window.dispatchEvent(event);
        setOpen(false);
      },
      shortcut: 'B',
      badge: '24/7',
      badgeVariant: 'default',
    });

    items.push({
      id: 'action-schedule-meeting',
      type: 'action',
      category: 'Actions',
      title: 'Schedule Meeting',
      description: 'Book a consultation',
      icon: <Calendar className="w-4 h-4" />,
      keywords: ['meeting', 'schedule', 'book', 'consultation', 'calendar'],
      action: () => {
        navigateTo('/dashboard/consultations');
        setOpen(false);
      },
      shortcut: 'M',
    });

    items.push({
      id: 'action-help',
      type: 'action',
      category: 'Actions',
      title: 'Get Help',
      description: 'Open help center',
      icon: <HelpCircle className="w-4 h-4" />,
      keywords: ['help', 'support', 'documentation', 'guide'],
      action: () => {
        openHelpCenter();
        setOpen(false);
      },
      shortcut: '?',
    });

    // Only show tutorial if not completed
    const tutorialCompleted =
      mounted && localStorage.getItem('tutorial:getting-started:completed') === 'true';
    if (!tutorialCompleted) {
      items.push({
        id: 'action-tutorial',
        type: 'action',
        category: 'Actions',
        title: 'Start Tutorial',
        description: 'Learn how to use the platform',
        icon: <Lightbulb className="w-4 h-4" />,
        keywords: ['tutorial', 'guide', 'learn', 'onboarding'],
        action: () => {
          startTutorial('getting-started');
          localStorage.setItem('tutorial:getting-started:completed', 'true');
          setOpen(false);
        },
        badge: 'Recommended',
        badgeVariant: 'default',
      });
    }

    // Navigation
    items.push({
      id: 'nav-dashboard',
      type: 'navigation',
      category: 'Navigation',
      title: 'Dashboard',
      description: 'Go to dashboard',
      icon: <Home className="w-4 h-4" />,
      keywords: ['dashboard', 'home', 'overview'],
      action: () => {
        navigateTo('/dashboard');
        setOpen(false);
      },
    });

    items.push({
      id: 'nav-projects',
      type: 'navigation',
      category: 'Navigation',
      title: 'Projects',
      description: 'View all projects',
      icon: <ProjectIcon className="w-4 h-4" />,
      keywords: ['projects', 'work', 'tasks'],
      action: () => {
        navigateTo('/dashboard/projects');
        setOpen(false);
      },
    });

    items.push({
      id: 'nav-invoices',
      type: 'navigation',
      category: 'Navigation',
      title: 'Invoices',
      description: 'View invoices and billing',
      icon: <DollarSign className="w-4 h-4" />,
      keywords: ['invoices', 'billing', 'payments', 'money'],
      action: () => {
        navigateTo('/dashboard/invoices');
        setOpen(false);
      },
    });

    // Help Articles - In a real app, this would come from your API or context
    const helpArticles = [
      {
        id: '1',
        title: 'How to Request a New Project',
        category: 'Getting Started',
        tags: ['project', 'request', 'quote'],
      },
      {
        id: '2',
        title: 'Understanding Project Timelines',
        category: 'Projects',
        tags: ['timeline', 'milestones', 'progress'],
      },
    ];

    helpArticles.forEach((article) => {
      items.push({
        id: `help-${article.id}`,
        type: 'help',
        category: 'Help',
        title: article.title,
        description: article.category,
        icon: <BookOpen className="w-4 h-4" />,
        keywords: [...article.tags, article.category],
        action: () => {
          openHelpCenter();
          // You could pass article ID to help center to open specific article
          setOpen(false);
        },
        metadata: article,
      });
    });

    // Settings
    items.push({
      id: 'settings-main',
      type: 'setting',
      category: 'Settings',
      title: 'Settings',
      description: 'Manage your account settings',
      icon: <Settings className="w-4 h-4" />,
      keywords: ['settings', 'preferences', 'account', 'profile'],
      action: () => {
        navigateTo('/dashboard/settings');
        setOpen(false);
      },
    });

    // Admin items (if user is admin)
    if (user?.role === 'admin') {
      items.push({
        id: 'admin-dashboard',
        type: 'navigation',
        category: 'Admin',
        title: 'Admin Dashboard',
        description: 'Access admin panel',
        icon: <Shield className="w-4 h-4" />,
        keywords: ['admin', 'management', 'control'],
        action: () => {
          navigateTo('/dashboard/admin');
          setOpen(false);
        },
        isAdmin: true,
        badge: 'Admin',
        badgeVariant: 'secondary',
      });

      items.push({
        id: 'admin-users',
        type: 'navigation',
        category: 'Admin',
        title: 'Manage Users',
        description: 'User management',
        icon: <Users className="w-4 h-4" />,
        keywords: ['users', 'management', 'admin'],
        action: () => {
          navigateTo('/dashboard/admin/users');
          setOpen(false);
        },
        isAdmin: true,
      });

      items.push({
        id: 'admin-analytics',
        type: 'navigation',
        category: 'Admin',
        title: 'System Analytics',
        description: 'View system metrics',
        icon: <Activity className="w-4 h-4" />,
        keywords: ['analytics', 'metrics', 'system', 'admin'],
        action: () => {
          navigateTo('/dashboard/admin/analytics');
          setOpen(false);
        },
        isAdmin: true,
      });
    }

    // Logout
    if (user) {
      items.push({
        id: 'action-logout',
        type: 'action',
        category: 'Actions',
        title: 'Log Out',
        description: 'Sign out of your account',
        icon: <LogOut className="w-4 h-4" />,
        keywords: ['logout', 'signout', 'exit'],
        action: async () => {
          setOpen(false);
          await logout();
        },
      });
    }

    return items;
  }, [
    user,
    navigateTo,
    setOpen,
    openHelpCenter,
    startTutorial,
    logout,
    setProjectDialogOpen,
    mounted,
  ]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    const items = createCommandItems();

    if (!search) return items;

    const searchLower = search.toLowerCase();

    return items.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(searchLower);
      const descriptionMatch = item.description?.toLowerCase().includes(searchLower);
      const keywordMatch = item.keywords?.some((k) => k.toLowerCase().includes(searchLower));
      const categoryMatch = item.category.toLowerCase().includes(searchLower);

      return titleMatch || descriptionMatch || keywordMatch || categoryMatch;
    });
  }, [search, createCommandItems]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: CommandItem[] } = {};

    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    // Sort groups by priority
    const sortedGroups: CommandGroup[] = [];
    const categoryOrder = ['Actions', 'Navigation', 'Help', 'Settings', 'Admin'];

    categoryOrder.forEach((category) => {
      if (groups[category]) {
        sortedGroups.push({
          id: category.toLowerCase(),
          title: category,
          items: groups[category],
        });
      }
    });

    // Add any remaining categories
    Object.keys(groups).forEach((category) => {
      if (!categoryOrder.includes(category)) {
        sortedGroups.push({
          id: category.toLowerCase(),
          title: category,
          items: groups[category],
        });
      }
    });

    return sortedGroups;
  }, [filteredItems]);

  // Recent items
  const recentItems = useMemo(() => {
    const items = createCommandItems();
    return recentActions
      .map((actionId) => items.find((item) => item.id === actionId))
      .filter(Boolean) as CommandItem[];
  }, [recentActions, createCommandItems]);

  // Handle item selection
  const handleSelect = useCallback(
    (item: CommandItem) => {
      addRecentAction(item.id);
      if (search) {
        addRecentSearch(search);
      }
      item.action();
    },
    [addRecentAction, addRecentSearch, search]
  );

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 max-w-2xl bg-black/95 border-white/20 [&>button]:hidden">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/60 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <div className="flex items-center border-b border-white/20 px-3">
              <CommandIcon className="mr-2 h-4 w-4 shrink-0 text-white/60" />
              <Command.Input
                placeholder="Type a command or search..."
                value={search}
                onValueChange={setSearch}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {isSearching && (
                <div className="absolute right-12 top-3.5 text-white/40">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
              )}
              <button
                onClick={() => setOpen(false)}
                className="ml-2 p-1 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Close command palette"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <ScrollArea className="max-h-[450px] overflow-y-auto">
              <Command.List>
                <Command.Empty className="py-6 text-center text-sm text-white/60">
                  No results found.
                </Command.Empty>

                {/* Recent Actions */}
                {!search && recentItems.length > 0 && (
                  <Command.Group heading="Recent">
                    {recentItems.map((item) => (
                      <CommandItem key={item.id} item={item} onSelect={handleSelect} />
                    ))}
                  </Command.Group>
                )}

                {/* Recent Searches */}
                {!search && recentSearches.length > 0 && (
                  <Command.Group heading="Recent Searches">
                    {recentSearches.map((recentSearch) => (
                      <Command.Item
                        key={recentSearch}
                        value={recentSearch}
                        onSelect={() => setSearch(recentSearch)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-white border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                      >
                        <Clock className="w-4 h-4 text-white/40" />
                        <span>{recentSearch}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Grouped Items */}
                {groupedItems.map((group) => (
                  <Command.Group key={group.id} heading={group.title}>
                    {group.items.map((item) => (
                      <CommandItem key={item.id} item={item} onSelect={handleSelect} />
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
            </ScrollArea>

            <div className="border-t border-white/20 px-3 py-2">
              <div className="flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1 font-mono text-[10px] font-medium">
                      ↑↓
                    </kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1 font-mono text-[10px] font-medium">
                      ↵
                    </kbd>
                    Select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  Press
                  <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1 font-mono text-[10px] font-medium">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                  to open
                </span>
              </div>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
      <ProjectRequestDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
    </>
  );
}

// Command Item Component
function CommandItem({
  item,
  onSelect,
}: {
  item: CommandItem;
  onSelect: (item: CommandItem) => void;
}) {
  return (
    <Command.Item
      value={`${item.id} ${item.title} ${item.description || ''} ${item.keywords?.join(' ') || ''}`}
      onSelect={() => onSelect(item)}
      className="relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm text-white outline-none border border-white/10 hover:bg-white/10 hover:border-white/20 data-[selected]:bg-white/10 data-[selected]:border-white/20"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5">
        {item.icon}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.title}</span>
          {item.isNew && (
            <Badge
              variant="default"
              className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px] px-1 py-0"
            >
              NEW
            </Badge>
          )}
          {item.isPro && (
            <Badge
              variant="default"
              className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-[10px] px-1 py-0"
            >
              PRO
            </Badge>
          )}
          {item.badge && (
            <Badge
              variant={item.badgeVariant || 'default'}
              className={cn(
                'text-[10px] px-1 py-0',
                item.badgeVariant === 'destructive' &&
                  'bg-red-500/20 text-red-400 border-red-500/50',
                item.badgeVariant === 'secondary' && 'bg-white/10 text-white/60 border-white/20'
              )}
            >
              {item.badge}
            </Badge>
          )}
        </div>
        {item.description && <p className="text-xs text-white/60 mt-0.5">{item.description}</p>}
      </div>

      {item.shortcut && (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/60">
          {item.shortcut}
        </kbd>
      )}

      <ChevronRight className="w-4 h-4 text-white/40" />
    </Command.Item>
  );
}

export default CommandPaletteStandalone;

// Export utilities
export function CommandPaletteButton() {
  const { toggle } = useCommandPalette();

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
    >
      <Search className="w-4 h-4" />
      <span>Search...</span>
      <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
