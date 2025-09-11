import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, assessmentData, chatHistory } = await req.json();

    // Validate input
    if (!message || !assessmentData) {
      return NextResponse.json(
        { error: 'Message and assessment data required' },
        { status: 400 }
      );
    }

    // Build context for Claude
    const assessmentContext = `
Assessment Score: ${assessmentData.score}/100
Level: ${assessmentData.level}
Type: Agent Readiness Assessment
`;

    const systemPrompt = `Je bent een AI consultant die gebruikers helpt hun Agent Readiness Assessment resultaten te begrijpen. 

Context van de assessment:
${assessmentContext}

Richtlijnen:
- Geef praktische, concrete adviezen
- Wees specifiek over volgende stappen
- Verwijs naar MCP protocol en agent infrastructure waar relevant
- Houd antwoorden beknopt (max 3-4 zinnen)
- Spreek Nederlands
- Focus op hun specifieke score en level
- Stimuleer upgrade naar Expert Assessment voor diepere analyse

Vorige berichten:
${chatHistory?.map(m => `${m.role}: ${m.content}`).join('\n') || 'Geen eerdere berichten'}

Vraag van gebruiker: ${message}`;

    // Call Claude API (simplified version - you might want to use your actual Claude API setup)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: systemPrompt
          }
        ]
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
    
    // Fallback response
    const fallbackResponse = `Bedankt voor je vraag! Op basis van je score van ${(req as any).assessmentData?.score || 'N/A'}/100 raad ik aan om te focussen op je grootste blockers. 

Voor een gedetailleerde analyse en concrete roadmap kun je overwegen om te upgraden naar de Expert Assessment.`;

    return NextResponse.json({
      success: true,
      response: fallbackResponse
    });
  }
}