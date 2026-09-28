"use client";
import { useState, useEffect } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { Illustration } from "../../ui/Graphics";
import { useT } from "../../../lib/i18n";
import { upcomingAppts, pastAppts, apptAt, apptColor, fmtClock } from "../../../lib/schedule";
import { ApptForm, apptLabel, relDay } from "../../ScheduleForms";

function pad(n) { return String(n).padStart(2, "0"); }

function icsDate(d) {
  return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
}

function icsText(v) {
  return String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function downloadIcs(apt, label) {
  var start = apptAt(apt);
  var end = new Date(start.getTime() + 60 * 60 * 1000);
  var ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bloom//IVF//EN", "BEGIN:VEVENT",
    "UID:bloom-" + apt.id + "-" + start.getTime() + "@bloomivfcompanion.com",
    "DTSTAMP:" + icsDate(new Date()), "DTSTART:" + icsDate(start), "DTEND:" + icsDate(end),
    "SUMMARY:" + icsText(label), "LOCATION:" + icsText(apt.clinic),
    "DESCRIPTION:" + icsText((apt.notes ? apt.notes + "\n" : "") + "Added from Bloom"),
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsText(label), "TRIGGER:-PT60M", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  var url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  var a = document.createElement("a");
  a.href = url;
  a.download = "bloom-appointment.ics";
  a.click();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

// Her appointments: the next one with a countdown, then everything coming up, and past ones.
// Real accounts start empty; the demo persona keeps her seeded schedule (lib/schedule.js).
export default function Appointments({ onBack, user }) {
  var { t, locale } = useT();
  var [now, setNow] = useState(function () { return Date.now(); });
  var [open, setOpen] = useState(null);
  var [editing, setEditing] = useState(null); // null | "new" | appt
  var [showPast, setShowPast] = useState(false);
  var [, setTick] = useState(0);

  useEffect(function () {
    var timer = setInterval(function () { setNow(Date.now()); }, 30000);
    return function () { clearInterval(timer); };
  }, []);

  var list = upcomingAppts(new Date(now));
  var past = pastAppts(new Date(now));
  var next = list[0] || null;
  var diff = next ? Math.max(0, apptAt(next).getTime() - now) : 0;
  var days = Math.floor(diff / 86400000);
  var hours = Math.floor((diff % 86400000) / 3600000);
  var mins = Math.floor((diff % 3600000) / 60000);
  var hasEstimate = list.some(function (a) { return a.estimate; });

  function fmtDate(a, long) {
    return apptAt(a).toLocaleDateString(locale, long ? { weekday: "long", day: "numeric", month: "long" } : { weekday: "short", day: "numeric", month: "short" });
  }

  function saved() {
    setEditing(null);
    setTick(function (n) { return n + 1; });
  }

  function row(apt, faded) {
    var isOpen = open === apt.id;
    var color = apptColor(apt);
    var label = apptLabel(apt, t);
    return (
      <div key={apt.id} className={"bg-white rounded-2xl border mb-2 overflow-hidden" + (faded ? " opacity-70" : "")} style={{ borderColor: color + "30" }}>
        <button onClick={function () { setOpen(isOpen ? null : apt.id); }} aria-expanded={isOpen} className="w-full text-start p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <div className="flex-1 min-w-0">
            <p className="text-bloom-text text-sm font-semibold truncate"><bdi>{label}</bdi></p>
            <p className="text-bloom-muted text-xs">{fmtDate(apt)} · <bdi>{fmtClock(apt.time, locale)}</bdi></p>
          </div>
          {!faded && <span className="text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap" style={{ backgroundColor: color + "15", color: color }}>{relDay(apt, t, new Date(now))}</span>}
        </button>
        {isOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-bloom-border animate-fade-in">
            <p className="text-bloom-muted text-xs mt-2"><b className="text-bloom-text">{t("appt.date")}</b> {fmtDate(apt, true)} · <bdi>{fmtClock(apt.time, locale)}</bdi></p>
            {apt.clinic && <p className="text-bloom-muted text-xs mt-1"><b className="text-bloom-text">{t("appt.where")}</b> <bdi>{apt.clinic}</bdi></p>}
            {apt.notes && <p className="text-bloom-muted text-xs mt-1 whitespace-pre-line"><b className="text-bloom-text">{t("appt.notes")}</b> <bdi>{apt.notes}</bdi></p>}
            <div className="flex flex-wrap gap-2 mt-3">
              {!faded && (
                <button onClick={function () { downloadIcs(apt, label); }} className="text-xs font-semibold px-3 py-2 rounded-lg min-h-[36px]" style={{ color: color, backgroundColor: color + "15" }}>
                  + {t("appt.calendar")}
                </button>
              )}
              <button onClick={function () { setEditing(apt); }} className="text-xs font-semibold px-3 py-2 rounded-lg min-h-[36px] bg-bloom-surface text-bloom-text">{t("sched.edit")}</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-1">{t("sec.appointments")}</h1>
        <p className="text-bloom-muted text-sm mb-4">{t("appt.sub")}</p>

        {next ? (
          <div className="bg-white rounded-2xl p-5 border mb-4" style={{ borderColor: "#9B6DC530" }}>
            <p className="text-xs font-bold uppercase tracking-wider text-bloom-accent mb-1">{t("appt.next")}</p>
            <h2 className="text-xl font-bold text-bloom-text mb-1"><bdi>{apptLabel(next, t)}</bdi></h2>
            <p className="text-bloom-muted text-sm mb-4">{relDay(next, t, new Date(now))} · <bdi>{fmtClock(next.time, locale)}</bdi>{next.clinic ? " · " : ""}{next.clinic ? <bdi>{next.clinic}</bdi> : null}</p>
            <div className="grid grid-cols-3 gap-2 mb-4" aria-live="polite">
              {[[days, t("appt.days")], [hours, t("appt.hours")], [mins, t("appt.min")]].map(function (x) {
                return (
                  <div key={x[1]} className="bg-bloom-surface rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-bloom-accent">{x[0]}</p>
                    <p className="text-bloom-muted text-xs">{x[1]}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-bloom-accent text-xs font-semibold mb-2">{t("appt.prep")}</p>
              {[1, 2, 3, 4].map(function (i) {
                return (
                  <div key={i} className="flex gap-2 mb-1.5 last:mb-0">
                    <span className="text-bloom-accent text-xs" aria-hidden="true">✦</span>
                    <span className="text-bloom-muted text-xs">{t("appt.prep" + i)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-dashed border-bloom-accent/40 mb-4 text-center">
            <div className="flex justify-center mb-2"><Illustration name="clinic" size={72} /></div>
            <p className="text-bloom-text text-sm font-semibold mb-1">{t("appt.emptyTitle")}</p>
            <p className="text-bloom-muted text-xs leading-relaxed mb-3">{t("appt.emptyBody")}</p>
            <button onClick={function () { setEditing("new"); }} className="px-5 py-2.5 rounded-xl bg-bloom-accent text-white text-sm font-semibold">{t("appt.add")}</button>
          </div>
        )}

        {next && (
          <button onClick={function () { setEditing("new"); }} className="w-full py-3 rounded-xl bg-white border border-bloom-accent/40 text-bloom-accent text-sm font-semibold mb-4">
            + {t("appt.add")}
          </button>
        )}

        {list.length > 0 && <Label className="mb-3">{t("appt.upcoming")}</Label>}
        {list.map(function (apt) { return row(apt, false); })}

        {past.length > 0 && (
          <button onClick={function () { setShowPast(!showPast); }} aria-expanded={showPast} className="text-bloom-muted text-xs font-semibold mt-3 mb-2 py-2">
            {showPast ? t("appt.hidePast") : t("appt.showPast", { n: past.length })}
          </button>
        )}
        {showPast && past.map(function (apt) { return row(apt, true); })}

        {hasEstimate && <p className="text-bloom-dim text-xs text-center mt-3">{t("appt.estimate")}</p>}
        <p className="text-bloom-dim text-xs text-center mt-2">{t("appt.clinicConfirms")}</p>
      </div>
      {editing && <ApptForm appt={editing === "new" ? null : editing} clinic={user.clinic} onClose={function () { setEditing(null); }} onSaved={saved} />}
    </div>
  );
}
