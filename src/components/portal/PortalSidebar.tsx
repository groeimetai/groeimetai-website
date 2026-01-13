'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Files,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

const navItems = [
  {
    label: 'Dashboard',
    href: '/portal',
    icon: LayoutDashboard,
  },
  {
    label: 'Projecten',
    href: '/portal/projects',
    icon: FolderKanban,
  },
  {
    label: 'Facturen',
    href: '/portal/invoices',
    icon: FileText,
  },
  {
    label: 'Documenten',
    href: '/portal/documents',
    icon: Files,
  },
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (href: string) => {
    // Remove locale prefix for comparison
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    if (href === '/portal') {
      return pathWithoutLocale === '/portal';
    }
    return pathWithoutLocale.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#0a0f1a] border-r border-white/10">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/portal" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange to-[#FF9F43] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-white font-semibold">Client Portal</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ''} />}
              <AvatarFallback className="bg-orange/20 text-orange">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || 'Gebruiker'}
              </p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${active
                    ? 'bg-orange/10 text-orange'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/portal/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Instellingen</span>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2 text-white/60 hover:text-red-400 hover:bg-red-500/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Uitloggen</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
