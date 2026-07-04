import Stripe from 'stripe';
import * as webhookLog from '@/lib/log/webhook-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'invoice.paid',
  'customer.subscription.deleted',
]);

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    console.error('[stripe-webhook] Missing Stripe-Signature header');
    return new Response('Missing Stripe-Signature header', { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !secretKey) {
    console.error('[stripe-webhook] Missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY');
    return new Response('Webhook not configured', { status: 500 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[stripe-webhook] Signature verification failed: ${message}`);
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 });
  }

  if (HANDLED_EVENTS.has(event.type)) {
    console.log(`[stripe-webhook] Received ${event.type} (${event.id})`);
    await webhookLog.append('stripe', event);
  } else {
    console.log(`[stripe-webhook] Ignored unhandled event type: ${event.type}`);
  }

  return new Response('OK', { status: 200 });
}
