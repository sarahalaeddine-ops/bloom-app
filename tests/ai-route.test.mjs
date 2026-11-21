// /api/ai (Nora inside the screens): consent, offline answers, the Anthropic request, answer checks
// and cloud accounts. The Anthropic API and Supabase are mocked.
import { test, before, afterEach } from "node:test";
import assert from "node:assert/strict";

var POST;
var realFetch = globalThis.fetch;
var realLog = console.log;
var realError = console.error;

before(async function () {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.NORA_TASK_MODEL;
  POST = (await import("../app/api/ai/route.js")).POST;
});

afterEach(function () {
  globalThis.fetch = realFetch;
  console.log = realLog;
  console.error = realError;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.NORA_REQUIRE_AUTH;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});

var ip = 0;
function req(body, token) {
  ip++;
  var headers = { "content-type": "application/json", "x-forwarded-for": "10.7." + Math.floor(ip / 250) + "." + (ip % 250) };
  if (token) headers.authorization = "Bearer " + token;
  return new Request("http://localhost/api/ai", { method: "POST", headers: headers, body: typeof body === "string" ? body : JSON.stringify(body) });
}

function quiet() {
  var lines = [];
  console.log = function (s) { lines.push(String(s)); };
  console.error = function () { lines.push(Array.from(arguments).join(" ")); };
  return lines;
}

function answer(obj, extra) {
  return { content: [{ type: "thinking", thinking: "" }, { type: "text", text: JSON.stringify(obj) }], stop_reason: "end_turn", model: "claude-opus-5-5", usage: { input_tokens: 10, output_tokens: 5 }, ...(extra || {}) };
}

function mockAnthropic(replies) {
  var calls = [];
  globalThis.fetch = async function (url, init) {
    calls.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) });
    var r = replies[Math.min(calls.length - 1, replies.length - 1)];
    return new Response(JSON.stringify(r.body), { status: r.status || 200, headers: { "content-type": "application/json" } });
  };
  return calls;
}

var BRIEF = { greeting: "Good morning, Lina", lines: ["Two doses left today.", "Scan tomorrow at 8."], tip: "Warm, salty meals can ease bloating." };

test("bad requests are refused before anything is sent", async function () {
  assert.equal((await POST(req("{oops"))).status, 400);
  assert.equal((await POST(req({ task: "poem", ai: true }))).status, 400);
  var res = await POST(req({ task: "results", ai: true, file: { type: "image/gif", data: "AAAA" } }));
  assert.equal(res.status, 400);
  assert.equal((await res.json()).field, "file");
});

test("without her AI consent, or without a key, nothing is sent and the app works offline", async function () {
  var calls = mockAnthropic([{ body: answer(BRIEF) }]);
  assert.deepEqual(await (await POST(req({ task: "brief", ai: false }))).json(), { offline: true, reason: "consent" });
  assert.deepEqual(await (await POST(req({ task: "brief", ai: true }))).json(), { offline: true, reason: "unavailable" });
  assert.equal(calls.length, 0);
});

test("Tell Nora flags her emergency words even offline", async function () {
  var data = await (await POST(req({ task: "log", ai: false, text: "I have severe pain and I'm short of breath" }))).json();
  assert.equal(data.urgent, true);
  assert.equal(data.offline, true);
});

test("briefing: Claude Opus 5.5, structured JSON answer, fallbacks on, checked answer returned", async function () {
  process.env.ANTHROPIC_API_KEY = "test-key";
  var logs = quiet();
  var calls = mockAnthropic([{ body: answer(BRIEF) }]);
  var res = await POST(req({ task: "brief", ai: true, lang: "fr", user: { name: "Lina", phase: "stimulation", stimDay: 7 }, context: { checkins: [{ date: "2026-11-20", mood: 3, note: "PRIVATE" }] } }));
  var data = await res.json();
  assert.equal(res.status, 200);
  assert.deepEqual(data.brief, BRIEF);
  var c = calls[0];
  assert.equal(c.url, "https://api.anthropic.com/v1/messages");
  assert.equal(c.headers["anthropic-version"], "2026-10-21");
  assert.equal(c.headers["anthropic-beta"], "server-side-fallback-2026-07-01");
  assert.equal(c.body.fallbacks, "default");
  assert.equal(c.body.model, "claude-opus-5-5");
  assert.equal(c.body.output_config.effort, "low");
  assert.equal(c.body.output_config.format.type, "json_schema");
  assert.equal(c.body.output_config.format.schema.additionalProperties, false);
  assert.equal(c.body.temperature, undefined);
  assert.equal(c.body.thinking, undefined, "Opus 5.5 always thinks adaptively");
  assert.match(c.body.system, /French/);
  assert.equal(JSON.stringify(c.body).indexOf("PRIVATE"), -1, "never her journal notes");
  var usage = logs.find(function (l) { return l.indexOf("nora_task") !== -1; });
  assert.ok(usage && usage.indexOf("Lina") === -1, "usage logs carry no content");
});

test("if the API rejects the fallback option, it retries once without it", async function () {
  process.env.ANTHROPIC_API_KEY = "test-key";
  quiet();
  var calls = mockAnthropic([{ status: 400, body: { type: "error", error: { type: "invalid_request_error" } } }, { body: answer(BRIEF) }]);
  var data = await (await POST(req({ task: "brief", ai: true }))).json();
  assert.deepEqual(data.brief, BRIEF);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].body.fallbacks, undefined);
  assert.equal(calls[1].headers["anthropic-beta"], undefined);
});

test("a refusal, a cut-off answer or broken JSON falls back offline instead of breaking the screen", async function () {
  process.env.ANTHROPIC_API_KEY = "test-key";
  quiet();
  mockAnthropic([{ body: answer({}, { stop_reason: "refusal", content: [] }) }]);
  assert.deepEqual(await (await POST(req({ task: "brief", ai: true }))).json(), { offline: true, reason: "failed" });
  mockAnthropic([{ body: answer(BRIEF, { stop_reason: "max_tokens" }) }]);
  assert.equal((await (await POST(req({ task: "brief", ai: true }))).json()).offline, true);
  mockAnthropic([{ body: { content: [{ type: "text", text: "not json" }], stop_reason: "end_turn", usage: {} } }]);
  assert.equal((await (await POST(req({ task: "brief", ai: true }))).json()).offline, true);
});

test("results: the photo goes as an image block and the numbers come back converted", async function () {
  process.env.ANTHROPIC_API_KEY = "test-key";
  quiet();
  var calls = mockAnthropic([{ body: answer({ readable: true, day: 8, e2: 3671, e2_unit: "pmol/L", lh: null, p4: null, p4_unit: "unknown", right: [18], left: [16], note: "Clear." }) }]);
  var data = await (await POST(req({ task: "results", ai: true, file: { type: "image/jpeg", data: "QUJD" } }))).json();
  assert.equal(data.results.e2, 1000);
  assert.deepEqual(data.results.right, [18]);
  assert.equal(calls[0].body.messages[0].content[0].type, "image");
  assert.equal(calls[0].body.output_config.effort, "medium");
});

test("cloud account: her synced check-ins and profile are used, not what the browser sent", async function () {
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://proj.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  quiet();
  var calls = [];
  var row = { consent: { ai: true }, user: { id: "u1", name: "Lina Haddad", phase: "tww" }, checkins: [{ date: "2026-11-18", mood: 4, anxiety: 2, hope: 5, symptoms: ["Cramping"] }] };
  globalThis.fetch = async function (url, init) {
    url = String(url);
    calls.push({ url: url, body: init && init.body ? JSON.parse(init.body) : null });
    function json(b) { return new Response(JSON.stringify(b), { status: 200, headers: { "content-type": "application/json" } }); }
    if (url.endsWith("/auth/v1/user")) return json({ id: "5f0c6a52-1c2b-4a57-9d3e-2b7c1e9f0a11", aud: "authenticated" });
    if (url.indexOf("/rest/v1/user_state") !== -1) return json([{ data: row }]);
    return json(answer(BRIEF));
  };
  var data = await (await POST(req({ task: "brief", ai: true, user: { name: "Mallory" }, context: { checkins: [{ date: "2026-11-20", mood: 0, symptoms: ["Nausea"] }] } }, "a.b.c"))).json();
  assert.deepEqual(data.brief, BRIEF);
  var text = calls.find(function (c) { return c.url.indexOf("anthropic") !== -1; }).body.messages[0].content[0].text;
  assert.match(text, /First name: Lina/);
  assert.match(text, /Two-week wait/);
  assert.match(text, /Cramping/);
  assert.equal(text.indexOf("Nausea"), -1);
  assert.equal(text.indexOf("Mallory"), -1);
});

test("NORA_REQUIRE_AUTH: no live AI without a verified account", async function () {
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.NORA_REQUIRE_AUTH = "1";
  var calls = mockAnthropic([{ body: answer(BRIEF) }]);
  assert.deepEqual(await (await POST(req({ task: "brief", ai: true }))).json(), { offline: true, reason: "account" });
  assert.equal(calls.length, 0);
});
