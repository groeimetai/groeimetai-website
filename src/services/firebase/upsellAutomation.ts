// Firebase Functions for Automated Upsell Flow
// NOTE: This file is designed for Firebase Cloud Functions deployment
// Types are defined locally for client-side TypeScript compatibility

// Type definitions for Firebase Functions (for TypeScript compatibility only)
type FirestoreEvent<T> = {
  data?: { data: () => T | undefined };
  params: { assessmentId: string };
};

type CallableRequest<T> = {
  data: T;
  auth?: { uid: string };
};

// Placeholder types - actual implementation uses firebase-functions
const onDocumentCreated = <T>(path: string, handler: (event: FirestoreEvent<T>) => Promise<void>) => handler;
const onCall = <T, R>(handler: (request: CallableRequest<T>) => Promise<R>) => handler;

class HttpsError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

// Mock Firestore for type checking (actual implementation uses firebase-admin)
const FieldValue = {
  serverTimestamp: () => new Date()
};

// User data interface for Firebase
interface UserData {
  company?: string;
  email?: string;
  [key: string]: any;
}

const db = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      set: async (data: any) => {},
      update: async (data: any) => {},
      get: async () => ({ data: (): UserData | undefined => undefined })
    }),
    add: async (data: any) => {},
    where: (field: string, op: string, value: any) => ({
      get: async () => ({ docs: [] as any[] })
    })
  }),
  batch: () => ({
    update: (ref: any, data: any) => {},
    commit: async () => {}
  })
};

// Assessment data interface
export interface AssessmentData {
  userId: string;
  company: string;
  email: string;
  companySize: string;
  budget: string;
  timeline: string;
  painPoints: string[];
}

// Dynamic Report Generator placeholder
const DynamicReportGenerator = {
  generateFreemiumReport: async (data: AssessmentData) => ({
    score: 50,
    breakdown: { technical: 20, organizational: 15, strategic: 15 },
    executiveSummary: '',
    opportunities: '',
    industryBenchmark: '',
    nextSteps: '',
    lockedSections: []
  })
};

export interface LeadScore {
  score: 'hot' | 'warm' | 'cold';
  priority: 'high' | 'medium' | 'low';
  factors: string[];
}

export class UpsellAutomation {
  // Triggered when new assessment is submitted
  static onAssessmentSubmitted = onDocumentCreated<AssessmentData>('assessments/{assessmentId}', async (event: FirestoreEvent<AssessmentData>) => {
    const assessmentData = event.data?.data();
    if (!assessmentData) return;

    try {
      // Generate dynamic report with Claude
      const report = await DynamicReportGenerator.generateFreemiumReport(assessmentData);
      
      // Calculate lead score
      const leadScore = await this.calculateLeadScore(assessmentData, report.score);
      
      // Store report
      await db.collection('reports').doc(event.params.assessmentId).set({
        ...report,
        assessmentId: event.params.assessmentId,
        userId: assessmentData.userId,
        leadScore: leadScore.score,
        createdAt: FieldValue.serverTimestamp(),
        status: 'generated'
      });

      // Initialize upsell sequence
      await this.initializeUpsellSequence(
        assessmentData.userId,
        event.params.assessmentId,
        report.score,
        leadScore
      );

      // Notify admin if hot lead
      if (leadScore.score === 'hot') {
        await this.notifyAdminHotLead(assessmentData, report.score);
      }

    } catch (error) {
      console.error('Assessment automation error:', error);
      // Create fallback report
      await this.createFallbackReport(event.params.assessmentId, assessmentData);
    }
  });

  // Calculate intelligent lead scoring
  private static async calculateLeadScore(
    assessmentData: AssessmentData, 
    agentReadinessScore: number
  ): Promise<LeadScore> {
    const factors = [];
    let score = 0;

    // Company size weight (30 points)
    if (assessmentData.companySize === '250+ medewerkers') {
      score += 30;
      factors.push('Enterprise size');
    } else if (assessmentData.companySize === '50-250 medewerkers') {
      score += 20;
      factors.push('Mid-market size');
    } else {
      score += 10;
      factors.push('SMB size');
    }

    // Budget indication (25 points)
    if (assessmentData.budget === '€100k+') {
      score += 25;
      factors.push('High budget');
    } else if (assessmentData.budget === '€25-100k') {
      score += 15;
      factors.push('Medium budget');
    } else if (assessmentData.budget === '<€25k') {
      score += 5;
      factors.push('Low budget');
    }

    // Timeline urgency (20 points)
    if (assessmentData.timeline === 'ASAP - we lopen achter') {
      score += 20;
      factors.push('Urgent timeline');
    } else if (assessmentData.timeline === 'Binnen 3 maanden') {
      score += 15;
      factors.push('Near-term timeline');
    }

    // Pain point severity (15 points)
    const highPainPoints = ['Te veel handmatig werk', 'Trage response tijden'];
    if (assessmentData.painPoints.some((pain: string) => highPainPoints.includes(pain))) {
      score += 15;
      factors.push('High pain points');
    }

    // Technical readiness (10 points)
    if (agentReadinessScore > 70) {
      score += 10;
      factors.push('High readiness score');
    }

    // Determine lead quality
    let leadQuality: 'hot' | 'warm' | 'cold';
    let priority: 'high' | 'medium' | 'low';

    if (score >= 70) {
      leadQuality = 'hot';
      priority = 'high';
    } else if (score >= 40) {
      leadQuality = 'warm';  
      priority = 'medium';
    } else {
      leadQuality = 'cold';
      priority = 'low';
    }

    return {
      score: leadQuality,
      priority,
      factors
    };
  }

  // Initialize personalized upsell sequence
  private static async initializeUpsellSequence(
    userId: string,
    assessmentId: string,
    score: number,
    leadScore: LeadScore
  ): Promise<void> {
    const emailSequence = this.generateEmailSequence(leadScore.score);
    
    // Create upsell campaign
    const campaign = {
      userId,
      assessmentId,
      agentReadinessScore: score,
      leadScore: leadScore.score,
      leadFactors: leadScore.factors,
      stage: 'freemium_delivered',
      emails: emailSequence,
      dashboardLocks: this.generateDashboardLocks(leadScore.score),
      abTestVariant: await this.assignABTestVariant(userId),
      createdAt: FieldValue.serverTimestamp(),
      status: 'active'
    };

    await db.collection('upsell_campaigns').doc(userId).set(campaign);
    
    // Schedule immediate email
    await this.scheduleEmail(userId, emailSequence[0]);
    
    // Set dashboard notifications
    await this.setDashboardUpsells(userId, leadScore);
  }

  // Generate email sequence based on lead temperature
  private static generateEmailSequence(leadScore: string): any[] {
    const sequences = {
      hot: [
        { 
          delay: 0, 
          template: 'report_ready_hot',
          subject: 'Jouw Agent Readiness Score + Expert Assessment Invite',
          cta: 'Book Expert Assessment',
          urgency: 'high'
        },
        { 
          delay: 24, 
          template: 'expert_calendar_reminder',
          subject: 'Limited Expert Assessment Slots - Book Now',
          cta: 'Schedule Workshop',
          urgency: 'high'
        },
        { 
          delay: 72, 
          template: 'case_study_similar',
          subject: 'How [Similar Company] Achieved 300% ROI',
          cta: 'Get Your ROI Calculation',
          urgency: 'medium'
        }
      ],
      warm: [
        { 
          delay: 0, 
          template: 'report_ready_standard',
          subject: 'Jouw Agent Readiness Rapport is Klaar',
          cta: 'View Dashboard',
          urgency: 'medium'
        },
        { 
          delay: 72, 
          template: 'educational_mcp_guide',
          subject: 'Gratis MCP Guide + Unlock Extra Insights',
          cta: 'Download Guide',
          urgency: 'low'
        },
        { 
          delay: 168, 
          template: 'roi_calculator_tease',
          subject: 'Hoeveel Kun Je Besparen met Agents?',
          cta: 'Get ROI Calculation',
          urgency: 'medium'
        },
        { 
          delay: 336, 
          template: 'expert_assessment_value',
          subject: 'Waarom 92% Kiest voor Expert Assessment',
          cta: 'Learn More',
          urgency: 'medium'
        }
      ],
      cold: [
        { 
          delay: 0, 
          template: 'report_ready_educational',
          subject: 'Agent Readiness Rapport + Gratis Resources',
          cta: 'Explore Resources',
          urgency: 'low'
        },
        { 
          delay: 168, 
          template: 'weekly_insights',
          subject: 'Agent Economy Update #1',
          cta: 'Stay Updated',
          urgency: 'low'
        },
        { 
          delay: 720, 
          template: 'monthly_checkin',
          subject: 'Nog Steeds Interested in Agent Infrastructure?',
          cta: 'Update Preferences',
          urgency: 'low'
        }
      ]
    };

    return sequences[leadScore as keyof typeof sequences] || sequences.cold;
  }

  // Create dashboard content locks for upsell
  private static generateDashboardLocks(leadScore: string): any[] {
    const baseLocks = [
      {
        section: 'detailed_roi',
        title: 'Detailed ROI Calculation',
        preview: 'Potentiële besparing: €••,•••/jaar',
        description: 'Specifieke kosten/baten analyse voor jouw situatie',
        unlockPrice: '€2.500',
        urgency: leadScore === 'hot' ? 'high' : 'medium'
      },
      {
        section: 'custom_roadmap',
        title: 'Custom Implementation Plan', 
        preview: 'Jouw 90-dagen roadmap naar agent-ready',
        description: 'Stap-voor-stap implementatie plan met tijdlijnen',
        unlockPrice: '€2.500',
        urgency: leadScore === 'hot' ? 'high' : 'medium'
      }
    ];

    if (leadScore === 'hot') {
      baseLocks.push({
        section: 'priority_support',
        title: 'Priority Expert Call',
        preview: '30-min direct met agent architect',
        description: 'Skip de wachtlijst - expert call binnen 48u',
        unlockPrice: '€2.500',
        urgency: 'high'
      });
    }

    return baseLocks;
  }

  // A/B test assignment for conversion optimization
  private static async assignABTestVariant(userId: string): Promise<string> {
    // Consistent variant assignment based on user ID
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variant = hash % 2 === 0 ? 'A' : 'B';
    
    const variants = {
      A: {
        name: 'aggressive_locks',
        emailFrequency: 'high',
        dashboardStyle: 'locked_content_prominent',
        discountOffer: false
      },
      B: {
        name: 'subtle_education', 
        emailFrequency: 'medium',
        dashboardStyle: 'educational_focus',
        discountOffer: true
      }
    };

    // Track assignment
    await db.collection('ab_test_assignments').doc(userId).set({
      variant,
      testName: 'expert_assessment_upsell_v1',
      assignedAt: FieldValue.serverTimestamp()
    });

    return variant;
  }

  // Track conversion events for optimization
  static trackConversion = onCall<{ action: string; component: string; assessmentId: string; variant: string }, { success: boolean }>(async (request: CallableRequest<{ action: string; component: string; assessmentId: string; variant: string }>) => {
    const { action, component, assessmentId, variant } = request.data;
    const userId = request.auth?.uid;

    if (!userId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Log interaction
    await db.collection('upsell_analytics').add({
      userId,
      action, // 'view', 'click', 'dismiss', 'convert'
      component, // 'locked_section', 'email_cta', 'dashboard_banner'
      assessmentId,
      variant,
      timestamp: FieldValue.serverTimestamp()
    });

    // Handle conversion
    if (action === 'convert') {
      await this.handleExpertAssessmentConversion(userId, assessmentId);
    }

    return { success: true };
  });

  // Handle expert assessment conversion
  private static async handleExpertAssessmentConversion(
    userId: string, 
    assessmentId: string
  ): Promise<void> {
    // Update campaign status
    await db.collection('upsell_campaigns').doc(userId).update({
      status: 'converted',
      convertedAt: FieldValue.serverTimestamp(),
      conversionSource: 'dashboard_upsell'
    });

    // Stop email sequence
    await this.stopEmailSequence(userId);

    // Notify sales team
    await this.notifyExpertAssessmentRequest(userId, assessmentId);

    // Send confirmation email
    await this.sendConversionConfirmation(userId);
  }

  // Email scheduling and management
  private static async scheduleEmail(userId: string, emailConfig: any): Promise<void> {
    await db.collection('scheduled_emails').add({
      userId,
      template: emailConfig.template,
      subject: emailConfig.subject,
      cta: emailConfig.cta,
      urgency: emailConfig.urgency,
      scheduledFor: new Date(Date.now() + (emailConfig.delay * 60 * 60 * 1000)), // hours to ms
      status: 'scheduled',
      createdAt: FieldValue.serverTimestamp()
    });
  }

  private static async stopEmailSequence(userId: string): Promise<void> {
    const emailsRef = db.collection('scheduled_emails').where('userId', '==', userId);
    const batch = db.batch();
    
    const snapshot = await emailsRef.get();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'cancelled' });
    });
    
    await batch.commit();
  }

  // Notification systems
  private static async notifyAdminHotLead(
    assessmentData: any, 
    score: number
  ): Promise<void> {
    await db.collection('admin_notifications').add({
      type: 'hot_lead',
      priority: 'high',
      title: 'Hot Lead - High Score Assessment',
      message: `${assessmentData.company} scored ${score}/100`,
      data: {
        company: assessmentData.company,
        email: assessmentData.email,
        score,
        budget: assessmentData.budget,
        timeline: assessmentData.timeline
      },
      createdAt: FieldValue.serverTimestamp(),
      read: false
    });
  }

  private static async notifyExpertAssessmentRequest(
    userId: string, 
    assessmentId: string
  ): Promise<void> {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    await db.collection('admin_notifications').add({
      type: 'expert_assessment_request',
      priority: 'high',
      title: 'Expert Assessment Requested',
      message: `${userData?.company || 'Company'} requested expert assessment`,
      data: {
        userId,
        assessmentId,
        company: userData?.company,
        email: userData?.email,
        requestedAt: FieldValue.serverTimestamp()
      },
      createdAt: FieldValue.serverTimestamp(),
      read: false
    });
  }

  // Dashboard upsell content management
  private static async setDashboardUpsells(
    userId: string, 
    leadScore: LeadScore
  ): Promise<void> {
    const upsellConfig = {
      showLockedContent: leadScore.score !== 'cold',
      bannerStyle: leadScore.score === 'hot' ? 'urgent' : 'standard',
      lockIntensity: leadScore.score === 'hot' ? 'high' : 'medium',
      recommendationFrequency: leadScore.score === 'hot' ? 'persistent' : 'periodic'
    };

    await db.collection('dashboard_config').doc(userId).set({
      upsells: upsellConfig,
      leadScore: leadScore.score,
      lastUpdated: FieldValue.serverTimestamp()
    });
  }

  // Conversion optimization and analytics
  static getConversionAnalytics = onCall<{ timeframe?: string }, any>(async (request: CallableRequest<{ timeframe?: string }>) => {
    const timeframe = request.data.timeframe || '30d';
    
    // Aggregate conversion data
    const analytics = await db.collection('upsell_analytics')
      .where('timestamp', '>=', this.getTimeframeCutoff(timeframe))
      .get();

    const stats = {
      totalViews: 0,
      totalClicks: 0, 
      totalConversions: 0,
      conversionRate: 0,
      byVariant: { A: { views: 0, conversions: 0 }, B: { views: 0, conversions: 0 } },
      byLeadScore: { hot: { views: 0, conversions: 0 }, warm: { views: 0, conversions: 0 }, cold: { views: 0, conversions: 0 } }
    };

    analytics.docs.forEach(doc => {
      const data = doc.data();
      if (data.action === 'view') stats.totalViews++;
      if (data.action === 'click') stats.totalClicks++;
      if (data.action === 'convert') {
        stats.totalConversions++;
        if (data.variant) stats.byVariant[data.variant as 'A' | 'B'].conversions++;
      }
    });

    stats.conversionRate = stats.totalViews > 0 ? 
      (stats.totalConversions / stats.totalViews) * 100 : 0;

    return stats;
  });

  // Helper functions
  private static async createFallbackReport(assessmentId: string, assessmentData: any): Promise<void> {
    const fallbackReport = {
      score: 50, // Default conservative score
      breakdown: { technical: 20, organizational: 15, strategic: 15 },
      executiveSummary: 'Assessment processed. Multiple opportunities identified.',
      opportunities: 'Automation potential detected across key business systems.',
      industryBenchmark: 'Agent adoption increasing in your industry segment.',
      nextSteps: 'Consider expert assessment for detailed analysis.',
      lockedSections: [],
      status: 'fallback_generated',
      createdAt: FieldValue.serverTimestamp()
    };

    await db.collection('reports').doc(assessmentId).set(fallbackReport);
  }

  private static getTimeframeCutoff(timeframe: string): Date {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    return new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  }

  private static async sendConversionConfirmation(userId: string): Promise<void> {
    await db.collection('scheduled_emails').add({
      userId,
      template: 'expert_assessment_confirmation',
      subject: 'Expert Assessment Bevestiging - Next Steps',
      priority: 'high',
      scheduledFor: new Date(),
      status: 'scheduled',
      createdAt: FieldValue.serverTimestamp()
    });
  }
}