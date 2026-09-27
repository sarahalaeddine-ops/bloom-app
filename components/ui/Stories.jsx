"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { store } from "../../lib/store";
import { STORIES } from "../../lib/demo-data";
import { Illustration } from "./Graphics";

// Flo-style "daily insights": a row of story bubbles that open a tap-through viewer.
export default function Stories() {
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
      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 mb-3">
        {STORIES.map(function (s, i) {
          var done = seen.includes(s.id);
          return (
            <button key={s.id} onClick={function () { setOpen(i); markSeen(s.id); }} className="flex-shrink-0 w-[92px] text-left">
              <div className="rounded-2xl p-[2px] mb-1.5" style={{ background: done ? "#E8E0DB" : "linear-gradient(135deg,#9B6DC5,#E07A8A)" }}>
                <div className="rounded-[14px] h-[112px] flex items-center justify-center" style={{ backgroundColor: s.color }}>
                  <Illustration name={s.art} size={70} />
                </div>
              </div>
              <p className={"text-xs leading-tight " + (done ? "text-bloom-muted" : "text-bloom-text font-semibold")}>{s.title}</p>
            </button>
          );
        })}
      </div>
      {open !== null && (
        <StoryViewer index={open} onChange={function (i) { setOpen(i); markSeen(STORIES[i].id); }} onClose={function () { setOpen(null); }} />
      )}
    </>
  );
}

function StoryViewer({ index, onChange, onClose }) {
  var story = STORIES[index];
  var [slide, setSlide] = useState(0);

  function next() {
    if (slide < story.slides.length - 1) setSlide(slide + 1);
    else if (index < STORIES.length - 1) { setSlide(0); onChange(index + 1); }
    else onClose();
  }
  function prev() {
    if (slide > 0) setSlide(slide - 1);
    else if (index > 0) { setSlide(0); onChange(index - 1); }
  }

  useEffect(function () {
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
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: story.ink }}>Today for you · {story.title}</p>
          <button onClick={onClose} aria-label="Close story" className="p-1" style={{ color: story.ink }}><X size={22} /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="mb-8 animate-fade-in" key={"art" + index}><Illustration name={story.art} size={160} /></div>
          <p key={index + "-" + slide} className="text-2xl font-light leading-snug text-bloom-text animate-fade-in" style={{ letterSpacing: "-0.3px" }}>
            {story.slides[slide]}
          </p>
        </div>
        <p className="text-center text-xs pb-8" style={{ color: story.ink, opacity: 0.7 }}>Tap to continue</p>
        <button onClick={prev} aria-label="Previous" className="absolute left-0 top-20 bottom-0 w-1/3" />
        <button onClick={next} aria-label="Next" className="absolute right-0 top-20 bottom-0 w-2/3" />
      </div>
    </div>
  );
}
