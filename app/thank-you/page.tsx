import Script from 'next/script';

export default function ThankYouPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-6 p-8 text-center font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          You&rsquo;re in &mdash; thanks!
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Your subscription is confirmed. Welcome aboard.
        </p>
      </div>
    </main>
  );
}
