#!/usr/bin/env tsx

import { indexContent } from '../src/lib/pinecone/indexer';
import { getIndex } from '../src/lib/pinecone/client';
import type { IndexableContent } from '../src/lib/pinecone/indexer';

// Define all the content that should be indexed
const SITE_CONTENT = {
  en: {
    pages: [
      {
        path: '/about',
        title: 'About GroeimetAI - AI Consultancy & Innovation',
        description: 'Discover how GroeimetAI helps companies grow with cutting-edge AI technology',
        content: `We are GroeimetAI, your partner in AI transformation. We help businesses grow with cutting-edge AI technology and proven expertise. Our mission is to make advanced AI technology accessible to every business. By delivering practical, results-driven solutions, we help organizations reach their full potential in the AI era.`
      },
      {
        path: '/services',
        title: 'AI Services - Transform Your Business',
        description: 'Comprehensive AI consultancy services from strategy to implementation',
        content: `Transform your business with our comprehensive AI services. From strategic consulting to technical implementation, we guide you through every step of your AI journey. Our services include AI Strategy & Roadmapping, AI Transformation & Change Management, and more.`
      },
      {
        path: '/advisory-services',
        title: 'AI Advisory Services',
        description: 'Strategic AI guidance for executive teams',
        content: `Navigate the AI revolution with confidence. Our advisory services help executive teams understand, evaluate, and implement AI strategies that drive measurable business value. We provide strategic guidance tailored to your industry and goals.`
      },
      {
        path: '/contact',
        title: 'Contact GroeimetAI',
        description: 'Get in touch with our AI experts',
        content: `Ready to start your AI transformation? Contact us at info@groeimetai.io or call +31 85 004 2244. Our office is located in Apeldoorn, Netherlands. We offer free consultations to discuss your AI ambitions.`
      }
    ],
    services: [
      {
        slug: 'strategy',
        title: 'AI Strategy & Roadmapping',
        description: 'Develop a comprehensive AI strategy aligned with your business goals',
        content: `Transform your business vision into an actionable AI roadmap. We help you identify high-impact AI opportunities, assess organizational readiness, and create a phased implementation plan that delivers measurable results.`
      },
      {
        slug: 'transformation',
        title: 'AI Transformation & Change Management',
        description: 'Successfully integrate AI into your organization',
        content: `Guide your organization through the AI transformation journey. We help you manage the cultural shift, upskill your workforce, and ensure smooth adoption of AI technologies across all departments.`
      },
      {
        slug: 'governance',
        title: 'AI Governance & Ethics',
        description: 'Implement responsible AI practices',
        content: `Build trust and ensure compliance with AI governance frameworks. We help you establish ethical guidelines, implement bias detection, and create transparent AI systems that align with regulatory requirements.`
      },
      {
        slug: 'innovation',
        title: 'AI Innovation Lab',
        description: 'Explore cutting-edge AI possibilities',
        content: `Stay ahead of the curve with our AI Innovation Lab. We help you experiment with emerging AI technologies, prototype new solutions, and validate innovative use cases before full-scale implementation.`
      }
    ],
    cases: [
      {
        slug: 'enterprise-llm-implementation',
        title: 'Enterprise LLM Implementation for 50,000 Employees',
        description: 'Transformed outdated chatbot into intelligent AI assistant',
        content: `Major Dutch bank case study: We replaced an outdated trigger-based chatbot with an advanced LLM solution serving 50,000 employees. Results: 85% faster response times, 72% higher resolution rate, €2.8M annual savings.`
      },
      {
        slug: 'snelnotuleren-ai-transcription',
        title: 'Snelnotuleren.nl - AI Transcription Platform',
        description: 'GDPR-compliant AI transcription service',
        content: `Built a complete AI transcription platform processing over 1 million tokens. The platform is 100% GDPR compliant and has transcribed 1500+ hours of meetings with growing user adoption.`
      },
      {
        slug: 'groeimetai-learning-platform',
        title: 'Multi-Agent Learning Platform',
        description: 'AI agents autonomously built a complete learning platform',
        content: `Revolutionary project where AI agents autonomously developed a learning platform with 10+ courses, 4 modules each, and blockchain certification. Completed in just 2 weeks with 95% agent efficiency.`
      },
      {
        slug: 'intelligent-routing-system',
        title: 'Intelligent Ticket Routing System',
        description: 'Vector database solution for semantic routing',
        content: `Implemented advanced ticket routing for a major Dutch bank using vector databases and LLMs. Results: 94% routing accuracy, 78% time saved, 65% reduction in templates needed.`
      }
    ],
    blog: [
      {
        slug: 'multi-agent-systems-future-automation',
        title: 'The Rise of Multi-Agent Systems',
        description: 'How AI agents are revolutionizing task automation',
        content: `Multi-agent orchestration represents the next frontier in AI automation. By coordinating multiple specialized AI agents, organizations can tackle complex tasks with unprecedented efficiency and accuracy.`
      },
      {
        slug: 'rag-architectuur-best-practices',
        title: 'RAG Architecture Best Practices',
        description: 'Building robust retrieval-augmented generation systems',
        content: `Retrieval-Augmented Generation (RAG) combines the power of large language models with your organization's knowledge base. Learn best practices for implementing RAG systems that deliver accurate, contextual responses.`
      }
    ]
  },
  nl: {
    pages: [
      {
        path: '/about',
        title: 'Over GroeimetAI - AI Consultancy & Innovatie',
        description: 'Ontdek hoe GroeimetAI bedrijven helpt groeien met geavanceerde AI-technologie',
        content: `Wij zijn GroeimetAI, uw partner in AI-transformatie. We helpen bedrijven groeien met geavanceerde AI-technologie en bewezen expertise. Onze missie is om geavanceerde AI-technologie toegankelijk te maken voor elk bedrijf.`
      },
      {
        path: '/services',
        title: 'AI Diensten - Transformeer Uw Bedrijf',
        description: 'Uitgebreide AI consultancy diensten van strategie tot implementatie',
        content: `Transformeer uw bedrijf met onze uitgebreide AI-diensten. Van strategische consultancy tot technische implementatie, wij begeleiden u bij elke stap van uw AI-reis. Onze diensten omvatten AI Strategie & Roadmapping, AI Transformatie & Verandermanagement, en meer.`
      },
      {
        path: '/advisory-services',
        title: 'AI Adviesdiensten',
        description: 'Strategische AI-begeleiding voor directieteams',
        content: `Navigeer met vertrouwen door de AI-revolutie. Onze adviesdiensten helpen directieteams bij het begrijpen, evalueren en implementeren van AI-strategieën die meetbare bedrijfswaarde opleveren.`
      },
      {
        path: '/contact',
        title: 'Contact GroeimetAI',
        description: 'Neem contact op met onze AI-experts',
        content: `Klaar om uw AI-transformatie te starten? Neem contact op via info@groeimetai.io of bel +31 85 004 2244. Ons kantoor is gevestigd in Apeldoorn. We bieden gratis consultaties aan om uw AI-ambities te bespreken.`
      }
    ],
    services: [
      {
        slug: 'strategy',
        title: 'AI Strategie & Roadmapping',
        description: 'Ontwikkel een uitgebreide AI-strategie afgestemd op uw bedrijfsdoelen',
        content: `Transformeer uw bedrijfsvisie naar een uitvoerbare AI-roadmap. Wij helpen u bij het identificeren van high-impact AI-kansen, het beoordelen van organisatorische gereedheid, en het creëren van een gefaseerd implementatieplan.`
      },
      {
        slug: 'transformation',
        title: 'AI Transformatie & Verandermanagement',
        description: 'Integreer AI succesvol in uw organisatie',
        content: `Begeleid uw organisatie door de AI-transformatiereis. Wij helpen u bij het managen van de culturele verschuiving, het bijscholen van uw personeel, en het zorgen voor soepele adoptie van AI-technologieën.`
      },
      {
        slug: 'governance',
        title: 'AI Governance & Ethiek',
        description: 'Implementeer verantwoorde AI-praktijken',
        content: `Bouw vertrouwen en zorg voor compliance met AI-governance frameworks. Wij helpen u bij het opstellen van ethische richtlijnen, het implementeren van bias-detectie, en het creëren van transparante AI-systemen.`
      },
      {
        slug: 'innovation',
        title: 'AI Innovatie Lab',
        description: 'Verken geavanceerde AI-mogelijkheden',
        content: `Blijf voorop lopen met ons AI Innovatie Lab. Wij helpen u bij het experimenteren met opkomende AI-technologieën, het maken van prototypes, en het valideren van innovatieve use cases.`
      }
    ],
    cases: [
      {
        slug: 'enterprise-llm-implementation',
        title: 'Enterprise LLM Implementatie voor 50.000 Medewerkers',
        description: 'Verouderde chatbot getransformeerd naar intelligente AI-assistent',
        content: `Case study grote Nederlandse bank: We vervingen een verouderde trigger-based chatbot door een geavanceerde LLM-oplossing voor 50.000 medewerkers. Resultaten: 85% snellere responstijden, 72% hogere resolutiegraad, €2,8M jaarlijkse besparing.`
      },
      {
        slug: 'snelnotuleren-ai-transcription',
        title: 'Snelnotuleren.nl - AI Transcriptie Platform',
        description: 'GDPR-compliant AI transcriptie service',
        content: `Complete AI transcriptie platform gebouwd dat meer dan 1 miljoen tokens verwerkt. Het platform is 100% GDPR-compliant en heeft 1500+ uren aan vergaderingen getranscribeerd met groeiende gebruikersadoptie.`
      },
      {
        slug: 'groeimetai-learning-platform',
        title: 'Multi-Agent Leerplatform',
        description: 'AI-agents bouwden autonoom een compleet leerplatform',
        content: `Revolutionair project waarbij AI-agents autonoom een leerplatform ontwikkelden met 10+ cursussen, 4 modules elk, en blockchain-certificering. Voltooid in slechts 2 weken met 95% agent-efficiëntie.`
      },
      {
        slug: 'intelligent-routing-system',
        title: 'Intelligent Ticket Routing Systeem',
        description: 'Vector database oplossing voor semantische routing',
        content: `Geavanceerde ticket routing geïmplementeerd voor grote Nederlandse bank met vector databases en LLMs. Resultaten: 94% routing nauwkeurigheid, 78% tijd bespaard, 65% reductie in benodigde templates.`
      }
    ],
    blog: [
      {
        slug: 'multi-agent-systems-future-automation',
        title: 'De Opkomst van Multi-Agent Systemen',
        description: 'Hoe AI-agents taakautomatisering revolutioneren',
        content: `Multi-agent orchestratie vertegenwoordigt de volgende grens in AI-automatisering. Door meerdere gespecialiseerde AI-agents te coördineren, kunnen organisaties complexe taken aanpakken met ongekende efficiëntie.`
      },
      {
        slug: 'rag-architectuur-best-practices',
        title: 'RAG Architectuur Best Practices',
        description: 'Robuuste retrieval-augmented generation systemen bouwen',
        content: `Retrieval-Augmented Generation (RAG) combineert de kracht van grote taalmodellen met de kennisbank van uw organisatie. Leer best practices voor het implementeren van RAG-systemen die nauwkeurige, contextuele antwoorden leveren.`
      }
    ]
  }
};

async function buildSearchIndex() {
  const environment = process.env.INDEX_ENVIRONMENT || 'development';
  console.log(`🔍 Building search index for GroeimetAI website (${environment})...`);

  const allContent: IndexableContent[] = [];
  const locales: ('en' | 'nl')[] = ['en', 'nl'];

  try {
    // Clear existing content by deleting known IDs
    console.log('Clearing existing content...');
    const pineconeIndex = getIndex();

    // Generate all IDs that we will be creating
    const allIds: string[] = [];
    for (const locale of locales) {
      const content = SITE_CONTENT[locale];
      
      // Page IDs
      content.pages.forEach(page => {
        allIds.push(`${locale}-${page.path.replace(/\//g, '-')}-main`);
      });
      
      // Service IDs  
      content.services.forEach(service => {
        allIds.push(`${locale}-services-${service.slug}-main`);
      });
      
      // Case study IDs
      content.cases.forEach(caseStudy => {
        allIds.push(`${locale}-cases-${caseStudy.slug}-main`);
      });
      
      // Blog IDs
      content.blog.forEach(blog => {
        allIds.push(`${locale}-blog-${blog.slug}-main`);
      });
    }

    // Delete existing vectors by ID to prevent duplicates
    for (const locale of locales) {
      const namespace = `${environment}-${locale}`;
      const localeIds = allIds.filter(id => id.startsWith(locale));
      
      if (localeIds.length > 0) {
        try {
          await pineconeIndex.namespace(namespace).deleteMany(localeIds);
          console.log(`  ✓ Cleared ${localeIds.length} existing vectors from ${namespace} namespace`);
        } catch (error) {
          console.log(`  ⚠️  Could not delete specific vectors from ${namespace} (will rely on upsert to replace)`);
        }
      }
    }

    // Extract content from our defined structure
    for (const locale of locales) {
      console.log(`\n📄 Extracting content for locale: ${locale}`);
      const content = SITE_CONTENT[locale];

      // Process regular pages
      for (const page of content.pages) {
        console.log(`  - Processing ${page.path}`);
        allContent.push({
          id: `${locale}-${page.path.replace(/\//g, '-')}-main`,
          content: `${page.title}\n\n${page.description}\n\n${page.content}`,
          metadata: {
            id: `${locale}-${page.path.replace(/\//g, '-')}`,
            type: 'page',
            locale,
            title: page.title,
            description: page.description,
            url: `/${locale}${page.path}`,
            section: page.path.split('/')[1] || 'main',
            content: page.content,
            chunk: 0,
            totalChunks: 1,
            lastModified: new Date().toISOString(),
            environment,
          },
        });
      }

      // Process service pages
      for (const service of content.services) {
        console.log(`  - Processing /services/${service.slug}`);
        allContent.push({
          id: `${locale}-services-${service.slug}-main`,
          content: `${service.title}\n\n${service.description}\n\n${service.content}`,
          metadata: {
            id: `${locale}-services-${service.slug}`,
            type: 'service',
            locale,
            title: service.title,
            description: service.description,
            url: `/${locale}/services/${service.slug}`,
            section: 'services',
            content: service.content,
            chunk: 0,
            totalChunks: 1,
            lastModified: new Date().toISOString(),
            environment,
          },
        });
      }

      // Process case studies
      for (const caseStudy of content.cases) {
        console.log(`  - Processing /cases/${caseStudy.slug}`);
        allContent.push({
          id: `${locale}-cases-${caseStudy.slug}-main`,
          content: `${caseStudy.title}\n\n${caseStudy.description}\n\n${caseStudy.content}`,
          metadata: {
            id: `${locale}-cases-${caseStudy.slug}`,
            type: 'case',
            locale,
            title: caseStudy.title,
            description: caseStudy.description,
            url: `/${locale}/cases/${caseStudy.slug}`,
            section: 'cases',
            content: caseStudy.content,
            chunk: 0,
            totalChunks: 1,
            lastModified: new Date().toISOString(),
            environment,
          },
        });
      }

      // Process blog posts
      for (const blog of content.blog) {
        console.log(`  - Processing /blog/${blog.slug}`);
        allContent.push({
          id: `${locale}-blog-${blog.slug}-main`,
          content: `${blog.title}\n\n${blog.description}\n\n${blog.content}`,
          metadata: {
            id: `${locale}-blog-${blog.slug}`,
            type: 'blog',
            locale,
            title: blog.title,
            description: blog.description,
            url: `/${locale}/blog/${blog.slug}`,
            section: 'blog',
            content: blog.content,
            chunk: 0,
            totalChunks: 1,
            lastModified: new Date().toISOString(),
            environment,
          },
        });
      }
    }

    console.log(`\n📊 Total content items to index: ${allContent.length}`);

    // Index all content
    console.log('\n🚀 Indexing content to Pinecone...');
    await indexContent(allContent);

    console.log('\n✅ Search index built successfully!');
    console.log(`   Total items indexed: ${allContent.length}`);

    // Try to verify index stats (optional - may fail with limited API key permissions)
    try {
      console.log('\n📊 Verifying index statistics...');
      const statsIndex = getIndex();
      for (const locale of locales) {
        const namespace = `${environment}-${locale}`;
        const stats = await statsIndex.namespace(namespace).describeIndexStats();
        console.log(`   ${namespace}: ${stats.totalRecordCount || 0} vectors`);
      }
    } catch (statsError) {
      console.log('⚠️  Could not retrieve index stats (API key may have limited permissions)');
      console.log('   This is normal for production API keys and does not affect indexing');
    }
  } catch (error) {
    console.error('\n❌ Error building search index:', error);
    process.exit(1);
  }
}

// Check for required environment variables
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY environment variable is required');
  console.log('🔧 This is likely a GitHub Secrets configuration issue.');
  console.log('📝 Please check that PINECONE_API_KEY is set in GitHub repository secrets.');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required');
  console.log('🔧 This is likely a GitHub Secrets configuration issue.');
  console.log('📝 Please check that OPENAI_API_KEY is set in GitHub repository secrets.');
  process.exit(1);
}

// Debug API key format
const pineconeKey = process.env.PINECONE_API_KEY;
console.log(`🔑 Pinecone API key detected:`);
console.log(`   Length: ${pineconeKey.length}`);
console.log(`   Starts with: ${pineconeKey.substring(0, 8)}...`);
console.log(`   Format: ${pineconeKey.startsWith('pcsk_') ? 'Service Key' : pineconeKey.startsWith('pc-') ? 'API Key' : 'Unknown'}`);

if (pineconeKey.length < 30) {
  console.error('⚠️  API key seems too short');
}

// Run the indexing
buildSearchIndex();