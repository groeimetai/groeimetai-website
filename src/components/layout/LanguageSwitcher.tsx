'use client';

import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useTransition, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = async () => {
    // Toggle between nl and en
    const newLocale = locale === 'nl' ? 'en' : 'nl';

    // Update user preferences if logged in
    if (user?.uid) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'preferences.language': newLocale,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error updating user language preference:', error);
      }
    }

    // Navigate to the new locale with transition
    if (mounted) {
      startTransition(() => {
        router.replace(pathname, { locale: newLocale });
      });
    }
  };

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLanguageChange}
      disabled={isPending}
      className="text-white hover:text-orange hover:bg-white/10 hover-lift"
      aria-label={locale === 'nl' ? 'Switch to English' : 'Schakel naar Nederlands'}
    >
      <Globe className={`w-4 h-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
      <span className="font-medium">{locale === 'nl' ? 'EN' : 'NL'}</span>
    </Button>
  );
}
