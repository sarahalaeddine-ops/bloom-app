"use client";
import { useState, useEffect } from "react";
import { auth } from "../lib/store";
import SplashScreen from "../components/SplashScreen";
import AuthScreen from "../components/AuthScreen";
import OnboardingScreen from "../components/OnboardingScreen";
import AppShell from "../components/AppShell";

export default function Home() {
  const [stage, setStage] = useState("splash");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = auth.getUser();
    if (saved) setUser(saved);
  }, []);

  if (stage === "splash") {
    return <SplashScreen onDone={() => setStage("main")} />;
  }

  if (!user) {
    return <AuthScreen onLogin={(u) => setUser(u)} />;
  }

  if (!user.onboarded) {
    return <OnboardingScreen user={user} onComplete={(u) => setUser(u)} />;
  }

  return <AppShell user={user} setUser={setUser} />;
}
