'use client';

// Paddle Billing (v2) — NOT Paddle Classic.
// https://developer.paddle.com/build/checkout/build-overlay-checkout

import { useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    AffyJS?: { getReferralId(): string | null };
    Paddle: {
      Environment: { set: (env: 'sandbox' | 'production') => void };
      Initialize: (options: { token: string }) => void;
      Checkout: {
        open: (options: {
          items: { priceId: string; quantity: number }[];
          customData?: Record<string, string | null>;
          successUrl?: string;
        }) => void;
      };
    };
  }
}

export default function PaddleCheckout({ priceId }: { priceId: string }) {
  const [ready, setReady] = useState(false);

  function handleScriptLoad() {
    // Sandbox must be set before Initialize — Paddle silently ships live if omitted.
    window.Paddle.Environment.set('sandbox');
    window.Paddle.Initialize({
      token: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN!,
    });
    setReady(true);
  }

  function handleCheckout() {
    if (!ready) return;
    const clickID = window.AffyJS?.getReferralId() ?? null;
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { clickID },
      successUrl: '/thank-you',
    });
  }

  return (
    <>
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={handleScriptLoad}
      />
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Get started with TestFlow
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Secure checkout powered by Paddle.
        </p>
        <button
          onClick={handleCheckout}
          disabled={!ready}
          className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {ready ? 'Subscribe now' : 'Loading…'}
        </button>
      </div>
    </>
  );
}
