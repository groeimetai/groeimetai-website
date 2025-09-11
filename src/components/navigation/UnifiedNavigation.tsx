'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import {
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Bell,
  ChevronDown,
  Search,
  Globe,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { UnifiedNavigationProps, NavigationItem } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationCenter from '@/components/NotificationCenter';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { StartProjectButton } from '@/components/ui/StartProjectButton';
import { CommandPaletteButton } from '@/components/CommandPalette';
import ClientOnly from '@/components/ClientOnly';

export default function UnifiedNavigation({
  config,
  userContext,
  navigationContext,
  items,
  onNotificationClick,
  onSettingsClick,
  onUserMenuClick,
  className = '',
  children
}: UnifiedNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  
  const { logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('navigation');
  const navRef = useRef<HTMLElement>(null);

  // Mount check for SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      if (mounted) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns(prev =>
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  // Filter items based on user permissions
  const filteredItems = items.filter(item => {
    if (item.requiresAuth && !userContext.isAuthenticated) {
      return false;
    }
    if (item.requiresAdmin && !userContext.isAdmin) {
      return false;
    }
    return true;
  });

  // Check if item is active
  const isActive = (item: NavigationItem) => {
    if (!item.href) return false;
    return navigationContext.currentPath === item.href || 
           (item.href !== '/' && navigationContext.currentPath.startsWith(item.href));
  };

  // Get page context styles
  const getPageContextStyles = () => {
    if (navigationContext.currentPath.includes('/dashboard/admin')) {
      return {
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30'
      };
    }
    if (navigationContext.currentPath.includes('/dashboard')) {
      return {
        color: 'text-green-500',
        bg: 'bg-green-500/10', 
        border: 'border-green-500/30'
      };
    }
    return {
      color: 'text-orange',
      bg: 'bg-orange/10',
      border: 'border-orange/30'
    };
  };

  const pageStyles = getPageContextStyles();

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  // Hide navigation on dashboard pages (legacy compatibility)
  const isDashboardPage = navigationContext.currentPath?.includes('/dashboard') || 
                          navigationContext.currentPath?.includes('/admin-dashboard') || 
                          navigationContext.currentPath?.includes('/settings');

  if (isDashboardPage && config.theme.variant === 'transparent') {
    return null;
  }

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <motion.nav
        ref={navRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? `${config.theme.background}/90 backdrop-blur-lg shadow-xl` 
            : config.theme.background
        } ${className}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Page Context */}
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-3"
                aria-label={`${config.logoAlt} Home`}
              >
                <Image
                  src={config.logoSrc}
                  alt={config.logoAlt}
                  width={150}
                  height={62}
                  className="h-10 w-auto max-w-[150px]"
                  priority
                />
              </Link>
              
              {/* Page Context */}
              {navigationContext.pageTitle && (
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-px h-6 bg-white/20"></div>
                  <div className={`px-3 py-1 rounded-full ${pageStyles.bg} ${pageStyles.border} border`}>
                    <span className={`text-sm font-medium ${pageStyles.color}`}>
                      {navigationContext.pageTitle}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {filteredItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                
                if (item.children && item.children.length > 0) {
                  return (
                    <DropdownMenu key={item.id}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center gap-2 ${
                            active 
                              ? `bg-orange text-white` 
                              : `${config.theme.textColor} hover:text-white hover:bg-white/10`
                          }`}
                          aria-expanded={openDropdowns.includes(item.id)}
                          aria-haspopup="true"
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span className="hidden xl:block">{item.label}</span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="start" 
                        className="bg-black/95 border-white/20"
                      >
                        {item.children.map((child) => (
                          <DropdownMenuItem key={child.id} asChild>
                            <Link 
                              href={child.href!}
                              className="text-white hover:text-orange"
                            >
                              {child.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                
                return (
                  <Link key={item.id} href={item.href!}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-2 ${
                        active 
                          ? 'bg-orange text-white' 
                          : `${config.theme.textColor} hover:text-white hover:bg-white/10`
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
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

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              {config.showSearch && (
                <CommandPaletteButton />
              )}

              {/* Language Switcher */}
              {config.showLanguageSwitcher && (
                <LanguageSwitcher />
              )}

              {/* User Section */}
              {userContext.isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {/* Notifications */}
                  {config.showNotifications && (
                    <NotificationCenter />
                  )}

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 text-white hover:text-orange hover:bg-white/10"
                      >
                        <div className="w-8 h-8 bg-orange/20 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-orange" />
                        </div>
                        <div className="hidden sm:block text-left">
                          <p className="text-sm font-medium">
                            {userContext.user?.name || userContext.user?.email}
                          </p>
                          <p className="text-xs text-white/50">
                            {userContext.isAdmin ? 'Admin' : 'User'}
                          </p>
                        </div>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="bg-black/95 border-white/20"
                    >
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="text-white hover:text-orange">
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={onSettingsClick}
                        className="text-white hover:text-orange cursor-pointer"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-white hover:text-orange hover:bg-white/10 hover-lift"
                    >
                      {t('signIn')}
                    </Button>
                  </Link>
                  <StartProjectButton
                    className="bg-orange hover:bg-orange-600 text-white border border-orange shadow-orange hover-lift"
                    preselectedService="genai-consultancy"
                  >
                    {t('getStarted')}
                  </StartProjectButton>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden relative p-2 min-h-[44px] min-w-[44px] touch-manipulation"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-orange" />
                ) : (
                  <Menu className="h-6 w-6 text-white" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/5 backdrop-blur-xl border-t border-white/10 shadow-2xl rounded-b-2xl"
            >
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col space-y-2">
                  {/* Navigation Section */}
                  <div className="mb-4">
                    <p className="text-white/40 text-xs uppercase tracking-wide px-4 mb-2">
                      Navigation
                    </p>
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item);
                      
                      if (item.children && item.children.length > 0) {
                        return (
                          <div key={item.id}>
                            <Button
                              variant="ghost"
                              className={`w-full justify-start ${
                                active 
                                  ? 'bg-orange text-white' 
                                  : 'text-white hover:bg-white/5'
                              }`}
                              onClick={() => toggleDropdown(item.id)}
                            >
                              {Icon && <Icon className="w-5 h-5 mr-3" />}
                              <span className="flex-1 text-left">{item.label}</span>
                              <ChevronDown 
                                className={`w-4 h-4 transition-transform ${
                                  openDropdowns.includes(item.id) ? 'rotate-180' : ''
                                }`} 
                              />
                            </Button>
                            <AnimatePresence>
                              {openDropdowns.includes(item.id) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="ml-8 space-y-1"
                                >
                                  {item.children.map((child) => (
                                    <Link
                                      key={child.id}
                                      href={child.href!}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-start text-white/80 hover:text-white hover:bg-white/5"
                                      >
                                        {child.label}
                                      </Button>
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }
                      
                      return (
                        <Link
                          key={item.id}
                          href={item.href!}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className={`w-full justify-start ${
                              active 
                                ? 'bg-orange text-white' 
                                : 'text-white hover:bg-white/5'
                            }`}
                          >
                            {Icon && <Icon className="w-5 h-5 mr-3" />}
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <Badge className="bg-orange text-white text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Language Section */}
                  {config.showLanguageSwitcher && (
                    <div className="border-t border-white/10 pt-4 mb-4">
                      <p className="text-white/40 text-xs uppercase tracking-wide px-4 mb-2">
                        Language
                      </p>
                      <div className="px-4">
                        <LanguageSwitcher />
                      </div>
                    </div>
                  )}

                  {/* User Section */}
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white/40 text-xs uppercase tracking-wide px-4 mb-2">
                      {userContext.isAuthenticated ? 'Account' : 'Get Started'}
                    </p>
                    {userContext.isAuthenticated ? (
                      <>
                        {config.showNotifications && (
                          <div className="px-4 mb-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                              <div className="flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-white/60" />
                                <span className="text-white/80 text-sm">Notifications</span>
                              </div>
                              <NotificationCenter />
                            </div>
                          </div>
                        )}
                        <ClientOnly>
                          <Button
                            onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                            }}
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-white/5 py-3"
                          >
                            <LogOut className="w-5 h-5 mr-3" />
                            {t('logout')}
                          </Button>
                        </ClientOnly>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-white/5 py-3"
                          >
                            <User className="w-5 h-5 mr-3" />
                            {t('signIn')}
                          </Button>
                        </Link>
                        <StartProjectButton
                          className="w-full bg-orange hover:bg-orange-600 text-white border border-orange shadow-lg shadow-orange/20"
                          preselectedService="genai-consultancy"
                        >
                          {t('getStarted')}
                        </StartProjectButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Context Bar (Mobile) */}
        {navigationContext.pageTitle && (
          <div className="lg:hidden bg-white/5 px-4 py-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${pageStyles.color.replace('text-', 'bg-')}`}></div>
              <span className="text-white text-sm font-medium">{navigationContext.pageTitle}</span>
              {navigationContext.pageSubtitle && (
                <>
                  <span className="text-white/60 text-xs">•</span>
                  <span className="text-white/60 text-xs">{navigationContext.pageSubtitle}</span>
                </>
              )}
            </div>
          </div>
        )}
      </motion.nav>

      {/* Main content wrapper */}
      {children && (
        <main id="main-content" className="pt-20">
          {children}
        </main>
      )}
    </>
  );
}