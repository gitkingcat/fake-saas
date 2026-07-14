'use client';

import { useState } from 'react';
import Script from 'next/script';

// https://www.chargebee.com/checkout-portal-docs/drop-in-tutorial.html
declare global {
  interface Window {
    Chargebee: {
      init: (options: { site: string; publishableKey: string }) => ChargebeeInstance;
      getInstance: () => ChargebeeInstance;
    };
  }
}

interface ChargebeeInstance {
  openCheckout: (options: {
    hostedPage: () => Promise<unknown>;
    success?: (hostedPageId: string) => void;
    close?: () => void;
    step?: (step: string) => void;
  }) => void;
}

export default function ChargebeeCheckout() {
  const [cbInstance, setCbInstance] = useState<ChargebeeInstance | null>(null);
  const [loading, setLoading] = useState(false);

  function handleScriptLoad() {
    const instance = window.Chargebee.init({
      site: process.env.NEXT_PUBLIC_CHARGEBEE_SITE!,
      publishableKey: process.env.NEXT_PUBLIC_CHARGEBEE_PUBLISHABLE_KEY!,
    });
    setCbInstance(instance);
  }

  function handleCheckout() {
    if (!cbInstance) return;
    setLoading(true);

    const clickID = (window as unknown as { AffyJS?: { getReferralId(): string | null } }).AffyJS?.getReferralId() ?? null;

    cbInstance.openCheckout({
      hostedPage: () =>
        fetch('/api/checkout/chargebee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clickID }),
        }).then((res) => {
          if (!res.ok) throw new Error('Failed to start Chargebee checkout');
          return res.json();
        }),
      success: () => {
        window.location.href = '/thank-you';
      },
      close: () => {
        setLoading(false);
      },
    });
  }

  return (
    <>
      <Script
        src="https://js.chargebee.com/v2/chargebee.js"
        onLoad={handleScriptLoad}
      />
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Get started with TestFlow
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Secure checkout powered by Chargebee.
        </p>
        <button
          onClick={handleCheckout}
          disabled={loading || !cbInstance}
          className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? 'Opening checkout…' : 'Subscribe now'}
        </button>
      </div>
    </>
  );
}
