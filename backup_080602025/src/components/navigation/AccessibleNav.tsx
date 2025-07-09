'use client';

import React, { useState, useRef } from 'react';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  Home,
  Briefcase,
  Users,
  BookOpen,
  Phone,
  MessageSquare,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { announce, useKeyboardNavigation } from '@/lib/accessibility';

interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

export const AccessibleNav: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: <Home className="h-4 w-4" />,
    },
    {
      id: 'services',
      label: 'Services',
      icon: <Briefcase className="h-4 w-4" />,
      children: [
        { id: 'genai', label: 'GenAI Solutions', href: '/services/genai' },
        { id: 'servicenow', label: 'ServiceNow Consultancy', href: '/services/servicenow' },
        { id: 'virtual-agents', label: 'AI Virtual Agents', href: '/services/virtual-agents' },
        { id: 'custom-apps', label: 'Custom AI Apps', href: '/services/custom-apps' },
      ],
    },
    {
      id: 'about',
      label: 'About Us',
      href: '/about',
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 'resources',
      label: 'Resources',
      href: '/resources',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: 'contact',
      label: 'Contact',
      href: '/contact',
      icon: <Phone className="h-4 w-4" />,
    },
  ];

  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );

    const isOpen = !openDropdowns.includes(itemId);
    announce(
      `${navItems.find((item) => item.id === itemId)?.label} submenu ${isOpen ? 'expanded' : 'collapsed'}`,
      'polite'
    );
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    announce(`Mobile menu ${!isMobileMenuOpen ? 'opened' : 'closed'}`, 'polite');
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: NavItem) => {
    if (item.children) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown(item.id);
      } else if (e.key === 'Escape' && openDropdowns.includes(item.id)) {
        e.preventDefault();
        toggleDropdown(item.id);
      }
    }
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <nav
        ref={navRef}
        id="main-navigation"
        role="navigation"
        aria-label="Main navigation"
        className="bg-white shadow-sm sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center space-x-2 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2"
                aria-label="GroeimetAI Home"
              >
                <span className="text-blue-600">Groeimet</span>
                <span>AI</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {navItems.map((item) => (
                <div key={item.id} className="relative">
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        onKeyDown={(e) => handleKeyDown(e, item)}
                        aria-expanded={openDropdowns.includes(item.id)}
                        aria-haspopup="true"
                        className={cn(
                          'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                          isActive(item.href) ? 'text-blue-600' : 'text-gray-700'
                        )}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            openDropdowns.includes(item.id) && 'rotate-180'
                          )}
                        />
                      </button>

                      {openDropdowns.includes(item.id) && (
                        <div
                          className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                          role="menu"
                          aria-orientation="vertical"
                        >
                          <div className="py-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.id}
                                href={child.href!}
                                className={cn(
                                  'block px-4 py-2 text-sm transition-colors',
                                  'hover:bg-gray-100 focus:outline-none focus:bg-gray-100',
                                  isActive(child.href)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700'
                                )}
                                role="menuitem"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href!}
                      className={cn(
                        'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-700'
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}

              {/* CTA Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="User Dashboard"
                >
                  <User className="h-4 w-4" />
                  <span className="sr-only">Dashboard</span>
                </Link>

                <button
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Start chat consultation"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Start Chat</span>
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden bg-white border-t border-gray-200"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <div key={item.id}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        onKeyDown={(e) => handleKeyDown(e, item)}
                        aria-expanded={openDropdowns.includes(item.id)}
                        aria-haspopup="true"
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium',
                          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                          isActive(item.href) ? 'text-blue-600' : 'text-gray-700'
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            openDropdowns.includes(item.id) && 'rotate-180'
                          )}
                        />
                      </button>

                      {openDropdowns.includes(item.id) && (
                        <div className="pl-8 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href!}
                              className={cn(
                                'block px-3 py-2 rounded-md text-sm font-medium',
                                'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                                isActive(child.href) ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                              )}
                              role="menuitem"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href!}
                      className={cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium',
                        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-700'
                      )}
                      role="menuitem"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile CTA */}
              <div className="pt-4 space-y-2">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <User className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>

                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <MessageSquare className="h-5 w-5" />
                  <span>Start Chat</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default AccessibleNav;
