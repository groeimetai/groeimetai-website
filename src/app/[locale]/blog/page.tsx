'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';
import { Calendar, Clock, User, Search, ArrowRight, Tag } from 'lucide-react';

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
    <main className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      {/* Hero Section */}
      <section className="pt-28 pb-20 sm:pt-32 sm:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F87315]/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-[-0.02em]">
              <span
                className="text-white px-4 py-2 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.4)',
                }}
              >
                GroeimetAI Blog
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 mb-8">
              Insights, tutorials en de laatste ontwikkelingen in AI
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <Input
                type="search"
                placeholder="Zoek artikelen..."
                className="pl-12 pr-4 py-6 text-lg bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#FF9F43] transition-colors"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Featured Posts */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.02em]">
              Uitgelichte{' '}
              <span
                className="text-white px-2 py-0.5 inline-block"
                style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
              >
                Artikelen
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts
              .filter((post) => post.featured)
              .map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden bg-white/[0.03] border-white/10 hover:border-white/20 transition-all duration-300 group">
                    <div className="aspect-video bg-gradient-to-br from-white/5 to-white/10 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/30 text-sm">Artikel afbeelding</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Badge
                          className="bg-[#F87315]/20 text-[#FF9F43] border-[#F87315]/30 hover:bg-[#F87315]/30"
                        >
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-white/50">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString('nl-NL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-white group-hover:text-[#FF9F43] transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-white/60 mb-4 leading-relaxed">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-white/50">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#FF9F43] hover:text-white hover:bg-white/10 transition-colors"
                          >
                            Lees meer
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* All Posts with Categories */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-semibold text-white mb-6">Categorieën</h3>
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {category}
                        {category === 'Alle Artikelen' && (
                          <span className="ml-auto text-white/50">{blogPosts.length}</span>
                        )}
                      </Button>
                    ))}
                  </div>

                  {/* Popular Tags */}
                  <h3 className="text-xl font-semibold text-white mt-12 mb-6">Populaire Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {['AI Agents', 'LLM', 'RAG', 'ServiceNow', 'Security', 'GenAI'].map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer border-white/20 text-white/70 hover:border-[#FF9F43] hover:text-[#FF9F43] transition-colors"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </aside>

              {/* Blog Posts Grid */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="mb-8"
                >
                  <h2 className="text-3xl font-bold text-white tracking-[-0.02em]">Alle Artikelen</h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                  {blogPosts
                    .filter((post) => !post.featured)
                    .map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        viewport={{ once: true }}
                      >
                        <Card className="overflow-hidden bg-white/[0.03] border-white/10 hover:border-white/20 transition-all duration-300 group">
                          <div className="aspect-video bg-gradient-to-br from-white/5 to-white/10 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white/30 text-sm">Artikel afbeelding</span>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <Badge className="bg-[#F87315]/20 text-[#FF9F43] border-[#F87315]/30">
                                {post.category}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-white/50">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.date).toLocaleDateString('nl-NL', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-[#FF9F43] transition-colors">
                              <Link href={`/blog/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h3>
                            <p className="text-white/60 mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-white/50">
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#FF9F43] hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  Lees meer
                                  <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-2 mt-12">
                  <Button variant="outline" size="sm" disabled className="border-white/20 text-white/50">
                    Vorige
                  </Button>
                  <Button
                    size="sm"
                    className="text-white"
                    style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                  >
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    3
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    Volgende
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Newsletter CTA */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-white/[0.05] to-white/[0.08] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-[-0.02em]">
                Blijf op de hoogte
              </h2>
              <p className="text-lg text-white/70 mb-8">
                Ontvang de laatste AI insights en updates direct in uw inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="uw.email@bedrijf.nl"
                  className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#FF9F43]"
                />
                <Button
                  className="text-white font-medium transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                    boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                  }}
                >
                  Aanmelden
                </Button>
              </div>
              <p className="text-sm text-white/50 mt-4">
                Geen spam, alleen waardevolle content. Uitschrijven kan altijd.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
