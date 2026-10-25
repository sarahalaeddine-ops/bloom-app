import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { GET } from "../app/api/voice/route.js";
import { lineKey, TEST_LINE, filmLines, filmSequence } from "../lib/voice-lines.js";
import { SCENES } from "../lib/demo-film.js";

var realFetch = globalThis.fetch;
var ENV = ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "OPENAI_API_KEY", "OPENAI_TTS_VOICE", "BLOB_READ_WRITE_TOKEN"];

afterEach(function () {
  globalThis.fetch = realFetch;
  ENV.forEach(function (k) { delete process.env[k]; });
});

function get(query) { return GET(new Request("https://bloom.test/api/voice" + (query || ""))); }

// Stub network: Blob list returns `stored` (pathname → bytes), TTS returns a fake MP3.
function stubNetwork(stored) {
  var calls = [];
  globalThis.fetch = async function (url, init) {
    url = String(url);
    init = init || {};
    calls.push({ url: url, method: init.method || "GET", body: init.body, headers: init.headers || {} });
    if (url.indexOf("https://vercel.com/api/blob?") === 0) {
      var prefix = new URL(url).searchParams.get("prefix");
      var blobs = stored[prefix] ? [{ pathname: prefix, url: "https://store.blob/" + prefix }] : [];
      return Response.json({ blobs: blobs, hasMore: false });
    }
    if (url.indexOf("https://store.blob/") === 0) return new Response(stored[url.slice("https://store.blob/".length)]);
    if (url.indexOf("https://vercel.com/api/blob/?") === 0) return Response.json({ url: "https://store.blob/x" });
    if (url.indexOf("https://api.elevenlabs.io/") === 0 || url === "https://api.openai.com/v1/audio/speech") return new Response(new Uint8Array([73, 68, 51]));
    return new Response("unexpected", { status: 500 });
  };
  return calls;
}

test("every subtitle in the film, and the test line, has a stable key", function () {
  var lines = filmLines();
  assert.equal(lines.get(lineKey(TEST_LINE)), TEST_LINE);
  var says = SCENES.reduce(function (n, s) { return n + s.steps.filter(function (a) { return a.say; }).length; }, 0);
  assert.ok(lines.size >= says * 0.9 && lines.size <= says + 1, "one entry per distinct line");
  assert.match(lineKey("hello"), /^[0-9a-f]{8}$/);
  assert.equal(lineKey("hello"), lineKey("hello"));
  assert.notEqual(lineKey("hello"), lineKey("hello."));
  var quick = SCENES.find(function (s) { return s.id === "quick"; }).steps.find(function (a) { return a.voice; });
  assert.equal(lines.get(lineKey(quick.voice)), quick.voice, "the spoken version is what gets voiced");
});

test("reports whether a studio voice is set up", async function () {
  assert.deepEqual(await (await get()).json(), { available: false, provider: null });
  process.env.OPENAI_API_KEY = "sk-test";
  assert.deepEqual(await (await get()).json(), { available: true, provider: "openai" });
  process.env.ELEVENLABS_API_KEY = "el-test";
  assert.deepEqual(await (await get()).json(), { available: true, provider: "elevenlabs" }, "ElevenLabs preferred");
});

test("without a provider, or for a line that isn't in the film, nothing is voiced", async function () {
  var calls = stubNetwork({});
  assert.equal((await get("?line=" + lineKey(TEST_LINE))).status, 503);
  process.env.ELEVENLABS_API_KEY = "el-test";
  assert.equal((await get("?line=" + lineKey("Say something else entirely"))).status, 404);
  assert.equal((await get("?line=../../x")).status, 404);
  assert.equal(calls.length, 0, "no provider call for refused lines");
});

test("first request voices the line with ElevenLabs and stores it privately", async function () {
  process.env.ELEVENLABS_API_KEY = "el-test";
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_STORE_secret";
  var calls = stubNetwork({});
  var key = lineKey(TEST_LINE);
  var res = await get("?line=" + key);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "audio/mpeg");
  assert.deepEqual(new Uint8Array(await res.arrayBuffer()), new Uint8Array([73, 68, 51]));
  var tts = calls.find(function (c) { return c.url.indexOf("elevenlabs") !== -1; });
  assert.match(tts.url, /text-to-speech\/pFZP5JQG7iQjIQuC4Bku\?output_format=mp3_44100_128/);
  assert.equal(tts.headers["xi-api-key"], "el-test");
  var body = JSON.parse(tts.body);
  assert.equal(body.text, TEST_LINE);
  assert.equal(body.model_id, "eleven_multilingual_v2");
  assert.ok(body.voice_settings.stability < 0.5 && body.voice_settings.style > 0, "expressive, not flat");
  var put = calls.find(function (c) { return c.method === "PUT"; });
  assert.match(put.url, new RegExp("pathname=voice%2Fel-v3-pFZP5JQG7iQjIQuC4Bku%2F" + key + "\\.mp3"));
  assert.equal(put.headers["x-vercel-blob-access"], "private");
});

test("later requests are served from the store without calling the provider", async function () {
  process.env.ELEVENLABS_API_KEY = "el-test";
  process.env.ELEVENLABS_VOICE_ID = "voice42";
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_STORE_secret";
  var key = lineKey(TEST_LINE);
  var stored = {};
  stored["voice/el-v3-voice42/" + key + ".mp3"] = new Uint8Array([1, 2, 3]);
  var calls = stubNetwork(stored);
  var res = await get("?line=" + key);
  assert.deepEqual(new Uint8Array(await res.arrayBuffer()), new Uint8Array([1, 2, 3]));
  assert.equal(calls.filter(function (c) { return c.url.indexOf("elevenlabs") !== -1; }).length, 0);
});

test("OpenAI is used when it is the only key, with Bloom's narrator style", async function () {
  process.env.OPENAI_API_KEY = "sk-test";
  var calls = stubNetwork({});
  var res = await get("?line=" + lineKey(TEST_LINE));
  assert.equal(res.status, 200);
  var body = JSON.parse(calls.find(function (c) { return c.url.indexOf("openai") !== -1; }).body);
  assert.equal(body.model, "gpt-4o-mini-tts");
  assert.equal(body.voice, "coral");
  assert.equal(body.input, TEST_LINE);
  assert.match(body.instructions, /warm, caring friend/);
  assert.match(body.instructions, /British accent/);
});

test("a provider error is a 502, not a crash", async function () {
  process.env.ELEVENLABS_API_KEY = "el-test";
  globalThis.fetch = async function () { return new Response("quota exceeded", { status: 401 }); };
  var res = await get("?line=" + lineKey(TEST_LINE));
  assert.equal(res.status, 502);
  assert.deepEqual(await res.json(), { error: "Voice unavailable" });
});

test("each film line is voiced with the lines around it, so it flows like one story", async function () {
  process.env.ELEVENLABS_API_KEY = "el-test";
  var calls = stubNetwork({});
  var seq = filmSequence();
  await get("?line=" + lineKey(seq[1]));
  var body = JSON.parse(calls.find(function (c) { return c.url.indexOf("elevenlabs") !== -1; }).body);
  assert.equal(body.text, seq[1]);
  assert.equal(body.previous_text, seq[0]);
  assert.equal(body.next_text, seq[2]);
});

test("a voice that isn't on her account falls back to the next British voice; a bad key does not", async function () {
  process.env.ELEVENLABS_API_KEY = "el-test";
  var tried = [];
  globalThis.fetch = async function (url) {
    url = String(url);
    if (url.indexOf("elevenlabs") === -1) return new Response("x", { status: 500 });
    tried.push(url.split("text-to-speech/")[1].split("?")[0]);
    if (tried.length === 1) return Response.json({ detail: { status: "voice_not_found" } }, { status: 404 });
    return new Response(new Uint8Array([9]));
  };
  assert.equal((await get("?line=" + lineKey(TEST_LINE))).status, 200);
  assert.deepEqual(tried, ["pFZP5JQG7iQjIQuC4Bku", "Xb7hH8MSUJpSbSDYk0k2"]);
  tried = [];
  globalThis.fetch = async function (url) { tried.push(String(url)); return Response.json({ detail: "invalid_api_key" }, { status: 401 }); };
  assert.equal((await get("?line=" + lineKey(TEST_LINE))).status, 502);
  assert.equal(tried.length, 1, "no retries on a key or quota error");
});
