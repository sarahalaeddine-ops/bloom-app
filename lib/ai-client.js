// Browser side of Nora inside the screens (lib/ai-tasks.js, app/api/ai/route.js): gathers her recent
// logs, calls the API with her consent flag, keeps today's briefing and appointment prep on this
// device so they aren't asked for again on every visit, and shrinks photos before upload.
import { store, consent, todayKey } from "./store";
import { askAi } from "./api";
import { noraProfile } from "./nora";
import { getCheckins, getScans, getTodayMedLog, doseEntry } from "./cycle";
import { getMeds, getAppts, dosesOn } from "./schedule";

// What the features may see: scores, feelings, symptoms and weight of her last check-ins (never her
// journal notes), her latest scans and today's dose count.
export function aiContext() {
  var today = dosesOn(new Date());
  var log = getTodayMedLog();
  var taken = 0;
  var missed = 0;
  today.forEach(function (d) {
    var e = doseEntry(log, d.med.id, d.time);
    if (e && e.status === "taken") taken++;
    if (e && e.status === "missed") missed++;
  });
  return {
    checkins: getCheckins().slice(0, 7).map(function (c) {
      return { date: c.date, mood: c.mood, anxiety: c.anxiety, hope: c.hope, feelings: c.feelings || [], symptoms: c.symptoms || [], weight: c.weight };
    }),
    scans: getScans().slice(-3).map(function (s) { return { day: s.day, e2: s.e2, lh: s.lh, p4: s.p4, right: s.right || [], left: s.left || [] }; }),
    doses: { due: today.length, taken: taken, missed: missed },
  };
}

// Calls one feature. Returns the API's JSON: { [task]: answer } or { offline, reason } or { error }.
export async function runAi(task, user, lang, extra) {
  if (!consent.aiAllowed(user)) return { offline: true, reason: "consent" };
  try {
    var res = await askAi({
      task: task, lang: lang, ai: true,
      user: noraProfile(user, { meds: getMeds(), appts: getAppts() }),
      context: aiContext(),
      ...(extra || {}),
    });
    if (res.status === 429) return { error: "busy", ...res.data };
    if (!res.ok) return { error: "failed", ...res.data };
    return res.data;
  } catch {
    return { offline: true, reason: "network" };
  }
}

// ── Today with Nora: one briefing a day, per language ──────────────────
var BRIEF_KEY = "nora_brief";

export function cachedBrief(lang) {
  var b = store.get(BRIEF_KEY, null);
  return b && b.day === todayKey() && b.lang === lang && b.brief ? b.brief : null;
}

// After a failure, Home doesn't ask again on every visit: only after 10 minutes, or when she taps
// refresh. (Kept in memory: a reload tries again.)
var RETRY_MS = 10 * 60 * 1000;
var lastFailure = null; // { at, out }

export async function loadBrief(user, lang, force) {
  if (!force) {
    var hit = cachedBrief(lang);
    if (hit) return { brief: hit };
    if (lastFailure && Date.now() - lastFailure.at < RETRY_MS) return lastFailure.out;
  }
  var out = await runAi("brief", user, lang);
  if (out.brief) {
    lastFailure = null;
    store.set(BRIEF_KEY, { day: todayKey(), lang: lang, brief: out.brief });
  } else if (out.reason !== "consent") {
    lastFailure = { at: Date.now(), out: out };
  }
  return out;
}

// ── Appointment prep: kept per appointment and language ────────────────
var PREP_KEY = "nora_prep";

export function cachedPrep(apptId, lang) {
  var all = store.get(PREP_KEY, {});
  var p = all && all[apptId];
  return p && p.lang === lang ? p.prep : null;
}

export async function loadPrep(user, lang, appt, label, force) {
  if (!force) {
    var hit = cachedPrep(appt.id, lang);
    if (hit) return { prep: hit };
  }
  var out = await runAi("prep", user, lang, { appt: { label: label, date: appt.date, time: appt.time } });
  if (out.prep) {
    var all = store.get(PREP_KEY, {}) || {};
    all[appt.id] = { lang: lang, prep: out.prep, at: new Date().toISOString() };
    store.set(PREP_KEY, all);
  }
  return out;
}

// ── Photos and PDFs of her results ──────────────────────────────────────
var MAX_SIDE = 1800;
export var MAX_PDF_BYTES = 3 * 1024 * 1024;

function readAsDataUrl(file) {
  return new Promise(function (resolve, reject) {
    var r = new FileReader();
    r.onload = function () { resolve(String(r.result)); };
    r.onerror = function () { reject(new Error("read")); };
    r.readAsDataURL(file);
  });
}

function loadImage(url) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.onload = function () { resolve(img); };
    img.onerror = function () { reject(new Error("image")); };
    img.src = url;
  });
}

// Returns { type, data } (base64 without the data: prefix) or { error: "type" | "size" | "read" }.
// Photos are redrawn at most 1800 px on the long side as JPEG, which also drops the photo's location
// and camera details.
export async function prepareFile(file) {
  if (!file) return { error: "read" };
  try {
    if (file.type === "application/pdf") {
      if (file.size > MAX_PDF_BYTES) return { error: "size" };
      var pdf = await readAsDataUrl(file);
      return { type: "application/pdf", data: pdf.slice(pdf.indexOf(",") + 1) };
    }
    if (!/^image\//.test(file.type)) return { error: "type" };
    var img = await loadImage(await readAsDataUrl(file));
    var scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    var canvas = document.createElement("canvas");
    canvas.width = Math.round((img.naturalWidth || img.width) * scale);
    canvas.height = Math.round((img.naturalHeight || img.height) * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    var jpeg = canvas.toDataURL("image/jpeg", 0.85);
    return { type: "image/jpeg", data: jpeg.slice(jpeg.indexOf(",") + 1) };
  } catch {
    return { error: "read" };
  }
}
