import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Building,
} from 'lucide-react';

// Import case components
import { EnterpriseAIAnimation } from '@/components/cases/EnterpriseAIAnimation';
import { TranscriptionFlow } from '@/components/cases/TranscriptionFlow';
import { MultiAgentDiagram } from '@/components/cases/MultiAgentDiagram';
import { VectorSearchAnimation } from '@/components/cases/VectorSearchAnimation';

interface CaseDetail {
  slug: string;
  title: string;
  client: string;
  industry: string;
  duration: string;
  overview: string;
  challenge: {
    title: string;
    points: string[];
  };
  solution: {
    title: string;
    points: string[];
  };
  implementation: {
    title: string;
    phases: Array<{
      name: string;
      description: string;
      duration: string;
    }>;
  };
  results: Array<{
    metric: string;
    value: string;
    description: string;
  }>;
  technologies: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
  keyFeatures: string[];
  diagram: React.ComponentType;
}

const caseDetails: Record<string, CaseDetail> = {
  'enterprise-llm-implementation': {
    slug: 'enterprise-llm-implementation',
    title: 'Enterprise LLM Implementation for 50,000 Employees',
    client: 'Major Dutch Bank',
    industry: 'Financial Services',
    duration: 'Feb 2024 - Apr 2025',
    overview:
      'Transformed an outdated trigger-based chatbot into an intelligent AI assistant serving 50,000 employees, achieving 85% faster response times and €2.8M annual savings.',
    challenge: {
      title: 'The Challenge',
      points: [
        'Legacy chatbot with no Natural Language Understanding (NLU)',
        'Poor user experience leading to low adoption rates',
        'High volume of unresolved tickets requiring manual intervention',
        'Inefficient trigger-based system causing user frustration',
      ],
    },
    solution: {
      title: 'Our Solution',
      points: [
        'Implemented Azure OpenAI with GPT-4o-mini for intelligent responses',
        'Built an agentic framework for autonomous decision-making',
        'Integrated with ServiceNow for seamless ticket management',
        'Designed smart conversation history (last 10 messages) for context',
      ],
    },
    implementation: {
      title: 'Implementation Journey',
      phases: [
        {
          name: 'Discovery & Planning',
          description:
            'Analyzed existing system, identified pain points, and designed architecture',
          duration: '2 months',
        },
        {
          name: 'Development & Integration',
          description: 'Built AI framework, integrated with Azure OpenAI and ServiceNow',
          duration: '6 months',
        },
        {
          name: 'Testing & Optimization',
          description: 'Extensive testing with pilot groups and performance optimization',
          duration: '3 months',
        },
        {
          name: 'Rollout & Adoption',
          description: 'Phased rollout to all 50,000 employees with training',
          duration: '3 months',
        },
      ],
    },
    results: [
      {
        metric: '85%',
        value: 'Faster Response Time',
        description: 'Reduced average response time from minutes to seconds',
      },
      {
        metric: '72%',
        value: 'Higher Resolution Rate',
        description: 'Increased first-contact resolution dramatically',
      },
      {
        metric: '€2.8M',
        value: 'Annual Savings',
        description: 'Through automated ticket handling and reduced support costs',
      },
    ],
    technologies: ['Azure OpenAI', 'ServiceNow', 'GPT-4o-mini', 'Python', 'REST APIs'],
    keyFeatures: [
      'Live agent transfer capability',
      'Catalog item search and retrieval',
      'Knowledge base integration',
      'Direct answer generation',
      'Legacy topic activation',
    ],
    diagram: EnterpriseAIAnimation,
  },
  'snelnotuleren-ai-transcription': {
    slug: 'snelnotuleren-ai-transcription',
    title: 'Snelnotuleren.nl - AI Transcription Platform',
    client: 'GroeimetAI Venture',
    industry: 'SaaS',
    duration: '2023 - July 2025',
    overview:
      'Built a GDPR-compliant AI transcription platform that processed over 1 million tokens and transcribed 1500+ hours of meetings for a growing user base.',
    challenge: {
      title: 'The Challenge',
      points: [
        'Dutch market lacked GDPR-compliant transcription services',
        'Existing solutions had token limitations for long meetings',
        'Need for accurate Dutch language transcription',
        'Strict EU AI Act compliance requirements',
      ],
    },
    solution: {
      title: 'Our Solution',
      points: [
        'Google Cloud Platform infrastructure for scalability',
        'Firebase for user management and real-time features',
        'Ingenious algorithm to handle long transcriptions within token limits',
        'Full GDPR and EU AI Act compliance built-in',
      ],
    },
    implementation: {
      title: 'Platform Development',
      phases: [
        {
          name: 'Market Research',
          description: 'Analyzed Dutch market needs and compliance requirements',
          duration: '1 month',
        },
        {
          name: 'MVP Development',
          description: 'Built core transcription engine with Whisper AI',
          duration: '3 months',
        },
        {
          name: 'Platform Launch',
          description: 'Launched with full features and compliance',
          duration: '2 months',
        },
        {
          name: 'Scale & Optimize',
          description: 'Scaled to handle thousands of hours of audio',
          duration: 'Ongoing',
        },
      ],
    },
    results: [
      {
        metric: '1M+',
        value: 'Tokens Processed',
        description: 'Successfully processed over a million tokens',
      },
      {
        metric: '1500+',
        value: 'Hours Transcribed',
        description: 'Transcribed meetings, interviews, and lectures',
      },
      {
        metric: 'Growing',
        value: 'User Base',
        description: 'Active users across Netherlands',
      },
    ],
    technologies: ['Google Cloud Platform', 'Firebase', 'Whisper AI', 'Next.js', 'Python'],
    keyFeatures: [
      'Real-time transcription',
      'Multiple speaker detection',
      'Dutch language optimization',
      'Export to various formats',
      'GDPR-compliant data handling',
    ],
    diagram: TranscriptionFlow,
  },
  'groeimetai-learning-platform': {
    slug: 'groeimetai-learning-platform',
    title: 'GroeimetAI Learning Platform - Multi-Agent Development',
    client: 'GroeimetAI',
    industry: 'EdTech',
    duration: '2 weeks',
    overview:
      'Revolutionary project where AI agents autonomously built a complete learning platform with 10+ courses, 40+ modules, and blockchain certification in just 2 weeks.',
    challenge: {
      title: 'The Challenge',
      points: [
        'Need to rapidly create comprehensive AI/LLM educational content',
        'Requirement for scalable course creation system',
        'Blockchain-verified certification system needed',
        'Entire platform to be built by AI agents',
      ],
    },
    solution: {
      title: 'Our Solution',
      points: [
        'Multi-agent orchestration system for autonomous development',
        'AI agents created all course content and structure',
        'Blockchain integration for tamper-proof certificates',
        'Fully automated content generation and quality control',
      ],
    },
    implementation: {
      title: 'Agent-Driven Development',
      phases: [
        {
          name: 'Agent Setup',
          description: 'Configured specialized agents for different tasks',
          duration: '1 day',
        },
        {
          name: 'Content Creation',
          description: 'Agents generated 10+ comprehensive courses',
          duration: '5 days',
        },
        {
          name: 'Platform Development',
          description: 'Agents built the complete web platform',
          duration: '4 days',
        },
        {
          name: 'Blockchain Integration',
          description: 'Implemented certificate verification system',
          duration: '4 days',
        },
      ],
    },
    results: [
      {
        metric: '2 weeks',
        value: 'Total Development Time',
        description: 'Complete platform built in record time',
      },
      {
        metric: '10+',
        value: 'Courses Created',
        description: 'Comprehensive courses on GenAI, LLM, and automation',
      },
      {
        metric: '95%',
        value: 'Agent Efficiency',
        description: 'Minimal human intervention required',
      },
    ],
    technologies: ['Multi-Agent Orchestration', 'Next.js', 'Blockchain', 'GPT-4', 'TypeScript'],
    keyFeatures: [
      '160+ lessons across all courses',
      'Interactive learning modules',
      'Progress tracking',
      'Blockchain-verified certificates',
      'AI-generated content',
    ],
    diagram: MultiAgentDiagram,
  },
  'intelligent-ticket-routing': {
    slug: 'intelligent-ticket-routing',
    title: 'Intelligent Ticket Routing with Vector Database',
    client: 'Major Dutch Bank',
    industry: 'Financial Services',
    duration: '12 weeks',
    overview:
      'Revolutionized ticket routing by implementing a vector database solution that reduced thousands of templates to an intelligent system with 94% routing accuracy.',
    challenge: {
      title: 'The Challenge',
      points: [
        'Thousands of Business Service Templates (BSTs) causing confusion',
        'Users unable to find correct template for their issues',
        'High rate of misrouted tickets',
        'Excessive time spent searching for right template',
      ],
    },
    solution: {
      title: 'Our Solution',
      points: [
        'Vector database for semantic search across all templates',
        'LLM-powered widget for natural language input',
        'Intelligent follow-up question generation',
        'Automatic ticket creation and routing',
      ],
    },
    implementation: {
      title: 'Vector Search Implementation',
      phases: [
        {
          name: 'Template Analysis',
          description: 'Analyzed and vectorized thousands of BSTs',
          duration: '2 weeks',
        },
        {
          name: 'Vector DB Setup',
          description: 'Implemented high-performance vector database',
          duration: '3 weeks',
        },
        {
          name: 'LLM Integration',
          description: 'Connected LLM for intelligent question generation',
          duration: '4 weeks',
        },
        {
          name: 'ServiceNow Integration',
          description: 'Seamless integration with existing systems',
          duration: '3 weeks',
        },
      ],
    },
    results: [
      {
        metric: '94%',
        value: 'Routing Accuracy',
        description: 'Near-perfect ticket routing to correct teams',
      },
      {
        metric: '78%',
        value: 'Time Saved',
        description: 'Dramatic reduction in ticket creation time',
      },
      {
        metric: '65%',
        value: 'BST Reduction',
        description: 'Eliminated redundant templates',
      },
    ],
    technologies: ['Vector Database', 'LLM', 'ServiceNow', 'Pinecone', 'Python'],
    keyFeatures: [
      'Semantic search capability',
      'Natural language processing',
      'Dynamic follow-up questions',
      'Automatic categorization',
      'Smart routing logic',
    ],
    diagram: VectorSearchAnimation,
  },
};

export async function generateStaticParams() {
  const locales = ['en', 'nl'];
  const cases = Object.keys(caseDetails);

  return locales.flatMap((locale) =>
    cases.map((slug) => ({
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
  const caseDetail = caseDetails[params.slug];

  if (!caseDetail) {
    return {
      title: 'Case Study Not Found - GroeimetAI',
    };
  }

  return {
    title: `${caseDetail.title} - GroeimetAI Case Study`,
    description: caseDetail.overview,
  };
}

export default function CaseStudyPage({ params }: { params: { locale: string; slug: string } }) {
  const caseDetail = caseDetails[params.slug];

  if (!caseDetail) {
    notFound();
  }

  const DiagramComponent = caseDetail.diagram;

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-green/5" />
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/cases">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Case Studies
            </Button>
          </Link>

          <div className="max-w-4xl">
            <Badge variant="secondary" className="mb-4 bg-orange/20 text-white border-orange/30">
              {caseDetail.industry}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{caseDetail.title}</h1>
            <p className="text-xl text-white/80 mb-8">{caseDetail.overview}</p>
            <div className="flex flex-wrap gap-6 text-white/70">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span>{caseDetail.client}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{caseDetail.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Diagram */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Solution Architecture</h2>
            <Card className="p-8 bg-black/50 border-white/10">
              <DiagramComponent />
            </Card>
          </div>
        </div>
      </section>

      {/* Challenge & Solution */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <h3
                className="text-2xl font-bold mb-6 text-white px-4 py-2 inline-block"
                style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
              >
                {caseDetail.challenge.title}
              </h3>
              <ul className="space-y-4">
                {caseDetail.challenge.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-orange" />
                    </div>
                    <span className="text-white/80">{point}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8">
              <h3
                className="text-2xl font-bold mb-6 text-white px-4 py-2 inline-block"
                style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
              >
                {caseDetail.solution.title}
              </h3>
              <ul className="space-y-4">
                {caseDetail.solution.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Implementation Timeline */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {caseDetail.implementation.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {caseDetail.implementation.phases.map((phase, index) => (
                <Card key={index} className="p-6 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange/20 flex items-center justify-center">
                      <span className="text-orange font-bold">{index + 1}</span>
                    </div>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                  <h4 className="font-semibold mb-2">{phase.name}</h4>
                  <p className="text-sm text-white/70">{phase.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Results & Impact</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {caseDetail.results.map((result, index) => (
                <Card key={index} className="p-8 text-center hover-lift">
                  <div
                    className="inline-block px-6 py-3 mb-4 text-4xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                  >
                    {result.metric}
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{result.value}</h4>
                  <p className="text-white/70">{result.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {caseDetail.keyFeatures.map((feature, index) => (
                <Card key={index} className="p-6 hover-lift">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Technologies Used</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {caseDetail.technologies.map((tech, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-lg px-6 py-2 border-orange/30 text-white"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-orange/10 to-green/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Let&apos;s discuss how we can help you achieve similar results
            </p>
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
