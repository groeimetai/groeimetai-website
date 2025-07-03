import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';

// Define rate limit configurations for different endpoints
const rateLimitConfigs = {
  '/api/auth/register': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
  '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 10 }, // 10 requests per 15 minutes
  '/api/contact': { windowMs: 60 * 60 * 1000, max: 10 }, // 10 requests per hour
  '/api/newsletter': { windowMs: 24 * 60 * 60 * 1000, max: 5 }, // 5 requests per day
  '/api/chat': { windowMs: 60 * 1000, max: 30 }, // 30 requests per minute
  '/api/consultation': { windowMs: 60 * 60 * 1000, max: 5 }, // 5 requests per hour
  default: { windowMs: 60 * 1000, max: 100 } // 100 requests per minute for other endpoints
};

// Create LRU cache for storing rate limit data
const rateLimitCache = new LRUCache<string, { count: number; resetTime: number }>({
  max: 10000, // Maximum number of items in cache
  ttl: 24 * 60 * 60 * 1000, // 24 hours TTL
});

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  // Use the first available IP
  const ip = forwardedFor?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown';
  
  // For authenticated requests, use user ID as identifier
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from JWT token (this is a simplified version)
    // In production, you would properly decode and verify the JWT
    const userId = extractUserIdFromToken(authHeader);
    if (userId) {
      return `user:${userId}`;
    }
  }
  
  return `ip:${ip}`;
}

/**
 * Extract user ID from JWT token (simplified version)
 */
function extractUserIdFromToken(authHeader: string): string | null {
  // This is a placeholder - implement proper JWT decoding
  // For now, return null to use IP-based rate limiting
  return null;
}

/**
 * Get rate limit config for a specific path
 */
function getRateLimitConfig(path: string) {
  // Find matching config
  for (const [pattern, config] of Object.entries(rateLimitConfigs)) {
    if (pattern === 'default') continue;
    if (path.startsWith(pattern)) {
      return config;
    }
  }
  return rateLimitConfigs.default;
}

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const clientId = getClientIdentifier(request);
  const config = getRateLimitConfig(path);
  
  // Create cache key
  const cacheKey = `${clientId}:${path}`;
  
  // Get current rate limit data
  const now = Date.now();
  let rateLimitData = rateLimitCache.get(cacheKey);
  
  // Initialize or reset rate limit data
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitData = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }
  
  // Increment request count
  rateLimitData.count++;
  
  // Update cache
  rateLimitCache.set(cacheKey, rateLimitData);
  
  // Check if rate limit exceeded
  if (rateLimitData.count > config.max) {
    // Calculate retry after time
    const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
    
    // Create rate limit response
    const response = NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: retryAfter
      },
      { status: 429 }
    );
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', config.max.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', rateLimitData.resetTime.toString());
    response.headers.set('Retry-After', retryAfter.toString());
    
    return response;
  }
  
  // Add rate limit headers to successful requests
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', config.max.toString());
  response.headers.set('X-RateLimit-Remaining', (config.max - rateLimitData.count).toString());
  response.headers.set('X-RateLimit-Reset', rateLimitData.resetTime.toString());
  
  return response;
}

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  // LRU cache handles TTL automatically, but we can force cleanup if needed
  rateLimitCache.purgeStale();
}, 60 * 60 * 1000); // Run every hour