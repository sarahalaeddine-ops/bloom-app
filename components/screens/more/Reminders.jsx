"use client";
import { useState, useEffect } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { Illustration } from "../../ui/Graphics";
import { getSettings, saveSettings, permission, currentPermission, requestPermission, notify, upcoming, fmtTime, doseCalendar, syncNative, LEADS } from "../../../lib/reminders";
import { isNative } from "../../../lib/native";
import { useT } from "../../../lib/i18n";

function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={function () { onChange(!on); }}
      className="w-12 h-7 rounded-full relative transition-colors flex-shrink-0" style={{ backgroundColor: on ? "#4ABFB0" : "#E8E0DB" }}>
      <span className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ insetInlineStart: on ? 24 : 4 }} />
    </button>
  );
}

export default function Reminders({ onBack }) {
  var { t } = useT();
  var native = isNative();
  var [s, setS] = useState(getSettings);
  var [perm, setPerm] = useState(permission);
  var [msg, setMsg] = useState("");
  var next = upcoming(s, new Date(), 36).slice(0, 5);

  // The native permission can only be read asynchronously.
  useEffect(function () {
    if (!native) return;
    var live = true;
    currentPermission().then(function (p) { if (live) setPerm(p); });
    return function () { live = false; };
  }, [native]);

  function flash(text) { setMsg(text); setTimeout(function () { setMsg(""); }, 3000); }
  function update(patch) {
    setS(saveSettings({ ...s, ...patch }));
    syncNative(); // native app: re-plan the phone's scheduled reminders
  }

  // Permission is asked here, when she turns reminders on, never at launch.
  async function enable(on) {
    if (!on) { update({ enabled: false }); return; }
    var p = await requestPermission();
    setPerm(p);
    update({ enabled: true });
    if (p === "granted") flash(t("rem.on"));
    else if (p === "denied") flash(native ? t("rem.nativeBlocked") : t("rem.blockedFlash"));
    else if (p === "unsupported") flash(t("rem.unsupported"));
  }

  async function test() {
    var ok = await notify(t("rem.testTitle"), t("rem.testBody"), "bloom-test");
    flash(ok ? t("rem.testSent") : t("rem.testFailed"));
  }

  function addToCalendar() {
    var url = URL.createObjectURL(new Blob([doseCalendar(10, s.lead)], { type: "text/calendar" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "bloom-dose-reminders.ics";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    flash(t("rem.calDone"));
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <div className="flex flex-col items-center text-center mb-5">
          <Illustration name="bell" size={104} />
          <h1 className="text-2xl font-bold text-bloom-text mt-3 mb-1">{t("sec.reminders")}</h1>
          <p className="text-bloom-muted text-sm">{t("rem.sub")}</p>
        </div>

        {msg && <p className="text-bloom-teal text-sm text-center font-semibold mb-3" role="status">{msg}</p>}

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1">
              <p className="text-bloom-text text-sm font-semibold">{t("sec.reminders")}</p>
              <p className="text-bloom-muted text-xs">
                {perm === "granted" ? (native ? t("rem.nativeAllowed") : t("rem.allowed")) : perm === "denied" ? (native ? t("rem.nativeBlocked") : t("rem.blocked")) : (native ? t("rem.nativeAsk") : t("rem.ask"))}
              </p>
            </div>
            <Toggle on={s.enabled} onChange={enable} label={t("sec.reminders")} />
          </div>
          <div className={s.enabled ? "" : "opacity-40 pointer-events-none"}>
            <div className="flex items-center gap-3 py-3 border-t border-bloom-border mt-2">
              <p className="flex-1 text-bloom-text text-sm">{t("rem.meds")}</p>
              <Toggle on={s.meds} onChange={function (v) { update({ meds: v }); }} label={t("rem.meds")} />
            </div>
            <div className="flex items-center gap-3 py-3 border-t border-bloom-border">
              <p className="flex-1 text-bloom-text text-sm">{t("rem.appts")} <span className="text-bloom-dim text-xs">{t("rem.apptsLead")}</span></p>
              <Toggle on={s.appts} onChange={function (v) { update({ appts: v }); }} label={t("rem.appts")} />
            </div>
            <div className="py-3 border-t border-bloom-border">
              <p className="text-bloom-text text-sm mb-2">{t("rem.lead")}</p>
              <div className="flex gap-2">
                {LEADS.map(function (l) {
                  var on = s.lead === l;
                  return (
                    <button key={l} onClick={function () { update({ lead: l }); }} aria-pressed={on}
                      className="flex-1 py-2 rounded-xl border-2 text-xs font-semibold"
                      style={{ borderColor: on ? "#9B6DC5" : "#E8E0DB", color: on ? "#9B6DC5" : "#7A6880", backgroundColor: on ? "#9B6DC50D" : "white" }}>
                      {l === 0 ? t("rem.onTime") : t("rem.min", { n: l })}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={test} className="w-full mt-1 py-3 rounded-xl bg-bloom-surface text-bloom-text font-semibold text-sm">{t("rem.test")}</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-3">{t("rem.coming")}</Label>
          {next.length === 0 && <p className="text-bloom-muted text-sm">{t("rem.nothing")}</p>}
          {next.map(function (r) {
            return (
              <div key={r.id} className="flex items-center gap-3 py-2 border-t border-bloom-border first:border-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-bloom-text text-sm font-semibold truncate">{r.kind === "med" ? r.title : r.title.replace(" in 1 hour", "")}</p>
                  <p className="text-bloom-dim text-xs">{r.kind === "med" ? t("rem.due", { time: fmtTime(r.due) }) : r.body}</p>
                </div>
                <span className="text-bloom-muted text-xs whitespace-nowrap">
                  {r.at.toDateString() === new Date().toDateString() ? "" : t("rem.tmrw") + " "}{fmtTime(r.at)}
                </span>
              </div>
            );
          })}
        </div>

        {native ? (
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200 mb-3">
            <p className="text-bloom-text text-sm font-semibold mb-1">{t("rem.closedTitle")}</p>
            <p className="text-bloom-muted text-xs leading-relaxed">{t("rem.nativeClosed")}</p>
          </div>
        ) : (
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200 mb-3">
            <p className="text-bloom-text text-sm font-semibold mb-1">{t("rem.closedTitle")}</p>
            <p className="text-bloom-muted text-xs leading-relaxed mb-3">{t("rem.calBody")}</p>
            <button onClick={addToCalendar} className="w-full py-3 rounded-xl bg-bloom-accent text-white font-semibold text-sm">{t("rem.calBtn")}</button>
          </div>
        )}

        <p className="text-bloom-dim text-xs leading-relaxed">{native ? "" : t("rem.iosNote") + " "}{t("rem.follow")}</p>
      </div>
    </div>
  );
}
