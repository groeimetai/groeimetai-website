import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, validateChatContent, getClientIp } from '@/lib/rate-limiter';
import { addSecurityHeaders } from '@/lib/security-headers';
import { runAgent, createAgentContext, getFallbackResponse } from '@/lib/agent';

// Stricter rate limits for Claude API (more expensive)
const RATE_LIMIT_CONFIG = {
  // Per-IP limits
  maxRequestsPerMinute: 15,      // 15 requests per minute per IP
  maxRequestsPerHour: 100,       // 100 requests per hour per IP
  maxRequestsPerDay: 500,        // 500 requests per day per IP

  // Global limits (all users combined)
  globalMaxPerMinute: 60,        // 60 total requests per minute

  // Abuse detection
  burstLimit: 5,                 // Max 5 requests in 10 seconds
  burstWindowMs: 10000,
};

// Track hourly and daily limits
const hourlyLimits = new Map<string, { count: number; resetTime: number }>();
const dailyLimits = new Map<string, { count: number; resetTime: number }>();
const burstLimits = new Map<string, { count: number; resetTime: number }>();
const globalMinuteCount = { count: 0, resetTime: Date.now() + 60000 };

/**
 * Check extended rate limits
 */
function checkExtendedRateLimits(clientIp: string): { allowed: boolean; reason?: string; retryAfter?: number } {
  const now = Date.now();

  // Check burst limit (anti-spam)
  const burst = burstLimits.get(clientIp);
  if (burst) {
    if (burst.resetTime > now) {
      if (burst.count >= RATE_LIMIT_CONFIG.burstLimit) {
        return {
          allowed: false,
          reason: 'burst',
          retryAfter: Math.ceil((burst.resetTime - now) / 1000)
        };
      }
      burst.count++;
    } else {
      burstLimits.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_CONFIG.burstWindowMs });
    }
  } else {
    burstLimits.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_CONFIG.burstWindowMs });
  }

  // Check hourly limit
  const hourly = hourlyLimits.get(clientIp);
  if (hourly) {
    if (hourly.resetTime > now) {
      if (hourly.count >= RATE_LIMIT_CONFIG.maxRequestsPerHour) {
        return {
          allowed: false,
          reason: 'hourly',
          retryAfter: Math.ceil((hourly.resetTime - now) / 1000)
        };
      }
      hourly.count++;
    } else {
      hourlyLimits.set(clientIp, { count: 1, resetTime: now + 3600000 });
    }
  } else {
    hourlyLimits.set(clientIp, { count: 1, resetTime: now + 3600000 });
  }

  // Check daily limit
  const daily = dailyLimits.get(clientIp);
  if (daily) {
    if (daily.resetTime > now) {
      if (daily.count >= RATE_LIMIT_CONFIG.maxRequestsPerDay) {
        return {
          allowed: false,
          reason: 'daily',
          retryAfter: Math.ceil((daily.resetTime - now) / 1000)
        };
      }
      daily.count++;
    } else {
      dailyLimits.set(clientIp, { count: 1, resetTime: now + 86400000 });
    }
  } else {
    dailyLimits.set(clientIp, { count: 1, resetTime: now + 86400000 });
  }

  // Check global minute limit
  if (globalMinuteCount.resetTime > now) {
    if (globalMinuteCount.count >= RATE_LIMIT_CONFIG.globalMaxPerMinute) {
      return {
        allowed: false,
        reason: 'global',
        retryAfter: Math.ceil((globalMinuteCount.resetTime - now) / 1000)
      };
    }
    globalMinuteCount.count++;
  } else {
    globalMinuteCount.count = 1;
    globalMinuteCount.resetTime = now + 60000;
  }

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    cleanupOldEntries(now);
  }

  return { allowed: true };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupOldEntries(now: number) {
  Array.from(hourlyLimits.entries()).forEach(([key, value]) => {
    if (value.resetTime < now) hourlyLimits.delete(key);
  });
  Array.from(dailyLimits.entries()).forEach(([key, value]) => {
    if (value.resetTime < now) dailyLimits.delete(key);
  });
  Array.from(burstLimits.entries()).forEach(([key, value]) => {
    if (value.resetTime < now) burstLimits.delete(key);
  });
}

/**
 * Get rate limit error message
 */
function getRateLimitMessage(reason: string, locale: 'nl' | 'en'): string {
  const messages: Record<string, { nl: string; en: string }> = {
    burst: {
      nl: 'Je stuurt berichten te snel. Wacht even voordat je opnieuw probeert.',
      en: 'You are sending messages too quickly. Please wait before trying again.',
    },
    minute: {
      nl: 'Te veel verzoeken. Probeer het over een minuut opnieuw.',
      en: 'Too many requests. Please try again in a minute.',
    },
    hourly: {
      nl: 'Je hebt het uurtarief bereikt. Probeer het over een uur opnieuw.',
      en: 'You have reached the hourly limit. Please try again in an hour.',
    },
    daily: {
      nl: 'Je hebt het dagelijkse limiet bereikt. Probeer het morgen opnieuw.',
      en: 'You have reached the daily limit. Please try again tomorrow.',
    },
    global: {
      nl: 'De chatbot is momenteel druk bezet. Probeer het over een minuut opnieuw.',
      en: 'The chatbot is currently busy. Please try again in a minute.',
    },
  };

  return messages[reason]?.[locale] || messages.minute[locale];
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return addSecurityHeaders(response);
}

export async function POST(request: NextRequest) {
  let message = '';

  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check per-minute rate limit (primary)
    const rateLimitCheck = checkRateLimit(clientIp, {
      maxRequests: RATE_LIMIT_CONFIG.maxRequestsPerMinute,
      windowMs: 60000,
    });

    if (!rateLimitCheck.allowed) {
      const rateLimitResponse = NextResponse.json(
        {
          error: getRateLimitMessage('minute', 'nl'),
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

    // Check extended rate limits (burst, hourly, daily, global)
    const extendedCheck = checkExtendedRateLimits(clientIp);
    if (!extendedCheck.allowed) {
      // Detect language from any previous message for error response
      const isEnglish = request.headers.get('Accept-Language')?.includes('en');
      const locale = isEnglish ? 'en' : 'nl';

      const rateLimitResponse = NextResponse.json(
        {
          error: getRateLimitMessage(extendedCheck.reason || 'minute', locale),
          retryAfter: extendedCheck.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(extendedCheck.retryAfter || 60),
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
    const limitedHistory = history?.slice(-10) || [];

    // Check for Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      return NextResponse.json({ error: 'API not configured' }, { status: 500 });
    }

    // Create agent context from request (handles authentication)
    const context = await createAgentContext(request, message);

    console.log(
      `🤖 Chat request - Auth: ${context.isAuthenticated}, Locale: ${context.locale}, User: ${context.userName || 'Guest'}, IP: ${clientIp.substring(0, 8)}...`
    );

    // Run the agent with tools (Claude Sonnet 4.5)
    const agentResponse = await runAgent(
      message,
      context,
      limitedHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
    );

    if (agentResponse.toolsUsed && agentResponse.toolsUsed.length > 0) {
      console.log(`🔧 Tools used: ${agentResponse.toolsUsed.join(', ')}`);
    }

    const apiResponse = NextResponse.json({ response: agentResponse.text });
    return addSecurityHeaders(apiResponse);
  } catch (error) {
    console.error('Chat API error:', error);

    // Detect language for fallback
    const isEnglish =
      /\b(what|how|can|you|the|are|is|do|does|have|has|will|would|could|should)\b/i.test(message);
    const locale = isEnglish ? 'en' : 'nl';

    // Detect topic for relevant fallback
    const lowerMessage = message.toLowerCase();
    let topic: string | null = null;

    if (
      lowerMessage.includes('diensten') ||
      lowerMessage.includes('services') ||
      lowerMessage.includes('wat doen jullie')
    ) {
      topic = 'services';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('bereik')) {
      topic = 'contact';
    } else if (
      lowerMessage.includes('prijs') ||
      lowerMessage.includes('kosten') ||
      lowerMessage.includes('price')
    ) {
      topic = 'prijzen';
    } else if (lowerMessage.includes('multi-agent') || lowerMessage.includes('orchestration')) {
      topic = 'multi-agent';
    }

    const fallbackText =
      (locale === 'nl' ? 'Mijn excuses voor het technische probleem. ' : 'Sorry for the technical issue. ') +
      getFallbackResponse(topic, locale);

    const fallbackApiResponse = NextResponse.json({ response: fallbackText });
    return addSecurityHeaders(fallbackApiResponse);
  }
}
