// Voice typing: she speaks and the words appear in the text box (check-in journal, "Tell Nora",
// Secret Space, the Nora chat).
// - In the iOS/Android app: the phone's own speech recognition (Apple's Speech framework, Google's
//   speech service on Android), through @capgo/capacitor-speech-recognition (lib/native.js). The
//   phone asks her once for the microphone and speech recognition.
// - On the web: the browser's speech recognition (Web Speech API). Chrome and Edge send the audio to
//   Google or Microsoft to turn it into text, Safari to Apple (or does it on the device).
// Bloom never records, stores or sends the audio itself; only the text she sees in the box is kept,
// exactly like typed text. The Privacy Centre says so (priv.voice).
import { isNative, speechPlugin } from "./native";

var LANGS = { en: "en-GB", ar: "ar-AE", fr: "fr-FR" };
// Longest pause-free session on Android 13+ (iOS already listens through pauses until stopped).
var KEEP_LISTENING_MS = 60000;

function Recognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// In the app the plugin is always there; whether the phone can recognise speech is checked when
// she taps the microphone.
export function dictationSupported() {
  return isNative() || !!Recognition();
}

export function dictationLang(lang) {
  return LANGS[lang] || LANGS.en;
}

// Adds a dictated phrase to what is already in the box, with one space between them.
export function appendSpoken(current, spoken) {
  var a = String(current || "").replace(/\s+$/, "");
  var b = String(spoken || "").trim();
  if (!b) return String(current || "");
  return a ? a + " " + b : b;
}

// Starts listening. Calls onText(finalText) for each finished phrase, onInterim(text) while she is
// still speaking, onEnd(error) when it stops ("denied", "no-speech", "network", "unsupported" or
// null). Returns stop().
export function startDictation(opts) {
  if (isNative()) return nativeDictation(speechPlugin(), opts);
  var R = Recognition();
  if (!R) {
    if (opts.onEnd) opts.onEnd("unsupported");
    return function () {};
  }
  var rec = new R();
  var error = null;
  rec.lang = dictationLang(opts.lang);
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = function (e) {
    var interim = "";
    for (var i = e.resultIndex; i < e.results.length; i++) {
      var r = e.results[i];
      if (r.isFinal) { if (opts.onText) opts.onText(r[0].transcript); }
      else interim += r[0].transcript;
    }
    if (opts.onInterim) opts.onInterim(interim);
  };
  rec.onerror = function (e) {
    error = e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : e.error === "no-speech" ? "no-speech" : e.error === "aborted" ? null : "network";
  };
  rec.onend = function () {
    if (opts.onInterim) opts.onInterim("");
    if (opts.onEnd) opts.onEnd(error);
  };
  try {
    rec.start();
  } catch {
    if (opts.onEnd) opts.onEnd("network");
    return function () {};
  }
  return function () { try { rec.stop(); } catch {} };
}

// The app's path. `pluginPromise` resolves to the speech plugin (or null). The plugin streams the
// words so far ("partialResults"); when listening stops, the whole transcript is handed over once.
// Exported for tests, which pass a fake plugin.
export function nativeDictation(pluginPromise, opts) {
  var sr = null;
  var stopped = false;
  var ended = false;
  var handles = [];
  var before = ""; // finished segments (Android keeps-listening sessions)
  var current = ""; // the segment she is speaking now
  var error = null;

  function text() {
    return (before && current ? before + " " + current : before || current).trim();
  }

  function finish(err) {
    if (ended) return;
    ended = true;
    var said = text();
    if (said && opts.onText) opts.onText(said);
    handles.forEach(function (h) { try { if (h && h.remove) h.remove(); } catch {} });
    if (opts.onInterim) opts.onInterim("");
    if (opts.onEnd) opts.onEnd(said ? null : err);
  }

  (async function () {
    try {
      sr = await pluginPromise;
      if (!sr) return finish("unsupported");
      var av = await sr.available();
      if (!av || !av.available) return finish("unsupported");
      var perm = await sr.checkPermissions();
      if (perm.speechRecognition !== "granted") perm = await sr.requestPermissions();
      if (perm.speechRecognition !== "granted") return finish("denied");
      if (stopped) return finish(null);
      handles.push(await sr.addListener("partialResults", function (e) {
        if (e.matches && e.matches.length) current = e.matches[0];
        else if (typeof e.accumulated === "string") { before = e.accumulated.trim(); current = ""; }
        if (opts.onInterim) opts.onInterim(text());
      }));
      handles.push(await sr.addListener("error", function (e) {
        error = e && /permission|denied|not.?allowed/i.test(String(e.code)) ? "denied" : e && /no.?match|no.?speech|timeout/i.test(String(e.code)) ? "no-speech" : "network";
      }));
      handles.push(await sr.addListener("listeningState", function (e) {
        if ((e.state || e.status) === "stopped") finish(e.reason === "error" ? error || "network" : null);
      }));
      await sr.start({ language: dictationLang(opts.lang), partialResults: true, maxResults: 1, popup: false, addPunctuation: true, keepListeningMs: KEEP_LISTENING_MS });
      if (stopped) await sr.stop();
    } catch {
      finish(error || "network");
    }
  })();

  return function () {
    stopped = true;
    if (sr && !ended) sr.stop().catch(function () { finish(null); });
  };
}
