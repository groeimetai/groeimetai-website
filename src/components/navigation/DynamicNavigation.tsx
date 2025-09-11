'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from '@/components/NotificationCenter';
import {
  Home, Users, Mail, Calendar, Settings, FileText, 
  DollarSign, BarChart3, MessageSquare, Phone, Clock,
  User, LogOut, Menu, X, ChevronDown, ExternalLink,
  Target, Rocket, Brain, Database, Shield, Bell, LayoutDashboard
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
  const { user, isAdmin, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Define navigation items based on user context (simplified)
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { href: '/services', label: 'Diensten', icon: Target },
      { href: '/cases', label: 'Cases', icon: Rocket },
      { href: '/about', label: 'Over Ons', icon: Users },
      { href: '/contact', label: 'Contact', icon: Phone },
    ];

    // Authenticated user items
    if (user) {
      baseItems.unshift(
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
      );
    }

    return baseItems;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigationItems = getNavigationItems();

  if (!mounted) {
    return null;
  }

  return (
    <nav className="bg-black border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/groeimet-ai-logo.svg"
                alt="GroeimetAI"
                width={150}
                height={62}
                className="h-10 w-auto max-w-[150px]"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-white font-medium px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'text-orange bg-orange/10' 
                      : 'hover:text-orange hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <NotificationCenter />
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-orange hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Instellingen
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-white hover:text-orange hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-orange hover:bg-white/10"
                  >
                    Inloggen
                  </Button>
                </Link>
                <Link href="/agent-readiness">
                  <Button className="bg-orange hover:bg-orange-600 text-white">
                    Start Assessment
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
              className="md:hidden bg-white/5 backdrop-blur-xl border-t border-white/10"
            >
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col space-y-2">
                  {/* Navigation Section */}
                  <div className="mb-4">
                    <p className="text-white/40 text-xs uppercase tracking-wide px-4 mb-2">
                      Navigatie
                    </p>
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center text-white font-medium py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="w-5 h-5 mr-3 text-white/60" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  
                  {/* User Section */}
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white/40 text-xs uppercase tracking-wide px-4 mb-2">
                      {user ? 'Account' : 'Aan de slag'}
                    </p>
                    {user ? (
                      <>
                        <div className="px-4 mb-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center">
                              <Bell className="w-5 h-5 mr-2 text-white/60" />
                              <span className="text-white/80 text-sm">Notificaties</span>
                            </div>
                            <NotificationCenter />
                          </div>
                        </div>
                        <Link href="/settings" onClick={() => setIsOpen(false)}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-white/5 py-3"
                          >
                            <Settings className="w-5 h-5 mr-3" />
                            Instellingen
                          </Button>
                        </Link>
                        <Button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          variant="ghost"
                          className="w-full justify-start text-white hover:bg-white/5 py-3"
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-white/5 py-3"
                          >
                            <User className="w-5 h-5 mr-3" />
                            Inloggen
                          </Button>
                        </Link>
                        <Link href="/agent-readiness" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-orange hover:bg-orange-600 text-white">
                            Start Assessment
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}