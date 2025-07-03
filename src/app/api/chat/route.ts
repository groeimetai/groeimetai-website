import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit, validateChatContent, getClientIp } from '@/lib/rate-limiter';
import { addSecurityHeaders } from '@/lib/security-headers';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  return addSecurityHeaders(response);
}

export async function POST(request: NextRequest) {
  let message = '';

  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check rate limit (30 requests per minute per IP)
    const rateLimitCheck = checkRateLimit(clientIp, {
      maxRequests: 30,
      windowMs: 60000, // 1 minute
    });

    if (!rateLimitCheck.allowed) {
      const rateLimitResponse = NextResponse.json(
        {
          error: 'Te veel verzoeken. Probeer het over een moment opnieuw.',
          retryAfter: rateLimitCheck.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitCheck.retryAfter || 60),
          },
        }
      );
      return addSecurityHeaders(rateLimitResponse);
    }

    const body = await request.json();
    message = body.message;
    const { history } = body;

    // Validate message content
    const validation = validateChatContent(message);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Additional security: limit conversation history
    const limitedHistory = history?.slice(-10); // Keep only last 10 messages

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Initialize the model - using gemini-2.5-flash which is stable and widely available
    // Other options: 'gemini-1.5-pro', 'gemini-pro' (if available)
    // Preview models require special access
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create context for the chatbot
    const context = `Je bent de behulpzame assistent van GroeimetAI. Je helpt gebruikers onze AI consultancy diensten te begrijpen, waaronder:
- GenAI & LLM implementatie
- ServiceNow AI integratie 
- Multi-agent orchestration systemen
- RAG architectuur design
- AI security & compliance

Wees vriendelijk, professioneel en gefocust op hoe we hun bedrijf kunnen transformeren met AI. Houd antwoorden beknopt en actiegerecht. Antwoord ALTIJD in het Nederlands.

Vorig gesprek:
${limitedHistory?.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') || 'Geen'}

Gebruiker: ${message}
Assistent:`;

    // Generate response
    const result = await model.generateContent(context);
    const response = result.response;
    const text = response.text();

    // Limit response length for security
    const truncatedText = text.length > 2000 ? text.substring(0, 2000) + '...' : text;

    const apiResponse = NextResponse.json({ response: truncatedText });
    return addSecurityHeaders(apiResponse);
  } catch (error) {
    console.error('Chat API error:', error);

    // Fallback responses based on common questions
    const lowerMessage = message.toLowerCase();
    let fallbackResponse = 'Mijn excuses voor het technische probleem. ';

    if (
      lowerMessage.includes('diensten') ||
      lowerMessage.includes('services') ||
      lowerMessage.includes('wat doen jullie')
    ) {
      fallbackResponse +=
        'GroeimetAI biedt uitgebreide AI consultancy diensten waaronder GenAI implementatie, ServiceNow AI integratie, multi-agent orchestration en RAG architectuur design. Bezoek onze diensten pagina voor meer details.';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('bereik')) {
      fallbackResponse +=
        'U kunt ons bereiken via info@groeimetai.io of via ons contactformulier op de website. We horen graag van u!';
    } else if (
      lowerMessage.includes('prijs') ||
      lowerMessage.includes('kosten') ||
      lowerMessage.includes('price')
    ) {
      fallbackResponse +=
        'Onze prijzen worden afgestemd op de specifieke behoeften van elk project. Neem contact met ons op voor een gepersonaliseerde offerte gebaseerd op uw eisen.';
    } else if (lowerMessage.includes('multi-agent') || lowerMessage.includes('orchestration')) {
      fallbackResponse +=
        'Multi-agent orchestration stelt meerdere gespecialiseerde AI-agenten in staat om samen te werken aan complexe taken. Het is een van onze belangrijkste innovaties die 10x meer output levert met 95% nauwkeurigheid.';
    } else {
      fallbackResponse +=
        'Voel u vrij om onze website te bekijken voor meer informatie over onze AI consultancy diensten, of neem direct contact op via info@groeimetai.io.';
    }

    const fallbackApiResponse = NextResponse.json({ response: fallbackResponse });
    return addSecurityHeaders(fallbackApiResponse);
  }
}
