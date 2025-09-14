import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let assessmentData = null;

  try {
    const { message, assessmentData: data, chatHistory, fullReport } = await req.json();
    assessmentData = data;

    // Validate input
    if (!message || !assessmentData) {
      return NextResponse.json(
        { error: 'Message and assessment data required' },
        { status: 400 }
      );
    }

    // Build comprehensive context for Claude including full report
    const assessmentContext = `
=== BASIC ASSESSMENT INFO ===
Score: ${assessmentData.score}/100
Level: ${assessmentData.level}
Assessment ID: ${assessmentData.id || 'N/A'}
Completion Date: ${assessmentData.createdAt || 'N/A'}

=== USER RESPONSES ===
${assessmentData.responses ? `
Core Business: ${assessmentData.responses.coreBusiness || 'N/A'}
Priority Systems: ${assessmentData.responses.systems?.join(', ') || 'N/A'}
Highest Impact System: ${assessmentData.responses.highestImpactSystem || 'N/A'}
APIs Available: ${assessmentData.responses.hasApis || 'N/A'}
Data Access Speed: ${assessmentData.responses.dataAccess || 'N/A'}
Data Location: ${assessmentData.responses.dataLocation || 'N/A'}
Process Documentation: ${assessmentData.responses.processDocumentation || 'N/A'}
Automation Experience: ${assessmentData.responses.automationExperience || 'N/A'}
Agent Platform Preference: ${assessmentData.responses.agentPlatformPreference || 'N/A'}
Preferred Platforms: ${assessmentData.responses.agentPlatforms?.join(', ') || 'N/A'}
Main Blocker: ${assessmentData.responses.mainBlocker || 'N/A'}
Adoption Speed: ${assessmentData.responses.adoptionSpeed || 'N/A'}
Cost Optimization Focus: ${assessmentData.responses.costOptimization || 'N/A'}
Budget Reality: ${assessmentData.responses.budgetReality || 'N/A'}
IT Maturity Level: ${assessmentData.responses.itMaturity || 'N/A'}
` : 'Detailed assessment responses not available'}

=== FULL ASSESSMENT REPORT ===
${fullReport ? `
GENERATED REPORT:
${typeof fullReport === 'string' ? fullReport : JSON.stringify(fullReport, null, 2)}
` : 'Full report not provided - use assessment data above'}
`;

    // Call Claude API with latest Sonnet
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', // Sonnet 4 - newest Claude model
        max_tokens: 600,
        messages: [
          {
            role: 'system',
            content: `Je bent een expert AI consultant van GroeimetAI gespecialiseerd in agent infrastructure, MCP protocol, en Nederlandse bedrijfstransformatie. Geef altijd praktische, concrete adviezen in het Nederlands.`
          },
          ...(chatHistory && chatHistory.length > 0 ? chatHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })) : []),
          {
            role: 'user',
            content: `Assessment Context:\n${assessmentContext}\n\nVraag: ${message}`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const claudeData = await response.json();
    const claudeResponse = claudeData.content?.[0]?.text || 'Sorry, ik kon je vraag niet beantwoorden. Probeer het opnieuw.';

    return NextResponse.json({
      success: true,
      response: claudeResponse
    });

  } catch (error) {
    console.error('Assessment chat error:', error);
    
    // Intelligent fallback response based on assessment data
    const score = assessmentData.score || 0;
    const level = assessmentData.level || 'Unknown';
    
    let fallbackResponse = `Bedankt voor je vraag! Op basis van je ${level} score van ${score}/100 kan ik je het volgende adviseren:\n\n`;
    
    if (score >= 80) {
      fallbackResponse += `🎉 Uitstekende score! Je bent bijna agent-ready. Focus op de laatste technische details en begin met een pilot project voor je hoogst prioritaire systeem.`;
    } else if (score >= 60) {
      fallbackResponse += `💪 Goede basis! Je hebt de fundamenten op orde. Werk aan je grootste blockers en begin met API documentatie voor je prioritaire systemen.`;
    } else if (score >= 40) {
      fallbackResponse += `🔧 Stevige fundamenten maar meer werk nodig. Start met je API strategie en zorg dat je systemen goed gedocumenteerd zijn.`;
    } else {
      fallbackResponse += `🏗️ Je staat aan het begin van je agent journey. Begin met het in kaart brengen van je systemen en processen.`;
    }
    
    fallbackResponse += `\n\nVoor een gedetailleerde roadmap met concrete stappen, overweeg de Expert Assessment.`;

    return NextResponse.json({
      success: true,
      response: fallbackResponse
    });
  }
}