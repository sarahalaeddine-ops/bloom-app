"use client";
import { PLANS } from "../../lib/demo-data";
import { useT } from "../../lib/i18n";
import { Illustration } from "../ui/Graphics";
import ScreenHero from "../ui/ScreenHero";
import { follicleStats } from "../../lib/cycle";
import Medications from "./more/Medications";
import Appointments from "./more/Appointments";
import Charts from "./more/Charts";
import TwoWeekWait from "./more/TwoWeekWait";
import Therapy from "./more/Therapy";
import Videos from "./more/Videos";
import Community from "./more/Community";
import FailedCycle from "./more/FailedCycle";
import Partner from "./more/Partner";
import Pregnancy from "./more/Pregnancy";
import Report from "./more/Report";
import Secret from "./more/Secret";
import Upgrade from "./more/Upgrade";
import Profile from "./more/Profile";
import Privacy from "./more/Privacy";
import Reminders from "./more/Reminders";

var SECTIONS = [
  { id: "report", art: "report",       label: "My Cycle Report",      color: "#9B6DC5", desc: "Download and share with clinic",    Screen: Report },
  { id: "medications", art: "pill",  label: "Medications",          color: "#9B6DC5", desc: "Injection tracker and log",         Screen: Medications },
  { id: "appointments", art: "scan", label: "Appointments",         color: "#E07A8A", desc: "Scans, retrieval, transfer",        Screen: Appointments },
  { id: "charts", art: "chart",       label: "Charts & Trends",      color: "#E07A8A", desc: "Hormone trends, follicle progress", Screen: Charts },
  { id: "tww", art: "hourglass",          label: "Two Week Wait",        color: "#C49A3C", desc: "Countdown and daily science",       Screen: TwoWeekWait },
  { id: "therapy", art: "therapy",      label: "Therapy & Coaching",   color: "#4ABFB0", desc: "Book IVF-specialist therapists",    Screen: Therapy },
  { id: "videos", art: "leaf",       label: "Wellbeing Videos",     color: "#4ABFB0", desc: "Movement, breathwork, meditation",  Screen: Videos },
  { id: "community", art: "community",    label: "Community",            color: "#9B6DC5", desc: "Anonymous rooms by IVF phase",      Screen: Community },
  { id: "failed", art: "rainbow",       label: "After a Failed Cycle", color: "#5BADD4", desc: "Grief support and next steps",      Screen: FailedCycle },
  { id: "partner", art: "couple",      label: "Partner Space",        color: "#FDBA74", desc: "Invite and connect your partner",   Screen: Partner },
  { id: "pregnant", art: "baby",     label: "Pregnancy Journey",    color: "#E07A8A", desc: "Week-by-week pregnancy guide",      Screen: Pregnancy },
  { id: "secret", art: "journal",       label: "Secret Space",         color: "#8B7AC5", desc: "Private journal, only you can see", Screen: Secret },
  { id: "reminders", art: "bell",    label: "Reminders",           color: "#C49A3C", desc: "Dose and appointment alerts",       Screen: Reminders },
  { id: "privacy", art: "shield",      label: "Privacy Centre",   color: "#4ABFB0", desc: "App lock, anonymous mode, your data", Screen: Privacy },
  { id: "upgrade", art: "crown",      label: "Upgrade to Bloom+",    color: "#9B6DC5", desc: "Unlock all features",               Screen: Upgrade },
  { id: "profile",      hidden: true,                                                                                           Screen: Profile },
];

export default function MoreScreen({ user, setUser, active, setActive }) {
  var { t } = useT();
  var section = SECTIONS.find(function (s) { return s.id === active; });

  if (section) {
    var Screen = section.Screen;
    return <Screen user={user} setUser={setUser} onBack={function () { setActive(null); }} openSection={setActive} />;
  }

  var stats = follicleStats();
  var plan = user.plan ? PLANS.find(function (p) { return p.id === user.plan; }) : null;
  var STATS = [
    { l: t("more.name"),      v: user.anonymous ? t("more.hidden") : user.name || "Sarah", c: "#9B6DC5" },
    { l: t("more.phase"),     v: (user.phase || "stimulation") === "stimulation" ? t("more.stimDay", { n: user.stimDay || 7 }) : t("phase." + user.phase), c: "#1A1014" },
    { l: t("more.protocol"),  v: user.protocol || "Antagonist", c: "#1A1014" },
    { l: t("more.follicles"), v: t("more.follicleVal", { t: stats.total, m: stats.mature }), c: "#4ABFB0" },
    { l: t("more.e2"),        v: (user.e2 || 1840).toLocaleString() + " pg/mL", c: "#E07A8A" },
  ];

  return (
    <div className="px-4 pb-6">
      <div className="pt-5">
        <ScreenHero art="menu" title={t("more.title")} sub={t("more.sub") + (plan ? " · " + plan.name : "")} />
      </div>

      <button onClick={function () { setActive("profile"); }}
        className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 border border-purple-200 mb-4">
        <div className="w-12 h-12 rounded-full bg-bloom-accent flex items-center justify-center">
          <span className="text-white text-xl font-bold">{(user.name || "S")[0].toUpperCase()}</span>
        </div>
        <div className="flex-1 text-start">
          <p className="text-bloom-text font-bold text-sm">{user.name || "Sarah"}</p>
          <p className="text-bloom-muted text-xs">{user.email || ""}</p>
        </div>
        <span className="text-bloom-accent text-sm font-semibold">{t("more.edit")}</span>
      </button>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {SECTIONS.filter(function (s) { return !s.hidden; }).map(function (sec) {
          var label = sec.id === "upgrade" && plan ? t("more.plan", { p: plan.name }) : t("sec." + sec.id);
          return (
            <button key={sec.id} onClick={function () { setActive(sec.id); }}
              className="bg-white rounded-2xl p-4 border text-start transition-all active:scale-[0.98]"
              style={{ borderColor: sec.color + "30" }}>
              <div className="mb-2 -ms-1"><Illustration name={sec.art} size={60} /></div>
              <p className="text-bloom-text text-sm font-bold mb-0.5">{label}</p>
              <p className="text-bloom-muted text-xs leading-tight">{t("sec." + sec.id + ".d")}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-bloom-border">
        <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">{t("more.glance")}</p>
        {STATS.map(function (x) {
          return (
            <div key={x.l} className="flex justify-between items-center py-2.5 border-b border-bloom-border last:border-0">
              <span className="text-bloom-muted text-sm">{x.l}</span>
              <span className="text-sm font-semibold" style={{ color: x.c }}>{x.v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
