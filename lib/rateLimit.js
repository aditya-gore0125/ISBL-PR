import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

const memoryWindows = new Map();
const missingUpstashWarningKey = Symbol.for('isbl.rate-limit.missing-upstash-warning');
const upstashFailOpenErrorKey = Symbol.for('isbl.rate-limit.upstash-fail-open-error');
const upstashScript = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - window)
local count = redis.call('ZCARD', KEYS[1])
if count >= limit then
  local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  local retry = math.max(1, math.ceil((tonumber(oldest[2]) + window - now) / 1000))
  return {0, retry}
end
redis.call('ZADD', KEYS[1], now, ARGV[4])
redis.call('PEXPIRE', KEYS[1], window)
return {1, 0}
`;

function getHeader(request, name) {
  return request?.headers?.get?.(name) || request?.headers?.[name] || '';
}

function getClientIp(request) {
  const forwarded = getHeader(request, 'x-forwarded-for');
  const forwardedIp = forwarded.split(',')[0]?.trim();
  if (forwardedIp) return forwardedIp;
  const realIp = getHeader(request, 'x-real-ip').trim();
  if (realIp) return realIp;
  return 'unknown';
}

function fingerprint(value) {
  return createHash('sha256').update(value).digest('hex');
}

function checkMemoryWindow(key, now, windowMs, limit) {
  const activeEvents = (memoryWindows.get(key) || []).filter((timestamp) => timestamp > now - windowMs);
  if (activeEvents.length >= limit) {
    memoryWindows.set(key, activeEvents);
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((activeEvents[0] + windowMs - now) / 1000)) };
  }

  activeEvents.push(now);
  memoryWindows.set(key, activeEvents);
  if (memoryWindows.size > 10000) {
    for (const [windowKey, events] of memoryWindows) {
      if (!events.length || events[events.length - 1] <= now - windowMs) memoryWindows.delete(windowKey);
    }
    while (memoryWindows.size > 10000) {
      memoryWindows.delete(memoryWindows.keys().next().value);
    }
  }
  return { allowed: true, retryAfter: 0 };
}

async function checkUpstashWindow(key, now, windowMs, limit) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url) throw new Error('UPSTASH_REDIS_REST_URL is required when Upstash Redis is enabled.');
  if (!token) throw new Error('UPSTASH_REDIS_REST_TOKEN is required when Upstash Redis is enabled.');

  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      'EVAL', upstashScript, '1', key, String(now), String(windowMs), String(limit), `${now}:${randomUUID()}`,
    ]),
    signal: AbortSignal.timeout(3000),
    cache: 'no-store',
  });
  const payload = await response.json();
  if (!response.ok || payload.error) throw new Error(payload.error || 'Upstash rate-limit request failed.');
  return { allowed: Number(payload.result?.[0]) === 1, retryAfter: Number(payload.result?.[1]) || 0 };
}

if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build' &&
  (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) &&
  !globalThis[missingUpstashWarningKey]
) {
  globalThis[missingUpstashWarningKey] = true;
  console.warn(
    '[rate-limit] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not both configured. ' +
    'Rate limits may be process-local or unavailable until both values are set.'
  );
}

export async function applyRateLimit(request, { route, limit, windowMs, identity = '', failOpen = false }) {
  const now = Date.now();
  const fingerprintValue = `${getClientIp(request)}\n${String(identity).trim().toLowerCase()}`;
  const key = `rate-limit:${route}:${fingerprint(fingerprintValue)}`;
  let result;

  try {
    result = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN
      ? await checkUpstashWindow(key, now, windowMs, limit)
      : checkMemoryWindow(key, now, windowMs, limit);
  } catch (error) {
    if (failOpen) {
      if (!globalThis[upstashFailOpenErrorKey]) {
        globalThis[upstashFailOpenErrorKey] = true;
        console.error('Upstash rate-limit service failed; falling back to the in-memory limiter.', error);
      }
      result = checkMemoryWindow(key, now, windowMs, limit);
    } else {
      console.error('Rate-limit service error', error);
      return NextResponse.json({ message: 'Request protection is temporarily unavailable.' }, { status: 503 });
    }
  }

  if (result.allowed) return null;
  return NextResponse.json(
    { message: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
  );
}