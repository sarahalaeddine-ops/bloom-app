"use client";
import { useState, useEffect } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { APPOINTMENTS, PREP_TIPS } from "../../../lib/demo-data";

function when(apt) {
  var d = new Date();
  d.setDate(d.getDate() + apt.dayOffset);
  d.setHours(apt.hour, apt.minute, 0, 0);
  return d;
}

function pad(n) { return String(n).padStart(2, "0"); }

function icsDate(d) {
  return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
}

function downloadIcs(apt, clinic) {
  var start = when(apt);
  var end = new Date(start.getTime() + 60 * 60 * 1000);
  var ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bloom//IVF//EN", "BEGIN:VEVENT",
    "UID:bloom-" + apt.id + "-" + start.getTime() + "@bloomivf.app",
    "DTSTAMP:" + icsDate(new Date()), "DTSTART:" + icsDate(start), "DTEND:" + icsDate(end),
    "SUMMARY:" + apt.type, "LOCATION:" + (apt.location === "Emirates Fertility Centre" ? clinic : apt.location),
    "DESCRIPTION:With " + apt.doctor + " · Added from Bloom", "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  var url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  var a = document.createElement("a");
  a.href = url;
  a.download = apt.type.replace(/\s+/g, "-").toLowerCase() + ".ics";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Appointments({ onBack, user }) {
  var clinic = user.clinic || "Emirates Fertility Centre";
  var next = APPOINTMENTS[0];
  var [now, setNow] = useState(function () { return Date.now(); });
  var [open, setOpen] = useState(null);

  useEffect(function () {
    var t = setInterval(function () { setNow(Date.now()); }, 30000);
    return function () { clearInterval(t); };
  }, []);

  var diff = Math.max(0, when(next).getTime() - now);
  var days = Math.floor(diff / 86400000);
  var hours = Math.floor((diff % 86400000) / 3600000);
  var mins = Math.floor((diff % 3600000) / 60000);

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Appointments</h1>
        <p className="text-bloom-muted text-sm mb-4">Your upcoming schedule</p>

        <div className="bg-white rounded-2xl p-5 border mb-4" style={{ borderColor: "#9B6DC530" }}>
          <p className="text-xs font-bold uppercase tracking-wider text-bloom-accent mb-1">Next appointment</p>
          <h2 className="text-xl font-bold text-bloom-text mb-1">{next.type}</h2>
          <p className="text-bloom-muted text-sm mb-4">Tomorrow at {next.time} · {clinic}</p>
          <div className="grid grid-cols-3 gap-2 mb-4" aria-live="polite">
            {[[days, "days"], [hours, "hours"], [mins, "min"]].map(function (x) {
              return (
                <div key={x[1]} className="bg-bloom-surface rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-bloom-accent">{x[0]}</p>
                  <p className="text-bloom-muted text-xs">{x[1]}</p>
                </div>
              );
            })}
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-bloom-accent text-xs font-semibold mb-2">How to prepare</p>
            {PREP_TIPS.map(function (tip, i) {
              return (
                <div key={i} className="flex gap-2 mb-1.5 last:mb-0">
                  <span className="text-bloom-accent text-xs">✦</span>
                  <span className="text-bloom-muted text-xs">{tip}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Label className="mb-3">All upcoming</Label>
        {APPOINTMENTS.map(function (apt) {
          var isOpen = open === apt.id;
          return (
            <div key={apt.id} className="bg-white rounded-2xl border mb-2 overflow-hidden" style={{ borderColor: apt.color + "30" }}>
              <button onClick={function () { setOpen(isOpen ? null : apt.id); }} aria-expanded={isOpen} className="w-full text-left p-4 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: apt.color }} />
                <div className="flex-1">
                  <p className="text-bloom-text text-sm font-semibold">{apt.type}</p>
                  <p className="text-bloom-muted text-xs">{apt.label} · {apt.time}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: apt.color + "15", color: apt.color }}>{apt.dayOffset}d</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-bloom-border animate-fade-in">
                  <p className="text-bloom-muted text-xs mt-2"><b className="text-bloom-text">Doctor:</b> {apt.doctor}</p>
                  <p className="text-bloom-muted text-xs mt-1"><b className="text-bloom-text">Where:</b> {apt.location === "Emirates Fertility Centre" ? clinic : apt.location}</p>
                  <p className="text-bloom-muted text-xs mt-1"><b className="text-bloom-text">Date:</b> {when(apt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
                  <button onClick={function () { downloadIcs(apt, clinic); }} className="mt-3 text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: apt.color, backgroundColor: apt.color + "15" }}>
                    + Add to calendar
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <p className="text-bloom-dim text-xs text-center mt-3">Dates marked ~ are estimates. Your clinic confirms the exact time.</p>
      </div>
    </div>
  );
}
