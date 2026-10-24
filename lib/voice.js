// Voice-over for the investor demo. Two engines:
// - "studio": a professional AI narrator. /api/voice voices each demo line once (ElevenLabs or
//   OpenAI) and keeps the recording; here we fetch the MP3s ahead of time and play them.
// - the browser's built-in speech (Web Speech API): free and offline, but robotic on many devices.
// The studio voice is the default whenever the server has a voice provider set up.
import { lineKey } from "./voice-lines";

export var STUDIO = "studio";

var PREFERRED = [
  "Samantha", "Ava", "Zoe", "Allison", "Susan", "Karen", "Serena", "Moira", "Tessa",
  "Microsoft Aria Online (Natural)", "Microsoft Jenny Online (Natural)", "Microsoft Sonia Online (Natural)",
  "Google UK English Female", "Google US English",
];
var PREF_KEY = "bloomfilm_voice"; // not "bloom_": the demo's sign-up scene wipes bloom_* keys

export function supported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

// English voices, best first. Voices load asynchronously in some browsers; call again on change.
export function englishVoices() {
  if (!supported()) return [];
  var list = window.speechSynthesis.getVoices().filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
  function rank(v) {
    var i = PREFERRED.findIndex(function (p) { return v.name.indexOf(p) === 0; });
    return (i === -1 ? 100 : i) + (/enhanced|premium|natural/i.test(v.name) ? -0.5 : 0);
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

export async function studioAvailable() {
  try {
    var res = await fetch("/api/voice", { cache: "no-store" });
    return res.ok && (await res.json()).available === true;
  } catch {
    return false;
  }
}

function clip(text) {
  var key = lineKey(text);
  if (!clips.has(key)) {
    clips.set(key, fetch("/api/voice?line=" + key)
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
      u.lang = voice ? voice.lang : "en-GB";
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
