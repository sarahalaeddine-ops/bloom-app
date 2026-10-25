"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipForward, X, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { auth, store, todayKey } from "../lib/store";
import { getCheckins } from "../lib/cycle";
import { createPlayer, sleep } from "../lib/autoplay";
import { SCENES, STORY } from "../lib/demo-film";
import * as voice from "../lib/voice";
import { TEST_LINE, spokenText } from "../lib/voice-lines";

// The investor demo: Bloom plays itself (lib/demo-film.js, run by lib/autoplay.js). A finger moves
// over the real app, taps, types and saves, with a one-line subtitle that a voice-over reads aloud
// (lib/voice.js: a recorded British woman's voice by default, device voices as a fallback).
// Tapping anywhere pauses.
// Investor-facing, so the controls are English and always left to right.

// Each run starts from the same clean day for the demo persona: today's doses not yet taken, no
// check-in today, the persona's own schedule, reminders on, no partner, no Secret Space, and a
// fresh Nora chat and community rooms.
function freshDemoDay() {
  auth.demo(); // switches storage to the demo persona first
  var log = store.get("medlog", {});
  delete log[todayKey()];
  store.set("medlog", log);
  var today = new Date().toDateString();
  store.set("checkins", getCheckins().filter(function (c) { return new Date(c.date).toDateString() !== today; }));
  ["my_meds", "my_appts", "partner", "pregWeek", "twwDay", "nora", "secret_vault", "room_failed", "room_tww"].forEach(function (k) { store.remove(k); });
  store.set("reminders", { ...store.get("reminders", {}), enabled: true, meds: true, appts: true, lead: 5 });
  return auth.updateUser({ phase: "stimulation", anonymous: false });
}

// The sign-up scene starts on a wiped device, signed out (this demo device only holds demo data).
async function signedOut(app) {
  await store.resetDemo();
  app.setLang("en");
  app.setUser(null);
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
  useEffect(function () { return function () { if (player.current) player.current.stop(); voice.stopSpeech(); }; }, []);

  // Voice-over: on by default, read by the recorded British narrator (Emma, or the server's
  // ElevenLabs/OpenAI voice when set up); device voices are a fallback choice. Remembered.
  var [provider, setProvider] = useState(false);
  var [voices, setVoices] = useState([]);
  var [prefs, setPrefs] = useState({ on: true, name: "" });
  var prefsRef = useRef(prefs);
  useEffect(function () { prefsRef.current = prefs; });
  useEffect(function () {
    function load() { setVoices(voice.englishVoices()); }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- speech support and saved choice are only readable in the browser
    setPrefs(voice.loadPrefs());
    load();
    var live = true;
    voice.useProviderVoiceIfSetUp().then(function (ok) { if (live) setProvider(ok); });
    var off = voice.onVoicesChanged(load);
    return function () { live = false; off(); };
  }, []);

  var canSpeak = true; // the recorded narrator needs nothing from the device
  // The voice actually used: a device voice only if she picked one that this device has.
  var chosen = prefs.name !== voice.STUDIO && voices.some(function (v) { return v.name === prefs.name; }) ? prefs.name : voice.STUDIO;
  var chosenRef = useRef(chosen);
  useEffect(function () { chosenRef.current = chosen; });

  // Lines of these scenes, so the studio recordings can be made before they're needed.
  function prefetchScenes(from, count) {
    if (!prefsRef.current.on || chosenRef.current !== voice.STUDIO) return;
    SCENES.slice(from, from + count).forEach(function (s) {
      voice.prefetch(s.steps.filter(function (a) { return a.say; }).map(spokenText));
    });
  }

  function changePrefs(patch) {
    var next = { ...prefsRef.current, ...patch };
    prefsRef.current = next;
    setPrefs(next);
    voice.savePrefs(next);
    if (!next.on) voice.stopSpeech();
  }

  function testVoice() {
    voice.unlockAudio();
    voice.stopSpeech();
    voice.speak(TEST_LINE, chosenRef.current);
  }

  // The player asks for every line; it is spoken only while the voice-over is on. With it off, the
  // line stays on screen long enough to read.
  function speakLine(text) {
    if (!prefsRef.current.on) return sleep(Math.max(1600, text.split(/\s+/).length * 260));
    return voice.speak(text, chosenRef.current);
  }

  async function start(from, only) {
    voice.unlockAudio(); // first thing in the tap, so phones and Safari allow the narration
    if (player.current) player.current.stop();
    voice.stopSpeech();
    prefetchScenes(from, 2);
    var a = appRef.current;
    a.setLang("en");
    a.setQuick(false);
    if (SCENES[from].signup) await signedOut(a);
    else { a.setUser(freshDemoDay()); a.go("home"); }
    setMode("playing");
    setPaused(false);
    setLine("");
    await sleep(700);

    var p = createPlayer({
      app: a,
      onSay: setLine,
      speak: canSpeak ? speakLine : null,
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
        prefetchScenes(i + 1, 1);
        var s = SCENES[i];
        var u = auth.getUser();
        // After the sign-up scene the story jumps to day 7, as the demo persona with her data.
        if (!s.signup && (!u || u.id !== "demo")) {
          appRef.current.setUser(freshDemoDay());
          await sleep(900);
          appRef.current.go("home");
          await sleep(600);
        } else if (u && u.phase !== s.phase) {
          appRef.current.setUser(auth.updateUser({ phase: s.phase }));
        }
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
    if (p.paused) { p.resume(); voice.resumeSpeech(); setPaused(false); } else { p.pause(); voice.pauseSpeech(); setPaused(true); }
  }

  function skip() {
    var next = scene + 1;
    if (next >= SCENES.length) { finish(); return; }
    start(next);
  }

  function finish() {
    if (player.current) player.current.stop();
    voice.stopSpeech();
    var a = appRef.current;
    a.setQuick(false);
    a.setLang("en");
    var u = auth.getUser();
    if (!u || u.id !== "demo") a.setUser(freshDemoDay());
    else if (u.phase !== "stimulation" || u.anonymous) a.setUser(auth.updateUser({ phase: "stimulation", anonymous: false }));
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
          {canSpeak && (
            <div className="rounded-2xl bg-bloom-surface/70 px-3 py-2.5 mb-4">
              <div className="flex items-center gap-2">
                {prefs.on ? <Volume2 size={16} className="text-bloom-accent" /> : <VolumeX size={16} className="text-bloom-muted" />}
                <span className="flex-1 text-bloom-text text-sm font-semibold">Voice-over</span>
                <button role="switch" aria-checked={prefs.on} aria-label="Voice-over" onClick={function () { changePrefs({ on: !prefs.on }); }}
                  className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0" style={{ backgroundColor: prefs.on ? "#9B6DC5" : "#E8E0DB" }}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: prefs.on ? 22 : 2 }} />
                </button>
              </div>
              {prefs.on && (
                <div className="flex items-center gap-2 mt-2">
                  <label htmlFor="film-voice" className="sr-only">Voice</label>
                  <select id="film-voice" value={chosen} onChange={function (e) { changePrefs({ name: e.target.value }); }}
                    className="flex-1 min-w-0 bg-white border border-bloom-border rounded-lg px-2 py-1.5 text-xs text-bloom-text">
                    <option value={voice.STUDIO}>Bloom narrator · British woman{provider ? " (studio)" : ""}</option>
                    {voices.map(function (v) { return <option key={v.name} value={v.name}>{v.name} · device voice</option>; })}
                  </select>
                  <button onClick={testVoice} className="px-3 py-1.5 rounded-lg bg-white border border-bloom-border text-xs font-semibold text-bloom-accent">Test voice</button>
                </div>
              )}
            </div>
          )}
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
          {canSpeak && (
            <button onClick={function () { changePrefs({ on: !prefs.on }); }} aria-label={prefs.on ? "Turn the voice-over off" : "Turn the voice-over on"} aria-pressed={prefs.on}
              className="w-8 h-8 rounded-full flex items-center justify-center text-bloom-text hover:bg-bloom-surface">
              {prefs.on ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          )}
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
