'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home, Users, Mail, Calendar, Settings, FileText, 
  DollarSign, BarChart3, MessageSquare, Phone, Clock,
  User, LogOut, Menu, X, ChevronDown, ExternalLink,
  Target, Rocket, Brain, Database, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  description?: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  external?: boolean;
}

export default function DynamicNavigation() {
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Define navigation items based on user context
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { href: '/', label: 'Home', icon: Home, description: 'Terug naar homepage' },
      { href: '/about', label: 'Over Ons', icon: Users, description: 'Leer meer over GroeimetAI' },
      { href: '/services', label: 'Diensten', icon: Target, description: 'Onze AI services' },
      { href: '/cases', label: 'Cases', icon: Rocket, description: 'Succesvolle projecten' },
      { href: '/contact', label: 'Contact', icon: Phone, description: 'Neem contact op' },
    ];

    // Add assessment for everyone
    baseItems.push({
      href: '/agent-readiness',
      label: 'Agent Assessment',
      icon: Brain,
      description: 'Test je AI readiness'
    });

    // Authenticated user items
    if (user) {
      baseItems.push(
        { href: '/dashboard', label: 'Dashboard', icon: BarChart3, description: 'Persoonlijk dashboard' },
        { href: '/dashboard/projects', label: 'Projecten', icon: FileText, description: 'Mijn projecten' },
        { href: '/dashboard/messages', label: 'Berichten', icon: MessageSquare, description: 'Communicatie' }
      );
    }

    // Admin-only items
    if (isAdmin) {
      baseItems.push(
        { href: '/dashboard/admin', label: 'Admin Panel', icon: Settings, description: 'Admin dashboard' },
        { href: '/dashboard/admin/contacts', label: 'Contact Aanvragen', icon: Mail, description: 'Beheer contact aanvragen' },
        { href: '/dashboard/admin/calendar', label: 'Calendar', icon: Calendar, description: 'Meeting management' },
        { href: '/dashboard/admin/users', label: 'Gebruikers', icon: Users, description: 'Gebruiker beheer' },
        { href: '/dashboard/admin/quotes', label: 'Offertes', icon: DollarSign, description: 'Offerte beheer' }
      );
    }

    return baseItems;
  };

  // Get current page context
  const getCurrentPageContext = () => {
    if (pathname.includes('/dashboard/admin/contacts')) {
      return {
        title: 'Contact Management',
        subtitle: 'Beheer contact aanvragen en plan meetings',
        color: 'text-orange',
        bgColor: 'bg-orange/10'
      };
    }
    
    if (pathname.includes('/dashboard/admin/calendar')) {
      return {
        title: 'Calendar Management', 
        subtitle: 'Google Calendar en meeting overzicht',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
      };
    }
    
    if (pathname.includes('/dashboard/admin')) {
      return {
        title: 'Admin Dashboard',
        subtitle: 'Systeem beheer en overzichten',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
      };
    }
    
    if (pathname.includes('/dashboard')) {
      return {
        title: 'Dashboard',
        subtitle: 'Uw persoonlijke overzicht',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
      };
    }
    
    if (pathname.includes('/contact')) {
      return {
        title: 'Contact',
        subtitle: 'Neem contact op voor AI consultatie',
        color: 'text-orange',
        bgColor: 'bg-orange/10'
      };
    }
    
    return {
      title: 'GroeimetAI',
      subtitle: 'AI Infrastructure Specialists',
      color: 'text-orange',
      bgColor: 'bg-orange/10'
    };
  };

  const navigationItems = getNavigationItems();
  const pageContext = getCurrentPageContext();
  const currentItem = navigationItems.find(item => item.href === pathname);

  if (!mounted) {
    return null;
  }

  return (
    <nav className="bg-black border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Current Page */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-white font-semibold hidden sm:block">GroeimetAI</span>
            </Link>
            
            {/* Page Context */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-px h-6 bg-white/20"></div>
              <div className={`px-3 py-1 rounded-full ${pageContext.bgColor}`}>
                <span className={`text-sm font-medium ${pageContext.color}`}>
                  {pageContext.title}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 ${
                      isActive 
                        ? 'bg-orange text-white' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:block">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-orange text-white text-xs ml-1">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange/20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-orange" />
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{user.name || user.email}</p>
                    <p className="text-white/50 text-xs">
                      {isAdmin ? 'Admin' : 'User'}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white"
                  onClick={() => {/* Add logout logic */}}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-white/20 text-white">
                    Login
                  </Button>
                </Link>
                <Link href="/agent-readiness">
                  <Button size="sm" className="bg-orange text-white">
                    Start Assessment
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10"
            >
              <div className="py-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          isActive 
                            ? 'bg-orange text-white' 
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge className="bg-orange text-white text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {item.description && (
                          <span className="text-white/50 text-xs ml-2 hidden sm:block">
                            {item.description}
                          </span>
                        )}
                      </Button>
                    </Link>
                  );
                })}
                
                {/* Mobile User Actions */}
                {!user && (
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <Link href="/login">
                      <Button variant="outline" className="w-full border-white/20 text-white">
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Page Context Bar (Mobile) */}
      <div className="md:hidden bg-white/5 px-4 py-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${pageContext.color.replace('text-', 'bg-')}`}></div>
          <span className="text-white text-sm font-medium">{pageContext.title}</span>
          <span className="text-white/60 text-xs">•</span>
          <span className="text-white/60 text-xs">{pageContext.subtitle}</span>
        </div>
      </div>
    </nav>
  );
}