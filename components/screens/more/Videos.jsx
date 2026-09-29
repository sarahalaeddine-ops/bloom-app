"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { store } from "../../../lib/store";
import { VIDEOS, VIDEO_MOODS, VIDEO_CATS } from "../../../lib/demo-data";
import { useT } from "../../../lib/i18n";

function catOf(v) {
  return VIDEO_CATS.find(function (c) { return c.id === v.cat; });
}

export default function Videos({ onBack }) {
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

  if (playing) {
    var c = catOf(playing);
    return (
      <div className="min-h-screen bg-bloom-bg pb-6">
        <button onClick={function () { setPlaying(null); }} className="px-4 py-4 text-bloom-accent font-semibold text-sm"><span className="flip-rtl">←</span> {t("common.back")}</button>
        <div className="px-4">
          <a href={"https://www.youtube.com/results?search_query=" + encodeURIComponent(playing.q)} target="_blank" rel="noopener noreferrer"
            className="relative block w-full rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: "16/10", backgroundColor: c.color + "25" }}>
            <span className="absolute inset-0 flex items-center justify-center text-8xl opacity-20" style={{ color: c.color }}>{c.mark}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg text-2xl ps-1" style={{ color: c.color }}>▶</span>
            </span>
          </a>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: c.color }}>{t("vid.cat." + c.id)}</p>
          <h1 className="text-xl font-bold text-bloom-text mb-2">{t("vid." + playing.id)}</h1>
          <p className="text-bloom-muted text-sm mb-4">{t(playing.phase)} · {t("vid.min", { n: playing.min })}</p>
          <p className="text-bloom-dim text-xs mb-5">{t("vid.youtube")}</p>
          <button onClick={function () { toggleSave(playing.id); }} className="w-full py-3.5 rounded-2xl border-2 font-semibold text-sm"
            style={{ borderColor: c.color, color: saved.includes(playing.id) ? "white" : c.color, backgroundColor: saved.includes(playing.id) ? c.color : "white" }}>
            {saved.includes(playing.id) ? t("vid.saved") : t("vid.save")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">{t("sec.videos")}</h1>
        <p className="text-bloom-muted text-sm mb-4">{t("sec.videos.d")}</p>

        <Label className="mb-2">{t("vid.feel")}</Label>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4">
          {VIDEO_MOODS.map(function (m) {
            var on = mood === m;
            return (
              <button key={m} onClick={function () { setMood(on ? null : m); }} aria-pressed={on}
                className={"flex-shrink-0 px-3 py-2 rounded-full border text-xs font-medium whitespace-nowrap " + (on ? "bg-bloom-accent border-bloom-accent text-white" : "bg-white border-bloom-border text-bloom-muted")}>
                {t("vid.mood." + m)}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-4 px-4">
          {VIDEO_CATS.map(function (c) {
            var on = cat === c.id;
            return (
              <button key={c.id} onClick={function () { setCat(on ? null : c.id); }} aria-pressed={on}
                className="flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap"
                style={{ borderColor: c.color, backgroundColor: on ? c.color : "white", color: on ? "white" : c.color }}>
                {c.mark} {t("vid.cat." + c.id)}
              </button>
            );
          })}
          <button onClick={function () { setSavedOnly(!savedOnly); }} aria-pressed={savedOnly}
            className={"flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-semibold " + (savedOnly ? "bg-bloom-rose border-bloom-rose text-white" : "bg-white border-bloom-rose text-bloom-rose")}>
            {t("vid.savedN", { n: saved.length })}
          </button>
        </div>

        {list.length === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-bloom-border text-center">
            <p className="text-bloom-muted text-sm mb-3">{t("vid.empty")}</p>
            <button onClick={function () { setMood(null); setCat(null); setSavedOnly(false); }} className="text-bloom-accent text-sm font-semibold">{t("vid.clear")}</button>
          </div>
        )}

        {list.map(function (v) {
          var c = catOf(v);
          var isSaved = saved.includes(v.id);
          return (
            <div key={v.id} className="flex gap-3 bg-white rounded-2xl p-3 border border-bloom-border mb-2">
              <button onClick={function () { setPlaying(v); }} className="w-24 h-20 rounded-xl flex-shrink-0 relative flex items-center justify-center" style={{ backgroundColor: c.color + "22" }} aria-label={t("vid.play", { title: t("vid." + v.id) })}>
                <span className="text-3xl" style={{ color: c.color }}>{c.mark}</span>
                <span className="absolute bottom-1 end-1 bg-black/40 text-white text-[10px] px-1.5 rounded">{t("vid.min", { n: v.min })}</span>
              </button>
              <button onClick={function () { setPlaying(v); }} className="flex-1 text-start min-w-0">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md" style={{ color: c.color, backgroundColor: c.color + "15" }}>{t(v.phase)}</span>
                <p className="text-bloom-text text-sm font-semibold leading-tight mt-1.5">{t("vid." + v.id)}</p>
                <p className="text-bloom-dim text-xs mt-0.5">{t("vid.min", { n: v.min })} · {t("vid.cat." + c.id)}</p>
              </button>
              <button onClick={function () { toggleSave(v.id); }} aria-label={isSaved ? t("vid.unsaveLabel") : t("vid.saveLabel")} className="self-start text-xl px-1" style={{ color: isSaved ? "#E07A8A" : "#C5B8CC" }}>
                {isSaved ? "♥" : "♡"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
