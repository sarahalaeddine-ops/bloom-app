"use client";
import { useState, useEffect } from "react";
import { auth } from "../lib/store";
import { getClient, isConfigured } from "../lib/supabase";
import AuthScreen from "../components/AuthScreen";
import AppShell from "../components/AppShell";
import BloomData from "../components/BloomData";
export default function Home() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!isConfigured);
  const [recovery, setRecovery] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    // Discard the insecure prototype record even when the backend is unconfigured.
    try {
      localStorage.removeItem("bloom_user");
    } catch {
      /* Storage may be disabled. */
    }
    if (!isConfigured) return;
    const recoveryLink = new URLSearchParams(window.location.search).has(
      "recovery",
    );
    const {
      data: { subscription },
    } = getClient().auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") {
        setUser(null);
        setRecovery(false);
      }
    });
    auth
      .getUser()
      .then((u) => {
        if (!cancelled) {
          setUser(u);
          setRecovery(recoveryLink);
        }
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "Unable to restore your session. Please reload to try again.",
          );
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
  if (!ready)
    return (
      <p className="p-6" role="status">
        Opening Bloom…
      </p>
    );
  if (error)
    return (
      <div className="p-6">
        <p role="alert">{error}</p>
        <button className="btn mt-4" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  if (recovery || !user)
    return (
      <AuthScreen
        key={recovery ? "recovery" : "auth"}
        recovery={recovery}
        onLogin={(u) => {
          setRecovery(false);
          setUser(u);
        }}
      />
    );
  return (
    <BloomData key={user.id} user={user}>
      <AppShell user={user} setUser={setUser} />
    </BloomData>
  );
}
