// Nora inside the screens (lib/ai-tasks.js): what each task sends, the answer shapes, and the checks
// every answer goes through before the app uses it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeContext, buildTask, checkAnswer, requestError, SCHEMAS, AI_TASKS } from "../lib/ai-tasks.js";

var CTX = {
  checkins: [
    { date: "2026-11-19T20:00:00.000Z", mood: 1, anxiety: 4, hope: 2, feelings: ["sad", "made-up"], symptoms: ["Bloating", "Hacked<script>"], weight: 62.4, note: "PRIVATE JOURNAL NOTE" },
    { date: "2026-11-20T20:00:00.000Z", mood: 9, anxiety: "3", hope: 5, feelings: [], symptoms: [], weight: null },
    { date: "not a date", mood: 2 },
  ],
  scans: [{ day: 7, e2: 1840, lh: 3, p4: 0.8, right: [18, "16", 99], left: [17] }],
  doses: { due: 3, taken: 1, missed: 0 },
};

test("every task has an answer schema the API accepts (objects closed, every field required)", function () {
  AI_TASKS.forEach(function (task) {
    var s = SCHEMAS[task];
    assert.equal(s.type, "object");
    assert.equal(s.additionalProperties, false, task);
    assert.deepEqual(s.required.slice().sort(), Object.keys(s.properties).sort(), task);
  });
});

test("her logs are re-checked: unknown values dropped, newest first, never her journal notes", function () {
  var c = sanitizeContext(CTX);
  assert.equal(c.checkins.length, 2, "an entry without a valid date is dropped");
  assert.equal(c.checkins[0].date, "2026-11-20");
  assert.equal(c.checkins[0].mood, null, "mood out of range");
  assert.equal(c.checkins[0].anxiety, 3);
  assert.deepEqual(c.checkins[1].feelings, ["sad"]);
  assert.deepEqual(c.checkins[1].symptoms, ["Bloating"]);
  assert.equal(JSON.stringify(c).indexOf("PRIVATE"), -1);
  assert.deepEqual(c.scans[0].right, [18, 16], "sizes out of range dropped");
  assert.deepEqual(c.doses, { due: 3, taken: 1, missed: 0 });
  assert.deepEqual(sanitizeContext(null), { checkins: [], scans: [], doses: { due: 0, taken: 0, missed: 0 } });
});

test("the briefing prompt carries her profile and logs as data, in her language", function () {
  var req = buildTask("brief", { user: { name: "Lina Haddad", phase: "stimulation", stimDay: 7 }, context: CTX }, "ar", new Date("2026-11-21T08:00:00Z"));
  assert.equal(req.effort, "low");
  assert.match(req.system, /You are not a doctor/);
  assert.match(req.system, /Arabic/);
  assert.match(req.system, /2026-11-21/);
  var text = req.content[0].text;
  assert.match(text, /<patient_profile>[\s\S]*First name: Lina[\s\S]*<\/patient_profile>/);
  assert.match(text, /2026-11-19; mood low; anxiety 4; hope 2; feelings: sad; symptoms: Bloating; weight 62.4 kg/);
  assert.match(text, /stim day 7; E2 1840 pg\/mL/);
  assert.match(text, /Today's doses: 3 due, 1 taken so far/);
  assert.equal(text.indexOf("PRIVATE"), -1, "never her journal notes");
});

test("Tell Nora sends her words and the allowed values; results sends the file as an image or PDF block", function () {
  var log = buildTask("log", { user: {}, context: {}, text: "tired and bloated\u0007" }, "en");
  assert.match(log.content[0].text, /<her_words>\ntired and bloated\n<\/her_words>/);
  assert.match(log.content[0].text, /Allowed symptoms: Feeling fine, Bloating/);
  var img = buildTask("results", { user: {}, context: {}, file: { type: "image/jpeg", data: "AAAA" } }, "fr");
  assert.deepEqual(img.content[0], { type: "image", source: { type: "base64", media_type: "image/jpeg", data: "AAAA" } });
  assert.equal(img.effort, "medium");
  var pdf = buildTask("results", { user: {}, context: {}, file: { type: "application/pdf", data: "JVBE" } }, "en");
  assert.equal(pdf.content[0].type, "document");
  var prep = buildTask("prep", { user: {}, context: {}, appt: { label: "Monitoring scan", date: "2026-11-22", time: "08:00" } }, "en");
  assert.match(prep.content[0].text, /<appointment>\nMonitoring scan on 2026-11-22 at 08:00\n<\/appointment>/);
});

test("results: units are converted, unreadable numbers dropped, nothing found means not readable", function () {
  var r = checkAnswer("results", { readable: true, day: 8, e2: 7342, e2_unit: "pmol/L", lh: 4.2, p4: 3.18, p4_unit: "nmol/L", right: [18.5, 17, 55], left: [], note: "Clear sheet." });
  assert.equal(r.e2, 2000, "7342 pmol/L = 2000 pg/mL");
  assert.equal(r.p4, 1);
  assert.equal(r.converted, true);
  assert.deepEqual(r.right, [18.5, 17], "55 mm is out of range");
  var u = checkAnswer("results", { readable: true, day: null, e2: 1500, e2_unit: "unknown", lh: null, p4: null, p4_unit: "unknown", right: [12], left: [], note: "" });
  assert.equal(u.e2, null, "no unit: left for her to type");
  assert.equal(u.unitUnknown, true);
  var none = checkAnswer("results", { readable: true, day: null, e2: null, e2_unit: "unknown", lh: null, p4: null, p4_unit: "unknown", right: [], left: [], note: "A shopping receipt." });
  assert.equal(none.readable, false);
});

test("Tell Nora: values outside the app's lists are dropped; her emergency words always raise the warning", function () {
  var r = checkAnswer("log", { mood: 7, anxiety: 4, hope: null, feelings: ["sad", "x"], symptoms: ["Bloating", "Bloating", "Hiccups"], warning: false, reply: "I'm sorry." }, { urgent: true });
  assert.equal(r.mood, null);
  assert.equal(r.anxiety, 4);
  assert.deepEqual(r.feelings, ["sad"]);
  assert.deepEqual(r.symptoms, ["Bloating"]);
  assert.equal(r.warning, true);
});

test("briefing and prep: lines trimmed and capped; an empty answer is rejected", function () {
  var b = checkAnswer("brief", { greeting: "Hi Lina", lines: ["a", "", "b", "c", "d", "e"], tip: "Drink water." });
  assert.deepEqual(b.lines, ["a", "b", "c", "d"]);
  assert.equal(checkAnswer("brief", { greeting: "Hi", lines: [], tip: "" }), null);
  assert.equal(checkAnswer("prep", { questions: [], summary: [] }), null);
  assert.equal(checkAnswer("brief", "nope"), null);
});

test("requests are checked before anything is sent", function () {
  assert.equal(requestError("poem", {}), "task");
  assert.equal(requestError("brief", {}), null);
  assert.equal(requestError("log", { text: "  " }), "text");
  assert.equal(requestError("results", { file: { type: "image/gif", data: "AAAA" } }), "file");
  assert.equal(requestError("results", { file: { type: "image/jpeg", data: "not base64!" } }), "file");
  assert.equal(requestError("results", { file: { type: "image/jpeg", data: "A".repeat(4000001) } }), "too-large");
  assert.equal(requestError("prep", { appt: { date: "2026-11-22", time: "8am" } }), "appt");
  assert.equal(requestError("prep", { appt: { date: "2026-11-22", time: "08:00" } }), null);
});
