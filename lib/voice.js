// Voice-over for the investor demo, using the browser's built-in speech (Web Speech API): free, no
// account, no audio files. Quality depends on the device: Macs and iPhones have natural voices,
// some Windows browsers sound more robotic, which is why she can pick the voice.

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
    return { on: p.on !== false, name: typeof p.name === "string" ? p.name : "" };
  } catch {
    return { on: true, name: "" };
  }
}

export function savePrefs(p) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch {}
}

// Speaks one line. Resolves when it has finished, or after a time estimated from its length if the
// browser never reports the end (no voices installed, tab in the background).
export function speak(text, voiceName) {
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
      u.rate = 1;
      u.pitch = 1;
      u.onend = finish;
      u.onerror = finish;
      synth.speak(u);
    } catch {
      finish();
    }
  });
}

export function pauseSpeech() { if (supported()) window.speechSynthesis.pause(); }
export function resumeSpeech() { if (supported()) window.speechSynthesis.resume(); }
export function stopSpeech() { if (supported()) window.speechSynthesis.cancel(); }
export function speaking() { return supported() && (window.speechSynthesis.speaking || window.speechSynthesis.pending); }
