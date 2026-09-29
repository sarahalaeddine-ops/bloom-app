"use client";
import { PLANS } from "../../lib/demo-data";
import { useT } from "../../lib/i18n";
import { follicleStats, latestE2 } from "../../lib/cycle";
import { IS_APP_BUILD } from "../../lib/config";
import { isNative } from "../../lib/native";
import Medications from "./more/Medications";
import Appointments from "./more/Appointments";
import Charts from "./more/Charts";
import TwoWeekWait from "./more/TwoWeekWait";
import Coaching from "./more/Coaching";
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
import { FileText, Pill, CalendarDays, TrendingUp, Hourglass, MessageCircleHeart, CirclePlay, Users, HeartCrack, HeartHandshake, Baby, LockKeyhole, Crown, ShieldCheck, BellRing } from "lucide-react";

var SECTIONS = [
  { id: "report",       mark: FileText, label: "My Cycle Report",      color: "#9B6DC5", desc: "Download and share with clinic",    Screen: Report },
  { id: "medications",  mark: Pill, label: "Medications",          color: "#9B6DC5", desc: "Injection tracker and log",         Screen: Medications },
  { id: "appointments", mark: CalendarDays, label: "Appointments",         color: "#E07A8A", desc: "Scans, retrieval, transfer",        Screen: Appointments },
  { id: "charts",       mark: TrendingUp, label: "Charts & Trends",      color: "#E07A8A", desc: "Hormone trends, follicle progress", Screen: Charts },
  { id: "tww",          mark: Hourglass, label: "Two Week Wait",        color: "#C49A3C", desc: "Countdown and daily science",       Screen: TwoWeekWait },
  { id: "coaching",     mark: MessageCircleHeart, label: "Coaching & support",   color: "#4ABFB0", desc: "Talk to a certified coach",         Screen: Coaching },
  { id: "videos",       mark: CirclePlay, label: "Wellbeing Videos",     color: "#4ABFB0", desc: "Movement, breathwork, meditation",  Screen: Videos },
  { id: "community",    mark: Users, label: "Community",            color: "#9B6DC5", desc: "Anonymous rooms by IVF phase",      Screen: Community },
  { id: "failed",       mark: HeartCrack, label: "After a Failed Cycle", color: "#5BADD4", desc: "Grief support and next steps",      Screen: FailedCycle },
  { id: "partner",      mark: HeartHandshake, label: "Partner Space",        color: "#FDBA74", desc: "Invite and connect your partner",   Screen: Partner },
  { id: "pregnant",     mark: Baby, label: "Pregnancy Journey",    color: "#E07A8A", desc: "Week-by-week pregnancy guide",      Screen: Pregnancy },
  { id: "secret",       mark: LockKeyhole, label: "Secret Space",         color: "#8B7AC5", desc: "Private journal, only you can see", Screen: Secret },
  { id: "reminders",    mark: BellRing, label: "Reminders",           color: "#C49A3C", desc: "Dose and appointment alerts",       Screen: Reminders },
  { id: "privacy",      mark: ShieldCheck, label: "Privacy Centre",   color: "#4ABFB0", desc: "App lock, anonymous mode, your data", Screen: Privacy },
  // Hidden in the native app for v1 (App Store 3.1.1: paid features need in-app purchase).
  { id: "upgrade",      webOnly: true, mark: Crown, label: "Upgrade to Bloom+",    color: "#9B6DC5", desc: "Unlock all features",               Screen: Upgrade },
  { id: "profile",      hidden: true,                                                                                           Screen: Profile },
];

export default function MoreScreen({ user, setUser, active, setActive }) {
  var { t } = useT();
  var inApp = IS_APP_BUILD || isNative();
  var section = SECTIONS.find(function (s) { return s.id === active && !(inApp && s.webOnly); });

  if (section) {
    var Screen = section.Screen;
    return <Screen user={user} setUser={setUser} onBack={function () { setActive(null); }} openSection={setActive} />;
  }

  var stats = follicleStats();
  var e2Last = latestE2(); // her own logged value; the persona's only for the demo
  var plan = user.plan ? PLANS.find(function (p) { return p.id === user.plan; }) : null;
  var STATS = [
    { l: t("more.name"),      v: user.anonymous ? t("more.hidden") : user.name || "—", c: "#9B6DC5" },
    { l: t("more.phase"),     v: (user.phase || "stimulation") === "stimulation" ? t("more.stimDay", { n: user.stimDay || 1 }) : t("phase." + user.phase), c: "#1A1014" },
    { l: t("more.protocol"),  v: user.protocol || "—", c: "#1A1014" },
    { l: t("more.follicles"), v: stats.none ? t("scan.none") : t("more.follicleVal", { t: stats.total, m: stats.mature }), c: "#4ABFB0" },
    { l: t("more.e2"),        v: e2Last ? e2Last.value.toLocaleString() + " pg/mL" : t("scan.none"), c: "#E07A8A" },
  ];

  return (
    <div className="px-4 pb-6">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">{t("more.title")}</h1>
        <p className="text-bloom-muted text-sm">{t("more.sub")}{plan ? " · " + plan.name : ""}</p>
      </div>

      <button onClick={function () { setActive("profile"); }}
        className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 border border-purple-200 mb-4">
        <div className="w-12 h-12 rounded-full bg-bloom-accent flex items-center justify-center">
          <span className="text-white text-xl font-bold">{(user.name || "✦")[0].toUpperCase()}</span>
        </div>
        <div className="flex-1 text-start">
          <p className="text-bloom-text font-bold text-sm"><bdi>{user.name || ""}</bdi></p>
          <p className="text-bloom-muted text-xs">{user.email || ""}</p>
        </div>
        <span className="text-bloom-accent text-sm font-semibold">{t("more.edit")}</span>
      </button>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {SECTIONS.filter(function (s) { return !s.hidden && !(inApp && s.webOnly); }).map(function (sec) {
          var label = sec.id === "upgrade" && plan ? t("more.plan", { p: plan.name }) : t("sec." + sec.id);
          var Mark = sec.mark;
          return (
            <button key={sec.id} onClick={function () { setActive(sec.id); }}
              className="bg-white rounded-2xl p-4 border text-start transition-all active:scale-[0.98]"
              style={{ borderColor: sec.color + "30" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: sec.color + "18" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: sec.color }}>
                  <Mark size={16} color="white" strokeWidth={2.2} />
                </div>
              </div>
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
