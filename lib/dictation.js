// Voice typing: she speaks and the words appear in the text box (check-in journal, "Tell Nora",
// Secret Space, the Nora chat). Uses the browser's own speech recognition (Web Speech API):
// Chrome and Edge send the audio to Google or Microsoft to turn it into text, Safari to Apple (or
// does it on the device). Bloom never records, stores or sends the audio itself; only the text
// she sees in the box is kept, exactly like typed text. The Privacy Centre says so (priv.voice).
//
// Not available in the iOS/Android app's WebView yet: that needs a native speech plugin
// (founder approval for a new package), so the microphone button is simply not shown there.

var LANGS = { en: "en-GB", ar: "ar-AE", fr: "fr-FR" };

function Recognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function dictationSupported() {
  return !!Recognition();
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
