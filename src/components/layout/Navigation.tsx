'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { StartProjectButton } from '@/components/ui/StartProjectButton';
import { Menu, X, LogOut, LayoutDashboard, Briefcase, Users, Phone, FileText, Globe, Bell, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationCenter from '@/components/NotificationCenter';
import { CommandPaletteButton } from '@/components/CommandPalette';
import ClientOnly from '@/components/ClientOnly';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('navigation');

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: t('services'), href: '/services', icon: Briefcase },
    { label: t('cases'), href: '/cases', icon: FileText },
    { label: t('about'), href: '/about', icon: Users },
    { label: t('contact'), href: '/contact', icon: Phone },
  ];

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/90 backdrop-blur-lg shadow-xl' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white font-medium px-3 py-2 rounded-lg hover-orange"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <ClientOnly>
                    <CommandPaletteButton />
                  </ClientOnly>
                  <NotificationCenter />
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-white hover:text-orange hover:bg-white/10 hover-lift"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {t('dashboard')}
                    </Button>
                  </Link>
                  <ClientOnly>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="text-white hover:text-orange hover:bg-white/10 hover-lift"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </Button>
                  </ClientOnly>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-white hover:text-orange hover:bg-white/10 hover-lift"
                    >
                      {t('signIn')}
                    </Button>
                  </Link>
                  <StartProjectButton
                    className="bg-orange hover:bg-orange-600 text-white border-0 shadow-orange hover-lift"
                    preselectedService="genai-consultancy"
                  >
                    {t('getStarted')}
                  </StartProjectButton>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden relative p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-2">
                {/* Navigation Section */}
                <div className="mb-4">
                  <p className="text-white/40 text-xs uppercase tracking-wide px-4 mb-2">Navigation</p>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center text-white font-medium py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-3 text-white/60" />
                      {item.label}
                    </Link>
                  ))}
                </div>
                {/* Language Section */}
                <div className="border-t border-white/10 pt-4 mb-4">
                  <p className="text-white/40 text-xs uppercase tracking-wide px-4 mb-2">Language</p>
                  <div className="px-4">
                    <LanguageSwitcher />
                  </div>
                </div>
                {/* User Section */}
                <div className="border-t border-white/10 pt-4">
                  <p className="text-white/40 text-xs uppercase tracking-wide px-4 mb-2">{user ? 'Account' : 'Get Started'}</p>
                  {user ? (
                    <>
                      <div className="px-4 mb-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div className="flex items-center">
                            <Bell className="w-5 h-5 mr-2 text-white/60" />
                            <span className="text-white/80 text-sm">Notifications</span>
                          </div>
                          <NotificationCenter />
                        </div>
                      </div>
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-white hover:bg-white/5 py-3"
                        >
                          <LayoutDashboard className="w-5 h-5 mr-3" />
                          {t('dashboard')}
                        </Button>
                      </Link>
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
                        className="w-full bg-orange hover:bg-orange-600 text-white border-0 shadow-lg shadow-orange/20"
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
    </motion.nav>
  );
}
