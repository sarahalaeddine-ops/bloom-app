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
import { FOLLICLES, MATURE_MM, MEDS, MOODS } from "../../lib/demo-data";
import { getTodayMedLog, getCheckins, follicleStats, TRIGGER_DAY, checkinStreak, lastSevenDays } from "../../lib/cycle";

function greeting() {
  var h = new Date().getHours();
  if (h < 12) return "greet.morning";
  if (h < 17) return "greet.afternoon";
  return "greet.evening";
}

export default function HomeScreen({ user, openMore, goTab }) {
  var { t, lang, locale } = useT();
  var name = user.name || "Sarah";
  var anon = !!user.anonymous;
  var stimDay = user.stimDay || 7;
  var protocol = user.protocol || "Antagonist";
  var clinic = user.clinic || "Emirates Fertility Centre";
  var e2 = user.e2 || 1840;
  var stats = follicleStats();
  var daysLeft = Math.max(0, TRIGGER_DAY + 2 - stimDay);
  var [log] = useState(getTodayMedLog);
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
            {isStim && <p className="text-bloom-accent text-xs font-semibold">{t("home.toRetrieval", { n: daysLeft })}</p>}
          </JourneyRing>
        </div>
        <div className="relative mt-3"><JourneyLegend /></div>
        <div className="relative flex justify-center mt-2">
          <button onClick={function () { openMore("profile"); }} className="text-bloom-accent text-xs font-semibold bg-white/70 rounded-full px-3 py-1">{t("home.changePhase")}</button>
        </div>
        <p className="relative text-bloom-muted text-xs text-center mt-2">{t("home.protocol", { p: "\u2068" + protocol + "\u2069" })} · <bdi>{clinic}</bdi></p>
      </div>

      <Stories user={user} openMore={openMore} />

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { val: stats.total, label: t("home.follicles"), sub: t("home.mature", { n: stats.mature }), color: "#9B6DC5", go: "charts" },
          { val: e2 >= 1000 ? (e2 / 1000).toFixed(1) + "k" : e2, label: t("home.e2"), sub: t("common.day", { n: stimDay }), color: "#E07A8A", go: "charts" },
          { val: "8AM", label: t("home.nextScan"), sub: t("home.tomorrow"), color: "#4ABFB0", go: "appointments" },
        ].map(function (s) {
          return (
            <button key={s.label} onClick={function () { openMore(s.go); }} className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: s.color + "30" }}>
              <p className="text-xl font-semibold" style={{ color: s.color, letterSpacing: "-1px" }}>{s.val}</p>
              <p className="text-bloom-muted text-xs mt-0.5">{s.label}</p>
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

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <div className="flex justify-between items-center mb-3">
          <Label>{t("home.follicleMap")}</Label>
          <span className="text-bloom-dim text-xs">{t("home.scan", { n: stimDay })}</span>
        </div>
        <div className="flex gap-2 mb-3">
          <Ovary label={t("home.rightOvary")} sizes={FOLLICLES.right} color="#9B6DC5" matureMm={MATURE_MM} />
          <Ovary label={t("home.leftOvary")} sizes={FOLLICLES.left} color="#4ABFB0" matureMm={MATURE_MM} flip />
        </div>
        <div className="flex flex-wrap gap-4 pt-2 border-t border-bloom-border">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-bloom-accent" /><span className="text-bloom-muted text-xs">{t("home.rightOvary")}</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-bloom-teal" /><span className="text-bloom-muted text-xs">{t("home.leftOvary")}</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full border border-bloom-muted" /><span className="text-bloom-muted text-xs">{t("home.filled", { mm: MATURE_MM })}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border">
        <div className="flex justify-between items-center mb-3">
          <Label>{t("home.medsToday")}</Label>
          <button onClick={function () { openMore("medications"); }} className="text-bloom-accent text-xs font-semibold">{t("home.log")}</button>
        </div>
        <div className="flex flex-col gap-2">
          {MEDS.map(function (m) {
            var entry = log[m.id];
            var taken = entry && entry.status === "taken";
            var missed = entry && entry.status === "missed";
            return (
              <button key={m.id} onClick={function () { openMore("medications"); }} className="flex items-center gap-3 p-3 rounded-xl border text-start"
                style={{ borderColor: taken ? m.color + "40" : "#E8E0DB", backgroundColor: taken ? m.color + "08" : "white" }}>
                <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
                  style={{ borderColor: taken ? m.color : "#C5B8CC", color: taken ? m.color : "#C5B8CC", backgroundColor: taken ? m.color + "18" : "#F0EBE8" }}>
                  {taken ? "✓" : "○"}
                </div>
                <div className="flex-1">
                  <p className="text-bloom-text text-sm font-semibold">{m.name} <span className="font-normal text-bloom-muted">{m.dose}</span></p>
                  <p className="text-bloom-dim text-xs"><bdi dir="ltr">{m.time}</bdi></p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ color: taken ? "#4ABFB0" : missed ? "#E07A8A" : "#C49A3C", backgroundColor: taken ? "#4ABFB015" : missed ? "#E07A8A15" : "#C49A3C15" }}>
                  {taken ? t("med.done") : missed ? t("med.missed") : t("med.pending")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {cal && <CycleCalendar user={user} onClose={function () { setCal(false); }} />}
    </div>
  );
}
