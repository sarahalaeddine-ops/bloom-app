import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { filmLines } from "../lib/voice-lines.js";

var DIR = new URL("../public/voice/", import.meta.url);

test("every narrator line has its recording in public/voice (run scripts/make-voice.py after script changes)", function () {
  var missing = [];
  filmLines().forEach(function (text, key) {
    var file = new URL(key + ".mp3", DIR);
    if (!existsSync(file) || statSync(file).size < 2000) missing.push(key + ": " + text.slice(0, 50));
  });
  assert.deepEqual(missing, []);
});

test("no leftover recordings for lines the film no longer speaks", function () {
  var keys = new Set(Array.from(filmLines().keys()).map(function (k) { return k + ".mp3"; }));
  var extra = readdirSync(DIR).filter(function (f) { return f.endsWith(".mp3") && !keys.has(f); });
  assert.deepEqual(extra, []);
});
