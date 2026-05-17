// Shared layout for long-form content: blog posts, pillar pages, programmatic SEO pages.
// Uses the existing landing-v2 design tokens so it visually belongs with the rest of the site.

import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from 'lucide-react';

export interface ArticleMeta {
  title: string;
  excerpt?: string;
  date?: string;
  readMinutes?: number;
  category?: string;
  tags?: string[];
  authorName?: string;
  authorRole?: string;
}

export function ArticleLayout({
  meta,
  breadcrumbs,
  children,
  cta,
  related,
  locale,
}: {
  meta: ArticleMeta;
  breadcrumbs: Array<{ label: string; href?: string }>;
  children: ReactNode;
  cta?: { headline: string; subline: string; href: string; label: string };
  related?: ReactNode;
  locale: string;
}) {
  return (
    <main className="relative z-10 bg-[#080D14] min-h-screen">
      <article className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm text-white/50 mb-8"
            >
              <Link href={`/${locale}/blog`} className="inline-flex items-center gap-1 hover:text-white/80">
                <ArrowLeft className="w-3.5 h-3.5" />
                {locale === 'nl' ? 'Inzichten' : 'Insights'}
              </Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-white/30">/</span>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-white/80">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white/70">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-white/50">
              {meta.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F87315]/10 text-[#F87315] text-xs font-medium">
                  {meta.category}
                </span>
              )}
              {meta.date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(meta.date).toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              {meta.readMinutes && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {meta.readMinutes} {locale === 'nl' ? 'min lezen' : 'min read'}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-[-0.02em] mb-6">
              {meta.title}
            </h1>

            {meta.excerpt && (
              <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10">
                {meta.excerpt}
              </p>
            )}

            {(meta.authorName || meta.authorRole) && (
              <div className="flex items-center gap-3 pb-8 border-b border-white/10 mb-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F87315] to-[#FF9F43] flex items-center justify-center text-white font-semibold">
                  {(meta.authorName || 'GA').slice(0, 1)}
                </div>
                <div>
                  {meta.authorName && (
                    <div className="text-sm font-medium text-white">{meta.authorName}</div>
                  )}
                  {meta.authorRole && (
                    <div className="text-xs text-white/50">{meta.authorRole}</div>
                  )}
                </div>
              </div>
            )}

            {children}

            {meta.tags && meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-white/10">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-xs text-white/60"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {cta && (
              <div className="mt-16 bg-white/[0.03] border border-white/10 rounded-2xl p-8 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  {cta.headline}
                </h2>
                <p className="text-white/60 mb-6">{cta.subline}</p>
                <Link
                  href={cta.href}
                  className="inline-flex items-center gap-2 bg-[#F87315] hover:bg-[#E5680F] text-white font-medium h-12 px-6 rounded-lg transition-colors"
                >
                  {cta.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </article>

      {related}
    </main>
  );
}
