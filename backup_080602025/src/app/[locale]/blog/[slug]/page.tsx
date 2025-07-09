import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Linkedin,
  Twitter,
  Copy,
  Tag,
  ArrowRight,
} from 'lucide-react';

// Mock blog data - in production this would come from a CMS or database
const blogPosts = {
  'multi-agent-systems-future-automation': {
    slug: 'multi-agent-systems-future-automation',
    title: 'Multi-Agent Systems: De Toekomst van Enterprise Automation',
    excerpt:
      'Ontdek hoe multi-agent orchestration complexe bedrijfsprocessen revolutioneert en nieuwe mogelijkheden creëert voor automation.',
    content: `
# Multi-Agent Systems: De Toekomst van Enterprise Automation

Multi-agent systemen vertegenwoordigen een paradigmaverschuiving in hoe we denken over automation en AI in enterprise omgevingen. In plaats van monolithische AI-oplossingen, maken multi-agent systemen gebruik van gespecialiseerde agents die samenwerken om complexe taken uit te voeren.

## Wat zijn Multi-Agent Systems?

Multi-agent systemen bestaan uit meerdere autonome AI-agents die:
- **Gespecialiseerd** zijn in specifieke taken of domeinen
- **Autonoom** kunnen opereren binnen hun domein
- **Communiceren** met andere agents om gezamenlijke doelen te bereiken
- **Adaptief** zijn en kunnen leren van hun ervaringen

## Voordelen voor Enterprise Automation

### 1. Schaalbaarheid
Multi-agent systemen kunnen makkelijk worden uitgebreid door nieuwe agents toe te voegen zonder het hele systeem te hoeven herontwerpen.

### 2. Flexibiliteit
Elk agent kan onafhankelijk worden geüpdatet of vervangen zonder andere delen van het systeem te beïnvloeden.

### 3. Robuustheid
Als één agent faalt, kan het systeem blijven functioneren met de overige agents.

### 4. Parallelle Processing
Meerdere agents kunnen tegelijkertijd aan verschillende aspecten van een probleem werken.

## Praktijkvoorbeelden

### Customer Service Automation
Een multi-agent systeem voor klantenservice kan bestaan uit:
- **Triage Agent**: Categoriseert inkomende vragen
- **Knowledge Agent**: Zoekt relevante informatie
- **Response Agent**: Genereert gepersonaliseerde antwoorden
- **Escalation Agent**: Identificeert complexe cases voor menselijke interventie

### Supply Chain Optimization
In supply chain management kunnen agents verantwoordelijk zijn voor:
- **Demand Forecasting Agent**: Voorspelt vraag op basis van historische data
- **Inventory Agent**: Beheert voorraadniveaus
- **Logistics Agent**: Optimaliseert transportroutes
- **Supplier Agent**: Onderhandelt met leveranciers

## Implementatie Overwegingen

Bij het implementeren van multi-agent systemen zijn er enkele belangrijke overwegingen:

1. **Agent Architectuur**: Bepaal de verantwoordelijkheden van elke agent
2. **Communicatie Protocollen**: Definieer hoe agents met elkaar communiceren
3. **Orchestratie**: Implementeer een robuust orchestratie framework
4. **Monitoring**: Zet comprehensive monitoring op voor alle agents
5. **Security**: Beveilig inter-agent communicatie

## De Toekomst

Multi-agent systemen zullen een cruciale rol spelen in de toekomst van enterprise automation. Met de voortdurende ontwikkeling van AI-technologie zullen deze systemen steeds geavanceerder en capabeler worden.

Bij GroeimetAI helpen we organisaties om het volledige potentieel van multi-agent systemen te benutten. Van architectuur design tot implementatie, wij begeleiden u bij elke stap van uw multi-agent journey.
    `,
    author: 'Dr. Sarah Chen',
    authorRole: 'Chief AI Officer',
    authorBio: '15+ jaar ervaring in AI research en enterprise implementaties',
    date: '2024-03-15',
    readTime: '8 min',
    category: 'Multi-Agent Systems',
    tags: ['AI Agents', 'Automation', 'Enterprise', 'Orchestration', 'Future Tech'],
    image: '/blog/multi-agent-systems.jpg',
    relatedPosts: [
      'rag-architectuur-best-practices',
      'llm-security-compliance',
      'genai-roi-measurement',
    ],
  },
  'rag-architectuur-best-practices': {
    slug: 'rag-architectuur-best-practices',
    title: 'RAG Architectuur: Best Practices voor 2024',
    excerpt:
      'Een diepgaande analyse van Retrieval-Augmented Generation en hoe u deze technologie optimaal kunt inzetten.',
    content: `
# RAG Architectuur: Best Practices voor 2024

Retrieval-Augmented Generation (RAG) heeft zich bewezen als een van de meest effectieve technieken voor het verbeteren van Large Language Models met domein-specifieke kennis. In dit artikel delen we de best practices voor 2024.

## Wat is RAG?

RAG combineert de kracht van:
- **Retrieval Systems**: Voor het ophalen van relevante informatie
- **Generation Models**: Voor het genereren van coherente antwoorden
- **Vector Databases**: Voor efficiënte opslag en retrieval

## Best Practices voor 2024

### 1. Hybrid Search Strategies
Combineer keyword-based search met semantic search voor optimale resultaten.

### 2. Dynamic Chunking
Pas chunk sizes dynamisch aan op basis van content type en use case.

### 3. Multi-Stage Retrieval
Implementeer meerdere retrieval stages voor betere precisie.

### 4. Context Window Optimization
Optimaliseer het gebruik van de context window van uw LLM.

## Implementatie Tips

Bij het implementeren van RAG architectuur zijn deze tips essentieel:
- Start met een proof of concept
- Meet en optimaliseer retrieval quality
- Implementeer robust error handling
- Plan voor schaalbaarheid vanaf het begin

## Conclusie

RAG architectuur blijft evolueren en verbeteren. Door deze best practices te volgen, kunt u een robuust en effectief RAG systeem bouwen dat echte business value levert.
    `,
    author: 'Mark van der Berg',
    authorRole: 'Lead Solutions Architect',
    authorBio: 'Expert in schaalbare AI infrastructuur en enterprise integraties',
    date: '2024-03-10',
    readTime: '12 min',
    category: 'Technical Deep Dive',
    tags: ['RAG', 'LLM', 'Architecture', 'Vector Database', 'Best Practices'],
    image: '/blog/rag-architecture.jpg',
    relatedPosts: [
      'multi-agent-systems-future-automation',
      'llm-security-compliance',
      'prompt-engineering-advanced',
    ],
  },
};

export async function generateStaticParams() {
  const locales = ['en', 'nl'];
  const posts = Object.keys(blogPosts);

  return locales.flatMap((locale) =>
    posts.map((slug) => ({
      locale,
      slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const post = blogPosts[params.slug as keyof typeof blogPosts];

  if (!post) {
    return {
      title: 'Artikel niet gevonden - GroeimetAI Blog',
    };
  }

  return {
    title: `${post.title} - GroeimetAI Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default function BlogPostPage({ params }: { params: { locale: string; slug: string } }) {
  const post = blogPosts[params.slug as keyof typeof blogPosts];

  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = post.relatedPosts
    .map((slug) => blogPosts[slug as keyof typeof blogPosts])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-background">
      {/* Article Header */}
      <article className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back to Blog */}
            <Link
              href={`/${params.locale}/blog`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Blog
            </Link>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge variant="secondary">{post.category}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

            {/* Excerpt */}
            <p className="text-xl text-muted-foreground mb-8">{post.excerpt}</p>

            {/* Featured Image */}
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-8">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">Artikel afbeelding</span>
              </div>
            </div>

            {/* Author Info */}
            <Card className="p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600" />
                <div className="flex-1">
                  <h3 className="font-semibold">{post.author}</h3>
                  <p className="text-sm text-primary mb-1">{post.authorRole}</p>
                  <p className="text-sm text-muted-foreground">{post.authorBio}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="hover-lift">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover-lift">
                    <Twitter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <div
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .replace(/\n/g, '<br />')
                    .replace(/#+\s/g, '<h2>')
                    .replace(/\*\*/g, '<strong>')
                    .replace(/\*/g, '</strong>'),
                }}
              />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/10">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Share Buttons */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Deel dit artikel</h3>
              <div className="flex gap-4">
                <Button variant="outline" className="hover-lift">
                  <Linkedin className="mr-2 w-4 h-4" />
                  LinkedIn
                </Button>
                <Button variant="outline" className="hover-lift">
                  <Twitter className="mr-2 w-4 h-4" />
                  Twitter
                </Button>
                <Button variant="outline" className="hover-lift">
                  <Copy className="mr-2 w-4 h-4" />
                  Kopieer Link
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Gerelateerde Artikelen</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Card
                  key={relatedPost.slug}
                  className="overflow-hidden hover-lift hover:shadow-premium transition-all"
                >
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800">
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Artikel afbeelding</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {relatedPost.category}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-2">
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{relatedPost.readTime}</span>
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <Button variant="ghost" size="sm" className="hover-lift">
                          Lees meer
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-br from-primary/10 to-purple-600/10">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Mis geen enkel artikel</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Ontvang de laatste AI insights direct in uw inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="uw.email@bedrijf.nl"
                  className="flex-1 px-4 py-2 rounded-lg border bg-background"
                />
                <Button className="shadow-premium hover-lift">Aanmelden</Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
