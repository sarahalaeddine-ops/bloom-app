"use client";
import { useState } from "react";
import { Sheet, Label } from "./ui/Common";
import { useT } from "../lib/i18n";
import { saveMed, deleteMed, saveAppt, deleteAppt, MED_TYPES, APPT_KINDS, LIMITS, ymd, apptAt, daysBetween } from "../lib/schedule";
import { syncNative } from "../lib/reminders";

var inputCls = "w-full bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none focus:border-bloom-accent";
var labelCls = "text-bloom-muted text-xs font-semibold mb-1 block";

// Short weekday names in her language, Sunday first (0-6 as Date.getDay()).
export function weekdayNames(locale, style) {
  var out = [];
  var base = new Date(2026, 0, 4); // a Sunday
  for (var i = 0; i < 7; i++) {
    var d = new Date(base);
    d.setDate(base.getDate() + i);
    try { out.push(d.toLocaleDateString(locale, { weekday: style || "short" })); } catch { out.push(String(i)); }
  }
  return out;
}

function Chip({ on, onClick, children, color }) {
  var c = color || "#9B6DC5";
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className="px-3 py-2 rounded-xl border text-xs font-semibold transition-all min-h-[40px]"
      style={{ borderColor: on ? c : "#E8E0DB", backgroundColor: on ? c + "15" : "white", color: on ? c : "#7A6880" }}>
      {children}
    </button>
  );
}

function ConfirmDelete({ label, onConfirm }) {
  var { t } = useT();
  var [ask, setAsk] = useState(false);
  if (!ask) return <button type="button" onClick={function () { setAsk(true); }} className="w-full mt-3 py-3 text-bloom-rose text-sm font-semibold">{label}</button>;
  return (
    <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-center" role="alert">
      <p className="text-bloom-text text-sm mb-2">{t("sched.deleteConfirm")}</p>
      <div className="flex gap-2">
        <button type="button" onClick={function () { setAsk(false); }} className="flex-1 py-2.5 rounded-xl bg-white border border-bloom-border text-bloom-muted text-sm font-semibold">{t("common.cancel")}</button>
        <button type="button" onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-bloom-rose text-white text-sm font-semibold">{t("sched.delete")}</button>
      </div>
    </div>
  );
}

// Add or edit one of her medications. `med` null = new.
export function MedForm({ med, onClose, onSaved }) {
  var { t, locale } = useT();
  var [f, setF] = useState(function () {
    return med ? { ...med, times: med.times.slice(), days: (med.days || []).slice() }
      : { name: "", dose: "", type: "injection", times: ["20:00"], start: ymd(new Date()), end: "", days: [], notes: "" };
  });
  var [error, setError] = useState("");
  var names = weekdayNames(locale, "short");

  function set(k, v) { setF(function (x) { return { ...x, [k]: v }; }); setError(""); }
  function setTime(i, v) { var times = f.times.slice(); times[i] = v; set("times", times); }
  function toggleDay(d) { set("days", f.days.indexOf(d) === -1 ? f.days.concat(d) : f.days.filter(function (x) { return x !== d; })); }

  function save(e) {
    e.preventDefault();
    var r = saveMed(f);
    if (r.error) { setError(t("medf.err." + r.error)); return; }
    syncNative();
    onSaved(r.med);
  }

  function remove() {
    deleteMed(med.id);
    syncNative();
    onSaved(null);
  }

  return (
    <Sheet onClose={onClose}>
      <form onSubmit={save} noValidate>
        <h2 className="text-lg font-bold text-bloom-text mb-1">{med ? t("medf.edit") : t("medf.add")}</h2>
        <p className="text-bloom-muted text-xs mb-4">{t("medf.sub")}</p>

        <div className="mb-3">
          <label htmlFor="mf-name" className={labelCls}>{t("medf.name")}</label>
          <input id="mf-name" dir="auto" value={f.name} maxLength={LIMITS.name} onChange={function (e) { set("name", e.target.value); }} placeholder={t("medf.namePh")} className={inputCls} autoComplete="off" />
        </div>
        <div className="mb-3">
          <label htmlFor="mf-dose" className={labelCls}>{t("medf.dose")}</label>
          <input id="mf-dose" dir="auto" value={f.dose} maxLength={LIMITS.dose} onChange={function (e) { set("dose", e.target.value); }} placeholder={t("medf.dosePh")} className={inputCls} autoComplete="off" />
        </div>

        <Label className="mb-2">{t("medf.type")}</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {MED_TYPES.map(function (ty) {
            return <Chip key={ty} on={f.type === ty} onClick={function () { set("type", ty); }}>{t("med.type." + ty)}</Chip>;
          })}
        </div>

        <Label className="mb-2">{t("medf.times")}</Label>
        {f.times.map(function (tm, i) {
          return (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input type="time" dir="ltr" value={tm} onChange={function (e) { setTime(i, e.target.value); }} aria-label={t("medf.timeN", { n: i + 1 })} className={inputCls} />
              {f.times.length > 1 && (
                <button type="button" onClick={function () { set("times", f.times.filter(function (_, k) { return k !== i; })); }}
                  className="w-10 h-10 flex-shrink-0 rounded-xl bg-bloom-surface text-bloom-muted text-lg" aria-label={t("medf.removeTime")}>×</button>
              )}
            </div>
          );
        })}
        {f.times.length < LIMITS.times && (
          <button type="button" onClick={function () { set("times", f.times.concat("08:00")); }} className="text-bloom-accent text-xs font-semibold mb-4 py-2">+ {t("medf.addTime")}</button>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label htmlFor="mf-start" className={labelCls}>{t("medf.start")}</label>
            <input id="mf-start" type="date" dir="ltr" value={f.start} onChange={function (e) { set("start", e.target.value); }} className={inputCls} />
          </div>
          <div>
            <label htmlFor="mf-end" className={labelCls}>{t("medf.end")}</label>
            <input id="mf-end" type="date" dir="ltr" value={f.end} min={f.start || undefined} onChange={function (e) { set("end", e.target.value); }} className={inputCls} />
          </div>
        </div>
        <p className="text-bloom-dim text-[11px] mb-4">{t("medf.endHint")}</p>

        <Label className="mb-2">{t("medf.days")}</Label>
        <div className="flex flex-wrap gap-1.5 mb-1">
          <Chip on={f.days.length === 0} onClick={function () { set("days", []); }}>{t("medf.everyDay")}</Chip>
          {names.map(function (n, d) {
            return <Chip key={d} on={f.days.indexOf(d) !== -1} onClick={function () { toggleDay(d); }}>{n}</Chip>;
          })}
        </div>
        <p className="text-bloom-dim text-[11px] mb-4">{t("medf.daysHint")}</p>

        <label htmlFor="mf-notes" className={labelCls}>{t("medf.notes")}</label>
        <textarea id="mf-notes" dir="auto" value={f.notes} maxLength={LIMITS.notes} onChange={function (e) { set("notes", e.target.value); }} placeholder={t("medf.notesPh")}
          className={inputCls + " resize-none h-20 mb-3"} />

        {error && <p className="text-red-500 text-xs mb-3" role="alert">{error}</p>}
        <p className="text-bloom-dim text-[11px] mb-3">{t("medf.clinic")}</p>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">{t("common.cancel")}</button>
          <button type="submit" className="flex-[2] py-3 rounded-xl bg-bloom-accent text-white text-sm font-semibold">{t("common.save")}</button>
        </div>
        {med && <ConfirmDelete label={t("medf.delete")} onConfirm={remove} />}
      </form>
    </Sheet>
  );
}

// Add or edit one of her appointments. `appt` null = new; `clinic` pre-fills a new one.
export function ApptForm({ appt, clinic, onClose, onSaved }) {
  var { t } = useT();
  var [f, setF] = useState(function () {
    if (appt) return { ...appt };
    var d = new Date();
    d.setDate(d.getDate() + 1);
    return { kind: "scan", title: "", date: ymd(d), time: "08:00", clinic: clinic || "", notes: "" };
  });
  var [error, setError] = useState("");

  function set(k, v) { setF(function (x) { return { ...x, [k]: v }; }); setError(""); }

  function save(e) {
    e.preventDefault();
    var r = saveAppt(f);
    if (r.error) { setError(t("apptf.err." + r.error)); return; }
    syncNative();
    onSaved(r.appt);
  }

  function remove() {
    deleteAppt(appt.id);
    syncNative();
    onSaved(null);
  }

  return (
    <Sheet onClose={onClose}>
      <form onSubmit={save} noValidate>
        <h2 className="text-lg font-bold text-bloom-text mb-1">{appt ? t("apptf.edit") : t("apptf.add")}</h2>
        <p className="text-bloom-muted text-xs mb-4">{t("apptf.sub")}</p>

        <Label className="mb-2">{t("apptf.kind")}</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {APPT_KINDS.map(function (k) {
            return <Chip key={k} on={f.kind === k} onClick={function () { set("kind", k); }}>{t("appt.kind." + k)}</Chip>;
          })}
        </div>

        {f.kind === "other" && (
          <div className="mb-3">
            <label htmlFor="af-title" className={labelCls}>{t("apptf.title")}</label>
            <input id="af-title" dir="auto" value={f.title} maxLength={LIMITS.title} onChange={function (e) { set("title", e.target.value); }} placeholder={t("apptf.titlePh")} className={inputCls} autoComplete="off" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label htmlFor="af-date" className={labelCls}>{t("apptf.date")}</label>
            <input id="af-date" type="date" dir="ltr" value={f.date} onChange={function (e) { set("date", e.target.value); }} className={inputCls} />
          </div>
          <div>
            <label htmlFor="af-time" className={labelCls}>{t("apptf.time")}</label>
            <input id="af-time" type="time" dir="ltr" value={f.time} onChange={function (e) { set("time", e.target.value); }} className={inputCls} />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="af-clinic" className={labelCls}>{t("apptf.clinic")}</label>
          <input id="af-clinic" dir="auto" value={f.clinic} maxLength={LIMITS.clinic} onChange={function (e) { set("clinic", e.target.value); }} placeholder={t("prof.clinicPh")} className={inputCls} autoComplete="off" />
        </div>

        <label htmlFor="af-notes" className={labelCls}>{t("apptf.notes")}</label>
        <textarea id="af-notes" dir="auto" value={f.notes} maxLength={LIMITS.notes} onChange={function (e) { set("notes", e.target.value); }} placeholder={t("apptf.notesPh")}
          className={inputCls + " resize-none h-20 mb-3"} />

        {error && <p className="text-red-500 text-xs mb-3" role="alert">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">{t("common.cancel")}</button>
          <button type="submit" className="flex-[2] py-3 rounded-xl bg-bloom-accent text-white text-sm font-semibold">{t("common.save")}</button>
        </div>
        {appt && <ConfirmDelete label={t("apptf.delete")} onConfirm={remove} />}
      </form>
    </Sheet>
  );
}

// "Egg retrieval", or her own label for "Other".
export function apptLabel(a, t) {
  return a.kind === "other" && a.title ? a.title : t("appt.kind." + a.kind);
}

// "Today", "Tomorrow", "In 4 days" (with "~" for the demo's estimated dates).
export function relDay(a, t, now) {
  var n = daysBetween(now || new Date(), apptAt(a));
  var s = n <= 0 ? t("home.today") : n === 1 ? t("home.tomorrow") : t("appt.inDays", { n: n });
  return a.estimate ? "~ " + s : s;
}
