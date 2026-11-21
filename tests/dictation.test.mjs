// Voice typing (lib/dictation.js): the app's path with a fake speech plugin, and the shared helpers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { nativeDictation, appendSpoken, dictationLang } from "../lib/dictation.js";

function fakePlugin(opts) {
  var o = opts || {};
  var listeners = {};
  var calls = [];
  return {
    calls: calls,
    emit: function (name, data) { (listeners[name] || []).forEach(function (fn) { fn(data); }); },
    available: async function () { calls.push("available"); return { available: o.available !== false }; },
    checkPermissions: async function () { calls.push("check"); return { speechRecognition: o.granted ? "granted" : "prompt" }; },
    requestPermissions: async function () { calls.push("request"); return { speechRecognition: o.deny ? "denied" : "granted" }; },
    addListener: async function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); return { remove: function () { listeners[name] = []; } }; },
    start: async function (args) { calls.push(["start", args]); return {}; },
    stop: async function () { calls.push("stop"); },
  };
}

function run(sr, lang) {
  var out = { texts: [], interim: [], ended: [] };
  var stop = nativeDictation(Promise.resolve(sr), {
    lang: lang,
    onText: function (t) { out.texts.push(t); },
    onInterim: function (t) { out.interim.push(t); },
    onEnd: function (e) { out.ended.push(e); },
  });
  return { out: out, stop: stop };
}

function tick() { return new Promise(function (r) { setTimeout(r, 0); }); }

test("app: asks permission once, listens in her language, hands over the whole transcript when she stops", async function () {
  var sr = fakePlugin();
  var r = run(sr, "ar");
  await tick();
  var start = sr.calls.find(function (c) { return Array.isArray(c) && c[0] === "start"; });
  assert.ok(sr.calls.indexOf("request") !== -1, "asked for the microphone and speech recognition");
  assert.equal(start[1].language, "ar-AE");
  assert.equal(start[1].partialResults, true);
  assert.equal(start[1].popup, false);
  sr.emit("partialResults", { matches: ["tired and"] });
  sr.emit("partialResults", { matches: ["tired and bloated"] });
  sr.emit("partialResults", { accumulated: "tired and bloated" }); // Android: a finished segment
  sr.emit("partialResults", { matches: ["a bit teary"] });
  assert.equal(r.out.interim.at(-1), "tired and bloated a bit teary");
  r.stop();
  assert.ok(sr.calls.indexOf("stop") !== -1);
  sr.emit("listeningState", { state: "stopped", reason: "userStop" });
  assert.deepEqual(r.out.texts, ["tired and bloated a bit teary"]);
  assert.deepEqual(r.out.ended, [null]);
  sr.emit("listeningState", { state: "stopped" });
  assert.equal(r.out.ended.length, 1, "ends once");
});

test("app: permission refused, no speech service, or plugin missing end quietly with a reason", async function () {
  var denied = run(fakePlugin({ deny: true }), "en");
  await tick();
  assert.deepEqual(denied.out.ended, ["denied"]);
  var none = run(fakePlugin({ granted: true, available: false }), "en");
  await tick();
  assert.deepEqual(none.out.ended, ["unsupported"]);
  var missing = run(null, "en");
  await tick();
  assert.deepEqual(missing.out.ended, ["unsupported"]);
});

test("app: silence ends with no-speech; already granted skips the prompt", async function () {
  var sr = fakePlugin({ granted: true });
  var r = run(sr, "fr");
  await tick();
  assert.equal(sr.calls.indexOf("request"), -1);
  sr.emit("error", { code: "no-match", message: "x" });
  sr.emit("listeningState", { state: "stopped", reason: "error" });
  assert.deepEqual(r.out.texts, []);
  assert.deepEqual(r.out.ended, ["no-speech"]);
});

test("helpers: phrases join with one space; unknown languages use British English", function () {
  assert.equal(appendSpoken("I feel", "  tired "), "I feel tired");
  assert.equal(appendSpoken("", "hello"), "hello");
  assert.equal(appendSpoken("same ", ""), "same ");
  assert.equal(dictationLang("xx"), "en-GB");
});
