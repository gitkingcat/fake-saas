// Paddle Billing webhook (current API, not Paddle Classic).
// Classic uses a different scheme: public key verification against a form-encoded body.
// This implementation uses Paddle Billing's HMAC-SHA256 scheme.
import { createHmac, timingSafeEqual } from 'crypto';
import * as webhookLog from '@/lib/log/webhook-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HANDLED_EVENTS = new Set([
  'transaction.completed',
  'subscription.created',
  'subscription.updated',
  'subscription.canceled',
]);

function parseSignatureHeader(header: string): { ts: string; h1: string } | null {
  const parts = header.split(';');
  let ts: string | undefined;
  let h1: string | undefined;
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'h1') h1 = value;
  }
  if (!ts || !h1) return null;
  return { ts, h1 };
}

export async function POST(request: Request) {
  const signatureHeader = request.headers.get('paddle-signature');
  if (!signatureHeader) {
    console.error('[paddle-webhook] Missing Paddle-Signature header');
    return new Response('Missing Paddle-Signature header', { status: 400 });
  }

  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) {
    console.error('[paddle-webhook] Malformed Paddle-Signature header');
    return new Response('Malformed Paddle-Signature header', { status: 400 });
  }

  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[paddle-webhook] Missing PADDLE_WEBHOOK_SECRET');
    return new Response('Webhook not configured', { status: 500 });
  }

  const rawBody = await request.text();
  const { ts, h1 } = parsed;

  const expected = createHmac('sha256', secret)
    .update(`${ts}:${rawBody}`)
    .digest('hex');

  let signaturesMatch: boolean;
  try {
    signaturesMatch = timingSafeEqual(Buffer.from(expected), Buffer.from(h1));
  } catch {
    signaturesMatch = false;
  }

  if (!signaturesMatch) {
    console.error('[paddle-webhook] HMAC verification failed');
    return new Response('Invalid signature', { status: 401 });
  }

  let event: { event_type?: string; [key: string]: unknown };
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.error('[paddle-webhook] Failed to parse request body as JSON');
    return new Response('Invalid JSON body', { status: 400 });
  }

  const eventType = event.event_type ?? '(unknown)';

  if (HANDLED_EVENTS.has(eventType as string)) {
    console.log(`[paddle-webhook] Received ${eventType}`);
    await webhookLog.append('paddle', event);
  } else {
    console.log(`[paddle-webhook] Ignored unhandled event type: ${eventType}`);
  }

  return new Response('OK', { status: 200 });
}
