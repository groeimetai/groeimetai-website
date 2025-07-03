'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function LocaleDebug() {
  const locale = useLocale();
  const pathname = usePathname();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
      <div>Current Locale: <span className="font-bold text-orange-500">{locale}</span></div>
      <div>Pathname: <span className="font-bold text-orange-500">{pathname}</span></div>
      <div>Cookies: <span className="font-bold text-orange-500">{typeof window !== 'undefined' ? document.cookie : 'SSR'}</span></div>
    </div>
  );
}