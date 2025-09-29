import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter for development/single instance
// For production with multiple instances, consider Redis or external service
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): { allowed: boolean; resetTime?: number; remaining?: number } {
    const now = Date.now();
    const requestData = this.requests.get(identifier);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      this.cleanup(now);
    }

    if (!requestData || now > requestData.resetTime) {
      // New window or expired window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { 
        allowed: true, 
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      };
    }

    if (requestData.count >= this.maxRequests) {
      return { 
        allowed: false, 
        resetTime: requestData.resetTime,
        remaining: 0
      };
    }

    requestData.count++;
    return { 
      allowed: true, 
      remaining: this.maxRequests - requestData.count,
      resetTime: requestData.resetTime
    };
  }

  private cleanup(now: number) {
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Different rate limiters for different endpoints
export const rateLimiters = {
  // OpenAI API: 5 requests per minute per user
  ai: new RateLimiter(60 * 1000, 5),
  
  // General API: 100 requests per minute per user
  api: new RateLimiter(60 * 1000, 100),
  
  // Authentication: 10 requests per minute per IP
  auth: new RateLimiter(60 * 1000, 10),
  
  // Notes CRUD: 50 requests per minute per user
  notes: new RateLimiter(60 * 1000, 50)
};

export function getClientIdentifier(request: NextRequest, userId?: string): string {
  // Use userId if available (authenticated), otherwise fall back to IP
  if (userId) {
    return `user:${userId}`;
  }
  
  // Get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

export function createRateLimitResponse(resetTime: number, remaining: number = 0): NextResponse {
  const response = NextResponse.json(
    { 
      error: 'Too many requests. Please try again later.',
      resetTime: new Date(resetTime).toISOString()
    },
    { status: 429 }
  );

  response.headers.set('X-RateLimit-Limit', '5');
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
  response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());

  return response;
}

export function addRateLimitHeaders(response: NextResponse, remaining: number, resetTime: number): NextResponse {
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
  return response;
}
