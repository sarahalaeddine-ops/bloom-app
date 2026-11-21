// Server-only helpers shared by Bloom's AI routes (app/api/nora, app/api/ai): who is asking, rate
// limits, and the Anthropic call for the AI features. Anthropic is called with plain fetch, like
// every third-party API in Bloom (docs/sa6/architecture.md: minimal dependencies).
import { supabaseServerConfig, bearerToken, verifyUser, readUserState, countUsage, takeQuota } from "./supabase-server";
import { DEMO, hasGateCookie } from "./gates";

// Resolves the caller. Returns { mode: "local" } (no token, or cloud mode off on the server),
// { mode: "user", userId, stored } or { error: "invalid" | "unavailable" }.
export async function resolveCaller(request) {
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

// check: [perMinute, perDay] limiters. Returns the blocking hit, or null when allowed.
export function limited(check, key) {
  var minute = check[0].check(key);
  var day = minute.ok ? check[1].check(key) : minute;
  return !minute.ok || !day.ok ? day : null;
}

// Pilot measurement: one more use of a feature today, in total (no user, no content). Only when the
// server has Supabase and its service-role key; otherwise nothing happens.
export function noteUsage(event) {
  return countUsage(supabaseServerConfig(), process.env.SUPABASE_SERVICE_ROLE_KEY, event);
}

// Live AI without an account only for the investor demo (its own password cookie). The tester
// password is shared widely, so a caller with only that cookie and no verified account gets
// offline answers; real testers always have an account (Bearer token).
export async function liveAiWithoutAccount(request) {
  return !requireAuth() && (await hasGateCookie(request, DEMO));
}

// Per-account daily AI allowance, kept in the database so it holds across server instances.
// Anyone can create an account with the public anon key, so this is what caps one account's AI
// spend. Generous for real use. Returns false only when the account is over today's limit.
export var DAILY_LIMITS = { nora_chat: 120, ai_brief: 12, ai_log: 30, ai_results: 15, ai_prep: 20 };

export async function withinDailyLimit(caller, kind) {
  if (caller.mode !== "user") return true;
  var ok = await takeQuota(supabaseServerConfig(), process.env.SUPABASE_SERVICE_ROLE_KEY, caller.userId, kind, DAILY_LIMITS[kind] || 20);
  if (ok === null) console.error(JSON.stringify({ event: "ai_quota_unchecked", kind: kind }));
  return ok !== false;
}

// NORA_REQUIRE_AUTH=1: live AI for verified accounts only.
export function requireAuth() {
  var v = (process.env.NORA_REQUIRE_AUTH || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

// Her consent to AI processing (G11). Cloud: her stored consent, and the client must not have opted
// out. Local/demo: the client's own flag (the demo persona always sends it).
export function aiAllowedFor(caller, body) {
  if (caller.mode === "user") {
    var c = caller.stored.consent;
    return !!c && c.ai === true && body.ai !== false;
  }
  return body.ai === true;
}

// ── Anthropic call for the AI features ─────────────────────────────────
// Claude Opus 5.5 by default (NORA_TASK_MODEL to change it), JSON answers via structured outputs,
// adaptive thinking (always on for this model) with the effort each task sets. Server-side
// fallbacks are on: if the model declines a request, the API retries it on a fallback model in the
// same call. If the API rejects the fallback option itself, the call is retried once without it.
export var TASK_MODEL = "claude-opus-5-5";
var API_URL = "https://api.anthropic.com/v1/messages";
var FALLBACK_BETA = "server-side-fallback-2026-07-01";

async function post(key, body, withFallback, timeoutMs) {
  var headers = { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2026-10-21" };
  if (withFallback) headers["anthropic-beta"] = FALLBACK_BETA;
  var payload = withFallback ? { ...body, fallbacks: "default" } : body;
  var res = await fetch(API_URL, { method: "POST", headers: headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(timeoutMs) });
  var data = await res.json().catch(function () { return null; });
  return { res: res, data: data };
}

// Returns { json, usage, model, stop_reason } or throws an Error whose message has no content.
export async function callTask(opts) {
  var key = process.env.ANTHROPIC_API_KEY;
  var body = {
    model: opts.model || process.env.NORA_TASK_MODEL || TASK_MODEL,
    max_tokens: opts.maxTokens || 8000,
    system: opts.system,
    messages: [{ role: "user", content: opts.content }],
    output_config: { effort: opts.effort || "medium", format: { type: "json_schema", schema: opts.schema } },
  };
  var r = await post(key, body, true, opts.timeoutMs || 30000);
  if (r.res.status === 400) r = await post(key, body, false, opts.timeoutMs || 30000);
  var data = r.data;
  if (!r.res.ok || !data) throw new Error("API error " + r.res.status + (data && data.error && data.error.type ? " (" + data.error.type + ")" : ""));
  // Always check why it stopped before reading the answer: a refusal or a cut-off answer may not
  // match the schema.
  if (data.stop_reason === "refusal") throw new Error("refusal");
  if (data.stop_reason === "max_tokens") throw new Error("max_tokens");
  var text = (data.content || []).filter(function (c) { return c.type === "text"; }).map(function (c) { return c.text; }).join("");
  var json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("bad json");
  }
  return { json: json, usage: data.usage || {}, model: data.model, stop_reason: data.stop_reason };
}
