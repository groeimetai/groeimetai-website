import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const proposalData = await req.json();
    
    // Create implementation proposal in pipeline
    const proposalId = await createImplementationProposal({
      ...proposalData,
      status: 'proposal_submitted',
      source: 'website_implementation_proposal',
      createdAt: new Date()
    });

    // Calculate complexity score
    const complexityScore = calculateComplexityScore(proposalData);

    // Notify admin for review
    await notifyAdmin({
      type: 'implementation_proposal_review',
      proposalId,
      company: proposalData.company,
      email: proposalData.email,
      complexity: complexityScore,
      priority: getPriorityFromComplexity(complexityScore)
    });

    // Send confirmation email to customer
    await sendProposalConfirmationEmail(proposalData, complexityScore);

    return NextResponse.json({
      success: true,
      proposalId,
      complexityScore,
      message: 'Implementation proposal submitted successfully',
      nextSteps: [
        'Check email for confirmation',
        'Proposal review within 72 hours',
        'Custom implementation plan created'
      ]
    });

  } catch (error) {
    console.error('Implementation proposal submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process implementation proposal' },
      { status: 500 }
    );
  }
}

function calculateComplexityScore(data: any): number {
  let complexity = 0;
  
  // System count impact
  const systemCount = parseInt(data.systemCount) || 0;
  complexity += systemCount * 10;
  
  // Systems complexity
  complexity += data.systems.length * 5;
  
  // Budget indicator
  const budgetComplexity = {
    '10-25k': 20,
    '25-50k': 40,
    '50-100k': 60,
    '100k+': 80
  }[data.budget] || 10;
  complexity += budgetComplexity;
  
  return Math.min(complexity, 100);
}

function getPriorityFromComplexity(complexity: number): 'high' | 'medium' | 'low' {
  if (complexity >= 70) return 'high';
  if (complexity >= 40) return 'medium';
  return 'low';
}

async function sendProposalConfirmationEmail(data: any, complexity: number): Promise<void> {
  console.log(`Sending proposal confirmation email to ${data.email} with complexity ${complexity}`);
}

async function createImplementationProposal(proposalData: any): Promise<string> {
  return `proposal_${Date.now()}`;
}

async function notifyAdmin(notification: any): Promise<void> {
  console.log('Admin notification:', notification);
}