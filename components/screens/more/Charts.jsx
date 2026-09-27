"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import LineChart from "../../ui/LineChart";
import { HORMONES, MOODS } from "../../../lib/demo-data";
import { getCheckins, dateForStimDay, fmtDate } from "../../../lib/cycle";

export default function Charts({ onBack, user }) {
  var stimDay = user.stimDay || 7;
  var [checkins] = useState(getCheckins);
  var dayLabels = HORMONES.map(function (h) { return "D" + h.day; });
  var recent = checkins.slice(0, 7).reverse();
  var ciLabels = recent.map(function (c) { return new Date(c.date).toLocaleDateString("en-GB", { weekday: "short" }); });
  var weights = recent.filter(function (c) { return c.weight; });
  var last = HORMONES[HORMONES.length - 1];
  var prev = HORMONES[HORMONES.length - 2];

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Charts & Trends</h1>
        <p className="text-bloom-muted text-sm mb-4">Stimulation Day {stimDay} · tap a point for values</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white rounded-2xl p-4 border border-bloom-border">
            <Label>E2 today</Label>
            <p className="text-2xl font-bold text-bloom-text mt-1">{last.e2.toLocaleString()}<span className="text-xs text-bloom-muted font-normal"> pg/mL</span></p>
            <p className="text-bloom-teal text-xs font-semibold">▲ {Math.round((last.e2 / prev.e2) * 10) / 10}× since Day {prev.day}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-bloom-border">
            <Label>Lead follicle</Label>
            <p className="text-2xl font-bold text-bloom-text mt-1">{last.leadFollicle}<span className="text-xs text-bloom-muted font-normal"> mm</span></p>
            <p className="text-bloom-teal text-xs font-semibold">▲ +{last.leadFollicle - prev.leadFollicle} mm since Day {prev.day}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <p className="text-bloom-text text-sm font-bold mb-0.5">Estradiol (E2)</p>
          <p className="text-bloom-muted text-xs mb-3">pg/mL, by stim day</p>
          <LineChart series={[{ name: "E2", color: "#E07A8A", values: HORMONES.map(function (h) { return h.e2; }) }]} labels={dayLabels} unit=" pg/mL" yMin={0} />
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <p className="text-bloom-text text-sm font-bold mb-0.5">Lead follicle size</p>
          <p className="text-bloom-muted text-xs mb-3">mm, by stim day · trigger usually around 17–20 mm</p>
          <LineChart series={[{ name: "Lead follicle", color: "#9B6DC5", values: HORMONES.map(function (h) { return h.leadFollicle; }) }]} labels={dayLabels} unit=" mm" yMin={0} yMax={20} />
        </div>

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

        <div className="bg-white rounded-2xl p-4 border border-bloom-border">
          <Label className="mb-3">All values</Label>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-bloom-muted text-left">
                <th className="font-semibold pb-2">Day</th><th className="font-semibold pb-2">Date</th><th className="font-semibold pb-2 text-right">E2</th><th className="font-semibold pb-2 text-right">Lead</th><th className="font-semibold pb-2 text-right">Count</th>
              </tr>
            </thead>
            <tbody>
              {HORMONES.map(function (h) {
                return (
                  <tr key={h.day} className="border-t border-bloom-border text-bloom-text">
                    <td className="py-2">{h.day}</td><td>{fmtDate(dateForStimDay(stimDay, h.day))}</td><td className="text-right">{h.e2}</td><td className="text-right">{h.leadFollicle} mm</td><td className="text-right">{h.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recent.length > 0 && (
            <p className="text-bloom-dim text-xs mt-3">Mood this week: {recent.map(function (c) { return (MOODS[c.mood] || MOODS[2]).mark; }).join(" ")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
