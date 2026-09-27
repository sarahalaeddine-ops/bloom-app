"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { store } from "../../../lib/store";
import { TWW_DAYS } from "../../../lib/demo-data";

var TOTAL = 13;

export default function TwoWeekWait({ onBack }) {
  var [day, setDay] = useState(function () { return store.get("twwDay", 5); });
  var info = TWW_DAYS.find(function (d) { return d.day === day; }) || TWW_DAYS[0];
  var left = TOTAL - day;

  function pick(d) {
    setDay(d);
    store.set("twwDay", d);
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Two Week Wait</h1>
        <p className="text-bloom-muted text-sm mb-4">Day by day, one breath at a time</p>

        <div className="rounded-2xl p-6 mb-3 text-center border" style={{ backgroundColor: "#FEF9EE", borderColor: "#C49A3C40" }}>
          <p className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "#C49A3C" }}>Days past transfer</p>
          <p className="font-bold" style={{ fontSize: "64px", color: "#C49A3C", lineHeight: 1, letterSpacing: "-3px" }}>{day}</p>
          <p className="text-bloom-muted text-sm mt-2">{left > 0 ? left + " days until your beta test" : "Beta day is today 💛"}</p>
          <div className="h-1.5 bg-white rounded-full overflow-hidden mt-4">
            <div className="h-full rounded-full transition-all" style={{ width: (day / TOTAL) * 100 + "%", backgroundColor: "#C49A3C" }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-bloom-border mb-3">
          <Label className="mb-2">Today&apos;s science · 5-day blastocyst</Label>
          <p className="text-bloom-text text-lg font-bold mb-1">{info.title}</p>
          <p className="text-bloom-muted text-sm leading-relaxed">{info.body}</p>
        </div>

        <Label className="mb-2">Choose your day</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {TWW_DAYS.map(function (d) {
            var on = d.day === day;
            return (
              <button key={d.day} onClick={function () { pick(d.day); }} aria-pressed={on}
                className="w-10 h-10 rounded-full text-sm font-semibold transition-all"
                style={{ backgroundColor: on ? "#C49A3C" : "#F0EBE8", color: on ? "white" : "#7A6880" }}>
                {d.day}
              </button>
            );
          })}
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <p className="text-bloom-accent text-sm font-bold mb-2">Gentle rules for the wait</p>
          {["Keep taking every medication until your clinic says stop", "Home tests before beta day can mislead — the blood test is the one to trust", "No symptoms is completely normal", "Plan something kind for yourself on beta day"].map(function (t) {
            return <p key={t} className="text-bloom-muted text-xs mb-1.5 last:mb-0">✦ {t}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
