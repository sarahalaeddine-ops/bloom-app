"use client";
import { useState } from "react";
import { auth } from "../lib/store";

const PROTOCOLS = ["Antagonist", "Long Lupron", "Mini IVF", "Natural", "Not sure yet"];
const PHASES = [
  { id: "stimulation", label: "Stimulation",    icon: "💉", desc: "Daily injections, monitoring scans" },
  { id: "tww",         label: "Two Week Wait",  icon: "⏳", desc: "After transfer, waiting for beta" },
  { id: "retrieval",   label: "Post Retrieval", icon: "🥚", desc: "Eggs retrieved, waiting for embryos" },
  { id: "transfer",    label: "Pre Transfer",   icon: "💜", desc: "Preparing for embryo transfer" },
  { id: "planning",    label: "Planning",        icon: "📋", desc: "Planning my first or next cycle" },
];

export default function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [clinic, setClinic] = useState("");
  const [protocol, setProtocol] = useState("");
  const [phase, setPhase] = useState("");
  const [stimDay, setStimDay] = useState(7);

  const steps = ["welcome", "clinic", "protocol", "phase", "day", "therapy", "done"];
  const current = steps[step];
  const progress = (step / (steps.length - 1)) * 100;

  function finish() {
    const updated = auth.updateUser({ clinic: clinic || "My Clinic", protocol: protocol || "Antagonist", phase: phase || "stimulation", stimDay, onboarded: true });
    onComplete(updated);
  }

  const canNext = current === "welcome" ? true : current === "clinic" ? clinic.length > 0 : current === "protocol" ? protocol.length > 0 : current === "phase" ? phase.length > 0 : true;

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <div className="h-1 bg-bloom-border">
        <div className="h-1 bg-bloom-accent transition-all duration-500" style={{ width: progress + "%" }} />
      </div>

      {step > 0 && step < steps.length - 1 && (
        <button onClick={() => setStep(step - 1)} className="self-start px-4 py-4 text-bloom-muted text-sm">← Back</button>
      )}

      <div className="flex-1 px-6 py-4 overflow-y-auto">

        {current === "welcome" && (
          <div className="flex flex-col items-center text-center pt-8">
            <p className="font-serif text-5xl font-light italic text-bloom-accent mb-2" style={{ letterSpacing: "0.12em" }}>bloom ✦</p>
            <h1 className="text-2xl font-bold text-bloom-text mt-6 mb-3">Welcome, {user.name} 💜</h1>
            <p className="text-bloom-muted text-sm leading-relaxed mb-8">Bloom is your personal IVF companion. We will track your cycle, guide you through every phase, and be here when the anxiety peaks.</p>
            <div className="w-full bg-white rounded-2xl p-5 border border-bloom-border text-left">
              {["Live follicle map and hormone trends", "Nora AI — your IVF guide", "Daily check-ins and symptom tracking", "Secret Space for the hard feelings", "Partner mode to keep them in the loop"].map((f, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="text-bloom-accent text-xs mt-1">✦</span>
                  <span className="text-bloom-muted text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {current === "clinic" && (
          <div className="pt-4">
            <p className="text-4xl mb-4">🏥</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">Your clinic</h1>
            <p className="text-bloom-muted text-sm mb-6">Where are you doing your IVF?</p>
            <input value={clinic} onChange={(e) => setClinic(e.target.value)}
              placeholder="e.g. Emirates Fertility Centre"
              className="w-full bg-white border border-bloom-border rounded-2xl px-4 py-4 text-bloom-text text-sm outline-none focus:border-bloom-accent" />
            <p className="text-bloom-dim text-xs mt-2">This helps Bloom personalize your experience</p>
          </div>
        )}

        {current === "protocol" && (
          <div className="pt-4">
            <p className="text-4xl mb-4">💊</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">Your protocol</h1>
            <p className="text-bloom-muted text-sm mb-6">What protocol are you on?</p>
            <div className="flex flex-col gap-3">
              {PROTOCOLS.map((p) => (
                <button key={p} onClick={() => setProtocol(p)}
                  className={`flex items-center justify-between px-4 py-4 rounded-2xl border text-left transition-all ${protocol === p ? "border-bloom-accent bg-purple-50" : "border-bloom-border bg-white"}`}>
                  <span className={`text-sm font-medium ${protocol === p ? "text-bloom-accent" : "text-bloom-muted"}`}>{p}</span>
                  {protocol === p && <span className="text-bloom-accent text-sm">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "phase" && (
          <div className="pt-4">
            <p className="text-4xl mb-4">📍</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">Your current phase</h1>
            <p className="text-bloom-muted text-sm mb-6">Where are you in your cycle right now?</p>
            <div className="flex flex-col gap-3">
              {PHASES.map((p) => (
                <button key={p.id} onClick={() => setPhase(p.id)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl border text-left transition-all ${phase === p.id ? "border-bloom-accent bg-purple-50" : "border-bloom-border bg-white"}`}>
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${phase === p.id ? "text-bloom-accent" : "text-bloom-text"}`}>{p.label}</p>
                    <p className="text-bloom-dim text-xs mt-0.5">{p.desc}</p>
                  </div>
                  {phase === p.id && <span className="text-bloom-accent">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "day" && (
          <div className="pt-4">
            <p className="text-4xl mb-4">📅</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">Your stim day</h1>
            <p className="text-bloom-muted text-sm mb-8">What day of stimulation are you on?</p>
            <div className="flex items-center justify-center gap-6 mb-8">
              <button onClick={() => setStimDay(Math.max(1, stimDay - 1))}
                className="w-14 h-14 rounded-full border border-bloom-border bg-white text-bloom-accent text-2xl font-light">−</button>
              <div className="text-center">
                <p className="text-7xl font-bold text-bloom-accent" style={{ letterSpacing: "-3px" }}>{stimDay}</p>
                <p className="text-bloom-muted text-sm mt-1">Day of Stimulation</p>
              </div>
              <button onClick={() => setStimDay(Math.min(20, stimDay + 1))}
                className="w-14 h-14 rounded-full border border-bloom-border bg-white text-bloom-accent text-2xl font-light">+</button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({length: 14}, (_, i) => i + 1).map((d) => (
                <button key={d} onClick={() => setStimDay(d)}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${stimDay === d ? "bg-bloom-accent text-white" : "bg-bloom-surface text-bloom-muted"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "therapy" && (
          <div className="pt-4">
            <p className="text-4xl mb-4">◇</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">One free session. Mandatory.</h1>
            <p className="text-bloom-muted text-sm leading-relaxed mb-6">Every woman who joins Bloom gets one free session with an IVF-specialist therapist. We made it mandatory because most women who need it would never book it on their own.</p>
            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200">
              <p className="font-semibold text-bloom-accent text-base mb-1">Dr. Sarah Mitchell</p>
              <p className="text-bloom-muted text-sm mb-1">Reproductive Psychiatry · 12 years IVF support</p>
              <p className="text-bloom-muted text-sm mb-4">Next available: Tomorrow 2:00 PM</p>
              <button className="w-full bg-bloom-accent text-white font-semibold py-3 rounded-xl">Book my free session</button>
              <p className="text-bloom-dim text-xs text-center mt-3">You can also book later from the Therapy screen</p>
            </div>
          </div>
        )}

        {current === "done" && (
          <div className="flex flex-col items-center text-center pt-8">
            <p className="text-5xl mb-4">💜</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-3">Bloom is ready!</h1>
            <p className="text-bloom-muted text-sm leading-relaxed mb-6">Your cycle is set up. Nora is ready to guide you. You are not alone in this journey.</p>
            <div className="w-full bg-white rounded-2xl p-5 border border-bloom-border text-left">
              {[["Name", user.name], ["Clinic", clinic || "My Clinic"], ["Protocol", protocol || "Antagonist"], ["Phase", PHASES.find(p => p.id === phase)?.label || "Stimulation"], ["Stim Day", "Day " + stimDay]].map(([label, value]) => (
                <div key={label} className="flex justify-between py-3 border-b border-bloom-border last:border-0">
                  <span className="text-bloom-muted text-sm">{label}</span>
                  <span className="text-bloom-text text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-8 pt-4">
        <button onClick={current === "done" ? finish : () => setStep(step + 1)}
          disabled={!canNext}
          className="w-full bg-bloom-accent text-white font-semibold py-4 rounded-2xl disabled:opacity-40 transition-opacity text-base">
          {current === "done" ? "Open Bloom 💜" : current === "welcome" ? "Get Started →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
