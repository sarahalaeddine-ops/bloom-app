"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "../../lib/store";
import { BloomFlower, Illustration } from "../../components/ui/Graphics";

var FEATURES = [
  { art: "egg", title: "See your cycle", body: "A live follicle map, hormone trends and a journey ring that shows exactly where you are, from stims to beta." },
  { art: "heart", title: "Never alone", body: "Nora, your AI guide, is there at 3am. Every member also gets a free session with an IVF-specialist therapist." },
  { art: "shield", title: "Private by design", body: "App lock, anonymous mode and one-tap data export. Your data is never sold." },
];

var BASE_COUNT = 2847;

export default function Landing() {
  var [email, setEmail] = useState("");
  var [error, setError] = useState("");
  var [joined, setJoined] = useState(false);
  var [count, setCount] = useState(BASE_COUNT);

  useEffect(function () {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
    setCount(BASE_COUNT + store.get("waitlist", []).length);
  }, []);

  function join(e) {
    e.preventDefault();
    var v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError("Please enter a valid email"); return; }
    var list = store.get("waitlist", []);
    if (!list.includes(v)) {
      list.push(v);
      store.set("waitlist", list);
      setCount(BASE_COUNT + list.length);
    }
    setError("");
    setJoined(true);
  }

  return (
    <div className="fixed inset-0 overflow-y-auto flex flex-col items-center px-6 py-14 text-center" style={{ backgroundColor: "#FDFAF7" }}>
      <div className="pointer-events-none fixed -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, #9B6DC5 0%, transparent 65%)" }} />
      <div className="pointer-events-none fixed -bottom-40 -right-40 w-[520px] h-[520px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #E07A8A 0%, transparent 65%)" }} />

      <main className="relative z-10 flex flex-col items-center max-w-xl w-full">
        <BloomFlower size={84} className="mb-3" />
        <p className="logo" style={{ fontSize: "clamp(56px, 12vw, 80px)", lineHeight: 1 }}>bloom ✦</p>
        <p className="text-bloom-dim uppercase mt-3 mb-10" style={{ fontSize: "11px", letterSpacing: "0.25em" }}>Your IVF companion</p>

        <h1 className="font-serif text-bloom-text font-light mb-5" style={{ fontSize: "clamp(34px, 7vw, 52px)", lineHeight: 1.1 }}>
          The hardest journey<br />you will ever take.<br /><em className="text-bloom-accent">Not alone.</em>
        </h1>
        <p className="text-bloom-muted text-base mb-8 max-w-md">An AI companion built for women going through IVF. Launching soon.</p>

        {joined ? (
          <p className="font-serif italic text-bloom-accent text-2xl mb-6 animate-fade-in" role="status">You are on the list. ✦</p>
        ) : (
          <form onSubmit={join} className="w-full max-w-md flex flex-col sm:flex-row gap-2 mb-2">
            <label htmlFor="wl-email" className="sr-only">Email</label>
            <input id="wl-email" type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="your@email.com"
              className="flex-1 bg-white border border-bloom-border rounded-xl px-4 py-3.5 text-bloom-text text-sm outline-none focus:border-bloom-accent" />
            <button type="submit" className="bg-bloom-accent hover:bg-bloom-deep text-white font-semibold px-6 py-3.5 rounded-xl transition-colors whitespace-nowrap">Join the waitlist</button>
          </form>
        )}
        {error && <p className="text-red-500 text-xs mb-2" role="alert">{error}</p>}

        <p className="text-bloom-muted text-sm mt-4">
          <span className="font-serif text-bloom-accent" style={{ fontSize: "22px" }}>{count.toLocaleString()}</span> women already waiting
        </p>

        <Link href="/" className="text-bloom-accent text-xs font-semibold mt-6 underline underline-offset-4">Preview the app →</Link>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 w-full" aria-label="Features">
          {FEATURES.map(function (f) {
            return (
              <div key={f.title} className="bg-white/80 rounded-3xl p-5 border border-bloom-border flex flex-col items-center">
                <Illustration name={f.art} size={88} />
                <h2 className="text-bloom-text font-semibold mt-3 mb-1">{f.title}</h2>
                <p className="text-bloom-muted text-sm leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </section>
        <p className="font-serif italic text-bloom-muted text-xl mt-10 max-w-md">Period apps track cycles. Bloom walks with you through IVF.</p>
      </main>

      <footer className="relative z-10 mt-12 text-bloom-dim text-xs">© 2025 Bloom · <a href="mailto:hello@bloomivf.app" className="underline">hello@bloomivf.app</a></footer>
    </div>
  );
}
