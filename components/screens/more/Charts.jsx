"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import LineChart from "../../ui/LineChart";
import { MOODS } from "../../../lib/demo-data";
import { getCheckins, dateForStimDay, hormoneSeries } from "../../../lib/cycle";
import ScanLog, { ScanEmpty } from "../../ScanLog";
import { useT } from "../../../lib/i18n";

export default function Charts({ onBack, user }) {
  var { t, locale } = useT();
  var stimDay = user.stimDay || 1;
  var isStim = (user.phase || "stimulation") === "stimulation" && !!user.stimDay;
  var [checkins] = useState(getCheckins);
  var [, setScanTick] = useState(0);
  var [scanOpen, setScanOpen] = useState(false);
  // Her own scan results (the demo persona's seeded series only for the demo, lib/cycle.js).
  var rows = hormoneSeries();
  var e2Rows = rows.filter(function (h) { return h.e2 != null; });
  var leadRows = rows.filter(function (h) { return h.leadFollicle != null; });
  var recent = checkins.slice(0, 7).reverse();
  var ciLabels = recent.map(function (c) { return new Date(c.date).toLocaleDateString(locale, { weekday: "short" }); });
  var weights = recent.filter(function (c) { return c.weight; });
  var lastE2 = e2Rows[e2Rows.length - 1];
  var prevE2 = e2Rows[e2Rows.length - 2];
  var lastLead = leadRows[leadRows.length - 1];
  var prevLead = leadRows[leadRows.length - 2];
  var demo = user.id === "demo";

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">{t("sec.charts")}</h1>
        <p className="text-bloom-muted text-sm mb-4">{isStim ? t("ch.subDay", { n: stimDay }) : t("ch.sub")}</p>

        {!demo && rows.length > 0 && (
          <button onClick={function () { setScanOpen(true); }} className="w-full mb-3 py-3 rounded-xl bg-white border border-bloom-accent/40 text-bloom-accent text-sm font-semibold">+ {t("scan.cta")}</button>
        )}

        {rows.length === 0 && <ScanEmpty onLog={function () { setScanOpen(true); }} />}

        {(lastE2 || lastLead) && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white rounded-2xl p-4 border border-bloom-border">
            <Label>E2</Label>
            <p className="text-2xl font-bold text-bloom-text mt-1"><bdi dir="ltr">{lastE2 ? lastE2.e2.toLocaleString(locale) : "—"}<span className="text-xs text-bloom-muted font-normal"> pg/mL</span></bdi></p>
            {lastE2 && prevE2 && prevE2.e2 > 0 && <p className="text-bloom-teal text-xs font-semibold">{t("ch.e2Change", { x: Math.round((lastE2.e2 / prevE2.e2) * 10) / 10, n: prevE2.day })}</p>}
          </div>
          <div className="bg-white rounded-2xl p-4 border border-bloom-border">
            <Label>{t("ch.lead")}</Label>
            <p className="text-2xl font-bold text-bloom-text mt-1"><bdi dir="ltr">{lastLead ? lastLead.leadFollicle : "—"}<span className="text-xs text-bloom-muted font-normal"> mm</span></bdi></p>
            {lastLead && prevLead && <p className="text-bloom-teal text-xs font-semibold">{t("ch.leadChange", { d: (lastLead.leadFollicle - prevLead.leadFollicle >= 0 ? "+" : "") + Math.round((lastLead.leadFollicle - prevLead.leadFollicle) * 10) / 10, n: prevLead.day })}</p>}
          </div>
        </div>
        )}

        {rows.length > 0 && rows.length < 2 && <p className="text-bloom-dim text-xs text-center mb-3">{t("scan.oneMore")}</p>}

        {e2Rows.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <p className="text-bloom-text text-sm font-bold mb-0.5">{t("ch.e2Title")}</p>
          <p className="text-bloom-muted text-xs mb-3">{t("ch.e2Sub")}</p>
          <LineChart series={[{ name: "E2", color: "#E07A8A", values: e2Rows.map(function (h) { return h.e2; }) }]} labels={e2Rows.map(function (h) { return t("ch.dayShort", { n: h.day }); })} unit=" pg/mL" yMin={0} />
        </div>
        )}

        {leadRows.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <p className="text-bloom-text text-sm font-bold mb-0.5">{t("ch.leadTitle")}</p>
          <p className="text-bloom-muted text-xs mb-3">{t("ch.leadSub")}</p>
          <LineChart series={[{ name: t("ch.lead"), color: "#9B6DC5", values: leadRows.map(function (h) { return h.leadFollicle; }) }]} labels={leadRows.map(function (h) { return t("ch.dayShort", { n: h.day }); })} unit=" mm" yMin={0} yMax={Math.max(20, lastLead.leadFollicle)} />
        </div>
        )}

        {recent.length > 1 && (
          <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
            <p className="text-bloom-text text-sm font-bold mb-0.5">{t("ch.feelTitle")}</p>
            <p className="text-bloom-muted text-xs mb-3">{t("ch.feelSub")}</p>
            <LineChart series={[
              { name: t("ch.anxiety"), color: "#E07A8A", values: recent.map(function (c) { return c.anxiety; }) },
              { name: t("ch.hope"), color: "#9B6DC5", values: recent.map(function (c) { return c.hope; }) },
            ]} labels={ciLabels} yMin={1} yMax={5} height={130} />
          </div>
        )}

        {weights.length > 1 && (
          <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
            <p className="text-bloom-text text-sm font-bold mb-0.5">{t("ch.weightTitle")}</p>
            <p className="text-bloom-muted text-xs mb-3">{t("ch.weightSub")}</p>
            <LineChart series={[{ name: t("ch.weight"), color: "#C49A3C", values: weights.map(function (c) { return c.weight; }) }]}
              labels={weights.map(function (c) { return new Date(c.date).toLocaleDateString(locale, { weekday: "short" }); })} unit=" kg" fmt={function (v) { return String(v); }} height={120} />
          </div>
        )}

        {rows.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-bloom-border">
          <Label className="mb-3">{t("ch.all")}</Label>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-bloom-muted text-start">
                <th className="font-semibold pb-2 text-start">{t("ch.colDay")}</th><th className="font-semibold pb-2 text-start">{t("ch.colDate")}</th><th className="font-semibold pb-2 text-end">E2</th><th className="font-semibold pb-2 text-end">{t("ch.colLead")}</th><th className="font-semibold pb-2 text-end">{t("ch.colCount")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(function (h, i) {
                return (
                  <tr key={i} className="border-t border-bloom-border text-bloom-text">
                    <td className="py-2">{h.day}</td><td>{dateForStimDay(stimDay, h.day).toLocaleDateString(locale, { day: "numeric", month: "short" })}</td><td className="text-end">{h.e2 != null ? h.e2 : "—"}</td><td className="text-end"><bdi dir="ltr">{h.leadFollicle != null ? h.leadFollicle + " mm" : "—"}</bdi></td><td className="text-end">{h.count != null ? h.count : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recent.length > 0 && (
            <p className="text-bloom-dim text-xs mt-3">{t("ch.moodWeek")} {recent.map(function (c) { return (MOODS[c.mood] || MOODS[2]).mark; }).join(" ")}</p>
          )}
        </div>
        )}
      </div>
      {scanOpen && <ScanLog user={user} onClose={function () { setScanOpen(false); }} onSaved={function () { setScanOpen(false); setScanTick(function (n) { return n + 1; }); }} />}
    </div>
  );
}
