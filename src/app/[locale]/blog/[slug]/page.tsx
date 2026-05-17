import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allPostSlugs, getPost, getRelatedPosts } from '@/content/blog';
import { ArticleLayout } from '@/components/content/ArticleLayout';
import { MarkdownArticle } from '@/components/content/MarkdownArticle';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/content/types';
import { ArrowRight } from 'lucide-react';

const BASE = 'https://groeimetai.io';

export async function generateStaticParams() {
  return allPostSlugs().map(({ slug, locale }) => ({ slug, locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const post = getPost(params.slug, params.locale as Locale);
  if (!post) return { title: 'Artikel niet gevonden — GroeimetAI Blog' };

  const url = `${BASE}/${params.locale}/blog/${params.slug}`;
  return {
    title: `${post.title} — GroeimetAI`,
    description: post.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [post.author.name],
      locale: params.locale === 'nl' ? 'nl_NL' : 'en_US',
    },
    keywords: post.tags,
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const post = getPost(params.slug, params.locale as Locale);
  if (!post) notFound();

  const url = `${BASE}/${params.locale}/blog/${post.slug}`;
  const related = getRelatedPosts(post, 3);

  return (
    <>
      <ArticleJsonLd
        headline={post.title}
        description={post.excerpt}
        url={url}
        datePublished={post.date}
        dateModified={post.updated || post.date}
        authorName={post.author.name}
        authorUrl={post.author.url}
        image={post.image}
        inLanguage={post.locale}
        keywords={post.tags}
        articleSection={post.category}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Blog', url: `${BASE}/${params.locale}/blog` },
          { name: post.title, url },
        ]}
      />

      <ArticleLayout
        locale={params.locale}
        meta={{
          title: post.title,
          excerpt: post.excerpt,
          date: post.date,
          readMinutes: post.readMinutes,
          category: post.category,
          tags: post.tags,
          authorName: post.author.name,
          authorRole: post.author.role,
        }}
        breadcrumbs={[{ label: post.title }]}
        cta={{
          headline:
            params.locale === 'nl'
              ? 'Herken je dit in jullie organisatie?'
              : 'Recognise this in your organisation?',
          subline:
            params.locale === 'nl'
              ? 'Een verkennend gesprek kost een uur, kost niets, en geeft je drie concrete vervolgstappen ongeacht of we samenwerken.'
              : 'A scoping conversation takes an hour and gives you three concrete next steps regardless of whether we work together.',
          href: `/${params.locale}/contact`,
          label: params.locale === 'nl' ? 'Plan een gesprek' : 'Schedule a conversation',
        }}
        related={
          related.length > 0 ? (
            <section className="py-20 border-t border-white/10">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">
                    {params.locale === 'nl' ? 'Gerelateerde artikelen' : 'Related reading'}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {related.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/blog/${r.slug}`}
                        className="block bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:bg-white/[0.06] hover:border-white/20 transition-all"
                      >
                        <div className="text-xs text-[#F87315] mb-2">{r.category}</div>
                        <h3 className="text-lg font-semibold text-white mb-2">{r.title}</h3>
                        <p className="text-sm text-white/60 line-clamp-3 mb-4">{r.excerpt}</p>
                        <span className="inline-flex items-center text-sm text-white/70">
                          {params.locale === 'nl' ? 'Lees verder' : 'Read on'}
                          <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : undefined
        }
      >
        <MarkdownArticle source={post.body} />
      </ArticleLayout>
    </>
  );
}
