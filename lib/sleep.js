// Sleep & rest: logged nights ({ date, hours, quality: 1-3 }) and a simple, kind score.
import { store } from "./store";
import { isDemoUser } from "./cycle";

function nightsAgo(n) {
  var d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(7, 0, 0, 0);
  return d.toISOString();
}

// A realistic week for the demo persona only: injection nights are shorter. Real accounts start empty.
var SEED = [[1, 7.4, 3], [2, 6.9, 2], [3, 8.0, 3], [4, 7.5, 2], [5, 5.8, 1], [6, 7.2, 2], [7, 6.5, 2]].map(function (r) {
  return { date: nightsAgo(r[0]), hours: r[1], quality: r[2] };
});

export function getSleep() {
  return store.get("sleep", isDemoUser() ? SEED : []);
}

export function logSleep(entry) {
  var key = new Date(entry.date).toDateString();
  var list = getSleep().filter(function (s) { return new Date(s.date).toDateString() !== key; });
  list.unshift(entry);
  list.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  store.set("sleep", list.slice(0, 60));
  return list;
}

// 0-1 value plus a label key: great / good / fair / restless.
export function sleepScore(entry) {
  if (!entry) return null;
  var v = Math.min(1, entry.hours / 8) * 0.7 + (entry.quality / 3) * 0.3;
  var key = v >= 0.85 ? "great" : v >= 0.7 ? "good" : v >= 0.55 ? "fair" : "restless";
  return { value: v, key: key };
}

// "7h 24m" in her language when t is given ("sleep.hm" / "sleep.h").
export function fmtHours(h, t) {
  var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  if (mm === 60) { hh++; mm = 0; }
  if (t) return mm ? t("sleep.hm", { h: hh, m: mm }) : t("sleep.h", { h: hh });
  return hh + "h" + (mm ? " " + mm + "m" : "");
}
