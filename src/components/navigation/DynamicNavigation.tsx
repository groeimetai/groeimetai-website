'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import NotificationCenter from '@/components/NotificationCenter';
import { marketingPrimaryButton } from '@/components/marketing/marketingStyles';
import { getBrandSiteContent } from '@/data/brandSiteContent';
import { LayoutDashboard, LogOut, Menu, Settings, Shield, X } from 'lucide-react';

export default function DynamicNavigation() {
  const pathname = usePathname();
  const locale = useLocale();
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const content = getBrandSiteContent(locale);
  const navItems = content.nav.items;

  useEffect(() => {
    setMounted(true);
    document.body.style.paddingTop = '72px';

    return () => {
      document.body.style.paddingTop = '';
    };
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!mounted) {
    return null;
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#111111]/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
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

          <div className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'bg-white/8 text-[#F6F2E8]'
                    : 'text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            {user ? (
              <>
                <NotificationCenter />
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {content.nav.dashboard}
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/dashboard/admin">
                    <Button variant="ghost" className="text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/settings">
                  <Button variant="ghost" className="text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]">
                    <Settings className="mr-2 h-4 w-4" />
                    {content.nav.settings}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {content.nav.logout}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]">
                    {content.nav.login}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button className={marketingPrimaryButton}>
                    {content.nav.contactCta}
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className="text-[#F6F2E8] hover:bg-white/5"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#111111] lg:hidden">
          <div className="container mx-auto flex flex-col gap-2 px-4 py-5 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'bg-white/8 text-[#F6F2E8]'
                    : 'text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]"
                >
                  {content.nav.dashboard}
                </Link>
                {isAdmin && (
                  <Link
                    href="/dashboard/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]"
                >
                  {content.nav.settings}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]"
                >
                  {content.nav.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[#C8C0B2] hover:bg-white/5 hover:text-[#F6F2E8]"
                >
                  {content.nav.login}
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className={`mt-2 ${marketingPrimaryButton}`}
                >
                  {content.nav.contactCta}
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
