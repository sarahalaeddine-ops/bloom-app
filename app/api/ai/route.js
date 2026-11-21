import { buildTask, checkAnswer, requestError, sanitizeContext, AI_PROMPT_VERSION, MAX_FILE_B64 } from "../../../lib/ai-tasks";
import { noraProfile, detectEmergency } from "../../../lib/nora";
import { resolveCaller, limited, aiAllowedFor, callTask, noteUsage, liveAiWithoutAccount, withinDailyLimit } from "../../../lib/ai-server";
import { createRateLimiter, clientIp } from "../../../lib/rate-limit";
import { withCors, preflight } from "../../../lib/cors";

// Nora inside the screens (lib/ai-tasks.js): POST { task, lang, ai, user, context, ...task fields }
//   task "brief"   -> { brief: { greeting, lines[], tip } }
//   task "log"     -> { log: { mood, anxiety, hope, feelings[], symptoms[], warning, reply } }  + text
//   task "results" -> { results: { readable, day, e2, lh, p4, right[], left[], converted, note } } + file
//   task "prep"    -> { prep: { questions[], summary[] } }                                     + appt
// When the AI can't answer (no key, no consent, offline, an error) it returns { offline: true,
// reason } with status 200 and the app falls back to what it can do without AI. "log" also returns
// urgent: true when her words match the emergency terms, even offline.
//
// Who is asking, consent and NORA_REQUIRE_AUTH work exactly as in app/api/nora/route.js. For a
// signed-in cloud user her own synced profile, check-ins, scans and schedule are used instead of
// what the client sent. Nothing she sends is stored or logged here.
export const maxDuration = 90;

var MAX_BODY_CHARS = MAX_FILE_B64 + 100000;
var TIMEOUTS = { brief: 30000, log: 30000, results: 70000, prep: 45000 };

// Per-IP and per-account limits, per server instance (lib/rate-limit.js).
var perMinute = createRateLimiter({ limit: 8, windowMs: 60 * 1000 });
var perDay = createRateLimiter({ limit: 80, windowMs: 24 * 60 * 60 * 1000 });
var userPerMinute = createRateLimiter({ limit: 8, windowMs: 60 * 1000 });
var userPerDay = createRateLimiter({ limit: 80, windowMs: 24 * 60 * 60 * 1000 });

function logUsage(fields) {
  // Token counts and timings only: never content, profile fields, images or IPs.
  console.log(JSON.stringify({ event: "nora_task", prompt: AI_PROMPT_VERSION, ...fields }));
}

function offline(reason, extra) {
  return Response.json({ offline: true, reason: reason, ...(extra || {}) });
}

export function OPTIONS(request) {
  return preflight(request);
}

export async function POST(request) {
  return withCors(request, await handle(request));
}

function storedList(stored, key, fallback) {
  return stored && Array.isArray(stored[key]) ? stored[key] : fallback;
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

  var task = body.task;
  var bad = requestError(task, body);
  if (bad) return Response.json({ error: "Invalid request", field: bad }, { status: bad === "too-large" ? 413 : 400 });
  var lang = ["en", "ar", "fr"].indexOf(body.lang) !== -1 ? body.lang : "en";

  // Her own words may describe an emergency: say so whatever happens next.
  var urgent = task === "log" && !!detectEmergency(body.text);
  var flags = urgent ? { urgent: true } : {};

  var ipHit = limited([perMinute, perDay], clientIp(request));
  if (ipHit) return Response.json({ error: "Too many requests", ...flags }, { status: 429, headers: { "Retry-After": String(ipHit.retryAfter) } });

  var caller = await resolveCaller(request);
  if (caller.error === "invalid") return Response.json({ error: "Not signed in", ...flags }, { status: 401 });
  if (caller.error) return offline("unavailable", flags);

  var user = body.user;
  var context = body.context;
  if (caller.mode === "user") {
    var userHit = limited([userPerMinute, userPerDay], "u:" + caller.userId);
    if (userHit) return Response.json({ error: "Too many requests", ...flags }, { status: 429, headers: { "Retry-After": String(userHit.retryAfter) } });
    var st = caller.stored;
    if (st.user && typeof st.user === "object") user = { ...noraProfile(st.user, { meds: st.my_meds, appts: st.my_appts }), demo: false };
    else if (user && typeof user === "object") user = { ...user, demo: false };
    // Synced logs win; without cloud sync her row holds only her consent, so use what the app sent.
    var ctx = context && typeof context === "object" ? context : {};
    context = { ...ctx, checkins: storedList(st, "checkins", ctx.checkins), scans: storedList(st, "scans", ctx.scans) };
  }

  // Without a verified account, live AI only for the investor demo (lib/ai-server.js).
  if (caller.mode !== "user" && !(await liveAiWithoutAccount(request))) return offline("account", flags);
  if (!aiAllowedFor(caller, body)) return offline("consent", flags);
  if (!process.env.ANTHROPIC_API_KEY) return offline("unavailable", flags);

  if (!(await withinDailyLimit(caller, "ai_" + task))) {
    return Response.json({ error: "Too many requests", ...flags }, { status: 429, headers: { "Retry-After": "3600" } });
  }

  var req = buildTask(task, { user: user, context: sanitizeContext(context), text: body.text, file: body.file, appt: body.appt }, lang);
  var started = Date.now();
  try {
    var out = await callTask({ system: req.system, content: req.content, schema: req.schema, effort: req.effort, timeoutMs: TIMEOUTS[task] });
    var u = out.usage;
    logUsage({
      task: task, model: out.model, lang: lang, caller: caller.mode, ms: Date.now() - started,
      input_tokens: u.input_tokens, output_tokens: u.output_tokens, cache_read_input_tokens: u.cache_read_input_tokens,
    });
    var answer = checkAnswer(task, out.json, { urgent: urgent });
    if (!answer) return offline("failed", flags);
    await noteUsage("ai_" + task);
    return Response.json({ [task]: answer, ...flags });
  } catch (err) {
    console.error("Nora task error:", task, err.name === "TimeoutError" ? "timeout" : err.message);
    logUsage({ task: task, lang: lang, caller: caller.mode, ms: Date.now() - started, failed: true });
    return offline("failed", flags);
  }
}
