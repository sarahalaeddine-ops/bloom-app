Write-Host "Building Bloom Next.js app..." -ForegroundColor Magenta

# ── tailwind.config.js ───────────────────────────────────────
Set-Content -Path "tailwind.config.js" -Value @'
/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bloom: {
          bg:      "#FAF7F4",
          card:    "#FFFFFF",
          border:  "#E8E0DB",
          surface: "#F0EBE8",
          accent:  "#9B6DC5",
          deep:    "#7C3AED",
          rose:    "#E07A8A",
          teal:    "#4ABFB0",
          gold:    "#C49A3C",
          text:    "#1A1014",
          muted:   "#7A6880",
          dim:     "#C5B8CC",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans:  ["DM Sans", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
'@
Write-Host "tailwind.config.js done" -ForegroundColor Green

# ── app/globals.css ──────────────────────────────────────────
Set-Content -Path "app\globals.css" -Value @'
@import "tailwindcss";

@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap");

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: "DM Sans", sans-serif;
  background: #FAF7F4;
  color: #1A1014;
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
}

.font-serif { font-family: "Cormorant Garamond", serif; }

::-webkit-scrollbar { display: none; }
'@
Write-Host "globals.css done" -ForegroundColor Green

# ── app/layout.jsx ───────────────────────────────────────────
Set-Content -Path "app\layout.jsx" -Value @'
import "./globals.css";

export const metadata = {
  title: "Bloom — Your IVF Companion",
  description: "The world first dedicated IVF companion app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
'@
Write-Host "layout.jsx done" -ForegroundColor Green

# ── lib/store.js — simple in-memory store ────────────────────
New-Item -ItemType Directory -Force -Path "lib" | Out-Null
Set-Content -Path "lib\store.js" -Value @'
// Simple in-memory store for demo
let currentUser = null;
let users = {};

export const auth = {
  signUp: (name, email, password) => {
    if (users[email]) return { error: "Email already exists" };
    const user = {
      id: Date.now().toString(),
      name, email, password,
      clinic: "Emirates Fertility Centre",
      protocol: "Antagonist",
      phase: "stimulation",
      stimDay: 7,
      follicles: 11,
      e2: 1840,
      onboarded: false,
    };
    users[email] = user;
    currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("bloom_user", JSON.stringify(user));
    }
    return { data: user, error: null };
  },
  signIn: (email, password) => {
    const user = users[email];
    if (!user) return { error: "No account found. Please sign up." };
    if (user.password !== password) return { error: "Wrong email or password." };
    currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("bloom_user", JSON.stringify(user));
    }
    return { data: user, error: null };
  },
  getUser: () => {
    if (currentUser) return currentUser;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bloom_user");
      if (saved) {
        currentUser = JSON.parse(saved);
        return currentUser;
      }
    }
    return null;
  },
  updateUser: (updates) => {
    if (!currentUser) return null;
    currentUser = { ...currentUser, ...updates };
    if (typeof window !== "undefined") {
      localStorage.setItem("bloom_user", JSON.stringify(currentUser));
    }
    return currentUser;
  },
  signOut: () => {
    currentUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("bloom_user");
    }
  },
};
'@
Write-Host "store.js done" -ForegroundColor Green

# ── app/page.jsx — main app entry ────────────────────────────
Set-Content -Path "app\page.jsx" -Value @'
"use client";
import { useState, useEffect } from "react";
import { auth } from "../lib/store";
import SplashScreen from "../components/SplashScreen";
import AuthScreen from "../components/AuthScreen";
import OnboardingScreen from "../components/OnboardingScreen";
import AppShell from "../components/AppShell";

export default function Home() {
  const [stage, setStage] = useState("splash");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = auth.getUser();
    if (saved) setUser(saved);
  }, []);

  if (stage === "splash") {
    return <SplashScreen onDone={() => setStage("main")} />;
  }

  if (!user) {
    return <AuthScreen onLogin={(u) => setUser(u)} />;
  }

  if (!user.onboarded) {
    return <OnboardingScreen user={user} onComplete={(u) => setUser(u)} />;
  }

  return <AppShell user={user} setUser={setUser} />;
}
'@
Write-Host "page.jsx done" -ForegroundColor Green

# ── components/ directory ────────────────────────────────────
New-Item -ItemType Directory -Force -Path "components" | Out-Null

# ── components/SplashScreen.jsx ──────────────────────────────
Set-Content -Path "components\SplashScreen.jsx" -Value @'
"use client";
import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      setTimeout(onDone, 500);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`fixed inset-0 bg-bloom-bg flex flex-col items-center justify-center transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"}`}>
      <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #9B6DC5, transparent)" }} />
      <div className="absolute bottom-1/4 -right-20 w-56 h-56 rounded-full opacity-8" style={{ background: "radial-gradient(circle, #E07A8A, transparent)" }} />
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        <p className="font-serif text-6xl font-light italic tracking-widest text-bloom-accent" style={{ letterSpacing: "0.15em" }}>
          bloom
        </p>
        <p className="text-bloom-accent text-3xl mt-1">✦</p>
        <div className="w-16 h-px bg-bloom-accent opacity-30 my-6" />
        <p className="text-bloom-muted text-xs tracking-widest uppercase" style={{ letterSpacing: "0.2em" }}>
          Your IVF companion
        </p>
        <div className="flex gap-2 mt-10">
          <div className="w-2 h-2 rounded-full bg-bloom-accent animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-bloom-rose animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-bloom-teal animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
      <p className="absolute bottom-12 text-bloom-dim text-xs tracking-wide">
        You are not alone in this journey
      </p>
    </div>
  );
}
'@
Write-Host "SplashScreen done" -ForegroundColor Green

# ── components/AuthScreen.jsx ─────────────────────────────────
Set-Content -Path "components\AuthScreen.jsx" -Value @'
"use client";
import { useState } from "react";
import { auth } from "../lib/store";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    setError("");
    if (!email || !password) { setError("Please enter email and password"); return; }
    if (mode === "signup" && !name) { setError("Please enter your name"); return; }
    setLoading(true);
    const result = mode === "signup"
      ? auth.signUp(name, email, password)
      : auth.signIn(email, password);
    if (result.error) { setError(result.error); setLoading(false); return; }
    onLogin(result.data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-serif text-5xl font-light italic text-bloom-accent" style={{ letterSpacing: "0.12em" }}>bloom</p>
          <p className="text-bloom-accent text-2xl">✦</p>
          <p className="text-bloom-muted text-sm mt-2 font-light">Your IVF companion</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-bloom-border shadow-sm">
          <div className="flex bg-bloom-surface rounded-xl p-1 mb-6">
            {["signup", "login"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? "bg-bloom-accent text-white" : "text-bloom-muted"}`}>
                {m === "signup" ? "Sign Up" : "Sign In"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-bloom-muted uppercase tracking-wide mb-2 block">Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Sarah"
                className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none focus:border-bloom-accent transition-colors" />
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-semibold text-bloom-muted uppercase tracking-wide mb-2 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none focus:border-bloom-accent transition-colors" />
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-bloom-muted uppercase tracking-wide mb-2 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none focus:border-bloom-accent transition-colors" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          <button onClick={handleAuth} disabled={loading}
            className="w-full bg-bloom-accent text-white font-semibold py-4 rounded-xl mt-2 transition-opacity disabled:opacity-60">
            {loading ? "..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>

          <p className="text-bloom-dim text-xs text-center mt-4">
            {mode === "login" ? "New to Bloom? Switch to Sign Up" : "Already have an account? Switch to Sign In"}
          </p>
        </div>

        <p className="text-bloom-dim text-xs text-center mt-6">Your data is private and never sold.</p>
      </div>
    </div>
  );
}
'@
Write-Host "AuthScreen done" -ForegroundColor Green

# ── components/OnboardingScreen.jsx ──────────────────────────
Set-Content -Path "components\OnboardingScreen.jsx" -Value @'
"use client";
import { useState } from "react";
import { auth } from "../lib/store";

const PROTOCOLS = ["Antagonist", "Long Lupron", "Mini IVF", "Natural", "Not sure yet"];
const PHASES = [
  { id: "stimulation", label: "Stimulation",    icon: "💉", desc: "Daily injections, monitoring scans" },
  { id: "tww",         label: "Two Week Wait",  icon: "⏳", desc: "After transfer, waiting for beta" },
  { id: "retrieval",   label: "Post Retrieval", icon: "🥚", desc: "Eggs retrieved, waiting for embryos" },
  { id: "transfer",    label: "Pre Transfer",   icon: "💜", desc: "Preparing for embryo transfer" },
  { id: "planning",    label: "Planning",        icon: "📋", desc: "Planning my first or next cycle" },
];

export default function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [clinic, setClinic] = useState("");
  const [protocol, setProtocol] = useState("");
  const [phase, setPhase] = useState("");
  const [stimDay, setStimDay] = useState(7);

  const steps = ["welcome", "clinic", "protocol", "phase", "day", "therapy", "done"];
  const current = steps[step];
  const progress = (step / (steps.length - 1)) * 100;

  function finish() {
    const updated = auth.updateUser({ clinic: clinic || "My Clinic", protocol: protocol || "Antagonist", phase: phase || "stimulation", stimDay, onboarded: true });
    onComplete(updated);
  }

  const canNext = current === "welcome" ? true : current === "clinic" ? clinic.length > 0 : current === "protocol" ? protocol.length > 0 : current === "phase" ? phase.length > 0 : true;

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <div className="h-1 bg-bloom-border">
        <div className="h-1 bg-bloom-accent transition-all duration-500" style={{ width: progress + "%" }} />
      </div>

      {step > 0 && step < steps.length - 1 && (
        <button onClick={() => setStep(step - 1)} className="self-start px-4 py-4 text-bloom-muted text-sm">← Back</button>
      )}

      <div className="flex-1 px-6 py-4 overflow-y-auto">

        {current === "welcome" && (
          <div className="flex flex-col items-center text-center pt-8">
            <p className="font-serif text-5xl font-light italic text-bloom-accent mb-2" style={{ letterSpacing: "0.12em" }}>bloom ✦</p>
            <h1 className="text-2xl font-bold text-bloom-text mt-6 mb-3">Welcome, {user.name} 💜</h1>
            <p className="text-bloom-muted text-sm leading-relaxed mb-8">Bloom is your personal IVF companion. We will track your cycle, guide you through every phase, and be here when the anxiety peaks.</p>
            <div className="w-full bg-white rounded-2xl p-5 border border-bloom-border text-left">
              {["Live follicle map and hormone trends", "Nora AI — your IVF guide", "Daily check-ins and symptom tracking", "Secret Space for the hard feelings", "Partner mode to keep them in the loop"].map((f, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="text-bloom-accent text-xs mt-1">✦</span>
                  <span className="text-bloom-muted text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {current === "clinic" && (
          <div className="pt-4">
            <p className="text-4xl mb-4">🏥</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">Your clinic</h1>
            <p className="text-bloom-muted text-sm mb-6">Where are you doing your IVF?</p>
            <input value={clinic} onChange={(e) => setClinic(e.target.value)}
              placeholder="e.g. Emirates Fertility Centre"
              className="w-full bg-white border border-bloom-border rounded-2xl px-4 py-4 text-bloom-text text-sm outline-none focus:border-bloom-accent" />
            <p className="text-bloom-dim text-xs mt-2">This helps Bloom personalize your experience</p>
          </div>
        )}

        {current === "protocol" && (
          <div className="pt-4">
            <p className="text-4xl mb-4">💊</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">Your protocol</h1>
            <p className="text-bloom-muted text-sm mb-6">What protocol are you on?</p>
            <div className="flex flex-col gap-3">
              {PROTOCOLS.map((p) => (
                <button key={p} onClick={() => setProtocol(p)}
                  className={`flex items-center justify-between px-4 py-4 rounded-2xl border text-left transition-all ${protocol === p ? "border-bloom-accent bg-purple-50" : "border-bloom-border bg-white"}`}>
                  <span className={`text-sm font-medium ${protocol === p ? "text-bloom-accent" : "text-bloom-muted"}`}>{p}</span>
                  {protocol === p && <span className="text-bloom-accent text-sm">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "phase" && (
          <div className="pt-4">
            <p className="text-4xl mb-4">📍</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">Your current phase</h1>
            <p className="text-bloom-muted text-sm mb-6">Where are you in your cycle right now?</p>
            <div className="flex flex-col gap-3">
              {PHASES.map((p) => (
                <button key={p.id} onClick={() => setPhase(p.id)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl border text-left transition-all ${phase === p.id ? "border-bloom-accent bg-purple-50" : "border-bloom-border bg-white"}`}>
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${phase === p.id ? "text-bloom-accent" : "text-bloom-text"}`}>{p.label}</p>
                    <p className="text-bloom-dim text-xs mt-0.5">{p.desc}</p>
                  </div>
                  {phase === p.id && <span className="text-bloom-accent">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "day" && (
          <div className="pt-4">
            <p className="text-4xl mb-4">📅</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">Your stim day</h1>
            <p className="text-bloom-muted text-sm mb-8">What day of stimulation are you on?</p>
            <div className="flex items-center justify-center gap-6 mb-8">
              <button onClick={() => setStimDay(Math.max(1, stimDay - 1))}
                className="w-14 h-14 rounded-full border border-bloom-border bg-white text-bloom-accent text-2xl font-light">−</button>
              <div className="text-center">
                <p className="text-7xl font-bold text-bloom-accent" style={{ letterSpacing: "-3px" }}>{stimDay}</p>
                <p className="text-bloom-muted text-sm mt-1">Day of Stimulation</p>
              </div>
              <button onClick={() => setStimDay(Math.min(20, stimDay + 1))}
                className="w-14 h-14 rounded-full border border-bloom-border bg-white text-bloom-accent text-2xl font-light">+</button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({length: 14}, (_, i) => i + 1).map((d) => (
                <button key={d} onClick={() => setStimDay(d)}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${stimDay === d ? "bg-bloom-accent text-white" : "bg-bloom-surface text-bloom-muted"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "therapy" && (
          <div className="pt-4">
            <p className="text-4xl mb-4">◇</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-2">One free session. Mandatory.</h1>
            <p className="text-bloom-muted text-sm leading-relaxed mb-6">Every woman who joins Bloom gets one free session with an IVF-specialist therapist. We made it mandatory because most women who need it would never book it on their own.</p>
            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200">
              <p className="font-semibold text-bloom-accent text-base mb-1">Dr. Sarah Mitchell</p>
              <p className="text-bloom-muted text-sm mb-1">Reproductive Psychiatry · 12 years IVF support</p>
              <p className="text-bloom-muted text-sm mb-4">Next available: Tomorrow 2:00 PM</p>
              <button className="w-full bg-bloom-accent text-white font-semibold py-3 rounded-xl">Book my free session</button>
              <p className="text-bloom-dim text-xs text-center mt-3">You can also book later from the Therapy screen</p>
            </div>
          </div>
        )}

        {current === "done" && (
          <div className="flex flex-col items-center text-center pt-8">
            <p className="text-5xl mb-4">💜</p>
            <h1 className="text-2xl font-bold text-bloom-text mb-3">Bloom is ready!</h1>
            <p className="text-bloom-muted text-sm leading-relaxed mb-6">Your cycle is set up. Nora is ready to guide you. You are not alone in this journey.</p>
            <div className="w-full bg-white rounded-2xl p-5 border border-bloom-border text-left">
              {[["Name", user.name], ["Clinic", clinic || "My Clinic"], ["Protocol", protocol || "Antagonist"], ["Phase", PHASES.find(p => p.id === phase)?.label || "Stimulation"], ["Stim Day", "Day " + stimDay]].map(([label, value]) => (
                <div key={label} className="flex justify-between py-3 border-b border-bloom-border last:border-0">
                  <span className="text-bloom-muted text-sm">{label}</span>
                  <span className="text-bloom-text text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-8 pt-4">
        <button onClick={current === "done" ? finish : () => setStep(step + 1)}
          disabled={!canNext}
          className="w-full bg-bloom-accent text-white font-semibold py-4 rounded-2xl disabled:opacity-40 transition-opacity text-base">
          {current === "done" ? "Open Bloom 💜" : current === "welcome" ? "Get Started →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
'@
Write-Host "OnboardingScreen done" -ForegroundColor Green

# ── components/AppShell.jsx ───────────────────────────────────
Set-Content -Path "components\AppShell.jsx" -Value @'
"use client";
import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import CheckInScreen from "./screens/CheckInScreen";
import NoraScreen from "./screens/NoraScreen";
import InsightsScreen from "./screens/InsightsScreen";
import MoreScreen from "./screens/MoreScreen";

const TABS = [
  { id: "home",    label: "Home",     icon: "◉" },
  { id: "checkin", label: "Check-in", icon: "✦" },
  { id: "nora",    label: "Nora AI",  icon: "☽" },
  { id: "insights",label: "Insights", icon: "✺" },
  { id: "more",    label: "More",     icon: "⋯" },
];

export default function AppShell({ user, setUser }) {
  const [tab, setTab] = useState("home");

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        {tab === "home"     && <HomeScreen user={user} />}
        {tab === "checkin"  && <CheckInScreen />}
        {tab === "nora"     && <NoraScreen user={user} />}
        {tab === "insights" && <InsightsScreen />}
        {tab === "more"     && <MoreScreen user={user} setUser={setUser} />}
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-bloom-border flex z-50">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${tab === t.id ? "text-bloom-accent" : "text-bloom-dim"}`}>
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-[10px] font-semibold tracking-wide">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
'@
Write-Host "AppShell done" -ForegroundColor Green

# ── screens directory ─────────────────────────────────────────
New-Item -ItemType Directory -Force -Path "components\screens" | Out-Null

# ── HomeScreen ────────────────────────────────────────────────
Set-Content -Path "components\screens\HomeScreen.jsx" -Value @'
"use client";

const FOLLICLES = [
  {s:18,side:"R"},{s:16,side:"R"},{s:15,side:"R"},
  {s:17,side:"L"},{s:16,side:"L"},{s:14,side:"L"},
  {s:14,side:"R"},{s:13,side:"L"},{s:12,side:"R"},
  {s:12,side:"L"},{s:11,side:"R"},
];

const MEDS = [
  {name:"Gonal-F",   dose:"225 IU",  time:"9:00 PM", taken:true,  color:"#9B6DC5"},
  {name:"Cetrotide", dose:"0.25 mg", time:"8:00 AM", taken:true,  color:"#E07A8A"},
  {name:"Progynova", dose:"2 mg",    time:"8AM/8PM", taken:false, color:"#C49A3C"},
  {name:"Folic Acid",dose:"400mcg",  time:"8:00 AM", taken:true,  color:"#4ABFB0"},
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen({ user }) {
  const name = user?.name || "Sarah";
  const stimDay = user?.stimDay || 7;
  const follicles = user?.follicles || 11;
  const e2 = user?.e2 || 1840;
  const protocol = user?.protocol || "Antagonist";
  const clinic = user?.clinic || "Emirates Fertility Centre";
  const pct = Math.round((stimDay / 12) * 100);

  return (
    <div className="px-4 pb-6">
      <div className="flex justify-between items-center py-4">
        <p className="font-serif text-2xl font-light italic text-bloom-accent" style={{letterSpacing:"0.1em"}}>bloom ✦</p>
        <p className="text-bloom-muted text-xs">Day {stimDay} · {name}</p>
      </div>

      <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200 mb-3">
        <p className="text-bloom-muted text-xs uppercase tracking-wider mb-2">{greeting()}, {name} ✦</p>
        <h1 className="text-3xl font-light text-bloom-text mb-1" style={{letterSpacing:"-1px"}}>Stimulation<br/>Day {stimDay}</h1>
        <p className="text-bloom-muted text-sm mb-4">{protocol} Protocol · {clinic}</p>
        <div className="h-1.5 bg-bloom-border rounded-full overflow-hidden">
          <div className="h-full bg-bloom-accent rounded-full transition-all" style={{width: pct + "%"}} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-bloom-dim text-xs">Day 1</span>
          <span className="text-bloom-accent text-xs">{12 - stimDay} days to retrieval est.</span>
          <span className="text-bloom-dim text-xs">Trigger</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[[follicles, "Follicles", "4 mature", "#9B6DC530", "#9B6DC5"],
          [e2 >= 1000 ? (e2/1000).toFixed(1)+"k" : e2, "E2 pg/mL", "day "+stimDay, "#E07A8A30", "#E07A8A"],
          ["8AM", "Next Scan", "Tomorrow", "#4ABFB030", "#4ABFB0"]].map(([val, label, sub, border, color]) => (
          <div key={label} className="bg-white rounded-xl p-3 border text-center" style={{borderColor: border}}>
            <p className="text-xl font-semibold" style={{color, letterSpacing:"-1px"}}>{val}</p>
            <p className="text-bloom-muted text-xs mt-0.5">{label}</p>
            <p className="text-bloom-dim text-xs">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">Follicle Map</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {FOLLICLES.map((f, i) => {
            const mature = f.s >= 16;
            const col = f.side === "R" ? "#9B6DC5" : "#4ABFB0";
            const sz = Math.max(32, Math.min(50, f.s * 2.2));
            return (
              <div key={i} className="flex items-center justify-center rounded-full border-2 flex-col"
                style={{width:sz, height:sz, borderColor: mature ? col : "#C5B8CC", backgroundColor: mature ? col + "20" : "#F0EBE8"}}>
                <span className="text-xs font-bold leading-none" style={{color: mature ? col : "#7A6880", fontSize:"9px"}}>{f.s}</span>
                <span className="leading-none" style={{color:"#C5B8CC", fontSize:"7px"}}>{f.side}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-bloom-accent" /><span className="text-bloom-muted text-xs">Right</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-bloom-teal" /><span className="text-bloom-muted text-xs">Left</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">Medications Today</p>
        <div className="flex flex-col gap-2">
          {MEDS.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border"
              style={{borderColor: m.taken ? m.color + "40" : "#E8E0DB", backgroundColor: m.taken ? m.color + "08" : "white"}}>
              <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
                style={{borderColor: m.taken ? m.color : "#C5B8CC", color: m.taken ? m.color : "#C5B8CC", backgroundColor: m.taken ? m.color + "18" : "#F0EBE8"}}>
                {m.taken ? "✓" : "○"}
              </div>
              <div className="flex-1">
                <p className="text-bloom-text text-sm font-semibold">{m.name} <span className="font-normal text-bloom-muted">{m.dose}</span></p>
                <p className="text-bloom-dim text-xs">{m.time}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                style={{color: m.taken ? "#4ABFB0" : "#7A6880", backgroundColor: m.taken ? "#4ABFB015" : "#F0EBE8"}}>
                {m.taken ? "Done" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
'@
Write-Host "HomeScreen done" -ForegroundColor Green

# ── CheckInScreen ─────────────────────────────────────────────
Set-Content -Path "components\screens\CheckInScreen.jsx" -Value @'
"use client";
import { useState } from "react";

const MOODS = [{mark:"🥺",l:"Hard",c:"#E07A8A"},{mark:"😔",l:"Low",c:"#C49A3C"},{mark:"😶",l:"Okay",c:"#7A6880"},{mark:"🌱",l:"Hopeful",c:"#9B6DC5"},{mark:"🌸",l:"Good",c:"#4ABFB0"}];
const SYMPTOMS = ["Bloating","Cramping","Headache","Nausea","Breast tenderness","Hot flashes","Fatigue","Injection site pain","Back pain","Mood swings","Spotting","Insomnia"];

export default function CheckInScreen() {
  const [mood, setMood] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [anxiety, setAnxiety] = useState(3);
  const [hope, setHope] = useState(3);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  function toggle(s) {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  if (done) return (
    <div className="min-h-screen bg-bloom-bg flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl text-bloom-accent mb-4">✦</p>
      <h2 className="text-2xl font-bold text-bloom-text mb-2">Check-in saved</h2>
      <p className="text-bloom-muted text-sm mb-8 leading-relaxed">Every data point helps us understand your journey better.</p>
      <button onClick={() => setDone(false)} className="bg-bloom-accent text-white font-semibold px-8 py-3 rounded-xl">Check in again</button>
    </div>
  );

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">How are you today?</h1>
        <p className="text-bloom-muted text-sm">Takes about 1 minute</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-4">Overall mood</p>
        <div className="flex gap-1">
          {MOODS.map((m, i) => (
            <button key={i} onClick={() => setMood(i)}
              className="flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all"
              style={{borderColor: mood === i ? m.c : "transparent", backgroundColor: mood === i ? m.c + "12" : "transparent"}}>
              <span className="text-2xl mb-1">{m.mark}</span>
              <span className="text-xs font-semibold" style={{color: mood === i ? m.c : "#C5B8CC"}}>{m.l}</span>
            </button>
          ))}
        </div>
      </div>

      {[["Anxiety level", anxiety, setAnxiety, "#E07A8A"], ["Hopefulness", hope, setHope, "#9B6DC5"]].map(([label, val, setVal, color]) => (
        <div key={label} className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <div className="flex justify-between items-center mb-4">
            <p className="text-bloom-text text-sm font-medium">{label}</p>
            <p className="text-lg font-bold" style={{color}}>{val} / 5</p>
          </div>
          <div className="flex justify-between items-center">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setVal(n)}
                className="rounded-full flex items-center justify-center text-white text-xs font-bold transition-all"
                style={{width: n <= val ? 40 : 30, height: n <= val ? 40 : 30, backgroundColor: n <= val ? color : "#E8E0DB", color: n <= val ? "white" : "#7A6880"}}>
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">Symptoms today</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s, i) => (
            <button key={i} onClick={() => toggle(s)}
              className="px-3 py-1.5 rounded-full border text-xs transition-all"
              style={{borderColor: symptoms.includes(s) ? "#E07A8A" : "#E8E0DB", backgroundColor: symptoms.includes(s) ? "#E07A8A12" : "transparent", color: symptoms.includes(s) ? "#E07A8A" : "#7A6880"}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-amber-200 mb-3" style={{backgroundColor:"#FFFDF0"}}>
        <p className="text-xs uppercase tracking-wider font-semibold mb-2" style={{color:"#C49A3C"}}>OHSS Watch · Daily Weight</p>
        <p className="text-bloom-muted text-xs mb-3">With 11 follicles, track daily. Alert if +2kg in 24hrs.</p>
        <div className="flex items-center gap-2">
          <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 62.4" type="number"
            className="flex-1 bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none" />
          <span className="text-bloom-muted text-sm">kg</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-4">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">Journal note</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="How are you really feeling today?"
          className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none resize-none h-20" />
      </div>

      <button onClick={() => setDone(true)} className="w-full bg-bloom-accent text-white font-semibold py-4 rounded-2xl">
        Save today check-in
      </button>
    </div>
  );
}
'@
Write-Host "CheckInScreen done" -ForegroundColor Green

# ── NoraScreen ────────────────────────────────────────────────
Set-Content -Path "components\screens\NoraScreen.jsx" -Value @'
"use client";
import { useState, useRef, useEffect } from "react";

const SUGGESTED = ["What does my E2 mean?","Am I at risk for OHSS?","When is my trigger shot?","I am scared about retrieval"];
const SYSTEM = "You are Nora, the AI companion inside Bloom — a dedicated IVF tracking app. Patient is on Stimulation Day 7, Antagonist Protocol. Follicles: Right 18,16,15,14,12,11mm Left 17,16,14,13,12mm. E2=1840. Be warm, concise, clinically accurate. Always remind user to confirm with their clinic. Keep responses under 4 sentences.";

export default function NoraScreen({ user }) {
  const [msgs, setMsgs] = useState([{role:"assistant", content:"Hi " + (user?.name || "Sarah") + ". I am Nora, your IVF companion.\n\nYou are on Stimulation Day 7 with 11 follicles and E2 at 1,840. Things look really promising.\n\nHow are you feeling today?"}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs, loading]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const next = [...msgs, {role:"user", content:msg}];
    setMsgs(next);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-6", max_tokens:500, system:SYSTEM, messages:next.map(m => ({role:m.role, content:m.content}))}),
      });
      const data = await res.json();
      setMsgs([...next, {role:"assistant", content:data.content?.[0]?.text || "Sorry, try again."}]);
    } catch {
      setMsgs([...next, {role:"assistant", content:"Something went wrong. Please try again."}]);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-bloom-border">
        <div className="w-9 h-9 rounded-full bg-bloom-accent flex items-center justify-center">
          <span className="text-white text-sm">✦</span>
        </div>
        <div>
          <p className="text-bloom-text text-sm font-semibold">Nora</p>
          <p className="text-bloom-teal text-xs">Online · Knows your cycle</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 bg-bloom-bg">
        {msgs.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED.map((q, i) => (
              <button key={i} onClick={() => send(q)}
                className="px-3 py-2 bg-white border border-bloom-border rounded-full text-bloom-muted text-xs">
                {q}
              </button>
            ))}
          </div>
        )}

        {msgs.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex gap-2 mb-3 ${isUser ? "flex-row-reverse" : ""}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-bloom-accent flex items-center justify-center flex-shrink-0 mt-auto">
                  <span className="text-white text-xs">✦</span>
                </div>
              )}
              <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-bloom-accent text-white rounded-br-sm" : "bg-white border border-bloom-border text-bloom-text rounded-bl-sm"}`}>
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-bloom-accent flex items-center justify-center">
              <span className="text-white text-xs">✦</span>
            </div>
            <div className="bg-white border border-bloom-border px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="text-bloom-dim text-lg tracking-widest">···</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 bg-white border-t border-bloom-border flex gap-2">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
          placeholder="Ask Nora anything..." rows={1}
          className="flex-1 bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none resize-none" />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="w-11 h-11 bg-bloom-accent rounded-xl flex items-center justify-center text-white disabled:opacity-40">
          →
        </button>
      </div>
    </div>
  );
}
'@
Write-Host "NoraScreen done" -ForegroundColor Green

# ── InsightsScreen ────────────────────────────────────────────
Set-Content -Path "components\screens\InsightsScreen.jsx" -Value @'
"use client";
import { useState } from "react";

const CATS = [
  {id:"all",label:"All",mark:"✦",color:"#9B6DC5"},
  {id:"mental",label:"Mental Health",mark:"◑",color:"#8B7AC5"},
  {id:"nutrition",label:"Nutrition",mark:"✺",color:"#C49A3C"},
  {id:"science",label:"IVF Science",mark:"◈",color:"#9B6DC5"},
  {id:"intimacy",label:"Intimacy",mark:"◇",color:"#E07A8A"},
  {id:"movement",label:"Movement",mark:"◎",color:"#4ABFB0"},
];

const ARTICLES = [
  {id:1,cat:"mental",type:"article",title:"The anxiety is not in your head",summary:"IVF stress is comparable to cancer diagnosis.",body:"Studies show IVF patients experience anxiety comparable to serious illness. Not because they are fragile, but because the stakes are existential.\n\nYour nervous system is responding rationally. This is not weakness.",color:"#EDE8F5",textColor:"#8B7AC5",tag:"Mental Health",popular:true},
  {id:2,cat:"science",type:"video",title:"What makes a quality blastocyst?",summary:"The Gardner grading system explained simply.",body:"Blastocysts are graded on expansion from 1 to 6 where 4 to 6 is preferred. Inner Cell Mass graded A, B, or C where A is best.\n\n4AA or 5AA is top quality. But 3BB blastocysts lead to healthy pregnancies regularly.",color:"#F0EBE8",textColor:"#9B6DC5",tag:"IVF Science",popular:true},
  {id:3,cat:"nutrition",type:"article",title:"The IVF fertility plate",summary:"What to eat during stimulation.",body:"Focus on omega-3s from salmon and walnuts. Eat antioxidants from berries and dark greens. Get protein from eggs and legumes.\n\nAvoid alcohol, trans fats, and more than 200mg caffeine per day.",color:"#FEF9EE",textColor:"#C49A3C",tag:"Nutrition",popular:false},
  {id:4,cat:"mental",type:"video",title:"You do not have to stay positive",summary:"Toxic positivity increases cortisol.",body:"Forced positivity actually increases stress hormones. What helps is emotional processing and realistic optimism.\n\nIt is okay to be scared. Your feelings are not sabotaging your cycle.",color:"#F5EEF8",textColor:"#8B7AC5",tag:"Real Talk",popular:true},
  {id:5,cat:"intimacy",type:"article",title:"Is sex safe during stimulation?",summary:"What your clinic probably did not tell you.",body:"During stimulation your ovaries are enlarged and sensitive. Most clinics advise avoiding penetrative sex from Day 3 onward.\n\nEmotional intimacy is encouraged throughout.",color:"#FEF0F2",textColor:"#E07A8A",tag:"Intimacy",popular:false},
  {id:6,cat:"movement",type:"video",title:"Gentle yoga for stimulation day",summary:"8 minute session safe for IVF.",body:"Gentle movement during stimulation can reduce bloating and anxiety. Avoid inversions and deep twists.\n\nThis 8-minute session is specifically designed for stimulation phase.",color:"#EDFAF8",textColor:"#4ABFB0",tag:"Movement",popular:true},
];

export default function InsightsScreen() {
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = cat === "all" ? ARTICLES : ARTICLES.filter(a => a.cat === cat);
  const popular = ARTICLES.filter(a => a.popular);

  if (selected) return (
    <div className="min-h-screen bg-bloom-bg">
      <button onClick={() => setSelected(null)} className="px-4 py-4 text-bloom-accent font-semibold text-sm">← Back</button>
      <div className="px-4 py-4 rounded-2xl mx-4 mb-4" style={{backgroundColor: selected.color}}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{color: selected.textColor}}>{selected.tag}</p>
        <h1 className="text-2xl font-bold text-bloom-text leading-tight">{selected.title}</h1>
      </div>
      <div className="px-4">
        <p className="text-bloom-muted text-base leading-relaxed mb-6 whitespace-pre-wrap">{selected.body}</p>
        <button onClick={() => setSelected(null)} className="w-full py-4 rounded-2xl text-white font-semibold" style={{backgroundColor: selected.textColor}}>Got it</button>
      </div>
    </div>
  );

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Insights</h1>
        <p className="text-bloom-muted text-sm">Personalized to Stimulation Day 7</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 mb-5 -mx-4 px-4">
        {CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 min-w-16 transition-all"
            style={{borderColor: cat === c.id ? c.color : "#E8E0DB", backgroundColor: cat === c.id ? c.color : "white"}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{backgroundColor: cat === c.id ? "rgba(255,255,255,0.25)" : c.color + "18"}}>
              <span style={{color: cat === c.id ? "white" : c.color, fontSize:"14px"}}>{c.mark}</span>
            </div>
            <span className="text-xs font-medium whitespace-nowrap" style={{color: cat === c.id ? "white" : "#7A6880"}}>{c.label}</span>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-bold text-bloom-text mb-3">Most popular</h2>
      <div className="flex gap-3 overflow-x-auto pb-3 mb-5 -mx-4 px-4">
        {popular.map(a => (
          <button key={a.id} onClick={() => setSelected(a)}
            className="flex-shrink-0 w-48 h-56 rounded-2xl overflow-hidden relative text-left"
            style={{backgroundColor: a.color}}>
            {a.type === "video" && (
              <span className="absolute top-3 left-3 bg-black/30 text-white text-xs px-2 py-1 rounded-lg font-semibold">▶ Video</span>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-6xl" style={{color: a.textColor}}>◈</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{color: a.textColor}}>{a.tag}</p>
              <p className="text-bloom-text text-sm font-bold leading-tight">{a.title}</p>
            </div>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-bold text-bloom-text mb-3">For you today</h2>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(a => (
          <button key={a.id} onClick={() => setSelected(a)}
            className="rounded-2xl p-4 text-left relative overflow-hidden min-h-40"
            style={{backgroundColor: a.color}}>
            {a.type === "video" && (
              <span className="absolute top-2 left-2 bg-black/25 text-white text-xs px-2 py-0.5 rounded font-semibold">▶</span>
            )}
            <div className="flex items-center justify-center h-14 opacity-20 mb-2">
              <span className="text-4xl" style={{color: a.textColor}}>◈</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{color: a.textColor, fontSize:"9px"}}>{a.tag}</p>
            <p className="text-bloom-text text-xs font-bold leading-tight">{a.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
'@
Write-Host "InsightsScreen done" -ForegroundColor Green

# ── MoreScreen ────────────────────────────────────────────────
Set-Content -Path "components\screens\MoreScreen.jsx" -Value @'
"use client";
import { useState } from "react";
import { auth } from "../../lib/store";

const SECTIONS = [
  {id:"report",       mark:"↓", label:"My Cycle Report",    color:"#9B6DC5", desc:"Download and share with clinic"},
  {id:"medications",  mark:"◎", label:"Medications",         color:"#9B6DC5", desc:"Injection tracker and log"},
  {id:"appointments", mark:"◔", label:"Appointments",        color:"#E07A8A", desc:"Scans, retrieval, transfer"},
  {id:"charts",       mark:"↗", label:"Charts & Trends",     color:"#E07A8A", desc:"Hormone trends, follicle progress"},
  {id:"tww",          mark:"◔", label:"Two Week Wait",       color:"#C49A3C", desc:"Countdown and daily science"},
  {id:"therapy",      mark:"◇", label:"Therapy & Coaching",  color:"#4ABFB0", desc:"Book IVF-specialist therapists"},
  {id:"videos",       mark:"▶", label:"Wellbeing Videos",    color:"#4ABFB0", desc:"Movement, breathwork, meditation"},
  {id:"community",    mark:"◎", label:"Community",           color:"#9B6DC5", desc:"Anonymous rooms by IVF phase"},
  {id:"failed",       mark:"◈", label:"After a Failed Cycle",color:"#5BADD4", desc:"Grief support and next steps"},
  {id:"partner",      mark:"◑", label:"Partner Space",       color:"#FDBA74", desc:"Invite and connect your partner"},
  {id:"pregnant",     mark:"✦", label:"Pregnancy Journey",   color:"#E07A8A", desc:"Week-by-week pregnancy guide"},
  {id:"secret",       mark:"▣", label:"Secret Space",        color:"#8B7AC5", desc:"Private journal, only you can see"},
  {id:"upgrade",      mark:"✦", label:"Upgrade to Bloom+",   color:"#9B6DC5", desc:"Unlock all features"},
];

function BackBtn({ onBack }) {
  return (
    <button onClick={onBack} className="px-4 py-4 text-bloom-accent font-semibold text-sm">← Back</button>
  );
}

function ComingSoon({ title, onBack }) {
  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <BackBtn onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-5xl mb-4">🚀</p>
        <h2 className="text-xl font-bold text-bloom-text mb-2">{title}</h2>
        <p className="text-bloom-muted text-sm">Coming soon in the next update!</p>
      </div>
    </div>
  );
}

function MedicationsScreen({ onBack }) {
  const MEDS = [
    {id:1,name:"Gonal-F",dose:"225 IU",time:"9:00 PM",type:"injection",color:"#9B6DC5",nextDose:"Tonight 9:00 PM"},
    {id:2,name:"Cetrotide",dose:"0.25 mg",time:"8:00 AM",type:"injection",color:"#E07A8A",nextDose:"Tomorrow 8AM"},
    {id:3,name:"Progynova",dose:"2 mg",time:"8AM/8PM",type:"oral",color:"#C49A3C",nextDose:"Tonight 8:00 PM"},
    {id:4,name:"Folic Acid",dose:"400 mcg",time:"8:00 AM",type:"oral",color:"#4ABFB0",nextDose:"Tomorrow 8AM"},
  ];
  const [tab, setTab] = useState("today");
  const [taken, setTaken] = useState({1:true,2:true,3:false,4:true});
  const [modal, setModal] = useState(null);
  const [site, setSite] = useState("");
  const [note, setNote] = useState("");
  const [missed, setMissed] = useState(false);
  const SITES = ["Left belly","Right belly","Left thigh","Right thigh"];

  function saveDose() {
    setTaken(prev => ({...prev, [modal.id]: !missed}));
    setModal(null);
  }

  return (
    <div className="min-h-screen bg-bloom-bg">
      <BackBtn onBack={onBack} />
      <div className="px-4 pb-2">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Medications</h1>
        <p className="text-bloom-muted text-sm mb-4">Stimulation Day 7</p>
        <div className="flex bg-bloom-surface rounded-xl p-1 mb-4">
          {["today","log","schedule"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab===t?"bg-white text-bloom-text shadow-sm":"text-bloom-muted"}`}>
              {t==="today"?"Today":t==="log"?"History":"Schedule"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        {tab === "today" && (
          <div>
            {Object.values(taken).every(v=>v) && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3 mb-3">
                <span className="text-xl text-bloom-teal">✦</span>
                <div>
                  <p className="font-bold text-bloom-teal text-sm">All medications taken!</p>
                  <p className="text-bloom-muted text-xs">Consistency is everything this cycle.</p>
                </div>
              </div>
            )}
            <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2">Injections</p>
            {MEDS.filter(m=>m.type==="injection").map(med => (
              <button key={med.id} onClick={() => setModal(med)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border mb-2 text-left"
                style={{borderColor: taken[med.id]?med.color+"40":"#E8E0DB", backgroundColor: taken[med.id]?med.color+"06":"white"}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor:med.color+"18"}}>
                  <span className="text-sm" style={{color:med.color}}>o</span>
                </div>
                <div className="flex-1">
                  <p className="text-bloom-text text-sm font-bold">{med.name} <span className="font-normal text-bloom-muted">{med.dose}</span></p>
                  <p className="text-bloom-dim text-xs">{med.time}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{color:med.color}}>Next: {med.nextDose}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{backgroundColor:taken[med.id]?"#4ABFB015":med.color+"15",color:taken[med.id]?"#4ABFB0":med.color}}>
                  {taken[med.id]?"Done":"Log"}
                </span>
              </button>
            ))}
            <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 mt-2">Oral medications</p>
            {MEDS.filter(m=>m.type==="oral").map(med => (
              <button key={med.id} onClick={() => setModal(med)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border mb-2 text-left"
                style={{borderColor: taken[med.id]?med.color+"40":"#E8E0DB", backgroundColor: taken[med.id]?med.color+"06":"white"}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor:med.color+"18"}}>
                  <span className="text-sm" style={{color:med.color}}>+</span>
                </div>
                <div className="flex-1">
                  <p className="text-bloom-text text-sm font-bold">{med.name} <span className="font-normal text-bloom-muted">{med.dose}</span></p>
                  <p className="text-bloom-dim text-xs">{med.time}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{backgroundColor:taken[med.id]?"#4ABFB015":med.color+"15",color:taken[med.id]?"#4ABFB0":med.color}}>
                  {taken[med.id]?"Done":"Log"}
                </span>
              </button>
            ))}
          </div>
        )}
        {tab !== "today" && (
          <div className="bg-white rounded-2xl p-8 border border-bloom-border text-center">
            <p className="text-bloom-muted text-sm">{tab === "log" ? "No history yet. Log your first dose above." : "Full schedule coming soon."}</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-[430px] mx-auto rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-bloom-text mb-1">Log dose</h3>
            <p className="text-bloom-muted text-sm mb-4">{modal.name} · {modal.dose}</p>
            <div className="flex gap-3 mb-4">
              <button onClick={() => setMissed(false)} className="flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all"
                style={{borderColor:!missed?"#4ABFB0":"#E8E0DB",backgroundColor:!missed?"#4ABFB015":"white",color:!missed?"#4ABFB0":"#7A6880"}}>Taken</button>
              <button onClick={() => setMissed(true)} className="flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all"
                style={{borderColor:missed?"#E07A8A":"#E8E0DB",backgroundColor:missed?"#E07A8A15":"white",color:missed?"#E07A8A":"#7A6880"}}>Missed</button>
            </div>
            {modal.type === "injection" && !missed && (
              <div className="mb-4">
                <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2">Injection site</p>
                <div className="flex flex-wrap gap-2">
                  {SITES.map(s => (
                    <button key={s} onClick={() => setSite(s)} className="px-3 py-1.5 rounded-full border text-xs transition-all"
                      style={{borderColor:site===s?"#9B6DC5":"#E8E0DB",backgroundColor:site===s?"#9B6DC515":"white",color:site===s?"#9B6DC5":"#7A6880"}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl bg-bloom-surface text-bloom-muted font-semibold text-sm">Cancel</button>
              <button onClick={saveDose} className="flex-2 flex-grow py-3 rounded-xl bg-bloom-accent text-white font-semibold text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentsScreen({ onBack }) {
  const APTS = [
    {id:1,type:"Monitoring Scan",date:"Tomorrow",time:"8:00 AM",location:"Emirates Fertility Centre",color:"#9B6DC5",days:1},
    {id:2,type:"Trigger Shot Timing",date:"In 2 days",time:"Clinic call",location:"Phone consultation",color:"#E07A8A",days:2},
    {id:3,type:"Egg Retrieval",date:"In ~4 days",time:"7:30 AM",location:"Emirates Fertility Centre",color:"#C49A3C",days:4},
    {id:4,type:"Embryo Transfer",date:"In ~9 days",time:"10:00 AM",location:"Emirates Fertility Centre",color:"#4ABFB0",days:9},
    {id:5,type:"Beta HCG Test",date:"In ~23 days",time:"8:00 AM",location:"Lab",color:"#9B6DC5",days:23},
  ];
  const [sel, setSel] = useState(null);
  return (
    <div className="min-h-screen bg-bloom-bg">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Appointments</h1>
        <p className="text-bloom-muted text-sm mb-4">Your upcoming schedule</p>
        <div className="bg-white rounded-2xl p-5 border mb-4" style={{borderColor:"#9B6DC530"}}>
          <p className="text-xs font-bold uppercase tracking-wider text-bloom-accent mb-1">Next appointment</p>
          <h2 className="text-xl font-bold text-bloom-text mb-1">Monitoring Scan</h2>
          <p className="text-bloom-muted text-sm mb-4">Tomorrow at 8:00 AM · Emirates Fertility Centre</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[["1","day"],["12","hours"],["30","min"]].map(([n,l]) => (
              <div key={l} className="bg-bloom-surface rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-bloom-accent">{n}</p>
                <p className="text-bloom-muted text-xs">{l}</p>
              </div>
            ))}
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-bloom-accent text-xs font-semibold mb-2">How to prepare</p>
            {["Drink water before scan","Wear comfortable clothing","Bring medication list","Arrive 10 minutes early"].map((tip,i) => (
              <div key={i} className="flex gap-2 mb-1.5 last:mb-0">
                <span className="text-bloom-accent text-xs">-</span>
                <span className="text-bloom-muted text-xs">{tip}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">All upcoming</p>
        {APTS.map(apt => (
          <button key={apt.id} onClick={() => setSel(sel===apt.id?null:apt.id)}
            className="w-full text-left bg-white rounded-2xl p-4 border mb-2"
            style={{borderColor:apt.color+"30"}}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor:apt.color}} />
              <div className="flex-1">
                <p className="text-bloom-text text-sm font-semibold">{apt.type}</p>
                <p className="text-bloom-muted text-xs">{apt.date} · {apt.time}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{backgroundColor:apt.color+"15",color:apt.color}}>
                {apt.days===1?"Tomorrow":"In "+apt.days+"d"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SecretScreen({ onBack }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [msgs, setMsgs] = useState([{role:"assistant",content:"This is your Secret Space.\n\nEverything here is completely private. Say what you really feel."}]);
  const [input, setInput] = useState("");
  const PROMPTS = ["I resent friends who got pregnant easily","I Googled success rates at 3am again","I am terrified this will never work"];

  if (!unlocked) return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <BackBtn onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-4xl text-bloom-accent mb-4">▣</p>
        <h2 className="text-xl font-bold text-bloom-text mb-2">Secret Space</h2>
        <p className="text-bloom-muted text-sm mb-6 leading-relaxed">A private space for the feelings you cannot say out loud.</p>
        <input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="Enter PIN"
          className="text-center text-xl tracking-widest bg-white border border-bloom-border rounded-2xl px-4 py-3 w-48 text-bloom-text outline-none mb-4" />
        <button onClick={() => {if(pin.length>=4)setUnlocked(true);}} className="bg-bloom-accent text-white font-semibold px-8 py-3 rounded-xl">Enter</button>
      </div>
    </div>
  );

  function send(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const next = [...msgs, {role:"user",content:msg}];
    setMsgs(next);
    setTimeout(() => setMsgs([...next, {role:"assistant",content:"I hear you. What you are feeling is completely valid. You are not alone in this. 💜"}]), 1000);
  }

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <BackBtn onBack={onBack} />
      <div className="mx-4 mb-3 bg-purple-50 rounded-xl p-3 flex items-center gap-2 border border-purple-200">
        <span className="text-bloom-accent">▣</span>
        <div>
          <p className="text-bloom-accent text-xs font-bold">Secret Space</p>
          <p className="text-bloom-dim text-xs">Only visible to you</p>
        </div>
      </div>
      {msgs.length <= 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 mb-3">
          {PROMPTS.map((p,i) => (
            <button key={i} onClick={() => send(p)} className="flex-shrink-0 text-xs text-bloom-muted bg-white border border-bloom-border rounded-full px-3 py-2">"{p}"</button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {msgs.map((m,i) => {
          const isUser = m.role==="user";
          return (
            <div key={i} className={`flex gap-2 mb-3 ${isUser?"flex-row-reverse":""}`}>
              {!isUser && <div className="w-7 h-7 rounded-full bg-bloom-accent flex items-center justify-center flex-shrink-0 mt-auto"><span className="text-white text-xs">▣</span></div>}
              <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser?"bg-bloom-accent text-white":"bg-white border border-bloom-border text-bloom-text"}`}>{m.content}</div>
            </div>
          );
        })}
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 bg-white border-t border-bloom-border flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Say what you really feel..."
          className="flex-1 bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none" />
        <button onClick={() => send()} disabled={!input.trim()} className="w-11 h-11 bg-bloom-accent rounded-xl text-white disabled:opacity-40">→</button>
      </div>
    </div>
  );
}

function UpgradeScreen({ onBack }) {
  const [plan, setPlan] = useState("pro");
  const [billing, setBilling] = useState("annual");
  const PLANS = [
    {id:"plus",name:"Bloom+",price:"$19.99",annual:"$129/yr · save 46%",color:"#9B6DC5",features:["Unlimited Nora AI","Full Insights library","Wellbeing Videos","Community chat","Two Week Wait mode","Cycle Report download","Partner Space"]},
    {id:"pro",name:"Bloom Pro",price:"$29.99",annual:"$199/yr · save 44%",color:"#E07A8A",popular:true,features:["Everything in Bloom+","Secret Space","Unlimited therapy booking","Priority Nora responses","Multi-cycle tracking","Custom medication schedules"]},
  ];
  return (
    <div className="min-h-screen bg-bloom-bg">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <div className="text-center mb-6">
          <p className="font-serif text-3xl font-light italic text-bloom-accent mb-1" style={{letterSpacing:"0.1em"}}>bloom ✦</p>
          <h1 className="text-2xl font-bold text-bloom-text mb-2">Upgrade Bloom</h1>
          <p className="text-bloom-muted text-sm">Get full access to everything Bloom has to offer.</p>
        </div>
        <div className="flex bg-bloom-surface rounded-xl p-1 mb-5">
          {["monthly","annual"].map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${billing===b?"bg-white text-bloom-text shadow-sm":"text-bloom-muted"}`}>
              {b==="annual"?"Annual":"Monthly"}
              {b==="annual" && <span className="bg-bloom-teal text-white text-xs px-1.5 py-0.5 rounded-md">46% off</span>}
            </button>
          ))}
        </div>
        {PLANS.map(p => (
          <button key={p.id} onClick={() => setPlan(p.id)}
            className="w-full text-left bg-white rounded-2xl p-5 border-2 mb-3 relative transition-all"
            style={{borderColor: plan===p.id?p.color:"#E8E0DB"}}>
            {p.popular && <span className="absolute -top-3 right-4 text-white text-xs px-3 py-1 rounded-full font-bold" style={{backgroundColor:p.color}}>Most popular</span>}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all"
                style={{borderColor:plan===p.id?p.color:"#E8E0DB",backgroundColor:plan===p.id?p.color:"white"}}>
                {plan===p.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className="font-bold text-base" style={{color:p.color}}>{p.name}</p>
                <p className="text-2xl font-bold text-bloom-text" style={{letterSpacing:"-1px"}}>{p.price} <span className="text-sm font-normal text-bloom-muted">/ month</span></p>
                {billing==="annual" && <p className="text-xs font-semibold mt-0.5" style={{color:p.color}}>{p.annual}</p>}
              </div>
            </div>
            <div className="border-t border-bloom-border pt-3 flex flex-col gap-2">
              {p.features.map((f,i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{color:p.color}}>✓</span>
                  <span className="text-bloom-muted text-xs">{f}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
        <button className="w-full py-4 rounded-2xl text-white font-bold text-base mb-3"
          style={{backgroundColor: plan==="pro"?"#E07A8A":"#9B6DC5"}}>
          Start {plan==="pro"?"Bloom Pro":"Bloom+"} — {billing==="annual"?(plan==="pro"?"$199/yr":"$129/yr"):(plan==="pro"?"$29.99/mo":"$19.99/mo")}
        </button>
        <p className="text-bloom-dim text-xs text-center mb-4">7-day free trial · Cancel anytime</p>
        <button onClick={onBack} className="w-full py-3 text-bloom-muted text-sm font-medium">Continue with free plan</button>
        <div className="h-8" />
      </div>
    </div>
  );
}

function ProfileScreen({ onBack, user, setUser }) {
  const [name, setName] = useState(user?.name || "");
  const [clinic, setClinic] = useState(user?.clinic || "");
  const [protocol, setProtocol] = useState(user?.protocol || "Antagonist");
  const [saved, setSaved] = useState(false);

  function save() {
    const updated = auth.updateUser({name, clinic, protocol});
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function signOut() {
    auth.signOut();
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-bloom-bg">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-5">My Profile</h1>
        <div className="bg-white rounded-2xl p-5 border border-bloom-border mb-4">
          <div className="flex flex-col items-center mb-5">
            <div className="w-16 h-16 rounded-full bg-bloom-accent flex items-center justify-center mb-2">
              <span className="text-white text-2xl font-bold">{name?name[0].toUpperCase():"S"}</span>
            </div>
            <p className="text-bloom-text font-bold">{name || "Sarah"}</p>
            <p className="text-bloom-muted text-xs">{user?.email || ""}</p>
          </div>
          <div className="mb-4">
            <label className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 block">Your name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none" />
          </div>
          <div className="mb-4">
            <label className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 block">Clinic</label>
            <input value={clinic} onChange={e=>setClinic(e.target.value)} placeholder="Emirates Fertility Centre" className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none" />
          </div>
          <div className="mb-5">
            <label className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 block">Protocol</label>
            <div className="flex gap-2 flex-wrap">
              {["Antagonist","Long Lupron","Mini IVF"].map(p => (
                <button key={p} onClick={() => setProtocol(p)}
                  className="px-3 py-2 rounded-full border-2 text-xs font-semibold transition-all"
                  style={{borderColor:protocol===p?"#9B6DC5":"#E8E0DB",backgroundColor:protocol===p?"#9B6DC515":"white",color:protocol===p?"#9B6DC5":"#7A6880"}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button onClick={save} className="w-full py-4 rounded-2xl text-white font-semibold transition-all"
            style={{backgroundColor:saved?"#4ABFB0":"#9B6DC5"}}>
            {saved?"Saved ✓":"Save Changes"}
          </button>
        </div>
        <button onClick={signOut} className="w-full py-4 rounded-2xl border border-red-200 text-red-400 font-semibold text-sm">Sign Out</button>
      </div>
    </div>
  );
}

export default function MoreScreen({ user, setUser }) {
  const [active, setActive] = useState(null);

  const onBack = () => setActive(null);

  if (active === "medications")  return <MedicationsScreen onBack={onBack} />;
  if (active === "appointments") return <AppointmentsScreen onBack={onBack} />;
  if (active === "secret")       return <SecretScreen onBack={onBack} />;
  if (active === "upgrade")      return <UpgradeScreen onBack={onBack} />;
  if (active === "profile")      return <ProfileScreen onBack={onBack} user={user} setUser={setUser} />;
  if (active === "charts" || active === "tww" || active === "therapy" || active === "videos" || active === "community" || active === "failed" || active === "partner" || active === "pregnant" || active === "report") {
    const labels = {charts:"Charts & Trends",tww:"Two Week Wait",therapy:"Therapy & Coaching",videos:"Wellbeing Videos",community:"Community",failed:"After a Failed Cycle",partner:"Partner Space",pregnant:"Pregnancy Journey",report:"My Cycle Report"};
    return <ComingSoon title={labels[active]} onBack={onBack} />;
  }

  const STATS = [
    {l:"Name",         v:user?.name||"Sarah",              c:"#9B6DC5"},
    {l:"Phase",        v:"Stimulation Day "+(user?.stimDay||7), c:"#1A1014"},
    {l:"Protocol",     v:user?.protocol||"Antagonist",     c:"#1A1014"},
    {l:"Follicles",    v:(user?.follicles||11)+" (4 mature)", c:"#4ABFB0"},
    {l:"E2 today",     v:(user?.e2||1840).toLocaleString()+" pg/mL", c:"#E07A8A"},
  ];

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">More in Bloom</h1>
        <p className="text-bloom-muted text-sm">All features</p>
      </div>

      <button onClick={() => setActive("profile")}
        className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 border border-purple-200 mb-4">
        <div className="w-12 h-12 rounded-full bg-bloom-accent flex items-center justify-center">
          <span className="text-white text-xl font-bold">{user?.name?user.name[0].toUpperCase():"S"}</span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-bloom-text font-bold text-sm">{user?.name||"Sarah"}</p>
          <p className="text-bloom-muted text-xs">{user?.email||""}</p>
        </div>
        <span className="text-bloom-muted text-sm">Edit →</span>
      </button>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {SECTIONS.map(sec => (
          <button key={sec.id} onClick={() => setActive(sec.id)}
            className="bg-white rounded-2xl p-4 border text-left transition-all"
            style={{borderColor: sec.color + "30"}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{backgroundColor: sec.color + "18"}}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{backgroundColor: sec.color}}>
                <span className="text-white text-sm font-bold">{sec.mark}</span>
              </div>
            </div>
            <p className="text-bloom-text text-sm font-bold mb-0.5">{sec.label}</p>
            <p className="text-bloom-muted text-xs leading-tight">{sec.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">At a glance</p>
        {STATS.map((x,i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-b border-bloom-border last:border-0">
            <span className="text-bloom-muted text-sm">{x.l}</span>
            <span className="text-sm font-semibold" style={{color:x.c}}>{x.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
'@
Write-Host "MoreScreen done" -ForegroundColor Green

Write-Host ""
Write-Host "All files created!" -ForegroundColor Magenta
Write-Host "Run: npm run dev" -ForegroundColor Cyan
