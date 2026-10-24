// Studio voice-over for the investor demo. GET /api/voice → { available, provider };
// GET /api/voice?line=<key> → MP3 of that demo line (lib/voice-lines.js), read by a professional AI
// voice. Each line is made once, then kept in the Vercel Blob store under voice/ and served from
// there. Only the demo's own lines can be voiced, and proxy.js only lets demo-cookie holders in, so
// nobody can spend the voice credit on anything else.
//
// Provider (Vercel environment variables, server-side only):
//   ELEVENLABS_API_KEY (+ optional ELEVENLABS_VOICE_ID), preferred, or
//   OPENAI_API_KEY (+ optional OPENAI_TTS_VOICE).
import { filmLines } from "../../../lib/voice-lines";

var BLOB_API = "https://vercel.com/api/blob";
var ELEVEN_VOICE = "21m00Tcm4TlvDq8ikWAM"; // "Rachel": calm, warm, clear
var OPENAI_VOICE = "nova";
var STYLE = "Warm, calm and gentle, like a caring narrator for a women's health app. Unhurried, never salesy.";

function provider() {
  if (process.env.ELEVENLABS_API_KEY) {
    var voiceId = process.env.ELEVENLABS_VOICE_ID || ELEVEN_VOICE;
    return { id: "elevenlabs", cacheId: "el-" + voiceId, make: function (text) { return eleven(text, voiceId); } };
  }
  if (process.env.OPENAI_API_KEY) {
    var name = process.env.OPENAI_TTS_VOICE || OPENAI_VOICE;
    return { id: "openai", cacheId: "oa-" + name, make: function (text) { return openai(text, name); } };
  }
  return null;
}

async function eleven(text, voiceId) {
  var res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(voiceId) + "?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error("ElevenLabs " + res.status + ": " + (await res.text()).slice(0, 200));
  return new Uint8Array(await res.arrayBuffer());
}

async function openai(text, voice) {
  var res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: voice, input: text, instructions: STYLE, response_format: "mp3" }),
  });
  if (!res.ok) throw new Error("OpenAI TTS " + res.status + ": " + (await res.text()).slice(0, 200));
  return new Uint8Array(await res.arrayBuffer());
}

function blobHeaders(token) {
  return { authorization: "Bearer " + token, "x-api-version": "12", "x-vercel-blob-store-id": token.split("_")[3] || "" };
}

// The stored recording, or null.
async function cached(token, pathname) {
  var params = new URLSearchParams({ prefix: pathname, limit: "1" });
  var list = await fetch(BLOB_API + "?" + params.toString(), { headers: blobHeaders(token), cache: "no-store" });
  if (!list.ok) return null;
  var hit = ((await list.json()).blobs || []).find(function (b) { return b.pathname === pathname; });
  if (!hit) return null;
  var file = await fetch(hit.url, { headers: { authorization: "Bearer " + token }, cache: "no-store" });
  return file.ok ? new Uint8Array(await file.arrayBuffer()) : null;
}

async function store(token, pathname, bytes) {
  var params = new URLSearchParams({ pathname: pathname });
  var res = await fetch(BLOB_API + "/?" + params.toString(), {
    method: "PUT",
    headers: { ...blobHeaders(token), "x-vercel-blob-access": "private", "x-content-type": "audio/mpeg", "x-add-random-suffix": "0", "x-allow-overwrite": "1" },
    body: bytes,
  });
  if (!res.ok) throw new Error("Blob API " + res.status);
}

function mp3(bytes) {
  // Keyed by line, voice and provider, so a copy in her browser never goes stale.
  return new Response(bytes, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=31536000, immutable" } });
}

export async function GET(request) {
  var p = provider();
  var key = new URL(request.url).searchParams.get("line");
  if (!key) return Response.json({ available: !!p, provider: p ? p.id : null });
  if (!p) return Response.json({ error: "No voice provider is set up" }, { status: 503 });

  var text = /^[0-9a-f]{8}$/.test(key) ? filmLines().get(key) : null;
  if (!text) return Response.json({ error: "Unknown line" }, { status: 404 });

  var token = process.env.BLOB_READ_WRITE_TOKEN;
  var pathname = "voice/" + p.cacheId + "/" + key + ".mp3";
  try {
    if (token) {
      var hit = await cached(token, pathname);
      if (hit) return mp3(hit);
    }
    var bytes = await p.make(text);
    if (token) await store(token, pathname, bytes).catch(function (err) { console.error("Voice cache error:", err.message); });
    return mp3(bytes);
  } catch (err) {
    console.error("Voice error:", err.message);
    return Response.json({ error: "Voice unavailable" }, { status: 502 });
  }
}
