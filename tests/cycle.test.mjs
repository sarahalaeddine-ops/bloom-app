import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { store, todayKey } from "../lib/store.js";
import { follicleStats, cycleStartDate, dateForStimDay, checkinStreak, lastSevenDays, logDose, getTodayMedLog, getMedHistory, medAdherence, saveCheckin, getCheckins, isDemoUser, buildScan, parseSizes, saveScan, getScans, hormoneSeries, latestFollicles, latestE2, doseEntry } from "../lib/cycle.js";
import { getMed, doseKey } from "../lib/schedule.js";
import { MEDS, SEED_CHECKINS, DEMO_USER, HORMONES } from "../lib/demo-data.js";

function asDemo() { store.set("user", { ...DEMO_USER }); }
function asReal() { store.set("user", { id: "u-1", name: "Lina", onboarded: true }); }

function daysAgo(n) {
  var d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

beforeEach(function () { localStorage.clear(); });

test("follicleStats counts total and mature (>= 16 mm) follicles for the demo persona", function () {
  asDemo();
  assert.deepEqual(follicleStats(), { total: 11, mature: 4 });
});

test("a real account never sees the persona's numbers: no scans, follicles, E2, check-ins or doses", function () {
  asReal();
  assert.equal(isDemoUser(), false);
  assert.deepEqual(follicleStats(), { total: 0, mature: 0, none: true });
  assert.equal(latestFollicles(), null);
  assert.equal(latestE2(), null);
  assert.deepEqual(getScans(), []);
  assert.deepEqual(hormoneSeries(), []);
  assert.deepEqual(getCheckins(), []);
  assert.deepEqual(getMedHistory(), []);
  assert.deepEqual(getTodayMedLog(), {});
  assert.equal(checkinStreak(), 0);
});

test("scan results: validated, sorted, and drive follicle stats and E2 for a real account", function () {
  asReal();
  assert.deepEqual(parseSizes("12, 18 14/16.5"), [18, 16.5, 14, 12]);
  assert.equal(parseSizes("12, 99"), undefined);
  assert.deepEqual(buildScan({ day: "0" }), { error: "day" });
  assert.deepEqual(buildScan({ day: 5 }), { error: "empty" });
  assert.deepEqual(buildScan({ day: 5, e2: "abc" }), { error: "e2" });
  assert.deepEqual(buildScan({ day: 5, right: "12, 45" }), { error: "sizes" });
  saveScan(buildScan({ day: 8, e2: "1,2", right: "17, 15", left: "16" }).scan);
  saveScan(buildScan({ day: 6, e2: 900, right: "13" }).scan);
  assert.deepEqual(getScans().map(function (s) { return s.day; }), [6, 8]);
  assert.equal(latestE2().value, 1.2, "a comma is read as a decimal point");
  assert.deepEqual(follicleStats(), { total: 3, mature: 2 });
  assert.deepEqual(hormoneSeries().map(function (h) { return [h.day, h.leadFollicle, h.count]; }), [[6, 13, 1], [8, 17, 3]]);
});

test("the demo persona's series comes from the seeded hormone data", function () {
  asDemo();
  assert.equal(hormoneSeries().length, HORMONES.length);
  assert.equal(latestE2().value, 1840);
});

test("cycle start is stimDay - 1 days ago, and dateForStimDay counts from it", function () {
  var start = cycleStartDate(7);
  var expected = new Date();
  expected.setDate(expected.getDate() - 6);
  assert.equal(start.toDateString(), expected.toDateString());
  assert.equal(dateForStimDay(7, 7).toDateString(), new Date().toDateString());
  assert.equal(cycleStartDate(undefined).toDateString(), new Date().toDateString(), "defaults to day 1 (never the persona's day 7)");
});

test("todayKey is YYYY-MM-DD", function () {
  assert.match(todayKey(), /^\d{4}-\d{2}-\d{2}$/);
});

test("checkinStreak counts consecutive days ending today or yesterday", function () {
  store.set("checkins", [{ date: daysAgo(0) }, { date: daysAgo(1) }, { date: daysAgo(2) }, { date: daysAgo(4) }]);
  assert.equal(checkinStreak(), 3);
  store.set("checkins", [{ date: daysAgo(1) }, { date: daysAgo(2) }]);
  assert.equal(checkinStreak(), 2, "today not logged yet still keeps yesterday's streak");
  store.set("checkins", [{ date: daysAgo(3) }]);
  assert.equal(checkinStreak(), 0);
});

test("lastSevenDays returns 7 days oldest first, matching check-ins by day", function () {
  store.set("checkins", [{ date: daysAgo(0), mood: 3 }]);
  var week = lastSevenDays();
  assert.equal(week.length, 7);
  assert.equal(week[6].date.toDateString(), new Date().toDateString());
  assert.equal(week[6].checkin.mood, 3);
  assert.equal(week[0].checkin, null);
});

test("getCheckins falls back to the seeded check-ins (demo only), saveCheckin prepends", function () {
  asDemo();
  assert.equal(getCheckins().length, SEED_CHECKINS.length);
  saveCheckin({ date: daysAgo(0), mood: 4 });
  assert.equal(getCheckins().length, SEED_CHECKINS.length + 1);
  assert.equal(getCheckins()[0].mood, 4);
});

test("today's med log is seeded per dose from MEDS[].taken until a dose is logged (demo)", function () {
  asDemo();
  var seeded = getTodayMedLog();
  MEDS.forEach(function (m) {
    getMed(m.id).times.forEach(function (t) { assert.equal(!!seeded[doseKey(m.id, t)], !!m.taken, m.id + " " + t); });
  });
  var pending = getMed(MEDS.find(function (m) { return !m.taken; }).id);
  assert.equal(pending.times.length, 2, "Progynova is twice daily");
  var log = logDose(pending.id, pending.times[0], { status: "taken", site: "lb" });
  assert.equal(doseEntry(log, pending.id, pending.times[0]).status, "taken");
  assert.equal(doseEntry(log, pending.id, pending.times[1]), null, "the evening dose is still due");
  assert.ok(log[doseKey(pending.id, pending.times[0])].at, "timestamped");
  assert.equal(getMedHistory()[0].medId, pending.id);
  assert.equal(getMedHistory()[0].time, pending.times[0]);
  assert.equal(store.get("medlog", {})[todayKey()][doseKey(pending.id, pending.times[0])].site, "lb");
});

test("doseEntry still reads a legacy whole-day entry keyed by medication id", function () {
  var log = { gonal: { status: "taken" } };
  assert.equal(doseEntry(log, "gonal", "21:00").status, "taken");
  assert.equal(doseEntry(log, "other", "21:00"), null);
});

test("medAdherence is a ratio between 0 and 1, drops after a missed dose, and is null with no doses", function () {
  asReal();
  assert.equal(medAdherence(), null, "a new account has nothing logged (not 100%)");
  asDemo();
  var before = medAdherence();
  assert.ok(before > 0 && before <= 1);
  logDose(MEDS[0].id, "21:00", { status: "missed" });
  assert.ok(medAdherence() < before);
});
