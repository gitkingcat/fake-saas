export type Provider = 'stripe' | 'chargebee' | 'paddle';

const VALID: readonly Provider[] = ['stripe', 'chargebee', 'paddle'];

const PROVIDER_ENV_VARS: Record<Provider, string[]> = {
  stripe: [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PRICE_ID',
    'STRIPE_WEBHOOK_SECRET',
  ],
  chargebee: [
    'NEXT_PUBLIC_CHARGEBEE_SITE',
    'NEXT_PUBLIC_CHARGEBEE_PUBLISHABLE_KEY',
    'CHARGEBEE_PLAN_ID',
    'CHARGEBEE_WEBHOOK_USER',
    'CHARGEBEE_WEBHOOK_PASSWORD',
  ],
  paddle: [
    'NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN',
    'PADDLE_PRICE_ID',
    'PADDLE_WEBHOOK_SECRET',
  ],
};

function resolveProvider(): Provider {
  const value = process.env.BILLING_PROVIDER;
  if (!value) {
    throw new Error(
      'BILLING_PROVIDER is not set. Must be one of: stripe | chargebee | paddle'
    );
  }
  if (!VALID.includes(value as Provider)) {
    throw new Error(
      `Invalid BILLING_PROVIDER "${value}". Must be one of: ${VALID.join(' | ')}`
    );
  }
  return value as Provider;
}

/** Returns the active provider, or null if BILLING_PROVIDER is missing/invalid. Never throws. */
export function getActiveProvider(): Provider | null {
  try {
    return resolveProvider();
  } catch {
    return null;
  }
}

/** Returns the env var names required by the given provider. Never throws. */
export function requiredEnvVars(p: Provider): string[] {
  return PROVIDER_ENV_VARS[p];
}

/** Returns the subset of required env vars that are currently unset. Never throws. */
export function missingEnvVars(p: Provider): string[] {
  return PROVIDER_ENV_VARS[p].filter((key) => !process.env[key]);
}
