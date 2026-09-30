// sa5's Sleep card: the seeded week belongs to the demo persona; a real account starts empty.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { store } from "../lib/store.js";
import { getSleep, logSleep, sleepScore, fmtHours } from "../lib/sleep.js";
import { DEMO_USER } from "../lib/demo-data.js";

beforeEach(function () { localStorage.clear(); });

test("a real account has no sleep data until she logs a night", function () {
  store.set("user", { id: "u-1", name: "Lina", onboarded: true });
  assert.deepEqual(getSleep(), []);
  var d = new Date(); d.setHours(7, 0, 0, 0);
  logSleep({ date: d.toISOString(), hours: 7.5, quality: 3 });
  assert.equal(getSleep().length, 1);
  assert.equal(sleepScore(getSleep()[0]).key, "great");
});

test("the demo persona keeps a seeded week", function () {
  store.set("user", { ...DEMO_USER });
  assert.equal(getSleep().length, 7);
});

test("hours format in her language", function () {
  var t = function (k, v) { return k === "sleep.hm" ? v.h + " س " + v.m + " د" : v.h + " س"; };
  assert.equal(fmtHours(7.5, t), "7 س 30 د");
  assert.equal(fmtHours(8, t), "8 س");
  assert.equal(fmtHours(6.25), "6h 15m");
});
