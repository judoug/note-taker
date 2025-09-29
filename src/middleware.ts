import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters, getClientIdentifier, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limiter';

// Define which routes should be protected (require authentication)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/notes(.*)',
  '/api/notes(.*)',
  '/api/generate-note(.*)',
]);

// Define public routes that should be accessible without authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/clerk-webhook(.*)',
]);

// Define API routes that need rate limiting
const isAIRoute = createRouteMatcher(['/api/generate-note(.*)']);
const isNotesAPIRoute = createRouteMatcher(['/api/notes(.*)']);
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

// Security headers for development (production headers are in next.config.js)
function addSecurityHeaders(response: NextResponse): NextResponse {
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }
  return response;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const response = NextResponse.next();
  
  // Apply security headers
  addSecurityHeaders(response);

  // Rate limiting for different route types
  let rateLimitResult = null;
  let identifier = '';

  try {
    if (isAIRoute(req)) {
      // AI routes: Require authentication first, then check rate limit
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
      const { userId } = await auth();
      identifier = getClientIdentifier(req, userId || undefined);
      rateLimitResult = rateLimiters.ai.isAllowed(identifier);
    } else if (isNotesAPIRoute(req)) {
      // Notes API: Require authentication first, then check rate limit
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
      const { userId } = await auth();
      identifier = getClientIdentifier(req, userId || undefined);
      rateLimitResult = rateLimiters.notes.isAllowed(identifier);
    } else if (isAuthRoute(req)) {
      // Auth routes: Use IP-based rate limiting
      identifier = getClientIdentifier(req);
      rateLimitResult = rateLimiters.auth.isAllowed(identifier);
    } else if (req.nextUrl.pathname.startsWith('/api/')) {
      // Other API routes: General rate limiting
      const { userId } = await auth();
      identifier = getClientIdentifier(req, userId || undefined);
      rateLimitResult = rateLimiters.api.isAllowed(identifier);
    }

    // Check rate limit result
    if (rateLimitResult && !rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for ${identifier} on ${req.nextUrl.pathname}`);
      return createRateLimitResponse(rateLimitResult.resetTime!, rateLimitResult.remaining);
    }

    // Add rate limit headers to successful responses
    if (rateLimitResult?.remaining !== undefined && rateLimitResult?.resetTime) {
      addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetTime);
    }

  } catch (error) {
    console.error('Middleware error:', error);
    // Continue with authentication check even if rate limiting fails
  }

  // Authentication logic
  if (isPublicRoute(req)) {
    return response;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
