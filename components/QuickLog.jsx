"use client";
import { useState } from "react";
import { Sheet, Label } from "./ui/Common";
import { MoodFace } from "./ui/Graphics";
import LogChips, { matchItems } from "./ui/LogChips";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { MEDS, MOODS, FEELINGS, SYMPTOM_GROUPS } from "../lib/demo-data";
import { useT } from "../lib/i18n";
import { getTodayMedLog, logDose, saveCheckin, getCheckins } from "../lib/cycle";

// Flo's "+" quick log, for IVF: tick a dose, or log mood, symptoms and weight in a few taps.
export default function QuickLog({ user, onClose, onSaved }) {
  var { t } = useT();
  var [log, setLog] = useState(getTodayMedLog);
  var [mood, setMood] = useState(null);
  var [symptoms, setSymptoms] = useState([]);
  var [feelings, setFeelings] = useState([]);
  var [query, setQuery] = useState("");
  var [back, setBack] = useState(0); // days before today being logged (0 = today)
  var [weight, setWeight] = useState("");
  var [alert, setAlert] = useState(null);
  var pending = MEDS.filter(function (m) { return !(log[m.id] && log[m.id].status === "taken"); });

  function take(m) {
    setLog(logDose(m.id, { status: "taken", site: "", note: "" }));
    onSaved(t("ql.doseLogged", { med: m.name }));
  }

  function toggler(set) {
    return function (id) { set(function (p) { return p.includes(id) ? p.filter(function (x) { return x !== id; }) : p.concat(id); }); };
  }

  var when = new Date();
  when.setDate(when.getDate() - back);
  if (back) when.setHours(12, 0, 0, 0);
  var stimDay = Math.max(1, (user.stimDay || 7) - back);
  var dayLabel = back === 0 ? t("ql.today") : back === 1 ? t("ql.yesterday") : t("ql.daysAgo", { n: back });
  var feelingHits = matchItems(FEELINGS, "feel.", query, t);
  var groupHits = SYMPTOM_GROUPS.map(function (g) { return { id: g.id, items: matchItems(g.items, "sym.", query, t) }; });
  var nothing = query && !feelingHits.length && groupHits.every(function (g) { return !g.items.length; });

  function save() {
    var w = weight ? parseFloat(weight) : null;
    var last = (getCheckins().find(function (c) { return c.weight; }) || {}).weight;
    saveCheckin({ date: when.toISOString(), stimDay: stimDay, mood: mood, anxiety: 3, hope: 3, feelings: feelings, symptoms: symptoms, weight: w, note: "", quick: true });
    onSaved(t("ql.saved"));
    var gain = w && last ? +(w - last).toFixed(1) : 0;
    if (gain >= 2) setAlert(gain);
    else onClose();
  }

  if (alert) return (
    <Sheet onClose={onClose}>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4" role="alert">
        <p className="text-red-500 text-sm font-bold mb-1">{t("ohss.title", { n: alert })}</p>
        <p className="text-bloom-muted text-xs leading-relaxed">{t("ohss.body")}</p>
      </div>
      <button onClick={onClose} className="w-full bg-bloom-accent text-white font-semibold py-3.5 rounded-xl">{t("ohss.call")}</button>
    </Sheet>
  );

  var canSave = mood !== null || symptoms.length > 0 || feelings.length > 0 || weight;

  return (
    <Sheet onClose={onClose}>
      <div className="w-10 h-1 bg-bloom-border rounded-full mx-auto -mt-2 mb-4" />
      <div className="flex items-center justify-between mb-3">
        <button onClick={function () { setBack(Math.min(6, back + 1)); }} disabled={back >= 6} aria-label={t("ql.prevDay")}
          className="w-10 h-10 rounded-full flex items-center justify-center text-bloom-text disabled:opacity-30">
          <ChevronLeft size={24} className="flip-rtl" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-bloom-text">{dayLabel}</h2>
          <p className="text-bloom-muted text-xs">{t("ql.stimDay", { n: stimDay })}</p>
        </div>
        <button onClick={function () { setBack(Math.max(0, back - 1)); }} disabled={back === 0} aria-label={t("ql.nextDay")}
          className="w-10 h-10 rounded-full flex items-center justify-center text-bloom-text disabled:opacity-30">
          <ChevronRight size={24} className="flip-rtl" />
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-bloom-dim" />
        <input value={query} onChange={function (e) { setQuery(e.target.value); }} placeholder={t("ql.search")} aria-label={t("ql.search")}
          className="w-full bg-bloom-surface rounded-2xl ps-10 pe-3 py-3 text-sm text-bloom-text outline-none focus:ring-2 focus:ring-bloom-accent/30" />
      </div>

      {!query && back === 0 && <Label className="mb-2">{t("ql.doses")}</Label>}
      {query || back > 0 ? null : pending.length === 0 ? (
        <p className="text-bloom-teal text-sm font-semibold mb-5">{t("ql.allDone")}</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-5">
          {pending.map(function (m) {
            return (
              <button key={m.id} onClick={function () { take(m); }} className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold"
                style={{ borderColor: m.color + "55", color: m.color, backgroundColor: m.color + "0D" }}>
                <span className="w-4 h-4 rounded-full border-2" style={{ borderColor: m.color }} />
                <bdi dir="ltr">{m.name} · {m.time}</bdi>
              </button>
            );
          })}
        </div>
      )}

      {!query && <Label className="mb-2">{t("ql.mood")}</Label>}
      {!query && <div className="flex justify-between mb-5">
        {MOODS.map(function (m, i) {
          var on = mood === i;
          return (
            <button key={i} onClick={function () { setMood(on ? null : i); }} aria-pressed={on} aria-label={t("mood." + i)}
              className="flex flex-col items-center gap-1 px-1 py-1.5 rounded-xl transition-transform" style={{ transform: on ? "scale(1.12)" : "none" }}>
              <MoodFace mood={i} color={m.c} size={44} active={mood === null || on} />
              <span className="text-[11px] font-semibold" style={{ color: on ? m.c : "#7A6880" }}>{t("mood." + i)}</span>
            </button>
          );
        })}
      </div>}

      {feelingHits.length > 0 && (
        <div className="bg-white rounded-2xl mb-5">
          <p className="text-bloom-text text-lg font-bold mb-3">{t("ql.feelings")}</p>
          <LogChips kind="feeling" items={feelingHits} selected={feelings} onToggle={toggler(setFeelings)} />
        </div>
      )}
      {groupHits.map(function (g) {
        if (!g.items.length) return null;
        return (
          <div key={g.id} className="mb-5">
            <p className="text-bloom-text text-lg font-bold mb-3">{t("ql.group." + g.id)}</p>
            <LogChips kind="symptom" items={g.items} selected={symptoms} onToggle={toggler(setSymptoms)} />
          </div>
        );
      })}
      {nothing && <p className="text-bloom-muted text-sm text-center py-6">{t("ql.noResults")}</p>}

      <label htmlFor="ql-weight" className="text-bloom-muted text-xs uppercase tracking-wider font-semibold block mb-2">{t("ql.weight")}</label>
      <div className="flex items-center gap-2 mb-6">
        <input id="ql-weight" value={weight} onChange={function (e) { setWeight(e.target.value); }} type="number" inputMode="decimal" step="0.1" placeholder="62.4"
          className="flex-1 bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none focus:border-bloom-accent" />
        <span className="text-bloom-muted text-sm">kg</span>
      </div>

      <button onClick={save} disabled={!canSave} className="w-full bg-bloom-accent text-white font-semibold py-3.5 rounded-xl disabled:opacity-40">
        {t("common.save")}
      </button>
    </Sheet>
  );
}
