"use client";
import { useState } from "react";
import { auth, consent } from "../lib/store";
import { cloudEnabled } from "../lib/supabase";
import ConsentPanel from "./ConsentPanel";
import { PHASES, COACHES } from "../lib/demo-data";
import CoachAvatar from "./ui/CoachAvatar";
import { BloomFlower, Illustration } from "./ui/Graphics";
import { useT, LANGS } from "../lib/i18n";

var PROTOCOLS = ["Antagonist", "Long Lupron", "Mini IVF", "Natural", "Not sure yet"];

export default function OnboardingScreen({ user, onComplete }) {
  var { t, lang, setLang } = useT();
  const [step, setStep] = useState(0);
  const [clinic, setClinic] = useState("");
  const [protocol, setProtocol] = useState("");
  const [phase, setPhase] = useState("");
  const [stimDay, setStimDay] = useState(7);
  // Explicit consent comes before we ask for any cycle details (G11). Both choices start unticked.
  const [choice, setChoice] = useState({ cloud: false, ai: false });

  const steps = ["welcome", "consent", "clinic", "protocol", "phase", "day", "support", "done"];
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
        <button onClick={() => setStep(step - 1)} className="self-start px-4 py-4 text-bloom-muted text-sm"><span className="flip-rtl">←</span> {t("common.back")}</button>
      )}

      <div className="flex-1 px-6 py-4 overflow-y-auto">

        {current === "welcome" && (
          <div className="flex flex-col items-center text-center pt-8">
            <BloomFlower size={96} className="mb-3" />
            <p className="font-serif text-5xl font-light italic text-bloom-accent mb-2" style={{ letterSpacing: "0.12em" }}>bloom ✦</p>
            <h1 className="text-2xl font-bold text-bloom-text mt-6 mb-3">{t("onb.welcome", { name: user.name })}</h1>
            <p className="text-bloom-muted text-sm leading-relaxed mb-8">{t("onb.intro")}</p>
            <div className="w-full bg-white rounded-2xl p-5 border border-bloom-border text-start">
              {[t("onb.f1"), t("onb.f2"), t("onb.f3"), t("onb.f4"), t("onb.f5")].map((f, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="text-bloom-accent text-xs mt-1">✦</span>
                  <span className="text-bloom-muted text-sm">{f}</span>
                </div>
              ))}
            </div>
            <p className="text-bloom-muted text-xs leading-relaxed mt-4 px-2" role="note">{t("app.medical")}</p>
            <div className="flex justify-center gap-2 mt-5" role="group" aria-label={t("lang")}>
              {LANGS.map(function (l) {
                var on = lang === l.id;
                return (
                  <button key={l.id} onClick={function () { setLang(l.id); }} aria-pressed={on}
                    className={"px-3 py-1.5 rounded-full text-xs font-semibold border " + (on ? "bg-bloom-accent text-white border-bloom-accent" : "bg-white text-bloom-muted border-bloom-border")}>
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {current === "consent" && (
          <div className="pt-4">
            <div className="mb-4"><Illustration name="shield" size={88} /></div>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">{t("cons.title")}</h1>
            <ConsentPanel cloud={cloudEnabled() && !!user.cloud} value={choice} onChange={setChoice} />
          </div>
        )}

        {current === "clinic" && (
          <div className="pt-4">
            <div className="mb-4"><Illustration name="clinic" size={88} /></div>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">{t("onb.clinic")}</h1>
            <p className="text-bloom-muted text-sm mb-6">{t("onb.clinicQ")}</p>
            <input value={clinic} onChange={(e) => setClinic(e.target.value)}
              placeholder={t("onb.clinicPh")}
              className="w-full bg-white border border-bloom-border rounded-2xl px-4 py-4 text-bloom-text text-sm outline-none focus:border-bloom-accent" />
            <p className="text-bloom-dim text-xs mt-2">{t("onb.clinicHint")}</p>
          </div>
        )}

        {current === "protocol" && (
          <div className="pt-4">
            <div className="mb-4"><Illustration name="protocol" size={88} /></div>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">{t("onb.protocol")}</h1>
            <p className="text-bloom-muted text-sm mb-6">{t("onb.protocolQ")}</p>
            <div className="flex flex-col gap-3">
              {PROTOCOLS.map((p) => (
                <button key={p} onClick={() => setProtocol(p)}
                  className={`flex items-center justify-between px-4 py-4 rounded-2xl border text-start transition-all ${protocol === p ? "border-bloom-accent bg-purple-50" : "border-bloom-border bg-white"}`}>
                  <span className={`text-sm font-medium ${protocol === p ? "text-bloom-accent" : "text-bloom-muted"}`}>{p === "Not sure yet" ? t("onb.notSure") : p}</span>
                  {protocol === p && <span className="text-bloom-accent text-sm">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "phase" && (
          <div className="pt-4">
            <div className="mb-4"><Illustration name="phase" size={88} /></div>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">{t("onb.phase")}</h1>
            <p className="text-bloom-muted text-sm mb-6">{t("onb.phaseQ")}</p>
            <div className="flex flex-col gap-3">
              {PHASES.map((p) => (
                <button key={p.id} onClick={() => setPhase(p.id)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl border text-start transition-all ${phase === p.id ? "border-bloom-accent bg-purple-50" : "border-bloom-border bg-white"}`}>
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${phase === p.id ? "text-bloom-accent" : "text-bloom-text"}`}>{t("phase." + p.id)}</p>
                    <p className="text-bloom-dim text-xs mt-0.5">{t("phase." + p.id + ".d")}</p>
                  </div>
                  {phase === p.id && <span className="text-bloom-accent">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "day" && (
          <div className="pt-4">
            <div className="mb-4"><Illustration name="calendar" size={88} /></div>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">{t("onb.day")}</h1>
            <p className="text-bloom-muted text-sm mb-8">{t("onb.dayQ")}</p>
            <div className="flex items-center justify-center gap-6 mb-8">
              <button onClick={() => setStimDay(Math.max(1, stimDay - 1))}
                className="w-14 h-14 rounded-full border border-bloom-border bg-white text-bloom-accent text-2xl font-light">−</button>
              <div className="text-center">
                <p className="text-7xl font-bold text-bloom-accent" style={{ letterSpacing: "-3px" }}>{stimDay}</p>
                <p className="text-bloom-muted text-sm mt-1">{t("onb.dayLabel")}</p>
              </div>
              <button onClick={() => setStimDay(Math.min(14, stimDay + 1))}
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

        {current === "support" && (
          <div className="pt-4">
            <div className="mb-4"><Illustration name="therapy" size={88} /></div>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">{t("onb.support")}</h1>
            <p className="text-bloom-muted text-sm leading-relaxed mb-6">{t("onb.supportBody")}</p>
            <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2">{t("onb.meetCoach")}</p>
            {COACHES.slice(0, 1).map((c) => (
              <div key={c.id} className="bg-purple-50 rounded-2xl p-5 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <CoachAvatar coach={c} size={56} />
                  <div className="min-w-0">
                    <p className="font-semibold text-bloom-accent text-base"><bdi>{c.name}</bdi></p>
                    <p className="text-bloom-muted text-sm">{t("coach." + c.key + ".title")}</p>
                    <p className="text-bloom-muted text-xs">{t("coach." + c.key + ".city")}</p>
                  </div>
                </div>
                <a href={c.website} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white border border-bloom-accent text-bloom-accent font-semibold py-3 rounded-xl">
                  {t("coach.website")}
                </a>
                <p className="text-bloom-dim text-xs text-center mt-3">{t("onb.supportLater")}</p>
              </div>
            ))}
            <p className="text-bloom-dim text-[11px] leading-relaxed mt-3">{t("coach.notTreatment")}</p>
          </div>
        )}

        {current === "done" && (
          <div className="flex flex-col items-center text-center pt-8">
            <div className="mb-4"><Illustration name="bloom" size={140} /></div>
            <h1 className="text-2xl font-bold text-bloom-text mb-3">{t("onb.ready")}</h1>
            <p className="text-bloom-muted text-sm leading-relaxed mb-6">{t("onb.readyBody")}</p>
            <div className="w-full bg-white rounded-2xl p-5 border border-bloom-border text-start">
              {[[t("onb.sumName"), user.name], [t("onb.sumClinic"), clinic || "My Clinic"], [t("onb.sumProtocol"), protocol === "Not sure yet" ? t("onb.notSure") : protocol || "Antagonist"], [t("onb.sumPhase"), t("phase." + (phase || "stimulation"))], [t("onb.sumDay"), t("common.day", { n: stimDay })]].map(([label, value]) => (
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
        <button onClick={current === "done" ? finish : current === "consent" ? () => { consent.set(choice); setStep(step + 1); } : () => setStep(step + 1)}
          disabled={!canNext}
          className="w-full bg-bloom-accent text-white font-semibold py-4 rounded-2xl disabled:opacity-40 transition-opacity text-base">
          {current === "done" ? t("onb.open") : current === "welcome" ? t("onb.start") : current === "consent" ? t("cons.save") : t("onb.continue")}
        </button>
      </div>
    </div>
  );
}
