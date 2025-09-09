import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AssessmentData {
  systems: string[];
  hasApis: string;
  agentGoals: string[];
  barriers: string;
  timeline: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  employees: string;
  wantGuide: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const assessmentData: AssessmentData = await req.json();
    
    // Generate report using Claude Sonnet 4.0 (via OpenAI-compatible API)
    const reportPrompt = `
Genereer een professioneel MCP Readiness Report voor:
Bedrijf: ${assessmentData.company}
Systemen: ${assessmentData.systems.join(', ')}
APIs: ${assessmentData.hasApis}
Use case: ${assessmentData.agentGoals.join(', ')}
Barriers: ${assessmentData.barriers}
Timeline: ${assessmentData.timeline}

Structuur:
1. Executive Summary met score (0-100)
2. Gap analyse per systeem
3. Opportunity matrix (Impact vs Effort)
4. 3-fase roadmap met tijdlijnen
5. ROI berekening gebaseerd op bedrijfsgrootte
6. Concrete next steps

Tone: Professioneel maar toegankelijk
Focus: Praktisch en actiegericht
Lengte: 7-10 pagina's
Taal: Nederlands

Maak het specifiek voor hun situatie en geef concrete aanbevelingen.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4 as Claude Sonnet 4.0 proxy
      messages: [
        {
          role: "system",
          content: "Je bent een expert in Agent Infrastructure en MCP protocol implementaties. Genereer professionele rapporten die concreet en actionable zijn."
        },
        {
          role: "user", 
          content: reportPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const reportContent = completion.choices[0].message.content;

    // Calculate basic score based on assessment
    const score = calculateReadinessScore(assessmentData);

    // Store in database (implement based on your DB choice)
    const reportId = await storeReport({
      ...assessmentData,
      reportContent,
      score,
      status: 'draft',
      createdAt: new Date()
    });

    // Send email to admin
    await sendAdminNotification({
      company: assessmentData.company,
      email: assessmentData.email,
      score,
      reportId,
      priority: getPriority(assessmentData.employees, assessmentData.timeline)
    });

    return NextResponse.json({ 
      success: true, 
      reportId,
      message: 'Assessment submitted successfully. Report will be delivered within 24 hours.'
    });

  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    );
  }
}

function calculateReadinessScore(data: AssessmentData): number {
  let score = 0;
  
  // API readiness (25 points)
  switch (data.hasApis) {
    case 'most': score += 25; break;
    case 'some': score += 15; break;
    case 'unknown': score += 5; break;
    case 'none': score += 0; break;
  }
  
  // System count (25 points)
  score += Math.min(data.systems.length * 5, 25);
  
  // Goal clarity (25 points)
  score += Math.min(data.agentGoals.length * 8, 25);
  
  // Timeline urgency (25 points)
  switch (data.timeline) {
    case 'asap': score += 25; break;
    case '3months': score += 20; break;
    case '6months': score += 15; break;
    case 'thisyear': score += 10; break;
    case 'exploring': score += 5; break;
  }
  
  return Math.min(score, 100);
}

function getPriority(employees: string, timeline: string): 'high' | 'medium' | 'low' {
  if (employees === '250+' || timeline === 'asap') return 'high';
  if (employees === '51-250' || timeline === '3months') return 'medium';
  return 'low';
}

async function storeReport(reportData: any): Promise<string> {
  // Implementation depends on your database choice
  // Firebase, PostgreSQL, etc.
  const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store logic here
  console.log('Storing report:', reportId, reportData);
  
  return reportId;
}

async function sendAdminNotification(data: any): Promise<void> {
  // Email implementation - could use Nodemailer, SendGrid, etc.
  console.log('Sending admin notification:', data);
  
  // Example with fetch to email service:
  // await fetch('/api/email/admin-notification', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // });
}