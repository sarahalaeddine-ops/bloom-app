import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { store, todayKey } from "../lib/store.js";
import { follicleStats, cycleStartDate, dateForStimDay, checkinStreak, lastSevenDays, logDose, getTodayMedLog, getMedHistory, medAdherence, saveCheckin, getCheckins } from "../lib/cycle.js";
import { MEDS, SEED_CHECKINS } from "../lib/demo-data.js";

function daysAgo(n) {
  var d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

beforeEach(function () { localStorage.clear(); });

test("follicleStats counts total and mature (>= 16 mm) follicles", function () {
  assert.deepEqual(follicleStats(), { total: 11, mature: 4 });
});

test("cycle start is stimDay - 1 days ago, and dateForStimDay counts from it", function () {
  var start = cycleStartDate(7);
  var expected = new Date();
  expected.setDate(expected.getDate() - 6);
  assert.equal(start.toDateString(), expected.toDateString());
  assert.equal(dateForStimDay(7, 7).toDateString(), new Date().toDateString());
  assert.equal(cycleStartDate(undefined).toDateString(), expected.toDateString(), "defaults to day 7");
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

test("getCheckins falls back to the seeded check-ins, saveCheckin prepends", function () {
  assert.equal(getCheckins().length, SEED_CHECKINS.length);
  saveCheckin({ date: daysAgo(0), mood: 4 });
  assert.equal(getCheckins().length, SEED_CHECKINS.length + 1);
  assert.equal(getCheckins()[0].mood, 4);
});

test("today's med log is seeded from MEDS[].taken until a dose is logged", function () {
  var seeded = getTodayMedLog();
  MEDS.forEach(function (m) { assert.equal(!!seeded[m.id], !!m.taken, m.id); });
  var pending = MEDS.find(function (m) { return !m.taken; });
  var log = logDose(pending.id, { status: "taken", site: "Left belly" });
  assert.equal(log[pending.id].status, "taken");
  assert.ok(log[pending.id].at, "timestamped");
  assert.equal(getMedHistory()[0].medId, pending.id);
  assert.equal(store.get("medlog", {})[todayKey()][pending.id].site, "Left belly");
});

test("medAdherence is a ratio between 0 and 1 and drops after a missed dose", function () {
  var before = medAdherence();
  assert.ok(before > 0 && before <= 1);
  logDose(MEDS[0].id, { status: "missed" });
  assert.ok(medAdherence() < before);
});
