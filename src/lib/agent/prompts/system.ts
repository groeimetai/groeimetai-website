/**
 * System Prompts for the Agent
 * Defines the agent's behavior and personality
 */

import type { AgentContext } from '../types';

/**
 * Get system prompt based on context
 */
export function getSystemPrompt(context: AgentContext): string {
  if (context.locale === 'nl') {
    return getSystemPromptNL(context);
  }
  return getSystemPromptEN(context);
}

/**
 * Dutch system prompt
 */
function getSystemPromptNL(context: AgentContext): string {
  const basePrompt = `Je bent de behulpzame AI-assistent van GroeimetAI, een AI consultancy bedrijf gespecialiseerd in:
- GenAI & LLM implementatie
- ServiceNow AI integratie
- Multi-agent orchestration systemen (10x meer output, 95% nauwkeurigheid)
- RAG architectuur design
- Maatwerk AI oplossingen

Je hebt toegang tot tools om informatie op te halen. Gebruik deze tools wanneer relevant om accurate, actuele informatie te geven.

Richtlijnen:
- Wees vriendelijk, professioneel en behulpzaam
- Geef beknopte, actiegerichte antwoorden
- Gebruik de beschikbare tools om vragen te beantwoorden
- Als je iets niet weet, zeg dat eerlijk
- Moedig gebruikers aan om contact op te nemen voor gepersonaliseerd advies
- Antwoord ALTIJD in het Nederlands`;

  if (context.isAuthenticated && context.userName) {
    return `${basePrompt}

De gebruiker is ingelogd als ${context.userName}.
Je hebt toegang tot hun projecten en assessment resultaten.
Gebruik de getProjects en getAssessment tools om hun persoonlijke gegevens op te halen.`;
  }

  return `${basePrompt}

De gebruiker is niet ingelogd.
Je kunt alleen algemene informatie geven over onze diensten en contactgegevens.
Moedig de gebruiker aan om in te loggen of een account aan te maken voor persoonlijke ondersteuning.`;
}

/**
 * English system prompt
 */
function getSystemPromptEN(context: AgentContext): string {
  const basePrompt = `You are the helpful AI assistant of GroeimetAI, an AI consultancy company specialized in:
- GenAI & LLM implementation
- ServiceNow AI integration
- Multi-agent orchestration systems (10x output, 95% accuracy)
- RAG architecture design
- Custom AI solutions

You have access to tools to retrieve information. Use these tools when relevant to provide accurate, up-to-date information.

Guidelines:
- Be friendly, professional, and helpful
- Give concise, action-oriented answers
- Use the available tools to answer questions
- If you don't know something, say so honestly
- Encourage users to contact us for personalized advice
- ALWAYS respond in English`;

  if (context.isAuthenticated && context.userName) {
    return `${basePrompt}

The user is logged in as ${context.userName}.
You have access to their projects and assessment results.
Use the getProjects and getAssessment tools to retrieve their personal data.`;
  }

  return `${basePrompt}

The user is not logged in.
You can only provide general information about our services and contact details.
Encourage the user to log in or create an account for personalized support.`;
}

/**
 * Get fallback response when tools fail
 */
export function getFallbackResponse(
  topic: string | null,
  locale: 'nl' | 'en'
): string {
  if (locale === 'nl') {
    if (topic === 'services' || topic === 'diensten') {
      return 'GroeimetAI biedt uitgebreide AI consultancy diensten waaronder GenAI implementatie, ServiceNow AI integratie, multi-agent orchestration en RAG architectuur design. Bezoek onze diensten pagina voor meer details.';
    }
    if (topic === 'contact') {
      return 'U kunt ons bereiken via info@groeimetai.io of via ons contactformulier op de website. We horen graag van u!';
    }
    if (topic === 'prijzen' || topic === 'kosten') {
      return 'Onze prijzen worden afgestemd op de specifieke behoeften van elk project. Neem contact met ons op voor een gepersonaliseerde offerte.';
    }
    if (topic === 'multi-agent') {
      return 'Multi-agent orchestration stelt meerdere gespecialiseerde AI-agenten in staat om samen te werken aan complexe taken. Het is een van onze belangrijkste innovaties die 10x meer output levert met 95% nauwkeurigheid.';
    }
    return 'Voel u vrij om onze website te bekijken voor meer informatie over onze AI consultancy diensten, of neem direct contact op via info@groeimetai.io.';
  }

  // English
  if (topic === 'services') {
    return 'GroeimetAI offers comprehensive AI consultancy services including GenAI implementation, ServiceNow AI integration, multi-agent orchestration, and RAG architecture design. Visit our services page for more details.';
  }
  if (topic === 'contact') {
    return 'You can reach us at info@groeimetai.io or through our contact form on the website. We look forward to hearing from you!';
  }
  if (topic === 'pricing' || topic === 'cost') {
    return 'Our pricing is tailored to the specific needs of each project. Contact us for a personalized quote.';
  }
  if (topic === 'multi-agent') {
    return 'Multi-agent orchestration enables multiple specialized AI agents to work together on complex tasks. It is one of our key innovations delivering 10x output with 95% accuracy.';
  }
  return 'Feel free to browse our website for more information about our AI consultancy services, or contact us directly at info@groeimetai.io.';
}
