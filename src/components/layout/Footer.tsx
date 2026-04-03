import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import { getBrandSiteContent } from '@/data/brandSiteContent';

export default async function Footer() {
  const locale = await getLocale();
  const content = getBrandSiteContent(locale).footer;

  return (
    <footer className="border-t border-white/10 bg-[#0F0F0F] text-[#F6F2E8]">
      <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="max-w-md">
            <p className="text-xl font-semibold tracking-[-0.04em]">GroeimetAI</p>
            <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{content.tagline}</p>
            <div className="mt-6 space-y-3 text-sm text-[#D7D0C4]">
              <a href={`mailto:${content.emailLabel}`} className="flex items-center gap-3 hover:text-white">
                <Mail className="h-4 w-4 text-[#B7C6A5]" />
                <span>{content.emailLabel}</span>
              </a>
              <a href="tel:+31681739018" className="flex items-center gap-3 hover:text-white">
                <Phone className="h-4 w-4 text-[#B7C6A5]" />
                <span>{content.phoneLabel}</span>
              </a>
              <div className="flex items-center gap-3 text-[#C8C0B2]">
                <MapPin className="h-4 w-4 text-[#B7C6A5]" />
                <span>{content.locationLabel}</span>
              </div>
            </div>
          </div>

          {content.groups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9B9386]">{group.title}</p>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-sm text-[#D7D0C4] transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={`/${locale}${link.href === '/' ? '' : link.href}`} className="text-sm text-[#D7D0C4] transition hover:text-white">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-[#9B9386]">{content.bottom}</div>
      </div>
    </footer>
  );
}
