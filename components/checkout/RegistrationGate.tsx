'use client';

import { useState, type ReactNode, type FormEvent } from 'react';

declare global {
  interface Window {
    AffyJS?: {
      getReferralId(): string | null;
      trackRegistration(opts: { email: string; customerId: string; name?: string }): Promise<void>;
    };
  }
}

export default function RegistrationGate({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await window.AffyJS?.trackRegistration({
      email,
      customerId: email,
      name: name || undefined,
    });
    setLoading(false);
    setDone(true);
  }

  if (done) return <>{children}</>;

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col items-center gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Create your account
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        Enter your details to continue to checkout.
      </p>
      <input
        type="text"
        placeholder="Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        type="email"
        placeholder="Email address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? 'Registering…' : 'Continue to checkout →'}
      </button>
    </form>
  );
}
