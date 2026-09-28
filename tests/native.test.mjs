import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isNative, platform, notificationId, notificationPermission, biometricInfo, verifyBiometric, replaceScheduled, onBackButton } from "../lib/native.js";
import { nativePlan, syncNative, DEFAULTS, currentPermission } from "../lib/reminders.js";
import { store, todayKey } from "../lib/store.js";
import { MEDS } from "../lib/demo-data.js";

beforeEach(function () { localStorage.clear(); delete globalThis.Capacitor; });
afterEach(function () { delete globalThis.Capacitor; });

test("web: native features are feature-detected off and never throw", async function () {
  assert.equal(isNative(), false);
  assert.equal(platform(), "web");
  assert.equal(await notificationPermission(), "unsupported");
  assert.deepEqual(await biometricInfo(), { available: false, kind: null });
  assert.equal(await verifyBiometric({ reason: "r", title: "t", cancel: "c" }), false);
  assert.equal(await replaceScheduled([]), false);
  assert.equal(await syncNative(), false);
  assert.equal(typeof onBackButton(function () { return true; }), "function");
});

test("a web-only Capacitor object (isNativePlatform false) is not native", function () {
  globalThis.Capacitor = { isNativePlatform: function () { return false; }, getPlatform: function () { return "web"; } };
  assert.equal(isNative(), false);
  globalThis.Capacitor = { isNativePlatform: function () { return true; }, getPlatform: function () { return "ios"; } };
  assert.equal(isNative(), true);
  assert.equal(platform(), "ios");
});

test("currentPermission keeps the browser value on the web", async function () {
  assert.equal(await currentPermission(), "unsupported");
});

test("notification ids are stable positive 31-bit integers", function () {
  var a = notificationId("med-gonal-0-1@123");
  assert.equal(a, notificationId("med-gonal-0-1@123"));
  assert.notEqual(a, notificationId("med-gonal-0-2@123"));
  assert.ok(Number.isInteger(a) && a > 0 && a < 2147483647);
});

test("nativePlan covers 7 days, uses neutral text in her language, and skips doses taken today", function () {
  var now = new Date();
  now.setHours(0, 1, 0, 0);
  var plan = nativePlan({ ...DEFAULTS, enabled: true, lead: 0 }, now, "en");
  var last = plan.reduce(function (m, p) { return p.at > m ? p.at : m; }, now);
  assert.ok(last - now > 6 * 24 * 3600000, "reaches a week ahead");
  plan.forEach(function (p) {
    assert.equal(p.title, "Bloom");
    MEDS.forEach(function (m) { assert.equal(p.body.indexOf(m.name), -1, "no medicine name on the lock screen"); });
  });
  var fr = nativePlan({ ...DEFAULTS, enabled: true, lead: 15, appts: false }, now, "fr");
  assert.match(fr[0].body, /dose de .* est dans 15 min/);

  var gonal = MEDS.find(function (m) { return m.id === "gonal"; });
  var log = {};
  log[todayKey()] = { gonal: { status: "taken", at: now.toISOString() } };
  store.set("medlog", log);
  var after = nativePlan({ ...DEFAULTS, enabled: true, lead: 0, appts: false }, now, "en");
  var todays = after.filter(function (p) { return p.key.indexOf("med-" + gonal.id + "-") === 0 && p.at.toDateString() === now.toDateString(); });
  assert.equal(todays.length, 0);
});
