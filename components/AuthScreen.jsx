"use client";
import { useState } from "react";
import { auth } from "../lib/store";
import { isConfigured } from "../lib/supabase";
export default function AuthScreen({ onLogin, recovery = false }) {
  const [mode, setMode] = useState(recovery ? "reset" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (["signup", "reset"].includes(mode) && password !== confirm)
        throw new Error("Passwords do not match.");
      if (mode === "recover") {
        await auth.recover(email);
        setMessage(
          "If an account exists for this email, you will receive a reset link. Check your spam folder too.",
        );
      } else if (mode === "reset") {
        await auth.resetPassword(password);
        await auth.signOut();
        window.history.replaceState({}, "", "/");
        setMode("login");
        setPassword("");
        setConfirm("");
        setMessage("Password updated. Sign in with your new password.");
      } else {
        const user =
          mode === "signup"
            ? await auth.signUp(name, email, password)
            : await auth.signIn(email, password);
        setPassword("");
        setConfirm("");
        if (user) onLogin(user);
        else
          setMessage("Check your email to confirm your account, then sign in.");
      }
    } catch (e) {
      setError(e.message || "Unable to continue. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-8">
      <div className="text-center mb-8">
        <p className="text-5xl italic font-serif text-bloom-accent">bloom ✦</p>
        <p className="text-bloom-muted mt-3">Your IVF companion</p>
      </div>
      <form onSubmit={submit} className="card space-y-4">
        <h1 className="text-xl font-semibold">
          {
            {
              login: "Welcome back",
              signup: "Create your account",
              recover: "Account recovery",
              reset: "Choose a new password",
            }[mode]
          }
        </h1>
        {!isConfigured && (
          <p role="status" className="text-bloom-muted">
            Account setup is not complete yet. Sign-in and saving will be
            available once Bloom is connected.
          </p>
        )}
        {mode === "signup" && (
          <label className="block">
            Your name
            <input
              className="field mt-1"
              required
              maxLength={100}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        )}
        {mode !== "reset" && (
          <label className="block">
            Email
            <input
              className="field mt-1"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        )}
        {mode !== "recover" && (
          <label className="block">
            Password
            <input
              className="field mt-1"
              required
              type="password"
              minLength={mode === "login" ? 1 : 12}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}
        {["signup", "reset"].includes(mode) && (
          <>
            <p className="text-xs text-bloom-muted">
              Use at least 12 characters.
            </p>
            <label className="block">
              Confirm password
              <input
                className="field mt-1"
                required
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
          </>
        )}
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-bloom-muted">
            {message}
          </p>
        )}
        <button className="btn w-full" disabled={busy || !isConfigured}>
          {busy
            ? "Please wait…"
            : {
                login: "Sign in",
                signup: "Create account",
                recover: "Send reset link",
                reset: "Update password",
              }[mode]}
        </button>
        <div className="flex flex-wrap gap-4 text-sm text-bloom-accent">
          {["login", "signup", "recover"]
            .filter((m) => m !== mode)
            .map((m) => (
              <button
                disabled={busy}
                type="button"
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                  setMessage("");
                  setPassword("");
                  setConfirm("");
                }}
              >
                {
                  {
                    login: "Sign in",
                    signup: "Sign up",
                    recover: "Forgot password?",
                  }[m]
                }
              </button>
            ))}
        </div>
      </form>
      <p className="text-xs text-bloom-muted text-center">
        Bloom records your clinic’s instructions. It does not prescribe
        treatment or monitor emergencies.
      </p>
    </main>
  );
}
