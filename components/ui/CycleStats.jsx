"use client";
import { useState } from "react";
import { Info, ArrowUpDown } from "lucide-react";
import { Sheet } from "./Common";
import ReviewedBadge from "./Reviewed";
import { medAdherence, hormoneSeries } from "../../lib/cycle";
import { useT } from "../../lib/i18n";

var ZONE = [17, 20]; // mm, typical lead-follicle size range when trigger is considered

// Lead follicle size by scan day, with the typical trigger zone shaded (Flo's "normal range" band).
// points: her scans with a lead follicle ({ day, leadFollicle }), oldest first.
function LeadChart({ t, points }) {
  var W = 320, H = 150, L = 30, R = 12, T = 10, B = 26;
  var maxDay = Math.max(10, points[points.length - 1].day), lo = 5, hi = Math.max(22, Math.max.apply(null, points.map(function (h) { return h.leadFollicle; })) + 1);
  function x(d) { return L + ((d - 1) / (maxDay - 1)) * (W - L - R); }
  function y(v) { return T + (1 - (v - lo) / (hi - lo)) * (H - T - B); }
  var pts = points.map(function (h) { return [x(h.day), y(h.leadFollicle)]; });
  return (
    <svg viewBox={"0 0 " + W + " " + H} className="w-full" role="img" aria-label={t("stats.chartLabel", { v: points.map(function (h) { return h.leadFollicle; }).join(", ") })}>
      <rect x={L} y={y(ZONE[1])} width={W - L - R} height={y(ZONE[0]) - y(ZONE[1])} fill="#4ABFB0" opacity="0.15" rx="4" />
      {[10, 15, 20].map(function (v) {
        return <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#E8E0DB" /><text x={L - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#7A6880">{v}</text></g>;
      })}
      <polyline points={pts.map(function (p) { return p.join(","); }).join(" ")} fill="none" stroke="#9B6DC5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(function (p, i) {
        var inZone = points[i].leadFollicle >= ZONE[0];
        return <circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill={inZone ? "#4ABFB0" : "#fff"} stroke={inZone ? "#4ABFB0" : "#9B6DC5"} strokeWidth="2" />;
      })}
      {[1, 3, 5, 7, 9].concat(maxDay > 10 ? [maxDay] : []).map(function (d) {
        return <text key={d} x={x(d)} y={H - 8} textAnchor="middle" fontSize="9" fill="#7A6880">{t("stats.dayShort", { n: d })}</text>;
      })}
    </svg>
  );
}

export default function CycleStats({ user }) {
  var { t } = useT();
  var [info, setInfo] = useState(null);
  // Her own scans only (the demo persona's seeded scans for the demo, lib/cycle.js).
  var series = hormoneSeries();
  var pts = series.filter(function (h) { return h.leadFollicle != null && h.day; });
  var e2s = series.filter(function (h) { return h.e2 != null && h.day; });
  var isStim = (user.phase || "stimulation") === "stimulation";
  if (!isStim && !pts.length) return null;
  var first = pts[0], prev = pts[pts.length - 2], last = pts[pts.length - 1];
  var e2Prev = e2s[e2s.length - 2], e2Last = e2s[e2s.length - 1];
  var adherence = medAdherence();
  var rows = [];
  if (isStim && user.stimDay) rows.push({ id: "stimDays", v: t("stats.days", { n: user.stimDay }) });
  if (last) rows.push({ id: "lead", v: last.leadFollicle + " mm", sub: prev ? t("stats.since", { n: "\u2066" + (last.leadFollicle - prev.leadFollicle >= 0 ? "+" : "") + +(last.leadFollicle - prev.leadFollicle).toFixed(1) + " mm\u2069", d: prev.day }) : null });
  if (last && first && last.day > first.day) rows.push({ id: "growth", v: t("stats.perDay", { n: ((last.leadFollicle - first.leadFollicle) / (last.day - first.day)).toFixed(1) }) });
  if (e2Prev && e2Last && e2Prev.e2 > 0) rows.push({ id: "e2", v: "×" + (e2Last.e2 / e2Prev.e2).toFixed(1), sub: t("stats.sinceDay", { d: e2Prev.day }) });
  if (adherence !== null) rows.push({ id: "doses", v: Math.round(adherence * 100) + "%" });

  return (
    <section className="mb-3">
      <h2 className="text-lg font-bold text-bloom-text mb-3">{t("stats.title")}</h2>
      <div className="bg-white rounded-3xl p-4 border border-bloom-border">
        <div className="flex items-center gap-3 rounded-2xl p-3 mb-3" style={{ backgroundColor: "#FEF6E4" }}>
          <span className="w-8 h-8 rounded-full bg-bloom-gold text-white flex items-center justify-center flex-shrink-0"><ArrowUpDown size={16} /></span>
          <p className="text-bloom-text text-sm leading-snug">{t("stats.banner")}</p>
        </div>

        {pts.length > 0 ? (
          <>
            <p className="text-bloom-text text-sm font-semibold mt-1">{t("stats.chartTitle")}</p>
            <LeadChart t={t} points={pts} />
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-3 rounded bg-bloom-teal/20" />
              <span className="text-bloom-muted text-xs">{t("stats.zone")}</span>
            </div>
          </>
        ) : (
          <p className="text-bloom-muted text-sm py-3">{t("stats.empty")}</p>
        )}

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
