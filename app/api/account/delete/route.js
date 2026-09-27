import { createRateLimiter, clientIp } from "../../../../lib/rate-limit";
import { supabaseServerConfig, bearerToken, verifyUser, deleteUserState, adminDeleteUser } from "../../../../lib/supabase-server";

// Full erasure of a cloud account (GDPR Art. 17 / UAE PDPL; gap G4).
// 1. Verify her Supabase access token server-side: the user id comes from Supabase, never the client.
// 2. Delete her user_state row with her own token (RLS applies).
// 3. Hard-delete her auth.users row with the Admin API. This is the only use of
//    SUPABASE_SERVICE_ROLE_KEY, a server-only env var (never NEXT_PUBLIC_). The delete cascades to
//    every table that references auth.users (user_state, consent_events).
// The client then wipes Bloom's data from the device. Local-mode accounts never call this route.
//
// Not behind the proxy.js demo gate: it only acts for the holder of a valid Supabase session.
var MAX_BODY_CHARS = 1000;
var perIp = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

function fail(status, error, headers) {
  return Response.json({ error: error }, { status: status, headers: headers });
}

export async function POST(request) {
  var cfg = supabaseServerConfig();
  if (!cfg) return fail(404, "Not available");

  var hit = perIp.check(clientIp(request));
  if (!hit.ok) return fail(429, "Too many requests", { "Retry-After": String(hit.retryAfter) });

  // Explicit confirmation in the body, so a stray request can't erase an account.
  var body = null;
  try {
    var raw = await request.text();
    if (raw.length <= MAX_BODY_CHARS) body = JSON.parse(raw);
  } catch {
    body = null;
  }
  if (!body || body.confirm !== true) return fail(400, "Invalid request");

  var token = bearerToken(request);
  if (!token) return fail(401, "Not signed in");

  var serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error(JSON.stringify({ event: "account_delete_unavailable", reason: "SUPABASE_SERVICE_ROLE_KEY not set" }));
    return fail(503, "Account deletion is not available right now");
  }

  var v = await verifyUser(cfg, token);
  if (v.error === "invalid") return fail(401, "Not signed in");
  if (v.error) return fail(503, "Account deletion is not available right now");

  // Her synced data first (least privilege). If this fails the cascade below still removes it.
  var state = await deleteUserState(cfg, token, v.user.id);
  var account = await adminDeleteUser(cfg, serviceKey, v.user.id);
  if (account.error) {
    console.error(JSON.stringify({ event: "account_delete_failed", step: "auth_user", state_deleted: !!state.ok }));
    return fail(502, "Could not delete the account. Please try again.");
  }
  // No user id, email or IP in logs.
  console.log(JSON.stringify({ event: "account_deleted", state_deleted: !!state.ok }));
  return Response.json({ ok: true });
}
