"use client";
import { useState } from "react";
import { Sheet } from "./ui/Common";
import { buildScan, saveScan } from "../lib/cycle";
import { useT } from "../lib/i18n";

// "Log a scan result": the E2 level and follicle sizes her clinic gave her. Opened from the empty
// states on Home, Charts and the Cycle Report, so a real account fills them with her own numbers.
export default function ScanLog({ user, onClose, onSaved }) {
  var { t } = useT();
  var [f, setF] = useState({ day: String(user.stimDay || 1), e2: "", lh: "", p4: "", right: "", left: "" });
  var [error, setError] = useState("");

  function set(k) { return function (e) { var v = e.target.value; setF(function (x) { return { ...x, [k]: v }; }); setError(""); }; }

  function save(e) {
    if (e) e.preventDefault();
    var r = buildScan(f);
    if (r.error) { setError(t("scan.err." + r.error)); return; }
    saveScan(r.scan);
    onSaved(r.scan);
  }

  var inputCls = "w-full bg-bloom-surface border border-bloom-border rounded-xl px-3 py-2.5 text-bloom-text text-sm outline-none focus:border-bloom-accent";
  var labelCls = "text-bloom-muted text-xs font-semibold mb-1 block";

  return (
    <Sheet onClose={onClose}>
      <form onSubmit={save}>
        <h2 className="text-lg font-bold text-bloom-text mb-1">{t("scan.title")}</h2>
        <p className="text-bloom-muted text-xs mb-4">{t("scan.sub")}</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label htmlFor="sc-day" className={labelCls}>{t("scan.day")}</label>
            <input id="sc-day" inputMode="numeric" dir="ltr" value={f.day} onChange={set("day")} className={inputCls} />
          </div>
          <div>
            <label htmlFor="sc-e2" className={labelCls}>{t("scan.e2")}</label>
            <input id="sc-e2" inputMode="decimal" dir="ltr" value={f.e2} onChange={set("e2")} placeholder="pg/mL" className={inputCls} />
          </div>
          <div>
            <label htmlFor="sc-lh" className={labelCls}>{t("scan.lh")}</label>
            <input id="sc-lh" inputMode="decimal" dir="ltr" value={f.lh} onChange={set("lh")} placeholder="IU/L" className={inputCls} />
          </div>
          <div>
            <label htmlFor="sc-p4" className={labelCls}>{t("scan.p4")}</label>
            <input id="sc-p4" inputMode="decimal" dir="ltr" value={f.p4} onChange={set("p4")} placeholder="ng/mL" className={inputCls} />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="sc-right" className={labelCls}>{t("scan.right")}</label>
          <input id="sc-right" inputMode="decimal" dir="ltr" value={f.right} onChange={set("right")} placeholder={t("scan.sizesPh")} className={inputCls} />
        </div>
        <div className="mb-3">
          <label htmlFor="sc-left" className={labelCls}>{t("scan.left")}</label>
          <input id="sc-left" inputMode="decimal" dir="ltr" value={f.left} onChange={set("left")} placeholder={t("scan.sizesPh")} className={inputCls} />
        </div>
        <p className="text-bloom-dim text-[11px] mb-3">{t("scan.hint")}</p>
        {error && <p className="text-red-500 text-xs mb-3" role="alert">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">{t("common.cancel")}</button>
          <button type="submit" className="flex-1 py-3 rounded-xl bg-bloom-accent text-white text-sm font-semibold">{t("common.save")}</button>
        </div>
      </form>
    </Sheet>
  );
}

// Empty state card used where the demo persona would show numbers.
export function ScanEmpty({ title, body, onLog }) {
  var { t } = useT();
  return (
    <div className="bg-white rounded-2xl p-5 border border-dashed border-bloom-accent/40 mb-3 text-center">
      <p className="text-bloom-text text-sm font-semibold mb-1">{title || t("scan.emptyTitle")}</p>
      <p className="text-bloom-muted text-xs leading-relaxed mb-3">{body || t("scan.emptyBody")}</p>
      {onLog && <button onClick={onLog} className="px-5 py-2.5 rounded-xl bg-bloom-accent text-white text-sm font-semibold">{t("scan.cta")}</button>}
    </div>
  );
}
