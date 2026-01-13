/**
 * Get Services Tool
 * Returns static information about GroeimetAI services
 */

import type { AgentContext, ToolResult, ServiceInfo } from '../../types';

interface GetServicesArgs {
  service?: 'all' | 'genai' | 'servicenow' | 'multi-agent' | 'rag' | 'custom';
}

/**
 * Service information database
 */
const services: Record<string, { nl: ServiceInfo; en: ServiceInfo }> = {
  genai: {
    nl: {
      id: 'genai',
      name: 'GenAI & LLM Implementatie',
      description:
        'Implementeer generatieve AI en large language models in je bedrijfsprocessen voor verhoogde productiviteit en innovatie.',
      features: [
        'Custom LLM fine-tuning',
        'Prompt engineering',
        'AI-powered workflows',
        'Integratie met bestaande systemen',
        'Performance monitoring',
      ],
      useCases: [
        'Automatische documentgeneratie',
        'Klantenservice chatbots',
        'Content creatie',
        'Data analyse en rapportage',
      ],
    },
    en: {
      id: 'genai',
      name: 'GenAI & LLM Implementation',
      description:
        'Implement generative AI and large language models in your business processes for increased productivity and innovation.',
      features: [
        'Custom LLM fine-tuning',
        'Prompt engineering',
        'AI-powered workflows',
        'Integration with existing systems',
        'Performance monitoring',
      ],
      useCases: [
        'Automatic document generation',
        'Customer service chatbots',
        'Content creation',
        'Data analysis and reporting',
      ],
    },
  },
  servicenow: {
    nl: {
      id: 'servicenow',
      name: 'ServiceNow AI Integratie',
      description:
        'Transformeer je ServiceNow platform met AI-gestuurde automatisering en intelligente workflows.',
      features: [
        'AI-powered ticketing',
        'Predictive incident management',
        'Intelligent routing',
        'Virtual agents',
        'Knowledge management AI',
      ],
      useCases: [
        'IT Service Management automatisering',
        'HR Service Delivery',
        'Customer Service Management',
        'Security Operations',
      ],
    },
    en: {
      id: 'servicenow',
      name: 'ServiceNow AI Integration',
      description:
        'Transform your ServiceNow platform with AI-driven automation and intelligent workflows.',
      features: [
        'AI-powered ticketing',
        'Predictive incident management',
        'Intelligent routing',
        'Virtual agents',
        'Knowledge management AI',
      ],
      useCases: [
        'IT Service Management automation',
        'HR Service Delivery',
        'Customer Service Management',
        'Security Operations',
      ],
    },
  },
  'multi-agent': {
    nl: {
      id: 'multi-agent',
      name: 'Multi-Agent Orchestration',
      description:
        'Zet meerdere gespecialiseerde AI-agenten in die samenwerken om complexe taken uit te voeren met 10x meer output en 95% nauwkeurigheid.',
      features: [
        'Autonome agent coördinatie',
        'Taakdelegatie en planning',
        'Real-time monitoring',
        'Foutafhandeling en recovery',
        'Schaalbare architectuur',
      ],
      useCases: [
        'Complexe research taken',
        'Software development workflows',
        'Data processing pipelines',
        'Business process automation',
      ],
    },
    en: {
      id: 'multi-agent',
      name: 'Multi-Agent Orchestration',
      description:
        'Deploy multiple specialized AI agents working together to execute complex tasks with 10x output and 95% accuracy.',
      features: [
        'Autonomous agent coordination',
        'Task delegation and planning',
        'Real-time monitoring',
        'Error handling and recovery',
        'Scalable architecture',
      ],
      useCases: [
        'Complex research tasks',
        'Software development workflows',
        'Data processing pipelines',
        'Business process automation',
      ],
    },
  },
  rag: {
    nl: {
      id: 'rag',
      name: 'RAG Architectuur Design',
      description:
        'Ontwerp en implementeer Retrieval-Augmented Generation systemen voor accurate, context-aware AI responses.',
      features: [
        'Vector database setup',
        'Embedding strategie',
        'Hybrid search implementatie',
        'Context window optimalisatie',
        'Realtime data updates',
      ],
      useCases: [
        'Enterprise kennisbanken',
        'Documentatie assistenten',
        'Legal research tools',
        'Customer support systems',
      ],
    },
    en: {
      id: 'rag',
      name: 'RAG Architecture Design',
      description:
        'Design and implement Retrieval-Augmented Generation systems for accurate, context-aware AI responses.',
      features: [
        'Vector database setup',
        'Embedding strategy',
        'Hybrid search implementation',
        'Context window optimization',
        'Real-time data updates',
      ],
      useCases: [
        'Enterprise knowledge bases',
        'Documentation assistants',
        'Legal research tools',
        'Customer support systems',
      ],
    },
  },
  custom: {
    nl: {
      id: 'custom',
      name: 'Maatwerk AI Oplossingen',
      description:
        'Op maat gemaakte AI oplossingen die perfect aansluiten bij jouw specifieke bedrijfsbehoeften en uitdagingen.',
      features: [
        'Requirements analyse',
        'Custom model development',
        'API integratie',
        'Training en support',
        'Doorlopende optimalisatie',
      ],
      useCases: [
        'Industrie-specifieke AI',
        'Legacy systeem modernisatie',
        'Compliance en governance',
        'Niche use cases',
      ],
    },
    en: {
      id: 'custom',
      name: 'Custom AI Solutions',
      description:
        'Tailor-made AI solutions that perfectly match your specific business needs and challenges.',
      features: [
        'Requirements analysis',
        'Custom model development',
        'API integration',
        'Training and support',
        'Continuous optimization',
      ],
      useCases: [
        'Industry-specific AI',
        'Legacy system modernization',
        'Compliance and governance',
        'Niche use cases',
      ],
    },
  },
};

/**
 * Execute getServiceInfo tool
 */
export async function executeGetServiceInfo(
  args: GetServicesArgs,
  context: AgentContext
): Promise<ToolResult> {
  const { service = 'all' } = args;
  const locale = context.locale;

  try {
    if (service === 'all') {
      // Return all services
      const allServices = Object.values(services).map((s) => s[locale]);
      return {
        success: true,
        data: {
          services: allServices,
          count: allServices.length,
          message:
            locale === 'nl'
              ? `Wij bieden ${allServices.length} hoofddiensten aan.`
              : `We offer ${allServices.length} main services.`,
        },
      };
    }

    // Return specific service
    const serviceInfo = services[service];
    if (!serviceInfo) {
      return {
        success: false,
        error:
          locale === 'nl'
            ? `Service '${service}' niet gevonden.`
            : `Service '${service}' not found.`,
      };
    }

    return {
      success: true,
      data: {
        service: serviceInfo[locale],
        message:
          locale === 'nl'
            ? `Informatie over ${serviceInfo[locale].name}.`
            : `Information about ${serviceInfo[locale].name}.`,
      },
    };
  } catch (error) {
    console.error('getServiceInfo error:', error);
    return {
      success: false,
      error:
        locale === 'nl'
          ? 'Er ging iets mis bij het ophalen van service informatie.'
          : 'Something went wrong while fetching service information.',
    };
  }
}
