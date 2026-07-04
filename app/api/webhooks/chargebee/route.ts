// Chargebee webhook endpoint — uses HTTP Basic Auth.
// Configure the webhook URL in the Chargebee dashboard as:
//   https://<CHARGEBEE_WEBHOOK_USER>:<CHARGEBEE_WEBHOOK_PASSWORD>@<host>/api/webhooks/chargebee
// Chargebee will include those credentials on every request.

import { timingSafeEqual } from 'crypto';
import * as webhookLog from '@/lib/log/webhook-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HANDLED_EVENTS = new Set([
  'subscription_created',
  'subscription_activated',
  'payment_succeeded',
  'subscription_cancelled',
]);

function safeEqual(a: string, b: string): boolean {
  const expected = Buffer.from(a);
  const actual = Buffer.from(b.padEnd(a.length, '\0').slice(0, a.length));
  // Length mismatch must still be rejected after constant-time compare.
  return timingSafeEqual(expected, actual) && a.length === b.length;
}

export async function POST(request: Request) {
  const user = process.env.CHARGEBEE_WEBHOOK_USER;
  const password = process.env.CHARGEBEE_WEBHOOK_PASSWORD;

  if (!user || !password) {
    console.error('[chargebee-webhook] Missing CHARGEBEE_WEBHOOK_USER or CHARGEBEE_WEBHOOK_PASSWORD');
    return new Response('Webhook not configured', { status: 500 });
  }

  const authHeader = request.headers.get('authorization') ?? '';
  const match = authHeader.match(/^Basic (.+)$/i);
  if (!match) {
    console.warn('[chargebee-webhook] Missing or malformed Authorization header');
    return new Response('Unauthorized', { status: 401 });
  }

  const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
  const colonIdx = decoded.indexOf(':');
  const incomingUser = colonIdx === -1 ? decoded : decoded.slice(0, colonIdx);
  const incomingPassword = colonIdx === -1 ? '' : decoded.slice(colonIdx + 1);

  if (!safeEqual(user, incomingUser) || !safeEqual(password, incomingPassword)) {
    console.warn('[chargebee-webhook] Invalid credentials');
    return new Response('Unauthorized', { status: 401 });
  }

  let event: unknown;
  try {
    event = await request.json();
  } catch {
    console.error('[chargebee-webhook] Failed to parse request body as JSON');
    return new Response('Bad Request', { status: 400 });
  }

  const eventType = (event as Record<string, unknown>)?.event_type as string | undefined;

  if (eventType && HANDLED_EVENTS.has(eventType)) {
    console.log(`[chargebee-webhook] Received ${eventType}`);
    await webhookLog.append('chargebee', event);
  } else {
    console.log(`[chargebee-webhook] Ignored unhandled event type: ${eventType}`);
  }

  return new Response('OK', { status: 200 });
}
