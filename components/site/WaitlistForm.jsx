"use client";
import { useState, useEffect } from "react";

// Email sign-up that posts to /api/waitlist. Used in the hero and the closing call to action.
export default function WaitlistForm({ id, showCount }) {
  var [email, setEmail] = useState("");
  var [error, setError] = useState("");
  var [joined, setJoined] = useState(false);
  var [submitting, setSubmitting] = useState(false);
  var [count, setCount] = useState(null);

  useEffect(function () {
    if (!showCount) return;
    // Real number of sign-ups; the line stays hidden if it can't be loaded.
    fetch("/api/waitlist")
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { if (data && typeof data.count === "number") setCount(data.count); })
      .catch(function () {});
  }, [showCount]);

  async function join(e) {
    e.preventDefault();
    if (submitting) return;
    var v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError("Please enter a valid email"); return; }
    setSubmitting(true);
    setError("");
    try {
      var res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v }),
      });
      var data = await res.json().catch(function () { return {}; });
      if (!res.ok) { setError(data.error || "Something went wrong. Please try again."); return; }
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
      return;
    } finally {
      setSubmitting(false);
    }
    setJoined(true);
  }

  return (
    <div className="w-full max-w-md">
      {joined ? (
        <p className="font-serif italic text-bloom-accent text-2xl animate-fade-in" role="status">You are on the list. ✦</p>
      ) : (
        <form onSubmit={join} className="flex flex-col sm:flex-row gap-2">
          <label htmlFor={id} className="sr-only">Email</label>
          <input id={id} type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="your@email.com"
            className="flex-1 bg-white border border-bloom-border rounded-xl px-4 py-3.5 text-bloom-text text-sm outline-none focus:border-bloom-accent" />
          <button type="submit" disabled={submitting}
            className="bg-bloom-accent hover:bg-bloom-deep text-white font-semibold px-6 py-3.5 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60">
            {submitting ? "Joining…" : "Join the waitlist"}
          </button>
        </form>
      )}
      {error && <p className="text-red-500 text-xs mt-2" role="alert">{error}</p>}
      {showCount && count > 0 && (
        <p className="text-bloom-muted text-sm mt-4">
          <span className="font-serif text-bloom-accent" style={{ fontSize: "22px" }}>{count.toLocaleString()}</span> {count === 1 ? "woman" : "women"} already waiting
        </p>
      )}
    </div>
  );
}
