"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { auth, store, consent } from "../lib/store";
import { useT } from "../lib/i18n";
import LockScreen from "./LockScreen";
import { supabase } from "../lib/supabase";
import { LangProvider } from "../lib/i18n";
import SplashScreen from "./SplashScreen";
import AuthScreen from "./AuthScreen";
import OnboardingScreen from "./OnboardingScreen";
import ConsentScreen from "./ConsentScreen";
import AppShell from "./AppShell";
import AutoDemo from "./AutoDemo";
import { initShell, onAppState, setPrivacyScreen } from "../lib/native";
import { isRealApp } from "../lib/config";

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
  // Investor demo (components/AutoDemo.jsx): Bloom plays Sarah's story by itself, from sign-up on,
  // so it sits above every screen. Opened from the sign-in screen, More, or a ?tour link (web only).
  var [film, setFilm] = useState(false);
  var navRef = useRef({});
  var { setLang } = useT();
  var filmApp = {
    setUser: setUser,
    setLang: setLang,
    go: function (tab, section) { if (navRef.current.go) navRef.current.go(tab, section); },
    setQuick: function (v) { if (navRef.current.setQuick) navRef.current.setQuick(v); },
  };
  var openFilm = isRealApp() ? null : function () { setFilm(true); };
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
    // The real app never opens as the demo persona (the demo at /demo-7q4x shares this browser storage).
    if (saved && saved.id === "demo" && isRealApp()) saved = null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore session from localStorage after hydration
    if (saved) setUser(saved);
    if (!isRealApp() && new URLSearchParams(window.location.search).has("tour")) {
      // Saved rather than set: LangProvider reads it from storage when it starts, after this effect.
      store.set("lang", "en");
      setFilm(true);
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
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

  var screen;
  if (!user) {
    screen = <AuthScreen onLogin={setUser} onTour={openFilm} />;
  } else if (locked && !film) {
    screen = <LockScreen onUnlock={function () { setLocked(false); }} onForgot={async function () { store.remove("lock_pin"); store.remove("lock_bio"); setPrivacyScreen(false); await auth.signOut(); setLocked(false); setUser(null); }} />;
  } else if (!user.onboarded) {
    screen = <OnboardingScreen user={user} onComplete={setUser} />;
  } else if (!consent.answered(user)) {
    // Existing accounts, or a new consent version: ask before anything else (G11).
    screen = <ConsentScreen user={user} onDone={function () { setConsentTick(function (n) { return n + 1; }); }} />;
  } else {
    screen = <AppShell user={user} setUser={setUser} navRef={navRef} onStartFilm={openFilm} />;
  }

  return (
    <>
      {screen}
      {film && <AutoDemo app={filmApp} onExit={function () { setFilm(false); setLocked(false); }} />}
    </>
  );
}
