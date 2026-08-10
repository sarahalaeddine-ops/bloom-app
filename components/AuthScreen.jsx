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
