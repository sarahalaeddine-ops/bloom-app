// Autoplay engine for the investor demo (lib/demo-film.js): drives the real app the way a person
// would. It finds a button or field on screen, scrolls it into view, moves the on-screen finger to
// it, then taps it or types into it, character by character. Nothing is faked: every tap goes
// through the app's own handlers and saves to the demo persona's data.
//
// A target that can't be found is skipped (with a console warning) so the film never stops halfway.

var CLICKABLE = "button, a, [role=button], [role=switch], [role=tab], label, summary";

export function sleep(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

function visible(el) {
  if (!el || el.closest("[data-autoplay-ui]")) return false;
  var r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false;
  var cs = getComputedStyle(el);
  return cs.visibility !== "hidden" && cs.display !== "none";
}

function norm(s) {
  return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function scopeOf(where) {
  if (where === "nav") return document.querySelector("nav");
  if (where === "dialog") {
    var dialogs = document.querySelectorAll("[role=dialog]");
    return dialogs[dialogs.length - 1] || null;
  }
  if (where === "main") return document.querySelector("main");
  return document;
}

// target: "text" or { text, exact, label, id, sel, in: "nav" | "dialog" | "main", nth }
export function find(target) {
  var t = typeof target === "string" ? { text: target } : target;
  if (t.id) { var byId = document.getElementById(t.id); return visible(byId) ? byId : null; }
  var root = scopeOf(t.in);
  if (!root) return null;
  var list = Array.prototype.slice.call(root.querySelectorAll(t.sel || CLICKABLE)).filter(visible);
  if (t.label) {
    var want = norm(t.label);
    list = list.filter(function (el) { return norm(el.getAttribute("aria-label")) === want; });
  }
  if (t.text) {
    var text = norm(t.text);
    list = list.filter(function (el) {
      var own = norm(el.innerText || el.textContent);
      return t.exact ? own === text : own.indexOf(text) !== -1;
    });
    // The tightest match first: the element whose text is closest to what we asked for.
    list.sort(function (a, b) { return norm(a.innerText).length - norm(b.innerText).length; });
  }
  return list[t.nth || 0] || null;
}

export async function waitFor(fn, timeout) {
  var end = Date.now() + (timeout || 4000);
  while (Date.now() < end) {
    var v = fn();
    if (v) return v;
    await sleep(120);
  }
  return null;
}

// Sets a React-controlled field and tells React about it.
function setNative(el, value) {
  var proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

// A player: runs actions one after another and can be paused or stopped between any two.
// finger: { moveTo(x, y), tap() } from the on-screen finger component.
// speak(text) (optional): voice-over. It returns a promise; each line is spoken while the following
// taps carry on, and the next line (or the end of the scene) waits for it to finish.
export function createPlayer(opts) {
  var state = { paused: false, stopped: false, speed: 1 };
  var voice = null; // { done } for the line being spoken

  async function gate() {
    while (state.paused && !state.stopped) await sleep(150);
    if (state.stopped) throw new Error("stopped");
  }

  async function pause(ms) {
    var end = Date.now() + ms / state.speed;
    while (Date.now() < end) {
      await gate();
      await sleep(Math.min(120, end - Date.now()));
    }
    await gate();
  }

  async function voiceDone() {
    while (voice && !voice.done) {
      await gate();
      await sleep(120);
    }
  }

  async function reach(target) {
    var el = await waitFor(function () { return find(target); }, 4000);
    if (!el) {
      console.warn("[autoplay] not found:", JSON.stringify(target));
      return null;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    await pause(550);
    var r = el.getBoundingClientRect();
    opts.finger.moveTo(r.left + r.width / 2, r.top + Math.min(r.height / 2, 28));
    await pause(650);
    return el;
  }

  var actions = {
    say: async function (a) {
      await voiceDone();
      opts.onSay(a.say);
      if (!opts.speak) { await pause(a.hold || 1600); return; }
      var line = { done: false };
      voice = line;
      Promise.resolve(opts.speak(a.voice || a.say)).catch(function () {}).then(function () { line.done = true; });
      await pause(700);
    },
    wait: async function (a) { await pause(a.wait); },
    tap: async function (a) {
      var el = await reach(a.tap);
      if (!el) return;
      opts.finger.tap();
      await pause(180);
      el.click();
      await pause(a.after || 900);
    },
    type: async function (a) {
      var el = await reach(a.type);
      if (!el) return;
      opts.finger.tap();
      el.focus({ preventScroll: true });
      if (el.type === "number" || el.type === "date" || el.type === "time") {
        await pause(400);
        setNative(el, a.text);
      } else {
        var base = a.append ? el.value : "";
        for (var i = 1; i <= a.text.length; i++) {
          setNative(el, base + a.text.slice(0, i));
          await pause(a.text[i - 1] === " " ? 70 : 45);
        }
      }
      el.blur();
      await pause(a.after || 700);
    },
    scroll: async function (a) {
      if (typeof a.scroll === "number") {
        var box = scopeOf("dialog");
        var target = box && box.scrollHeight > box.clientHeight ? box : window;
        target.scrollBy({ top: a.scroll, behavior: "smooth" });
      } else {
        var el = find(a.scroll);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      await pause(a.after || 1300);
    },
    top: async function (a) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      await pause(a.after || 700);
    },
    // Waits for Nora's reply: her typing indicator (components/ui/Chat.jsx) shows, then goes away.
    nora: async function (a) {
      await pause(900);
      var end = Date.now() + 30000;
      while (Date.now() < end && document.querySelector("main [role=status][aria-label]")) await pause(300);
      await pause(400);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      await pause(a.read || 4500);
    },
    run: async function (a) { await a.run(opts.app); await pause(a.after || 500); },
  };

  async function play(steps, onStep) {
    for (var i = 0; i < steps.length; i++) {
      await gate();
      if (onStep) onStep(i);
      var a = steps[i];
      var kind = Object.keys(actions).find(function (k) { return k in a; });
      await actions[kind](a);
    }
    await voiceDone();
  }

  return {
    play: play,
    pause: function () { state.paused = true; },
    resume: function () { state.paused = false; },
    stop: function () { state.stopped = true; state.paused = false; },
    get paused() { return state.paused; },
  };
}
