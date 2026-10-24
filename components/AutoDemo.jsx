"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipForward, X, RotateCcw } from "lucide-react";
import { auth, store, todayKey } from "../lib/store";
import { getCheckins } from "../lib/cycle";
import { createPlayer, sleep } from "../lib/autoplay";
import { SCENES, STORY } from "../lib/demo-film";

// The investor demo: Bloom plays itself (lib/demo-film.js, run by lib/autoplay.js). A finger moves
// over the real app, taps, types and saves, with a one-line subtitle. Tapping anywhere pauses.
// Investor-facing, so the controls are English and always left to right.

// Each run starts from the same clean day for the demo persona: today's doses not yet taken, no
// check-in today, the persona's own schedule, no partner, a fresh Nora chat and community room.
function freshDemoDay() {
  var log = store.get("medlog", {});
  delete log[todayKey()];
  store.set("medlog", log);
  var today = new Date().toDateString();
  store.set("checkins", getCheckins().filter(function (c) { return new Date(c.date).toDateString() !== today; }));
  ["my_meds", "my_appts", "partner", "pregWeek", "twwDay", "nora", "room_failed"].forEach(function (k) { store.remove(k); });
  return auth.demo();
}

function Finger({ pos, taps }) {
  if (!pos) return null;
  return (
    <div data-autoplay-ui aria-hidden="true" className="fixed z-[96] pointer-events-none"
      style={{ left: pos.x, top: pos.y, transition: "left 0.6s cubic-bezier(.4,0,.2,1), top 0.6s cubic-bezier(.4,0,.2,1)" }}>
      <span key={taps} className="autoplay-ripple absolute -left-8 -top-8 w-16 h-16 rounded-full border-2 border-bloom-accent" />
      <span className="absolute -left-[18px] -top-[18px] w-9 h-9 rounded-full"
        style={{ background: "rgba(26,16,20,0.28)", border: "2.5px solid #fff", boxShadow: "0 4px 14px rgba(26,16,20,0.35)", transform: taps % 2 ? "scale(0.82)" : "scale(1)", transition: "transform 0.15s" }} />
    </div>
  );
}

export default function AutoDemo({ app, onExit }) {
  var [mode, setMode] = useState("menu"); // menu | playing | done
  var [line, setLine] = useState("");
  var [scene, setScene] = useState(0);
  var [paused, setPaused] = useState(false);
  var [pos, setPos] = useState(null);
  var [taps, setTaps] = useState(0);
  var player = useRef(null);
  var appRef = useRef(app);
  useEffect(function () { appRef.current = app; });
  useEffect(function () { return function () { if (player.current) player.current.stop(); }; }, []);

  async function start(from, only) {
    if (player.current) player.current.stop();
    var a = appRef.current;
    a.setLang("en");
    a.setQuick(false);
    a.setUser(freshDemoDay());
    a.go("home");
    setMode("playing");
    setPaused(false);
    setLine("");
    await sleep(700);

    var p = createPlayer({
      app: a,
      onSay: setLine,
      finger: {
        moveTo: function (x, y) { setPos({ x: x, y: y }); },
        tap: function () { setTaps(function (n) { return n + 1; }); },
      },
    });
    player.current = p;
    var last = only ? from + 1 : SCENES.length;
    try {
      for (var i = from; i < last; i++) {
        setScene(i);
        var s = SCENES[i];
        var u = auth.getUser();
        if (u && u.phase !== s.phase) appRef.current.setUser(auth.updateUser({ phase: s.phase }));
        await p.play(s.steps);
      }
      setMode("done");
    } catch (e) {
      if (e.message !== "stopped") { console.error("[autoplay]", e); setMode("done"); }
    }
    setPos(null);
  }

  function togglePause() {
    var p = player.current;
    if (!p) return;
    if (p.paused) { p.resume(); setPaused(false); } else { p.pause(); setPaused(true); }
  }

  function skip() {
    var next = scene + 1;
    if (next >= SCENES.length) { finish(); return; }
    start(next);
  }

  function finish() {
    if (player.current) player.current.stop();
    var a = appRef.current;
    a.setQuick(false);
    a.setLang("en");
    var u = auth.getUser();
    if (u && (u.phase !== "stimulation" || u.anonymous)) a.setUser(auth.updateUser({ phase: "stimulation", anonymous: false }));
    a.go("home");
    onExit();
  }

  var shell = "fixed inset-x-0 mx-auto w-full max-w-[430px] px-3 z-[95]";

  if (mode === "menu" || mode === "done") {
    return (
      <div data-autoplay-ui dir="ltr" lang="en" className="fixed inset-0 z-[95] flex items-center justify-center p-4" style={{ background: "rgba(250,247,244,0.82)", backdropFilter: "blur(6px)" }}>
        <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-xl border border-bloom-border p-5 max-h-[92vh] overflow-y-auto">
          <p className="logo text-3xl mb-1">bloom ✦</p>
          <p className="font-serif italic text-2xl text-bloom-text leading-tight mb-2">{mode === "done" ? "That's Bloom." : "Watch Sarah's story"}</p>
          <p className="text-bloom-muted text-sm leading-relaxed mb-4">{STORY}</p>
          <button onClick={function () { start(0); }} className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 mb-4"
            style={{ background: "linear-gradient(135deg,#9B6DC5,#E07A8A)" }}>
            {mode === "done" ? <RotateCcw size={18} /> : <Play size={18} fill="#fff" />} {mode === "done" ? "Play again" : "Play the full story"}
          </button>
          <p className="text-bloom-muted text-[11px] uppercase tracking-wider font-semibold mb-2">Or play one scene</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {SCENES.map(function (s, i) {
              return (
                <button key={s.id} onClick={function () { start(i, true); }} className="text-start rounded-xl border border-bloom-border px-3 py-2 hover:border-bloom-accent">
                  <span className="block text-bloom-text text-xs font-semibold">{i + 1}. {s.title}</span>
                  <span className="block text-bloom-dim text-[11px] leading-tight">{s.sub}</span>
                </button>
              );
            })}
          </div>
          <button onClick={finish} className="w-full py-2.5 text-bloom-muted text-sm font-semibold">Explore the app myself</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Taps from the audience pause the film instead of reaching the app. */}
      <div data-autoplay-ui className="fixed inset-0 z-[90]" onClick={togglePause} aria-hidden="true" />
      <div data-autoplay-ui dir="ltr" lang="en" className={shell + " top-2"} role="status" aria-live="polite">
        <div className="flex items-center gap-2 rounded-2xl ps-3.5 pe-1.5 py-1.5 shadow-md border border-white/60"
          style={{ background: "rgba(255,255,255,0.86)", backdropFilter: "blur(10px)" }}>
          <p className="flex-1 text-bloom-text text-[13px] leading-snug py-1 min-h-[2.5em] flex items-center">{paused ? "Paused. Tap ▶ to continue." : line}</p>
          <button onClick={togglePause} aria-label={paused ? "Play" : "Pause"} className="w-8 h-8 rounded-full flex items-center justify-center text-bloom-text hover:bg-bloom-surface">
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button onClick={skip} aria-label="Next scene" className="w-8 h-8 rounded-full flex items-center justify-center text-bloom-text hover:bg-bloom-surface"><SkipForward size={15} /></button>
          <button onClick={finish} aria-label="Stop the demo" className="w-8 h-8 rounded-full flex items-center justify-center text-bloom-text hover:bg-bloom-surface"><X size={15} /></button>
        </div>
        <div className="flex gap-1 mt-1.5 px-1" aria-hidden="true">
          {SCENES.map(function (s, i) {
            return <span key={s.id} className="h-1 flex-1 rounded-full" style={{ background: i < scene ? "#9B6DC5" : i === scene ? "#E07A8A" : "rgba(155,109,197,0.18)" }} />;
          })}
        </div>
      </div>
      <Finger pos={pos} taps={taps} />
    </>
  );
}
