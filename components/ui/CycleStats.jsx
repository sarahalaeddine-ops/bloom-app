"use client";
import { useState } from "react";
import { Info, ArrowUpDown } from "lucide-react";
import { Sheet } from "./Common";
import ReviewedBadge from "./Reviewed";
import { HORMONES } from "../../lib/demo-data";
import { medAdherence } from "../../lib/cycle";
import { useT } from "../../lib/i18n";

var ZONE = [17, 20]; // mm, typical lead-follicle size range when trigger is considered

// Lead follicle size by scan day, with the typical trigger zone shaded (Flo's "normal range" band).
function LeadChart({ t }) {
  var W = 320, H = 150, L = 30, R = 12, T = 10, B = 26;
  var maxDay = 10, lo = 5, hi = 22;
  function x(d) { return L + ((d - 1) / (maxDay - 1)) * (W - L - R); }
  function y(v) { return T + (1 - (v - lo) / (hi - lo)) * (H - T - B); }
  var pts = HORMONES.map(function (h) { return [x(h.day), y(h.leadFollicle)]; });
  return (
    <svg viewBox={"0 0 " + W + " " + H} className="w-full" role="img" aria-label={t("stats.chartLabel", { v: HORMONES.map(function (h) { return h.leadFollicle; }).join(", ") })}>
      <rect x={L} y={y(ZONE[1])} width={W - L - R} height={y(ZONE[0]) - y(ZONE[1])} fill="#4ABFB0" opacity="0.15" rx="4" />
      {[10, 15, 20].map(function (v) {
        return <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#E8E0DB" /><text x={L - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#7A6880">{v}</text></g>;
      })}
      <polyline points={pts.map(function (p) { return p.join(","); }).join(" ")} fill="none" stroke="#9B6DC5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(function (p, i) {
        var inZone = HORMONES[i].leadFollicle >= ZONE[0];
        return <circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill={inZone ? "#4ABFB0" : "#fff"} stroke={inZone ? "#4ABFB0" : "#9B6DC5"} strokeWidth="2" />;
      })}
      {[1, 3, 5, 7, 9].map(function (d) {
        return <text key={d} x={x(d)} y={H - 8} textAnchor="middle" fontSize="9" fill="#7A6880">{t("stats.dayShort", { n: d })}</text>;
      })}
    </svg>
  );
}

export default function CycleStats({ user }) {
  var { t } = useT();
  var [info, setInfo] = useState(null);
  var first = HORMONES[0], d5 = HORMONES[HORMONES.length - 2], last = HORMONES[HORMONES.length - 1];
  var growth = (last.leadFollicle - first.leadFollicle) / (last.day - first.day);
  var rows = [
    { id: "stimDays", v: t("stats.days", { n: user.stimDay || 7 }) },
    { id: "lead", v: last.leadFollicle + " mm", sub: t("stats.since", { n: "+" + (last.leadFollicle - d5.leadFollicle) + " mm", d: d5.day }) },
    { id: "growth", v: t("stats.perDay", { n: growth.toFixed(1) }) },
    { id: "e2", v: "×" + (last.e2 / d5.e2).toFixed(1), sub: t("stats.sinceDay", { d: d5.day }) },
    { id: "doses", v: Math.round(medAdherence() * 100) + "%" },
  ];

  return (
    <section className="mb-3">
      <h2 className="text-lg font-bold text-bloom-text mb-3">{t("stats.title")}</h2>
      <div className="bg-white rounded-3xl p-4 border border-bloom-border">
        <div className="flex items-center gap-3 rounded-2xl p-3 mb-3" style={{ backgroundColor: "#FEF6E4" }}>
          <span className="w-8 h-8 rounded-full bg-bloom-gold text-white flex items-center justify-center flex-shrink-0"><ArrowUpDown size={16} /></span>
          <p className="text-bloom-text text-sm leading-snug">{t("stats.banner")}</p>
        </div>

        <p className="text-bloom-text text-sm font-semibold mt-1">{t("stats.chartTitle")}</p>
        <LeadChart t={t} />
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-3 rounded bg-bloom-teal/20" />
          <span className="text-bloom-muted text-xs">{t("stats.zone")}</span>
        </div>

        {rows.map(function (r) {
          return (
            <div key={r.id} className="flex items-center gap-3 py-3 border-t border-bloom-border">
              <div className="flex-1">
                <p className="text-bloom-muted text-sm">{t("stats." + r.id)}</p>
                <p className="text-bloom-text text-xl"><bdi>{r.v}</bdi>{r.sub && <span className="text-bloom-dim text-xs ms-2">{r.sub}</span>}</p>
              </div>
              <button onClick={function () { setInfo(r.id); }} aria-label={t("stats.about", { x: t("stats." + r.id) })} className="text-bloom-dim p-1"><Info size={22} /></button>
            </div>
          );
        })}
      </div>

      {info && (
        <Sheet onClose={function () { setInfo(null); }}>
          <h3 className="text-lg font-bold text-bloom-text mb-2">{t("stats." + info)}</h3>
          <p className="text-bloom-muted text-sm leading-relaxed mb-4">{t("stats." + info + ".info")}</p>
          <div className="mb-4"><ReviewedBadge cat="science" tone="soft" /></div>
          <p className="text-bloom-dim text-xs mb-4">{t("ins.general")}</p>
          <button onClick={function () { setInfo(null); }} className="w-full py-3 rounded-xl bg-bloom-accent text-white font-semibold">{t("ins.gotIt")}</button>
        </Sheet>
      )}
    </section>
  );
}
