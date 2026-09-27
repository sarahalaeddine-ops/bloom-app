"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { store } from "../../lib/store";
import { storiesFor } from "../../lib/demo-data";
import { getCheckins } from "../../lib/cycle";
import { Illustration, PhaseIcon } from "./Graphics";
import { SleepRing } from "./SleepCard";
import { getSleep, sleepScore } from "../../lib/sleep";
import { follicleStats } from "../../lib/cycle";
import ReviewedBadge from "./Reviewed";
import { useT } from "../../lib/i18n";
import { localizeStory } from "../../lib/stories-i18n";

// Flo-style "daily insights": a row of story bubbles that open a tap-through viewer.
export default function Stories({ user, openMore }) {
  var { t, lang } = useT();
  var [ranked] = useState(function () { return storiesFor(user, getCheckins()[0]); });
  var list = ranked.map(function (s) { return localizeStory(s, lang); });
  var [seen, setSeen] = useState(function () { return store.get("stories_seen", []); });
  var [open, setOpen] = useState(null); // { list, index }
  var [sleepNow] = useState(function () { return sleepScore(getSleep()[0]); });
  var fs = follicleStats();
  var isStim = (user.phase || "stimulation") === "stimulation";
  var talk = {
    id: "talk", title: t("talk.title"), art: "couple", color: "#E6F5C9", ink: "#3F6B1E",
    slides: [t("talk.s1"), t("talk.s2"), t("talk.s3")],
  };
  var tile = "flex-shrink-0 w-[118px] h-[150px] rounded-[20px] p-[3px] text-start";
  function ring(child) { return <div className="w-full h-full rounded-[17px] overflow-hidden relative">{child}</div>; }

  function markSeen(id) {
    if (seen.includes(id)) return;
    var next = seen.concat(id);
    setSeen(next);
    store.set("stories_seen", next);
  }

  return (
    <>
      <h2 className="text-lg font-bold text-bloom-text mb-3">{t("tiles.title")}</h2>
      <div className="flex items-start gap-3 overflow-x-auto -mx-4 px-4 pb-1 mb-3">
        <button className={tile} style={{ background: "#E07A8A" }} onClick={function () {
          var i = list.findIndex(function (x) { return x.id === "today"; });
          if (i !== -1) { setOpen({ list: list, index: i }); markSeen("today"); } else openMore("profile");
        }}>
          {ring(<div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#FFD9B8" }}>
            {isStim ? (
              <div className="w-[92px] h-[104px] bg-white/90 flex flex-col items-center justify-center" style={{ borderRadius: "50% 50% 50% 50% / 45% 45% 55% 55%", clipPath: "polygon(0 0,100% 0,100% 78%,50% 100%,0 78%)" }}>
                <span className="text-[11px] font-semibold text-bloom-text">{t("tiles.stimDay")}</span>
                <span className="text-4xl font-bold text-bloom-text leading-none">{user.stimDay || 7}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center"><PhaseIcon phase={user.phase} size={70} /><span className="text-xs font-semibold text-bloom-text mt-1 text-center px-1">{t("phase." + user.phase)}</span></div>
            )}
          </div>)}
        </button>
        {sleepNow && (
          <button className={tile} style={{ background: "#E07A8A" }} onClick={function () { var el = document.getElementById("sleep-card"); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
            {ring(<div className="w-full h-full p-2.5 flex flex-col" style={{ backgroundColor: "#2B1A45" }}>
              <span className="text-white text-[13px] font-medium leading-tight">{t("tiles.sleep")}</span>
              <div className="flex-1 flex items-center justify-end -me-1"><SleepRing value={sleepNow.value} size={60} badge={sleepNow.key === "great" || sleepNow.key === "good"} /></div>
              <span className="text-white text-lg font-semibold leading-none">{t("sleep.score." + sleepNow.key)}</span>
            </div>)}
          </button>
        )}
        <button className={tile} style={{ background: "#E07A8A" }} onClick={function () { openMore("charts"); }}>
          {ring(<div className="w-full h-full p-2.5 flex flex-col" style={{ backgroundColor: "#DDF3EF" }}>
            <span className="text-bloom-text text-[13px] font-medium leading-tight">{t("tiles.follicles")}</span>
            <span className="text-4xl font-bold text-bloom-teal leading-none mt-2">{fs.total}</span>
            <span className="text-xs text-bloom-muted mt-1">{t("home.mature", { n: fs.mature })}</span>
            <div className="flex gap-1 mt-auto">{Array.from({ length: fs.total }, function (_, i) { return <span key={i} className="rounded-full" style={{ width: 7, height: 7, backgroundColor: i < fs.mature ? "#4ABFB0" : "#fff", border: "1.5px solid #4ABFB0" }} />; })}</div>
          </div>)}
        </button>
        <button className={tile} style={{ background: "#E07A8A" }} onClick={function () { setOpen({ list: [talk], index: 0 }); }}>
          {ring(<div className="w-full h-full flex flex-col" style={{ backgroundColor: "#E6F5C9" }}>
            <span className="p-2.5 text-[13px] font-semibold text-bloom-text leading-tight flex-1">{t("tiles.talk")}</span>
            <div className="h-9 flex items-center justify-end pe-2" style={{ backgroundColor: "#6C8CF5" }}><span className="text-white text-lg">💬</span></div>
          </div>)}
        </button>
        {list.map(function (s, i) {
          var done = seen.includes(s.id);
          return (
            <button key={s.id} onClick={function () { setOpen({ list: list, index: i }); markSeen(s.id); }} className="flex-shrink-0 w-[92px] text-start flex flex-col justify-start">
              <div className="rounded-2xl p-[2px] mb-1.5" style={{ background: done ? "#E8E0DB" : "linear-gradient(135deg,#9B6DC5,#E07A8A)" }}>
                <div className="rounded-[14px] h-[112px] flex items-center justify-center" style={{ backgroundColor: s.color }}>
                  <Illustration name={s.art} size={70} />
                </div>
              </div>
              <p className={"text-xs leading-tight " + (done ? "text-bloom-muted" : "text-bloom-text font-semibold")}>{s.title}</p>
              {s.why && <p className="text-[10px] leading-tight text-bloom-accent mt-0.5">{t(s.why.k, { s: s.why.s ? t("sym." + s.why.s).toLowerCase() : "" })}</p>}
            </button>
          );
        })}
      </div>
      {open !== null && (
        <StoryViewer list={open.list} index={open.index} onChange={function (i) { setOpen({ list: open.list, index: i }); markSeen(open.list[i].id); }} onClose={function () { setOpen(null); }} />
      )}
    </>
  );
}

function StoryViewer({ list, index, onChange, onClose }) {
  var { t } = useT();
  var story = list[index];
  var [slide, setSlide] = useState(0);
  var [paused, setPaused] = useState(false);

  function next() {
    if (slide < story.slides.length - 1) setSlide(slide + 1);
    else if (index < list.length - 1) { setSlide(0); onChange(index + 1); }
    else onClose();
  }
  function prev() {
    if (slide > 0) setSlide(slide - 1);
    else if (index > 0) { setSlide(0); onChange(index - 1); }
  }

  useEffect(function () {
    if (paused) return;
    var t = setTimeout(next, 5000);
    return function () { clearTimeout(t); };
  });

  useEffect(function () {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("keydown", onKey); };
  });

  return (
    <div className="fixed inset-0 z-[80] flex justify-center bg-black/60" role="dialog" aria-modal="true" aria-label={story.title}>
      <div className="relative w-full max-w-[430px] h-full flex flex-col animate-fade-in" style={{ backgroundColor: story.color }}>
        <div className="flex gap-1 px-3 pt-3">
          {story.slides.map(function (_, i) {
            return (
              <div key={i} className="flex-1 h-1 rounded-full bg-black/10 overflow-hidden">
                {i < slide && <div className="h-full w-full bg-white" />}
                {i === slide && <div key={index + "-" + slide} className="h-full bg-white story-fill" />}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between px-4 pt-3">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: story.ink }}>{t("story.today")} · {story.title}</p>
          <button onClick={onClose} aria-label={t("story.close")} className="p-1" style={{ color: story.ink }}><X size={22} /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="mb-8 animate-fade-in" key={"art" + index}><Illustration name={story.art} size={160} /></div>
          <p key={index + "-" + slide} className="text-2xl font-light leading-snug text-bloom-text animate-fade-in" style={{ letterSpacing: "-0.3px" }}>
            {story.slides[slide]}
          </p>
        </div>
        {story.id !== "talk" && <div className="flex justify-center pb-3 px-4"><ReviewedBadge cat="story" onToggle={setPaused} /></div>}
        <p className="text-center text-xs pb-8" style={{ color: story.ink, opacity: 0.7 }}>{t("story.tap")}</p>
        <button onClick={prev} aria-label="Previous" className="absolute start-0 top-20 bottom-0 w-1/3" />
        <button onClick={next} aria-label="Next" className="absolute end-0 top-20 bottom-0 w-2/3" />
      </div>
    </div>
  );
}
