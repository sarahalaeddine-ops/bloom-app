"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet } from "./Common";
import { MoodFace } from "./Graphics";
import { APPOINTMENTS, MOODS } from "../../lib/demo-data";
import { getCheckins, cycleStartDate, TRIGGER_DAY } from "../../lib/cycle";
import { getSleep, fmtHours } from "../../lib/sleep";
import { useT } from "../../lib/i18n";

function key(d) { return new Date(d).toDateString(); }
function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }

// Month calendar of the IVF cycle: stim days, planned days, appointments and logged days.
export default function CycleCalendar({ user, onClose }) {
  var { t, locale } = useT();
  var today = new Date();
  var [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  var [picked, setPicked] = useState(today);
  var isStim = (user.phase || "stimulation") === "stimulation";
  var stimDay = user.stimDay || 7;
  var start = cycleStartDate(stimDay);

  var checkins = {};
  getCheckins().forEach(function (c) { if (!checkins[key(c.date)]) checkins[key(c.date)] = c; });
  var sleep = {};
  getSleep().forEach(function (s) { sleep[key(s.date)] = s; });
  var appts = {};
  APPOINTMENTS.forEach(function (a) { var d = addDays(today, a.dayOffset); (appts[key(d)] = appts[key(d)] || []).push(a); });

  function stimOf(d) {
    if (!isStim) return 0;
    var n = Math.round((new Date(d).setHours(12) - new Date(start).setHours(12)) / 86400000) + 1;
    return n >= 1 && n <= TRIGGER_DAY ? n : 0;
  }

  var firstDow = (month.getDay() + 6) % 7; // Monday first
  var days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  var cells = [];
  for (var i = 0; i < firstDow; i++) cells.push(null);
  for (var d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  var weekdays = Array.from({ length: 7 }, function (_, i) { return new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "narrow" }); });

  var pk = key(picked), pc = checkins[pk], ps = sleep[pk], pa = appts[pk] || [], pn = stimOf(picked);

  return (
    <Sheet onClose={onClose}>
      <div className="w-10 h-1 bg-bloom-border rounded-full mx-auto -mt-2 mb-4" />
      <div className="flex items-center justify-between mb-3">
        <button onClick={function () { setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); }} aria-label={t("cal.prev")} className="w-10 h-10 flex items-center justify-center text-bloom-text"><ChevronLeft size={22} className="flip-rtl" /></button>
        <h2 className="text-lg font-bold text-bloom-text">{month.toLocaleDateString(locale, { month: "long", year: "numeric" })}</h2>
        <button onClick={function () { setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); }} aria-label={t("cal.next")} className="w-10 h-10 flex items-center justify-center text-bloom-text"><ChevronRight size={22} className="flip-rtl" /></button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
        {weekdays.map(function (w, i) { return <span key={i} className="text-[11px] text-bloom-dim font-semibold">{w}</span>; })}
      </div>
      <div className="grid grid-cols-7 gap-y-1 mb-3">
        {cells.map(function (c, i) {
          if (!c) return <span key={i} />;
          var k = key(c), n = stimOf(c), past = c <= today, ap = appts[k], ck = checkins[k];
          var isToday = k === key(today), isPicked = k === pk;
          var bg = n ? (past ? "#9B6DC5" : "transparent") : "transparent";
          return (
            <button key={i} onClick={function () { setPicked(c); }} aria-pressed={isPicked}
              aria-label={c.toLocaleDateString(locale, { day: "numeric", month: "long" }) + (n ? ", " + t("ql.stimDay", { n: n }) : "") + (ap ? ", " + ap.map(function (a) { return a.type; }).join(", ") : "")}
              className="flex flex-col items-center py-0.5">
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm relative"
                style={{
                  backgroundColor: bg, color: n && past ? "#fff" : "#1A1014",
                  border: n && !past ? "1.5px dashed #9B6DC5" : ap ? "2px solid " + ap[0].color : isToday ? "2px solid #1A1014" : "none",
                  boxShadow: isPicked ? "0 0 0 3px #E07A8A55" : "none",
                  fontWeight: isToday ? 700 : 400,
                }}>
                {c.getDate()}
              </span>
              <span className="h-1.5 mt-0.5 flex gap-0.5">
                {ck && <span className="w-1.5 h-1.5 rounded-full bg-bloom-rose" />}
                {ap && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ap[0].color }} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-[11px] text-bloom-muted">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-bloom-accent" />{t("cal.stimDone")}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-dashed border-bloom-accent" />{t("cal.stimPlanned")}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-bloom-gold" />{t("cal.appt")}</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-bloom-rose" />{t("cal.logged")}</span>
      </div>

      <div className="bg-bloom-surface rounded-2xl p-4">
        <p className="text-bloom-text font-bold">{picked.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}</p>
        {pn > 0 && <p className="text-bloom-accent text-sm font-semibold">{t("ql.stimDay", { n: pn })}</p>}
        {pa.map(function (a) {
          return <p key={a.id} className="text-sm text-bloom-text mt-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />{a.type} · <bdi>{a.time}</bdi></p>;
        })}
        {pc && (
          <div className="flex items-center gap-2 mt-2">
            {pc.mood !== null && pc.mood !== undefined && <MoodFace mood={pc.mood} color={(MOODS[pc.mood] || MOODS[2]).c} size={26} />}
            <p className="text-sm text-bloom-muted">
              {pc.mood !== null && pc.mood !== undefined ? t("mood." + pc.mood) : ""}
              {(pc.feelings || []).map(function (f) { return " · " + t("feel." + f); }).join("")}
              {pc.symptoms.map(function (s) { return " · " + t("sym." + s); }).join("")}
            </p>
          </div>
        )}
        {ps && <p className="text-sm text-bloom-muted mt-2">🌙 {t("sleep.asleep", { h: fmtHours(ps.hours) })}</p>}
        {!pn && !pa.length && !pc && !ps && <p className="text-sm text-bloom-dim mt-1">{t("cal.nothing")}</p>}
      </div>
    </Sheet>
  );
}
