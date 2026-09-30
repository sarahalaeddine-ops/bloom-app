"use client";
import { useState, useEffect, useCallback } from "react";
import { auth, store, consent } from "../lib/store";
import LockScreen from "./LockScreen";
import { supabase } from "../lib/supabase";
import { LangProvider } from "../lib/i18n";
import SplashScreen from "./SplashScreen";
import AuthScreen from "./AuthScreen";
import OnboardingScreen from "./OnboardingScreen";
import ConsentScreen from "./ConsentScreen";
import AppShell from "./AppShell";
import { initShell, onAppState, setPrivacyScreen } from "../lib/native";

// Native app: lock again when she comes back after this long in the background (PIN set).
var RELOCK_MS = 60 * 1000;

export default function BloomApp() {
  return <LangProvider><App /></LangProvider>;
}

function App() {
  var [stage, setStage] = useState("splash");
  var [user, setUser] = useState(null);
  var [locked, setLocked] = useState(false);
  var [, setConsentTick] = useState(0);
  var endSplash = useCallback(function () { setStage("main"); }, []);

  // Native shell (status bar, splash) and, with the app lock on, the privacy screen and re-locking
  // after time in the background. No-ops on the web.
  useEffect(function () {
    initShell();
    if (store.get("lock_pin", null)) setPrivacyScreen(true);
    var hiddenAt = 0;
    return onAppState(function (active) {
      if (!active) { hiddenAt = Date.now(); return; }
      if (hiddenAt && Date.now() - hiddenAt > RELOCK_MS && auth.getUser() && store.get("lock_pin", null)) setLocked(true);
      hiddenAt = 0;
    });
  }, []);

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
    return <LockScreen onUnlock={function () { setLocked(false); }} onForgot={async function () { store.remove("lock_pin"); store.remove("lock_bio"); setPrivacyScreen(false); await auth.signOut(); setLocked(false); setUser(null); }} />;
  }

  if (!user.onboarded) {
    return <OnboardingScreen user={user} onComplete={setUser} />;
  }

  // Existing accounts, or a new consent version: ask before anything else (G11).
  if (!consent.answered(user)) {
    return <ConsentScreen user={user} onDone={function () { setConsentTick(function (n) { return n + 1; }); }} />;
  }

  return <AppShell user={user} setUser={setUser} />;
}
