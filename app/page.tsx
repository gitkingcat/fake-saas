import DebugPanel from '@/components/DebugPanel';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function buildSignupHref(params: Record<string, string | string[] | undefined>): string {
  const forwarded = new URLSearchParams();
  if (params.ref) forwarded.set('ref', String(params.ref));
  if (params.aff) forwarded.set('aff', String(params.aff));
  const qs = forwarded.toString();
  return qs ? `/signup?${qs}` : '/signup';
}

const plans = [
  {
    name: 'Starter',
    price: '$9',
    desc: 'Perfect for individuals and small side projects.',
    features: ['1 project', '5 GB storage', 'Community support'],
  },
  {
    name: 'Pro',
    price: '$49',
    desc: 'For teams that need more power and collaboration.',
    features: ['Unlimited projects', '100 GB storage', 'Priority support', 'Advanced analytics'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Tailored for large organisations with custom needs.',
    features: ['Everything in Pro', 'SSO / SAML', 'SLA & dedicated CSM', 'Custom integrations'],
  },
];

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const signupHref = buildSignupHref(params);

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-zinc-950 font-sans">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Ship faster with <span className="text-indigo-600">TestFlow</span>
        </h1>
        <p className="max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
          The all-in-one testing and deployment platform built for modern teams.
          From idea to production in minutes.
        </p>
        <a
          href={signupHref}
          className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Get started free
        </a>
      </section>

      {/* Pricing */}
      <section className="flex flex-col items-center gap-8 px-6 pb-24">
        <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Simple, transparent pricing</h2>
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-8 ${
                plan.highlight
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {plan.highlight && (
                <span className="mb-4 self-start rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{plan.name}</h3>
              <p className="mt-2 text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {plan.price}
                {plan.price !== 'Custom' && <span className="text-base font-normal text-zinc-500">/mo</span>}
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{plan.desc}</p>
              <ul className="mt-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="text-indigo-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={signupHref}
                className={`mt-8 rounded-full px-6 py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'border border-zinc-300 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                Sign Up
              </a>
            </div>
          ))}
        </div>
      </section>

      <DebugPanel />
    </div>
  );
}
