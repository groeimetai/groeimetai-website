interface LeadInfo {
  email?: string;
  company?: string;
  industry?: string;
  companySize?: string;
  needs?: string[];
  timeline?: string;
  budget?: string;
  contactPreference?: 'email' | 'phone' | 'chat';
}

interface QualificationResult {
  score: number;
  category: 'hot' | 'warm' | 'cold';
  recommendedAction: string;
  missingInfo: string[];
}

interface TranslationFunction {
  (key: string): string;
}

export class LeadQualificationService {
  private leadInfo: LeadInfo = {};
  private t?: TranslationFunction;

  // Keywords that indicate high intent
  private highIntentKeywords = [
    'implement',
    'deploy',
    'urgent',
    'asap',
    'immediately',
    'budget approved',
    'decision maker',
    'poc',
    'pilot',
    'enterprise',
    'scale',
    'production',
  ];

  // Keywords for specific needs
  private needsKeywords = {
    rag: ['rag', 'retrieval', 'knowledge base', 'search', 'documents'],
    llm: ['llm', 'language model', 'gpt', 'claude', 'gemini', 'chatbot'],
    automation: ['automate', 'automation', 'workflow', 'process', 'efficiency'],
    servicenow: ['servicenow', 'itsm', 'service management', 'ticketing'],
    consulting: ['strategy', 'roadmap', 'assessment', 'consulting', 'advisory'],
  };

  analyzeMessage(message: string): {
    intent: 'high' | 'medium' | 'low';
    topics: string[];
    extractedInfo: Partial<LeadInfo>;
  } {
    const lowerMessage = message.toLowerCase();

    // Detect intent level
    const hasHighIntent = this.highIntentKeywords.some((keyword) => lowerMessage.includes(keyword));

    // Detect topics
    const topics: string[] = [];
    Object.entries(this.needsKeywords).forEach(([topic, keywords]) => {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    // Extract information
    const extractedInfo: Partial<LeadInfo> = {};

    // Email extraction
    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      extractedInfo.email = emailMatch[0];
    }

    // Timeline extraction
    if (lowerMessage.includes('immediate') || lowerMessage.includes('asap')) {
      extractedInfo.timeline = 'immediate';
    } else if (lowerMessage.includes('month')) {
      extractedInfo.timeline = '1-3 months';
    } else if (lowerMessage.includes('quarter')) {
      extractedInfo.timeline = '3-6 months';
    }

    // Company size hints
    if (lowerMessage.includes('enterprise') || lowerMessage.includes('fortune')) {
      extractedInfo.companySize = '1000+';
    } else if (lowerMessage.includes('startup') || lowerMessage.includes('small')) {
      extractedInfo.companySize = '1-50';
    }

    return {
      intent: hasHighIntent ? 'high' : topics.length > 0 ? 'medium' : 'low',
      topics,
      extractedInfo,
    };
  }

  updateLeadInfo(info: Partial<LeadInfo>): void {
    this.leadInfo = { ...this.leadInfo, ...info };
  }

  qualifyLead(): QualificationResult {
    let score = 0;
    const missingInfo: string[] = [];

    // Scoring based on completeness
    if (this.leadInfo.email) score += 15;
    else missingInfo.push('email');

    if (this.leadInfo.company) score += 10;
    else missingInfo.push('company');

    if (this.leadInfo.industry) score += 5;

    if (this.leadInfo.companySize) {
      score += 10;
      if (this.leadInfo.companySize === '1000+') score += 10;
    } else {
      missingInfo.push('company size');
    }

    if (this.leadInfo.needs && this.leadInfo.needs.length > 0) {
      score += 15;
      if (this.leadInfo.needs.length > 2) score += 10;
    } else {
      missingInfo.push('specific needs');
    }

    if (this.leadInfo.timeline) {
      score += 15;
      if (this.leadInfo.timeline === 'immediate') score += 15;
    } else {
      missingInfo.push('timeline');
    }

    if (this.leadInfo.budget) score += 10;

    // Determine category
    let category: 'hot' | 'warm' | 'cold';
    if (score >= 70) category = 'hot';
    else if (score >= 40) category = 'warm';
    else category = 'cold';

    // Recommended actions
    let recommendedAction: string;
    if (category === 'hot') {
      recommendedAction = 'Schedule immediate consultation with senior consultant';
    } else if (category === 'warm') {
      recommendedAction = 'Nurture with targeted content and follow-up';
    } else {
      recommendedAction = 'Add to newsletter and provide self-service resources';
    }

    return {
      score,
      category,
      recommendedAction,
      missingInfo,
    };
  }

  setTranslationFunction(t: TranslationFunction): void {
    this.t = t;
  }

  getQualifyingQuestions(): string[] {
    const questions: string[] = [];

    if (!this.leadInfo.email) {
      questions.push(this.t?.('leadQualification.questions.email') || "What's your email address so we can send you personalized recommendations?");
    }

    if (!this.leadInfo.company) {
      questions.push(this.t?.('leadQualification.questions.company') || 'Which company are you with?');
    }

    if (!this.leadInfo.needs || this.leadInfo.needs.length === 0) {
      questions.push(this.t?.('leadQualification.questions.needs') || 'What specific AI challenges are you looking to solve?');
    }

    if (!this.leadInfo.timeline) {
      questions.push(this.t?.('leadQualification.questions.timeline') || 'When are you looking to implement an AI solution?');
    }

    if (!this.leadInfo.companySize) {
      questions.push(this.t?.('leadQualification.questions.companySize') || 'How large is your organization?');
    }

    return questions;
  }

  generateContextualResponse(
    userMessage: string,
    analysis: ReturnType<typeof this.analyzeMessage>
  ): string {
    const { intent, topics, extractedInfo } = analysis;

    // Update lead info with extracted data
    this.updateLeadInfo(extractedInfo);

    // Generate response based on intent and topics
    if (intent === 'high' && topics.length > 0) {
      const topicResponses = {
        rag: this.t?.('leadQualification.responses.rag') || "I see you're interested in RAG implementation. This is one of our specialties! We've helped numerous enterprises build powerful knowledge retrieval systems. Would you like to discuss your specific use case with one of our RAG experts?",
        llm: this.t?.('leadQualification.responses.llm') || "Large Language Models are transforming businesses. We can help you implement and optimize LLMs for your specific needs, whether it's customer service, content generation, or analysis. What's your primary use case?",
        automation: this.t?.('leadQualification.responses.automation') || 'AI-powered automation can significantly improve efficiency. We specialize in intelligent process automation that learns and adapts. What processes are you looking to automate?',
        servicenow: this.t?.('leadQualification.responses.servicenow') || "Our ServiceNow AI integration expertise can help you create intelligent workflows. We've implemented AI-powered ITSM solutions for many enterprises. Are you currently using ServiceNow?",
        consulting: this.t?.('leadQualification.responses.consulting') || "Our AI strategy consulting helps organizations navigate their transformation journey. We'd love to understand your current state and desired outcomes. Shall we schedule a strategic assessment call?",
      };

      return (
        topicResponses[topics[0] as keyof typeof topicResponses] ||
        this.t?.('leadQualification.fallbacks.highIntent') ||
        "I'd be happy to help you with your AI needs. Can you tell me more about your specific requirements?"
      );
    }

    // For medium intent, ask qualifying questions
    if (intent === 'medium') {
      const questions = this.getQualifyingQuestions();
      if (questions.length > 0) {
        const mediumIntentPrefix = this.t?.('leadQualification.fallbacks.mediumIntent') || "That's great! To provide you with the most relevant information, ";
        return `${mediumIntentPrefix}${questions[0]}`;
      }
    }

    // For low intent, provide general information
    return this.t?.('leadQualification.fallbacks.lowIntent') || "I'm here to help you explore how AI can transform your business. What aspects of AI are you most curious about?";
  }

  shouldEscalateToHuman(): boolean {
    const qualification = this.qualifyLead();

    // Escalate hot leads or complex queries
    return (
      qualification.category === 'hot' ||
      (this.leadInfo.needs && this.leadInfo.needs.length > 3) ||
      false
    );
  }

  getLeadSummary(): string {
    const qualification = this.qualifyLead();

    return `Lead Summary:
- Score: ${qualification.score}/100 (${qualification.category})
- Email: ${this.leadInfo.email || 'Not provided'}
- Company: ${this.leadInfo.company || 'Not provided'}
- Size: ${this.leadInfo.companySize || 'Not provided'}
- Timeline: ${this.leadInfo.timeline || 'Not provided'}
- Needs: ${this.leadInfo.needs?.join(', ') || 'Not specified'}
- Recommendation: ${qualification.recommendedAction}`;
  }
}

export default LeadQualificationService;
