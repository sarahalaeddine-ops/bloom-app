"use client";
import { useState, useEffect, useCallback } from "react";
import { auth } from "../lib/store";
import SplashScreen from "../components/SplashScreen";
import AuthScreen from "../components/AuthScreen";
import OnboardingScreen from "../components/OnboardingScreen";
import AppShell from "../components/AppShell";

export default function Home() {
  var [stage, setStage] = useState("splash");
  var [user, setUser] = useState(null);
  var endSplash = useCallback(function () { setStage("main"); }, []);

  useEffect(function () {
    var saved = auth.getUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore session from localStorage after hydration
    if (saved) setUser(saved);
  }, []);

  if (stage === "splash") {
    return <SplashScreen onDone={endSplash} />;
  }

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  if (!user.onboarded) {
    return <OnboardingScreen user={user} onComplete={setUser} />;
  }

  return <AppShell user={user} setUser={setUser} />;
}
