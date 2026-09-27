"use client";
import { useState } from "react";
import { BackBtn, Label, Logo } from "../../ui/Common";
import { HORMONES, FOLLICLES, MATURE_MM, MEDS, MOODS, DEMO_USER } from "../../../lib/demo-data";
import { getCheckins, dateForStimDay, cycleStartDate, fmtDate, follicleStats, medAdherence } from "../../../lib/cycle";
import { JourneyRing, journeyDay, Ovary, Donut, MoodFace } from "../../ui/Graphics";
import LineChart from "../../ui/LineChart";

var DISCLAIMER = "This report is generated from information entered in Bloom. It is not a medical record and does not replace your clinic's own records or advice.";

function buildText(user, checkins) {
  var stimDay = user.stimDay || 7;
  var s = follicleStats();
  var lines = [
    "BLOOM CYCLE REPORT",
    "Patient: " + user.name,
    "Clinic: " + user.clinic,
    "Doctor: " + (user.doctor || DEMO_USER.doctor),
    "Protocol: " + user.protocol,
    "Cycle start: " + fmtDate(cycleStartDate(stimDay)),
    "Stim day: " + stimDay,
    "",
    "HORMONES (Day / Date / E2 pg/mL / LH IU/L / P4 ng/mL)",
  ];
  HORMONES.forEach(function (h) { lines.push("Day " + h.day + " / " + fmtDate(dateForStimDay(stimDay, h.day)) + " / " + h.e2 + " / " + h.lh + " / " + h.p4); });
  lines.push("", "FOLLICLES (" + s.total + " total, " + s.mature + " mature ≥" + MATURE_MM + "mm)");
  lines.push("Right: " + FOLLICLES.right.join(", ") + " mm");
  lines.push("Left: " + FOLLICLES.left.join(", ") + " mm");
  lines.push("", "MEDICATIONS");
  MEDS.forEach(function (m) { lines.push(m.name + " " + m.dose + " · " + m.freq + " · " + m.type + " · from Day " + m.startDay); });
  lines.push("", "CHECK-INS (Date / Mood / Anxiety / Hope / Symptoms)");
  checkins.forEach(function (c) {
    lines.push(fmtDate(c.date) + " / " + (MOODS[c.mood] || MOODS[2]).l + " / " + c.anxiety + "/5 / " + c.hope + "/5 / " + (c.symptoms.join(", ") || "none"));
  });
  lines.push("", DISCLAIMER);
  return lines.join("\n");
}

export default function Report({ onBack, user }) {
  var stimDay = user.stimDay || 7;
  var [checkins] = useState(getCheckins);
  var [status, setStatus] = useState("");
  var s = follicleStats();
  var text = buildText(user, checkins);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Bloom Cycle Report — " + user.name, text: text });
        setStatus("Shared ✓");
      } else {
        await navigator.clipboard.writeText(text);
        setStatus("Sharing isn't available here, so we copied it instead ✓");
      }
    } catch (e) {
      if (e && e.name !== "AbortError") setStatus("Could not share. Try Copy as text.");
    }
    setTimeout(function () { setStatus(""); }, 3000);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied ✓");
    } catch {
      setStatus("Copy failed. Your browser blocked clipboard access.");
    }
    setTimeout(function () { setStatus(""); }, 3000);
  }

  var info = [
    ["Name", user.name], ["Clinic", user.clinic], ["Doctor", user.doctor || DEMO_USER.doctor],
    ["Protocol", user.protocol], ["Cycle start", fmtDate(cycleStartDate(stimDay))], ["Stim day", "Day " + stimDay],
  ];

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <div className="no-print"><BackBtn onBack={onBack} /></div>
      <div className="px-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl font-bold text-bloom-text mb-1">My Cycle Report</h1>
            <p className="text-bloom-muted text-sm">Generated {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <Logo size={18} />
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-2">Patient</Label>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {info.map(function (r) {
              return <div key={r[0]}><p className="text-bloom-dim text-[10px] uppercase">{r[0]}</p><p className="text-bloom-text text-sm font-semibold">{r[1]}</p></div>;
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-3">Cycle at a glance</Label>
          <div className="flex items-center gap-4 mb-4">
            <JourneyRing day={journeyDay(user.phase, stimDay)} size={130}>
              <p className="font-serif italic text-bloom-text leading-none" style={{ fontSize: "26px" }}>Day {stimDay}</p>
              <p className="text-bloom-muted text-[10px]">of stims</p>
            </JourneyRing>
            <div className="flex-1 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <Donut value={medAdherence()} size={56} label="Doses taken" />
                <div><p className="text-bloom-text text-sm font-semibold">Doses taken</p><p className="text-bloom-dim text-xs">logged in Bloom</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Donut value={s.total ? s.mature / s.total : 0} size={56} color="#9B6DC5" label="Mature follicles" />
                <div><p className="text-bloom-text text-sm font-semibold">{s.mature} of {s.total} mature</p><p className="text-bloom-dim text-xs">≥{MATURE_MM} mm</p></div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <Ovary label="Right" sizes={FOLLICLES.right} color="#9B6DC5" matureMm={MATURE_MM} />
            <Ovary label="Left" sizes={FOLLICLES.left} color="#4ABFB0" matureMm={MATURE_MM} flip />
          </div>
          <p className="text-bloom-muted text-xs font-semibold mb-1">E2 (pg/mL) by stim day</p>
          <LineChart series={[{ name: "E2", color: "#E07A8A", values: HORMONES.map(function (h) { return h.e2; }) }]} labels={HORMONES.map(function (h) { return "D" + h.day; })} unit=" pg/mL" height={130} />
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3 overflow-x-auto">
          <Label className="mb-2">Hormones</Label>
          <table className="w-full text-xs">
            <thead><tr className="text-bloom-muted text-left"><th className="pb-2 font-semibold">Day</th><th className="pb-2 font-semibold">Date</th><th className="pb-2 font-semibold text-right">E2</th><th className="pb-2 font-semibold text-right">LH</th><th className="pb-2 font-semibold text-right">P4</th></tr></thead>
            <tbody>
              {HORMONES.map(function (h) {
                return (
                  <tr key={h.day} className="border-t border-bloom-border text-bloom-text">
                    <td className="py-2">{h.day}</td><td>{fmtDate(dateForStimDay(stimDay, h.day))}</td><td className="text-right">{h.e2}</td><td className="text-right">{h.lh}</td><td className="text-right">{h.p4}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-bloom-dim text-[10px] mt-2">E2 pg/mL · LH IU/L · P4 ng/mL</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-2">Follicles · {s.total} total, {s.mature} mature</Label>
          {[["Right ovary", FOLLICLES.right, "#9B6DC5"], ["Left ovary", FOLLICLES.left, "#4ABFB0"]].map(function (row) {
            return (
              <div key={row[0]} className="mb-2 last:mb-0">
                <p className="text-xs font-semibold mb-1.5" style={{ color: row[2] }}>{row[0]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {row[1].map(function (mm, i) {
                    var m = mm >= MATURE_MM;
                    return <span key={i} className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ backgroundColor: m ? row[2] : row[2] + "15", color: m ? "white" : row[2] }}>{mm}mm{m ? " ✓" : ""}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-2">Medications</Label>
          {MEDS.map(function (m) {
            return (
              <div key={m.id} className="flex justify-between py-2 border-t border-bloom-border first:border-0 text-xs">
                <span className="text-bloom-text font-semibold">{m.name} {m.dose}</span>
                <span className="text-bloom-muted text-right">{m.freq} · {m.type} · Day {m.startDay}+</span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-2">Daily check-ins</Label>
          {checkins.map(function (c, i) {
            var m = MOODS[c.mood] || MOODS[2];
            return (
              <div key={i} className="py-2 border-t border-bloom-border first:border-0 text-xs">
                <div className="flex justify-between">
                  <span className="text-bloom-text font-semibold flex items-center gap-1.5">{fmtDate(c.date)} · <MoodFace mood={c.mood} color={m.c} size={18} /> {m.l}</span>
                  <span className="text-bloom-muted">Anx {c.anxiety}/5 · Hope {c.hope}/5</span>
                </div>
                {c.symptoms.length > 0 && <p className="text-bloom-dim mt-0.5">{c.symptoms.join(", ")}</p>}
              </div>
            );
          })}
        </div>

        <p className="text-bloom-dim text-xs leading-relaxed mb-4">{DISCLAIMER}</p>

        <div className="no-print">
        {status && <p className="text-bloom-teal text-sm text-center font-semibold mb-3" role="status">{status}</p>}
        <button onClick={share} className="w-full py-4 rounded-2xl bg-bloom-accent text-white font-semibold mb-2">Share with my clinic →</button>
        <div className="flex gap-2">
          <button onClick={function () { window.print(); }} className="flex-1 py-3.5 rounded-2xl bg-white border border-bloom-border text-bloom-text font-semibold text-sm">Save as PDF</button>
          <button onClick={copy} className="flex-1 py-3.5 rounded-2xl bg-white border border-bloom-border text-bloom-text font-semibold text-sm">Copy as text</button>
        </div>
        </div>
      </div>
    </div>
  );
}
