"use client";
import { useState } from "react";
import { BackBtn, Label, Sheet } from "../../ui/Common";
import { MEDS, INJECTION_TIPS } from "../../../lib/demo-data";
import { getTodayMedLog, logDose, getMedHistory, dateForStimDay, fmtDate } from "../../../lib/cycle";
import { syncNative } from "../../../lib/reminders";

var SITES = ["Left belly", "Right belly", "Left thigh", "Right thigh"];

function MedCard({ med, entry, onClick }) {
  var taken = entry && entry.status === "taken";
  var missed = entry && entry.status === "missed";
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-2xl border mb-2 text-start bg-white"
      style={{ borderColor: taken ? med.color + "40" : "#E8E0DB", backgroundColor: taken ? med.color + "06" : "white" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: med.color + "18" }}>
        <span className="text-sm" style={{ color: med.color }}>{med.type === "injection" ? "◎" : "●"}</span>
      </div>
      <div className="flex-1">
        <p className="text-bloom-text text-sm font-bold">{med.name} <span className="font-normal text-bloom-muted">{med.dose}</span></p>
        <p className="text-bloom-dim text-xs">{med.time}{entry && entry.site ? " · " + entry.site : ""}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: med.color }}>Next: {med.nextDose}</p>
      </div>
      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl"
        style={{ backgroundColor: taken ? "#4ABFB015" : missed ? "#E07A8A15" : med.color + "15", color: taken ? "#4ABFB0" : missed ? "#E07A8A" : med.color }}>
        {taken ? "Done ✓" : missed ? "Missed" : "Log"}
      </span>
    </button>
  );
}

export default function Medications({ onBack, user }) {
  var stimDay = user.stimDay || 7;
  var [tab, setTab] = useState("today");
  var [log, setLog] = useState(getTodayMedLog);
  var [history, setHistory] = useState(getMedHistory);
  var [modal, setModal] = useState(null);
  var [site, setSite] = useState("");
  var [note, setNote] = useState("");
  var [missed, setMissed] = useState(false);

  var allDone = MEDS.every(function (m) { return log[m.id] && log[m.id].status === "taken"; });

  function open(med) {
    var e = log[med.id];
    setModal(med);
    setMissed(e ? e.status === "missed" : false);
    setSite(e && e.site ? e.site : "");
    setNote(e && e.note ? e.note : "");
  }

  function saveDose() {
    var entry = { status: missed ? "missed" : "taken", site: modal.type === "injection" && !missed ? site : "", note: note.trim() };
    setLog(logDose(modal.id, entry));
    syncNative(); // native app: drop today's reminder for a dose she has taken
    setHistory(getMedHistory());
    setModal(null);
  }

  var byDay = {};
  history.forEach(function (h) {
    var k = new Date(h.at).toDateString();
    (byDay[k] = byDay[k] || []).push(h);
  });

  return (
    <div className="min-h-screen bg-bloom-bg">
      <BackBtn onBack={onBack} />
      <div className="px-4 pb-2">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Medications</h1>
        <p className="text-bloom-muted text-sm mb-4">Stimulation Day {stimDay}</p>
        <div className="flex bg-bloom-surface rounded-xl p-1 mb-4" role="tablist">
          {[["today", "Today"], ["history", "History"], ["schedule", "Schedule"]].map(function (t) {
            return (
              <button key={t[0]} role="tab" aria-selected={tab === t[0]} onClick={function () { setTab(t[0]); }}
                className={"flex-1 py-2 rounded-lg text-xs font-semibold transition-all " + (tab === t[0] ? "bg-white text-bloom-text shadow-sm" : "text-bloom-muted")}>
                {t[1]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-6">
        {tab === "today" && (
          <div>
            {allDone && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3 mb-3">
                <span className="text-xl text-bloom-teal">✦</span>
                <div>
                  <p className="font-bold text-bloom-teal text-sm">All medications taken!</p>
                  <p className="text-bloom-muted text-xs">Consistency is everything this cycle.</p>
                </div>
              </div>
            )}
            <Label className="mb-2">Injections</Label>
            {MEDS.filter(function (m) { return m.type === "injection"; }).map(function (m) {
              return <MedCard key={m.id} med={m} entry={log[m.id]} onClick={function () { open(m); }} />;
            })}
            <Label className="mb-2 mt-3">Oral medications</Label>
            {MEDS.filter(function (m) { return m.type === "oral"; }).map(function (m) {
              return <MedCard key={m.id} med={m} entry={log[m.id]} onClick={function () { open(m); }} />;
            })}
            <div className="bg-white rounded-2xl p-4 border-2 mt-3" style={{ borderColor: "#C49A3C60" }}>
              <p className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "#C49A3C" }}>Injection tips</p>
              {INJECTION_TIPS.map(function (t, i) {
                return <p key={i} className="text-bloom-muted text-xs leading-relaxed mb-1.5 last:mb-0">✦ {t}</p>;
              })}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div>
            {Object.keys(byDay).map(function (day) {
              return (
                <div key={day} className="mb-4">
                  <Label className="mb-2">{new Date(day).toDateString() === new Date().toDateString() ? "Today" : new Date(day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}</Label>
                  <div className="bg-white rounded-2xl border border-bloom-border">
                    {byDay[day].map(function (h) {
                      var med = MEDS.find(function (m) { return m.id === h.medId; }) || {};
                      return (
                        <div key={h.id} className="flex items-center gap-3 px-4 py-3 border-b border-bloom-border last:border-0">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: med.color }} />
                          <div className="flex-1">
                            <p className="text-bloom-text text-sm font-semibold">{h.name} <span className="font-normal text-bloom-muted">{h.dose}</span></p>
                            <p className="text-bloom-dim text-xs">{[h.site, h.note].filter(Boolean).join(" · ") || "—"}</p>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: h.status === "taken" ? "#4ABFB0" : "#E07A8A" }}>
                            {h.status === "taken" ? "Taken" : "Missed"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "schedule" && (
          <div>
            {MEDS.map(function (m) {
              return (
                <div key={m.id} className="bg-white rounded-2xl p-4 border border-bloom-border mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    <p className="text-bloom-text text-sm font-bold flex-1">{m.name}</p>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md" style={{ color: m.color, backgroundColor: m.color + "15" }}>{m.type}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><p className="text-bloom-dim">Dose</p><p className="text-bloom-text font-semibold">{m.dose}</p></div>
                    <div><p className="text-bloom-dim">When</p><p className="text-bloom-text font-semibold">{m.time}</p></div>
                    <div><p className="text-bloom-dim">Started</p><p className="text-bloom-text font-semibold">Day {m.startDay} · {fmtDate(dateForStimDay(stimDay, m.startDay))}</p></div>
                  </div>
                  <p className="text-bloom-muted text-xs mt-2">{m.freq} · until your clinic says stop</p>
                </div>
              );
            })}
            <p className="text-bloom-dim text-xs text-center mt-3">Your schedule comes from your clinic. Never change a dose without speaking to them.</p>
          </div>
        )}
      </div>

      {modal && (
        <Sheet onClose={function () { setModal(null); }}>
          <h3 className="text-lg font-bold text-bloom-text mb-1">Log dose</h3>
          <p className="text-bloom-muted text-sm mb-4">{modal.name} · {modal.dose} · {modal.time}</p>
          <div className="flex gap-3 mb-4">
            {[[false, "Taken", "#4ABFB0"], [true, "Missed", "#E07A8A"]].map(function (o) {
              var on = missed === o[0];
              return (
                <button key={o[1]} onClick={function () { setMissed(o[0]); }} aria-pressed={on}
                  className="flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all"
                  style={{ borderColor: on ? o[2] : "#E8E0DB", backgroundColor: on ? o[2] + "15" : "white", color: on ? o[2] : "#7A6880" }}>
                  {o[1]}
                </button>
              );
            })}
          </div>
          {modal.type === "injection" && !missed && (
            <div className="mb-4">
              <Label className="mb-2">Injection site</Label>
              <div className="grid grid-cols-2 gap-2">
                {SITES.map(function (s) {
                  var on = site === s;
                  return (
                    <button key={s} onClick={function () { setSite(s); }} aria-pressed={on}
                      className="py-2.5 rounded-xl border text-xs font-semibold transition-all"
                      style={{ borderColor: on ? "#9B6DC5" : "#E8E0DB", backgroundColor: on ? "#9B6DC515" : "white", color: on ? "#9B6DC5" : "#7A6880" }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <Label className="mb-2">Note</Label>
          <textarea value={note} onChange={function (e) { setNote(e.target.value); }} placeholder={missed ? "What happened? (optional)" : "Any stinging, bruising, anything else? (optional)"} aria-label="Note"
            className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none resize-none h-20 focus:border-bloom-accent" />
          {missed && <p className="text-bloom-rose text-xs mt-2">Missed a dose? Call your clinic nurse line before taking anything extra.</p>}
          <div className="flex gap-3 mt-4">
            <button onClick={function () { setModal(null); }} className="flex-1 py-3 rounded-xl bg-bloom-surface text-bloom-muted font-semibold text-sm">Cancel</button>
            <button onClick={saveDose} className="flex-[2] py-3 rounded-xl bg-bloom-accent text-white font-semibold text-sm">Save</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
