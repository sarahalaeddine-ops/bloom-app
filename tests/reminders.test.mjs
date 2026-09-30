import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { parseTimes, doseCalendar, upcoming, nativePlan, DEFAULTS } from "../lib/reminders.js";
import { store } from "../lib/store.js";
import { saveMed, saveAppt, ymd } from "../lib/schedule.js";
import { logDose } from "../lib/cycle.js";
import { MEDS, APPOINTMENTS, DEMO_USER } from "../lib/demo-data.js";

function asReal() { store.set("user", { id: "u-1", name: "Lina", onboarded: true }); }
function asDemo() { store.set("user", { ...DEMO_USER }); }
function inDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return ymd(d); }
function midnight() { var d = new Date(); d.setHours(0, 1, 0, 0); return d; }

beforeEach(function () { localStorage.clear(); });

test("parseTimes reads 12-hour times, including several in one string", function () {
  assert.deepEqual(parseTimes("9:00 PM"), [{ h: 21, m: 0 }]);
  assert.deepEqual(parseTimes("8AM/8PM"), [{ h: 8, m: 0 }, { h: 20, m: 0 }]);
  assert.deepEqual(parseTimes("12:30 AM"), [{ h: 0, m: 30 }]);
  assert.deepEqual(parseTimes(""), []);
});

test("a new real account has no reminders at all (never the persona's schedule)", function () {
  asReal();
  assert.deepEqual(upcoming({ ...DEFAULTS, enabled: true }, midnight(), 24 * 7), []);
  assert.deepEqual(nativePlan({ ...DEFAULTS, enabled: true }, midnight(), "en"), []);
  assert.equal(doseCalendar(10, 0).indexOf("BEGIN:VEVENT"), -1);
});

test("reminders are planned from her own medications and appointments", function () {
  asReal();
  saveMed({ name: "Menopur", dose: "150 IU", type: "injection", times: ["19:30", "07:00"], start: inDays(0), end: inDays(2), days: [] });
  saveAppt({ kind: "scan", date: inDays(1), time: "09:00", clinic: "My clinic" });
  var list = upcoming({ ...DEFAULTS, lead: 0 }, midnight(), 24 * 7);
  var meds = list.filter(function (r) { return r.kind === "med"; });
  assert.equal(meds.length, 6, "2 times a day for 3 days (start to end date)");
  assert.ok(meds.every(function (r) { return r.title === "Menopur 150 IU"; }));
  var appts = list.filter(function (r) { return r.kind === "appt"; });
  assert.equal(appts.length, 1);
  assert.equal(appts[0].due.getHours(), 9);
  assert.equal(appts[0].due - appts[0].at, 60 * 60000, "an hour before");
  for (var i = 1; i < list.length; i++) assert.ok(list[i - 1].at <= list[i].at, "soonest first");
  var names = MEDS.map(function (m) { return m.name; });
  assert.ok(list.every(function (r) { return names.indexOf(r.title) === -1; }), "no persona medicines");
});

test("weekday-only medications and the lead time are respected", function () {
  asReal();
  var today = new Date().getDay();
  saveMed({ name: "Progesterone", type: "oral", times: ["08:00"], days: [today] });
  var list = upcoming({ ...DEFAULTS, lead: 15, appts: false }, midnight(), 24 * 7);
  assert.ok(list.length >= 1 && list.length <= 2, "once a week in a 7-day window");
  list.forEach(function (r) {
    assert.equal(r.due.getDay(), today);
    assert.equal(r.due - r.at, 15 * 60000);
  });
});

test("nativePlan: neutral lock-screen text, her language, skips today's doses already taken", function () {
  asReal();
  var r = saveMed({ name: "Cetrotide", dose: "0.25 mg", type: "injection", times: ["08:00", "20:00"] });
  var now = midnight();
  var plan = nativePlan({ ...DEFAULTS, enabled: true, lead: 0, appts: false }, now, "fr");
  assert.ok(plan.length >= 13);
  plan.forEach(function (p) {
    assert.equal(p.title, "Bloom");
    assert.equal(p.body.indexOf("Cetrotide"), -1, "no medicine name on the lock screen");
  });
  logDose(r.med.id, "08:00", { status: "taken" });
  var after = nativePlan({ ...DEFAULTS, enabled: true, lead: 0, appts: false }, now, "en");
  var todays = after.filter(function (p) { return p.at.toDateString() === now.toDateString(); });
  assert.equal(todays.length, 1, "only the 20:00 dose is left today");
});

test("doseCalendar has an event per dose time with weekdays, end date and alarm", function () {
  asReal();
  saveMed({ name: "Gonal, F", dose: "225 IU", type: "injection", times: ["21:00"], end: inDays(5) });
  saveMed({ name: "Aspirin", type: "oral", times: ["08:00"], days: [1, 3] });
  var ics = doseCalendar(5, 15);
  assert.equal(ics.split("BEGIN:VEVENT").length - 1, 2);
  assert.ok(ics.indexOf("UNTIL=") !== -1);
  assert.ok(ics.indexOf("BYDAY=MO,WE") !== -1);
  assert.ok(ics.indexOf("COUNT=5") !== -1);
  assert.ok(ics.indexOf("Gonal\\, F") !== -1, "commas are escaped");
  assert.ok(ics.indexOf("TRIGGER:-PT15M") !== -1);
  assert.ok(ics.indexOf("\r\n") !== -1);
});

test("the demo persona keeps her seeded schedule", function () {
  asDemo();
  var list = upcoming({ ...DEFAULTS, lead: 0 }, midnight(), 24 * 30);
  var titles = list.filter(function (r) { return r.kind === "med"; }).map(function (r) { return r.title; });
  assert.ok(titles.indexOf("Gonal-F 225 IU") !== -1);
  assert.equal(list.filter(function (r) { return r.kind === "appt"; }).length, APPOINTMENTS.length);
});
