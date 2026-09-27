"use client";
import { useState } from "react";
import { auth } from "../lib/store";

export default function AuthScreen({ onLogin }) {
  var [mode, setMode] = useState("signup");
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [error, setError] = useState("");

  function handleAuth(e) {
    if (e) e.preventDefault();
    setError("");
    if (mode === "signup" && !name.trim()) { setError("Please enter your name"); return; }
    if (!email.trim() || !password) { setError("Please enter email and password"); return; }
    if (email.indexOf("@") === -1) { setError("Please enter a valid email"); return; }
    var result = mode === "signup" ? auth.signUp(name, email, password) : auth.signIn(email, password);
    if (result.error) { setError(result.error); return; }
    onLogin(result.data);
  }

  var inputCls = "w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none focus:border-bloom-accent transition-colors";

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="logo" style={{ fontSize: "52px", lineHeight: "1", marginBottom: "4px" }}>bloom</p>
          <p style={{ color: "#9B6DC5", fontSize: "28px", marginBottom: "8px" }}>✦</p>
          <p className="text-bloom-muted text-sm font-light">Your IVF companion</p>
        </div>

        <form onSubmit={handleAuth} className="bg-white rounded-3xl p-6 border border-bloom-border shadow-sm">
          <div className="flex bg-bloom-surface rounded-xl p-1 mb-6" role="tablist">
            {["signup", "login"].map(function (m) {
              return (
                <button type="button" key={m} role="tab" aria-selected={mode === m} onClick={function () { setMode(m); setError(""); }}
                  className={"flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all " + (mode === m ? "bg-bloom-accent text-white" : "text-bloom-muted")}>
                  {m === "signup" ? "Sign Up" : "Sign In"}
                </button>
              );
            })}
          </div>

          {mode === "signup" && (
            <div className="mb-4">
              <label htmlFor="name" className="text-xs font-semibold text-bloom-muted uppercase tracking-wide mb-2 block">Your name</label>
              <input id="name" value={name} onChange={function (e) { setName(e.target.value); }} placeholder="Sarah" autoComplete="given-name" className={inputCls} />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="text-xs font-semibold text-bloom-muted uppercase tracking-wide mb-2 block">Email</label>
            <input id="email" type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="your@email.com" autoComplete="email" className={inputCls} />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="text-xs font-semibold text-bloom-muted uppercase tracking-wide mb-2 block">Password</label>
            <input id="password" type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} placeholder="At least 6 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"} className={inputCls} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4" role="alert">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          <button type="submit" className="w-full bg-bloom-accent hover:bg-bloom-deep text-white font-semibold py-4 rounded-xl mt-2 transition-colors">
            {mode === "signup" ? "Create Account" : "Sign In"}
          </button>

          <button type="button" onClick={function () { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="w-full text-bloom-dim text-xs text-center mt-4">
            {mode === "login" ? "New to Bloom? Switch to Sign Up" : "Already have an account? Switch to Sign In"}
          </button>
        </form>

        <button onClick={function () { onLogin(auth.demo()); }}
          className="w-full mt-4 py-3.5 rounded-2xl border-2 border-dashed border-bloom-accent/40 text-bloom-accent text-sm font-semibold bg-white/60">
          ✦ Try the demo as Sarah
        </button>

        <p className="text-bloom-dim text-xs text-center mt-6">Your data is private and never sold.</p>
      </div>
    </div>
  );
}
