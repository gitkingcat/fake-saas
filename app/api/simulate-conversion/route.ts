import { getActiveProvider } from '@/lib/billing/provider';
import * as webhookLog from '@/lib/log/webhook-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const provider = getActiveProvider();
  if (!provider) {
    return Response.json({ error: 'No active provider configured' }, { status: 500 });
  }

  let affiliateId: string | undefined;
  try {
    const body = await request.json();
    affiliateId = body?.affiliateId;
  } catch {
    // body is optional
  }

  await webhookLog.append(provider, {
    synthetic: true,
    receivedAt: new Date().toISOString(),
    affiliateId,
  });

  return Response.json({ ok: true, provider });
}
