"use client";
import { useState } from "react";

// Minimal SVG line chart. series: [{ name, color, values: [number] }], labels: [string].
// One y-axis only; hover/tap a column to see its values.
export default function LineChart({ series, labels, unit = "", height = 150, yMin, yMax, fmt }) {
  var [hover, setHover] = useState(null);
  var W = 320, H = height, padL = 34, padR = 12, padT = 12, padB = 22;
  var all = series.flatMap(function (s) { return s.values; });
  var lo = yMin !== undefined ? yMin : Math.min.apply(null, all);
  var hi = yMax !== undefined ? yMax : Math.max.apply(null, all);
  if (hi === lo) hi = lo + 1;
  var n = labels.length;
  var format = fmt || function (v) { return v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v); };

  function x(i) { return padL + (n === 1 ? 0 : (i * (W - padL - padR)) / (n - 1)); }
  function y(v) { return padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB); }

  var ticks = [lo, (lo + hi) / 2, hi];

  return (
    <div className="relative">
      <svg viewBox={"0 0 " + W + " " + H} className="w-full" role="img"
        aria-label={series.map(function (s) { return s.name + ": " + s.values.join(", ") + unit; }).join("; ")}
        onMouseLeave={function () { setHover(null); }}>
        {ticks.map(function (t, i) {
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#E8E0DB" strokeWidth="1" />
              <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#7A6880">{format(Math.round(t * 10) / 10)}</text>
            </g>
          );
        })}
        {labels.map(function (l, i) {
          return <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#7A6880">{l}</text>;
        })}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="#C5B8CC" strokeWidth="1" strokeDasharray="3 3" />}
        {series.map(function (s) {
          var d = s.values.map(function (v, i) { return (i ? "L" : "M") + x(i) + " " + y(v); }).join(" ");
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {s.values.map(function (v, i) {
                return <circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 5 : 4} fill={s.color} stroke="white" strokeWidth="2" />;
              })}
            </g>
          );
        })}
        {labels.map(function (l, i) {
          var w = n === 1 ? W : (W - padL - padR) / (n - 1);
          return <rect key={i} x={x(i) - w / 2} y={0} width={w} height={H} fill="transparent"
            onMouseEnter={function () { setHover(i); }} onClick={function () { setHover(i); }} />;
        })}
      </svg>
      {hover !== null && (
        <div className="absolute top-0 pointer-events-none bg-white border border-bloom-border rounded-lg shadow-sm px-2.5 py-1.5 text-xs"
          style={{ left: Math.min(70, Math.max(0, (x(hover) / W) * 100 - 15)) + "%" }}>
          <p className="text-bloom-muted font-semibold mb-0.5">{labels[hover]}</p>
          {series.map(function (s) {
            return (
              <p key={s.name} className="text-bloom-text flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                {s.name}: <b>{s.values[hover]}{unit}</b>
              </p>
            );
          })}
        </div>
      )}
      {series.length > 1 && (
        <div className="flex gap-4 mt-1">
          {series.map(function (s) {
            return (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-bloom-muted">
                <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />{s.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
