import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt, demoReply } from "../lib/nora.js";

test("system prompt injects the cycle context and the clinic reminder", function () {
  var p = buildSystemPrompt({ name: "Lina", stimDay: 9, protocol: "Long", clinic: "Test Clinic", e2: 2100 }, "en");
  assert.ok(p.indexOf("Lina") !== -1);
  assert.ok(p.indexOf("Stimulation Day 9") !== -1);
  assert.ok(p.indexOf("Long Protocol") !== -1);
  assert.ok(p.indexOf("Test Clinic") !== -1);
  assert.ok(p.indexOf("2100") !== -1);
  assert.match(p, /confirm with (their|your) clinic/i);
});

test("system prompt asks for the user's language", function () {
  assert.match(buildSystemPrompt({}, "ar"), /reply in Arabic/);
  assert.match(buildSystemPrompt({}, "fr"), /reply in French/);
  assert.doesNotMatch(buildSystemPrompt({}, "en"), /Always reply in/);
});

test("system prompt falls back to the demo persona", function () {
  var p = buildSystemPrompt(null, "en");
  assert.ok(p.indexOf("Sarah") !== -1);
  assert.ok(p.indexOf("Stimulation Day 7") !== -1);
});

test("demoReply matches topics in English", function () {
  assert.match(demoReply("What does my E2 mean?", "en"), /1,840/);
  assert.match(demoReply("When is my trigger?", "en"), /trigger/i);
  assert.match(demoReply("tell me a joke", "en"), /confirm with your clinic/);
});

test("demoReply answers in Arabic and French, including English keywords", function () {
  var ar = demoReply("ما معنى الإستراديول؟", "ar");
  assert.match(ar, /[؀-ۿ]/);
  assert.match(ar, /1,840/);
  assert.match(demoReply("trigger?", "ar"), /[؀-ۿ]/, "English keyword, Arabic reply");
  assert.match(demoReply("J'ai peur de la ponction", "fr"), /ponction/);
  assert.match(demoReply("bonjour", "fr"), /clinique/);
});

test("demoReply tolerates empty input and unknown languages", function () {
  assert.equal(typeof demoReply("", "en"), "string");
  assert.equal(typeof demoReply(undefined, "de"), "string");
});
