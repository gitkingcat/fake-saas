'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize outside component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function StripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    // Ensure Stripe.js has loaded before proceeding
    await stripePromise;

    const res = await fetch('/api/checkout/stripe', { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Failed to start checkout. Please try again.');
      setLoading(false);
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Get started with TestFlow
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        Secure checkout powered by Stripe.
      </p>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? 'Redirecting…' : 'Subscribe now'}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
