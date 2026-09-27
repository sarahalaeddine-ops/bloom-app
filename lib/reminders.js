// Dose and appointment reminders.
// 1. While Bloom is open (or in a background tab), a scheduler fires system notifications
//    through the service worker (public/sw.js), with an in-app toast as a fallback.
// 2. For reminders when the app is fully closed, users can add every dose to their phone's
//    calendar (.ics with alarms), which works on every device today.
import { store, todayKey } from "./store";
import { MEDS, APPOINTMENTS } from "./demo-data";
import { getTodayMedLog } from "./cycle";

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

export function permission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function registerSW() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  } catch {
    return null;
  }
}

export async function requestPermission() {
  if (permission() === "unsupported") return "unsupported";
  var p = await Notification.requestPermission();
  if (p === "granted") await registerSW();
  return p;
}

export async function notify(title, body, tag) {
  if (permission() !== "granted") return false;
  var opts = { body: body, tag: tag, icon: "/apple-touch-icon.png", badge: "/apple-touch-icon.png", data: { url: "/" } };
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
export function upcoming(settings, from, hours) {
  var s = settings || getSettings();
  var start = from || new Date();
  var end = new Date(start.getTime() + (hours || 24) * 3600000);
  var list = [];
  if (s.meds) {
    [0, 1].forEach(function (day) {
      MEDS.forEach(function (med) {
        parseTimes(med.time).forEach(function (t, i) {
          list.push({
            id: "med-" + med.id + "-" + i + "-" + day, medId: med.id, day: day, kind: "med", color: med.color,
            at: at(day, t.h, t.m, s.lead), due: at(day, t.h, t.m, 0),
            title: med.name + " " + med.dose,
            body: (s.lead ? "Due in " + s.lead + " min" : "Due now") + " · " + (med.type === "injection" ? "injection" : "tablet") + ". Tap to log it.",
          });
        });
      });
    });
  }
  if (s.appts) {
    APPOINTMENTS.forEach(function (a) {
      list.push({
        id: "appt-" + a.id, kind: "appt", color: a.color,
        at: at(a.dayOffset, a.hour, a.minute, APPT_LEAD), due: at(a.dayOffset, a.hour, a.minute, 0),
        title: a.type + " in 1 hour",
        body: a.time + " · " + a.location,
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

// Checks every 30s and fires reminders that became due since the last check.
export function startScheduler(onInApp) {
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
        if (r.kind === "med" && r.day === 0 && log[r.medId] && log[r.medId].status === "taken") return;
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

// A calendar file with a daily repeating event (and alarm) for every dose time.
export function doseCalendar(days, lead) {
  var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bloom//IVF reminders//EN", "CALSCALE:GREGORIAN"];
  MEDS.forEach(function (med) {
    parseTimes(med.time).forEach(function (t, i) {
      var start = at(0, t.h, t.m, 0);
      if (start < new Date()) start = at(1, t.h, t.m, 0);
      lines.push(
        "BEGIN:VEVENT",
        "UID:bloom-" + med.id + "-" + i + "@bloom",
        "DTSTAMP:" + icsStamp(new Date()),
        "DTSTART:" + icsStamp(start),
        "DTEND:" + icsStamp(new Date(start.getTime() + 10 * 60000)),
        "RRULE:FREQ=DAILY;COUNT=" + (days || 10),
        "SUMMARY:💜 " + med.name + " " + med.dose,
        "DESCRIPTION:Bloom reminder. Log it in Bloom when done. Always follow your clinic's instructions.",
        "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + med.name + " " + med.dose, "TRIGGER:-PT" + (lead || 0) + "M", "END:VALARM",
        "END:VEVENT"
      );
    });
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
