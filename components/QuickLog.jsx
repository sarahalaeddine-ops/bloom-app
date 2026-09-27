"use client";
import { useState } from "react";
import { Sheet, Label } from "./ui/Common";
import { MoodFace } from "./ui/Graphics";
import { MEDS, MOODS, SYMPTOMS } from "../lib/demo-data";
import { getTodayMedLog, logDose, saveCheckin, getCheckins } from "../lib/cycle";

// Flo's "+" quick log, for IVF: tick a dose, or log mood, symptoms and weight in a few taps.
export default function QuickLog({ user, onClose, onSaved }) {
  var [log, setLog] = useState(getTodayMedLog);
  var [mood, setMood] = useState(null);
  var [symptoms, setSymptoms] = useState([]);
  var [weight, setWeight] = useState("");
  var [alert, setAlert] = useState(null);
  var pending = MEDS.filter(function (m) { return !(log[m.id] && log[m.id].status === "taken"); });

  function take(m) {
    setLog(logDose(m.id, { status: "taken", site: "", note: "" }));
    onSaved(m.name + " logged ✓");
  }

  function toggle(s) {
    setSymptoms(function (p) { return p.includes(s) ? p.filter(function (x) { return x !== s; }) : p.concat(s); });
  }

  function save() {
    var w = weight ? parseFloat(weight) : null;
    var last = (getCheckins().find(function (c) { return c.weight; }) || {}).weight;
    saveCheckin({ date: new Date().toISOString(), stimDay: user.stimDay || 7, mood: mood, anxiety: 3, hope: 3, symptoms: symptoms, weight: w, note: "", quick: true });
    onSaved("Logged. A new petal for your flower ✦");
    var gain = w && last ? +(w - last).toFixed(1) : 0;
    if (gain >= 2) setAlert(gain);
    else onClose();
  }

  if (alert) return (
    <Sheet onClose={onClose}>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4" role="alert">
        <p className="text-red-500 text-sm font-bold mb-1">OHSS alert: +{alert} kg since your last weigh-in</p>
        <p className="text-bloom-muted text-xs leading-relaxed">A gain of 2 kg or more in 24 hours can be a sign of OHSS. Please call your clinic today, especially if you feel short of breath or very bloated.</p>
      </div>
      <button onClick={onClose} className="w-full bg-bloom-accent text-white font-semibold py-3.5 rounded-xl">I&apos;ll call my clinic</button>
    </Sheet>
  );

  var canSave = mood !== null || symptoms.length > 0 || weight;

  return (
    <Sheet onClose={onClose}>
      <div className="w-10 h-1 bg-bloom-border rounded-full mx-auto -mt-2 mb-4" />
      <h2 className="text-xl font-bold text-bloom-text mb-1">Quick log</h2>
      <p className="text-bloom-muted text-sm mb-5">Tap what applies. Everything is optional.</p>

      <Label className="mb-2">Doses</Label>
      {pending.length === 0 ? (
        <p className="text-bloom-teal text-sm font-semibold mb-5">All of today&apos;s doses are logged ✓</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-5">
          {pending.map(function (m) {
            return (
              <button key={m.id} onClick={function () { take(m); }} className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold"
                style={{ borderColor: m.color + "55", color: m.color, backgroundColor: m.color + "0D" }}>
                <span className="w-4 h-4 rounded-full border-2" style={{ borderColor: m.color }} />
                {m.name} · {m.time}
              </button>
            );
          })}
        </div>
      )}

      <Label className="mb-2">Mood</Label>
      <div className="flex justify-between mb-5">
        {MOODS.map(function (m, i) {
          var on = mood === i;
          return (
            <button key={i} onClick={function () { setMood(on ? null : i); }} aria-pressed={on} aria-label={m.l}
              className="flex flex-col items-center gap-1 px-1 py-1.5 rounded-xl transition-transform" style={{ transform: on ? "scale(1.12)" : "none" }}>
              <MoodFace mood={i} color={m.c} size={44} active={mood === null || on} />
              <span className="text-[11px] font-semibold" style={{ color: on ? m.c : "#7A6880" }}>{m.l}</span>
            </button>
          );
        })}
      </div>

      <Label className="mb-2">Symptoms</Label>
      <div className="flex flex-wrap gap-2 mb-5">
        {SYMPTOMS.slice(0, 8).map(function (s) {
          var on = symptoms.includes(s);
          return (
            <button key={s} onClick={function () { toggle(s); }} aria-pressed={on}
              className="px-3 py-1.5 rounded-full border text-xs"
              style={{ borderColor: on ? "#E07A8A" : "#E8E0DB", backgroundColor: on ? "#E07A8A12" : "white", color: on ? "#E07A8A" : "#7A6880" }}>
              {s}
            </button>
          );
        })}
      </div>

      <label htmlFor="ql-weight" className="text-bloom-muted text-xs uppercase tracking-wider font-semibold block mb-2">Weight (OHSS watch)</label>
      <div className="flex items-center gap-2 mb-6">
        <input id="ql-weight" value={weight} onChange={function (e) { setWeight(e.target.value); }} type="number" inputMode="decimal" step="0.1" placeholder="e.g. 62.4"
          className="flex-1 bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none focus:border-bloom-accent" />
        <span className="text-bloom-muted text-sm">kg</span>
      </div>

      <button onClick={save} disabled={!canSave} className="w-full bg-bloom-accent text-white font-semibold py-3.5 rounded-xl disabled:opacity-40">
        Save
      </button>
    </Sheet>
  );
}
