"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import LineChart from "../../ui/LineChart";
import { MOODS } from "../../../lib/demo-data";
import { getCheckins, dateForStimDay, fmtDate, hormoneSeries } from "../../../lib/cycle";
import ScanLog, { ScanEmpty } from "../../ScanLog";
import { useT } from "../../../lib/i18n";

export default function Charts({ onBack, user }) {
  var { t } = useT();
  var stimDay = user.stimDay || 7;
  var [checkins] = useState(getCheckins);
  var [, setScanTick] = useState(0);
  var [scanOpen, setScanOpen] = useState(false);
  // Her own scan results (the demo persona's seeded series only for the demo, lib/cycle.js).
  var rows = hormoneSeries();
  var e2Rows = rows.filter(function (h) { return h.e2 != null; });
  var leadRows = rows.filter(function (h) { return h.leadFollicle != null; });
  var recent = checkins.slice(0, 7).reverse();
  var ciLabels = recent.map(function (c) { return new Date(c.date).toLocaleDateString("en-GB", { weekday: "short" }); });
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
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Charts & Trends</h1>
        <p className="text-bloom-muted text-sm mb-4">Stimulation Day {stimDay} · tap a point for values</p>

        {!demo && rows.length > 0 && (
          <button onClick={function () { setScanOpen(true); }} className="w-full mb-3 py-3 rounded-xl bg-white border border-bloom-accent/40 text-bloom-accent text-sm font-semibold">+ {t("scan.cta")}</button>
        )}

        {rows.length === 0 && <ScanEmpty onLog={function () { setScanOpen(true); }} />}

        {(lastE2 || lastLead) && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white rounded-2xl p-4 border border-bloom-border">
            <Label>E2</Label>
            <p className="text-2xl font-bold text-bloom-text mt-1">{lastE2 ? lastE2.e2.toLocaleString() : "—"}<span className="text-xs text-bloom-muted font-normal"> pg/mL</span></p>
            {lastE2 && prevE2 && prevE2.e2 > 0 && <p className="text-bloom-teal text-xs font-semibold">{Math.round((lastE2.e2 / prevE2.e2) * 10) / 10}× since Day {prevE2.day}</p>}
          </div>
          <div className="bg-white rounded-2xl p-4 border border-bloom-border">
            <Label>Lead follicle</Label>
            <p className="text-2xl font-bold text-bloom-text mt-1">{lastLead ? lastLead.leadFollicle : "—"}<span className="text-xs text-bloom-muted font-normal"> mm</span></p>
            {lastLead && prevLead && <p className="text-bloom-teal text-xs font-semibold">{lastLead.leadFollicle - prevLead.leadFollicle >= 0 ? "+" : ""}{Math.round((lastLead.leadFollicle - prevLead.leadFollicle) * 10) / 10} mm since Day {prevLead.day}</p>}
          </div>
        </div>
        )}

        {rows.length > 0 && rows.length < 2 && <p className="text-bloom-dim text-xs text-center mb-3">{t("scan.oneMore")}</p>}

        {e2Rows.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <p className="text-bloom-text text-sm font-bold mb-0.5">Estradiol (E2)</p>
          <p className="text-bloom-muted text-xs mb-3">pg/mL, by stim day</p>
          <LineChart series={[{ name: "E2", color: "#E07A8A", values: e2Rows.map(function (h) { return h.e2; }) }]} labels={e2Rows.map(function (h) { return "D" + h.day; })} unit=" pg/mL" yMin={0} />
        </div>
        )}

        {leadRows.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <p className="text-bloom-text text-sm font-bold mb-0.5">Lead follicle size</p>
          <p className="text-bloom-muted text-xs mb-3">mm, by stim day · trigger usually around 17–20 mm</p>
          <LineChart series={[{ name: "Lead follicle", color: "#9B6DC5", values: leadRows.map(function (h) { return h.leadFollicle; }) }]} labels={leadRows.map(function (h) { return "D" + h.day; })} unit=" mm" yMin={0} yMax={Math.max(20, lastLead.leadFollicle)} />
        </div>
        )}

        {recent.length > 1 && (
          <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
            <p className="text-bloom-text text-sm font-bold mb-0.5">How you have been feeling</p>
            <p className="text-bloom-muted text-xs mb-3">From your daily check-ins (1–5)</p>
            <LineChart series={[
              { name: "Anxiety", color: "#E07A8A", values: recent.map(function (c) { return c.anxiety; }) },
              { name: "Hope", color: "#9B6DC5", values: recent.map(function (c) { return c.hope; }) },
            ]} labels={ciLabels} yMin={1} yMax={5} height={130} />
          </div>
        )}

        {weights.length > 1 && (
          <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
            <p className="text-bloom-text text-sm font-bold mb-0.5">Weight (OHSS watch)</p>
            <p className="text-bloom-muted text-xs mb-3">kg · call your clinic if +2 kg in 24 hrs</p>
            <LineChart series={[{ name: "Weight", color: "#C49A3C", values: weights.map(function (c) { return c.weight; }) }]}
              labels={weights.map(function (c) { return new Date(c.date).toLocaleDateString("en-GB", { weekday: "short" }); })} unit=" kg" fmt={function (v) { return String(v); }} height={120} />
          </div>
        )}

        {rows.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-bloom-border">
          <Label className="mb-3">All values</Label>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-bloom-muted text-start">
                <th className="font-semibold pb-2">Day</th><th className="font-semibold pb-2">Date</th><th className="font-semibold pb-2 text-right">E2</th><th className="font-semibold pb-2 text-right">Lead</th><th className="font-semibold pb-2 text-right">Count</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(function (h, i) {
                return (
                  <tr key={i} className="border-t border-bloom-border text-bloom-text">
                    <td className="py-2">{h.day}</td><td>{fmtDate(dateForStimDay(stimDay, h.day))}</td><td className="text-right">{h.e2 != null ? h.e2 : "—"}</td><td className="text-right">{h.leadFollicle != null ? h.leadFollicle + " mm" : "—"}</td><td className="text-right">{h.count != null ? h.count : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recent.length > 0 && (
            <p className="text-bloom-dim text-xs mt-3">Mood this week: {recent.map(function (c) { return (MOODS[c.mood] || MOODS[2]).mark; }).join(" ")}</p>
          )}
        </div>
        )}
      </div>
      {scanOpen && <ScanLog user={user} onClose={function () { setScanOpen(false); }} onSaved={function () { setScanOpen(false); setScanTick(function (n) { return n + 1; }); }} />}
    </div>
  );
}
