/**
 * Get Projects Tool
 * Queries Firestore for user's projects
 */

import { adminDb } from '@/lib/firebase/admin';
import type { AgentContext, ToolResult, ProjectSummary } from '../../types';

interface GetProjectsArgs {
  status?: 'all' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  limit?: number;
}

/**
 * Format date to readable string
 */
function formatDate(date: Date | { toDate: () => Date } | string | null): string {
  if (!date) return 'Niet ingesteld';

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
 * Get status display name
 */
function getStatusDisplay(status: string, locale: 'nl' | 'en'): string {
  const statusMap: Record<string, { nl: string; en: string }> = {
    draft: { nl: 'Concept', en: 'Draft' },
    active: { nl: 'Actief', en: 'Active' },
    on_hold: { nl: 'Gepauzeerd', en: 'On Hold' },
    completed: { nl: 'Afgerond', en: 'Completed' },
    cancelled: { nl: 'Geannuleerd', en: 'Cancelled' },
    pending_approval: { nl: 'Wacht op goedkeuring', en: 'Pending Approval' },
  };

  return statusMap[status]?.[locale] || status;
}

/**
 * Execute getProjects tool
 */
export async function executeGetProjects(
  args: GetProjectsArgs,
  context: AgentContext
): Promise<ToolResult> {
  // Must be authenticated
  if (!context.isAuthenticated || !context.userId) {
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? 'Je moet ingelogd zijn om je projecten te bekijken.'
          : 'You must be logged in to view your projects.',
    };
  }

  try {
    const { status = 'all', limit = 5 } = args;

    // Build query - always filter by userId for security
    let query = adminDb
      .collection('projects')
      .where('clientId', '==', context.userId);

    // Add status filter if not 'all'
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Order by most recent and limit results
    query = query.orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return {
        success: true,
        data: {
          projects: [],
          message:
            context.locale === 'nl'
              ? 'Je hebt nog geen projecten.'
              : 'You have no projects yet.',
        },
      };
    }

    // Map to summaries
    const projects: ProjectSummary[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      // Find next milestone
      const milestones = data.milestones || [];
      const nextMilestone = milestones.find(
        (m: { status: string }) => m.status !== 'completed'
      );

      return {
        id: doc.id,
        name: data.name,
        status: getStatusDisplay(data.status, context.locale),
        progress: data.progress || 0,
        startDate: formatDate(data.startDate),
        endDate: data.endDate ? formatDate(data.endDate) : undefined,
        nextMilestone: nextMilestone
          ? {
              name: nextMilestone.name,
              dueDate: formatDate(nextMilestone.dueDate),
              status: getStatusDisplay(nextMilestone.status, context.locale),
            }
          : undefined,
        budget: data.budget
          ? {
              amount: data.budget.amount,
              currency: data.budget.currency || 'EUR',
              type: data.budget.type,
            }
          : undefined,
      };
    });

    return {
      success: true,
      data: {
        projects,
        count: projects.length,
        message:
          context.locale === 'nl'
            ? `${projects.length} project${projects.length !== 1 ? 'en' : ''} gevonden.`
            : `Found ${projects.length} project${projects.length !== 1 ? 's' : ''}.`,
      },
    };
  } catch (error) {
    console.error('getProjects error:', error);
    return {
      success: false,
      error:
        context.locale === 'nl'
          ? 'Er ging iets mis bij het ophalen van je projecten. Probeer het later opnieuw.'
          : 'Something went wrong while fetching your projects. Please try again later.',
    };
  }
}
