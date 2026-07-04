import * as webhookLog from '@/lib/log/webhook-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  await Promise.all([
    webhookLog.clear('stripe'),
    webhookLog.clear('chargebee'),
    webhookLog.clear('paddle'),
  ]);
  return Response.json({ ok: true, cleared: ['stripe', 'chargebee', 'paddle'] });
}
