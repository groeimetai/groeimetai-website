// Blog registry — one TS module per post under src/content/blog/posts/<slug>-<locale>.ts.
// Each module exports the BlogPost shape, this index gathers them so we get
// allPostSlugs(), listPosts(), getPost() without manual maintenance per page.

import type { BlogPost, Locale } from '../types';

import { aiTrainingPraktischBeginnen } from './posts/ai-training-praktisch-beginnen';
import { aiAdoptieKloofMkb } from './posts/ai-adoptie-kloof-mkb';
import { workflowHerontwerpStappenplan } from './posts/workflow-herontwerp-stappenplan';
import { veiligeAiIntegratiesChecklist } from './posts/veilige-ai-integraties-checklist';
import { aiGovernanceMkb } from './posts/ai-governance-mkb';
import { promptEngineeringTeams } from './posts/prompt-engineering-teams';
import { aiHypeFiltrerenBeslissers } from './posts/ai-hype-filtreren-beslissers';
import { copilotVsCustom } from './posts/copilot-vs-custom';
import { aiRoiBerekenenZondertools } from './posts/ai-roi-berekenen-zonder-tools';
import { changeManagementAi } from './posts/change-management-ai';
import { aiPilotsDieNooitOpschalen } from './posts/ai-pilots-die-nooit-opschalen';
import { foundationModelsKiezen } from './posts/foundation-models-kiezen';
import { multiAgentSystemsFutureAutomation } from './posts/multi-agent-systems-future-automation';
import { ragArchitectuurBestPractices } from './posts/rag-architectuur-best-practices';
import { servicenowAiTransformatie } from './posts/servicenow-ai-transformatie';
import { llmSecurityCompliance } from './posts/llm-security-compliance';

const posts: BlogPost[] = [
  aiTrainingPraktischBeginnen,
  aiAdoptieKloofMkb,
  workflowHerontwerpStappenplan,
  veiligeAiIntegratiesChecklist,
  aiGovernanceMkb,
  promptEngineeringTeams,
  aiHypeFiltrerenBeslissers,
  copilotVsCustom,
  aiRoiBerekenenZondertools,
  changeManagementAi,
  aiPilotsDieNooitOpschalen,
  foundationModelsKiezen,
  multiAgentSystemsFutureAutomation,
  ragArchitectuurBestPractices,
  servicenowAiTransformatie,
  llmSecurityCompliance,
];

export function listPosts(locale: Locale): BlogPost[] {
  return posts
    .filter((p) => p.locale === locale)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string, locale: Locale): BlogPost | undefined {
  return posts.find((p) => p.slug === slug && p.locale === locale);
}

export function allPostSlugs(): Array<{ slug: string; locale: Locale }> {
  return posts.map(({ slug, locale }) => ({ slug, locale }));
}

export function allPosts(): BlogPost[] {
  return posts;
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  if (!post.related) return [];
  return post.related
    .map((slug) => posts.find((p) => p.slug === slug && p.locale === post.locale))
    .filter((p): p is BlogPost => Boolean(p))
    .slice(0, limit);
}
