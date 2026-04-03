import { getBrandSiteContent } from '@/data/brandSiteContent';

interface CrawlerNavProps {
  locale: string;
}

export default async function CrawlerNav({ locale }: CrawlerNavProps) {
  const content = getBrandSiteContent(locale);

  const links = [
    { href: `/${locale}`, label: 'GroeimetAI' },
    ...content.nav.items.map((item) => ({
      href: `/${locale}${item.href === '/' ? '' : item.href}`,
      label: item.label,
    })),
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
