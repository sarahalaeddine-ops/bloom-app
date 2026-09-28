// Cycle helpers shared by Home, Medications, Check-in, Charts and the Cycle Report.
//
// Demo data vs her data: the seeded check-ins, dose history, hormone levels and follicle sizes
// belong to the demo persona (Sarah). A real account (anyone who is not the demo user) only ever
// sees what she logged herself, with empty states until she does (G15 for the UI).
import { store, todayKey } from "./store";
import { MEDS, FOLLICLES, MATURE_MM, SEED_CHECKINS, HORMONES } from "./demo-data";
import { getMed, doseKey } from "./schedule";

// Reads the persisted user directly so it always reflects who is signed in on this device.
export function isDemoUser() {
  var u = store.get("user", null);
  return !!u && u.id === "demo";
}

export var TRIGGER_DAY = 9; // trigger in 2 days, retrieval ~2 days later (matches Appointments)

// Today's dose status: { [doseKey]: { status: "taken" | "missed", site, note, at } }, keyed by
// lib/schedule.js doseKey(medId, "HH:MM") so a twice-daily medication has two entries. Entries
// saved before 2026-09-28 are keyed by the medication id alone: doseEntry() still reads them.
export function getTodayMedLog() {
  var all = store.get("medlog", {});
  var today = all[todayKey()];
  if (today) return today;
  var seeded = {};
  if (isDemoUser()) {
    MEDS.forEach(function (m) {
      if (!m.taken) return;
      var med = getMed(m.id);
      if (med) med.times.forEach(function (t) { seeded[doseKey(m.id, t)] = { status: "taken", at: null }; });
    });
  }
  return seeded;
}

// The log entry for one dose (or a legacy whole-day entry for that medication).
export function doseEntry(log, medId, time) {
  return (log && (log[doseKey(medId, time)] || log[medId])) || null;
}

// entry: { status, site, note }. Logs today's dose of `medId` at `time` ("HH:MM").
export function logDose(medId, time, entry) {
  var all = store.get("medlog", {});
  var key = todayKey();
  var today = all[key] || getTodayMedLog();
  var at = new Date().toISOString();
  today = { ...today, [doseKey(medId, time)]: { ...entry, at: at } };
  all[key] = today;
  store.set("medlog", all);
  var med = getMed(medId);
  var history = getMedHistory().slice();
  history.unshift({ id: Date.now(), medId: medId, time: time, name: med ? med.name : medId, dose: med ? med.dose : "", ...entry, at: at });
  store.set("medhistory", history.slice(0, 500));
  return today;
}

export function getMedHistory() {
  var saved = store.get("medhistory", null);
  if (saved) return saved;
  if (!isDemoUser()) return [];
  // Seed a few past doses so the demo's History tab never looks empty.
  var out = [];
  var sites = ["lb", "rb", "lt", "rt"];
  for (var d = 1; d <= 3; d++) {
    MEDS.forEach(function (m, i) {
      var at = new Date();
      at.setDate(at.getDate() - d);
      out.push({ id: d * 10 + i, medId: m.id, name: m.name, dose: m.dose, status: "taken", site: m.type === "injection" ? sites[(d + i) % 4] : "", note: "", at: at.toISOString() });
    });
  }
  return out;
}

export function getCheckins() {
  return store.get("checkins", isDemoUser() ? SEED_CHECKINS : []);
}

export function saveCheckin(entry) {
  var list = getCheckins().slice();
  list.unshift(entry);
  store.set("checkins", list);
  return list;
}

// ── Scan results (E2 and follicle sizes) ────────────────────────────────
// A scan: { id, day (stim day), date (ISO), e2, lh, p4 (numbers or null), right: [mm], left: [mm] }.
// Stored in bloom_scans (synced with her cloud consent, like check-ins).
export var SCAN_LIMITS = { day: [1, 30], mm: [1, 40], e2: [0, 20000], lh: [0, 200], p4: [0, 100] };

function num(v, range) {
  if (v === null || v === undefined || v === "") return null;
  var n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  if (!isFinite(n) || n < range[0] || n > range[1]) return undefined;
  return Math.round(n * 10) / 10;
}

// "18, 16 14/12" -> [18, 16, 14, 12]; undefined when any size is out of range.
export function parseSizes(text) {
  var parts = String(text || "").split(/[^0-9.]+/).filter(Boolean);
  var out = [];
  for (var i = 0; i < parts.length && i < 40; i++) {
    var n = num(parts[i], SCAN_LIMITS.mm);
    if (n === undefined || n === null) return undefined;
    out.push(n);
  }
  return out.sort(function (a, b) { return b - a; });
}

// Validates form input. Returns { scan } or { error: "day" | "e2" | "lh" | "p4" | "sizes" | "empty" }.
export function buildScan(input) {
  var day = num(input.day, SCAN_LIMITS.day);
  if (!day) return { error: "day" };
  var e2 = num(input.e2, SCAN_LIMITS.e2);
  if (e2 === undefined) return { error: "e2" };
  var lh = num(input.lh, SCAN_LIMITS.lh);
  if (lh === undefined) return { error: "lh" };
  var p4 = num(input.p4, SCAN_LIMITS.p4);
  if (p4 === undefined) return { error: "p4" };
  var right = parseSizes(input.right);
  var left = parseSizes(input.left);
  if (right === undefined || left === undefined) return { error: "sizes" };
  if (e2 === null && lh === null && p4 === null && !right.length && !left.length) return { error: "empty" };
  return { scan: { id: Date.now(), day: Math.round(day), date: new Date().toISOString(), e2: e2, lh: lh, p4: p4, right: right, left: left } };
}

// Her scans, oldest stim day first. The demo persona gets her seeded series.
export function getScans() {
  if (isDemoUser()) {
    return HORMONES.map(function (h, i) {
      var last = i === HORMONES.length - 1;
      return { id: "demo-" + h.day, day: h.day, e2: h.e2, lh: h.lh, p4: h.p4, right: last ? FOLLICLES.right : [], left: last ? FOLLICLES.left : [], lead: h.leadFollicle, count: h.count };
    });
  }
  var list = store.get("scans", []);
  return (Array.isArray(list) ? list : []).slice().sort(function (a, b) { return a.day - b.day || String(a.date).localeCompare(String(b.date)); });
}

export function saveScan(scan) {
  var list = store.get("scans", []);
  list = (Array.isArray(list) ? list : []).concat([scan]);
  store.set("scans", list);
  return list;
}

// Chart rows: { day, e2, lh, p4, leadFollicle, count } for scans that have the value.
export function hormoneSeries() {
  return getScans().map(function (s) {
    var sizes = (s.right || []).concat(s.left || []);
    return {
      day: s.day, e2: s.e2, lh: s.lh, p4: s.p4,
      leadFollicle: s.lead != null ? s.lead : sizes.length ? Math.max.apply(null, sizes) : null,
      count: s.count != null ? s.count : sizes.length || null,
    };
  });
}

// Latest follicle sizes { right, left, day } or null when she hasn't logged any.
export function latestFollicles() {
  var scans = getScans().filter(function (s) { return (s.right && s.right.length) || (s.left && s.left.length); });
  var s = scans[scans.length - 1];
  return s ? { right: s.right || [], left: s.left || [], day: s.day } : null;
}

// Latest E2 { value, day } or null.
export function latestE2() {
  var scans = getScans().filter(function (s) { return s.e2 != null; });
  var s = scans[scans.length - 1];
  return s ? { value: s.e2, day: s.day } : null;
}

// { total, mature, none } from her latest follicle scan (none: true when there is none).
export function follicleStats() {
  var f = latestFollicles();
  if (!f) return { total: 0, mature: 0, none: true };
  var all = f.right.concat(f.left);
  return { total: all.length, mature: all.filter(function (s) { return s >= MATURE_MM; }).length };
}

export function cycleStartDate(stimDay) {
  var d = new Date();
  d.setDate(d.getDate() - ((stimDay || 1) - 1));
  return d;
}

export function dateForStimDay(stimDay, day) {
  var d = cycleStartDate(stimDay);
  d.setDate(d.getDate() + day - 1);
  return d;
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function dayKey(d) {
  return new Date(d).toDateString();
}

// Consecutive days with a check-in, ending today (or yesterday if today isn't logged yet).
export function checkinStreak() {
  var days = {};
  getCheckins().forEach(function (c) { days[dayKey(c.date)] = true; });
  var d = new Date();
  if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);
  var n = 0;
  while (days[dayKey(d)] && n < 365) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// Last 7 days, oldest first: { date, checkin | null }
export function lastSevenDays() {
  var list = getCheckins();
  var out = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    var c = list.find(function (x) { return dayKey(x.date) === dayKey(d); }) || null;
    out.push({ date: d, checkin: c });
  }
  return out;
}

// Share of logged doses marked "taken" (history + today).
export function medAdherence() {
  var h = getMedHistory();
  var today = getTodayMedLog();
  var taken = h.filter(function (x) { return x.status === "taken"; }).length;
  var total = h.length;
  Object.keys(today).forEach(function (k) {
    if (today[k].at) return; // already counted in history
    total++;
    if (today[k].status === "taken") taken++;
  });
  return total ? taken / total : null; // null: nothing logged yet
}
