import { buildSystemPrompt, demoReply, detectEmergency, emergencyReply, rateLimitedReply, sanitizeUser, NORA_PROMPT_VERSION } from "../../../lib/nora";
import { createRateLimiter, clientIp } from "../../../lib/rate-limit";

// Nora chat. Calls the Anthropic Messages API server-side so the key never reaches the browser.
// Without ANTHROPIC_API_KEY, or when the API fails or times out, it answers with scripted demo
// replies (lib/nora.js), so the demo never breaks.
var DEFAULT_MODEL = "claude-sonnet-4-6";
var MAX_BODY_CHARS = 64000;
var MAX_TURNS = 20;
var MAX_CHARS_PER_TURN = 4000;
var MAX_TOKENS = 500;
var TIMEOUT_MS = 20000;

// Per-IP limits, per server instance (see lib/rate-limit.js).
var perMinute = createRateLimiter({ limit: 10, windowMs: 60 * 1000 });
var perDay = createRateLimiter({ limit: 200, windowMs: 24 * 60 * 60 * 1000 });

function logUsage(fields) {
  // Token counts and timings only: never message content, profile fields or IPs.
  console.log(JSON.stringify({ event: "nora_usage", prompt: NORA_PROMPT_VERSION, ...fields }));
}

export async function POST(request) {
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

  var ip = clientIp(request);
  var minute = perMinute.check(ip);
  var day = minute.ok ? perDay.check(ip) : minute;
  if (!minute.ok || !day.ok) {
    // Never block an emergency: the scripted clinic referral costs nothing.
    if (emergency) return Response.json({ text: emergencyReply(emergency, lang), demo: true, urgent: true });
    return Response.json(
      { error: "Too many requests", text: rateLimitedReply(lang), demo: true },
      { status: 429, headers: { "Retry-After": String(day.retryAfter) } }
    );
  }

  // Demo persona values only when the client asks for the demo persona; a real user's unknown
  // fields stay unknown (G15).
  var profile = sanitizeUser(body.user);
  var offline = function () { return demoReply(last, lang, { persona: profile.persona }); };

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
        system: buildSystemPrompt(body.user, lang),
        messages: messages,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    var data = await res.json();
    if (!res.ok) throw new Error("API error " + res.status + (data && data.error && data.error.type ? " (" + data.error.type + ")" : ""));
    var usage = data.usage || {};
    logUsage({
      model: model, lang: lang, turns: messages.length, urgent: urgent, ms: Date.now() - started, stop_reason: data.stop_reason,
      input_tokens: usage.input_tokens, output_tokens: usage.output_tokens,
      cache_creation_input_tokens: usage.cache_creation_input_tokens, cache_read_input_tokens: usage.cache_read_input_tokens,
    });
    var text = (data.content || []).filter(function (c) { return c.type === "text"; }).map(function (c) { return c.text; }).join("\n").trim();
    if (!text) return Response.json({ text: offline(), demo: true, ...flags });
    return Response.json({ text: text, ...flags });
  } catch (err) {
    console.error("Nora API error:", err.name === "TimeoutError" ? "timeout" : err.message);
    logUsage({ model: model, lang: lang, turns: messages.length, urgent: urgent, ms: Date.now() - started, fallback: true });
    return Response.json({ text: offline(), demo: true, ...flags });
  }
}
