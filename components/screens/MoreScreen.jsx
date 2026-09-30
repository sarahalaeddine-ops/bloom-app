"use client";
import { PLANS } from "../../lib/demo-data";
import { useT } from "../../lib/i18n";
import { Illustration } from "../ui/Graphics";
import ScreenHero from "../ui/ScreenHero";
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

var SECTIONS = [
  { id: "report",       art: "report",    color: "#9B6DC5", Screen: Report },
  { id: "medications",  art: "pill",      color: "#9B6DC5", Screen: Medications },
  { id: "appointments", art: "scan",      color: "#E07A8A", Screen: Appointments },
  { id: "charts",       art: "chart",     color: "#E07A8A", Screen: Charts },
  { id: "tww",          art: "hourglass", color: "#C49A3C", Screen: TwoWeekWait },
  { id: "coaching",     art: "therapy",   color: "#4ABFB0", Screen: Coaching },
  { id: "videos",       art: "leaf",      color: "#4ABFB0", Screen: Videos },
  { id: "community",    art: "community", color: "#9B6DC5", Screen: Community },
  { id: "failed",       art: "rainbow",   color: "#5BADD4", Screen: FailedCycle },
  { id: "partner",      art: "couple",    color: "#FDBA74", Screen: Partner },
  { id: "pregnant",     art: "baby",      color: "#E07A8A", Screen: Pregnancy },
  { id: "secret",       art: "journal",   color: "#8B7AC5", Screen: Secret },
  { id: "reminders",    art: "bell",      color: "#C49A3C", Screen: Reminders },
  { id: "privacy",      art: "shield",    color: "#4ABFB0", Screen: Privacy },
  // Hidden in the native app for v1 (App Store 3.1.1: paid features need in-app purchase).
  { id: "upgrade",      webOnly: true, art: "crown", color: "#9B6DC5", Screen: Upgrade },
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
      <div className="pt-5">
        <ScreenHero art="menu" title={t("more.title")} sub={t("more.sub") + (plan ? " · " + plan.name : "")} />
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
