// Voice-over for the investor demo. Two engines:
// - "studio" (the default): recorded narration by a natural British woman's voice. Out of the box
//   that is "Emma" (Kokoro, recorded by scripts/make-voice.py into public/voice/<key>.mp3, no
//   account needed); if the server has ElevenLabs or OpenAI set up, /api/voice records each line
//   with that voice instead. MP3s are fetched ahead of time and played.
// - the browser's built-in speech (Web Speech API): a fallback, limited to women's voices, but
//   robotic on many devices.
import { lineKey } from "./voice-lines";

export var STUDIO = "studio";

// Women's voices only (the narrator is a woman), British first, then other natural English voices.
var PREFERRED = [
  "Serena", "Kate", "Stephanie", "Martha", "Microsoft Sonia Online (Natural)", "Microsoft Libby Online (Natural)",
  "Microsoft Maisie Online (Natural)", "Microsoft Hazel", "Google UK English Female",
  "Samantha", "Ava", "Zoe", "Allison", "Susan", "Karen", "Moira", "Tessa", "Fiona", "Veena",
  "Microsoft Aria Online (Natural)", "Microsoft Jenny Online (Natural)", "Microsoft Zira", "Google US English",
];
// Known men's voices on Mac, Windows, Chrome and Android, never used for the narrator.
var MALE = /\b(daniel|arthur|oliver|george|fred|alex|tom|aaron|rishi|ralph|thomas|ryan|guy|david|mark|james|eddy|reed|rocko|grandpa|albert|bruce|junior|gordon|lee|male)\b/i;
// Not "bloom_": the demo's sign-up scene wipes bloom_* keys. v2: earlier saved choices could be a
// robotic or male device voice, so everyone starts again on the recorded narrator.
var PREF_KEY = "bloomfilm_voice_v2";

export function supported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

// English women's voices, best first. Voices load asynchronously in some browsers; call again on
// change. A voice whose name isn't known is kept only if no known woman's voice exists.
export function englishVoices() {
  if (!supported()) return [];
  var list = window.speechSynthesis.getVoices().filter(function (v) { return /^en(-|_|$)/i.test(v.lang) && !MALE.test(v.name); });
  var known = list.filter(function (v) { return PREFERRED.some(function (p) { return v.name.indexOf(p) === 0; }); });
  if (known.length) list = known;
  function rank(v) {
    var i = PREFERRED.findIndex(function (p) { return v.name.indexOf(p) === 0; });
    var british = /^en[-_]GB/i.test(v.lang) ? -50 : 0;
    return (i === -1 ? 100 : i) + british + (/enhanced|premium|natural/i.test(v.name) ? -0.5 : 0);
  }
  return list.sort(function (a, b) { return rank(a) - rank(b); });
}

export function onVoicesChanged(fn) {
  if (!supported()) return function () {};
  window.speechSynthesis.addEventListener("voiceschanged", fn);
  return function () { window.speechSynthesis.removeEventListener("voiceschanged", fn); };
}

export function loadPrefs() {
  try {
    var p = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
    return { on: p.on !== false, name: typeof p.name === "string" ? p.name : STUDIO };
  } catch {
    return { on: true, name: STUDIO };
  }
}

// ── Studio voice ───────────────────────────────────────────────────────────
var clips = new Map(); // key → Promise<object URL | null>
var audio = null;
var current = null; // { finish } for the clip playing now
var useApi = false; // true when the server has ElevenLabs or OpenAI set up

// Asks the server whether a paid voice provider is set up; if so its recordings replace Emma's.
export async function useProviderVoiceIfSetUp() {
  try {
    var res = await fetch("/api/voice", { cache: "no-store" });
    useApi = res.ok && (await res.json()).available === true;
  } catch {
    useApi = false;
  }
  if (useApi) clips.clear();
  return useApi;
}

function clip(text) {
  var key = lineKey(text);
  if (!clips.has(key)) {
    clips.set(key, fetch(useApi ? "/api/voice?line=" + key : "/voice/" + key + ".mp3")
      .then(function (res) { return res.ok ? res.blob() : null; })
      .then(function (b) { return b ? URL.createObjectURL(b) : null; })
      .catch(function () { return null; }));
  }
  return clips.get(key);
}

// Starts making the recordings for these lines now, so they're ready when their turn comes.
export function prefetch(texts) {
  texts.forEach(function (t) { clip(t); });
}

// Must run inside a tap (the Play button): phones and Safari only let audio play after one.
export function unlockAudio() {
  if (typeof Audio === "undefined") return;
  if (!audio) audio = new Audio();
  audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
  var p = audio.play();
  if (p && p.catch) p.catch(function () {});
}

function speakStudio(text) {
  return clip(text).then(function (url) {
    // No recording (provider down or not set up): leave the subtitle up long enough to read.
    if (!url || !audio) return new Promise(function (r) { setTimeout(r, Math.max(1600, text.split(/\s+/).length * 260)); });
    return new Promise(function (resolve) {
      var done = false;
      function finish() { if (!done) { done = true; current = null; resolve(); } }
      current = { finish: finish };
      audio.onended = finish;
      audio.onerror = finish;
      audio.src = url;
      var p = audio.play();
      if (p && p.catch) p.catch(finish);
    });
  });
}

export function savePrefs(p) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch {}
}

// Speaks one line with the chosen voice (STUDIO or a browser voice name). Resolves when it has
// finished, or after a time estimated from its length if the browser never reports the end.
export function speak(text, voiceName) {
  if (voiceName === STUDIO) return speakStudio(text);
  if (!supported()) return Promise.resolve();
  var synth = window.speechSynthesis;
  return new Promise(function (resolve) {
    var done = false;
    function finish() { if (!done) { done = true; resolve(); } }
    var words = text.split(/\s+/).length;
    setTimeout(finish, 2000 + words * 550);
    try {
      var u = new SpeechSynthesisUtterance(text);
      var voice = englishVoices().find(function (v) { return v.name === voiceName; }) || englishVoices()[0];
      u.lang = voice ? voice.lang : "en-GB"; // British by default
      try { if (voice) u.voice = voice; } catch {}
      u.rate = 0.94; // a touch slower sounds calmer and less mechanical
      u.pitch = 1.02;
      u.onend = finish;
      u.onerror = finish;
      synth.speak(u);
    } catch {
      finish();
    }
  });
}

export function pauseSpeech() {
  if (audio && current) audio.pause();
  if (supported()) window.speechSynthesis.pause();
}
export function resumeSpeech() {
  if (audio && current) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
  if (supported()) window.speechSynthesis.resume();
}
export function stopSpeech() {
  if (audio && current) { audio.pause(); current.finish(); }
  if (supported()) window.speechSynthesis.cancel();
}
export function speaking() { return supported() && (window.speechSynthesis.speaking || window.speechSynthesis.pending); }
