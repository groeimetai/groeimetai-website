import { getTranslations } from 'next-intl/server';

interface CrawlerNavProps {
  locale: string;
}

export default async function CrawlerNav({ locale }: CrawlerNavProps) {
  const t = await getTranslations({ locale, namespace: 'redesign.nav' });

  const links = [
    { href: `/${locale}`, label: 'GroeimetAI' },
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/agents`, label: t('agents') },
    { href: `/${locale}/trainingen`, label: t('trainingen') },
    { href: `/${locale}/cases`, label: t('cases') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  return (
    <nav aria-label="Main navigation" className="sr-only">
      <ul>
        {links.map((link, i) => (
          <li key={`${link.href}-${i}`}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
