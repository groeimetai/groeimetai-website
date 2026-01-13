/**
 * Get Assessment Tool
 * Queries Firestore for user's AI readiness assessment results
 */

import { adminDb } from '@/lib/firebase/admin';
import type { AgentContext, ToolResult, AssessmentSummary } from '../../types';

/**
 * Factor display names
 */
const factorLabels = {
  nl: {
    hasApis: 'API Connectiviteit',
    dataAccess: 'Data Toegankelijkheid',
    processDocumentation: 'Proces Documentatie',
    automationExperience: 'Automatisering Ervaring',
    adoptionSpeed: 'Adoptie Snelheid',
  },
  en: {
    hasApis: 'API Connectivity',
    dataAccess: 'Data Accessibility',
    processDocumentation: 'Process Documentation',
    automationExperience: 'Automation Experience',
    adoptionSpeed: 'Adoption Speed',
  },
};

/**
 * Factor value display names
 */
const factorValues = {
  nl: {
    // API connectivity
    most: 'De meeste systemen hebben APIs',
    some: 'Sommige systemen hebben APIs',
    unknown: 'Onbekend',
    none: 'Geen API beschikbaar',
    // Data access
    instant: 'Direct beschikbaar',
    minutes: 'Binnen minuten',
    difficult: 'Moeilijk te verkrijgen',
    impossible: 'Niet toegankelijk',
    // Process documentation
    documented: 'Volledig gedocumenteerd',
    partially: 'Gedeeltelijk gedocumenteerd',
    tribal: 'Tribal knowledge',
    chaos: 'Geen documentatie',
    // Automation experience
    advanced: 'Geavanceerde ervaring',
    basic: 'Basis ervaring',
    trying: 'Aan het leren',
    // Adoption speed
    'very-fast': 'Zeer snel',
    reasonable: 'Redelijk',
    slow: 'Langzaam',
    'very-slow': 'Zeer langzaam',
  },
  en: {
    most: 'Most systems have APIs',
    some: 'Some systems have APIs',
    unknown: 'Unknown',
    none: 'No API available',
    instant: 'Instantly available',
    minutes: 'Within minutes',
    difficult: 'Difficult to obtain',
    impossible: 'Not accessible',
    documented: 'Fully documented',
    partially: 'Partially documented',
    tribal: 'Tribal knowledge',
    chaos: 'No documentation',
    advanced: 'Advanced experience',
    basic: 'Basic experience',
    trying: 'Learning',
    'very-fast': 'Very fast',
    reasonable: 'Reasonable',
    slow: 'Slow',
    'very-slow': 'Very slow',
  },
};

/**
 * Calculate level from score
 */
function getLevel(score: number): AssessmentSummary['level'] {
  if (score >= 80) return 'Expert';
  if (score >= 60) return 'Advanced';
  if (score >= 40) return 'Developing';
  return 'Beginner';
}

/**
 * Get recommendations based on assessment data
 */
function getRecommendations(
  data: Record<string, string>,
  locale: 'nl' | 'en'
): string[] {
  const recommendations: string[] = [];

  if (locale === 'nl') {
    if (data.hasApis === 'none' || data.hasApis === 'unknown') {
      recommendations.push(
        'Breng je systeem APIs in kaart en identificeer integratie mogelijkheden.'
      );
    }
    if (data.dataAccess === 'difficult' || data.dataAccess === 'impossible') {
      recommendations.push(
        'Verbeter de data toegankelijkheid door centrale data opslag te implementeren.'
      );
    }
    if (data.processDocumentation === 'tribal' || data.processDocumentation === 'chaos') {
      recommendations.push(
        'Documenteer je belangrijkste bedrijfsprocessen voor betere automatisering.'
      );
    }
    if (data.automationExperience === 'trying' || data.automationExperience === 'none') {
      recommendations.push(
        'Start met kleine automatiseringsprojecten om ervaring op te bouwen.'
      );
    }
  } else {
    if (data.hasApis === 'none' || data.hasApis === 'unknown') {
      recommendations.push(
        'Map your system APIs and identify integration opportunities.'
      );
    }
    if (data.dataAccess === 'difficult' || data.dataAccess === 'impossible') {
      recommendations.push(
        'Improve data accessibility by implementing centralized data storage.'
      );
    }
    if (data.processDocumentation === 'tribal' || data.processDocumentation === 'chaos') {
      recommendations.push(
        'Document your key business processes for better automation.'
      );
    }
    if (data.automationExperience === 'trying' || data.automationExperience === 'none') {
      recommendations.push(
        'Start with small automation projects to build experience.'
      );
    }
  }

  return recommendations;
}

/**
 * Format date to readable string
 */
function formatDate(date: Date | { toDate: () => Date } | string | null): string {
  if (!date) return '';

  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if ('toDate' in date) {
    dateObj = date.toDate();
  } else {
    dateObj = date;
  }

  return dateObj.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Execute getAssessment tool
 */
export async function executeGetAssessment(
  _args: Record<string, unknown>,
  context: AgentContext
): Promise<ToolResult> {
  // Must be authenticated
  if (!context.isAuthenticated || !context.userId) {
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? 'Je moet ingelogd zijn om je assessment resultaten te bekijken.'
          : 'You must be logged in to view your assessment results.',
    };
  }

  try {
    // Query assessments for this user, get most recent
    const snapshot = await adminDb
      .collection('assessments')
      .where('userId', '==', context.userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    // Also check by email if no userId match
    let assessmentData = null;
    let assessmentDate = null;

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      assessmentData = doc.data();
      assessmentDate = assessmentData.createdAt;
    } else if (context.userEmail) {
      // Try by email
      const emailSnapshot = await adminDb
        .collection('assessments')
        .where('email', '==', context.userEmail)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!emailSnapshot.empty) {
        assessmentData = emailSnapshot.docs[0].data();
        assessmentDate = assessmentData.createdAt;
      }
    }

    if (!assessmentData) {
      return {
        success: true,
        data: {
          hasAssessment: false,
          message:
            context.locale === 'nl'
              ? 'Je hebt nog geen AI-readiness assessment gedaan. Doe de assessment om te ontdekken hoe klaar je organisatie is voor AI implementatie.'
              : "You haven't completed an AI readiness assessment yet. Take the assessment to discover how ready your organization is for AI implementation.",
        },
      };
    }

    // Calculate score if not present
    const score = assessmentData.previewScore || assessmentData.score || 0;
    const level = getLevel(score);

    // Build factor summary
    const factors = {
      apiConnectivity:
        factorValues[context.locale][assessmentData.hasApis as keyof typeof factorValues.nl] ||
        assessmentData.hasApis,
      dataAccess:
        factorValues[context.locale][assessmentData.dataAccess as keyof typeof factorValues.nl] ||
        assessmentData.dataAccess,
      processDocumentation:
        factorValues[context.locale][
          assessmentData.processDocumentation as keyof typeof factorValues.nl
        ] || assessmentData.processDocumentation,
      teamReadiness:
        factorValues[context.locale][
          assessmentData.automationExperience as keyof typeof factorValues.nl
        ] || assessmentData.automationExperience,
    };

    // Get recommendations
    const recommendations = getRecommendations(assessmentData, context.locale);

    const summary: AssessmentSummary = {
      score,
      level,
      submittedAt: formatDate(assessmentDate),
      factors,
      recommendations,
    };

    return {
      success: true,
      data: {
        hasAssessment: true,
        assessment: summary,
        message:
          context.locale === 'nl'
            ? `Je AI-readiness score is ${score}/100 (${level} niveau).`
            : `Your AI readiness score is ${score}/100 (${level} level).`,
      },
    };
  } catch (error) {
    console.error('getAssessment error:', error);
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? 'Er ging iets mis bij het ophalen van je assessment. Probeer het later opnieuw.'
          : 'Something went wrong while fetching your assessment. Please try again later.',
    };
  }
}
