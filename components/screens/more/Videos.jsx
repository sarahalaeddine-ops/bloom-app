"use client";
import { useEffect, useState } from "react";
import { Heart, Play } from "lucide-react";
import { BackBtn } from "../../ui/Common";
import { WellbeingScene, FeelingFace, SymptomIcon } from "../../ui/Graphics";
import { store } from "../../../lib/store";
import { VIDEOS, VIDEO_MOODS, VIDEO_CATS } from "../../../lib/demo-data";
import { useT } from "../../../lib/i18n";

// Each "How do you feel?" chip reuses the drawn faces and icons from logging.
var MOOD_ART = {
  "I feel anxious": { feel: "anxious" }, "I feel scared": { feel: "scared" }, "I feel hopeful": { feel: "hopeful" },
  "I need rest": { feel: "calm" }, "I can't cope": { feel: "overwhelmed" }, "I need peace": { feel: "calm" },
  "I feel bloated": { sym: "Bloating" }, "I am grieving": { feel: "sad" }, "I want to help": { feel: "grateful" },
  "I feel nervous": { feel: "anxious" },
};
var PHASE_TO_VIDEO = { stimulation: "Stimulation", tww: "TWW", retrieval: "Post Retrieval" };

function catOf(v) {
  return VIDEO_CATS.find(function (c) { return c.id === v.cat; });
}

// One-minute guided breathing: 4 s in, 4 s out, with an expanding circle.
function BreatheCard({ t }) {
  var [startedAt, setStartedAt] = useState(null);
  var [now, setNow] = useState(0);
  useEffect(function () {
    if (!startedAt) return;
    var id = setInterval(function () {
      var n = Date.now();
      if (n - startedAt >= 60000) setStartedAt(null);
      else setNow(n);
    }, 250);
    return function () { clearInterval(id); };
  }, [startedAt]);
  var running = !!startedAt;
  var elapsed = running ? Math.max(0, now - startedAt) : 0;
  var left = 60 - Math.floor(elapsed / 1000);
  var inhale = Math.floor(elapsed / 4000) % 2 === 0;
  function toggle() {
    if (running) { setStartedAt(null); return; }
    var n = Date.now();
    setNow(n);
    setStartedAt(n);
  }
  return (
    <div className="rounded-3xl p-5 mb-5 flex items-center gap-4 overflow-hidden relative" style={{ background: "linear-gradient(150deg,#EEE6FA 0%,#E3F5F1 100%)" }}>
      <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center" aria-hidden="true">
        <span className={"absolute inset-0 rounded-full bg-bloom-accent/15 " + (running ? "breath-guide" : "")} />
        <span className={"absolute inset-3 rounded-full bg-bloom-accent/25 " + (running ? "breath-guide" : "")} style={{ animationDelay: "0.2s" }} />
        <span className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center text-bloom-accent text-xs font-bold text-center leading-tight px-1">
          {running ? (inhale ? t("well.in") : t("well.out")) : "1:00"}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-bloom-text font-bold mb-1">{t("well.breathTitle")}</p>
        <p className="text-bloom-muted text-xs leading-relaxed mb-3" role="status">{running ? t("well.left", { n: left }) : t("well.breathSub")}</p>
        <button onClick={toggle} className="px-4 py-2 rounded-full bg-bloom-accent text-white text-sm font-semibold">
          {running ? t("well.stop") : t("well.start")}
        </button>
      </div>
    </div>
  );
}

export default function Videos({ onBack, user }) {
  var { t } = useT();
  var [mood, setMood] = useState(null);
  var [cat, setCat] = useState(null);
  var [savedOnly, setSavedOnly] = useState(false);
  var [saved, setSaved] = useState(function () { return store.get("savedVideos", []); });
  var [playing, setPlaying] = useState(null);

  function toggleSave(id) {
    var next = saved.includes(id) ? saved.filter(function (x) { return x !== id; }) : saved.concat(id);
    setSaved(next);
    store.set("savedVideos", next);
  }

  var list = VIDEOS.filter(function (v) {
    return (!mood || v.moods.includes(mood)) && (!cat || v.cat === cat) && (!savedOnly || saved.includes(v.id));
  });
  var phaseName = PHASE_TO_VIDEO[(user && user.phase) || "stimulation"];
  var featured = VIDEOS.find(function (v) { return v.phase === phaseName; }) || VIDEOS[0];
  var filtering = mood || cat || savedOnly;

  if (playing) {
    var c = catOf(playing);
    var isSaved = saved.includes(playing.id);
    return (
      <div className="min-h-screen bg-bloom-bg pb-6">
        <BackBtn onBack={function () { setPlaying(null); }} />
        <div className="px-4">
          <a href={"https://www.youtube.com/results?search_query=" + encodeURIComponent(playing.q)} target="_blank" rel="noopener noreferrer"
            className="relative block w-full rounded-3xl overflow-hidden mb-4 shadow-sm" style={{ aspectRatio: "16/10" }} aria-label={t("well.play", { v: playing.title })}>
            <WellbeingScene cat={playing.cat} className="absolute inset-0 w-full h-full" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg" style={{ color: c.color }}><Play size={28} fill={c.color} className="flip-rtl" /></span>
            </span>
            <span className="absolute bottom-3 end-3 bg-black/45 text-white text-xs px-2 py-0.5 rounded-md">{playing.duration}</span>
          </a>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: c.color }}>{t("wcat." + c.id)}</p>
          <h1 className="text-xl font-bold text-bloom-text mb-2">{playing.title}</h1>
          <p className="text-bloom-muted text-sm mb-4">{playing.phase} · {playing.duration}</p>
          <p className="text-bloom-dim text-xs mb-5">{t("well.opens")}</p>
          <button onClick={function () { toggleSave(playing.id); }} aria-pressed={isSaved} className="w-full py-3.5 rounded-2xl border-2 font-semibold text-sm flex items-center justify-center gap-2"
            style={{ borderColor: c.color, color: isSaved ? "white" : c.color, backgroundColor: isSaved ? c.color : "white" }}>
            <Heart size={16} fill={isSaved ? "white" : "none"} /> {isSaved ? t("well.savedBtn") : t("well.save")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">{t("well.title")}</h1>
        <p className="text-bloom-muted text-sm mb-4">{t("well.sub")}</p>

        {!filtering && (
          <button onClick={function () { setPlaying(featured); }} className="relative block w-full rounded-3xl overflow-hidden mb-4 text-start shadow-sm" style={{ aspectRatio: "16/11" }}>
            <WellbeingScene cat={featured.cat} className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-x-0 bottom-0 p-4" style={{ background: "linear-gradient(0deg, rgba(26,16,20,0.55), transparent)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 bg-white/20 rounded-full px-2 py-0.5">{t("well.featured")}</span>
              <p className="text-white text-lg font-bold leading-tight mt-1.5">{featured.title}</p>
              <p className="text-white/80 text-xs">{featured.duration} · {t("wcat." + featured.cat)}</p>
            </div>
            <span className="absolute top-3 end-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center text-bloom-accent shadow"><Play size={20} fill="#9B6DC5" className="flip-rtl" /></span>
          </button>
        )}

        {!filtering && <BreatheCard t={t} />}

        <p className="text-bloom-text font-bold mb-2">{t("well.feel")}</p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4">
          {VIDEO_MOODS.map(function (m) {
            var on = mood === m;
            var art = MOOD_ART[m] || { feel: "calm" };
            return (
              <button key={m} onClick={function () { setMood(on ? null : m); }} aria-pressed={on}
                className="flex-shrink-0 flex items-center gap-1.5 ps-1 pe-3 py-1 rounded-full border-2 text-xs font-medium whitespace-nowrap"
                style={{ backgroundColor: "#FDF1E3", borderColor: on ? "#F7C27B" : "transparent", color: "#7A4A1E" }}>
                {art.feel ? <FeelingFace id={art.feel} size={26} /> : <SymptomIcon name={art.sym} size={26} />}
                {t("wmood." + m)}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-4 px-4">
          {VIDEO_CATS.map(function (c) {
            var on = cat === c.id;
            return (
              <button key={c.id} onClick={function () { setCat(on ? null : c.id); }} aria-pressed={on}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[92px] p-1.5 rounded-2xl border-2 text-xs font-semibold"
                style={{ borderColor: on ? c.color : "transparent", backgroundColor: "white", color: on ? c.color : "#7A6880" }}>
                <span className="w-full rounded-xl overflow-hidden block" style={{ aspectRatio: "16/10" }}><WellbeingScene cat={c.id} className="w-full h-full" animate={false} /></span>
                <span className="leading-tight text-center">{t("wcat." + c.id)}</span>
              </button>
            );
          })}
          <button onClick={function () { setSavedOnly(!savedOnly); }} aria-pressed={savedOnly}
            className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5 w-[92px] p-1.5 rounded-2xl border-2 text-xs font-semibold"
            style={{ borderColor: savedOnly ? "#E07A8A" : "transparent", backgroundColor: "white", color: "#E07A8A" }}>
            <span className="w-full rounded-xl flex items-center justify-center" style={{ aspectRatio: "16/10", backgroundColor: "#FCEEF0" }}><Heart size={24} fill={savedOnly ? "#E07A8A" : "none"} /></span>
            <span>{t("well.saved", { n: saved.length })}</span>
          </button>
        </div>

        {list.length === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-bloom-border text-center">
            <p className="text-bloom-muted text-sm mb-3">{t("well.none")}</p>
            <button onClick={function () { setMood(null); setCat(null); setSavedOnly(false); }} className="text-bloom-accent text-sm font-semibold">{t("well.clear")}</button>
          </div>
        )}

        {list.map(function (v) {
          var c = catOf(v);
          var isSaved = saved.includes(v.id);
          return (
            <div key={v.id} className="flex gap-3 bg-white rounded-2xl p-2.5 border border-bloom-border mb-2 items-center">
              <button onClick={function () { setPlaying(v); }} className="w-28 flex-shrink-0 relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/11" }} aria-label={t("well.play", { v: v.title })}>
                <WellbeingScene cat={v.cat} className="absolute inset-0 w-full h-full" animate={false} />
                <span className="absolute inset-0 flex items-center justify-center"><span className="w-8 h-8 rounded-full bg-white/85 flex items-center justify-center" style={{ color: c.color }}><Play size={14} fill={c.color} className="flip-rtl" /></span></span>
                <span className="absolute bottom-1 end-1 bg-black/45 text-white text-[10px] px-1.5 rounded">{v.duration}</span>
              </button>
              <button onClick={function () { setPlaying(v); }} className="flex-1 text-start min-w-0">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md" style={{ color: c.color, backgroundColor: c.color + "15" }}>{v.phase}</span>
                <p className="text-bloom-text text-sm font-semibold leading-tight mt-1.5">{v.title}</p>
                <p className="text-bloom-dim text-xs mt-0.5">{t("wcat." + c.id)}</p>
              </button>
              <button onClick={function () { toggleSave(v.id); }} aria-pressed={isSaved} aria-label={isSaved ? t("ins.unsave") : t("ins.save")} className="self-start p-1" style={{ color: isSaved ? "#E07A8A" : "#C5B8CC" }}>
                <Heart size={20} fill={isSaved ? "#E07A8A" : "none"} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
