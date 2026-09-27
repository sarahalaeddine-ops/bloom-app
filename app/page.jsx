"use client";
import { useState, useEffect, useCallback } from "react";
import { auth, store } from "../lib/store";
import LockScreen from "../components/LockScreen";
import { supabase } from "../lib/supabase";
import { LangProvider } from "../lib/i18n";
import SplashScreen from "../components/SplashScreen";
import AuthScreen from "../components/AuthScreen";
import OnboardingScreen from "../components/OnboardingScreen";
import AppShell from "../components/AppShell";

export default function Home() {
  return <LangProvider><App /></LangProvider>;
}

function App() {
  var [stage, setStage] = useState("splash");
  var [user, setUser] = useState(null);
  var [locked, setLocked] = useState(false);
  var endSplash = useCallback(function () { setStage("main"); }, []);

  useEffect(function () {
    var saved = auth.getUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore session from localStorage after hydration
    if (saved) setUser(saved);
    if (saved && store.get("lock_pin", null)) setLocked(true);
    // A synced account whose session has expired must sign in again before it can sync.
    if (saved && saved.cloud && supabase) {
      supabase.auth.getSession().then(function (r) {
        if (!r.data.session) { auth.expire(); setUser(null); }
      });
    }
  }, []);

  if (stage === "splash") {
    return <SplashScreen onDone={endSplash} />;
  }

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  if (locked) {
    return <LockScreen onUnlock={function () { setLocked(false); }} onForgot={async function () { store.remove("lock_pin"); await auth.signOut(); setLocked(false); setUser(null); }} />;
  }

  if (!user.onboarded) {
    return <OnboardingScreen user={user} onComplete={setUser} />;
  }

  return <AppShell user={user} setUser={setUser} />;
}
