"use client";
import { useState, useEffect } from "react";
import { startScheduler, registerSW, getSettings } from "../lib/reminders";
import HomeScreen from "./screens/HomeScreen";
import CheckInScreen from "./screens/CheckInScreen";
import NoraScreen from "./screens/NoraScreen";
import InsightsScreen from "./screens/InsightsScreen";
import MoreScreen from "./screens/MoreScreen";
import { House, HeartPulse, Sparkles, BookOpen, Ellipsis, Plus } from "lucide-react";
import QuickLog from "./QuickLog";
import { Toast } from "./ui/Common";
import { PetalBurst } from "./ui/Graphics";
import { useT } from "../lib/i18n";

var TABS = [
  { id: "home",     label: "tab.home",     icon: House },
  { id: "checkin",  label: "tab.checkin", icon: HeartPulse },
  { id: "nora",     label: "tab.nora",  icon: Sparkles },
  { id: "insights", label: "tab.insights", icon: BookOpen },
  { id: "more",     label: "tab.more",     icon: Ellipsis },
];

export default function AppShell({ user, setUser }) {
  var { t } = useT();
  var [tab, setTab] = useState("home");
  var [moreSection, setMoreSection] = useState(null);
  var [quick, setQuick] = useState(false);
  var [toast, setToast] = useState("");
  var [burst, setBurst] = useState(0);
  var [version, setVersion] = useState(0);

  useEffect(function () {
    if (getSettings().enabled) registerSW();
    return startScheduler(function (text) {
      setToast(text);
      setTimeout(function () { setToast(""); }, 6000);
    });
  }, []);

  function celebrate(msg) {
    setToast(msg);
    setBurst(Date.now());
    setVersion(function (v) { return v + 1; });
    setTimeout(function () { setToast(""); }, 2600);
    setTimeout(function () { setBurst(0); }, 1100);
  }

  function go(nextTab, section) {
    setTab(nextTab);
    setMoreSection(section || null);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  function openMore(section) { go("more", section); }

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <main className="flex-1 pb-20">
        {tab === "home"     && <HomeScreen key={version} user={user} openMore={openMore} goTab={go} />}
        {tab === "checkin"  && <CheckInScreen key={version} user={user} />}
        {tab === "nora"     && <NoraScreen user={user} />}
        {tab === "insights" && <InsightsScreen user={user} />}
        {tab === "more"     && <MoreScreen user={user} setUser={setUser} active={moreSection} setActive={openMore} goTab={go} />}
      </main>
      {tab !== "nora" && !moreSection && (
        <div className="fixed bottom-[76px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 flex justify-end pointer-events-none z-40">
          <button onClick={function () { setQuick(true); }} aria-label={t("ql.aria")}
            className="fab-in pointer-events-auto w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg,#9B6DC5,#E07A8A)", boxShadow: "0 8px 24px rgba(155,109,197,0.45)" }}>
            <Plus size={28} strokeWidth={2.4} />
          </button>
        </div>
      )}
      {quick && <QuickLog user={user} onClose={function () { setQuick(false); }} onSaved={celebrate} />}
      <Toast text={toast} />
      <PetalBurst key={burst} show={!!burst} />
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-bloom-border flex z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map(function (tb) {
          var on = tab === tb.id;
          var Icon = tb.icon;
          return (
            <button key={tb.id} onClick={function () { go(tb.id); }} aria-current={on ? "page" : undefined}
              className={"flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors " + (on ? "text-bloom-accent" : "text-bloom-dim")}>
              <span className={"flex items-center justify-center w-10 h-7 rounded-full transition-colors " + (on ? "bg-purple-50" : "")}><Icon size={20} strokeWidth={on ? 2.2 : 1.8} /></span>
              <span className="text-[10px] font-semibold tracking-wide">{t(tb.label)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
