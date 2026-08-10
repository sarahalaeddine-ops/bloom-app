"use client";
import { useState } from "react";

const MOODS = [{mark:"🥺",l:"Hard",c:"#E07A8A"},{mark:"😔",l:"Low",c:"#C49A3C"},{mark:"😶",l:"Okay",c:"#7A6880"},{mark:"🌱",l:"Hopeful",c:"#9B6DC5"},{mark:"🌸",l:"Good",c:"#4ABFB0"}];
const SYMPTOMS = ["Bloating","Cramping","Headache","Nausea","Breast tenderness","Hot flashes","Fatigue","Injection site pain","Back pain","Mood swings","Spotting","Insomnia"];

export default function CheckInScreen() {
  const [mood, setMood] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [anxiety, setAnxiety] = useState(3);
  const [hope, setHope] = useState(3);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  function toggle(s) {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  if (done) return (
    <div className="min-h-screen bg-bloom-bg flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl text-bloom-accent mb-4">✦</p>
      <h2 className="text-2xl font-bold text-bloom-text mb-2">Check-in saved</h2>
      <p className="text-bloom-muted text-sm mb-8 leading-relaxed">Every data point helps us understand your journey better.</p>
      <button onClick={() => setDone(false)} className="bg-bloom-accent text-white font-semibold px-8 py-3 rounded-xl">Check in again</button>
    </div>
  );

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">How are you today?</h1>
        <p className="text-bloom-muted text-sm">Takes about 1 minute</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-4">Overall mood</p>
        <div className="flex gap-1">
          {MOODS.map((m, i) => (
            <button key={i} onClick={() => setMood(i)}
              className="flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all"
              style={{borderColor: mood === i ? m.c : "transparent", backgroundColor: mood === i ? m.c + "12" : "transparent"}}>
              <span className="text-2xl mb-1">{m.mark}</span>
              <span className="text-xs font-semibold" style={{color: mood === i ? m.c : "#C5B8CC"}}>{m.l}</span>
            </button>
          ))}
        </div>
      </div>

      {[["Anxiety level", anxiety, setAnxiety, "#E07A8A"], ["Hopefulness", hope, setHope, "#9B6DC5"]].map(([label, val, setVal, color]) => (
        <div key={label} className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <div className="flex justify-between items-center mb-4">
            <p className="text-bloom-text text-sm font-medium">{label}</p>
            <p className="text-lg font-bold" style={{color}}>{val} / 5</p>
          </div>
          <div className="flex justify-between items-center">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setVal(n)}
                className="rounded-full flex items-center justify-center text-white text-xs font-bold transition-all"
                style={{width: n <= val ? 40 : 30, height: n <= val ? 40 : 30, backgroundColor: n <= val ? color : "#E8E0DB", color: n <= val ? "white" : "#7A6880"}}>
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">Symptoms today</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s, i) => (
            <button key={i} onClick={() => toggle(s)}
              className="px-3 py-1.5 rounded-full border text-xs transition-all"
              style={{borderColor: symptoms.includes(s) ? "#E07A8A" : "#E8E0DB", backgroundColor: symptoms.includes(s) ? "#E07A8A12" : "transparent", color: symptoms.includes(s) ? "#E07A8A" : "#7A6880"}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-amber-200 mb-3" style={{backgroundColor:"#FFFDF0"}}>
        <p className="text-xs uppercase tracking-wider font-semibold mb-2" style={{color:"#C49A3C"}}>OHSS Watch · Daily Weight</p>
        <p className="text-bloom-muted text-xs mb-3">With 11 follicles, track daily. Alert if +2kg in 24hrs.</p>
        <div className="flex items-center gap-2">
          <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 62.4" type="number"
            className="flex-1 bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none" />
          <span className="text-bloom-muted text-sm">kg</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-4">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">Journal note</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="How are you really feeling today?"
          className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none resize-none h-20" />
      </div>

      <button onClick={() => setDone(true)} className="w-full bg-bloom-accent text-white font-semibold py-4 rounded-2xl">
        Save today check-in
      </button>
    </div>
  );
}
