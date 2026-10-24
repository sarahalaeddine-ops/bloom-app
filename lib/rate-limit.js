// Tiny fixed-window rate limiter for API routes.
// State lives in this server instance's memory: on Vercel every function instance (and every
// cold start) has its own counters, so limits are per instance, not global. Good enough to stop
// casual abuse of the demo; move to a shared store (Supabase table or a KV) for real quotas.

export function createRateLimiter(opts) {
  var limit = opts.limit;
  var windowMs = opts.windowMs;
  var maxKeys = opts.maxKeys || 10000;
  var hits = new Map(); // key -> { count, reset }

  function prune(now) {
    hits.forEach(function (e, k) { if (e.reset <= now) hits.delete(k); });
    // Still full (many active keys): drop the oldest entries so memory stays bounded.
    var it = hits.keys();
    while (hits.size >= maxKeys) hits.delete(it.next().value);
  }

  return {
    // Counts one hit for `key`. Returns { ok, remaining, retryAfter (seconds) }.
    check: function (key, now) {
      var t = now || Date.now();
      var e = hits.get(key);
      if (!e || e.reset <= t) {
        if (hits.size >= maxKeys) prune(t);
        e = { count: 0, reset: t + windowMs };
        hits.set(key, e);
      }
      e.count++;
      return { ok: e.count <= limit, remaining: Math.max(0, limit - e.count), retryAfter: Math.max(1, Math.ceil((e.reset - t) / 1000)) };
    },
    size: function () { return hits.size; },
  };
}

// Client IP for rate limiting. Behind Vercel the platform sets x-forwarded-for from the connecting
// client; behind other proxies it may be client-controlled, so use it for rate limits only.
export function clientIp(request) {
  var fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
