// The lines the investor demo's narrator may speak: every subtitle in lib/demo-film.js (or its
// spoken `voice` version) plus the "Test voice" line. The browser asks /api/voice for a line by its
// key, never by text, so the server only ever voices these lines.
import { SCENES } from "./demo-film";

export var TEST_LINE = "Hi, I'm the voice of Bloom. Let me show you Sarah's story.";

// FNV-1a, 32-bit, as 8 hex characters: short, stable and the same in the browser and on the server.
export function lineKey(text) {
  var h = 0x811c9dc5;
  for (var i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ("0000000" + h.toString(16)).slice(-8);
}

export function spokenText(step) {
  return step.voice || step.say;
}

// key → text for every line the narrator may speak.
export function filmLines() {
  var map = new Map([[lineKey(TEST_LINE), TEST_LINE]]);
  SCENES.forEach(function (s) {
    s.steps.forEach(function (a) {
      if (a.say) { var text = spokenText(a); map.set(lineKey(text), text); }
    });
  });
  return map;
}
