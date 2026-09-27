"use client";
import { useState } from "react";
import { Logo, Label } from "../ui/Common";
import { FOLLICLES, MATURE_MM, MEDS, phaseLabel } from "../../lib/demo-data";
import { getTodayMedLog, getCheckins, follicleStats, TRIGGER_DAY } from "../../lib/cycle";

function greeting() {
  var h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Follicle({ size, color }) {
  var mature = size >= MATURE_MM;
  var px = Math.round(Math.max(30, Math.min(54, size * 2.8)));
  return (
    <div className="flex items-center justify-center rounded-full border-2 flex-shrink-0"
      title={size + "mm" + (mature ? " · mature" : "")}
      style={{ width: px, height: px, borderColor: color, backgroundColor: mature ? color : "white" }}>
      <span className="font-bold leading-none" style={{ color: mature ? "white" : color, fontSize: "10px" }}>{size}</span>
    </div>
  );
}

export default function HomeScreen({ user, openMore, goTab }) {
  var name = user.name || "Sarah";
  var stimDay = user.stimDay || 7;
  var protocol = user.protocol || "Antagonist";
  var clinic = user.clinic || "Emirates Fertility Centre";
  var e2 = user.e2 || 1840;
  var stats = follicleStats();
  var pct = Math.min(100, Math.round((stimDay / TRIGGER_DAY) * 100));
  var daysLeft = Math.max(0, TRIGGER_DAY + 2 - stimDay);
  var [log] = useState(getTodayMedLog);
  var [checkedIn] = useState(function () {
    var last = getCheckins()[0];
    return last && new Date(last.date).toDateString() === new Date().toDateString();
  });
  var isStim = (user.phase || "stimulation") === "stimulation";

  return (
    <div className="px-4 pb-6">
      <div className="flex justify-between items-center py-4">
        <Logo size={24} />
        <p className="text-bloom-muted text-xs">Day {stimDay} · {name}</p>
      </div>

      <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200 mb-3">
        <p className="text-bloom-muted text-xs uppercase tracking-wider mb-2">{greeting()}, {name} ✦</p>
        <h1 className="text-3xl font-light text-bloom-text mb-1" style={{ letterSpacing: "-1px" }}>
          {isStim ? <>Stimulation<br />Day {stimDay}</> : phaseLabel(user.phase)}
        </h1>
        <p className="text-bloom-muted text-sm mb-4">{protocol} Protocol · {clinic}</p>
        <div className="h-1.5 bg-bloom-border rounded-full overflow-hidden">
          <div className="h-full bg-bloom-accent rounded-full transition-all" style={{ width: pct + "%" }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-bloom-dim text-xs">Day 1</span>
          <span className="text-bloom-accent text-xs">{daysLeft} days to retrieval est.</span>
          <span className="text-bloom-dim text-xs">Trigger</span>
        </div>
      </div>

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

      {!checkedIn && (
        <button onClick={function () { goTab("checkin"); }} className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 border border-bloom-border mb-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-bloom-rose/10 flex items-center justify-center text-bloom-rose">✦</div>
          <div className="flex-1">
            <p className="text-bloom-text text-sm font-semibold">Daily check-in</p>
            <p className="text-bloom-muted text-xs">How are you today? Takes 1 minute</p>
          </div>
          <span className="text-bloom-accent text-sm">→</span>
        </button>
      )}

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <div className="flex justify-between items-center mb-3">
          <Label>Follicle Map</Label>
          <span className="text-bloom-dim text-xs">Day {stimDay} scan</span>
        </div>
        {[["Right ovary", FOLLICLES.right, "#9B6DC5"], ["Left ovary", FOLLICLES.left, "#4ABFB0"]].map(function (row) {
          return (
            <div key={row[0]} className="mb-3">
              <p className="text-xs font-semibold mb-2" style={{ color: row[2] }}>{row[0]} · {row[1].length}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {row[1].map(function (s, i) { return <Follicle key={i} size={s} color={row[2]} />; })}
              </div>
            </div>
          );
        })}
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
