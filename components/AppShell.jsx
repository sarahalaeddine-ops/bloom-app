"use client";
import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import CheckInScreen from "./screens/CheckInScreen";
import NoraScreen from "./screens/NoraScreen";
import InsightsScreen from "./screens/InsightsScreen";
import MoreScreen from "./screens/MoreScreen";

const TABS = [
  { id: "home",    label: "Home",     icon: "◉" },
  { id: "checkin", label: "Check-in", icon: "✦" },
  { id: "nora",    label: "Nora AI",  icon: "☽" },
  { id: "insights",label: "Insights", icon: "✺" },
  { id: "more",    label: "More",     icon: "⋯" },
];

export default function AppShell({ user, setUser }) {
  const [tab, setTab] = useState("home");

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        {tab === "home"     && <HomeScreen user={user} />}
        {tab === "checkin"  && <CheckInScreen />}
        {tab === "nora"     && <NoraScreen user={user} />}
        {tab === "insights" && <InsightsScreen />}
        {tab === "more"     && <MoreScreen user={user} setUser={setUser} />}
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-bloom-border flex z-50">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${tab === t.id ? "text-bloom-accent" : "text-bloom-dim"}`}>
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-[10px] font-semibold tracking-wide">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
