"use client";
import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import CheckInScreen from "./screens/CheckInScreen";
import NoraScreen from "./screens/NoraScreen";
import InsightsScreen from "./screens/InsightsScreen";
import MoreScreen from "./screens/MoreScreen";
import OnboardingScreen from "./OnboardingScreen";
import { useBloom } from "./BloomData";
import { auth } from "../lib/store";
const TABS = [
  { id: "home", label: "Home", icon: "◉" },
  { id: "checkin", label: "Check-in", icon: "✦" },
  { id: "nora", label: "Nora", icon: "☽" },
  { id: "insights", label: "Insights", icon: "✺" },
  { id: "more", label: "More", icon: "⋯" },
];
export default function AppShell({ user, setUser }) {
  const { cycle, cycles, setCycleId } = useBloom();
  const [tab, setTab] = useState("home");
  const [active, setActive] = useState(null);
  const [exitError, setExitError] = useState("");
  const [exiting, setExiting] = useState(false);
  if (!cycle)
    return (
      <>
        <OnboardingScreen />
        <div className="px-5 pb-6">
          {exitError && <p role="alert">{exitError}</p>}
          <button
            disabled={exiting}
            className="text-bloom-accent"
            onClick={async () => {
              setExiting(true);
              try {
                await auth.signOut();
                setUser(null);
              } catch (e) {
                setExitError(e.message);
                setExiting(false);
              }
            }}
          >
            Sign out
          </button>
        </div>
      </>
    );
  function navigate(section) {
    setActive(section);
    setTab("more");
  }
  return (
    <div className="min-h-screen bg-bloom-bg">
      <div className="px-4 pt-4">
        <label className="text-xs text-bloom-muted">
          Selected cycle
          <select
            className="field mt-1"
            value={cycle.id}
            onChange={(e) => {
              setCycleId(e.target.value);
              setActive(null);
            }}
          >
            {cycles.map((c) => (
              <option value={c.id} key={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <main className="pb-24" key={cycle.id}>
        {tab === "home" && <HomeScreen user={user} navigate={navigate} />}
        {tab === "checkin" && <CheckInScreen />}
        {tab === "nora" && <NoraScreen />}
        {tab === "insights" && <InsightsScreen />}
        {tab === "more" && (
          <MoreScreen
            user={user}
            setUser={setUser}
            active={active}
            setActive={setActive}
          />
        )}
      </main>
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-bloom-border flex z-50"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            aria-current={tab === t.id ? "page" : undefined}
            onClick={() => {
              setTab(t.id);
              setActive(null);
            }}
            className={`flex-1 flex flex-col items-center py-3 gap-1 ${tab === t.id ? "text-bloom-accent" : "text-bloom-muted"}`}
          >
            <span aria-hidden="true">{t.icon}</span>
            <span className="text-xs">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
