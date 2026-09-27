"use client";
import { useState } from "react";
import { Label } from "../ui/Common";
import { Illustration, MoodFace, PetalBurst } from "../ui/Graphics";
import { useT } from "../../lib/i18n";
import { MOODS, FEELINGS, SYMPTOMS } from "../../lib/demo-data";
import LogChips from "../ui/LogChips";
import { getCheckins, saveCheckin, follicleStats } from "../../lib/cycle";

export default function CheckInScreen({ user }) {
  var { t, locale } = useT();
  var [mood, setMood] = useState(null);
  var [symptoms, setSymptoms] = useState([]);
  var [feelings, setFeelings] = useState([]);
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
    if (mood === null) { setError(t("ci.pickMood")); return; }
    var w = weight ? parseFloat(weight) : null;
    var entry = { date: new Date().toISOString(), stimDay: user.stimDay || 7, mood: mood, anxiety: anxiety, hope: hope, feelings: feelings, symptoms: symptoms, weight: w, note: note.trim() };
    var gain = w && lastWeight ? +(w - lastWeight).toFixed(1) : 0;
    setHistory(saveCheckin(entry));
    setSaved({ gain: gain });
    setError("");
  }

  function reset() {
    setMood(null); setSymptoms([]); setFeelings([]); setAnxiety(3); setHope(3); setWeight(""); setNote(""); setSaved(null);
  }

  if (saved) return (
    <div className="min-h-[80vh] bg-bloom-bg flex flex-col items-center justify-center px-6 text-center">
      <PetalBurst show />
      <div className="mb-4"><Illustration name="bloom" size={150} /></div>
      <h2 className="text-2xl font-bold text-bloom-text mb-2">{t("ci.saved")}</h2>
      <p className="text-bloom-muted text-sm mb-6 leading-relaxed">{t("ci.savedSub")}</p>
      {saved.gain >= 2 && (
        <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-start" role="alert">
          <p className="text-red-500 text-sm font-bold mb-1">{t("ohss.title", { n: saved.gain })}</p>
          <p className="text-bloom-muted text-xs leading-relaxed">{t("ohss.body")}</p>
        </div>
      )}
      <button onClick={reset} className="bg-bloom-accent text-white font-semibold px-8 py-3 rounded-xl">{t("ci.again")}</button>
    </div>
  );

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">{t("ci.title")}</h1>
        <p className="text-bloom-muted text-sm">{t("ci.sub")}</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <Label className="mb-4">{t("ci.mood")}</Label>
        <div className="flex gap-1">
          {MOODS.map(function (m, i) {
            var on = mood === i;
            return (
              <button key={i} onClick={function () { setMood(i); setError(""); }} aria-pressed={on}
                className="flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all"
                style={{ borderColor: on ? m.c : "transparent", backgroundColor: on ? m.c + "12" : "transparent" }}>
                <span className="mb-1"><MoodFace mood={i} color={m.c} size={40} active={mood === null || on} /></span>
                <span className="text-xs font-semibold" style={{ color: on ? m.c : "#7A6880" }}>{t("mood." + i)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <Label className="mb-3">{t("ci.feelings")}</Label>
        <LogChips kind="feeling" items={FEELINGS} selected={feelings}
          onToggle={function (id) { setFeelings(function (p) { return p.includes(id) ? p.filter(function (x) { return x !== id; }) : p.concat(id); }); }} />
      </div>

      {[[t("ci.anxiety"), anxiety, setAnxiety, "#E07A8A"], [t("ci.hope"), hope, setHope, "#9B6DC5"]].map(function (row) {
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
        <Label className="mb-3">{t("ci.symptoms")}</Label>
        <LogChips kind="symptom" items={SYMPTOMS} selected={symptoms} onToggle={toggle} />
      </div>

      <div className="rounded-2xl p-4 border border-amber-200 mb-3" style={{ backgroundColor: "#FFFDF0" }}>
        <p className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "#C49A3C" }}>{t("ci.ohss")}</p>
        <p className="text-bloom-muted text-xs mb-3">{t("ci.ohssNote", { n: follicles })}</p>
        <div className="flex items-center gap-2">
          <input value={weight} onChange={function (e) { setWeight(e.target.value); }} placeholder={lastWeight ? t("ci.last", { w: lastWeight }) : "62.4"} type="number" inputMode="decimal" step="0.1" aria-label="Weight in kg"
            className="flex-1 bg-white border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none focus:border-bloom-gold" />
          <span className="text-bloom-muted text-sm">kg</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-4">
        <Label className="mb-3">{t("ci.journal")}</Label>
        <textarea value={note} onChange={function (e) { setNote(e.target.value); }} placeholder={t("ci.journalPh")} aria-label={t("ci.journal")}
          className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none resize-none h-20 focus:border-bloom-accent" />
      </div>

      {error && <p className="text-red-500 text-sm text-center mb-3" role="alert">{error}</p>}

      <button onClick={save} className="w-full bg-bloom-accent hover:bg-bloom-deep text-white font-semibold py-4 rounded-2xl mb-6 transition-colors">
        {t("ci.save")}
      </button>

      <Label className="mb-3">{t("ci.recent")}</Label>
      {history.slice(0, 5).map(function (c, i) {
        var m = MOODS[c.mood] || MOODS[2];
        return (
          <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-bloom-border mb-2">
            <MoodFace mood={c.mood} color={m.c} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-bloom-text text-sm font-semibold">{new Date(c.date).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })} · <span style={{ color: m.c }}>{t("mood." + c.mood)}</span></p>
              <p className="text-bloom-dim text-xs truncate">{t("ci.anxietyShort", { n: c.anxiety })} · {t("ci.hopeShort", { n: c.hope })}{(c.feelings || []).length ? " · " + c.feelings.map(function (x) { return t("feel." + x); }).join(", ") : ""}{c.symptoms.length ? " · " + c.symptoms.map(function (x) { return t("sym." + x); }).join(", ") : ""}</p>
            </div>
            {c.weight && <span className="text-bloom-muted text-xs">{c.weight} kg</span>}
          </div>
        );
      })}
    </div>
  );
}
