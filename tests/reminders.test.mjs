import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { parseTimes, doseCalendar, upcoming, DEFAULTS } from "../lib/reminders.js";
import { MEDS } from "../lib/demo-data.js";

beforeEach(function () { localStorage.clear(); });

test("parseTimes reads 12-hour times, including several in one string", function () {
  assert.deepEqual(parseTimes("9:00 PM"), [{ h: 21, m: 0 }]);
  assert.deepEqual(parseTimes("8AM/8PM"), [{ h: 8, m: 0 }, { h: 20, m: 0 }]);
  assert.deepEqual(parseTimes("12:30 AM"), [{ h: 0, m: 30 }]);
  assert.deepEqual(parseTimes("12 PM"), [{ h: 12, m: 0 }]);
  assert.deepEqual(parseTimes(""), []);
  assert.deepEqual(parseTimes(undefined), []);
});

test("doseCalendar has one daily repeating event with an alarm per dose time", function () {
  var ics = doseCalendar(5, 15);
  var doseTimes = MEDS.reduce(function (n, m) { return n + parseTimes(m.time).length; }, 0);
  assert.equal(ics.split("BEGIN:VEVENT").length - 1, doseTimes);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR"));
  assert.ok(ics.trim().endsWith("END:VCALENDAR"));
  assert.ok(ics.indexOf("RRULE:FREQ=DAILY;COUNT=5") !== -1);
  assert.ok(ics.indexOf("TRIGGER:-PT15M") !== -1);
  assert.ok(ics.indexOf("\r\n") !== -1, "ICS lines use CRLF");
});

test("upcoming returns reminders in the window, soonest first", function () {
  var list = upcoming({ ...DEFAULTS, lead: 0 }, new Date(), 48);
  assert.ok(list.length > 0);
  for (var i = 1; i < list.length; i++) assert.ok(list[i - 1].at <= list[i].at);
  var meds = upcoming({ ...DEFAULTS, appts: false }, new Date(), 48);
  assert.ok(meds.every(function (r) { return r.kind === "med"; }));
});
