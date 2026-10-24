"use client";
import { useState } from "react";
import { Logo, Label } from "../ui/Common";
import { JourneyRing, JourneyLegend, journeyDay, Ovary, Blobs, StreakFlower, MoodFace } from "../ui/Graphics";
import Stories from "../ui/Stories";
import { useT } from "../../lib/i18n";
import SleepCard from "../ui/SleepCard";
import CycleStats from "../ui/CycleStats";
import CycleCalendar from "../ui/CycleCalendar";
import { CalendarDays } from "lucide-react";
import { MATURE_MM, MOODS } from "../../lib/demo-data";
import { getTodayMedLog, doseEntry, getCheckins, follicleStats, latestFollicles, latestE2, TRIGGER_DAY, checkinStreak, lastSevenDays } from "../../lib/cycle";
import { dosesOn, upcomingAppts, fmtClock, apptAt, daysBetween } from "../../lib/schedule";
import { apptLabel, relDay } from "../ScheduleForms";
import ScanLog, { ScanEmpty } from "../ScanLog";

function greeting() {
  var h = new Date().getHours();
  if (h < 12) return "greet.morning";
  if (h < 17) return "greet.afternoon";
  return "greet.evening";
}

export default function HomeScreen({ user, openMore, goTab }) {
  var { t, lang, locale } = useT();
  var name = user.name || "";
  var anon = !!user.anonymous || !name;
  var stimDay = user.stimDay || 1;
  var protocol = user.protocol || "";
  var clinic = user.clinic || "";
  var demo = user.id === "demo";
  // Her own latest scan; the demo persona's seeded values only for the demo (lib/cycle.js).
  var [, setScanTick] = useState(0);
  var [scanOpen, setScanOpen] = useState(false);
  var e2Last = latestE2();
  var follicles = latestFollicles();
  var stats = follicleStats();
  // Her own schedule (lib/schedule.js): today's doses and her next appointment.
  var [log] = useState(getTodayMedLog);
  var [doses] = useState(function () { return dosesOn(new Date()); });
  var [appts] = useState(function () { return upcomingAppts(new Date()); });
  var next = appts[0] || null;
  var retrieval = appts.find(function (a) { return a.kind === "retrieval"; });
  // Days to retrieval: the demo's estimate, or her own retrieval appointment when she has added one.
  var daysLeft = demo ? Math.max(0, TRIGGER_DAY + 2 - stimDay) : retrieval ? Math.max(0, daysBetween(new Date(), apptAt(retrieval))) : null;
  var [checkedIn] = useState(function () {
    var last = getCheckins()[0];
    return last && new Date(last.date).toDateString() === new Date().toDateString();
  });
  var [streak] = useState(checkinStreak);
  var [week] = useState(lastSevenDays);
  var [cal, setCal] = useState(false);
  var isStim = (user.phase || "stimulation") === "stimulation";

  return (
    <div className="px-4 pb-6">
      <div className="flex justify-between items-center py-4">
        <Logo size={24} />
        <button onClick={function () { setCal(true); }} aria-label={t("cal.open")} className="flex items-center gap-2 text-bloom-text">
          <span className="text-sm font-semibold">{new Date().toLocaleDateString(locale, { day: "numeric", month: "long" })}</span>
          <span className="w-10 h-10 rounded-xl border-2 border-bloom-text flex items-center justify-center"><CalendarDays size={20} /></span>
        </button>
      </div>

      <div className="relative overflow-hidden rounded-3xl p-5 mb-3 border border-purple-200" style={{ background: "linear-gradient(160deg,#F6F0FC 0%,#FBF1F3 100%)" }}>
        <Blobs />
        <p className="relative text-bloom-muted text-xs uppercase tracking-wider mb-3 text-center">{t(greeting())}{anon ? "" : (lang === "ar" ? "، " : ", ") + name} ✦</p>
        <div className="relative flex justify-center">
          <JourneyRing day={journeyDay(user.phase, stimDay)} size={220}>
            <p className="text-bloom-muted text-[11px] uppercase tracking-wider">{isStim ? t("home.stimulation") : t("home.currentPhase")}</p>
            <p className="font-serif italic text-bloom-text leading-none my-1" style={{ fontSize: isStim ? "44px" : "30px" }}>
              {isStim ? t("common.day", { n: stimDay }) : t("phase." + user.phase)}
            </p>
            {isStim && daysLeft !== null && <p className="text-bloom-accent text-xs font-semibold">{t("home.toRetrieval", { n: daysLeft })}</p>}
          </JourneyRing>
        </div>
        <div className="relative mt-3"><JourneyLegend /></div>
        <div className="relative flex justify-center mt-2">
          <button onClick={function () { openMore("profile"); }} className="text-bloom-accent text-xs font-semibold bg-white/70 rounded-full px-3 py-1">{t("home.changePhase")}</button>
        </div>
        {(protocol || clinic) && <p className="relative text-bloom-muted text-xs text-center mt-2">{protocol ? t("home.protocol", { p: "⁨" + protocol + "⁩" }) : ""}{protocol && clinic ? " · " : ""}{clinic ? <bdi>{clinic}</bdi> : null}</p>}
      </div>

      <Stories user={user} openMore={openMore} />

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { val: stats.none ? "—" : stats.total, label: t("home.follicles"), sub: stats.none ? t("scan.none") : t("home.mature", { n: stats.mature }), color: "#9B6DC5", go: "charts" },
          { val: !e2Last ? "—" : e2Last.value >= 1000 ? (e2Last.value / 1000).toFixed(1) + "k" : e2Last.value, label: t("home.e2"), sub: e2Last ? t("common.day", { n: e2Last.day }) : t("scan.none"), color: "#E07A8A", go: "charts" },
          next
            ? { val: fmtClock(next.time, locale), label: apptLabel(next, t), sub: relDay(next, t), color: "#4ABFB0", go: "appointments", ltr: true }
            : { val: "—", label: t("home.nextAppt"), sub: t("home.addAppt"), color: "#4ABFB0", go: "appointments" },
        ].map(function (s) {
          return (
            <button key={s.label} onClick={function () { openMore(s.go); }} className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: s.color + "30" }}>
              <p className={"font-semibold " + (s.ltr ? "text-lg" : "text-xl")} style={{ color: s.color, letterSpacing: "-1px" }}><bdi>{s.val}</bdi></p>
              <p className="text-bloom-muted text-xs mt-0.5 truncate"><bdi>{s.label}</bdi></p>
              <p className="text-bloom-dim text-xs">{s.sub}</p>
            </button>
          );
        })}
      </div>

      <button onClick={function () { goTab("checkin"); }} className="w-full bg-white rounded-2xl p-4 border border-bloom-border mb-3 text-start">
        <div className="flex items-center gap-3">
          <StreakFlower days={streak} size={68} />
          <div className="flex-1 min-w-0">
            <Label>{t("home.week")}</Label>
            <p className="text-bloom-text text-sm font-semibold mt-1">
              {streak > 0 ? t("home.streak", { n: streak }) : t("home.startStreak")}
            </p>
            <p className="text-bloom-muted text-xs">{checkedIn ? t("home.checkedIn") : t("home.checkInCta")}</p>
          </div>
          {!checkedIn && <span className="text-bloom-accent text-sm flip-rtl">→</span>}
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-bloom-border">
          {week.map(function (d, i) {
            var c = d.checkin;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                {c ? <MoodFace mood={c.mood} color={(MOODS[c.mood] || MOODS[2]).c} size={28} />
                   : <span className="w-7 h-7 rounded-full border-2 border-dashed border-bloom-border" />}
                <span className={"text-[10px] " + (i === 6 ? "text-bloom-accent font-bold" : "text-bloom-dim")}>
                  {i === 6 ? t("home.today") : d.date.toLocaleDateString(locale, { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
        </div>
      </button>

      <div id="sleep-card"><SleepCard /></div>

      <CycleStats user={user} />

      {!follicles ? (
        <ScanEmpty title={t("home.follicleMap")} body={t("scan.emptyHome")} onLog={function () { setScanOpen(true); }} />
      ) : (
      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <div className="flex justify-between items-center mb-3">
          <Label>{t("home.follicleMap")}</Label>
          <span className="text-bloom-dim text-xs">{t("home.scan", { n: follicles.day })}</span>
        </div>
        <div className="flex gap-2 mb-3">
          <Ovary label={t("home.rightOvary")} sizes={follicles.right} color="#9B6DC5" matureMm={MATURE_MM} />
          <Ovary label={t("home.leftOvary")} sizes={follicles.left} color="#4ABFB0" matureMm={MATURE_MM} flip />
        </div>
        <div className="flex flex-wrap gap-4 pt-2 border-t border-bloom-border">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-bloom-accent" /><span className="text-bloom-muted text-xs">{t("home.rightOvary")}</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-bloom-teal" /><span className="text-bloom-muted text-xs">{t("home.leftOvary")}</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full border border-bloom-muted" /><span className="text-bloom-muted text-xs">{t("home.filled", { mm: MATURE_MM })}</span></div>
        </div>
      </div>
      )}

      <div className="bg-white rounded-2xl p-4 border border-bloom-border">
        <div className="flex justify-between items-center mb-3">
          <Label>{t("home.medsToday")}</Label>
          <button onClick={function () { openMore("medications"); }} className="text-bloom-accent text-xs font-semibold">{doses.length ? t("home.log") : t("home.manage")}</button>
        </div>
        {doses.length === 0 ? (
          <button onClick={function () { openMore("medications"); }} className="w-full text-start rounded-xl border border-dashed border-bloom-accent/40 p-3">
            <p className="text-bloom-text text-sm font-semibold">{t("home.noMeds")}</p>
            <p className="text-bloom-muted text-xs mt-0.5">{t("home.noMedsBody")}</p>
          </button>
        ) : (
        <div className="flex flex-col gap-2">
          {doses.map(function (d) {
            var m = d.med;
            var entry = doseEntry(log, m.id, d.time);
            var taken = entry && entry.status === "taken";
            var missed = entry && entry.status === "missed";
            return (
              <button key={d.key} onClick={function () { openMore("medications"); }} className="flex items-center gap-3 p-3 rounded-xl border text-start"
                style={{ borderColor: taken ? m.color + "40" : "#E8E0DB", backgroundColor: taken ? m.color + "08" : "white" }}>
                <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ borderColor: taken ? m.color : "#C5B8CC", color: taken ? m.color : "#C5B8CC", backgroundColor: taken ? m.color + "18" : "#F0EBE8" }}>
                  {taken ? "✓" : "○"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-bloom-text text-sm font-semibold truncate"><bdi>{m.name}</bdi> {m.dose && <span className="font-normal text-bloom-muted"><bdi>{m.dose}</bdi></span>}</p>
                  <p className="text-bloom-dim text-xs"><bdi>{fmtClock(d.time, locale)}</bdi></p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ color: taken ? "#4ABFB0" : missed ? "#E07A8A" : "#C49A3C", backgroundColor: taken ? "#4ABFB015" : missed ? "#E07A8A15" : "#C49A3C15" }}>
                  {taken ? t("med.done") : missed ? t("med.missed") : t("med.pending")}
                </span>
              </button>
            );
          })}
        </div>
        )}
      </div>
      {scanOpen && <ScanLog user={user} onClose={function () { setScanOpen(false); }} onSaved={function () { setScanOpen(false); setScanTick(function (n) { return n + 1; }); }} />}
      {cal && <CycleCalendar user={user} onClose={function () { setCal(false); }} />}
    </div>
  );
}
