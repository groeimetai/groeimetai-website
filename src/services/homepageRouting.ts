// Homepage Entry Point Router
// Manages all customer entry flows from homepage

export type EntryPoint = 
  | 'aan_de_slag_modal' 
  | 'hero_assessment'
  | 'hero_gesprek' 
  | 'zie_hoe'
  | 'snow_flow_github'
  | 'download_guide'
  | 'bottom_gesprek'
  | 'bottom_assessment'
  | 'bottom_checklist'
  | 'pricing_contact';

export type UserIntent = 'high' | 'medium' | 'low';

export interface RoutingResult {
  destination: string;
  intent: UserIntent;
  trackingData: any;
  followUpActions: string[];
}

export class HomepageRouter {
  static async routeUserAction(
    entryPoint: EntryPoint,
    userContext: any = {}
  ): Promise<RoutingResult> {
    
    switch (entryPoint) {
      case 'aan_de_slag_modal':
        return this.handleAanDeSlagModal(userContext);
      
      case 'hero_assessment':
        return this.handleHeroAssessment(userContext);
        
      case 'hero_gesprek':
        return this.handlePlanGesprek(userContext);
        
      case 'zie_hoe':
        return this.handleZieHoe(userContext);
        
      case 'snow_flow_github':
        return this.handleSnowFlowGithub(userContext);
        
      case 'download_guide':
        return this.handleDownloadGuide(userContext);
        
      case 'bottom_gesprek':
        return this.handleBottomGesprek(userContext);
        
      case 'bottom_assessment':
        return this.handleBottomAssessment(userContext);
        
      case 'bottom_checklist':
        return this.handleBottomChecklist(userContext);
        
      case 'pricing_contact':
        return this.handlePricingContact(userContext);
        
      default:
        return this.handleDefault();
    }
  }

  // FLOW A: "Aan de slag" Modal Flow
  private static handleAanDeSlagModal(context: any): RoutingResult {
    if (context.hasAccount) {
      return {
        destination: '/dashboard',
        intent: 'medium',
        trackingData: { entry: 'existing_user_dashboard' },
        followUpActions: ['show_new_features', 'check_assessment_status']
      };
    } else {
      return {
        destination: 'modal:account_or_guest',
        intent: 'medium',
        trackingData: { entry: 'new_user_modal' },
        followUpActions: [
          'track_modal_choice',
          'create_lead_record', 
          'schedule_follow_up'
        ]
      };
    }
  }

  // Hero Section CTAs
  private static handleHeroAssessment(context: any): RoutingResult {
    const isReturningVisitor = context.previousVisitor;
    
    return {
      destination: '/agent-readiness',
      intent: 'medium',
      trackingData: {
        entry: 'hero_assessment',
        returning_visitor: isReturningVisitor,
        previous_email: context.email || null
      },
      followUpActions: [
        'track_assessment_start',
        isReturningVisitor ? 'prefill_email' : 'new_lead_created',
        'schedule_24h_follow_up'
      ]
    };
  }

  private static handlePlanGesprek(context: any): RoutingResult {
    return {
      destination: '/contact',
      intent: 'high',
      trackingData: {
        entry: 'hero_plan_gesprek',
        urgency: 'direct_contact'
      },
      followUpActions: [
        'track_high_intent_lead',
        'notify_admin_hot_lead',
        'send_calendly_link',
        'prep_exploratory_notes'
      ]
    };
  }

  private static handleZieHoe(context: any): RoutingResult {
    return {
      destination: '/cases',
      intent: 'medium',
      trackingData: {
        entry: 'zie_hoe_cases',
        content_interest: 'methodology'
      },
      followUpActions: [
        'track_case_study_view',
        'suggest_snow_flow_demo',
        'account_creation_prompt'
      ]
    };
  }

  private static handleSnowFlowGithub(context: any): RoutingResult {
    return {
      destination: 'https://github.com/GroeimetAI/snow-flow',
      intent: 'low',
      trackingData: {
        entry: 'snow_flow_github',
        user_type: 'developer',
        interest: 'technical'
      },
      followUpActions: [
        'track_developer_interest',
        'offer_api_access',
        'technical_nurture_sequence'
      ]
    };
  }

  private static handleDownloadGuide(context: any): RoutingResult {
    return {
      destination: '/mcp-guide',
      intent: 'low',
      trackingData: {
        entry: 'download_guide',
        content_type: 'educational',
        stage: 'research'
      },
      followUpActions: [
        'email_capture',
        'start_nurture_sequence',
        'schedule_3day_follow_up',
        'suggest_assessment_after_guide'
      ]
    };
  }

  // Bottom Page CTAs (After scroll engagement)
  private static handleBottomGesprek(context: any): RoutingResult {
    return {
      destination: '/contact',
      intent: 'high',
      trackingData: {
        entry: 'bottom_plan_gesprek',
        engagement: 'full_page_scroll',
        commitment_level: 'high'
      },
      followUpActions: [
        'flag_priority_lead',
        'admin_immediate_notification',
        'calendly_priority_slots'
      ]
    };
  }

  private static handleBottomAssessment(context: any): RoutingResult {
    return {
      destination: '/agent-readiness',
      intent: 'medium',
      trackingData: {
        entry: 'bottom_assessment',
        engagement: 'full_page_scroll',
        commitment_level: 'medium'
      },
      followUpActions: [
        'track_engaged_visitor',
        'standard_follow_up_sequence'
      ]
    };
  }

  private static handleBottomChecklist(context: any): RoutingResult {
    return {
      destination: '/download/checklist',
      intent: 'low',
      trackingData: {
        entry: 'bottom_checklist',
        stage: 'research',
        engagement: 'content_interested'
      },
      followUpActions: [
        'add_to_nurture_campaign',
        'schedule_weekly_follow_up'
      ]
    };
  }

  private static handlePricingContact(context: any): RoutingResult {
    return {
      destination: '/implementation-proposal',
      intent: 'high',
      trackingData: {
        entry: 'pricing_contact',
        interest: 'implementation',
        budget_aware: true
      },
      followUpActions: [
        'flag_qualified_lead',
        'suggest_assessment_first',
        'prep_implementation_discussion'
      ]
    };
  }

  private static handleDefault(): RoutingResult {
    return {
      destination: '/',
      intent: 'low',
      trackingData: { entry: 'unknown' },
      followUpActions: ['track_unknown_entry']
    };
  }

  // Analytics & Tracking
  static async trackEntry(entryPoint: EntryPoint, context: any): Promise<void> {
    const routing = await this.routeUserAction(entryPoint, context);
    
    // Send to analytics
    await this.sendAnalytics({
      event: 'homepage_entry',
      entry_point: entryPoint,
      user_intent: routing.intent,
      destination: routing.destination,
      context: routing.trackingData
    });

    // Trigger follow-up actions
    for (const action of routing.followUpActions) {
      await this.executeFollowUpAction(action, context);
    }
  }

  // Admin Dashboard Integration
  static async executeFollowUpAction(action: string, context: any): Promise<void> {
    switch (action) {
      case 'notify_admin_hot_lead':
        await this.notifyAdmin({
          type: 'hot_lead',
          priority: 'high',
          message: 'High-intent lead from hero CTA',
          context
        });
        break;

      case 'flag_priority_lead':
        await this.updateLeadPriority(context.leadId, 'high');
        break;

      case 'schedule_24h_follow_up':
        await this.scheduleTask('follow_up', '+24h', context);
        break;

      case 'start_nurture_sequence':
        await this.addToNurtureSequence(context.email, 'mcp_guide_sequence');
        break;

      case 'track_developer_interest':
        await this.addToDeveloperNurture(context);
        break;

      default:
        console.log(`Follow-up action: ${action}`, context);
    }
  }

  // Smart Routing Logic
  static getSmartRouting(
    userHistory: any,
    currentAction: string
  ): { 
    destination: string;
    prefill?: any;
    priority?: string;
  } {
    
    // Returning visitor optimization
    if (userHistory.previousAssessment && currentAction === 'assessment') {
      return {
        destination: '/agent-readiness',
        prefill: { email: userHistory.email },
        priority: 'returning_visitor'
      };
    }

    // High-intent sequence detection
    if (userHistory.contactFormViewed && currentAction === 'assessment') {
      return {
        destination: '/agent-readiness',
        priority: 'hot_lead' // Viewed contact but chose assessment = serious
      };
    }

    // Developer route
    if (userHistory.githubViewed && currentAction === 'assessment') {
      return {
        destination: '/agent-readiness',
        prefill: { role: 'Developer' },
        priority: 'technical_lead'
      };
    }

    return {
      destination: '/agent-readiness',
      priority: 'standard'
    };
  }

  // Helper Methods
  private static async sendAnalytics(data: any): Promise<void> {
    console.log('Analytics:', data);
  }

  private static async notifyAdmin(notification: any): Promise<void> {
    console.log('Admin notification:', notification);
  }

  private static async updateLeadPriority(leadId: string, priority: string): Promise<void> {
    console.log(`Updating lead ${leadId} priority to ${priority}`);
  }

  private static async scheduleTask(type: string, when: string, context: any): Promise<void> {
    console.log(`Scheduling ${type} task for ${when}:`, context);
  }

  private static async addToNurtureSequence(email: string, sequence: string): Promise<void> {
    console.log(`Adding ${email} to nurture sequence: ${sequence}`);
  }

  private static async addToDeveloperNurture(context: any): Promise<void> {
    console.log('Adding to developer nurture:', context);
  }
}