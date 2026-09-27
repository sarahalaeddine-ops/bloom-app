// Cycle helpers shared by Home, Medications, Check-in and the Cycle Report.
import { store, todayKey } from "./store";
import { MEDS, FOLLICLES, MATURE_MM, SEED_CHECKINS } from "./demo-data";

export var TRIGGER_DAY = 9; // trigger in 2 days, retrieval ~2 days later (matches Appointments)

// Today's med status: { [medId]: { status: "taken" | "missed", site, note, at } }
export function getTodayMedLog() {
  var all = store.get("medlog", {});
  var today = all[todayKey()];
  if (today) return today;
  var seeded = {};
  MEDS.forEach(function (m) { if (m.taken) seeded[m.id] = { status: "taken", at: null }; });
  return seeded;
}

export function logDose(medId, entry) {
  var all = store.get("medlog", {});
  var key = todayKey();
  var today = all[key] || getTodayMedLog();
  today = { ...today, [medId]: { ...entry, at: new Date().toISOString() } };
  all[key] = today;
  store.set("medlog", all);
  var med = MEDS.find(function (m) { return m.id === medId; });
  var history = getMedHistory().slice();
  history.unshift({ id: Date.now(), medId: medId, name: med ? med.name : medId, dose: med ? med.dose : "", ...entry, at: new Date().toISOString() });
  store.set("medhistory", history);
  return today;
}

export function getMedHistory() {
  var saved = store.get("medhistory", null);
  if (saved) return saved;
  // Seed a few past doses so the History tab never looks empty.
  var out = [];
  var sites = ["Left belly", "Right belly", "Left thigh", "Right thigh"];
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
  return store.get("checkins", SEED_CHECKINS);
}

export function saveCheckin(entry) {
  var list = getCheckins().slice();
  list.unshift(entry);
  store.set("checkins", list);
  return list;
}

export function follicleStats() {
  var all = FOLLICLES.right.concat(FOLLICLES.left);
  return { total: all.length, mature: all.filter(function (s) { return s >= MATURE_MM; }).length };
}

export function cycleStartDate(stimDay) {
  var d = new Date();
  d.setDate(d.getDate() - ((stimDay || 7) - 1));
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
