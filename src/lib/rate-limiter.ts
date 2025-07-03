// Simple in-memory rate limiter for chatbot API
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 30, windowMs: 60000 } // 30 requests per minute default
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const userLimit = requestCounts.get(identifier);

  // Clean up old entries
  if (requestCounts.size > 1000) {
    Array.from(requestCounts.entries()).forEach(([key, value]) => {
      if (value.resetTime < now) {
        requestCounts.delete(key);
      }
    });
  }

  if (!userLimit || userLimit.resetTime < now) {
    // Create new rate limit window
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true };
  }

  if (userLimit.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
    };
  }

  // Increment count
  userLimit.count++;
  return { allowed: true };
}

// Content validation
export function validateChatContent(message: string): { valid: boolean; reason?: string } {
  // Check message length
  if (message.length > 1000) {
    return { valid: false, reason: 'Message too long (max 1000 characters)' };
  }

  // Check for empty or whitespace-only messages
  if (!message.trim()) {
    return { valid: false, reason: 'Message cannot be empty' };
  }

  // Check for repeated characters (potential spam)
  const repeatedChars = /(.)\1{9,}/;
  if (repeatedChars.test(message)) {
    return { valid: false, reason: 'Message contains spam patterns' };
  }

  // Check for excessive caps (shouting)
  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (capsRatio > 0.8 && message.length > 10) {
    return { valid: false, reason: 'Please avoid excessive capital letters' };
  }

  return { valid: true };
}

// IP-based rate limiting helpers
export function getClientIp(request: Request): string {
  // Check various headers for client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const client = request.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return real || client || 'unknown';
}
