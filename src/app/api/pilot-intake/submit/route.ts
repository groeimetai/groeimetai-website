import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const intakeData = await req.json();
    
    // Create pilot intake in pipeline
    const intakeId = await createPilotIntake({
      ...intakeData,
      status: 'pilot_submitted',
      source: 'website_pilot_intake',
      createdAt: new Date()
    });

    // Notify admin for review
    await notifyAdmin({
      type: 'pilot_intake_review',
      intakeId,
      company: intakeData.company,
      email: intakeData.email,
      priority: getPriorityFromBudget(intakeData.budget)
    });

    // Send confirmation email to customer
    await sendPilotConfirmationEmail(intakeData);

    return NextResponse.json({
      success: true,
      intakeId,
      message: 'Pilot intake submitted successfully',
      nextSteps: [
        'Check email for confirmation',
        'Our team will contact you within 48 hours',
        'Pilot planning session scheduled'
      ]
    });

  } catch (error) {
    console.error('Pilot intake submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process pilot intake' },
      { status: 500 }
    );
  }
}

function getPriorityFromBudget(budget: string): 'high' | 'medium' | 'low' {
  if (budget === '50k+' || budget === '25-50k') return 'high';
  if (budget === '10-25k') return 'medium';
  return 'low';
}

async function sendPilotConfirmationEmail(data: any): Promise<void> {
  console.log(`Sending pilot confirmation email to ${data.email}`);
}

async function createPilotIntake(intakeData: any): Promise<string> {
  return `pilot_${Date.now()}`;
}

async function notifyAdmin(notification: any): Promise<void> {
  console.log('Admin notification:', notification);
}