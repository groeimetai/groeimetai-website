import { NextRequest, NextResponse } from 'next/server';
import { DynamicReportGenerator } from '@/services/ai/reportGeneration';

// Calculate a preview score based on assessment data
function calculatePreviewScore(data: any): number {
  let score = 50; // Base score

  // Add points based on various factors
  if (data.aiReadiness && data.aiReadiness > 3) score += 10;
  if (data.dataQuality && data.dataQuality > 3) score += 10;
  if (data.teamReadiness && data.teamReadiness > 3) score += 10;
  if (data.infrastructureReady) score += 10;
  if (data.hasDefinedUseCase) score += 10;

  return Math.min(100, Math.max(0, score));
}

export async function POST(req: NextRequest) {
  try {
    const assessmentData = await req.json();
    
    // Extract userId from multiple sources (Authorization header, request body, or Firebase ID token)
    let userId = null;
    let userEmail = null;
    
    // Method 1: Try Authorization header
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const { verifyIdToken } = await import('@/lib/firebase/admin');
        const token = authHeader.substring(7);
        const result = await verifyIdToken(token);
        if (result.valid && result.decodedToken) {
          userId = result.decodedToken.uid;
          userEmail = result.decodedToken.email;
          console.log('✅ Authenticated user detected via Authorization header:', userId);
        }
      }
    } catch (authError) {
      console.log('⚠️ Authorization header auth failed:', authError);
    }
    
    // Method 2: Try Firebase ID token from body (for client-side auth)
    if (!userId && assessmentData.firebaseIdToken) {
      try {
        const { verifyIdToken } = await import('@/lib/firebase/admin');
        const result = await verifyIdToken(assessmentData.firebaseIdToken);
        if (result.valid && result.decodedToken) {
          userId = result.decodedToken.uid;
          userEmail = result.decodedToken.email;
          console.log('✅ Authenticated user detected via ID token in body:', userId);
        }
      } catch (tokenError) {
        console.log('⚠️ ID token verification failed:', tokenError);
      }
    }
    
    // Method 3: Use userId directly if provided in body (from authenticated client)
    if (!userId && assessmentData.userId) {
      userId = assessmentData.userId;
      console.log('✅ Using userId from request body:', userId);
    }
    
    // Create lead in pipeline with enhanced user tracking
    const leadId = await createLead({
      ...assessmentData,
      userId, // Add userId if authenticated
      authenticatedEmail: userEmail, // Add authenticated email for verification
      submissionMethod: userId ? 'authenticated' : 'anonymous',
      status: 'assessment_submitted',
      source: 'website_assessment',
      createdAt: new Date()
    });

    // Calculate preview score based on assessment type
    const assessmentType = assessmentData.type || 'agent_readiness';
    const previewScore = calculateScoreByType(assessmentData, assessmentType);

    // Start background report generation (don't await - async!)
    generateAndEmailReportAsync(assessmentData, leadId, assessmentType);
    
    // Return immediate response to user
    return NextResponse.json({
      success: true,
      previewScore,
      assessmentId: leadId,
      message: 'Assessment ontvangen! Je volledige rapport komt binnen 2-5 minuten via email.',
      nextSteps: [
        'Check email binnen 5 minuten',
        'View results in dashboard',  
        'Upgrade to Expert Assessment for roadmap'
      ]
    });

  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    );
  }
}

function calculateConsistentScore(data: any): number {
  // Use EXACT same logic as report generator (4x25 points = 100 total)
  
  // 1. API Connectivity (25 points)
  const apiScores = {
    'most': 25,      // Most systems have APIs
    'some': 15,      // Partial API coverage
    'unknown': 8,    // Unknown = likely minimal
    'none': 0        // No APIs yet
  } as Record<string, number>;
  const apiScore = apiScores[data.hasApis] || 0;
  
  // 2. Data Access (25 points)
  const dataScores = {
    'instant': 25,      // Agent can access all data immediately
    'minutes': 18,      // Some friction but accessible
    'difficult': 8,     // Major data silos
    'impossible': 0     // Not digitized yet
  } as Record<string, number>;
  const dataScore = dataScores[data.dataAccess] || 0;
  
  // 3. Process Maturity (25 points)
  const processScores = {
    'documented': 25,    // All processes documented
    'partially': 18,     // Key processes documented
    'tribal': 8,         // Knowledge in people's heads
    'chaos': 0           // No standardization
  } as Record<string, number>;
  const processScore = processScores[data.processDocumentation] || 0;
  
  // 4. Team Readiness (25 points)
  const automationScores = {
    'advanced': 15,  // Zapier, Power Automate, RPA tools
    'basic': 10,     // Email automation, basis workflows
    'trying': 5,     // Proberen dingen, maar breekt vaak
    'none': 0        // Nee, alles nog handmatig
  } as Record<string, number>;
  const automationScore = automationScores[data.automationExperience] || 0;
  
  const adoptionScores = {
    'very-fast': 10,     // Zeer snel (weken)
    'reasonable': 7,     // Redelijk (maanden)
    'slow': 4,           // Traag (kwartalen)
    'very-slow': 1       // Zeer traag (jaren)
  } as Record<string, number>;
  const adoptionScore = adoptionScores[data.adoptionSpeed] || 0;
  
  const teamScore = automationScore + adoptionScore;
  
  console.log('🔍 Submit Route Team Score Debug:', {
    automationExperience: data.automationExperience,
    automationScore,
    adoptionSpeed: data.adoptionSpeed, 
    adoptionScore,
    totalTeamScore: teamScore
  });
  
  return apiScore + dataScore + processScore + teamScore;
}

function getPriority(data: any): 'high' | 'medium' | 'low' {
  const score = calculateConsistentScore(data);
  if (score >= 70) return 'high';    // High readiness = high priority lead
  if (score >= 40) return 'medium';  // Medium readiness
  return 'low';                      // Low readiness = education needed
}

async function sendFullReportEmail(data: any, report: any, assessmentType: string = 'agent_readiness'): Promise<void> {
  try {
    const config = getReportConfig(assessmentType);
    console.log(`Sending full ${config.title} to ${data.email} with score ${report.score}`);

    // Send the complete branded HTML report via email
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/send-full-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.email,
        name: data.name,
        company: data.company,
        report: report,
        assessmentType,
        reportConfig: config,
        timestamp: new Date().toISOString()
      })
    });

    console.log(`Full report email API response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log(`Full ${config.title} sent to ${data.email}:`, result);
    } else {
      const errorText = await response.text();
      console.error('Failed to send full report email:', errorText);
    }
  } catch (error) {
    console.error('Full report email sending error:', error);
  }
}

async function generateAndEmailReportAsync(assessmentData: any, leadId: string, assessmentType: string = 'agent_readiness'): Promise<void> {
  try {
    console.log(`🔄 Background: Generating full ${assessmentType} Report with Claude...`);

    // Generate full report with Claude (this takes 20-30 seconds)
    // Use type-specific report generation
    const fullReport = await generateReportByType(assessmentData, assessmentType);

    console.log('✅ Background: Claude report generated, sending email...');

    // Send full report email to customer
    await sendFullReportEmail(assessmentData, fullReport, assessmentType);

    // Schedule follow-up email automation
    await scheduleFollowUpSequence(assessmentData, fullReport, leadId);

    // Update assessment in Firestore with report
    await updateAssessmentWithReport(leadId, fullReport, assessmentType);

    // Notify admin for review
    await notifyAdmin({
      type: 'assessment_review',
      assessmentType,
      leadId,
      reportId: leadId,
      company: assessmentData.company,
      email: assessmentData.email,
      score: fullReport.score,
      priority: getPriority(assessmentData)
    });

    console.log(`🎉 Background: Full ${assessmentType} assessment process completed for`, assessmentData.email);

  } catch (error) {
    console.error('❌ Background report generation error:', error);

    // Send fallback simple email if Claude fails
    try {
      const previewScore = calculateScoreByType(assessmentData, assessmentType);
      await sendSimpleScoreEmail(assessmentData, previewScore, assessmentType);
      console.log('📧 Sent fallback score email due to Claude error');
    } catch (fallbackError) {
      console.error('❌ Even fallback email failed:', fallbackError);
    }
  }
}

// Generate report based on assessment type
async function generateReportByType(data: any, type: string): Promise<any> {
  // Import report generators
  const { DynamicReportGenerator } = await import('@/services/ai/reportGeneration');

  // For now, use the same generator but with type-specific prompts
  // In the future, this could use separate generators per type
  const reportConfig = getReportConfig(type);

  return await DynamicReportGenerator.generateFreemiumReport({
    ...data,
    assessmentType: type,
    reportConfig
  });
}

// Get report configuration based on assessment type
function getReportConfig(type: string): any {
  const configs: Record<string, any> = {
    'agent_readiness': {
      title: 'Agent Readiness Assessment',
      levelNames: ['Pre-Digital', 'Foundation-Building', 'Digitalization-Ready', 'Integration-Ready', 'Agent-Ready'],
      color: '#F87315',
      upsell: 'Expert Assessment'
    },
    'data_readiness': {
      title: 'Data Readiness Assessment',
      levelNames: ['Data-Starting', 'Data-Foundation', 'Data-Developing', 'Data-Mature', 'Data-Ready'],
      color: '#3B82F6',
      upsell: 'Data Strategy Sessie'
    },
    'ai_security': {
      title: 'AI Security & Compliance Scan',
      levelNames: ['Non-Compliant', 'Basic Security', 'Developing Compliance', 'Mostly Compliant', 'Fully Compliant'],
      color: '#10B981',
      upsell: 'Compliance Audit'
    },
    'process_automation': {
      title: 'Process Automation Quickscan',
      levelNames: ['Manual Operations', 'Basic Automation', 'Partial Automation', 'Advanced Automation', 'Fully Automated'],
      color: '#8B5CF6',
      upsell: 'Automation Roadmap'
    },
    'cx_ai': {
      title: 'Customer Experience AI Assessment',
      levelNames: ['Traditional CX', 'Basic Digital', 'Digital Engagement', 'Personalized CX', 'AI-Powered CX'],
      color: '#EC4899',
      upsell: 'CX Transformation Workshop'
    },
    'ai_maturity': {
      title: 'AI Maturity Scan',
      levelNames: ['AI Aware', 'AI Exploring', 'AI Experimenting', 'AI Scaling', 'AI Native'],
      color: '#F59E0B',
      upsell: 'AI Strategy Development'
    },
    'integration_readiness': {
      title: 'Integration Readiness Check',
      levelNames: ['Legacy Systems', 'Basic Integration', 'Connected Systems', 'API-First', 'Integration-Ready'],
      color: '#06B6D4',
      upsell: 'Integration Architecture Review'
    },
    'roi_calculator': {
      title: 'AI ROI Calculator',
      levelNames: ['Low ROI Potential', 'Moderate Potential', 'Good Potential', 'High Potential', 'Excellent ROI'],
      color: '#22C55E',
      upsell: 'Business Case Development'
    }
  };

  return configs[type] || configs['agent_readiness'];
}

// Update assessment document with generated report
async function updateAssessmentWithReport(leadId: string, report: any, type: string): Promise<void> {
  try {
    const { collection, query, where, getDocs, updateDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/config');

    const collectionName = getCollectionName(type);
    const q = query(collection(db, collectionName), where('leadId', '==', leadId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        report,
        status: 'ready',
        updatedAt: new Date()
      });
      console.log(`✅ Updated ${type} assessment with report`);
    }
  } catch (error) {
    console.error('Failed to update assessment with report:', error);
  }
}

async function sendSimpleScoreEmail(data: any, score: number, assessmentType: string = 'agent_readiness'): Promise<void> {
  try {
    const config = getReportConfig(assessmentType);
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/send-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.email,
        name: data.name,
        company: data.company,
        score,
        level: getMaturityLevelByType(score, assessmentType),
        assessmentType,
        assessmentTitle: config.title,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Simple score email error:', error);
  }
}

function getMaturityLevelByType(score: number, type: string): string {
  const config = getReportConfig(type);
  const levels = config.levelNames;

  if (score >= 90) return levels[4] + ' (Level 5)';
  if (score >= 70) return levels[3] + ' (Level 4)';
  if (score >= 50) return levels[2] + ' (Level 3)';
  if (score >= 30) return levels[1] + ' (Level 2)';
  return levels[0] + ' (Level 1)';
}

function getMaturityLevel(score: number): string {
  if (score >= 90) return 'Agent-Ready (Level 5)';
  if (score >= 70) return 'Integration-Ready (Level 4)';
  if (score >= 50) return 'Digitalization-Ready (Level 3)';
  if (score >= 30) return 'Foundation-Building (Level 2)';
  return 'Pre-Digital (Level 1)';
}

async function createLead(leadData: any): Promise<string> {
  try {
    const leadId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in Firestore - use appropriate collection based on assessment type
    const { collection, addDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/config');

    // Determine collection based on assessment type
    const assessmentType = leadData.type || 'agent_readiness';
    const collectionName = getCollectionName(assessmentType);

    const assessmentDoc = {
      ...leadData,
      leadId,
      type: assessmentType,
      createdAt: new Date(),
      status: 'assessment_submitted'
    };

    console.log('📝 Storing assessment with enhanced data:', {
      type: assessmentType,
      collection: collectionName,
      userId: assessmentDoc.userId,
      email: assessmentDoc.email,
      authenticatedEmail: assessmentDoc.authenticatedEmail,
      submissionMethod: assessmentDoc.submissionMethod,
      leadId: assessmentDoc.leadId,
      hasUserId: !!assessmentDoc.userId,
      emailMatch: assessmentDoc.email === assessmentDoc.authenticatedEmail
    });

    const docRef = await addDoc(collection(db, collectionName), assessmentDoc);

    console.log(`✅ ${assessmentType} Assessment stored in Firestore:`, {
      firestoreId: docRef.id,
      leadId,
      userId: assessmentDoc.userId,
      email: assessmentDoc.email
    });

    return leadId;
  } catch (error) {
    console.error('❌ Failed to store Assessment:', error);
    return `assessment_${Date.now()}`;
  }
}

// Get Firestore collection name based on assessment type
function getCollectionName(type: string): string {
  const collections: Record<string, string> = {
    'agent_readiness': 'agent_assessments',
    'data_readiness': 'data_readiness_assessments',
    'ai_security': 'ai_security_assessments',
    'process_automation': 'process_automation_assessments',
    'cx_ai': 'cx_ai_assessments',
    'ai_maturity': 'ai_maturity_assessments',
    'integration_readiness': 'integration_readiness_assessments',
    'roi_calculator': 'roi_calculator_assessments',
  };
  return collections[type] || 'agent_assessments';
}

// Calculate score based on assessment type
function calculateScoreByType(data: any, type: string): number {
  switch (type) {
    case 'data_readiness':
      return calculateDataReadinessScore(data);
    case 'ai_security':
      return calculateAISecurityScore(data);
    case 'process_automation':
      return calculateProcessAutomationScore(data);
    case 'cx_ai':
      return calculateCXAIScore(data);
    case 'ai_maturity':
      return calculateAIMaturityScore(data);
    case 'integration_readiness':
      return calculateIntegrationReadinessScore(data);
    case 'roi_calculator':
      return calculateROIScore(data);
    default:
      return calculateConsistentScore(data); // Agent readiness
  }
}

// Data Readiness Score (10 questions x 10 points = 100)
function calculateDataReadinessScore(data: any): number {
  const scores: Record<string, Record<string, number>> = {
    dataQuality: { 'excellent': 10, 'good': 7, 'moderate': 4, 'poor': 1 },
    dataGovernance: { 'mature': 10, 'developing': 7, 'basic': 4, 'none': 1 },
    dataAccessibility: { 'centralized': 10, 'multiple_sources': 7, 'siloed': 4, 'manual': 1 },
    dataDocumentation: { 'comprehensive': 10, 'partial': 7, 'minimal': 4, 'none': 1 },
    dataPrivacy: { 'gdpr_compliant': 10, 'partially_compliant': 7, 'working_on_it': 4, 'not_compliant': 1 },
    dataPipelines: { 'automated': 10, 'semi_automated': 7, 'manual': 4, 'none': 1 },
    dataLiteracy: { 'high': 10, 'medium': 7, 'low': 4, 'very_low': 1 },
    dataVolume: { 'big_data': 10, 'medium': 8, 'small': 5, 'minimal': 3 },
    dataVariety: { 'structured_unstructured': 10, 'mainly_structured': 8, 'mainly_unstructured': 6, 'mixed_chaos': 3 },
    realTimeData: { 'yes': 10, 'partial': 7, 'batch_only': 4, 'no': 2 },
  };

  let total = 0;
  for (const [field, scoreMap] of Object.entries(scores)) {
    total += scoreMap[data[field]] || 0;
  }
  return total;
}

// AI Security Score
function calculateAISecurityScore(data: any): number {
  const scores: Record<string, Record<string, number>> = {
    aiActAwareness: { 'fully_aware': 10, 'partially_aware': 7, 'heard_of_it': 4, 'not_aware': 1 },
    riskClassification: { 'mapped': 10, 'partially_mapped': 7, 'planned': 4, 'not_started': 1 },
    dataProtection: { 'gdpr_compliant': 10, 'partially_compliant': 7, 'working_on_it': 4, 'not_compliant': 1 },
    modelTransparency: { 'explainable': 10, 'documented': 7, 'black_box': 4, 'unknown': 1 },
    biasAudit: { 'regular_audits': 10, 'occasional': 7, 'planned': 4, 'never': 1 },
    securityFramework: { 'iso27001': 10, 'soc2': 8, 'custom': 5, 'none': 1 },
    incidentResponse: { 'mature': 10, 'basic': 6, 'planned': 3, 'none': 1 },
    vendorAssessment: { 'thorough': 10, 'basic': 6, 'trust_based': 3, 'none': 1 },
    humanOversight: { 'always': 10, 'critical_decisions': 7, 'minimal': 4, 'none': 1 },
    trainingData: { 'audited': 10, 'partially_audited': 6, 'not_audited': 3, 'unknown': 1 },
  };

  let total = 0;
  for (const [field, scoreMap] of Object.entries(scores)) {
    total += scoreMap[data[field]] || 0;
  }
  return total;
}

// Process Automation Score
function calculateProcessAutomationScore(data: any): number {
  const scores: Record<string, Record<string, number>> = {
    processDocumentation: { 'fully_documented': 12, 'mostly_documented': 9, 'partially': 5, 'tribal_knowledge': 2 },
    repetitiveTasks: { 'many': 12, 'some': 9, 'few': 5, 'rare': 2 },
    errorRate: { 'high': 12, 'moderate': 9, 'low': 5, 'minimal': 2 },
    processVolume: { 'thousands_daily': 12, 'hundreds_daily': 9, 'tens_daily': 5, 'few_daily': 2 },
    systemIntegration: { 'fully_integrated': 12, 'partially_integrated': 9, 'siloed': 5, 'manual': 2 },
    decisionComplexity: { 'rule_based': 12, 'some_judgment': 9, 'highly_complex': 5, 'unpredictable': 2 },
    exceptionHandling: { 'standardized': 10, 'ad_hoc': 6, 'chaotic': 3, 'undefined': 1 },
    staffAvailability: { 'overloaded': 10, 'busy': 7, 'balanced': 4, 'underutilized': 2 },
    rpaExperience: { 'advanced': 8, 'basic': 6, 'piloting': 3, 'none': 1 },
  };

  let total = 0;
  for (const [field, scoreMap] of Object.entries(scores)) {
    total += scoreMap[data[field]] || 0;
  }
  return total;
}

// CX AI Score
function calculateCXAIScore(data: any): number {
  const scores: Record<string, Record<string, number>> = {
    responseTime: { 'instant': 10, 'minutes': 7, 'hours': 4, 'days': 1 },
    personalization: { 'advanced': 10, 'basic': 7, 'minimal': 4, 'none': 1 },
    customerDataUnification: { 'unified_360': 10, 'partially_unified': 7, 'siloed': 4, 'no_data': 1 },
    chatbotExperience: { 'ai_powered': 10, 'rule_based': 6, 'planned': 3, 'none': 1 },
    sentimentAnalysis: { 'real_time': 10, 'periodic': 7, 'manual': 4, 'none': 1 },
    selfService: { 'comprehensive': 10, 'basic': 7, 'minimal': 4, 'none': 1 },
    predictiveService: { 'proactive': 10, 'reactive': 6, 'planned': 3, 'none': 1 },
    customerJourney: { 'mapped': 10, 'partially_mapped': 7, 'planned': 4, 'unknown': 1 },
    npsScore: { 'promoter': 10, 'passive': 6, 'detractor': 3, 'not_measured': 1 },
  };

  let total = 0;
  for (const [field, scoreMap] of Object.entries(scores)) {
    total += scoreMap[data[field]] || 0;
  }
  // Add channel diversity bonus (up to 10 points)
  const channelCount = Array.isArray(data.customerChannels) ? data.customerChannels.length : 0;
  total += Math.min(channelCount * 2, 10);
  return total;
}

// AI Maturity Score
function calculateAIMaturityScore(data: any): number {
  const scores: Record<string, Record<string, number>> = {
    aiStrategy: { 'defined': 10, 'emerging': 7, 'ad_hoc': 4, 'none': 1 },
    aiGovernance: { 'mature': 10, 'developing': 7, 'basic': 4, 'none': 1 },
    aiTalent: { 'in_house_team': 10, 'some_expertise': 7, 'external_only': 4, 'none': 1 },
    aiInfrastructure: { 'cloud_native': 10, 'hybrid': 7, 'on_premise': 4, 'none': 1 },
    aiUseCases: { 'production': 10, 'pilots': 7, 'experiments': 4, 'none': 1 },
    mlOps: { 'automated': 10, 'semi_automated': 7, 'manual': 4, 'none': 1 },
    dataScience: { 'advanced': 10, 'intermediate': 7, 'basic': 4, 'none': 1 },
    aiEthics: { 'framework': 10, 'guidelines': 7, 'ad_hoc': 4, 'none': 1 },
    aiBudget: { 'dedicated': 10, 'project_based': 7, 'limited': 4, 'none': 1 },
    aiCulture: { 'embracing': 10, 'curious': 7, 'skeptical': 4, 'resistant': 1 },
  };

  let total = 0;
  for (const [field, scoreMap] of Object.entries(scores)) {
    total += scoreMap[data[field]] || 0;
  }
  return total;
}

// Integration Readiness Score
function calculateIntegrationReadinessScore(data: any): number {
  const scores: Record<string, Record<string, number>> = {
    apiAvailability: { 'rest_graphql': 10, 'rest_only': 7, 'legacy': 4, 'none': 1 },
    apiDocumentation: { 'comprehensive': 10, 'basic': 7, 'minimal': 4, 'none': 1 },
    authMechanisms: { 'oauth2': 10, 'api_keys': 7, 'basic_auth': 4, 'custom': 3 },
    cloudReadiness: { 'cloud_native': 10, 'hybrid': 7, 'on_premise': 4, 'planning': 2 },
    microservices: { 'fully': 10, 'partially': 7, 'monolith': 4, 'legacy': 2 },
    eventDriven: { 'kafka_rabbitmq': 10, 'basic_events': 7, 'polling': 4, 'none': 1 },
    ciCd: { 'automated': 10, 'semi_automated': 7, 'manual': 4, 'none': 1 },
    monitoring: { 'comprehensive': 10, 'basic': 7, 'logs_only': 4, 'none': 1 },
    security: { 'zero_trust': 10, 'perimeter': 7, 'basic': 4, 'minimal': 1 },
    scalability: { 'auto_scaling': 10, 'manual_scaling': 7, 'limited': 4, 'not_possible': 1 },
  };

  let total = 0;
  for (const [field, scoreMap] of Object.entries(scores)) {
    total += scoreMap[data[field]] || 0;
  }
  return total;
}

// ROI Calculator Score (simplified - ROI is calculated differently)
function calculateROIScore(data: any): number {
  // ROI score is based on potential savings and feasibility
  let score = 50; // Base score

  // Higher automation potential = higher score
  if (data.targetAutomation >= 80) score += 20;
  else if (data.targetAutomation >= 60) score += 15;
  else if (data.targetAutomation >= 40) score += 10;
  else if (data.targetAutomation >= 20) score += 5;

  // Faster timeline = higher readiness
  const timelineScores: Record<string, number> = {
    '3_months': 20,
    '6_months': 15,
    '12_months': 10,
    '18_months': 5,
  };
  score += timelineScores[data.implementationTimeline] || 0;

  // Higher process hours = more potential
  if (data.processHoursWeekly > 100) score += 10;
  else if (data.processHoursWeekly > 50) score += 7;
  else if (data.processHoursWeekly > 20) score += 4;

  return Math.min(100, score);
}

async function scheduleFollowUpSequence(assessmentData: any, report: any, leadId: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/schedule-followups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: assessmentData.email,
        name: assessmentData.name,
        company: assessmentData.company,
        score: report.score,
        level: getMaturityLevel(report.score),
        assessmentId: leadId,
        coreBusiness: assessmentData.coreBusiness,
        mainBlocker: assessmentData.mainBlocker,
        costOptimization: assessmentData.costOptimization
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('📧 Follow-up sequence scheduled:', result);
    } else {
      console.error('Failed to schedule follow-ups:', response.status);
    }
  } catch (error) {
    console.error('Follow-up scheduling error:', error);
  }
}

async function notifyAdmin(notification: any): Promise<void> {
  // Send admin notification
  console.log('Admin notification:', notification);
}