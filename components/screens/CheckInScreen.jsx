"use client";
import { useState } from "react";
import { Label } from "../ui/Common";
import { Illustration, MoodFace, PetalBurst } from "../ui/Graphics";
import { MOODS, SYMPTOMS } from "../../lib/demo-data";
import { getCheckins, saveCheckin, follicleStats } from "../../lib/cycle";

export default function CheckInScreen({ user }) {
  var [mood, setMood] = useState(null);
  var [symptoms, setSymptoms] = useState([]);
  var [anxiety, setAnxiety] = useState(3);
  var [hope, setHope] = useState(3);
  var [weight, setWeight] = useState("");
  var [note, setNote] = useState("");
  var [history, setHistory] = useState(getCheckins);
  var [saved, setSaved] = useState(null);
  var [error, setError] = useState("");
  var follicles = follicleStats().total;
  var lastWeight = (history.find(function (c) { return c.weight; }) || {}).weight;

  function toggle(s) {
    setSymptoms(function (prev) { return prev.includes(s) ? prev.filter(function (x) { return x !== s; }) : prev.concat(s); });
  }

  function save() {
    if (mood === null) { setError("Pick how you are feeling to save your check-in."); return; }
    var w = weight ? parseFloat(weight) : null;
    var entry = { date: new Date().toISOString(), stimDay: user.stimDay || 7, mood: mood, anxiety: anxiety, hope: hope, symptoms: symptoms, weight: w, note: note.trim() };
    var gain = w && lastWeight ? +(w - lastWeight).toFixed(1) : 0;
    setHistory(saveCheckin(entry));
    setSaved({ gain: gain });
    setError("");
  }

  function reset() {
    setMood(null); setSymptoms([]); setAnxiety(3); setHope(3); setWeight(""); setNote(""); setSaved(null);
  }

  if (saved) return (
    <div className="min-h-[80vh] bg-bloom-bg flex flex-col items-center justify-center px-6 text-center">
      <PetalBurst show />
      <div className="mb-4"><Illustration name="bloom" size={150} /></div>
      <h2 className="text-2xl font-bold text-bloom-text mb-2">Check-in saved</h2>
      <p className="text-bloom-muted text-sm mb-6 leading-relaxed">Every data point helps us understand your journey better.</p>
      {saved.gain >= 2 && (
        <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-left" role="alert">
          <p className="text-red-500 text-sm font-bold mb-1">OHSS alert: +{saved.gain} kg since last check-in</p>
          <p className="text-bloom-muted text-xs leading-relaxed">A gain of 2 kg or more in 24 hours can be a sign of OHSS. Please call your clinic today, especially if you feel short of breath or very bloated.</p>
        </div>
      )}
      <button onClick={reset} className="bg-bloom-accent text-white font-semibold px-8 py-3 rounded-xl">Check in again</button>
    </div>
  );

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">How are you today?</h1>
        <p className="text-bloom-muted text-sm">Takes about 1 minute</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <Label className="mb-4">Overall mood</Label>
        <div className="flex gap-1">
          {MOODS.map(function (m, i) {
            var on = mood === i;
            return (
              <button key={i} onClick={function () { setMood(i); setError(""); }} aria-pressed={on}
                className="flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all"
                style={{ borderColor: on ? m.c : "transparent", backgroundColor: on ? m.c + "12" : "transparent" }}>
                <span className="mb-1"><MoodFace mood={i} color={m.c} size={40} active={mood === null || on} /></span>
                <span className="text-xs font-semibold" style={{ color: on ? m.c : "#7A6880" }}>{m.l}</span>
              </button>
            );
          })}
        </div>
      </div>

      {[["Anxiety level", anxiety, setAnxiety, "#E07A8A"], ["Hopefulness", hope, setHope, "#9B6DC5"]].map(function (row) {
        var label = row[0], val = row[1], setVal = row[2], color = row[3];
        return (
          <div key={label} className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
            <div className="flex justify-between items-center mb-4">
              <p className="text-bloom-text text-sm font-medium">{label}</p>
              <p className="text-lg font-bold" style={{ color: color }}>{val} / 5</p>
            </div>
            <div className="flex justify-between items-center h-10">
              {[1, 2, 3, 4, 5].map(function (n) {
                var on = n <= val;
                return (
                  <button key={n} onClick={function () { setVal(n); }} aria-label={label + " " + n}
                    className="rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{ width: on ? 40 : 30, height: on ? 40 : 30, backgroundColor: on ? color : "#E8E0DB", color: on ? "white" : "#7A6880" }}>
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <Label className="mb-3">Symptoms today</Label>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map(function (s) {
            var on = symptoms.includes(s);
            return (
              <button key={s} onClick={function () { toggle(s); }} aria-pressed={on}
                className="px-3 py-1.5 rounded-full border text-xs transition-all"
                style={{ borderColor: on ? "#E07A8A" : "#E8E0DB", backgroundColor: on ? "#E07A8A12" : "transparent", color: on ? "#E07A8A" : "#7A6880" }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl p-4 border border-amber-200 mb-3" style={{ backgroundColor: "#FFFDF0" }}>
        <p className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "#C49A3C" }}>OHSS Watch · Daily Weight</p>
        <p className="text-bloom-muted text-xs mb-3">⚠ With {follicles} follicles, track daily. Alert if +2kg in 24hrs.</p>
        <div className="flex items-center gap-2">
          <input value={weight} onChange={function (e) { setWeight(e.target.value); }} placeholder={lastWeight ? "Last: " + lastWeight : "e.g. 62.4"} type="number" inputMode="decimal" step="0.1" aria-label="Weight in kg"
            className="flex-1 bg-white border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none focus:border-bloom-gold" />
          <span className="text-bloom-muted text-sm">kg</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-4">
        <Label className="mb-3">Journal note</Label>
        <textarea value={note} onChange={function (e) { setNote(e.target.value); }} placeholder="How are you really feeling today?" aria-label="Journal note"
          className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none resize-none h-20 focus:border-bloom-accent" />
      </div>

      {error && <p className="text-red-500 text-sm text-center mb-3" role="alert">{error}</p>}

      <button onClick={save} className="w-full bg-bloom-accent hover:bg-bloom-deep text-white font-semibold py-4 rounded-2xl mb-6 transition-colors">
        Save today check-in
      </button>

      <Label className="mb-3">Recent check-ins</Label>
      {history.slice(0, 5).map(function (c, i) {
        var m = MOODS[c.mood] || MOODS[2];
        return (
          <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-bloom-border mb-2">
            <MoodFace mood={c.mood} color={m.c} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-bloom-text text-sm font-semibold">{new Date(c.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · <span style={{ color: m.c }}>{m.l}</span></p>
              <p className="text-bloom-dim text-xs truncate">Anxiety {c.anxiety}/5 · Hope {c.hope}/5{c.symptoms.length ? " · " + c.symptoms.join(", ") : ""}</p>
            </div>
            {c.weight && <span className="text-bloom-muted text-xs">{c.weight} kg</span>}
          </div>
        );
      })}
    </div>
  );
}
