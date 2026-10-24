import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CHAPTERS, STEPS, firstStepOf, stateAt } from "../lib/tour.js";

var TABS = ["home", "checkin", "nora", "insights", "more"];
var PHASES = ["planning", "stimulation", "retrieval", "transfer", "tww"];
// The More sections the app really has, read from MoreScreen so a renamed screen fails here.
var SECTIONS = Array.from(readFileSync(new URL("../components/screens/MoreScreen.jsx", import.meta.url), "utf8")
  .matchAll(/\{ id: "([a-z]+)",/g), function (m) { return m[1]; });

test("every tour step points at a real tab, More section, phase and language", function () {
  assert.ok(SECTIONS.includes("medications"), "sections were read from MoreScreen");
  STEPS.forEach(function (s, i) {
    var where = "step " + (i + 1) + " (" + s.title + ")";
    assert.ok(TABS.includes(s.tab), where + ": tab " + s.tab);
    if (s.section) {
      assert.equal(s.tab, "more", where + ": sections live under More");
      assert.ok(SECTIONS.includes(s.section), where + ": section " + s.section);
    }
    if (s.phase) assert.ok(PHASES.includes(s.phase), where + ": phase " + s.phase);
    if (s.lang) assert.ok(["en", "ar", "fr"].includes(s.lang), where + ": lang " + s.lang);
    assert.ok(s.title && s.body && s.log, where + ": title, body and how she records it");
  });
});

test("chapters cover the whole story and each starts where expected", function () {
  assert.deepEqual(CHAPTERS.map(function (c) { return c.id; }), ["stims", "clinic", "nora", "wait", "positive", "failed", "trust"]);
  assert.equal(STEPS.length, CHAPTERS.reduce(function (n, c) { return n + c.steps.length; }, 0));
  assert.equal(firstStepOf("stims"), 0);
  assert.equal(STEPS[firstStepOf("failed")].section, "failed");
});

test("phase and language carry forward, so jumping into a scenario shows the right app state", function () {
  assert.deepEqual(stateAt(0), { tab: "home", section: null, quick: false, phase: "stimulation", lang: "en" });
  assert.equal(stateAt(1).quick, true, "the + quick log step opens the sheet");
  var tww = stateAt(firstStepOf("wait") + 1);
  assert.equal(tww.section, "tww");
  assert.equal(tww.phase, "tww", "inherited from the phase-change step");
  var arabic = STEPS.findIndex(function (s) { return s.lang === "ar"; });
  assert.equal(stateAt(arabic).lang, "ar");
  var end = stateAt(STEPS.length - 1);
  assert.equal(end.lang, "en", "the tour ends in English");
  assert.equal(end.phase, "stimulation", "and back in stimulation");
});
