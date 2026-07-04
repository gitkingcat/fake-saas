import { getActiveProvider, missingEnvVars } from '@/lib/billing/provider';
import StripeCheckout from '@/components/checkout/StripeCheckout';
import ChargebeeCheckout from '@/components/checkout/ChargebeeCheckout';
import PaddleCheckout from '@/components/checkout/PaddleCheckout';

export default function SignupPage() {
  const activeProvider = getActiveProvider();

  if (!activeProvider) {
    return (
      <main className="flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center font-sans">
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
          <h1 className="text-lg font-semibold text-red-800 dark:text-red-200">
            BILLING_PROVIDER is not configured
          </h1>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            Set <code className="rounded bg-red-100 px-1 dark:bg-red-900">BILLING_PROVIDER</code> to one
            of: <code className="rounded bg-red-100 px-1 dark:bg-red-900">stripe | chargebee | paddle</code>
          </p>
        </div>
      </main>
    );
  }

  const missing = missingEnvVars(activeProvider);

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-8 p-8 font-sans">
      <div className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        Active provider: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{activeProvider}</span>
      </div>

      {missing.length > 0 ? (
        <div className="w-full max-w-md rounded-lg border border-amber-300 bg-amber-50 p-6 dark:border-amber-700 dark:bg-amber-950">
          <h2 className="font-semibold text-amber-900 dark:text-amber-100">
            Missing env vars for <span className="uppercase">{activeProvider}</span>
          </h2>
          <ul className="mt-3 space-y-1">
            {missing.map((v) => (
              <li key={v} className="font-mono text-sm text-amber-800 dark:text-amber-200">
                {v}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
            Set these environment variables and restart the dev server.
          </p>
        </div>
      ) : (
        <>
          {activeProvider === 'stripe' && <StripeCheckout />}
          {activeProvider === 'chargebee' && <ChargebeeCheckout />}
          {activeProvider === 'paddle' && <PaddleCheckout priceId={process.env.PADDLE_PRICE_ID!} />}
        </>
      )}
    </main>
  );
}
