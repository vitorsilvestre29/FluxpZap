type Bucket = {
  hits: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

export function consumeRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = store.get(input.key);

  if (!current || now >= current.resetAt) {
    store.set(input.key, { hits: 1, resetAt: now + input.windowMs });
    return { allowed: true, retryAfterSec: 0, remaining: input.limit - 1 };
  }

  if (current.hits >= input.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return { allowed: false, retryAfterSec, remaining: 0 };
  }

  current.hits += 1;
  store.set(input.key, current);
  return { allowed: true, retryAfterSec: 0, remaining: Math.max(0, input.limit - current.hits) };
}

