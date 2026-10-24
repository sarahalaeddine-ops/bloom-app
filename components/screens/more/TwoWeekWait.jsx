"use client";
import ScreenHero from "../../ui/ScreenHero";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { store } from "../../../lib/store";
import { TWW_DAYS } from "../../../lib/demo-data";
import { useT } from "../../../lib/i18n";

var TOTAL = 13;

export default function TwoWeekWait({ onBack }) {
  var { t } = useT();
  var [day, setDay] = useState(function () { return store.get("twwDay", 5); });
  var info = TWW_DAYS.find(function (d) { return d.day === day; }) || TWW_DAYS[0];
  var left = TOTAL - day;

  function pick(d) {
    setDay(d);
    store.set("twwDay", d);
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <ScreenHero art="hourglass" title={t("sec.tww")} sub={t("tww.sub")} tint="gold" />

        <div className="rounded-2xl p-6 mb-3 text-center border" style={{ backgroundColor: "#FEF9EE", borderColor: "#C49A3C40" }}>
          <p className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "#C49A3C" }}>{t("tww.dpt")}</p>
          <p className="font-bold" style={{ fontSize: "64px", color: "#C49A3C", lineHeight: 1, letterSpacing: "-3px" }}>{day}</p>
          <p className="text-bloom-muted text-sm mt-2">{left > 1 ? t("tww.left", { n: left }) : left === 1 ? t("tww.left1") : t("tww.betaToday")}</p>
          <div className="h-1.5 bg-white rounded-full overflow-hidden mt-4">
            <div className="h-full rounded-full transition-all" style={{ width: (day / TOTAL) * 100 + "%", backgroundColor: "#C49A3C" }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-bloom-border mb-3">
          <Label className="mb-2">{t("tww.science")}</Label>
          <p className="text-bloom-text text-lg font-bold mb-1">{t("tww.d" + info.day + ".t")}</p>
          <p className="text-bloom-muted text-sm leading-relaxed">{t("tww.d" + info.day + ".b")}</p>
        </div>

        <Label className="mb-2">{t("tww.choose")}</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {TWW_DAYS.map(function (d) {
            var on = d.day === day;
            return (
              <button key={d.day} onClick={function () { pick(d.day); }} aria-pressed={on}
                className="w-10 h-10 rounded-full text-sm font-semibold transition-all"
                style={{ backgroundColor: on ? "#C49A3C" : "#F0EBE8", color: on ? "white" : "#7A6880" }}>
                {d.day}
              </button>
            );
          })}
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <p className="text-bloom-accent text-sm font-bold mb-2">{t("tww.rules")}</p>
          {["tww.rule1", "tww.rule2", "tww.rule3", "tww.rule4"].map(function (k) {
            return <p key={k} className="text-bloom-muted text-xs mb-1.5 last:mb-0">✦ {t(k)}</p>;
          })}
        </div>
        <p className="text-bloom-dim text-xs text-center mt-3">{t("tww.clinic")}</p>
      </div>
    </div>
  );
}
