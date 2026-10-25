// Studio voice-over for the investor demo. GET /api/voice → { available, provider };
// GET /api/voice?line=<key> → MP3 of that demo line (lib/voice-lines.js), read by a professional AI
// voice. Each line is made once, then kept in the Vercel Blob store under voice/ and served from
// there. Only the demo's own lines can be voiced, and proxy.js only lets demo-cookie holders in, so
// nobody can spend the voice credit on anything else.
//
// Provider (Vercel environment variables, server-side only):
//   ELEVENLABS_API_KEY (+ optional ELEVENLABS_VOICE_ID), preferred, or
//   OPENAI_API_KEY (+ optional OPENAI_TTS_VOICE).
//
// Tuned to sound like a warm human narrator rather than a reader: an expressive, reassuring voice,
// slightly slower than default, and each line is voiced knowing the lines around it so the
// intonation flows from one to the next.
import { filmLines, filmSequence } from "../../../lib/voice-lines";

var BLOB_API = "https://vercel.com/api/blob";
// Warm British female voices from ElevenLabs' default library, best first; if one isn't
// available on her account, the next is tried.
var ELEVEN_VOICES = ["pFZP5JQG7iQjIQuC4Bku", "Xb7hH8MSUJpSbSDYk0k2"]; // Lily (warm British), Alice (clear British)
var OPENAI_VOICE = "coral";
var STYLE = "You are the narrator of a short film about a woman going through IVF, shown to investors. " +
  "Speak with a soft, natural British accent (southern English), like a warm, caring friend telling her story: gentle, natural and human, with soft smiles in your voice. " +
  "Unhurried pace with natural pauses at commas and full stops. Never robotic, never salesy, never over-dramatic.";
// Bump when the voice or its settings change, so stored recordings are made again.
var TUNING = "v3";

function provider() {
  if (process.env.ELEVENLABS_API_KEY) {
    var voices = process.env.ELEVENLABS_VOICE_ID ? [process.env.ELEVENLABS_VOICE_ID] : ELEVEN_VOICES;
    return { id: "elevenlabs", cacheId: "el-" + TUNING + "-" + voices[0], make: function (text, around) { return eleven(text, voices, around); } };
  }
  if (process.env.OPENAI_API_KEY) {
    var name = process.env.OPENAI_TTS_VOICE || OPENAI_VOICE;
    return { id: "openai", cacheId: "oa-" + TUNING + "-" + name, make: function (text) { return openai(text, name); } };
  }
  return null;
}

async function eleven(text, voices, around) {
  var last = "";
  for (var i = 0; i < voices.length; i++) {
    var res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(voices[i]) + "?output_format=mp3_44100_128", {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        // Lower stability and some style = more expressive and human; slightly slower than default.
        voice_settings: { stability: 0.38, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed: 0.95 },
        // The neighbouring lines, so this one is read as part of a story rather than on its own.
        previous_text: around && around.previous ? around.previous : undefined,
        next_text: around && around.next ? around.next : undefined,
      }),
    });
    if (res.ok) return new Uint8Array(await res.arrayBuffer());
    last = "ElevenLabs " + res.status + ": " + (await res.text()).slice(0, 200);
    // Only a missing voice moves on to the next one; anything else (key, quota) is a real error.
    if (!(res.status === 404 || (res.status === 400 && /voice/i.test(last)))) break;
  }
  throw new Error(last);
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
    var seq = filmSequence();
    var at = seq.indexOf(text);
    var bytes = await p.make(text, { previous: at > 0 ? seq[at - 1] : "", next: at !== -1 && at < seq.length - 1 ? seq[at + 1] : "" });
    if (token) await store(token, pathname, bytes).catch(function (err) { console.error("Voice cache error:", err.message); });
    return mp3(bytes);
  } catch (err) {
    console.error("Voice error:", err.message);
    return Response.json({ error: "Voice unavailable" }, { status: 502 });
  }
}
