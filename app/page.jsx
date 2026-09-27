"use client";
import { useState, useEffect, useCallback } from "react";
import { auth, store } from "../lib/store";
import LockScreen from "../components/LockScreen";
import SplashScreen from "../components/SplashScreen";
import AuthScreen from "../components/AuthScreen";
import OnboardingScreen from "../components/OnboardingScreen";
import AppShell from "../components/AppShell";

export default function Home() {
  var [stage, setStage] = useState("splash");
  var [user, setUser] = useState(null);
  var [locked, setLocked] = useState(false);
  var endSplash = useCallback(function () { setStage("main"); }, []);

  useEffect(function () {
    var saved = auth.getUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore session from localStorage after hydration
    if (saved) setUser(saved);
    if (saved && store.get("lock_pin", null)) setLocked(true);
  }, []);

  if (stage === "splash") {
    return <SplashScreen onDone={endSplash} />;
  }

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  if (locked) {
    return <LockScreen onUnlock={function () { setLocked(false); }} onForgot={function () { store.remove("lock_pin"); auth.signOut(); setLocked(false); setUser(null); }} />;
  }

  if (!user.onboarded) {
    return <OnboardingScreen user={user} onComplete={setUser} />;
  }

  return <AppShell user={user} setUser={setUser} />;
}
