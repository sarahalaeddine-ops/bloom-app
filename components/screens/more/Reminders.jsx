"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { Illustration } from "../../ui/Graphics";
import { getSettings, saveSettings, permission, requestPermission, notify, upcoming, fmtTime, doseCalendar, LEADS } from "../../../lib/reminders";

function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={function () { onChange(!on); }}
      className="w-12 h-7 rounded-full relative transition-colors flex-shrink-0" style={{ backgroundColor: on ? "#4ABFB0" : "#E8E0DB" }}>
      <span className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: on ? 24 : 4 }} />
    </button>
  );
}

export default function Reminders({ onBack }) {
  var [s, setS] = useState(getSettings);
  var [perm, setPerm] = useState(permission);
  var [msg, setMsg] = useState("");
  var next = upcoming(s, new Date(), 36).slice(0, 5);

  function flash(t) { setMsg(t); setTimeout(function () { setMsg(""); }, 3000); }
  function update(patch) { setS(saveSettings({ ...s, ...patch })); }

  async function enable(on) {
    if (!on) { update({ enabled: false }); return; }
    var p = await requestPermission();
    setPerm(p);
    update({ enabled: true });
    if (p === "granted") flash("Reminders are on ✓");
    else if (p === "denied") flash("Notifications are blocked, so reminders will show inside Bloom instead.");
    else if (p === "unsupported") flash("This browser can't show notifications. Reminders will show inside Bloom.");
  }

  async function test() {
    var ok = await notify("Bloom test reminder 💜", "This is how your dose reminders will look.", "bloom-test");
    flash(ok ? "Test reminder sent ✓" : "Couldn't show a notification here. Turn notifications on first.");
  }

  function addToCalendar() {
    var url = URL.createObjectURL(new Blob([doseCalendar(10, s.lead)], { type: "text/calendar" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "bloom-dose-reminders.ics";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    flash("Calendar file downloaded. Open it to add your dose alarms.");
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <div className="flex flex-col items-center text-center mb-5">
          <Illustration name="bell" size={104} />
          <h1 className="text-2xl font-bold text-bloom-text mt-3 mb-1">Reminders</h1>
          <p className="text-bloom-muted text-sm">Never miss a dose, a scan or a call from your clinic.</p>
        </div>

        {msg && <p className="text-bloom-teal text-sm text-center font-semibold mb-3" role="status">{msg}</p>}

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1">
              <p className="text-bloom-text text-sm font-semibold">Reminders</p>
              <p className="text-bloom-muted text-xs">
                {perm === "granted" ? "Notifications allowed on this device." : perm === "denied" ? "Notifications blocked in browser settings. You'll get in-app reminders." : "We'll ask your browser for permission."}
              </p>
            </div>
            <Toggle on={s.enabled} onChange={enable} label="Reminders" />
          </div>
          <div className={s.enabled ? "" : "opacity-40 pointer-events-none"}>
            <div className="flex items-center gap-3 py-3 border-t border-bloom-border mt-2">
              <p className="flex-1 text-bloom-text text-sm">Medication doses</p>
              <Toggle on={s.meds} onChange={function (v) { update({ meds: v }); }} label="Medication reminders" />
            </div>
            <div className="flex items-center gap-3 py-3 border-t border-bloom-border">
              <p className="flex-1 text-bloom-text text-sm">Appointments <span className="text-bloom-dim text-xs">(1 hour before)</span></p>
              <Toggle on={s.appts} onChange={function (v) { update({ appts: v }); }} label="Appointment reminders" />
            </div>
            <div className="py-3 border-t border-bloom-border">
              <p className="text-bloom-text text-sm mb-2">Remind me before each dose</p>
              <div className="flex gap-2">
                {LEADS.map(function (l) {
                  var on = s.lead === l;
                  return (
                    <button key={l} onClick={function () { update({ lead: l }); }} aria-pressed={on}
                      className="flex-1 py-2 rounded-xl border-2 text-xs font-semibold"
                      style={{ borderColor: on ? "#9B6DC5" : "#E8E0DB", color: on ? "#9B6DC5" : "#7A6880", backgroundColor: on ? "#9B6DC50D" : "white" }}>
                      {l === 0 ? "On time" : l + " min"}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={test} className="w-full mt-1 py-3 rounded-xl bg-bloom-surface text-bloom-text font-semibold text-sm">Send a test reminder</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-3">Coming up</Label>
          {next.length === 0 && <p className="text-bloom-muted text-sm">Nothing in the next 36 hours.</p>}
          {next.map(function (r) {
            return (
              <div key={r.id} className="flex items-center gap-3 py-2 border-t border-bloom-border first:border-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-bloom-text text-sm font-semibold truncate">{r.kind === "med" ? r.title : r.title.replace(" in 1 hour", "")}</p>
                  <p className="text-bloom-dim text-xs">{r.kind === "med" ? "Due " + fmtTime(r.due) : r.body}</p>
                </div>
                <span className="text-bloom-muted text-xs whitespace-nowrap">
                  {r.at.toDateString() === new Date().toDateString() ? "" : "Tmrw "}{fmtTime(r.at)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200 mb-3">
          <p className="text-bloom-text text-sm font-semibold mb-1">Reminders even when Bloom is closed</p>
          <p className="text-bloom-muted text-xs leading-relaxed mb-3">Add every dose to your phone&apos;s calendar with an alarm. It works on any phone, even offline.</p>
          <button onClick={addToCalendar} className="w-full py-3 rounded-xl bg-bloom-accent text-white font-semibold text-sm">Add dose alarms to my calendar</button>
        </div>

        <p className="text-bloom-dim text-xs leading-relaxed">On iPhone, notifications need iOS 16.4+ and Bloom added to your Home Screen (Share → Add to Home Screen). Always follow your clinic&apos;s dosing instructions.</p>
      </div>
    </div>
  );
}
