import { createHmac, timingSafeEqual } from 'crypto';

// Verify Clerk webhook signature for security
export function verifyClerkWebhook(
  payload: string, 
  signature: string | null, 
  secret: string
): boolean {
  if (!signature || !secret) {
    console.error('Missing webhook signature or secret');
    return false;
  }

  try {
    // Clerk sends signature in format: "t=timestamp,v1=signature"
    const parts = signature.split(',');
    const timestamp = parts.find(part => part.startsWith('t='))?.substring(2);
    const providedSignature = parts.find(part => part.startsWith('v1='))?.substring(3);

    if (!timestamp || !providedSignature) {
      console.error('Invalid signature format');
      return false;
    }

    // Create the signed payload
    const signedPayload = `${timestamp}.${payload}`;
    
    // Generate expected signature
    const expectedSignature = createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Compare signatures using timing-safe comparison
    const providedBuffer = Buffer.from(providedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Extract and validate webhook timestamp (prevent replay attacks)
export function isWebhookTimestampValid(
  signature: string, 
  toleranceSeconds: number = 300 // 5 minutes
): boolean {
  try {
    const parts = signature.split(',');
    const timestampPart = parts.find(part => part.startsWith('t='));
    
    if (!timestampPart) {
      return false;
    }

    const timestamp = parseInt(timestampPart.substring(2), 10);
    const now = Math.floor(Date.now() / 1000);
    
    return Math.abs(now - timestamp) <= toleranceSeconds;
  } catch (error) {
    console.error('Error validating webhook timestamp:', error);
    return false;
  }
}

// Webhook event types we handle
export type ClerkWebhookEvent = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'session.created'
  | 'session.ended';

// Webhook payload structure
export interface ClerkWebhookPayload {
  data: Record<string, unknown>;
  object: string;
  type: ClerkWebhookEvent;
}

// Validate webhook payload structure
export function isValidClerkWebhook(payload: unknown): payload is ClerkWebhookPayload {
  if (payload === null || typeof payload !== 'object') {
    return false;
  }
  
  const obj = payload as Record<string, unknown>;
  
  return (
    'data' in obj &&
    'type' in obj &&
    'object' in obj &&
    typeof obj.type === 'string' &&
    typeof obj.object === 'string'
  );
}
