import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Building,
  Users,
  Award,
  BarChart3,
  Target,
} from 'lucide-react';

export interface CaseStudy {
  id: number;
  slug: string;
  title: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: Array<{
    metric: string;
    value: string;
    icon: any;
  }>;
  technologies: string[];
  duration: string;
  featured: boolean;
  details?: string;
}

export const metadata: Metadata = {
  title: 'Case Studies - GroeimetAI',
  description:
    'Discover how GroeimetAI has helped companies with AI transformation. Read our success stories and results.',
  openGraph: {
    title: 'Case Studies - GroeimetAI Success Stories',
    description: 'Proven results in AI consultancy and implementation',
  },
};

const caseStudies: CaseStudy[] = [
  {
    id: 1,
    slug: 'enterprise-llm-implementation',
    title: 'Enterprise LLM Implementation for 50,000 Employees',
    client: 'Major Dutch Bank',
    industry: 'Financial Services',
    challenge:
      'Outdated trigger-based chatbot without NLU for internal support of 50,000 employees. Poor user experience and low resolution rate.',
    solution:
      'Agentic AI framework with Azure OpenAI integration. Agent autonomously decides: live agent transfer, catalog items, knowledge base, direct answers or legacy topics. GPT-4o-mini with intelligent conversation history (last 10 messages).',
    results: [
      { metric: 'Response Time', value: '-85%', icon: Clock },
      { metric: 'Resolution Rate', value: '+72%', icon: Target },
      { metric: 'Cost Savings', value: '€2.8M/year', icon: TrendingUp },
    ],
    technologies: ['Azure OpenAI', 'ServiceNow', 'Agentic AI', 'GPT-4o-mini'],
    duration: 'Feb 2024 - Apr 2025',
    featured: true,
    details:
      'Through implementing an intelligent LLM solution, the bank saves €2.8M annually on support costs. With 50,000 employees submitting an average of 2 tickets per month, saving €2.33 per ticket through automated handling.',
  },
  {
    id: 2,
    slug: 'snelnotuleren-ai-transcription',
    title: 'Snelnotuleren.nl - AI Transcription Platform',
    client: 'GroeimetAI Venture',
    industry: 'SaaS',
    challenge:
      'Dutch market needed a GDPR-compliant AI transcription service for meetings and interviews.',
    solution:
      'GCP-based platform with Firebase, fully GDPR and EU AI Act compliant. Ingenious algorithm for long transcriptions within token limits.',
    results: [
      { metric: 'Tokens Processed', value: '1M+', icon: BarChart3 },
      { metric: 'Hours Transcribed', value: '1500+', icon: Clock },
      { metric: 'Active Users', value: '500+', icon: Users },
    ],
    technologies: ['Google Cloud Platform', 'Firebase', 'Whisper AI', 'LLM Processing'],
    duration: '2023 - July 2025',
    featured: true,
    details:
      'Successful AI venture that processed over a million tokens and transcribed 1500+ hours of meetings with perfect GDPR compliance.',
  },
  {
    id: 3,
    slug: 'groeimetai-learning-platform',
    title: 'GroeimetAI Learning Platform - Multi-Agent Development',
    client: 'GroeimetAI',
    industry: 'EdTech',
    challenge:
      'Rapidly build a complete learning platform for GenAI and LLM courses with certification.',
    solution:
      'Multi-agent orchestration system that built the complete platform. 10+ courses with 4 modules each and 16 lessons. Blockchain verification for certificates.',
    results: [
      { metric: 'Development Time', value: '2 weeks', icon: Clock },
      { metric: 'Courses Built', value: '10+', icon: BarChart3 },
      { metric: 'Agent Efficiency', value: '95%', icon: Target },
    ],
    technologies: ['Multi-Agent Orchestration', 'Next.js', 'Blockchain', 'LLM Content Generation'],
    duration: '2 weeks',
    featured: false,
    details:
      'Revolutionary project where AI agents autonomously developed a complete learning platform, including content creation and blockchain certification.',
  },
  {
    id: 4,
    slug: 'intelligent-ticket-routing',
    title: 'Intelligent Ticket Routing with Vector Database',
    client: 'Major Dutch Bank',
    industry: 'Financial Services',
    challenge:
      'Thousands of Business Service Templates (BSTs) made it impossible for users to find the right template for their issue.',
    solution:
      'LLM-powered widget with vector database for semantic search. User describes problem, AI generates follow-up questions, creates perfect ticket and routes to correct team.',
    results: [
      { metric: 'Routing Accuracy', value: '94%', icon: Target },
      { metric: 'User Time Saved', value: '-78%', icon: Clock },
      { metric: 'BST Reduction', value: '-65%', icon: BarChart3 },
    ],
    technologies: ['Vector Database', 'LLM', 'ServiceNow', 'Semantic Search'],
    duration: '12 weeks',
    featured: false,
    details:
      'Vector database implementation enabling semantic search across thousands of service templates, with intelligent follow-up questions for perfect ticket creation.',
  },
];

const industries = [
  { name: 'Financial Services', count: 2 },
  { name: 'SaaS', count: 1 },
  { name: 'EdTech', count: 1 },
];

export default function CasesPage() {
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
              Case Studies
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Discover how we help companies transform with AI
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div
                  className="inline-flex flex-col items-center p-4"
                  style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                >
                  <div className="text-3xl font-bold text-white">4</div>
                  <div className="text-sm text-white/90">Enterprise Projects</div>
                </div>
              </div>
              <div className="text-center">
                <div
                  className="inline-flex flex-col items-center p-4"
                  style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                >
                  <div className="text-3xl font-bold text-white">€2.8M+</div>
                  <div className="text-sm text-white/90">Annual Savings</div>
                </div>
              </div>
              <div className="text-center">
                <div
                  className="inline-flex flex-col items-center p-4"
                  style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                >
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-sm text-white/90">End Users</div>
                </div>
              </div>
              <div className="text-center">
                <div
                  className="inline-flex flex-col items-center p-4"
                  style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                >
                  <div className="text-3xl font-bold text-white">1M+</div>
                  <div className="text-sm text-white/90">Tokens Processed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">Featured Cases</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {caseStudies
              .filter((cs) => cs.featured)
              .map((caseStudy) => (
                <Card
                  key={caseStudy.id}
                  className="overflow-hidden hover-lift hover:shadow-premium transition-all"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge
                          variant="secondary"
                          className="mb-3 bg-orange/20 text-white border-orange/30"
                        >
                          {caseStudy.industry}
                        </Badge>
                        <h3 className="text-2xl font-semibold mb-2">{caseStudy.title}</h3>
                        <p className="text-white/70">{caseStudy.client}</p>
                      </div>
                      <Building className="w-8 h-8 text-white/70" />
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Challenge</h4>
                      <p className="text-white/70">{caseStudy.challenge}</p>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Solution</h4>
                      <p className="text-white/70">{caseStudy.solution}</p>
                    </div>

                    {caseStudy.details && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2">Impact</h4>
                        <p className="text-white/70">{caseStudy.details}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {caseStudy.results.map((result, index) => (
                        <div key={index} className="text-center">
                          <result.icon className="w-6 h-6 mx-auto mb-2 text-orange" />
                          <div
                            className="inline-block px-3 py-1 text-2xl font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                          >
                            {result.value}
                          </div>
                          <div className="text-xs text-white/70 mt-1">{result.metric}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {caseStudy.technologies.map((tech, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-orange/30 text-white/80"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">
                        Project duration: {caseStudy.duration}
                      </span>
                      <Link href={`/cases/${caseStudy.slug}`}>
                        <Button className="hover-lift">
                          Read More
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

      {/* All Case Studies */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Sidebar */}
              <aside className="lg:w-64">
                <h3 className="text-xl font-semibold mb-6">Filter by Industry</h3>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-between">
                    All Industries
                    <span className="text-white/70">{caseStudies.length}</span>
                  </Button>
                  {industries.map((industry) => (
                    <Button key={industry.name} variant="ghost" className="w-full justify-between">
                      {industry.name}
                      <span className="text-white/70">{industry.count}</span>
                    </Button>
                  ))}
                </div>

                <h3 className="text-xl font-semibold mt-12 mb-6">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Azure OpenAI',
                    'ServiceNow',
                    'Vector Database',
                    'Multi-Agent',
                    'GCP',
                    'Blockchain',
                  ].map((tech) => (
                    <Badge
                      key={tech}
                      variant="outline"
                      className="cursor-pointer hover:bg-orange/10 border-white/20 text-white/80"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </aside>

              {/* Case Studies Grid */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-8">Other Projects</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {caseStudies
                    .filter((cs) => !cs.featured)
                    .map((caseStudy) => (
                      <Card
                        key={caseStudy.id}
                        className="p-6 hover-lift hover:shadow-premium transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant="secondary">{caseStudy.industry}</Badge>
                          <Building className="w-6 h-6 text-white/70" />
                        </div>

                        <h3 className="text-xl font-semibold mb-2">{caseStudy.title}</h3>
                        <p className="text-sm text-white/70 mb-4">{caseStudy.client}</p>

                        <p className="text-white/70 mb-4">{caseStudy.challenge}</p>

                        {caseStudy.details && (
                          <p className="text-sm text-white/60 mb-4">{caseStudy.details}</p>
                        )}

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {caseStudy.results.map((result, index) => (
                            <div key={index} className="text-center">
                              <div
                                className="inline-block px-2 py-1 text-lg font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                              >
                                {result.value}
                              </div>
                              <div className="text-xs text-white/70 mt-1">{result.metric}</div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">{caseStudy.duration}</span>
                          <Link href={`/cases/${caseStudy.slug}`}>
                            <Button variant="outline" size="sm" className="hover-lift">
                              Details
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Impact in Numbers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-6 text-center hover-lift">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-orange" />
                <div
                  className="inline-block px-4 py-2 mb-2 text-3xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                >
                  €2.8M
                </div>
                <div className="text-sm text-white/70">Annual Savings</div>
              </Card>
              <Card className="p-6 text-center hover-lift">
                <Clock className="w-12 h-12 mx-auto mb-4 text-orange" />
                <div
                  className="inline-block px-4 py-2 mb-2 text-3xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                >
                  85%
                </div>
                <div className="text-sm text-white/70">Faster Response</div>
              </Card>
              <Card className="p-6 text-center hover-lift">
                <Users className="w-12 h-12 mx-auto mb-4 text-orange" />
                <div
                  className="inline-block px-4 py-2 mb-2 text-3xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                >
                  50K+
                </div>
                <div className="text-sm text-white/70">Employees Helped</div>
              </Card>
              <Card className="p-6 text-center hover-lift">
                <Award className="w-12 h-12 mx-auto mb-4 text-orange" />
                <div
                  className="inline-block px-4 py-2 mb-2 text-3xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                >
                  94%
                </div>
                <div className="text-sm text-white/70">Routing Accuracy</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-purple-600/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Write Your Own Success Story?
            </h2>
            <p className="text-xl text-white/70 mb-8">Let&apos;s bring your AI ambitions to life</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="shadow-premium hover-lift">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="hover-lift">
                  Explore Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
