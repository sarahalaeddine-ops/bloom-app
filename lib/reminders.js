// Dose and appointment reminders.
// 1. While Bloom is open (or in a background tab), a scheduler fires system notifications
//    through the service worker (public/sw.js), with an in-app toast as a fallback.
// 2. For reminders when the app is fully closed, users can add every dose to their phone's
//    calendar (.ics with alarms), which works on every device today.
// 3. In the native app (lib/native.js) the next 7 days of reminders are scheduled as local
//    notifications on the phone, so they fire with Bloom closed and offline. syncNative() re-plans
//    them whenever settings change, a dose is logged or the app comes back to the foreground.
//    Lock-screen text is neutral: no medicine names or doses.
// Everything is planned from her own schedule (lib/schedule.js: bloom_my_meds, bloom_my_appts). The
// demo persona's seeded schedule is used for the demo user only.
import { store, todayKey } from "./store";
import { getTodayMedLog, doseEntry } from "./cycle";
import { getMeds, dosesOn, upcomingAppts, apptAt, apptColor, medActiveOn, ymd, isTime } from "./schedule";
import { IS_APP_BUILD } from "./config";
import { translate } from "./i18n";
import { isNative, notificationPermission, requestNotificationPermission, notifySoon, replaceScheduled } from "./native";

export var DEFAULTS = { enabled: false, meds: true, appts: true, lead: 15 };
export var LEADS = [0, 5, 15, 30];
var APPT_LEAD = 60; // minutes before an appointment

export function getSettings() {
  return { ...DEFAULTS, ...store.get("reminders", {}) };
}

export function saveSettings(s) {
  store.set("reminders", s);
  return s;
}

// Browser permission (sync). The native app's permission is async: use nativePermission().
export function permission() {
  if (isNative()) return "default";
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

// "granted" | "denied" | "default" | "unsupported", for the native app and the web alike.
export async function currentPermission() {
  if (!isNative()) return permission();
  var p = await notificationPermission();
  return p === "prompt" ? "default" : p;
}

export async function registerSW() {
  // The app bundle has no service worker: native notifications replace it.
  if (isNative() || IS_APP_BUILD) return null;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  } catch {
    return null;
  }
}

export async function requestPermission() {
  if (isNative()) {
    var np = await requestNotificationPermission();
    return np === "prompt" ? "default" : np;
  }
  if (permission() === "unsupported") return "unsupported";
  var p = await Notification.requestPermission();
  if (p === "granted") await registerSW();
  return p;
}

export async function notify(title, body, tag) {
  if (isNative()) return (await currentPermission()) === "granted" && notifySoon(title, body);
  if (permission() !== "granted") return false;
  var opts = { body: body, tag: tag, icon: "/apple-touch-icon.png", badge: "/apple-touch-icon.png", data: { url: "/demo-7q4x" } };
  try {
    var reg = (await navigator.serviceWorker.getRegistration()) || (await registerSW());
    if (reg) { await reg.showNotification(title, opts); return true; }
    new Notification(title, opts);
    return true;
  } catch {
    return false;
  }
}

// "9:00 PM" → [{h:21,m:0}], "8AM/8PM" → [{h:8,m:0},{h:20,m:0}]
export function parseTimes(text) {
  var out = [];
  var re = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi;
  var m;
  while ((m = re.exec(text || ""))) {
    var h = parseInt(m[1], 10) % 12;
    if (m[3].toUpperCase() === "PM") h += 12;
    out.push({ h: h, m: m[2] ? parseInt(m[2], 10) : 0 });
  }
  return out;
}

function at(dayOffset, h, m, minus) {
  var d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return new Date(d.getTime() - (minus || 0) * 60000);
}

// Every reminder due from `from` over the next `hours`, soonest first.
// Medication reminders: { id, kind: "med", medId, time, doseKey, day, at, due, title, body, color }.
// Appointment reminders: { id, kind: "appt", apptId, at, due, title, body, color }.
export function upcoming(settings, from, hours) {
  var s = settings || getSettings();
  var start = from || new Date();
  var end = new Date(start.getTime() + (hours || 24) * 3600000);
  var list = [];
  if (s.meds) {
    var meds = getMeds();
    // Start a day early: a dose due just after midnight with a lead time is reminded the day before.
    for (var day = -1; day <= Math.ceil((hours || 24) / 24); day++) {
      var date = at(day, 12, 0, 0);
      dosesOn(date, meds).forEach(function (d) {
        var hm = d.time.split(":");
        var due = at(day, +hm[0], +hm[1], 0);
        list.push({
          id: "med-" + d.med.id + "-" + d.time.replace(":", "") + "-" + ymd(due), medId: d.med.id, time: d.time, doseKey: d.key, day: day,
          kind: "med", color: d.med.color, at: new Date(due.getTime() - (s.lead || 0) * 60000), due: due,
          title: d.med.name + (d.med.dose ? " " + d.med.dose : ""),
          body: (s.lead ? "Due in " + s.lead + " min" : "Due now") + ". Tap to log it.",
        });
      });
    }
  }
  if (s.appts) {
    upcomingAppts(start).forEach(function (a) {
      var due = apptAt(a);
      list.push({
        id: "appt-" + a.id + "-" + a.date + "-" + a.time.replace(":", ""), apptId: a.id, appt: a, kind: "appt", color: apptColor(a),
        at: new Date(due.getTime() - APPT_LEAD * 60000), due: due,
        title: a.title || a.kind, body: fmt(due) + (a.clinic ? " · " + a.clinic : ""),
      });
    });
  }
  return list
    .filter(function (r) { return r.at >= start && r.at <= end; })
    .sort(function (a, b) { return a.at - b.at; });
}

function fmt(d) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
export { fmt as fmtTime };

function currentLang() {
  var l = store.get("lang", "en");
  return l === "ar" || l === "fr" ? l : "en";
}

// The native plan: every reminder due in the next 7 days, minus today's doses already logged as
// taken, with neutral text in her language. Pure (no plugin calls) so it can be tested.
export function nativePlan(settings, now, lang) {
  var s = settings || getSettings();
  var from = now || new Date();
  var l = lang || currentLang();
  var log = getTodayMedLog();
  var today = from.toDateString();
  return upcoming(s, from, 24 * 7)
    .filter(function (r) {
      if (r.kind !== "med") return true;
      var entry = doseEntry(log, r.medId, r.time);
      return !(r.due.toDateString() === today && entry && entry.status === "taken");
    })
    .map(function (r) {
      var time = fmt(r.due);
      var body = r.kind === "appt" ? translate(l, "rem.n.appt", { time: time })
        : s.lead ? translate(l, "rem.n.doseSoon", { time: time, n: s.lead }) : translate(l, "rem.n.dose", { time: time });
      return { key: r.id, at: r.at, title: "Bloom", body: body, extra: { kind: r.kind } };
    });
}

// Re-plans the phone's scheduled reminders (native app only; no-op on the web).
export async function syncNative() {
  if (!isNative()) return false;
  var s = getSettings();
  if (!s.enabled || (await currentPermission()) !== "granted") return replaceScheduled([]);
  return replaceScheduled(nativePlan(s));
}

// Checks every 30s and fires reminders that became due since the last check.
// Not used in the native app, where the phone delivers the scheduled notifications itself.
export function startScheduler(onInApp) {
  if (isNative()) return function () {};
  var last = new Date();
  function tick() {
    var s = getSettings();
    var now = new Date();
    if (s.enabled) {
      var fired = store.get("reminders_fired", {});
      var today = todayKey();
      var log = getTodayMedLog();
      var changed = false;
      upcoming(s, last, (now - last) / 3600000 + 0.01).forEach(function (r) {
        if (r.at > now) return;
        var key = today + ":" + r.id;
        if (fired[key]) return;
        var entry = r.kind === "med" ? doseEntry(log, r.medId, r.time) : null;
        if (r.kind === "med" && r.due.toDateString() === now.toDateString() && entry && entry.status === "taken") return;
        fired[key] = true;
        changed = true;
        notify(r.title, r.body, r.id).then(function (shown) {
          if (!shown && onInApp) onInApp("⏰ " + r.title + " · " + r.body);
        });
      });
      // Keep only today's entries so the log never grows.
      Object.keys(fired).forEach(function (k) { if (k.indexOf(today) !== 0) { delete fired[k]; changed = true; } });
      if (changed) store.set("reminders_fired", fired);
    }
    last = now;
  }
  var t = setInterval(tick, 30000);
  return function () { clearInterval(t); };
}

function icsStamp(d) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsText(v) {
  return String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

var ICS_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

// A calendar file with a repeating event (and alarm) for every dose time of her medications: daily,
// or on her chosen weekdays, from today (or her start date) until her end date or for `days` days.
export function doseCalendar(days, lead, meds) {
  var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bloom//IVF reminders//EN", "CALSCALE:GREGORIAN"];
  var now = new Date();
  (meds || getMeds()).forEach(function (med) {
    (med.times || []).forEach(function (time) {
      if (!isTime(time)) return;
      var hm = time.split(":");
      // First scheduled dose from now on (within the next 2 weeks).
      var start = null;
      for (var d = 0; d < 14 && !start; d++) {
        var c = at(d, +hm[0], +hm[1], 0);
        if (c > now && medActiveOn(med, c)) start = c;
      }
      if (!start) return;
      var rule = "RRULE:FREQ=DAILY";
      if (med.days && med.days.length) rule += ";BYDAY=" + med.days.map(function (x) { return ICS_DAYS[x]; }).join(",");
      if (med.end) rule += ";UNTIL=" + icsStamp(new Date(med.end + "T23:59:59"));
      else rule += ";COUNT=" + (days || 10);
      lines.push(
        "BEGIN:VEVENT",
        "UID:bloom-" + med.id + "-" + time.replace(":", "") + "@bloom",
        "DTSTAMP:" + icsStamp(new Date()),
        "DTSTART:" + icsStamp(start),
        "DTEND:" + icsStamp(new Date(start.getTime() + 10 * 60000)),
        rule,
        "SUMMARY:" + icsText("💜 " + med.name + (med.dose ? " " + med.dose : "")),
        "DESCRIPTION:Bloom reminder. Log it in Bloom when done. Always follow your clinic's instructions.",
        "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsText(med.name), "TRIGGER:-PT" + (lead || 0) + "M", "END:VALARM",
        "END:VEVENT"
      );
    });
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
