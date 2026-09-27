"use client";
import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import CheckInScreen from "./screens/CheckInScreen";
import NoraScreen from "./screens/NoraScreen";
import InsightsScreen from "./screens/InsightsScreen";
import MoreScreen from "./screens/MoreScreen";

var TABS = [
  { id: "home",     label: "Home",     icon: "◉" },
  { id: "checkin",  label: "Check-in", icon: "✦" },
  { id: "nora",     label: "Nora AI",  icon: "☽" },
  { id: "insights", label: "Insights", icon: "✺" },
  { id: "more",     label: "More",     icon: "⋯" },
];

export default function AppShell({ user, setUser }) {
  var [tab, setTab] = useState("home");
  var [moreSection, setMoreSection] = useState(null);

  function go(nextTab, section) {
    setTab(nextTab);
    setMoreSection(section || null);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  function openMore(section) { go("more", section); }

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <main className="flex-1 pb-20">
        {tab === "home"     && <HomeScreen user={user} openMore={openMore} goTab={go} />}
        {tab === "checkin"  && <CheckInScreen user={user} />}
        {tab === "nora"     && <NoraScreen user={user} />}
        {tab === "insights" && <InsightsScreen user={user} />}
        {tab === "more"     && <MoreScreen user={user} setUser={setUser} active={moreSection} setActive={openMore} goTab={go} />}
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-bloom-border flex z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map(function (t) {
          var on = tab === t.id;
          return (
            <button key={t.id} onClick={function () { go(t.id); }} aria-current={on ? "page" : undefined}
              className={"flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors " + (on ? "text-bloom-accent" : "text-bloom-dim")}>
              <span className="text-lg leading-none">{t.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide">{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
