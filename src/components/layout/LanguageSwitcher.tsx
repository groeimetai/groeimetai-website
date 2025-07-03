'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = () => {
    // Toggle between nl and en
    const newLocale = locale === 'nl' ? 'en' : 'nl';
    
    // Set cookie for language preference
    document.cookie = `NEXT_LOCALE=${newLocale}; max-age=${365 * 24 * 60 * 60}; path=/; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`;
    
    // Remove the current locale from the pathname if it exists
    const pathWithoutLocale = pathname.replace(/^\/(nl|en)/, '');
    
    // Navigate to the new locale path with transition
    startTransition(() => {
      router.push(`/${newLocale}${pathWithoutLocale}`);
    });
  };

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