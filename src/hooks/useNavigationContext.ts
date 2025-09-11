'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserContextData, NavigationContextData, NavigationItem } from '@/types/navigation';
import {
  Home, Users, Mail, Calendar, Settings, FileText, 
  DollarSign, BarChart3, MessageSquare, Phone, Clock,
  User, Briefcase, Target, Rocket, Brain, Database, 
  Shield, Globe, BookOpen, ChevronDown
} from 'lucide-react';

// Hook for managing user context data
export const useUserContext = (): UserContextData => {
  const { user, isAdmin, loading } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasUrgentNotifications, setHasUrgentNotifications] = useState(false);

  // In a real implementation, this would subscribe to notifications
  useEffect(() => {
    if (user) {
      // Mock notification data - replace with real subscription
      setNotificationCount(3);
      setHasUrgentNotifications(true);
    } else {
      setNotificationCount(0);
      setHasUrgentNotifications(false);
    }
  }, [user]);

  return {
    isAuthenticated: !!user && !loading,
    isAdmin: isAdmin,
    user: user ? {
      id: user.uid,
      name: user.displayName || user.name,
      email: user.email,
      avatar: user.photoURL
    } : undefined,
    notifications: {
      unreadCount: notificationCount,
      hasUrgent: hasUrgentNotifications
    }
  };
};

// Hook for managing navigation context
export const useNavigationContext = (): NavigationContextData => {
  const pathname = usePathname();

  const contextData = useMemo(() => {
    // Determine page context based on pathname
    if (pathname.includes('/dashboard/admin/contacts')) {
      return {
        currentPath: pathname,
        pageTitle: 'Contact Management',
        pageSubtitle: 'Beheer contact aanvragen en plan meetings',
        breadcrumbs: [
          { label: 'Dashboard', href: '/dashboard', icon: Home },
          { label: 'Admin', href: '/dashboard/admin', icon: Settings },
          { label: 'Contacts', icon: Mail }
        ]
      };
    }
    
    if (pathname.includes('/dashboard/admin/calendar')) {
      return {
        currentPath: pathname,
        pageTitle: 'Calendar Management',
        pageSubtitle: 'Google Calendar en meeting overzicht',
        breadcrumbs: [
          { label: 'Dashboard', href: '/dashboard', icon: Home },
          { label: 'Admin', href: '/dashboard/admin', icon: Settings },
          { label: 'Calendar', icon: Calendar }
        ]
      };
    }
    
    if (pathname.includes('/dashboard/admin')) {
      return {
        currentPath: pathname,
        pageTitle: 'Admin Dashboard',
        pageSubtitle: 'Systeem beheer en overzichten',
        breadcrumbs: [
          { label: 'Dashboard', href: '/dashboard', icon: Home },
          { label: 'Admin', icon: Settings }
        ]
      };
    }
    
    if (pathname.includes('/dashboard')) {
      return {
        currentPath: pathname,
        pageTitle: 'Dashboard',
        pageSubtitle: 'Uw persoonlijke overzicht',
        breadcrumbs: [
          { label: 'Dashboard', icon: BarChart3 }
        ]
      };
    }
    
    if (pathname.includes('/services')) {
      return {
        currentPath: pathname,
        pageTitle: 'Services',
        pageSubtitle: 'Onze AI Infrastructure diensten',
        breadcrumbs: [
          { label: 'Home', href: '/', icon: Home },
          { label: 'Services', icon: Briefcase }
        ]
      };
    }
    
    if (pathname.includes('/cases')) {
      return {
        currentPath: pathname,
        pageTitle: 'Cases',
        pageSubtitle: 'Succesvolle AI implementaties',
        breadcrumbs: [
          { label: 'Home', href: '/', icon: Home },
          { label: 'Cases', icon: Rocket }
        ]
      };
    }
    
    if (pathname.includes('/contact')) {
      return {
        currentPath: pathname,
        pageTitle: 'Contact',
        pageSubtitle: 'Neem contact op voor AI consultatie',
        breadcrumbs: [
          { label: 'Home', href: '/', icon: Home },
          { label: 'Contact', icon: Phone }
        ]
      };
    }
    
    if (pathname.includes('/about')) {
      return {
        currentPath: pathname,
        pageTitle: 'Over Ons',
        pageSubtitle: 'Leer meer over GroeimetAI',
        breadcrumbs: [
          { label: 'Home', href: '/', icon: Home },
          { label: 'Over Ons', icon: Users }
        ]
      };
    }
    
    return {
      currentPath: pathname,
      pageTitle: 'GroeimetAI',
      pageSubtitle: 'AI Infrastructure Specialists',
      breadcrumbs: [
        { label: 'Home', icon: Home }
      ]
    };
  }, [pathname]);

  return contextData;
};

// Hook for generating navigation items based on user context
export const useNavigationItems = (userContext: UserContextData): NavigationItem[] => {
  return useMemo(() => {
    const baseItems: NavigationItem[] = [
      { 
        id: 'home', 
        label: 'Home', 
        href: '/', 
        icon: Home, 
        description: 'Terug naar homepage' 
      },
      { 
        id: 'services', 
        label: 'Diensten', 
        href: '/services', 
        icon: Briefcase, 
        description: 'Onze AI services',
        children: [
          { id: 'genai', label: 'GenAI Solutions', href: '/services/genai' },
          { id: 'servicenow', label: 'ServiceNow Consultancy', href: '/services/servicenow' },
          { id: 'virtual-agents', label: 'AI Virtual Agents', href: '/services/virtual-agents' },
          { id: 'custom-apps', label: 'Custom AI Apps', href: '/services/custom-apps' }
        ]
      },
      { 
        id: 'cases', 
        label: 'Cases', 
        href: '/cases', 
        icon: Rocket, 
        description: 'Succesvolle projecten' 
      },
      { 
        id: 'about', 
        label: 'Over Ons', 
        href: '/about', 
        icon: Users, 
        description: 'Leer meer over GroeimetAI' 
      },
      { 
        id: 'contact', 
        label: 'Contact', 
        href: '/contact', 
        icon: Phone, 
        description: 'Neem contact op' 
      }
    ];

    // Add assessment for everyone
    baseItems.push({
      id: 'assessment',
      label: 'Agent Assessment',
      href: '/agent-readiness',
      icon: Brain,
      description: 'Test je AI readiness'
    });

    // Authenticated user items
    if (userContext.isAuthenticated) {
      baseItems.push(
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          href: '/dashboard', 
          icon: BarChart3, 
          description: 'Persoonlijk dashboard',
          requiresAuth: true
        },
        { 
          id: 'projects', 
          label: 'Projecten', 
          href: '/dashboard/projects', 
          icon: FileText, 
          description: 'Mijn projecten',
          requiresAuth: true
        },
        { 
          id: 'messages', 
          label: 'Berichten', 
          href: '/dashboard/messages', 
          icon: MessageSquare, 
          description: 'Communicatie',
          requiresAuth: true,
          badge: userContext.notifications?.unreadCount || 0
        }
      );
    }

    // Admin-only items
    if (userContext.isAdmin) {
      baseItems.push(
        { 
          id: 'admin', 
          label: 'Admin Panel', 
          href: '/dashboard/admin', 
          icon: Settings, 
          description: 'Admin dashboard',
          requiresAdmin: true
        },
        { 
          id: 'admin-contacts', 
          label: 'Contact Aanvragen', 
          href: '/dashboard/admin/contacts', 
          icon: Mail, 
          description: 'Beheer contact aanvragen',
          requiresAdmin: true
        },
        { 
          id: 'admin-calendar', 
          label: 'Calendar', 
          href: '/dashboard/admin/calendar', 
          icon: Calendar, 
          description: 'Meeting management',
          requiresAdmin: true
        },
        { 
          id: 'admin-users', 
          label: 'Gebruikers', 
          href: '/dashboard/admin/users', 
          icon: Users, 
          description: 'Gebruiker beheer',
          requiresAdmin: true
        },
        { 
          id: 'admin-quotes', 
          label: 'Offertes', 
          href: '/dashboard/admin/quotes', 
          icon: DollarSign, 
          description: 'Offerte beheer',
          requiresAdmin: true
        }
      );
    }

    return baseItems;
  }, [userContext]);
};

// Hook for filtering navigation items based on user permissions
export const useFilteredNavigationItems = (
  items: NavigationItem[], 
  userContext: UserContextData
): NavigationItem[] => {
  return useMemo(() => {
    return items.filter(item => {
      // Check auth requirements
      if (item.requiresAuth && !userContext.isAuthenticated) {
        return false;
      }
      
      // Check admin requirements
      if (item.requiresAdmin && !userContext.isAdmin) {
        return false;
      }
      
      return true;
    });
  }, [items, userContext]);
};