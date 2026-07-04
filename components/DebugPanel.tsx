'use client';

import { useEffect, useState } from 'react';

// TODO: update AFF_COOKIE_NAME once affy.pro's real cookie name is confirmed
const AFF_COOKIE_NAME = 'aff_ref';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function DebugPanel() {
  const [cookieVal, setCookieVal] = useState<string | null>(null);
  const [storageVal, setStorageVal] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setCookieVal(getCookie(AFF_COOKIE_NAME));
    setStorageVal(localStorage.getItem(AFF_COOKIE_NAME));
  }, []);

  async function simulateConversion() {
    setStatus('sending…');
    try {
      const res = await fetch('/api/simulate-conversion', { method: 'POST' });
      setStatus(res.ok ? 'sent ✓' : `error ${res.status}`);
    } catch {
      setStatus('network error');
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-yellow-400 bg-yellow-50 p-4 text-xs font-mono shadow-lg dark:bg-yellow-950 dark:border-yellow-600">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-yellow-900">DEV</span>
        <span className="font-semibold text-yellow-900 dark:text-yellow-100">Affiliate Debug</span>
      </div>
      <div className="space-y-1 text-yellow-800 dark:text-yellow-200">
        <div>
          <span className="opacity-60">cookie </span>
          <span className="font-semibold">{cookieVal ?? <em className="opacity-50">not captured yet</em>}</span>
        </div>
        <div>
          <span className="opacity-60">storage </span>
          <span className="font-semibold">{storageVal ?? <em className="opacity-50">not captured yet</em>}</span>
        </div>
      </div>
      <button
        onClick={simulateConversion}
        className="mt-3 w-full rounded bg-yellow-400 px-2 py-1 text-yellow-900 hover:bg-yellow-500 active:bg-yellow-600"
      >
        Simulate conversion
      </button>
      {status && <p className="mt-1 text-center text-yellow-700 dark:text-yellow-300">{status}</p>}
    </div>
  );
}
