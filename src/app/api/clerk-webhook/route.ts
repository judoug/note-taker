import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkWebhook, isWebhookTimestampValid, isValidClerkWebhook, type ClerkWebhookPayload } from '@/lib/webhook-utils';
import { syncClerkUser, type ClerkUserData } from '@/lib/user-sync';
import { prisma } from '@/lib/prisma';

// Webhook secret from Clerk dashboard
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Get signature from headers
    const signature = req.headers.get('clerk-signature');
    
    if (!signature) {
      console.error('Missing Clerk signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Validate webhook secret is configured
    if (!WEBHOOK_SECRET) {
      console.error('Clerk webhook secret not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify timestamp to prevent replay attacks
    if (!isWebhookTimestampValid(signature)) {
      console.error('Webhook timestamp validation failed');
      return NextResponse.json({ error: 'Invalid timestamp' }, { status: 401 });
    }

    // Verify webhook signature
    if (!verifyClerkWebhook(body, signature, WEBHOOK_SECRET)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse payload
    let payload: ClerkWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Validate payload structure
    if (!isValidClerkWebhook(payload)) {
      console.error('Invalid webhook payload structure');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    console.log(`Received webhook: ${payload.type} for user ${payload.data.id as string}`);

    // Handle different event types
    switch (payload.type) {
      case 'user.created':
      case 'user.updated':
        try {
          const user = await syncClerkUser(payload.data as unknown as ClerkUserData);
          console.log(`User ${payload.type === 'user.created' ? 'created' : 'updated'}: ${user.email}`);
          return NextResponse.json({ 
            success: true, 
            userId: user.id,
            action: payload.type 
          });
        } catch (error) {
          console.error(`Failed to ${payload.type === 'user.created' ? 'create' : 'update'} user:`, error);
          return NextResponse.json({ 
            error: 'User sync failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }

      case 'user.deleted':
        try {
          // Soft delete or handle user deletion
          const deletedUser = await prisma.user.findUnique({
            where: { clerkId: payload.data.id as string }
          });
          
          if (deletedUser) {
            // For now, we'll keep the user record but could add a deletedAt field
            // await prisma.user.update({
            //   where: { clerkId: payload.data.id },
            //   data: { deletedAt: new Date() }
            // });
            
            console.log(`User deleted from Clerk: ${deletedUser.email}`);
          }
          
          return NextResponse.json({ 
            success: true, 
            action: 'user.deleted',
            message: 'User deletion acknowledged' 
          });
        } catch (error) {
          console.error('Failed to handle user deletion:', error);
          return NextResponse.json({ 
            error: 'User deletion failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }

      case 'session.created':
      case 'session.ended':
        // We could log session events for analytics
        console.log(`Session event: ${payload.type} for user ${payload.data.user_id as string}`);
        return NextResponse.json({ 
          success: true, 
          action: payload.type,
          message: 'Session event logged' 
        });

      default:
        console.log(`Unhandled webhook event: ${payload.type}`);
        return NextResponse.json({ 
          success: true, 
          message: 'Event acknowledged but not processed' 
        });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle GET requests (for webhook endpoint verification)
export async function GET() {
  return NextResponse.json({ 
    message: 'Clerk webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
