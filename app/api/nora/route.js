import { buildSystemPrompt, demoReply, detectEmergency, emergencyReply, rateLimitedReply, sanitizeUser, noraProfile, NORA_PROMPT_VERSION } from "../../../lib/nora";
import { createRateLimiter, clientIp } from "../../../lib/rate-limit";
import { supabaseServerConfig, bearerToken, verifyUser, readUserState } from "../../../lib/supabase-server";
import { withCors, preflight } from "../../../lib/cors";

// Nora chat. Calls the Anthropic Messages API server-side so the key never reaches the browser.
// Without ANTHROPIC_API_KEY, or when the API fails or times out, it answers with scripted demo
// replies (lib/nora.js), so the demo never breaks.
//
// Who is asking (G1):
// - Signed-in cloud user (Authorization: Bearer <Supabase access token>): the token is verified with
//   Supabase Auth, and her cycle context is read from her own user_state row with her token (RLS
//   applies). Client-sent profile fields are ignored when her synced profile exists.
// - Local / demo mode (no token): the client-sent profile is used after sanitising, behind the
//   proxy.js demo gate.
//
// Consent (G11): the Anthropic call only happens with her consent to Nora's AI processing. Cloud:
// user_state.data.consent.ai must be true (and the client must not have opted out). Local/demo:
// the client sends ai: true (the demo persona always does). Otherwise Nora answers offline.
//
// Native app (docs/sa6/app-store.md): the app calls this route cross-origin with a Bearer token.
// proxy.js lets Bearer requests and CORS preflights through the demo gate; lib/cors.js allows only
// the Capacitor origins. NORA_REQUIRE_AUTH=1 makes live AI verified-accounts-only: callers without
// a verified Supabase session (local/demo mode, including the web demo) get offline answers.
var DEFAULT_MODEL = "claude-sonnet-4-6";
var MAX_BODY_CHARS = 64000;
var MAX_TURNS = 20;
var MAX_CHARS_PER_TURN = 4000;
var MAX_TOKENS = 500;
var TIMEOUT_MS = 20000;

// Per-IP limits, per server instance (see lib/rate-limit.js).
var perMinute = createRateLimiter({ limit: 10, windowMs: 60 * 1000 });
var perDay = createRateLimiter({ limit: 200, windowMs: 24 * 60 * 60 * 1000 });
// Per signed-in account, on top of the per-IP limits (also per instance until G2 is done).
var userPerMinute = createRateLimiter({ limit: 10, windowMs: 60 * 1000 });
var userPerDay = createRateLimiter({ limit: 200, windowMs: 24 * 60 * 60 * 1000 });

// Resolves the caller. Returns { mode: "local" } (no token, or cloud mode off on the server),
// { mode: "user", userId, stored } or { error: "invalid" | "unavailable" }.
async function resolveCaller(request) {
  var cfg = supabaseServerConfig();
  var token = bearerToken(request);
  if (token === null) return { mode: "local" };
  // A Bearer header passes the demo gate, so without Supabase on the server it can't be verified:
  // refuse it rather than treat the caller as a local demo user.
  if (!cfg) return { error: "invalid" };
  if (!token) return { error: "invalid" };
  var v = await verifyUser(cfg, token);
  if (v.error) return { error: v.error };
  var st = await readUserState(cfg, token, v.user.id);
  if (st.error) return { error: "unavailable" };
  return { mode: "user", userId: v.user.id, stored: st.data || {} };
}

function limited(check, key) {
  var minute = check[0].check(key);
  var day = minute.ok ? check[1].check(key) : minute;
  return !minute.ok || !day.ok ? day : null;
}

function requireAuth() {
  var v = (process.env.NORA_REQUIRE_AUTH || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function logUsage(fields) {
  // Token counts and timings only: never message content, profile fields or IPs.
  console.log(JSON.stringify({ event: "nora_usage", prompt: NORA_PROMPT_VERSION, ...fields }));
}

export function OPTIONS(request) {
  return preflight(request);
}

export async function POST(request) {
  return withCors(request, await handle(request));
}

async function handle(request) {
  var raw;
  try {
    raw = await request.text();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (raw.length > MAX_BODY_CHARS) return Response.json({ error: "Request too large" }, { status: 413 });

  var body;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid request" }, { status: 400 });

  var lang = ["en", "ar", "fr"].indexOf(body.lang) !== -1 ? body.lang : "en";

  var messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(function (m) { return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim(); })
    .slice(-MAX_TURNS)
    .map(function (m) { return { role: m.role, content: m.content.slice(0, MAX_CHARS_PER_TURN) }; });

  // The API requires the conversation to start with a user turn.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return Response.json({ error: "No message" }, { status: 400 });

  var last = messages[messages.length - 1].content;
  var emergency = detectEmergency(last);
  var urgent = !!emergency;
  var flags = urgent ? { urgent: true } : {};

  // Never block an emergency: the scripted clinic referral costs nothing and holds no personal data.
  function tooMany(hit) {
    if (emergency) return Response.json({ text: emergencyReply(emergency, lang), demo: true, urgent: true });
    return Response.json(
      { error: "Too many requests", text: rateLimitedReply(lang), demo: true },
      { status: 429, headers: { "Retry-After": String(hit.retryAfter) } }
    );
  }

  var ipHit = limited([perMinute, perDay], clientIp(request));
  if (ipHit) return tooMany(ipHit);

  var caller = await resolveCaller(request);
  if (caller.error === "invalid") {
    if (emergency) return Response.json({ text: emergencyReply(emergency, lang), demo: true, urgent: true });
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }
  if (caller.error) {
    // Supabase unreachable: we can't tell who she is, so answer offline without any profile.
    return Response.json({ text: demoReply(last, lang), demo: true, ...flags });
  }

  var input = body.user;
  if (caller.mode === "user") {
    var userHit = limited([userPerMinute, userPerDay], "u:" + caller.userId);
    if (userHit) return tooMany(userHit);
    // Her own synced profile wins over anything the client sent. No synced profile (cloud sync
    // off): fall back to the client's fields, sanitised. Never the demo persona for an account.
    var synced = caller.stored.user;
    input = synced && typeof synced === "object" ? noraProfile(synced) : body.user;
    if (input && typeof input === "object") input = { ...input, demo: false };
  }

  // Demo persona values only when the client asks for the demo persona; a real user's unknown
  // fields stay unknown (G15).
  var profile = sanitizeUser(input);
  var offline = function () { return demoReply(last, lang, { persona: profile.persona }); };

  // Live AI only for verified accounts when NORA_REQUIRE_AUTH is on.
  if (caller.mode !== "user" && requireAuth()) return Response.json({ text: offline(), demo: true, authRequired: true, ...flags });

  var consent = caller.mode === "user" ? caller.stored.consent : null;
  var aiAllowed = caller.mode === "user" ? !!consent && consent.ai === true && body.ai !== false : body.ai === true;
  if (!aiAllowed) return Response.json({ text: offline(), demo: true, aiOff: true, ...flags });

  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ text: offline(), demo: true, ...flags });

  var model = process.env.NORA_MODEL || DEFAULT_MODEL;
  var started = Date.now();
  try {
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: MAX_TOKENS,
        // Automatic prompt caching: the breakpoint follows the end of the conversation, so later turns
        // re-read the system prompt + history at the cache price. Prefixes under the model's minimum
        // (1,024 tokens on Sonnet 4.6) are simply not cached, with no error.
        cache_control: { type: "ephemeral" },
        system: buildSystemPrompt(input, lang),
        messages: messages,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    var data = await res.json();
    if (!res.ok) throw new Error("API error " + res.status + (data && data.error && data.error.type ? " (" + data.error.type + ")" : ""));
    var usage = data.usage || {};
    logUsage({
      model: model, lang: lang, caller: caller.mode, turns: messages.length, urgent: urgent, ms: Date.now() - started, stop_reason: data.stop_reason,
      input_tokens: usage.input_tokens, output_tokens: usage.output_tokens,
      cache_creation_input_tokens: usage.cache_creation_input_tokens, cache_read_input_tokens: usage.cache_read_input_tokens,
    });
    var text = (data.content || []).filter(function (c) { return c.type === "text"; }).map(function (c) { return c.text; }).join("\n").trim();
    if (!text) return Response.json({ text: offline(), demo: true, ...flags });
    return Response.json({ text: text, ...flags });
  } catch (err) {
    console.error("Nora API error:", err.name === "TimeoutError" ? "timeout" : err.message);
    logUsage({ model: model, lang: lang, caller: caller.mode, turns: messages.length, urgent: urgent, ms: Date.now() - started, fallback: true });
    return Response.json({ text: offline(), demo: true, ...flags });
  }
}
