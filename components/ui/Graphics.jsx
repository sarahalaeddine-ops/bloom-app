"use client";
import { useId } from "react";

// Hand-drawn SVG graphics for Bloom. No image files, no extra packages.
// Colors come from the bloom palette in tailwind.config.js.
var C = {
  accent: "#9B6DC5", deep: "#7C3AED", rose: "#E07A8A", teal: "#4ABFB0",
  gold: "#C49A3C", border: "#E8E0DB", surface: "#F0EBE8", dim: "#C5B8CC", muted: "#7A6880",
};

function useSvgId(prefix) {
  return prefix + useId().replace(/[^a-zA-Z0-9]/g, "");
}

// ── Brand mark: a six-petal flower that opens on mount ────────────────────
export function BloomFlower({ size = 64, animate = true, className = "" }) {
  var g = useSvgId("petal");
  var petals = [0, 60, 120, 180, 240, 300];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.rose} stopOpacity="0.9" />
          <stop offset="100%" stopColor={C.accent} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {petals.map(function (a, i) {
        return (
          <g key={a} transform={"rotate(" + a + " 50 50)"}>
            <path d="M50 50 C 36 38, 38 14, 50 8 C 62 14, 64 38, 50 50 Z" fill={"url(#" + g + ")"} opacity={i % 2 ? 0.75 : 0.95}
              className={animate ? "petal-open" : ""} style={{ transformOrigin: "50px 50px", animationDelay: i * 90 + "ms" }} />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="7" fill={C.gold} className={animate ? "petal-open" : ""} style={{ transformOrigin: "50px 50px", animationDelay: "560ms" }} />
      <circle cx="50" cy="50" r="3" fill="#fff" opacity="0.7" />
    </svg>
  );
}

// ── Soft background blobs for hero areas ─────────────────────────────────
export function Blobs({ className = "" }) {
  return (
    <svg className={"absolute inset-0 w-full h-full pointer-events-none " + className} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="340" cy="40" r="90" fill={C.accent} opacity="0.10" className="blob-drift" />
      <circle cx="40" cy="260" r="80" fill={C.rose} opacity="0.10" className="blob-drift" style={{ animationDelay: "-3s" }} />
      <circle cx="300" cy="260" r="50" fill={C.teal} opacity="0.08" className="blob-drift" style={{ animationDelay: "-6s" }} />
    </svg>
  );
}

// ── Journey ring (Flo's cycle circle, reimagined for IVF) ────────────────
// The full ring is one IVF cycle, split into phases. A dot marks today.
export var JOURNEY = [
  { id: "stim",      label: "Stims",     days: 10, color: C.accent },
  { id: "retrieval", label: "Retrieval", days: 2,  color: C.gold },
  { id: "embryo",    label: "Embryos",   days: 5,  color: C.rose },
  { id: "tww",       label: "2WW",       days: 11, color: C.teal },
];
var JOURNEY_DAYS = JOURNEY.reduce(function (s, p) { return s + p.days; }, 0);

var PHASE_START = { stimulation: 0, retrieval: 10, transfer: 16, tww: 20, planning: 0 };

export function journeyDay(phase, stimDay) {
  if (!phase || phase === "stimulation") return Math.min(10, Math.max(1, stimDay || 1)) - 0.5;
  return (PHASE_START[phase] || 0) + 0.5;
}

export function JourneyRing({ day, size = 200, children }) {
  var r = 82, stroke = 14, circ = 2 * Math.PI * r, gapLen = 3;
  var offsets = JOURNEY.map(function (_, i) {
    return JOURNEY.slice(0, i).reduce(function (s, p) { return s + (p.days / JOURNEY_DAYS) * circ; }, 0);
  });
  var angle = (day / JOURNEY_DAYS) * 360 - 90;
  var rad = (angle * Math.PI) / 180;
  var dx = 100 + r * Math.cos(rad), dy = 100 + r * Math.sin(rad);
  var progress = (day / JOURNEY_DAYS) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        {JOURNEY.map(function (p, i) {
          var len = (p.days / JOURNEY_DAYS) * circ;
          return (
            <circle key={p.id} cx="100" cy="100" r={r} fill="none" stroke={p.color} strokeOpacity="0.28" strokeWidth={stroke}
              strokeDasharray={Math.max(0, len - gapLen) + " " + circ} strokeDashoffset={-offsets[i]} transform="rotate(-90 100 100)" />
          );
        })}
        <circle cx="100" cy="100" r={r} fill="none" stroke={C.accent} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={progress + " " + circ} transform="rotate(-90 100 100)" className="ring-draw" style={{ "--ring-len": progress }} />
        <circle cx={dx} cy={dy} r="11" fill="#fff" stroke={C.accent} strokeWidth="3" />
        <circle cx={dx} cy={dy} r="4" fill={C.accent} className="pulse-dot" style={{ transformOrigin: dx + "px " + dy + "px" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">{children}</div>
    </div>
  );
}

export function JourneyLegend() {
  return (
    <div className="flex justify-center flex-wrap gap-x-3 gap-y-1">
      {JOURNEY.map(function (p) {
        return (
          <span key={p.id} className="flex items-center gap-1 text-[11px] text-bloom-muted">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />{p.label}
          </span>
        );
      })}
    </div>
  );
}

// ── Ovary with follicles drawn to scale ──────────────────────────────────
var SLOTS = [[-40, -12], [-2, -24], [38, -12], [-20, 18], [18, 16], [52, 16], [-56, 14], [0, -2]];

export function Ovary({ sizes, color, matureMm, label, flip }) {
  var g = useSvgId("ov");
  return (
    <figure className="flex-1 min-w-0 text-center">
      <svg viewBox="-80 -55 160 110" className="w-full h-auto" role="img" aria-label={label + ": " + sizes.length + " follicles, sizes " + sizes.join(", ") + " mm"}>
        <defs>
          <radialGradient id={g} cx="45%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor={color} stopOpacity="0.18" />
          </radialGradient>
        </defs>
        <path d={flip ? "M-72 -8 C -90 -30, -100 -44, -76 -50" : "M72 -8 C 90 -30, 100 -44, 76 -50"} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="0" cy="0" rx="74" ry="44" fill={"url(#" + g + ")"} stroke={color} strokeOpacity="0.45" strokeWidth="1.5" />
        {sizes.map(function (s, i) {
          var p = SLOTS[i % SLOTS.length];
          var x = flip ? -p[0] : p[0];
          var mature = s >= matureMm;
          var rr = Math.max(7, s * 0.85);
          return (
            <g key={i} className="follicle-pop" style={{ animationDelay: i * 70 + "ms", transformOrigin: x + "px " + p[1] + "px" }}>
              <circle cx={x} cy={p[1]} r={rr} fill={mature ? color : "#fff"} fillOpacity={mature ? 0.9 : 1} stroke={color} strokeWidth="1.8" />
              <text x={x} y={p[1] + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill={mature ? "#fff" : color}>{s}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="text-xs font-semibold mt-1" style={{ color: color }}>{label} · {sizes.length}</figcaption>
    </figure>
  );
}

// ── Spot illustrations (onboarding, empty and success states) ─────────────
function Frame({ size, children, bg }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill={bg || C.accent} opacity="0.1" />
      {children}
    </svg>
  );
}

export function Illustration({ name, size = 96 }) {
  if (name === "clinic") return (
    <Frame size={size}>
      <rect x="30" y="40" width="60" height="50" rx="6" fill="#fff" stroke={C.accent} strokeWidth="2.5" />
      <path d="M26 44 L60 22 L94 44" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <rect x="52" y="52" width="16" height="16" rx="3" fill={C.rose} opacity="0.9" />
      <path d="M60 55 v10 M55 60 h10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="54" y="76" width="12" height="14" rx="2" fill={C.accent} opacity="0.3" />
      <circle cx="40" cy="60" r="3" fill={C.teal} /><circle cx="80" cy="60" r="3" fill={C.teal} />
    </Frame>
  );
  if (name === "protocol") return (
    <Frame size={size} bg={C.rose}>
      <g transform="rotate(-35 60 60)">
        <rect x="52" y="28" width="16" height="48" rx="4" fill="#fff" stroke={C.accent} strokeWidth="2.5" />
        <rect x="54" y="50" width="12" height="24" rx="2" fill={C.accent} opacity="0.35" />
        <path d="M60 76 v16" stroke={C.muted} strokeWidth="2" strokeLinecap="round" />
        <rect x="56" y="18" width="8" height="10" fill={C.accent} /><rect x="50" y="14" width="20" height="5" rx="2" fill={C.accent} />
        <path d="M68 36 h-5 M68 44 h-5 M68 52 h-5 M68 60 h-5" stroke={C.dim} strokeWidth="1.5" />
      </g>
      <rect x="78" y="62" width="16" height="24" rx="4" fill="#fff" stroke={C.rose} strokeWidth="2.5" />
      <rect x="80" y="56" width="12" height="6" rx="1.5" fill={C.rose} />
      <rect x="80" y="72" width="12" height="12" rx="2" fill={C.rose} opacity="0.3" />
    </Frame>
  );
  if (name === "phase") return (
    <Frame size={size} bg={C.teal}>
      <path d="M22 84 C 40 84, 36 56, 58 56 S 80 30, 98 34" fill="none" stroke={C.dim} strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
      <circle cx="22" cy="84" r="6" fill={C.accent} /><circle cx="58" cy="56" r="8" fill="#fff" stroke={C.teal} strokeWidth="3" />
      <circle cx="58" cy="56" r="3" fill={C.teal} />
      <path d="M98 34 v-18" stroke={C.rose} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M98 16 l14 5 l-14 5 z" fill={C.rose} />
    </Frame>
  );
  if (name === "calendar") return (
    <Frame size={size}>
      <rect x="26" y="32" width="68" height="60" rx="8" fill="#fff" stroke={C.accent} strokeWidth="2.5" />
      <path d="M26 46 h68" stroke={C.accent} strokeWidth="2.5" /><rect x="26" y="32" width="68" height="14" rx="8" fill={C.accent} opacity="0.25" />
      <path d="M42 26 v12 M78 26 v12" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
      {[0, 1, 2, 3].map(function (c) { return [0, 1, 2].map(function (r) {
        var on = c === 2 && r === 1;
        return <circle key={c + "-" + r} cx={38 + c * 15} cy={58 + r * 11} r={on ? 5 : 3} fill={on ? C.rose : C.dim} />;
      }); })}
    </Frame>
  );
  if (name === "therapy") return (
    <Frame size={size} bg={C.rose}>
      <path d="M24 38 h44 a8 8 0 0 1 8 8 v18 a8 8 0 0 1 -8 8 h-26 l-10 10 v-10 h-8 a8 8 0 0 1 -8 -8 v-18 a8 8 0 0 1 8 -8 z" fill="#fff" stroke={C.accent} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M96 54 h-14 a6 6 0 0 0 -6 6 v12 a6 6 0 0 0 6 6 h16 l8 8 v-8 a6 6 0 0 0 4 -6 v-12 a6 6 0 0 0 -6 -6 z" fill={C.teal} opacity="0.35" />
      <path d="M46 62 c-8 -6 -10 -12 -5 -14 c3 -1 5 1 5 3 c0 -2 2 -4 5 -3 c5 2 3 8 -5 14 z" fill={C.rose} />
    </Frame>
  );
  if (name === "moon") return (
    <Frame size={size}>
      <path d="M70 26 a34 34 0 1 0 22 52 a28 28 0 1 1 -22 -52 z" fill={C.accent} opacity="0.8" />
      <circle cx="30" cy="34" r="2" fill={C.gold} /><circle cx="94" cy="30" r="2.5" fill={C.gold} /><circle cx="88" cy="94" r="1.8" fill={C.gold} />
    </Frame>
  );
  if (name === "drop") return (
    <Frame size={size} bg={C.rose}>
      <path d="M60 22 C 60 22, 34 54, 34 72 a26 26 0 0 0 52 0 C 86 54, 60 22, 60 22 z" fill={C.rose} opacity="0.85" />
      <path d="M48 70 a12 12 0 0 0 10 12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    </Frame>
  );
  if (name === "heart") return (
    <Frame size={size} bg={C.teal}>
      <path d="M60 92 C 20 66, 22 34, 44 32 C 54 31, 60 40, 60 44 C 60 40, 66 31, 76 32 C 98 34, 100 66, 60 92 z" fill={C.teal} opacity="0.85" />
      <path d="M38 58 h10 l5 -8 l7 16 l5 -8 h16" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
  if (name === "egg") return (
    <Frame size={size} bg={C.gold}>
      <circle cx="60" cy="60" r="30" fill="#fff" stroke={C.gold} strokeWidth="2.5" />
      <circle cx="60" cy="60" r="20" fill={C.gold} opacity="0.18" />
      <circle cx="54" cy="56" r="7" fill={C.gold} opacity="0.7" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(function (a) {
        var r = (a * Math.PI) / 180;
        return <circle key={a} cx={60 + 38 * Math.cos(r)} cy={60 + 38 * Math.sin(r)} r="2.5" fill={C.gold} opacity="0.6" />;
      })}
    </Frame>
  );
  // "bloom" — default celebratory flower
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill={C.accent} opacity="0.1" />
      <path d="M60 104 C 60 90, 58 80, 60 70" stroke={C.teal} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 92 C 48 90, 42 82, 42 78 C 50 78, 58 84, 60 92 z" fill={C.teal} opacity="0.8" />
      <g transform="translate(20 14) scale(0.8)"><BloomPetals /></g>
      <path d="M22 28 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill={C.gold} className="twinkle" />
      <path d="M96 20 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 z" fill={C.rose} className="twinkle" style={{ animationDelay: "0.6s" }} />
      <path d="M100 76 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 z" fill={C.accent} className="twinkle" style={{ animationDelay: "1.2s" }} />
    </svg>
  );
}

function BloomPetals() {
  return (
    <g>
      {[0, 60, 120, 180, 240, 300].map(function (a, i) {
        return (
          <g key={a} transform={"rotate(" + a + " 50 50)"}>
            <path d="M50 50 C 36 38, 38 14, 50 8 C 62 14, 64 38, 50 50 Z" fill={i % 2 ? C.rose : C.accent} opacity="0.85"
              className="petal-open" style={{ transformOrigin: "50px 50px", animationDelay: i * 90 + "ms" }} />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="7" fill={C.gold} />
    </g>
  );
}
