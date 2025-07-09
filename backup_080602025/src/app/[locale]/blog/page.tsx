import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Calendar, Clock, User, Search, ArrowRight, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - GroeimetAI',
  description:
    'Lees de laatste insights over AI, machine learning, LLM integratie en meer op de GroeimetAI blog.',
  openGraph: {
    title: 'GroeimetAI Blog - AI Insights & Updates',
    description: 'Blijf op de hoogte van de laatste ontwikkelingen in AI en machine learning',
  },
};

// Mock blog data - in production this would come from a CMS or database
const blogPosts = [
  {
    id: 1,
    slug: 'multi-agent-systems-future-automation',
    title: 'Multi-Agent Systems: De Toekomst van Enterprise Automation',
    excerpt:
      'Ontdek hoe multi-agent orchestration complexe bedrijfsprocessen revolutioneert en nieuwe mogelijkheden creëert voor automation.',
    content: 'Volledige artikel inhoud...',
    author: 'Dr. Sarah Chen',
    date: '2024-03-15',
    readTime: '8 min',
    category: 'Multi-Agent Systems',
    tags: ['AI Agents', 'Automation', 'Enterprise'],
    image: '/blog/multi-agent-systems.jpg',
    featured: true,
  },
  {
    id: 2,
    slug: 'rag-architectuur-best-practices',
    title: 'RAG Architectuur: Best Practices voor 2024',
    excerpt:
      'Een diepgaande analyse van Retrieval-Augmented Generation en hoe u deze technologie optimaal kunt inzetten.',
    content: 'Volledige artikel inhoud...',
    author: 'Mark van der Berg',
    date: '2024-03-10',
    readTime: '12 min',
    category: 'Technical Deep Dive',
    tags: ['RAG', 'LLM', 'Architecture'],
    image: '/blog/rag-architecture.jpg',
    featured: true,
  },
  {
    id: 3,
    slug: 'servicenow-ai-transformatie',
    title: 'ServiceNow AI: Van ITSM naar Intelligente Workflows',
    excerpt:
      'Hoe AI de ServiceNow platform transformeert en nieuwe mogelijkheden biedt voor service management.',
    content: 'Volledige artikel inhoud...',
    author: 'Tom Jansen',
    date: '2024-03-05',
    readTime: '6 min',
    category: 'ServiceNow',
    tags: ['ServiceNow', 'ITSM', 'AI Integration'],
    image: '/blog/servicenow-ai.jpg',
    featured: false,
  },
  {
    id: 4,
    slug: 'llm-security-compliance',
    title: 'LLM Security: GDPR en AI Act Compliance',
    excerpt:
      'Essentiële overwegingen voor veilige en compliant LLM implementaties in de Europese markt.',
    content: 'Volledige artikel inhoud...',
    author: 'Emma Rodriguez',
    date: '2024-02-28',
    readTime: '10 min',
    category: 'Security & Compliance',
    tags: ['Security', 'GDPR', 'AI Act', 'Compliance'],
    image: '/blog/llm-security.jpg',
    featured: false,
  },
  {
    id: 5,
    slug: 'genai-roi-measurement',
    title: 'GenAI ROI: Meetbare Resultaten en Business Value',
    excerpt: 'Praktische frameworks voor het meten van ROI bij Generative AI implementaties.',
    content: 'Volledige artikel inhoud...',
    author: 'Dr. Sarah Chen',
    date: '2024-02-20',
    readTime: '7 min',
    category: 'Business Strategy',
    tags: ['ROI', 'GenAI', 'Metrics'],
    image: '/blog/genai-roi.jpg',
    featured: false,
  },
  {
    id: 6,
    slug: 'prompt-engineering-advanced',
    title: 'Advanced Prompt Engineering Technieken',
    excerpt: 'Van basis prompts naar geavanceerde technieken voor optimale LLM performance.',
    content: 'Volledige artikel inhoud...',
    author: 'Mark van der Berg',
    date: '2024-02-15',
    readTime: '9 min',
    category: 'Technical Guide',
    tags: ['Prompt Engineering', 'LLM', 'Best Practices'],
    image: '/blog/prompt-engineering.jpg',
    featured: false,
  },
];

const categories = [
  'Alle Artikelen',
  'Multi-Agent Systems',
  'Technical Deep Dive',
  'ServiceNow',
  'Security & Compliance',
  'Business Strategy',
  'Technical Guide',
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-green/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white px-8 py-4 inline-block"
              style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
            >
              GroeimetAI Blog
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Insights, tutorials en de laatste ontwikkelingen in AI
            </p>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="Zoek artikelen..."
                className="pl-10 pr-4 py-6 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">Uitgelichte Artikelen</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts
              .filter((post) => post.featured)
              .map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover-lift hover:shadow-premium transition-all"
                >
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-muted-foreground">Artikel afbeelding</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="secondary">{post.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </div>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
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
      </section>

      {/* All Posts with Categories */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Sidebar */}
              <aside className="lg:w-64">
                <h3 className="text-xl font-semibold mb-6">Categorieën</h3>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <Button key={index} variant="ghost" className="w-full justify-start">
                      {category}
                      {category === 'Alle Artikelen' && (
                        <span className="ml-auto text-muted-foreground">{blogPosts.length}</span>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Popular Tags */}
                <h3 className="text-xl font-semibold mt-12 mb-6">Populaire Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['AI Agents', 'LLM', 'RAG', 'ServiceNow', 'Security', 'GenAI'].map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </aside>

              {/* Blog Posts Grid */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-8">Alle Artikelen</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {blogPosts
                    .filter((post) => !post.featured)
                    .map((post) => (
                      <Card
                        key={post.id}
                        className="overflow-hidden hover-lift hover:shadow-premium transition-all"
                      >
                        <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-muted-foreground">Artikel afbeelding</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Badge variant="secondary">{post.category}</Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.date).toLocaleDateString('nl-NL', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold mb-3">
                            <Link
                              href={`/blog/${post.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {post.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.readTime}
                              </div>
                            </div>
                            <Link href={`/blog/${post.slug}`}>
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

                {/* Pagination */}
                <div className="flex justify-center gap-2 mt-12">
                  <Button variant="outline" size="sm" disabled>
                    Vorige
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-primary text-primary-foreground"
                  >
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Volgende
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-br from-primary/10 to-purple-600/10">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Blijf op de hoogte</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Ontvang de laatste AI insights en updates direct in uw inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input type="email" placeholder="uw.email@bedrijf.nl" className="flex-1" />
                <Button className="shadow-premium hover-lift">Aanmelden</Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Geen spam, alleen waardevolle content. Uitschrijven kan altijd.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
