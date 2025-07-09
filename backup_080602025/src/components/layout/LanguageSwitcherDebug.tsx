'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcherDebug() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = () => {
    const newLocale = locale === 'nl' ? 'en' : 'nl';

    // Get current path without locale
    const segments = pathname.split('/');
    const currentLocale = segments[1];

    // Check if first segment is a locale
    if (currentLocale === 'nl' || currentLocale === 'en') {
      segments[1] = newLocale;
    } else {
      // No locale in path, add it
      segments.unshift('', newLocale);
    }

    const newPath = segments.join('/').replace('//', '/');

    startTransition(() => {
      // Force a hard navigation to ensure everything reloads
      window.location.href = newPath;
    });
  };

  return (
    <div className="flex flex-col gap-2">
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
      {process.env.NODE_ENV !== 'production' && (
        <div className="text-xs text-white/50">
          <div>Locale: {locale}</div>
          <div>Path: {pathname}</div>
        </div>
      )}
    </div>
  );
}
