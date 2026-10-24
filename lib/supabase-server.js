// Server-side Supabase helpers for route handlers. Plain fetch against the Auth (GoTrue) and REST
// (PostgREST) APIs, so no extra packages and nothing here runs in the browser.
//
// - verifyUser: asks Supabase Auth who owns an access token (never trust a user id from the client).
// - readUserState / deleteUserState: act on the user's own `user_state` row WITH HER TOKEN, so
//   row-level security still applies on the server.
// - adminDeleteUser: the only call that uses the service-role key (passed in by the caller, read
//   from a server-only env var). Used by the account-erasure route.
//
// Every function returns a small result object instead of throwing, and never logs tokens or ids.

var TIMEOUT_MS = 8000;
var MAX_TOKEN_CHARS = 8192;
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// A JWT: three base64url parts. Anything else is rejected before it reaches Supabase.
var JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

// Cloud mode on the server: the same public URL + anon/publishable key the browser uses.
export function supabaseServerConfig() {
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  var anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey || !/^https?:\/\//.test(url)) return null;
  return { url: url.replace(/\/+$/, ""), anonKey: anonKey };
}

// Returns null when there is no Bearer header, "" when there is one but it isn't a plausible JWT,
// otherwise the token.
export function bearerToken(request) {
  var header = request.headers.get("authorization");
  if (!header || header.slice(0, 7).toLowerCase() !== "bearer ") return null;
  var token = header.slice(7).trim();
  return token.length <= MAX_TOKEN_CHARS && JWT_RE.test(token) ? token : "";
}

export function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

// New-format keys (sb_publishable_…, sb_secret_…) are not JWTs and go only in the apikey header;
// legacy JWT keys are also sent as the Bearer token (same rule as supabase-js).
function keyHeaders(key) {
  var headers = { apikey: key };
  if (!/^sb_(publishable|secret)_/.test(key)) headers.Authorization = "Bearer " + key;
  return headers;
}

function userHeaders(cfg, token) {
  return { apikey: cfg.anonKey, Authorization: "Bearer " + token };
}

// { user: { id } } | { error: "invalid" } (bad, expired or revoked token; deleted user)
//                  | { error: "unavailable" } (Supabase down, timeout, rate limited)
export async function verifyUser(cfg, token) {
  try {
    var res = await fetch(cfg.url + "/auth/v1/user", { headers: userHeaders(cfg, token), cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (res.status === 429 || res.status >= 500) return { error: "unavailable" };
    if (!res.ok) return { error: "invalid" };
    var data = await res.json();
    if (!data || !isUuid(data.id)) return { error: "invalid" };
    return { user: { id: data.id } };
  } catch {
    return { error: "unavailable" };
  }
}

function stateUrl(cfg, userId, select) {
  return cfg.url + "/rest/v1/user_state?user_id=eq." + encodeURIComponent(userId) + (select ? "&select=" + select : "");
}

// { data: object | null } (null = no row yet) | { error: "unavailable" }
export async function readUserState(cfg, token, userId) {
  if (!isUuid(userId)) return { error: "unavailable" };
  try {
    var res = await fetch(stateUrl(cfg, userId, "data"), {
      headers: { ...userHeaders(cfg, token), Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { error: "unavailable" };
    var rows = await res.json();
    var row = Array.isArray(rows) ? rows[0] : null;
    return { data: row && row.data && typeof row.data === "object" ? row.data : null };
  } catch {
    return { error: "unavailable" };
  }
}

// { ok: true } | { error: "failed" }
export async function deleteUserState(cfg, token, userId) {
  if (!isUuid(userId)) return { error: "failed" };
  try {
    var res = await fetch(stateUrl(cfg, userId), {
      method: "DELETE",
      headers: { ...userHeaders(cfg, token), Prefer: "return=minimal" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.ok ? { ok: true } : { error: "failed" };
  } catch {
    return { error: "failed" };
  }
}

// Hard-deletes the auth.users row (cascades to every table that references it).
// { ok: true } (also when the user is already gone) | { error: "failed" }
export async function adminDeleteUser(cfg, serviceKey, userId) {
  if (!isUuid(userId) || !serviceKey) return { error: "failed" };
  try {
    var res = await fetch(cfg.url + "/auth/v1/admin/users/" + userId, {
      method: "DELETE",
      headers: { ...keyHeaders(serviceKey), "Content-Type": "application/json" },
      body: JSON.stringify({ should_soft_delete: false }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) return { ok: true };
    if (res.status === 404) {
      // Only "this user doesn't exist" counts as done, not a 404 from a wrong URL.
      var body = await res.json().catch(function () { return null; });
      if (body && body.error_code === "user_not_found") return { ok: true };
    }
    return { error: "failed" };
  } catch {
    return { error: "failed" };
  }
}
