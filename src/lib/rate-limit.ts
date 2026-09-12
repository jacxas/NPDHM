import "server-only";
import { redis } from "./redis";

// In-memory fallback used when Redis is not configured or temporarily
// unavailable (single-instance deployments, local dev without Redis, etc.).
const memBuckets = new Map<string, { count: number; resetAt: number }>();
const MEM_MAX_KEYS = 10_000;

function memConsume(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memBuckets.get(key);
  if (!entry || entry.resetAt < now) {
    if (memBuckets.size >= MEM_MAX_KEYS) {
      for (const [k, v] of memBuckets) {
        if (v.resetAt < now) memBuckets.delete(k);
      }
    }
    memBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

/**
 * Fixed-window rate limiter backed by Redis (INCR + PEXPIRE).
 * Falls back to an in-memory bucket when Redis is unavailable.
 *
 * @returns true if the request is allowed, false if the limit is exceeded.
 */
export async function consumeRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const r = redis();
  if (r) {
    try {
      const redisKey = `ratelimit:${key}`;
      const count = await r.incr(redisKey);
      if (count === 1) {
        await r.pexpire(redisKey, windowMs);
      }
      return count <= max;
    } catch {
      // Redis error — degrade gracefully instead of blocking traffic.
    }
  }
  return memConsume(key, max, windowMs);
}
