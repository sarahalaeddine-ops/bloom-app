"use client";
import { useState } from "react";
import { store } from "../../lib/store";
import { CATS, ARTICLES, phaseLabel } from "../../lib/demo-data";
import { Illustration } from "../ui/Graphics";

function catOf(a) {
  return CATS.find(function (c) { return c.id === a.cat; }) || CATS[0];
}

function VideoBadge({ small }) {
  return (
    <span className={"absolute top-3 left-3 bg-black/30 text-white rounded-lg font-semibold " + (small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1")}>
      ▶ Video
    </span>
  );
}

export default function InsightsScreen({ user }) {
  var [cat, setCat] = useState("all");
  var [selected, setSelected] = useState(null);
  var [read, setRead] = useState(function () { return store.get("read", []); });

  var filtered = cat === "all" ? ARTICLES : ARTICLES.filter(function (a) { return a.cat === cat; });
  var popular = filtered.filter(function (a) { return a.popular; });
  var phase = (user.phase || "stimulation") === "stimulation" ? "Stimulation Day " + (user.stimDay || 7) : phaseLabel(user.phase);

  function gotIt() {
    if (!read.includes(selected.id)) {
      var next = read.concat(selected.id);
      setRead(next);
      store.set("read", next);
    }
    setSelected(null);
  }

  if (selected) return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <button onClick={function () { setSelected(null); }} className="px-4 py-4 text-bloom-accent font-semibold text-sm">← Back</button>
      <div className="px-5 py-8 rounded-2xl mx-4 mb-5 relative overflow-hidden" style={{ backgroundColor: selected.color }}>
        <span className="absolute -right-6 -bottom-6 opacity-60"><Illustration name={catOf(selected).art} size={150} /></span>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: selected.textColor }}>
          {selected.tag}{selected.type === "video" ? " · Video" : ""}
        </p>
        <h1 className="text-2xl font-bold text-bloom-text leading-tight relative pr-20">{selected.title}</h1>
      </div>
      <div className="px-4">
        {selected.body.split("\n\n").map(function (p, i) {
          return <p key={i} className="text-bloom-muted text-base leading-relaxed mb-4">{p}</p>;
        })}
        <p className="text-bloom-dim text-xs mb-6">General information only. Please confirm anything medical with your clinic.</p>
        <button onClick={gotIt} className="w-full py-4 rounded-2xl text-white font-semibold" style={{ backgroundColor: selected.textColor }}>Got it</button>
      </div>
    </div>
  );

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Insights</h1>
        <p className="text-bloom-muted text-sm">Personalized to {phase}</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 mb-5 -mx-4 px-4">
        {CATS.map(function (c) {
          var on = cat === c.id;
          return (
            <button key={c.id} onClick={function () { setCat(c.id); }} aria-pressed={on}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 min-w-16 transition-all"
              style={{ borderColor: on ? c.color : "#E8E0DB", backgroundColor: on ? c.color : "white" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: on ? "rgba(255,255,255,0.25)" : c.color + "18" }}>
                <span style={{ color: on ? "white" : c.color, fontSize: "14px" }}>{c.mark}</span>
              </div>
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: on ? "white" : "#7A6880" }}>{c.label}</span>
            </button>
          );
        })}
      </div>

      {popular.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-bloom-text mb-3">Most popular</h2>
          <div className="flex gap-3 overflow-x-auto pb-3 mb-5 -mx-4 px-4">
            {popular.map(function (a) {
              return (
                <button key={a.id} onClick={function () { setSelected(a); }}
                  className="flex-shrink-0 rounded-2xl overflow-hidden relative text-left"
                  style={{ width: 200, height: 240, backgroundColor: a.color }}>
                  {a.type === "video" && <VideoBadge />}
                  <div className="absolute inset-x-0 top-6 flex justify-center">
                    <Illustration name={catOf(a).art} size={130} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: a.textColor }}>{a.tag}</p>
                    <p className="text-bloom-text text-sm font-bold leading-tight">{a.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <h2 className="text-lg font-bold text-bloom-text mb-3">For you today</h2>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(function (a) {
          return (
            <button key={a.id} onClick={function () { setSelected(a); }}
              className="rounded-2xl p-4 text-left relative overflow-hidden min-h-40"
              style={{ backgroundColor: a.color }}>
              {a.type === "video" && <VideoBadge small />}
              {read.includes(a.id) && <span className="absolute top-2 right-2 text-[10px] font-bold" style={{ color: a.textColor }}>✓ Read</span>}
              <div className="flex items-center justify-center h-20 mb-2 mt-3">
                <Illustration name={catOf(a).art} size={76} />
              </div>
              <p className="font-bold uppercase tracking-wider mb-1" style={{ color: a.textColor, fontSize: "9px" }}>{a.tag}</p>
              <p className="text-bloom-text text-xs font-bold leading-tight">{a.title}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
