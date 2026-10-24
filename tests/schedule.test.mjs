import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { auth, store } from "../lib/store.js";
import { validateMed, validateAppt, saveMed, deleteMed, getMeds, saveAppt, deleteAppt, getAppts, upcomingAppts, pastAppts, nextAppt, dosesOn, medActiveOn, isDate, isTime, ymd, LIMITS } from "../lib/schedule.js";
import { getCheckins } from "../lib/cycle.js";
import { MEDS, APPOINTMENTS, DEMO_USER } from "../lib/demo-data.js";

function asReal() { store.set("user", { id: "u-1", name: "Lina", onboarded: true }); }
function asDemo() { store.set("user", { ...DEMO_USER }); }
function inDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return ymd(d); }

beforeEach(function () { localStorage.clear(); });

test("date and time checks", function () {
  assert.ok(isDate("2026-09-28"));
  assert.ok(!isDate("2026-02-30"));
  assert.ok(!isDate("28/09/2026"));
  assert.ok(isTime("07:05") && isTime("23:59"));
  assert.ok(!isTime("24:00") && !isTime("7:05") && !isTime(""));
});

test("validateMed: required name, type and at least one valid time; cleans and caps input", function () {
  assert.deepEqual(validateMed({ name: " ", type: "oral", times: ["08:00"] }), { error: "name" });
  assert.deepEqual(validateMed({ name: "A", type: "cream", times: ["08:00"] }), { error: "type" });
  assert.deepEqual(validateMed({ name: "A", type: "oral", times: [] }), { error: "times" });
  assert.deepEqual(validateMed({ name: "A", type: "oral", times: ["8am"] }), { error: "times" });
  assert.deepEqual(validateMed({ name: "A", type: "oral", times: ["01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"] }), { error: "times" });
  assert.deepEqual(validateMed({ name: "A", type: "oral", times: ["08:00"], start: "2026-10-05", end: "2026-10-01" }), { error: "dates" });
  assert.deepEqual(validateMed({ name: "A", type: "oral", times: ["08:00"], days: [7] }), { error: "days" });
  var r = validateMed({ name: "  Gonal\n F " + "x".repeat(100), dose: "225 IU", type: "injection", times: ["21:00", "08:00", "21:00"], days: [0, 1, 2, 3, 4, 5, 6], notes: "fridge\nafter opening" });
  assert.equal(r.med.name.length, LIMITS.name);
  assert.equal(r.med.name.indexOf("\n"), -1);
  assert.deepEqual(r.med.times, ["08:00", "21:00"], "sorted, duplicates removed");
  assert.deepEqual(r.med.days, [], "all seven days = every day");
  assert.equal(r.med.notes, "fridge\nafter opening", "notes keep line breaks");
  assert.ok(r.med.id);
});

test("validateAppt: kind, a label for 'other', real date and time", function () {
  assert.deepEqual(validateAppt({ kind: "party", date: "2026-10-01", time: "08:00" }), { error: "kind" });
  assert.deepEqual(validateAppt({ kind: "other", date: "2026-10-01", time: "08:00" }), { error: "title" });
  assert.deepEqual(validateAppt({ kind: "scan", date: "2026-13-01", time: "08:00" }), { error: "date" });
  assert.deepEqual(validateAppt({ kind: "scan", date: "2026-10-01", time: "" }), { error: "time" });
  var r = validateAppt({ kind: "retrieval", date: "2026-10-01", time: "07:30", clinic: " Clinic ", notes: "fast from midnight" });
  assert.equal(r.appt.clinic, "Clinic");
  assert.equal(r.appt.title, "");
});

test("a real account starts empty; add, edit and delete her own medications", function () {
  asReal();
  assert.deepEqual(getMeds(), []);
  assert.deepEqual(getAppts(), []);
  var a = saveMed({ name: "Menopur", dose: "75 IU", type: "injection", times: ["19:00"] });
  assert.ok(a.med);
  assert.ok(a.med.color, "gets a palette colour");
  assert.equal(getMeds().length, 1);
  var b = saveMed({ ...a.med, dose: "150 IU" });
  assert.equal(b.med.id, a.med.id);
  assert.equal(getMeds().length, 1);
  assert.equal(getMeds()[0].dose, "150 IU");
  assert.deepEqual(saveMed({ name: "" , type: "oral", times: ["08:00"] }), { error: "name" });
  deleteMed(a.med.id);
  assert.deepEqual(getMeds(), []);
  assert.deepEqual(store.get("my_meds", null), [], "an empty list is stored, so the demo seed never comes back");
});

test("medication limit", function () {
  asReal();
  for (var i = 0; i < LIMITS.meds; i++) assert.ok(saveMed({ name: "M" + i, type: "oral", times: ["08:00"] }).med);
  assert.deepEqual(saveMed({ name: "one more", type: "oral", times: ["08:00"] }), { error: "limit" });
});

test("dosesOn respects start and end dates and weekdays", function () {
  asReal();
  saveMed({ name: "Late start", type: "oral", times: ["20:00", "08:00"], start: inDays(1) });
  saveMed({ name: "Ended", type: "oral", times: ["08:00"], end: inDays(-1) });
  saveMed({ name: "Today", type: "injection", times: ["21:00"], start: inDays(0), end: inDays(0) });
  var today = dosesOn(new Date());
  assert.deepEqual(today.map(function (d) { return d.med.name; }), ["Today"]);
  var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  assert.deepEqual(dosesOn(tomorrow).map(function (d) { return d.time; }), ["08:00", "20:00"], "earliest first");
  var weekly = validateMed({ name: "W", type: "oral", times: ["08:00"], days: [new Date().getDay()] }).med;
  assert.ok(medActiveOn(weekly, new Date()));
  assert.ok(!medActiveOn(weekly, tomorrow));
});

test("appointments: sorted, upcoming vs past, next", function () {
  asReal();
  saveAppt({ kind: "transfer", date: inDays(9), time: "10:00" });
  saveAppt({ kind: "scan", date: inDays(1), time: "08:00" });
  saveAppt({ kind: "bloods", date: inDays(-3), time: "08:00" });
  assert.deepEqual(getAppts().map(function (a) { return a.kind; }), ["bloods", "scan", "transfer"]);
  assert.deepEqual(upcomingAppts().map(function (a) { return a.kind; }), ["scan", "transfer"]);
  assert.deepEqual(pastAppts().map(function (a) { return a.kind; }), ["bloods"]);
  assert.equal(nextAppt().kind, "scan");
  var edited = saveAppt({ ...nextAppt(), time: "09:15" });
  assert.equal(edited.appt.time, "09:15");
  assert.equal(getAppts().length, 3);
  deleteAppt(edited.appt.id);
  assert.equal(nextAppt().kind, "transfer");
});

test("the demo persona sees her seeded schedule, and can edit it", function () {
  asDemo();
  assert.deepEqual(getMeds().map(function (m) { return m.id; }), MEDS.map(function (m) { return m.id; }));
  assert.deepEqual(getMeds().find(function (m) { return m.id === "progynova"; }).times, ["08:00", "20:00"]);
  assert.equal(getAppts().length, APPOINTMENTS.length);
  saveMed({ name: "Extra", type: "oral", times: ["12:00"] });
  assert.equal(getMeds().length, MEDS.length + 1);
});

test("schedule keys sync like other health data (not device-only)", function () {
  asReal();
  saveMed({ name: "A", type: "oral", times: ["08:00"] });
  assert.ok(localStorage.getItem("bloom_my_meds"));
});

test("leaving the demo clears its data, so a new account never sees the persona", async function () {
  auth.demo();
  assert.ok(getMeds().length > 0);
  saveMed({ name: "Demo edit", type: "oral", times: ["12:00"] });
  assert.ok(getCheckins().length > 0);
  await auth.signOut();
  var res = await auth.signUp("Lina", "lina@example.com", "password123");
  assert.ok(res.data);
  assert.deepEqual(getMeds(), []);
  assert.deepEqual(getAppts(), []);
  assert.deepEqual(getCheckins(), []);
});

test("another account signing in on this device never sees her data; she gets it back", async function () {
  await auth.signUp("Lina", "lina@example.com", "password123");
  saveMed({ name: "Lina's med", type: "oral", times: ["08:00"] });
  await auth.signOut();
  await auth.signUp("Maya", "maya@example.com", "password123");
  assert.deepEqual(getMeds(), [], "Maya starts empty");
  saveMed({ name: "Maya's med", type: "oral", times: ["09:00"] });
  await auth.signOut();
  await auth.signIn("lina@example.com", "password123");
  assert.deepEqual(getMeds().map(function (m) { return m.name; }), ["Lina's med"]);
  await auth.signOut();
  auth.demo();
  assert.ok(getMeds().some(function (m) { return m.name === "Gonal-F"; }), "demo gets the persona, not Lina's data");
  await auth.signOut();
  await auth.signIn("maya@example.com", "password123");
  assert.deepEqual(getMeds().map(function (m) { return m.name; }), ["Maya's med"]);
});
