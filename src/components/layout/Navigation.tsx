'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { StartProjectButton } from '@/components/ui/StartProjectButton';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationCenter from '@/components/NotificationCenter';
import { CommandPaletteButton } from '@/components/CommandPalette';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('navigation');

  const navItems = [
    { label: t('services'), href: '/services' },
    { label: t('cases'), href: '/cases' },
    { label: t('about'), href: '/about' },
    { label: t('contact'), href: '/contact' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-lg shadow-xl' : 'bg-transparent'
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
                  <CommandPaletteButton />
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
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="text-white hover:text-orange hover:bg-white/10 hover-lift"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('logout')}
                  </Button>
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
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-orange" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-white font-medium py-2 px-4 rounded-lg hover-orange"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <hr className="border-white/20" />
                <div className="px-4 py-2">
                  <LanguageSwitcher />
                </div>
                <hr className="border-white/20" />
                {user ? (
                  <>
                    <div className="px-4 flex items-center justify-between">
                      <span className="text-white/60 text-sm">Notifications</span>
                      <NotificationCenter />
                    </div>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:text-orange hover:bg-white/10"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {t('dashboard')}
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-white hover:text-orange hover:bg-white/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:text-orange hover:bg-white/10"
                      >
                        {t('signIn')}
                      </Button>
                    </Link>
                    <div onClick={() => setIsMobileMenuOpen(false)}>
                      <StartProjectButton 
                        className="w-full bg-orange hover:bg-orange-600 text-white border-0"
                        preselectedService="genai-consultancy"
                      >
                        {t('getStarted')}
                      </StartProjectButton>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
