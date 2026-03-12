import { getTranslations } from 'next-intl/server';

interface CrawlerNavProps {
  locale: string;
}

export default async function CrawlerNav({ locale }: CrawlerNavProps) {
  const t = await getTranslations({ locale, namespace: 'navigation' });

  const links = [
    { href: `/${locale}`, label: 'GroeimetAI' },
    { href: `/${locale}/services`, label: t('services') },
    { href: `/${locale}/cases`, label: t('cases') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/faq`, label: t('faq') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  return (
    <nav aria-label="Main navigation" className="sr-only">
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
