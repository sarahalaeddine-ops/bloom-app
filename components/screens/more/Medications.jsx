"use client";
import { useState } from "react";
import { BackBtn, Label, Sheet } from "../../ui/Common";
import ScreenHero from "../../ui/ScreenHero";
import { Illustration } from "../../ui/Graphics";
import { getTodayMedLog, logDose, getMedHistory, doseEntry } from "../../../lib/cycle";
import { getMeds, dosesOn, fmtClock, toDate } from "../../../lib/schedule";
import { syncNative } from "../../../lib/reminders";
import { useT } from "../../../lib/i18n";
import { MedForm, weekdayNames } from "../../ScheduleForms";

var SITES = ["lb", "rb", "lt", "rt"];
// Doses logged before sites were stored as ids.
var LEGACY_SITES = { "Left belly": "lb", "Right belly": "rb", "Left thigh": "lt", "Right thigh": "rt" };

function siteLabel(site, t) {
  var id = LEGACY_SITES[site] || site;
  return SITES.indexOf(id) !== -1 ? t("site." + id) : site;
}

function DoseCard({ dose, entry, onClick }) {
  var { t, locale } = useT();
  var med = dose.med;
  var taken = entry && entry.status === "taken";
  var missed = entry && entry.status === "missed";
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-2xl border mb-2 text-start bg-white"
      style={{ borderColor: taken ? med.color + "40" : "#E8E0DB", backgroundColor: taken ? med.color + "06" : "white" }}>
      <Illustration name={med.type === "injection" ? "protocol" : "pill"} size={48} />
      <div className="flex-1 min-w-0">
        <p className="text-bloom-text text-sm font-bold truncate"><bdi>{med.name}</bdi> {med.dose && <span className="font-normal text-bloom-muted"><bdi>{med.dose}</bdi></span>}</p>
        <p className="text-bloom-dim text-xs"><bdi>{fmtClock(dose.time, locale)}</bdi>{entry && entry.site ? " · " + siteLabel(entry.site, t) : ""}</p>
      </div>
      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0"
        style={{ backgroundColor: taken ? "#4ABFB015" : missed ? "#E07A8A15" : med.color + "15", color: taken ? "#4ABFB0" : missed ? "#E07A8A" : med.color }}>
        {taken ? t("med.done") : missed ? t("med.missed") : t("meds.log")}
      </span>
    </button>
  );
}

// Her medications: today's doses to log, her dose history, and her own schedule (add, edit, delete).
// Real accounts start empty; the demo persona keeps her seeded schedule (lib/schedule.js).
export default function Medications({ onBack, user }) {
  var { t, locale } = useT();
  var [tab, setTab] = useState("today");
  var [meds, setMeds] = useState(getMeds);
  var [log, setLog] = useState(getTodayMedLog);
  var [history, setHistory] = useState(getMedHistory);
  var [modal, setModal] = useState(null);
  var [editing, setEditing] = useState(null); // null | "new" | med
  var [site, setSite] = useState("");
  var [note, setNote] = useState("");
  var [missed, setMissed] = useState(false);
  var doses = dosesOn(new Date(), meds);
  var isStim = (user.phase || "stimulation") === "stimulation" && user.stimDay;
  var days = weekdayNames(locale, "short");

  var allDone = doses.length > 0 && doses.every(function (d) { var e = doseEntry(log, d.med.id, d.time); return e && e.status === "taken"; });

  function open(dose) {
    var e = doseEntry(log, dose.med.id, dose.time);
    setModal(dose);
    setMissed(e ? e.status === "missed" : false);
    setSite(e && e.site ? LEGACY_SITES[e.site] || e.site : "");
    setNote(e && e.note ? e.note : "");
  }

  function saveDose() {
    var entry = { status: missed ? "missed" : "taken", site: modal.med.type === "injection" && !missed ? site : "", note: note.trim().slice(0, 300) };
    setLog(logDose(modal.med.id, modal.time, entry));
    syncNative(); // native app: drop today's reminder for a dose she has taken
    setHistory(getMedHistory());
    setModal(null);
  }

  function saved() {
    setMeds(getMeds());
    setLog(getTodayMedLog());
    setEditing(null);
  }

  function fmtDay(ymdStr) {
    var d = toDate(ymdStr, "12:00");
    return d ? d.toLocaleDateString(locale, { day: "numeric", month: "short" }) : "";
  }

  var byDay = {};
  history.forEach(function (h) {
    var k = new Date(h.at).toDateString();
    (byDay[k] = byDay[k] || []).push(h);
  });

  var addBtn = (
    <button onClick={function () { setEditing("new"); }} className="w-full py-3 rounded-xl bg-white border border-bloom-accent/40 text-bloom-accent text-sm font-semibold mb-3">
      + {t("meds.add")}
    </button>
  );

  var empty = (
    <div className="bg-white rounded-2xl p-5 border border-dashed border-bloom-accent/40 mb-3 text-center">
      <div className="flex justify-center mb-2"><Illustration name="calendar" size={72} /></div>
      <p className="text-bloom-text text-sm font-semibold mb-1">{t("meds.emptyTitle")}</p>
      <p className="text-bloom-muted text-xs leading-relaxed mb-3">{t("meds.emptyBody")}</p>
      <button onClick={function () { setEditing("new"); }} className="px-5 py-2.5 rounded-xl bg-bloom-accent text-white text-sm font-semibold">{t("meds.add")}</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bloom-bg">
      <BackBtn onBack={onBack} />
      <div className="px-4 pb-2">
        <ScreenHero art="pill" title={t("sec.medications")} sub={isStim ? t("meds.stimDay", { n: user.stimDay }) : t("meds.sub")} />
        <div className="flex bg-bloom-surface rounded-xl p-1 mb-4" role="tablist">
          {[["today", t("meds.tab.today")], ["history", t("meds.tab.history")], ["schedule", t("meds.tab.mine")]].map(function (x) {
            return (
              <button key={x[0]} role="tab" aria-selected={tab === x[0]} onClick={function () { setTab(x[0]); }}
                className={"flex-1 py-2 rounded-lg text-xs font-semibold transition-all " + (tab === x[0] ? "bg-white text-bloom-text shadow-sm" : "text-bloom-muted")}>
                {x[1]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-6">
        {tab === "today" && (
          <div>
            {meds.length === 0 && empty}
            {meds.length > 0 && doses.length === 0 && (
              <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3 text-center">
                <p className="text-bloom-text text-sm font-semibold">{t("meds.noneToday")}</p>
                <p className="text-bloom-muted text-xs mt-1">{t("meds.noneTodayBody")}</p>
              </div>
            )}
            {allDone && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3 mb-3">
                <span className="text-xl text-bloom-teal" aria-hidden="true">✦</span>
                <div>
                  <p className="font-bold text-bloom-teal text-sm">{t("meds.allDone")}</p>
                  <p className="text-bloom-muted text-xs">{t("meds.allDoneSub")}</p>
                </div>
              </div>
            )}
            {doses.length > 0 && <Label className="mb-2">{t("meds.todayLabel")}</Label>}
            {doses.map(function (d) {
              return <DoseCard key={d.key} dose={d} entry={doseEntry(log, d.med.id, d.time)} onClick={function () { open(d); }} />;
            })}
            {meds.some(function (m) { return m.type === "injection"; }) && (
              <div className="bg-white rounded-2xl p-4 border-2 mt-3" style={{ borderColor: "#C49A3C60" }}>
                <p className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "#C49A3C" }}>{t("meds.tips")}</p>
                {[1, 2, 3, 4].map(function (i) {
                  return <p key={i} className="text-bloom-muted text-xs leading-relaxed mb-1.5 last:mb-0">✦ {t("meds.tip" + i)}</p>;
                })}
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div>
            {history.length === 0 && (
              <div className="bg-white rounded-2xl p-5 border border-bloom-border text-center">
                <p className="text-bloom-text text-sm font-semibold mb-1">{t("meds.historyEmpty")}</p>
                <p className="text-bloom-muted text-xs">{t("meds.historyEmptyBody")}</p>
              </div>
            )}
            {Object.keys(byDay).map(function (day) {
              var isToday = new Date(day).toDateString() === new Date().toDateString();
              return (
                <div key={day} className="mb-4">
                  <Label className="mb-2">{isToday ? t("home.today") : new Date(day).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "short" })}</Label>
                  <div className="bg-white rounded-2xl border border-bloom-border">
                    {byDay[day].map(function (h) {
                      var med = meds.find(function (m) { return m.id === h.medId; });
                      return (
                        <div key={h.id} className="flex items-center gap-3 px-4 py-3 border-b border-bloom-border last:border-0">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: med ? med.color : "#C5B8CC" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-bloom-text text-sm font-semibold"><bdi>{h.name}</bdi> <span className="font-normal text-bloom-muted"><bdi>{h.dose}</bdi></span></p>
                            <p className="text-bloom-dim text-xs">{[h.time ? fmtClock(h.time, locale) : "", h.site ? siteLabel(h.site, t) : "", h.note].filter(Boolean).join(" · ") || "—"}</p>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: h.status === "taken" ? "#4ABFB0" : "#E07A8A" }}>
                            {h.status === "taken" ? t("meds.taken") : t("med.missed")}
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
            {meds.length === 0 ? empty : addBtn}
            {meds.map(function (m) {
              return (
                <button key={m.id} onClick={function () { setEditing(m); }} className="w-full text-start bg-white rounded-2xl p-4 border border-bloom-border mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                    <p className="text-bloom-text text-sm font-bold flex-1 min-w-0 truncate"><bdi>{m.name}</bdi></p>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md" style={{ color: m.color, backgroundColor: m.color + "15" }}>{t("med.type." + m.type)}</span>
                    <span className="text-bloom-accent text-xs font-semibold ms-1">{t("sched.edit")}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><p className="text-bloom-dim">{t("medf.dose")}</p><p className="text-bloom-text font-semibold"><bdi>{m.dose || "—"}</bdi></p></div>
                    <div><p className="text-bloom-dim">{t("meds.when")}</p><p className="text-bloom-text font-semibold"><bdi>{m.times.map(function (x) { return fmtClock(x, locale); }).join(", ")}</bdi></p></div>
                    <div><p className="text-bloom-dim">{t("medf.start")}</p><p className="text-bloom-text font-semibold">{m.start ? fmtDay(m.start) : "—"}</p></div>
                  </div>
                  <p className="text-bloom-muted text-xs mt-2">
                    {m.days && m.days.length ? m.days.map(function (d) { return days[d]; }).join(", ") : t("medf.everyDay")}
                    {" · "}{m.end ? t("meds.until", { date: fmtDay(m.end) }) : t("meds.untilClinic")}
                  </p>
                  {m.notes && <p className="text-bloom-dim text-xs mt-1 whitespace-pre-line"><bdi>{m.notes}</bdi></p>}
                </button>
              );
            })}
            <p className="text-bloom-dim text-xs text-center mt-3">{t("meds.fromClinic")}</p>
          </div>
        )}
      </div>

      {modal && (
        <Sheet onClose={function () { setModal(null); }}>
          <h3 className="text-lg font-bold text-bloom-text mb-1">{t("meds.logDose")}</h3>
          <p className="text-bloom-muted text-sm mb-4"><bdi>{modal.med.name}</bdi>{modal.med.dose ? " · " : ""}<bdi>{modal.med.dose}</bdi> · <bdi>{fmtClock(modal.time, locale)}</bdi></p>
          <div className="flex gap-3 mb-4">
            {[[false, t("meds.taken"), "#4ABFB0"], [true, t("med.missed"), "#E07A8A"]].map(function (o) {
              var on = missed === o[0];
              return (
                <button key={String(o[0])} onClick={function () { setMissed(o[0]); }} aria-pressed={on}
                  className="flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all"
                  style={{ borderColor: on ? o[2] : "#E8E0DB", backgroundColor: on ? o[2] + "15" : "white", color: on ? o[2] : "#7A6880" }}>
                  {o[1]}
                </button>
              );
            })}
          </div>
          {modal.med.type === "injection" && !missed && (
            <div className="mb-4">
              <Label className="mb-2">{t("meds.site")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {SITES.map(function (s) {
                  var on = site === s;
                  return (
                    <button key={s} onClick={function () { setSite(s); }} aria-pressed={on}
                      className="py-2.5 rounded-xl border text-xs font-semibold transition-all"
                      style={{ borderColor: on ? "#9B6DC5" : "#E8E0DB", backgroundColor: on ? "#9B6DC515" : "white", color: on ? "#9B6DC5" : "#7A6880" }}>
                      {t("site." + s)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <Label className="mb-2">{t("meds.note")}</Label>
          <textarea value={note} maxLength={300} onChange={function (e) { setNote(e.target.value); }} placeholder={missed ? t("meds.notePhMissed") : t("meds.notePh")} aria-label={t("meds.note")}
            className="w-full bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none resize-none h-20 focus:border-bloom-accent" />
          {missed && <p className="text-bloom-rose text-xs mt-2">{t("meds.missedHint")}</p>}
          <div className="flex gap-3 mt-4">
            <button onClick={function () { setModal(null); }} className="flex-1 py-3 rounded-xl bg-bloom-surface text-bloom-muted font-semibold text-sm">{t("common.cancel")}</button>
            <button onClick={saveDose} className="flex-[2] py-3 rounded-xl bg-bloom-accent text-white font-semibold text-sm">{t("common.save")}</button>
          </div>
        </Sheet>
      )}

      {editing && <MedForm med={editing === "new" ? null : editing} onClose={function () { setEditing(null); }} onSaved={saved} />}
    </div>
  );
}
