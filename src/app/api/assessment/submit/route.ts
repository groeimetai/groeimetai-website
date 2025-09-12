import { NextRequest, NextResponse } from 'next/server';
import { DynamicReportGenerator } from '@/services/ai/reportGeneration';

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

    // Calculate preview score using same logic as report generator
    const previewScore = calculateConsistentScore(assessmentData);
    
    // Start background report generation (don't await - async!)
    generateAndEmailReportAsync(assessmentData, leadId);
    
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
  const apiScore = {
    'most': 25,      // Most systems have APIs
    'some': 15,      // Partial API coverage
    'unknown': 8,    // Unknown = likely minimal
    'none': 0        // No APIs yet
  }[data.hasApis] || 0;
  
  // 2. Data Access (25 points)
  const dataScore = {
    'instant': 25,      // Agent can access all data immediately
    'minutes': 18,      // Some friction but accessible  
    'difficult': 8,     // Major data silos
    'impossible': 0     // Not digitized yet
  }[data.dataAccess] || 0;
  
  // 3. Process Maturity (25 points)
  const processScore = {
    'documented': 25,    // All processes documented
    'partially': 18,     // Key processes documented
    'tribal': 8,         // Knowledge in people's heads
    'chaos': 0           // No standardization
  }[data.processDocumentation] || 0;
  
  // 4. Team Readiness (25 points)
  const automationScore = {
    'advanced': 15,  // Zapier, Power Automate, RPA tools
    'basic': 10,     // Email automation, basis workflows
    'trying': 5,     // Proberen dingen, maar breekt vaak
    'none': 0        // Nee, alles nog handmatig
  }[data.automationExperience] || 0;
  
  const adoptionScore = {
    'very-fast': 10,     // Zeer snel (weken)
    'reasonable': 7,     // Redelijk (maanden)
    'slow': 4,           // Traag (kwartalen)
    'very-slow': 1       // Zeer traag (jaren)
  }[data.adoptionSpeed] || 0;
  
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

async function sendFullReportEmail(data: any, report: any): Promise<void> {
  try {
    console.log(`Sending full Agent Readiness Report to ${data.email} with score ${report.score}`);
    
    // Send the complete branded HTML report via email
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/send-full-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.email,
        name: data.name,
        company: data.company,
        report: report,
        timestamp: new Date().toISOString()
      })
    });
    
    console.log(`Full report email API response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`Full Agent Readiness Report sent to ${data.email}:`, result);
    } else {
      const errorText = await response.text();
      console.error('Failed to send full report email:', errorText);
    }
  } catch (error) {
    console.error('Full report email sending error:', error);
  }
}

async function generateAndEmailReportAsync(assessmentData: any, leadId: string): Promise<void> {
  try {
    console.log('🔄 Background: Generating full Agent Readiness Report with Claude...');
    
    // Generate full report with Claude (this takes 20-30 seconds)
    const fullReport = await DynamicReportGenerator.generateFreemiumReport(assessmentData);
    
    console.log('✅ Background: Claude report generated, sending email...');
    
    // Send full report email to customer
    await sendFullReportEmail(assessmentData, fullReport);
    
    // Schedule follow-up email automation
    await scheduleFollowUpSequence(assessmentData, fullReport, leadId);
    
    // Notify admin for review
    await notifyAdmin({
      type: 'assessment_review',
      leadId,
      reportId: leadId,
      company: assessmentData.company,
      email: assessmentData.email,
      score: fullReport.score,
      priority: getPriority(assessmentData)
    });
    
    console.log('🎉 Background: Full assessment process completed for', assessmentData.email);
    
  } catch (error) {
    console.error('❌ Background report generation error:', error);
    
    // Send fallback simple email if Claude fails
    try {
      const previewScore = calculatePreviewScore(assessmentData);
      await sendSimpleScoreEmail(assessmentData, previewScore);
      console.log('📧 Sent fallback score email due to Claude error');
    } catch (fallbackError) {
      console.error('❌ Even fallback email failed:', fallbackError);
    }
  }
}

async function sendSimpleScoreEmail(data: any, score: number): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/send-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.email,
        name: data.name,
        company: data.company,
        score,
        level: getMaturityLevel(score),
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
    
    // Store in Firestore agent_assessments collection
    const { collection, addDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/config');
    
    const assessmentDoc = {
      ...leadData,
      leadId,
      type: 'agent_readiness',
      createdAt: new Date(),
      status: 'assessment_submitted'
    };
    
    console.log('📝 Storing assessment with enhanced data:', {
      userId: assessmentDoc.userId,
      email: assessmentDoc.email,
      authenticatedEmail: assessmentDoc.authenticatedEmail,
      submissionMethod: assessmentDoc.submissionMethod,
      leadId: assessmentDoc.leadId,
      hasUserId: !!assessmentDoc.userId,
      emailMatch: assessmentDoc.email === assessmentDoc.authenticatedEmail
    });
    
    const docRef = await addDoc(collection(db, 'agent_assessments'), assessmentDoc);
    
    console.log('✅ Agent Assessment stored in Firestore:', {
      firestoreId: docRef.id,
      leadId,
      userId: assessmentDoc.userId,
      email: assessmentDoc.email
    });
    
    return leadId;
  } catch (error) {
    console.error('❌ Failed to store Agent Assessment:', error);
    return `assessment_${Date.now()}`;
  }
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