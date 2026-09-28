"use client";
import { useState } from "react";
import { BackBtn, Label, Logo } from "../../ui/Common";
import { MATURE_MM, MOODS } from "../../../lib/demo-data";
import { getCheckins, dateForStimDay, cycleStartDate, follicleStats, medAdherence, hormoneSeries, latestFollicles } from "../../../lib/cycle";
import { getMeds, upcomingAppts, fmtClock, apptAt } from "../../../lib/schedule";
import ScanLog, { ScanEmpty } from "../../ScanLog";
import { apptLabel, weekdayNames } from "../../ScheduleForms";
import { useT } from "../../../lib/i18n";
import { JourneyRing, journeyDay, Ovary, Donut, MoodFace } from "../../ui/Graphics";
import LineChart from "../../ui/LineChart";

// Only her own data: her profile, the scan results she logged, her own medication schedule and
// appointments (lib/schedule.js) and her check-ins. The demo persona's values only for the demo.
function useReport(user) {
  var { t, locale } = useT();
  var stimDay = user.stimDay || 1;
  var isStim = (user.phase || "stimulation") === "stimulation" && !!user.stimDay;
  var date = function (d, opts) { return new Date(d).toLocaleDateString(locale, opts || { day: "numeric", month: "short" }); };
  var days = weekdayNames(locale, "short");
  var meds = getMeds();
  var appts = upcomingAppts(new Date()).slice(0, 8);
  function medLine(m) {
    var when = m.times.map(function (x) { return fmtClock(x, locale); }).join(", ");
    var on = m.days && m.days.length ? m.days.map(function (d) { return days[d]; }).join(", ") : t("medf.everyDay");
    var span = (m.start ? t("rep.from", { date: date(m.start + "T12:00") }) : "") + (m.end ? (m.start ? " " : "") + t("rep.to", { date: date(m.end + "T12:00") }) : "");
    return { name: m.name + (m.dose ? " " + m.dose : ""), detail: [t("med.type." + m.type), when, on, span].filter(Boolean).join(" · ") };
  }
  function apptLine(a) {
    return { name: apptLabel(a, t), detail: date(apptAt(a), { weekday: "short", day: "numeric", month: "short" }) + " · " + fmtClock(a.time, locale) + (a.clinic ? " · " + a.clinic : "") };
  }
  return { t: t, locale: locale, stimDay: stimDay, isStim: isStim, date: date, meds: meds.map(medLine), appts: appts.map(apptLine) };
}

function buildText(user, checkins, r) {
  var t = r.t;
  var s = follicleStats();
  var rows = hormoneSeries();
  var f = latestFollicles();
  var dash = function (v) { return v != null ? v : "-"; };
  var lines = [
    t("rep.textTitle"),
    t("rep.name") + ": " + (user.anonymous ? t("more.hidden") : user.name || "-"),
    t("rep.clinic") + ": " + (user.clinic || "-"),
    t("rep.doctor") + ": " + (user.doctor || "-"),
    t("rep.protocol") + ": " + (user.protocol || "-"),
  ];
  if (r.isStim) lines.push(t("rep.cycleStart") + ": " + r.date(cycleStartDate(r.stimDay)), t("rep.stimDay") + ": " + r.stimDay);
  else if (user.phase) lines.push(t("more.phase") + ": " + t("phase." + user.phase));
  lines.push("", t("rep.hormonesHead"));
  if (!rows.length) lines.push(t("rep.noScans"));
  rows.forEach(function (h) { lines.push(t("common.day", { n: h.day }) + " / " + r.date(dateForStimDay(r.stimDay, h.day)) + " / " + dash(h.e2) + " / " + dash(h.lh) + " / " + dash(h.p4)); });
  if (f) {
    lines.push("", t("rep.folliclesHead", { n: f.day, t: s.total, m: s.mature, mm: MATURE_MM }));
    lines.push(t("rep.right") + ": " + (f.right.join(", ") || "-") + " mm");
    lines.push(t("rep.left") + ": " + (f.left.join(", ") || "-") + " mm");
  } else {
    lines.push("", t("rep.noFollicles"));
  }
  lines.push("", t("rep.medsHead"));
  if (!r.meds.length) lines.push(t("rep.noMeds"));
  r.meds.forEach(function (m) { lines.push(m.name + " · " + m.detail); });
  lines.push("", t("rep.apptsHead"));
  if (!r.appts.length) lines.push(t("rep.noAppts"));
  r.appts.forEach(function (a) { lines.push(a.name + " · " + a.detail); });
  lines.push("", t("rep.checkinsHead"));
  if (!checkins.length) lines.push(t("rep.noCheckins"));
  checkins.forEach(function (c) {
    lines.push(r.date(c.date) + " / " + t("mood." + (MOODS[c.mood] ? c.mood : 2)) + " / " + c.anxiety + "/5 / " + c.hope + "/5 / " + ((c.symptoms || []).map(function (x) { return t("sym." + x); }).join(", ") || t("rep.none")));
  });
  lines.push("", t("rep.disclaimer"));
  return lines.join("\n");
}

export default function Report({ onBack, user }) {
  var r = useReport(user);
  var t = r.t;
  var stimDay = r.stimDay;
  var [checkins] = useState(getCheckins);
  var [status, setStatus] = useState("");
  var [, setScanTick] = useState(0);
  var [scanOpen, setScanOpen] = useState(false);
  var s = follicleStats();
  var rows = hormoneSeries();
  var e2Rows = rows.filter(function (h) { return h.e2 != null; });
  var f = latestFollicles();
  var adherence = medAdherence();
  var dash = function (v) { return v != null ? v : "—"; };
  var text = buildText(user, checkins, r);

  function flash(msg) { setStatus(msg); setTimeout(function () { setStatus(""); }, 3000); }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: t("rep.shareTitle"), text: text });
        flash(t("rep.shared"));
      } else {
        await navigator.clipboard.writeText(text);
        flash(t("rep.copiedInstead"));
      }
    } catch (e) {
      if (e && e.name !== "AbortError") flash(t("rep.shareFailed"));
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      flash(t("rep.copied"));
    } catch {
      flash(t("rep.copyFailed"));
    }
  }

  var info = [
    [t("rep.name"), user.anonymous ? t("more.hidden") : user.name || "—"], [t("rep.clinic"), user.clinic || "—"], [t("rep.doctor"), user.doctor || "—"],
    [t("rep.protocol"), user.protocol || "—"],
  ];
  if (r.isStim) info.push([t("rep.cycleStart"), r.date(cycleStartDate(stimDay))], [t("rep.stimDay"), t("common.day", { n: stimDay })]);
  else if (user.phase) info.push([t("more.phase"), t("phase." + user.phase)]);

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <div className="no-print"><BackBtn onBack={onBack} /></div>
      <div className="px-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl font-bold text-bloom-text mb-1">{t("sec.report")}</h1>
            <p className="text-bloom-muted text-sm">{t("rep.generated", { date: r.date(new Date(), { day: "numeric", month: "long", year: "numeric" }) })}</p>
          </div>
          <Logo size={18} />
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-2">{t("rep.patient")}</Label>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {info.map(function (x) {
              return <div key={x[0]}><p className="text-bloom-dim text-[10px] uppercase">{x[0]}</p><p className="text-bloom-text text-sm font-semibold"><bdi>{x[1]}</bdi></p></div>;
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-3">{t("rep.glance")}</Label>
          <div className="flex items-center gap-4 mb-4">
            <JourneyRing day={journeyDay(user.phase, stimDay)} size={130}>
              {r.isStim ? (
                <>
                  <p className="font-serif italic text-bloom-text leading-none" style={{ fontSize: "26px" }}>{t("common.day", { n: stimDay })}</p>
                  <p className="text-bloom-muted text-[10px]">{t("rep.ofStims")}</p>
                </>
              ) : (
                <p className="font-serif italic text-bloom-text leading-tight text-center px-3" style={{ fontSize: "16px" }}>{t("phase." + (user.phase || "planning"))}</p>
              )}
            </JourneyRing>
            <div className="flex-1 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <Donut value={adherence == null ? 0 : adherence} size={56} label={t("rep.dosesTaken")} />
                <div><p className="text-bloom-text text-sm font-semibold">{t("rep.dosesTaken")}</p><p className="text-bloom-dim text-xs">{adherence == null ? t("rep.noDoses") : t("rep.loggedIn")}</p></div>
              </div>
              {!s.none && (
              <div className="flex items-center gap-3">
                <Donut value={s.total ? s.mature / s.total : 0} size={56} color="#9B6DC5" label={t("rep.matureLabel")} />
                <div><p className="text-bloom-text text-sm font-semibold">{t("rep.mature", { m: s.mature, t: s.total })}</p><p className="text-bloom-dim text-xs"><bdi dir="ltr">≥{MATURE_MM} mm</bdi></p></div>
              </div>
              )}
            </div>
          </div>
          {f && (
          <div className="flex gap-2 mb-4">
            <Ovary label={t("rep.right")} sizes={f.right} color="#9B6DC5" matureMm={MATURE_MM} />
            <Ovary label={t("rep.left")} sizes={f.left} color="#4ABFB0" matureMm={MATURE_MM} flip />
          </div>
          )}
          {e2Rows.length > 1 && (
          <>
          <p className="text-bloom-muted text-xs font-semibold mb-1">{t("rep.e2Chart")}</p>
          <LineChart series={[{ name: "E2", color: "#E07A8A", values: e2Rows.map(function (h) { return h.e2; }) }]} labels={e2Rows.map(function (h) { return t("ch.dayShort", { n: h.day }); })} unit=" pg/mL" height={130} />
          </>
          )}
        </div>

        {rows.length === 0 && <div className="no-print"><ScanEmpty body={t("scan.emptyReport")} onLog={function () { setScanOpen(true); }} /></div>}

        {rows.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3 overflow-x-auto">
          <Label className="mb-2">{t("rep.hormones")}</Label>
          <table className="w-full text-xs">
            <thead><tr className="text-bloom-muted"><th className="pb-2 font-semibold text-start">{t("ch.colDay")}</th><th className="pb-2 font-semibold text-start">{t("ch.colDate")}</th><th className="pb-2 font-semibold text-end">E2</th><th className="pb-2 font-semibold text-end">LH</th><th className="pb-2 font-semibold text-end">P4</th></tr></thead>
            <tbody>
              {rows.map(function (h, i) {
                return (
                  <tr key={i} className="border-t border-bloom-border text-bloom-text">
                    <td className="py-2">{h.day}</td><td>{r.date(dateForStimDay(stimDay, h.day))}</td><td className="text-end">{dash(h.e2)}</td><td className="text-end">{dash(h.lh)}</td><td className="text-end">{dash(h.p4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-bloom-dim text-[10px] mt-2"><bdi dir="ltr">E2 pg/mL · LH IU/L · P4 ng/mL</bdi></p>
        </div>
        )}

        {f && (
        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-2">{t("rep.follicles", { n: f.day, t: s.total, m: s.mature })}</Label>
          {[[t("home.rightOvary"), f.right, "#9B6DC5"], [t("home.leftOvary"), f.left, "#4ABFB0"]].map(function (row) {
            return (
              <div key={row[0]} className="mb-2 last:mb-0">
                <p className="text-xs font-semibold mb-1.5" style={{ color: row[2] }}>{row[0]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {row[1].map(function (mm, i) {
                    var m = mm >= MATURE_MM;
                    return <span key={i} dir="ltr" className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ backgroundColor: m ? row[2] : row[2] + "15", color: m ? "white" : row[2] }}>{mm}mm{m ? " ✓" : ""}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-2">{t("sec.medications")}</Label>
          {r.meds.length === 0 && <p className="text-bloom-muted text-xs">{t("rep.noMeds")}</p>}
          {r.meds.map(function (m, i) {
            return (
              <div key={i} className="py-2 border-t border-bloom-border first:border-0 text-xs">
                <p className="text-bloom-text font-semibold"><bdi>{m.name}</bdi></p>
                <p className="text-bloom-muted">{m.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-2">{t("appt.upcoming")}</Label>
          {r.appts.length === 0 && <p className="text-bloom-muted text-xs">{t("rep.noAppts")}</p>}
          {r.appts.map(function (a, i) {
            return (
              <div key={i} className="py-2 border-t border-bloom-border first:border-0 text-xs">
                <p className="text-bloom-text font-semibold"><bdi>{a.name}</bdi></p>
                <p className="text-bloom-muted"><bdi>{a.detail}</bdi></p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-2">{t("rep.checkins")}</Label>
          {checkins.length === 0 && <p className="text-bloom-muted text-xs">{t("rep.noCheckins")}</p>}
          {checkins.map(function (c, i) {
            var m = MOODS[c.mood] || MOODS[2];
            return (
              <div key={i} className="py-2 border-t border-bloom-border first:border-0 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-bloom-text font-semibold flex items-center gap-1.5">{r.date(c.date)} · <MoodFace mood={MOODS[c.mood] ? c.mood : 2} color={m.c} size={18} /> {t("mood." + (MOODS[c.mood] ? c.mood : 2))}</span>
                  <span className="text-bloom-muted">{t("ci.anxietyShort", { n: c.anxiety })} · {t("ci.hopeShort", { n: c.hope })}</span>
                </div>
                {(c.symptoms || []).length > 0 && <p className="text-bloom-dim mt-0.5">{c.symptoms.map(function (x) { return t("sym." + x); }).join(", ")}</p>}
              </div>
            );
          })}
        </div>

        <p className="text-bloom-dim text-xs leading-relaxed mb-4">{t("rep.disclaimer")}</p>

        <div className="no-print">
        {status && <p className="text-bloom-teal text-sm text-center font-semibold mb-3" role="status">{status}</p>}
        <button onClick={share} className="w-full py-4 rounded-2xl bg-bloom-accent text-white font-semibold mb-2">{t("rep.share")} <span className="flip-rtl">→</span></button>
        <div className="flex gap-2">
          <button onClick={function () { window.print(); }} className="flex-1 py-3.5 rounded-2xl bg-white border border-bloom-border text-bloom-text font-semibold text-sm">{t("rep.pdf")}</button>
          <button onClick={copy} className="flex-1 py-3.5 rounded-2xl bg-white border border-bloom-border text-bloom-text font-semibold text-sm">{t("rep.copy")}</button>
        </div>
        </div>
      </div>
      {scanOpen && <ScanLog user={user} onClose={function () { setScanOpen(false); }} onSaved={function () { setScanOpen(false); setScanTick(function (n) { return n + 1; }); }} />}
    </div>
  );
}
