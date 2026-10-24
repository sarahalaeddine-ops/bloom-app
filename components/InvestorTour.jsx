"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ListOrdered, X, PenLine, MousePointerClick } from "lucide-react";
import { CHAPTERS, STEPS, STORY, firstStepOf } from "../lib/tour";

// The caption card for the investor tour (lib/tour.js). On a phone it sits in the page flow at the
// top of the app (sticky), so it never covers the screen it is describing; on a wide screen (1280px+) it is a
// panel beside the 430px app column. The app stays clickable either way. Always left-to-right
// English, even while the tour shows the app in Arabic.
var PLACE = "sticky top-0 z-[70] px-3 pt-2 xl:fixed xl:top-8 xl:px-0 xl:pt-0 xl:w-[360px] xl:left-[calc(50%-599px)]";
export default function InvestorTour({ index, onGo, onExit }) {
  var [menu, setMenu] = useState(index === 0);
  var [small, setSmall] = useState(false);
  var step = STEPS[index];
  var last = index === STEPS.length - 1;

  if (small) {
    return (
      <div dir="ltr" lang="en" className={PLACE + " flex justify-end"}>
        <button onClick={function () { setSmall(false); }}
          className="flex items-center gap-2 bg-bloom-text text-white text-xs font-semibold rounded-full ps-3 pe-2 py-1.5 shadow-lg">
          Tour · {index + 1}/{STEPS.length}: {step.chapterTitle} <ChevronDown size={14} />
        </button>
      </div>
    );
  }

  return (
    <div dir="ltr" lang="en" className={PLACE + " pb-1"} role="region" aria-label="Investor tour">
      <div className="bg-bloom-text text-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center gap-1 px-4 pt-3">
          <p className="flex-1 text-[10px] uppercase tracking-[0.18em] text-white/60 font-semibold truncate">
            {step.chapterIndex + 1}. {step.chapterTitle} · {step.stepInChapter + 1}/{step.chapterSize}
          </p>
          <button onClick={function () { setMenu(!menu); }} aria-expanded={menu} aria-label="Scenarios" className="p-1.5 rounded-lg hover:bg-white/10"><ListOrdered size={16} /></button>
          <button onClick={function () { setSmall(true); }} aria-label="Minimise the tour" className="p-1.5 rounded-lg hover:bg-white/10"><ChevronUp size={16} /></button>
          <button onClick={onExit} aria-label="End the tour" className="p-1.5 rounded-lg hover:bg-white/10"><X size={16} /></button>
        </div>

        {menu ? (
          <div className="px-4 pb-4 pt-1 max-h-[70vh] overflow-y-auto">
            <p className="font-serif italic text-xl leading-tight mb-1">The Bloom investor tour</p>
            <p className="text-white/70 text-xs leading-relaxed mb-3">{STORY}</p>
            <button onClick={function () { setMenu(false); onGo(0); }} className="w-full mb-3 py-2.5 rounded-xl bg-white text-bloom-text text-sm font-semibold">
              ▶ Play the full story
            </button>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/60 font-semibold mb-1.5">Or jump to a scenario</p>
            <div className="flex flex-col gap-1.5">
              {CHAPTERS.map(function (ch, ci) {
                var on = step.chapter === ch.id;
                return (
                  <button key={ch.id} onClick={function () { setMenu(false); onGo(firstStepOf(ch.id)); }}
                    className={"text-start rounded-xl px-3 py-1.5 transition-colors " + (on ? "bg-white/15" : "bg-white/5 hover:bg-white/10")}>
                    <span className="text-sm font-semibold">{ci + 1}. {ch.title}</span>
                    <span className="block text-white/60 text-xs">{ch.sub} · {ch.steps.length} steps</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-4 pb-3 pt-1">
            <p className="text-base font-semibold leading-snug mb-1.5">{step.title}</p>
            <p className="text-white/80 text-[13px] leading-relaxed">{step.body}</p>
            {step.log && (
              <p className="mt-2 flex gap-2 text-[12px] leading-relaxed bg-white/10 rounded-lg px-2.5 py-2">
                <PenLine size={14} className="shrink-0 mt-0.5 text-bloom-rose" />
                <span><b className="text-white">How she records it:</b> <span className="text-white/80">{step.log}</span></span>
              </p>
            )}
            {step.tip && (
              <p className="mt-1.5 flex gap-2 text-[12px] text-bloom-teal leading-relaxed">
                <MousePointerClick size={14} className="shrink-0 mt-0.5" /><span>Try it: {step.tip}</span>
              </p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <button onClick={function () { onGo(index - 1); }} disabled={index === 0} aria-label="Previous step"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center disabled:opacity-30"><ChevronLeft size={18} /></button>
              <div className="flex-1 h-1 rounded-full bg-white/15 overflow-hidden" aria-hidden="true">
                <div className="h-full bg-bloom-rose transition-all" style={{ width: ((index + 1) / STEPS.length * 100) + "%" }} />
              </div>
              <span className="text-[11px] text-white/60 tabular-nums">{index + 1}/{STEPS.length}</span>
              {last ? (
                <button onClick={onExit} className="h-10 px-4 rounded-xl bg-white text-bloom-text text-sm font-semibold">Finish</button>
              ) : (
                <button onClick={function () { onGo(index + 1); }} className="h-10 ps-4 pe-3 rounded-xl bg-white text-bloom-text text-sm font-semibold flex items-center gap-1">
                  Next <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
