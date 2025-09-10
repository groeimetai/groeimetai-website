import { NextRequest, NextResponse } from 'next/server';
import { GroeimetAIAgent } from '@/lib/agents/agent-framework';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { addSecurityHeaders } from '@/lib/security-headers';
import { v4 as uuidv4 } from 'uuid';

// Session management
const sessions = new Map<string, { 
  agent: GroeimetAIAgent;
  lastActivity: number;
  userId: string;
}>();

// Clean up inactive sessions after 30 minutes
setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > timeout) {
      sessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Session-ID');
  response.headers.set('Access-Control-Max-Age', '86400');
  return addSecurityHeaders(response);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitCheck = checkRateLimit(clientIp, {
      maxRequests: 50, // Higher limit for agent interactions
      windowMs: 60000,
    });

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Te veel verzoeken. Probeer het later opnieuw.',
          retryAfter: rateLimitCheck.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitCheck.retryAfter || 60),
          },
        }
      );
    }

    const body = await request.json();
    const { message, sessionId: clientSessionId, locale = 'nl', mode = 'agent' } = body;

    // Validate input
    if (!message || typeof message !== 'string' || message.length > 1000) {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Session management
    const sessionId = clientSessionId || uuidv4();
    const userId = `user_${clientIp.replace(/\./g, '_')}`;
    
    let session = sessions.get(sessionId);
    
    if (!session) {
      // Create new agent for this session
      const agent = new GroeimetAIAgent({
        temperature: 0.3,
        maxIterations: 5,
        verbose: false,
        locale: locale as 'en' | 'nl',
        userId,
        sessionId,
      });
      
      session = {
        agent,
        lastActivity: Date.now(),
        userId,
      };
      
      sessions.set(sessionId, session);
    } else {
      session.lastActivity = Date.now();
    }

    // Process message based on mode
    let response;
    let metadata: any = {
      sessionId,
      mode,
      timestamp: new Date().toISOString(),
    };

    if (mode === 'agent') {
      // Use full agent capabilities
      const agentResponse = await session.agent.chat(message);
      
      response = agentResponse.response;
      metadata.toolsUsed = agentResponse.toolsUsed;
      metadata.agentMode = true;
      
      // Add tool usage summary if tools were used
      if (agentResponse.toolsUsed.length > 0) {
        const toolSummary = locale === 'nl'
          ? `\n\n📊 Gebruikte tools: ${agentResponse.toolsUsed.join(', ')}`
          : `\n\n📊 Tools used: ${agentResponse.toolsUsed.join(', ')}`;
        
        // Only add if not already in response
        if (!response.includes('📊')) {
          response += toolSummary;
        }
      }
    } else {
      // Fallback to simple chat (backward compatibility)
      response = await getSimpleResponse(message, locale);
      metadata.agentMode = false;
    }

    // Prepare response
    const apiResponse = NextResponse.json({
      response,
      sessionId,
      metadata,
    });

    // Add session ID to headers for client
    apiResponse.headers.set('X-Session-ID', sessionId);
    
    return addSecurityHeaders(apiResponse);
  } catch (error) {
    console.error('Enhanced chat API error:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      {
        error: 'Er is een fout opgetreden. Probeer het later opnieuw.',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// Simple response fallback (for backward compatibility)
async function getSimpleResponse(message: string, locale: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  if (locale === 'nl') {
    if (lowerMessage.includes('diensten') || lowerMessage.includes('services')) {
      return 'GroeimetAI biedt uitgebreide AI consultancy diensten waaronder GenAI implementatie, ServiceNow AI integratie, multi-agent orchestration en RAG architectuur design. Wilt u meer weten over een specifieke dienst?';
    }
    
    if (lowerMessage.includes('contact')) {
      return 'U kunt ons bereiken via info@groeimetai.io of bel ons op +31 20 123 4567. We zijn ook actief op LinkedIn. Zal ik een meeting voor u plannen?';
    }
    
    if (lowerMessage.includes('prijs') || lowerMessage.includes('kosten')) {
      return 'Onze projecten beginnen vanaf €20,000 voor een proof-of-concept. De exacte prijs hangt af van uw specifieke behoeften. Zal ik een offerte voor u opstellen?';
    }
    
    return 'Ik help u graag met informatie over onze AI diensten. Kunt u meer vertellen over wat u zoekt?';
  } else {
    if (lowerMessage.includes('services')) {
      return 'GroeimetAI offers comprehensive AI consultancy services including GenAI implementation, ServiceNow AI integration, multi-agent orchestration, and RAG architecture design. Would you like to know more about a specific service?';
    }
    
    if (lowerMessage.includes('contact')) {
      return 'You can reach us at info@groeimetai.io or call +31 20 123 4567. We\'re also active on LinkedIn. Shall I schedule a meeting for you?';
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'Our projects start from €20,000 for a proof-of-concept. The exact price depends on your specific needs. Shall I prepare a quote for you?';
    }
    
    return 'I\'m here to help you with information about our AI services. Could you tell me more about what you\'re looking for?';
  }
}

// Health check endpoint for the enhanced API
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    version: '2.0.0',
    features: [
      'agent-based-responses',
      'function-calling',
      'session-management',
      'multi-language',
      'tool-integration',
    ],
    activeSessions: sessions.size,
    timestamp: new Date().toISOString(),
  });
}