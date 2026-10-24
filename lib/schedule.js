// Her own medication schedule and appointments.
//
// Storage: bloom_my_meds and bloom_my_appts (lib/store.js). They are ordinary synced keys, so they
// only leave the device when she has given cloud-sync consent (store.js syncAllowed), and they are
// wiped with the rest of her data on sign-out (cloud) and on account erasure.
//
// Demo vs her data: the demo persona (Sarah) sees the seeded schedule from lib/demo-data.js until she
// edits it. Every other account starts empty and only ever sees what she entered herself.
//
// Shapes (all strings trimmed and length-capped by validateMed / validateAppt):
//   med:  { id, name, dose, type: "injection" | "oral" | "other", times: ["HH:MM", ...],
//           start: "YYYY-MM-DD" | "", end: "YYYY-MM-DD" | "", days: [0-6] (empty = every day),
//           notes, color }
//   appt: { id, kind: APPT_KINDS[i], title, date: "YYYY-MM-DD", time: "HH:MM", clinic, notes }
import { store } from "./store";
import { MEDS as PERSONA_MEDS, APPOINTMENTS as PERSONA_APPTS } from "./demo-data";

export var MED_TYPES = ["injection", "oral", "other"];
export var APPT_KINDS = ["scan", "bloods", "consult", "trigger", "retrieval", "transfer", "beta", "other"];
export var MED_COLORS = ["#9B6DC5", "#E07A8A", "#C49A3C", "#4ABFB0", "#8B7AC5", "#5BADD4"];
var APPT_COLORS = { scan: "#9B6DC5", bloods: "#5BADD4", consult: "#8B7AC5", trigger: "#E07A8A", retrieval: "#C49A3C", transfer: "#4ABFB0", beta: "#9B6DC5", other: "#7A6880" };

export var LIMITS = { name: 60, dose: 40, notes: 300, title: 60, clinic: 80, times: 6, meds: 30, appts: 60 };

var MEDS_KEY = "my_meds";
var APPTS_KEY = "my_appts";

function isDemo() {
  var u = store.get("user", null);
  return !!u && u.id === "demo";
}

// ── Small date helpers (local time, no library) ─────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }

export function ymd(d) {
  var x = new Date(d);
  return x.getFullYear() + "-" + pad(x.getMonth() + 1) + "-" + pad(x.getDate());
}

var DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
var TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isDate(s) {
  var m = DATE_RE.exec(s || "");
  if (!m) return false;
  var d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] && +m[1] >= 2000 && +m[1] <= 2100;
}

export function isTime(s) {
  return TIME_RE.test(s || "");
}

// "YYYY-MM-DD" + "HH:MM" -> local Date.
export function toDate(date, time) {
  var m = DATE_RE.exec(date || "");
  if (!m) return null;
  var t = TIME_RE.exec(time || "00:00") || [0, "0", "0"];
  return new Date(+m[1], +m[2] - 1, +m[3], +t[1], +t[2], 0, 0);
}

// "21:00" in her locale ("9:00 PM", "21:00").
export function fmtClock(time, locale) {
  var d = toDate("2026-01-01", time);
  if (!d) return "";
  try {
    return d.toLocaleTimeString(locale || [], { hour: "numeric", minute: "2-digit" });
  } catch {
    return time;
  }
}

// Whole calendar days from `from` to `to` (local dates).
export function daysBetween(from, to) {
  var a = new Date(from); a.setHours(12, 0, 0, 0);
  var b = new Date(to); b.setHours(12, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

// ── Validation ──────────────────────────────────────────────────────────
function clean(v, max) {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanNotes(v) {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ").trim().slice(0, LIMITS.notes);
}

// Returns { med } or { error: "name" | "type" | "times" | "dates" | "days" }.
export function validateMed(input) {
  var i = input || {};
  var name = clean(i.name, LIMITS.name);
  if (!name) return { error: "name" };
  var type = MED_TYPES.indexOf(i.type) !== -1 ? i.type : null;
  if (!type) return { error: "type" };
  var raw = Array.isArray(i.times) ? i.times : [];
  if (raw.some(function (t) { return !isTime(t); })) return { error: "times" };
  var times = raw.filter(function (t, k) { return raw.indexOf(t) === k; }).sort();
  if (!times.length || times.length > LIMITS.times) return { error: "times" };
  var start = i.start || "";
  var end = i.end || "";
  if ((start && !isDate(start)) || (end && !isDate(end)) || (start && end && end < start)) return { error: "dates" };
  var days = Array.isArray(i.days) ? i.days : [];
  if (days.some(function (d) { return !Number.isInteger(d) || d < 0 || d > 6; })) return { error: "days" };
  days = days.filter(function (d, k) { return days.indexOf(d) === k; }).sort();
  if (days.length === 7) days = [];
  return {
    med: {
      id: typeof i.id === "string" && i.id ? i.id.slice(0, 40) : "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name,
      dose: clean(i.dose, LIMITS.dose),
      type: type,
      times: times,
      start: start,
      end: end,
      days: days,
      notes: cleanNotes(i.notes),
      color: MED_COLORS.indexOf(i.color) !== -1 ? i.color : MED_COLORS[0],
    },
  };
}

// Returns { appt } or { error: "kind" | "title" | "date" | "time" }.
export function validateAppt(input) {
  var i = input || {};
  var kind = APPT_KINDS.indexOf(i.kind) !== -1 ? i.kind : null;
  if (!kind) return { error: "kind" };
  var title = clean(i.title, LIMITS.title);
  if (kind === "other" && !title) return { error: "title" };
  if (!isDate(i.date)) return { error: "date" };
  if (!isTime(i.time)) return { error: "time" };
  return {
    appt: {
      id: typeof i.id === "string" && i.id ? i.id.slice(0, 40) : "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      kind: kind,
      title: title,
      date: i.date,
      time: i.time,
      clinic: clean(i.clinic, LIMITS.clinic),
      notes: cleanNotes(i.notes),
    },
  };
}

// ── Demo persona (only for the demo user, until she edits) ──────────────
function to24(text) {
  var m = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi;
  var out = [];
  var x;
  while ((x = m.exec(text || ""))) {
    var h = parseInt(x[1], 10) % 12;
    if (x[3].toUpperCase() === "PM") h += 12;
    out.push(pad(h) + ":" + (x[2] || "00"));
  }
  return out;
}

var PERSONA_KIND = { "Monitoring Scan": "scan", "Trigger Shot Timing": "trigger", "Egg Retrieval": "retrieval", "Embryo Transfer": "transfer", "Beta HCG Test": "beta" };
var PERSONA_STIM_DAY = 7;

function personaMeds() {
  return PERSONA_MEDS.map(function (m) {
    var start = new Date();
    start.setDate(start.getDate() - (PERSONA_STIM_DAY - m.startDay));
    return { id: m.id, name: m.name, dose: m.dose, type: m.type, times: to24(m.time), start: ymd(start), end: "", days: [], notes: "", color: m.color };
  });
}

function personaAppts() {
  return PERSONA_APPTS.map(function (a) {
    var d = new Date();
    d.setDate(d.getDate() + a.dayOffset);
    return {
      id: "demo-" + a.id, kind: PERSONA_KIND[a.type] || "other", title: "", date: ymd(d), time: pad(a.hour) + ":" + pad(a.minute),
      clinic: a.location, notes: a.doctor, estimate: a.label.indexOf("~") !== -1,
    };
  });
}

function readList(key, persona) {
  var saved = store.get(key, null);
  if (Array.isArray(saved)) return saved;
  return isDemo() ? persona() : [];
}

// ── Medications ─────────────────────────────────────────────────────────
export function getMeds() {
  return readList(MEDS_KEY, personaMeds);
}

export function getMed(id) {
  return getMeds().find(function (m) { return m.id === id; }) || null;
}

// Adds or updates (same id). Returns { med, meds } or { error }.
export function saveMed(input) {
  var list = getMeds().slice();
  var isNew = !input || !input.id || !list.some(function (m) { return m.id === input.id; });
  if (isNew && list.length >= LIMITS.meds) return { error: "limit" };
  var withColor = input && !input.color ? { ...input, color: MED_COLORS[list.length % MED_COLORS.length] } : input;
  var r = validateMed(withColor);
  if (r.error) return r;
  var idx = list.findIndex(function (m) { return m.id === r.med.id; });
  if (idx === -1) list.push(r.med);
  else list[idx] = r.med;
  store.set(MEDS_KEY, list);
  return { med: r.med, meds: list };
}

export function deleteMed(id) {
  var list = getMeds().filter(function (m) { return m.id !== id; });
  store.set(MEDS_KEY, list);
  return list;
}

// Is this medication scheduled on that date?
export function medActiveOn(med, date) {
  var key = ymd(date);
  if (med.start && key < med.start) return false;
  if (med.end && key > med.end) return false;
  if (med.days && med.days.length && med.days.indexOf(new Date(date).getDay()) === -1) return false;
  return true;
}

export function doseKey(medId, time) {
  return medId + "@" + time;
}

// Every dose on a date, earliest first: [{ key, med, time }].
export function dosesOn(date, meds) {
  var list = [];
  (meds || getMeds()).forEach(function (m) {
    if (!medActiveOn(m, date)) return;
    (m.times || []).forEach(function (t) { list.push({ key: doseKey(m.id, t), med: m, time: t }); });
  });
  return list.sort(function (a, b) { return a.time.localeCompare(b.time) || a.med.name.localeCompare(b.med.name); });
}

// ── Appointments ────────────────────────────────────────────────────────
export function getAppts() {
  return readList(APPTS_KEY, personaAppts).slice().sort(function (a, b) {
    return (a.date + a.time).localeCompare(b.date + b.time);
  });
}

export function saveAppt(input) {
  var list = getAppts();
  var isNew = !input || !input.id || !list.some(function (a) { return a.id === input.id; });
  if (isNew && list.length >= LIMITS.appts) return { error: "limit" };
  var r = validateAppt(input);
  if (r.error) return r;
  var idx = list.findIndex(function (a) { return a.id === r.appt.id; });
  if (idx === -1) list.push(r.appt);
  else list[idx] = r.appt;
  store.set(APPTS_KEY, list);
  return { appt: r.appt, appts: getAppts() };
}

export function deleteAppt(id) {
  var list = getAppts().filter(function (a) { return a.id !== id; });
  store.set(APPTS_KEY, list);
  return list;
}

export function apptAt(a) {
  return toDate(a.date, a.time);
}

export function apptColor(a) {
  return APPT_COLORS[a.kind] || APPT_COLORS.other;
}

// Appointments that haven't finished yet (an hour after the start), soonest first.
export function upcomingAppts(now) {
  var t = (now || new Date()).getTime() - 60 * 60000;
  return getAppts().filter(function (a) { var d = apptAt(a); return d && d.getTime() >= t; });
}

export function pastAppts(now) {
  var t = (now || new Date()).getTime() - 60 * 60000;
  return getAppts().filter(function (a) { var d = apptAt(a); return d && d.getTime() < t; }).reverse();
}

export function nextAppt(now) {
  return upcomingAppts(now)[0] || null;
}
