"use client";
import { useState } from "react";
import { Logo, Label } from "../ui/Common";
import { JourneyRing, JourneyLegend, journeyDay, Ovary, Blobs, StreakFlower, MoodFace } from "../ui/Graphics";
import Stories from "../ui/Stories";
import { FOLLICLES, MATURE_MM, MEDS, MOODS, phaseLabel } from "../../lib/demo-data";
import { getTodayMedLog, getCheckins, follicleStats, TRIGGER_DAY, checkinStreak, lastSevenDays } from "../../lib/cycle";

function greeting() {
  var h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen({ user, openMore, goTab }) {
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
  var isStim = (user.phase || "stimulation") === "stimulation";

  return (
    <div className="px-4 pb-6">
      <div className="flex justify-between items-center py-4">
        <Logo size={24} />
        <p className="text-bloom-muted text-xs">Day {stimDay}{anon ? "" : " · " + name}</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl p-5 mb-3 border border-purple-200" style={{ background: "linear-gradient(160deg,#F6F0FC 0%,#FBF1F3 100%)" }}>
        <Blobs />
        <p className="relative text-bloom-muted text-xs uppercase tracking-wider mb-3 text-center">{greeting()}{anon ? "" : ", " + name} ✦</p>
        <div className="relative flex justify-center">
          <JourneyRing day={journeyDay(user.phase, stimDay)} size={220}>
            <p className="text-bloom-muted text-[11px] uppercase tracking-wider">{isStim ? "Stimulation" : "Current phase"}</p>
            <p className="font-serif italic text-bloom-text leading-none my-1" style={{ fontSize: isStim ? "44px" : "30px" }}>
              {isStim ? "Day " + stimDay : phaseLabel(user.phase)}
            </p>
            {isStim && <p className="text-bloom-accent text-xs font-semibold">~{daysLeft} days to retrieval</p>}
          </JourneyRing>
        </div>
        <div className="relative mt-3"><JourneyLegend /></div>
        <p className="relative text-bloom-muted text-xs text-center mt-2">{protocol} Protocol · {clinic}</p>
      </div>

      <Stories user={user} />

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { val: stats.total, label: "Follicles", sub: stats.mature + " mature", color: "#9B6DC5", go: "charts" },
          { val: e2 >= 1000 ? (e2 / 1000).toFixed(1) + "k" : e2, label: "E2 pg/mL", sub: "Day " + stimDay, color: "#E07A8A", go: "charts" },
          { val: "8AM", label: "Next Scan", sub: "Tomorrow", color: "#4ABFB0", go: "appointments" },
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

      <button onClick={function () { goTab("checkin"); }} className="w-full bg-white rounded-2xl p-4 border border-bloom-border mb-3 text-left">
        <div className="flex items-center gap-3">
          <StreakFlower days={streak} size={68} />
          <div className="flex-1 min-w-0">
            <Label>Your week</Label>
            <p className="text-bloom-text text-sm font-semibold mt-1">
              {streak > 0 ? streak + "-day check-in streak" : "Start your streak today"}
            </p>
            <p className="text-bloom-muted text-xs">{checkedIn ? "Checked in today ✓ Your flower is growing." : "Check in to grow a new petal. Takes 1 minute."}</p>
          </div>
          {!checkedIn && <span className="text-bloom-accent text-sm">→</span>}
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-bloom-border">
          {week.map(function (d, i) {
            var c = d.checkin;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                {c ? <MoodFace mood={c.mood} color={(MOODS[c.mood] || MOODS[2]).c} size={28} />
                   : <span className="w-7 h-7 rounded-full border-2 border-dashed border-bloom-border" />}
                <span className={"text-[10px] " + (i === 6 ? "text-bloom-accent font-bold" : "text-bloom-dim")}>
                  {i === 6 ? "Today" : d.date.toLocaleDateString("en-GB", { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
        </div>
      </button>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <div className="flex justify-between items-center mb-3">
          <Label>Follicle Map</Label>
          <span className="text-bloom-dim text-xs">Day {stimDay} scan</span>
        </div>
        <div className="flex gap-2 mb-3">
          <Ovary label="Right ovary" sizes={FOLLICLES.right} color="#9B6DC5" matureMm={MATURE_MM} />
          <Ovary label="Left ovary" sizes={FOLLICLES.left} color="#4ABFB0" matureMm={MATURE_MM} flip />
        </div>
        <div className="flex flex-wrap gap-4 pt-2 border-t border-bloom-border">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-bloom-accent" /><span className="text-bloom-muted text-xs">Right ovary</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-bloom-teal" /><span className="text-bloom-muted text-xs">Left ovary</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full border border-bloom-muted" /><span className="text-bloom-muted text-xs">Filled = mature (≥{MATURE_MM}mm)</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border">
        <div className="flex justify-between items-center mb-3">
          <Label>Medications Today</Label>
          <button onClick={function () { openMore("medications"); }} className="text-bloom-accent text-xs font-semibold">Log →</button>
        </div>
        <div className="flex flex-col gap-2">
          {MEDS.map(function (m) {
            var entry = log[m.id];
            var taken = entry && entry.status === "taken";
            var missed = entry && entry.status === "missed";
            return (
              <button key={m.id} onClick={function () { openMore("medications"); }} className="flex items-center gap-3 p-3 rounded-xl border text-left"
                style={{ borderColor: taken ? m.color + "40" : "#E8E0DB", backgroundColor: taken ? m.color + "08" : "white" }}>
                <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
                  style={{ borderColor: taken ? m.color : "#C5B8CC", color: taken ? m.color : "#C5B8CC", backgroundColor: taken ? m.color + "18" : "#F0EBE8" }}>
                  {taken ? "✓" : "○"}
                </div>
                <div className="flex-1">
                  <p className="text-bloom-text text-sm font-semibold">{m.name} <span className="font-normal text-bloom-muted">{m.dose}</span></p>
                  <p className="text-bloom-dim text-xs">{m.time}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ color: taken ? "#4ABFB0" : missed ? "#E07A8A" : "#C49A3C", backgroundColor: taken ? "#4ABFB015" : missed ? "#E07A8A15" : "#C49A3C15" }}>
                  {taken ? "Done ✓" : missed ? "Missed" : "Pending"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
