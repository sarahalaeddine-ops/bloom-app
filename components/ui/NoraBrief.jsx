"use client";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useT } from "../../lib/i18n";
import { cachedBrief, loadBrief } from "../../lib/ai-client";
import { apptLabel, relDay } from "../ScheduleForms";

// "Today with Nora" on Home: a personal briefing for today, written by Nora from her own logs
// (lib/ai-tasks.js "brief"). It shows straight away with the facts the app already knows (doses,
// next appointment, last check-in), then Nora's briefing replaces them. Kept for the day.
export default function NoraBrief({ user, doses, takenCount, next, lastCheckin, goTab, openMore }) {
  var { t, lang } = useT();
  var [brief, setBrief] = useState(function () { return cachedBrief(lang); });
  var [loading, setLoading] = useState(false);
  var [reason, setReason] = useState(null);

  async function load(force) {
    setLoading(true);
    var out = await loadBrief(user, lang, force);
    setLoading(false);
    if (out.brief) { setBrief(out.brief); setReason(null); }
    else setReason(out.reason || "failed");
  }

  useEffect(function () {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- language changed: show that language's briefing
    setBrief(cachedBrief(lang));
    if (!cachedBrief(lang)) load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // What the app knows without AI.
  var left = doses.length - takenCount;
  var facts = [
    doses.length ? (left > 0 ? t("nb.dosesLeft", { n: left }) : t("nb.dosesDone")) : t("nb.noDoses"),
    next ? t("nb.next", { a: apptLabel(next, t), when: relDay(next, t) }) : null,
    lastCheckin && lastCheckin.mood != null ? t("nb.lastMood", { m: t("mood." + lastCheckin.mood) }) : t("nb.noCheckin"),
  ].filter(Boolean);

  return (
    <section aria-labelledby="nb-title" className="bg-white rounded-2xl p-4 border border-purple-200 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 id="nb-title" className="text-bloom-accent text-xs uppercase tracking-wider font-semibold">✦ {t("nb.title")}</h2>
        {brief && (
          <button onClick={function () { load(true); }} disabled={loading} aria-label={t("nb.refresh")} className="w-9 h-9 -m-2 flex items-center justify-center text-bloom-dim disabled:opacity-40">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        )}
      </div>
      {brief ? (
        <div aria-live="polite">
          {brief.greeting && <p className="font-serif italic text-xl text-bloom-text leading-snug mb-2"><bdi>{brief.greeting}</bdi></p>}
          <ul className="space-y-1.5 mb-3">
            {brief.lines.map(function (l, i) { return <li key={i} className="text-bloom-text text-sm leading-relaxed flex gap-2"><span className="text-bloom-accent" aria-hidden="true">•</span><bdi>{l}</bdi></li>; })}
          </ul>
          {brief.tip && <p className="text-bloom-muted text-xs leading-relaxed bg-bloom-surface rounded-xl px-3 py-2 mb-3"><b className="text-bloom-text">{t("nb.tip")}</b> <bdi>{brief.tip}</bdi></p>}
        </div>
      ) : (
        <div aria-live="polite">
          <ul className="space-y-1.5 mb-3">
            {facts.map(function (l, i) { return <li key={i} className="text-bloom-text text-sm leading-relaxed flex gap-2"><span className="text-bloom-accent" aria-hidden="true">•</span><bdi>{l}</bdi></li>; })}
          </ul>
          {loading && <p className="text-bloom-dim text-xs mb-3 animate-pulse">{t("nb.writing")}</p>}
          {!loading && reason === "consent" && (
            <button onClick={function () { openMore("privacy"); }} className="text-bloom-muted text-xs text-start mb-3 underline underline-offset-2">{t("ai.needsConsent")}</button>
          )}
        </div>
      )}
      {brief && <p className="text-bloom-dim text-[11px] mb-3">{t("ai.notMedical")}</p>}
      <button onClick={function () { goTab("nora"); }} className="w-full py-2.5 rounded-xl bg-bloom-accent/10 text-bloom-accent text-sm font-semibold">{t("nb.ask")}</button>
    </section>
  );
}
