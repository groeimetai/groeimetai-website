// Blog index for /[locale]/blog.
//
// Renders from the real content registry in src/content/blog — the same registry the
// detail pages at /[locale]/blog/[slug] use — instead of the hardcoded mock array this
// file used to hold.
//
// Deliberately a server component (no 'use client'): every post title, excerpt and link
// has to be present in the server-rendered HTML, because the AI crawlers this page exists
// for (GPTBot, ClaudeBot, PerplexityBot) do not execute JavaScript. Keeping it on the
// server also keeps the 16 markdown bodies out of the client bundle.

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/routing';
import { listPosts } from '@/content/blog';
import type { BlogPost, Locale } from '@/content/types';
import { ArrowRight, Calendar, Clock, Tag, User } from 'lucide-react';

interface Copy {
  heroTitle: string;
  heroIntro: string;
  count: (n: number) => string;
  latestLead: string;
  latestAccent: string;
  allHeading: string;
  allHeadingSolo: string;
  categoriesHeading: string;
  topicsHeading: string;
  readMore: string;
  minRead: string;
  emptyHeading: string;
  emptyBody: (n: number) => string;
  emptyCta: string;
  ctaHeadline: string;
  ctaBody: string;
  ctaLabel: string;
}

const COPY: Record<Locale, Copy> = {
  nl: {
    heroTitle: 'GroeimetAI Blog',
    heroIntro:
      'Nuchtere artikelen over AI-training, strategie, adoptie, workflow-herontwerp en veilige integraties — zonder hype.',
    count: (n) => (n === 1 ? '1 artikel' : `${n} artikelen`),
    latestLead: 'Nieuwste',
    latestAccent: 'artikelen',
    allHeading: 'Meer artikelen',
    allHeadingSolo: 'Alle artikelen',
    categoriesHeading: 'Categorieën',
    topicsHeading: 'Onderwerpen',
    readMore: 'Lees artikel',
    minRead: 'min lezen',
    emptyHeading: 'Nog geen artikelen in deze taal',
    emptyBody: (n) =>
      n === 1
        ? 'Er staat op dit moment 1 artikel op de site, in het Nederlands.'
        : `Er staan op dit moment ${n} artikelen op de site, alle in het Nederlands.`,
    emptyCta: 'Naar de Nederlandse artikelen',
    ctaHeadline: 'Vragen over waar je begint?',
    ctaBody:
      'Stel ze gewoon. Je krijgt een eerlijk antwoord — ook als dat is dat AI hier voorlopig niets toevoegt.',
    ctaLabel: 'Neem contact op',
  },
  en: {
    heroTitle: 'GroeimetAI Blog',
    heroIntro:
      'Pragmatic articles on AI training, strategy, adoption, workflow redesign and safe integrations — without the hype.',
    count: (n) => (n === 1 ? '1 article' : `${n} articles`),
    latestLead: 'Latest',
    latestAccent: 'articles',
    allHeading: 'More articles',
    allHeadingSolo: 'All articles',
    categoriesHeading: 'Categories',
    topicsHeading: 'Topics',
    readMore: 'Read article',
    minRead: 'min read',
    emptyHeading: 'No articles in this language yet',
    emptyBody: (n) =>
      n === 1
        ? 'There is currently 1 article on the site, written in Dutch.'
        : `There are currently ${n} articles on the site, all written in Dutch.`,
    emptyCta: 'Go to the Dutch articles',
    ctaHeadline: 'Not sure where to start?',
    ctaBody:
      'Just ask. You get an honest answer — including when AI adds nothing here for now.',
    ctaLabel: 'Get in touch',
  },
};

function formatDate(date: string, locale: Locale, month: 'long' | 'short'): string {
  return new Date(date).toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US', {
    year: 'numeric',
    month,
    day: 'numeric',
  });
}

function countBy(values: string[]): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => (b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]));
}

function PostCard({
  post,
  locale,
  copy,
  size,
}: {
  post: BlogPost;
  locale: Locale;
  copy: Copy;
  size: 'lg' | 'sm';
}) {
  const href = `/blog/${post.slug}`;

  return (
    <Card className="h-full overflow-hidden bg-white/[0.03] border-white/10 hover:border-white/20 transition-all duration-300 group">
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Badge className="bg-[#F87315]/20 text-[#FF9F43] border-[#F87315]/30 hover:bg-[#F87315]/30">
            {post.category}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-white/50">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.date}>
              {formatDate(post.date, locale, size === 'lg' ? 'long' : 'short')}
            </time>
          </span>
        </div>

        <h3
          className={`${
            size === 'lg' ? 'text-xl sm:text-2xl' : 'text-xl'
          } font-semibold mb-3 text-white group-hover:text-[#FF9F43] transition-colors`}
        >
          <Link href={href}>{post.title}</Link>
        </h3>

        <p className="text-white/60 mb-4 leading-relaxed">{post.excerpt}</p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.author.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readMinutes} {copy.minRead}
            </span>
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#FF9F43] hover:text-white transition-colors"
          >
            {copy.readMore}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function BlogPage({ params }: { params: { locale: string } }) {
  const locale: Locale = params.locale === 'en' ? 'en' : 'nl';
  const copy = COPY[locale];

  const posts = listPosts(locale);
  const dutchPostCount = listPosts('nl').length;

  // Only split off a "latest" block when there is enough behind it for the grid.
  const latest = posts.length > 3 ? posts.slice(0, 2) : [];
  const rest = posts.length > 3 ? posts.slice(2) : posts;

  const categories = countBy(posts.map((post) => post.category));
  const topics = countBy(posts.flatMap((post) => post.tags))
    .slice(0, 10)
    .map(([tag]) => tag);

  return (
    <main className="min-h-screen bg-[#080D14]">
      {/* Hero Section */}
      <section className="pt-28 pb-20 sm:pt-32 sm:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F87315]/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-[-0.02em]">
              <span
                className="text-white px-4 py-2 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.4)',
                }}
              >
                {copy.heroTitle}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70">{copy.heroIntro}</p>
            {posts.length > 0 && (
              <p className="mt-4 text-sm text-white/50">{copy.count(posts.length)}</p>
            )}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {posts.length === 0 ? (
        /* No posts in this locale — say so instead of showing another language's list. */
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white/[0.03] border border-white/10 rounded-2xl p-8 sm:p-10 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-[-0.02em]">
                {copy.emptyHeading}
              </h2>
              <p className="text-white/60 mb-6">{copy.emptyBody(dutchPostCount)}</p>
              <a
                href="/nl/blog"
                hrefLang="nl"
                className="inline-flex items-center gap-2 bg-[#F87315] hover:bg-[#E5680F] text-white font-medium h-12 px-6 rounded-lg transition-colors"
              >
                {copy.emptyCta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      ) : (
        <>
          {latest.length > 0 && (
            <>
              {/* Latest posts */}
              <section className="py-20 sm:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.02em]">
                      {copy.latestLead}{' '}
                      <span
                        className="text-white px-2 py-0.5 inline-block"
                        style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                      >
                        {copy.latestAccent}
                      </span>
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {latest.map((post) => (
                      <PostCard key={post.slug} post={post} locale={locale} copy={copy} size="lg" />
                    ))}
                  </div>
                </div>
              </section>

              {/* Section Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </>
          )}

          {/* All posts with category overview */}
          <section className="py-20 sm:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12">
                  {/* Sidebar */}
                  <aside className="lg:w-64 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-white mb-6">
                      {copy.categoriesHeading}
                    </h2>
                    <ul className="space-y-2">
                      {categories.map(([category, count]) => (
                        <li
                          key={category}
                          className="flex items-center justify-between px-3 py-2 rounded-md bg-white/[0.03] border border-white/10 text-sm text-white/70"
                        >
                          <span>{category}</span>
                          <span className="text-white/40">{count}</span>
                        </li>
                      ))}
                    </ul>

                    {topics.length > 0 && (
                      <>
                        <h2 className="text-xl font-semibold text-white mt-12 mb-6">
                          {copy.topicsHeading}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {topics.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-xs text-white/60"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </aside>

                  {/* Post grid */}
                  <div className="flex-1">
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-white tracking-[-0.02em]">
                        {latest.length > 0 ? copy.allHeading : copy.allHeadingSolo}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {rest.map((post) => (
                        <PostCard
                          key={post.slug}
                          post={post}
                          locale={locale}
                          copy={copy}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Closing CTA */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-white/[0.05] to-white/[0.08] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-[-0.02em]">
                {copy.ctaHeadline}
              </h2>
              <p className="text-lg text-white/70 mb-8">{copy.ctaBody}</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-white font-medium h-12 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                }}
              >
                {copy.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
