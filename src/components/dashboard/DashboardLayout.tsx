'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu,
  User,
  Users,
  Receipt,
  Shield,
  Kanban,
  FolderKanban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UnifiedCommunicationCenter from '@/components/unified/UnifiedCommunicationCenter';
import { LucideIcon } from 'lucide-react';

// Type for sidebar navigation items
interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  separator?: boolean;
}

// Dynamic sidebar items based on user role
const getSidebarItems = (isAdmin: boolean): NavItem[] => {
  const baseItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
    { icon: FolderKanban, label: 'Projecten', href: '/dashboard/projects' },
    { icon: Receipt, label: 'Facturen', href: '/dashboard/invoices' },
    { icon: Settings, label: 'Instellingen', href: '/dashboard/settings' },
  ];

  // Add admin-specific items - simplified structure
  if (isAdmin) {
    baseItems.push(
      { icon: Shield, label: 'Admin Panel', href: '/dashboard/admin', separator: true },
      { icon: Kanban, label: 'Pipeline', href: '/dashboard/admin/pipeline' },
      { icon: FolderKanban, label: 'Projecten', href: '/dashboard/admin/projects' },
      { icon: Receipt, label: 'Facturatie', href: '/dashboard/admin/invoices' },
      { icon: Users, label: 'Klanten', href: '/dashboard/admin/users' },
      { icon: Calendar, label: 'Calendar', href: '/dashboard/admin/calendar' },
    );
  }

  return baseItems;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get dynamic sidebar items
  const sidebarItems = getSidebarItems(isAdmin || false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? 80 : 240,
          x: isMobileSidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -240 : 0)
        }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 bottom-0 z-50 bg-card border-r border-border md:translate-x-0"
        style={{ width: isSidebarCollapsed ? 80 : 240 }}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg">
                  G
                </div>
                {!isSidebarCollapsed && <span className="text-lg sm:text-xl font-semibold">GroeimetAI</span>}
              </Link>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="md:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden md:flex"
                >
                  <ChevronLeft
                    className={`h-4 w-4 transition-transform ${
                      isSidebarCollapsed ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <ul className="space-y-1 sm:space-y-2">
              {sidebarItems.map((item, index) => {
                const isActive = pathname === item.href;
                const showSeparator = item.separator && index > 0;
                
                return (
                  <li key={item.href}>
                    {showSeparator && (
                      <div className="my-3 border-t border-border opacity-50"></div>
                    )}
                    <Link 
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-orange text-white'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isSidebarCollapsed && (
                          <span className="text-sm font-medium">{item.label}</span>
                        )}
                      </motion.div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom section */}
          <div className="p-3 sm:p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground py-2.5 sm:py-2"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <HelpCircle className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="text-sm">Help & Support</span>}
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60'}`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden h-9 w-9 sm:h-10 sm:w-10"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-base sm:text-lg font-semibold">Dashboard</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Unified Communication Center */}
              <UnifiedCommunicationCenter className="relative" showBadge={true} />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                    <Avatar>
                      {user?.photoURL && (
                        <AvatarImage src={user.photoURL} alt={user?.displayName || 'User'} />
                      )}
                      <AvatarFallback>
                        {user?.displayName?.charAt(0).toUpperCase() ||
                          user?.email?.charAt(0).toUpperCase() ||
                          'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.displayName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={`text-destructive ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={isLoggingOut ? undefined : handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
