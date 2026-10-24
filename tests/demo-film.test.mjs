import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENES, sceneIndex } from "../lib/demo-film.js";

var KINDS = ["say", "wait", "tap", "type", "scroll", "top", "nora", "run"];
var PHASES = ["planning", "stimulation", "retrieval", "transfer", "tww"];

test("every scene has an id, title, phase and only known actions", function () {
  var ids = new Set();
  SCENES.forEach(function (s) {
    assert.ok(s.id && !ids.has(s.id), "unique id " + s.id);
    ids.add(s.id);
    assert.ok(s.title && s.sub, s.id + ": title and subtitle");
    assert.ok(PHASES.includes(s.phase), s.id + ": phase " + s.phase);
    assert.ok(s.steps.length > 0, s.id + ": has steps");
    s.steps.forEach(function (a, i) {
      var kinds = KINDS.filter(function (k) { return k in a; });
      assert.equal(kinds.length, 1, s.id + " step " + i + ": exactly one action");
      if (a.type) assert.equal(typeof a.text, "string", s.id + " step " + i + ": type needs text");
      if (a.say) assert.ok(a.say.length <= 110, s.id + " step " + i + ": subtitle fits on two lines");
    });
  });
});

test("the story runs from sign-up through every stage to both outcomes", function () {
  var order = SCENES.map(function (s) { return s.id; });
  assert.equal(order[0], "start", "it begins with her signing up");
  assert.equal(SCENES[0].signup, true);
  assert.equal(SCENES.filter(function (s) { return s.signup; }).length, 1, "only the first scene starts signed out");
  ["home", "quick", "meds", "reminders", "appts", "checkin", "results", "nora", "retrieval", "transfer", "wait", "positive", "failed", "privacy"].forEach(function (id) {
    assert.equal(SCENES[sceneIndex(id)].id, id, "scene " + id);
  });
  assert.ok(order.indexOf("retrieval") < order.indexOf("transfer") && order.indexOf("transfer") < order.indexOf("wait"), "stages in treatment order");
  assert.ok(order.indexOf("wait") < order.indexOf("positive") && order.indexOf("wait") < order.indexOf("failed"), "results after the wait");
});

test("the film really logs things: it taps and types in every documenting scene", function () {
  ["quick", "meds", "appts", "checkin"].forEach(function (id) {
    var steps = SCENES[sceneIndex(id)].steps;
    assert.ok(steps.some(function (a) { return a.type; }), id + " types into a field");
    assert.ok(steps.some(function (a) { return a.tap && /save/i.test(JSON.stringify(a.tap)); }), id + " saves");
  });
});
