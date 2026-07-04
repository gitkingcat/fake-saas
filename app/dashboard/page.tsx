import { revalidatePath } from 'next/cache';
import { getActiveProvider, missingEnvVars } from '@/lib/billing/provider';
import * as webhookLog from '@/lib/log/webhook-log';
import DebugPanel from '@/components/DebugPanel';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const provider = getActiveProvider();
  const missing = provider ? missingEnvVars(provider) : [];
  const events = provider ? await webhookLog.read(provider, 10) : [];

  async function resetLogs() {
    'use server';
    await Promise.all([
      webhookLog.clear('stripe'),
      webhookLog.clear('chargebee'),
      webhookLog.clear('paddle'),
    ]);
    revalidatePath('/dashboard');
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '900px' }}>
      <div style={{ background: '#c00', color: '#fff', padding: '0.5rem 1rem', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
        DEV ONLY — not for production use
      </div>

      <h1 style={{ marginTop: 0 }}>Dashboard</h1>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Active provider</h2>
        {provider ? (
          <code style={{ fontSize: '1.1rem' }}>{provider}</code>
        ) : (
          <em style={{ color: '#c00' }}>Not configured — BILLING_PROVIDER is unset or invalid</em>
        )}
      </section>

      {missing.length > 0 && (
        <section style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px' }}>
          <strong>Missing env vars for {provider}:</strong>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.5rem' }}>
            {missing.map((v) => (
              <li key={v}><code>{v}</code></li>
            ))}
          </ul>
        </section>
      )}

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>
          Recent events — {provider ?? 'no provider'} (last 10)
        </h2>
        {events.length === 0 ? (
          <em style={{ color: '#666' }}>No events logged.</em>
        ) : (
          <div>
            {events.map((entry, i) => (
              <details
                key={i}
                style={{ marginBottom: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', padding: '0.5rem' }}
              >
                <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
                  {entry.receivedAt}
                </summary>
                <pre style={{ margin: '0.5rem 0 0', overflow: 'auto', fontSize: '0.85em', background: '#f5f5f5', padding: '0.5rem', borderRadius: '3px' }}>
                  {JSON.stringify(entry.event, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <form action={resetLogs}>
          <button
            type="submit"
            style={{ background: '#c00', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '1rem', borderRadius: '4px' }}
          >
            Reset all logs
          </button>
        </form>
      </section>

      <DebugPanel />
    </main>
  );
}
