"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { store } from "../../lib/store";
import { storiesFor } from "../../lib/demo-data";
import { getCheckins } from "../../lib/cycle";
import { Illustration } from "./Graphics";
import ReviewedBadge from "./Reviewed";
import { useT } from "../../lib/i18n";
import { localizeStory } from "../../lib/stories-i18n";

// Flo-style "daily insights": a row of story bubbles that open a tap-through viewer.
export default function Stories({ user }) {
  var { t, lang } = useT();
  var [ranked] = useState(function () { return storiesFor(user, getCheckins()[0]); });
  var list = ranked.map(function (s) { return localizeStory(s, lang); });
  var [seen, setSeen] = useState(function () { return store.get("stories_seen", []); });
  var [open, setOpen] = useState(null);

  function markSeen(id) {
    if (seen.includes(id)) return;
    var next = seen.concat(id);
    setSeen(next);
    store.set("stories_seen", next);
  }

  return (
    <>
      <div className="flex items-start gap-3 overflow-x-auto -mx-4 px-4 pb-1 mb-3">
        {list.map(function (s, i) {
          var done = seen.includes(s.id);
          return (
            <button key={s.id} onClick={function () { setOpen(i); markSeen(s.id); }} className="flex-shrink-0 w-[92px] text-start flex flex-col justify-start">
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
        <StoryViewer list={list} index={open} onChange={function (i) { setOpen(i); markSeen(list[i].id); }} onClose={function () { setOpen(null); }} />
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
        <div className="flex justify-center pb-3 px-4"><ReviewedBadge cat="story" onToggle={setPaused} /></div>
        <p className="text-center text-xs pb-8" style={{ color: story.ink, opacity: 0.7 }}>{t("story.tap")}</p>
        <button onClick={prev} aria-label={t("cmn.prev")} className="absolute start-0 top-20 bottom-0 w-1/3" />
        <button onClick={next} aria-label={t("cmn.next")} className="absolute end-0 top-20 bottom-0 w-2/3" />
      </div>
    </div>
  );
}
