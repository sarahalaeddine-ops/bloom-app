"use client";
import { useId } from "react";
import { useT } from "../../lib/i18n";

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
  var { t } = useT();
  return (
    <div className="flex justify-center flex-wrap gap-x-3 gap-y-1">
      {JOURNEY.map(function (p) {
        return (
          <span key={p.id} className="flex items-center gap-1 text-[11px] text-bloom-muted">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />{t("journey." + p.id)}
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

function BaseIllustration({ name, size }) {
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

// ── Mood faces (replace emoji in check-in and quick log) ─────────────────
var MOUTHS = [
  "M-9 9 Q 0 2, 9 9",   // hard
  "M-8 8 Q 0 4, 8 8",   // low
  "M-8 6 L 8 6",        // okay
  "M-8 4 Q 0 10, 8 4",  // hopeful
  "M-10 3 Q 0 14, 10 3", // good
];
export function MoodFace({ mood, color, size = 36, active = true }) {
  var fill = active ? color : C.dim;
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" aria-hidden="true">
      <circle r="18" fill={fill} opacity={active ? 0.18 : 0.25} />
      <circle r="18" fill="none" stroke={fill} strokeWidth="1.5" opacity="0.6" />
      {mood === 0 ? (
        <>
          <path d="M-9 -4 q3 -3 6 0 M3 -4 q3 -3 6 0" stroke={fill} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-7 1 q-1.5 3 0 4 q1.5 -1 0 -4 z" fill="#7FB8E0" />
        </>
      ) : (
        <>
          <circle cx="-6" cy="-4" r="2" fill={fill} /><circle cx="6" cy="-4" r="2" fill={fill} />
        </>
      )}
      <path d={MOUTHS[mood] || MOUTHS[2]} stroke={fill} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {mood === 4 && <><circle cx="-11" cy="3" r="2.5" fill={C.rose} opacity="0.35" /><circle cx="11" cy="3" r="2.5" fill={C.rose} opacity="0.35" /></>}
      {mood === 3 && <path d="M0 -18 q -5 -6 0 -9 q 5 3 0 9" fill={C.teal} />}
    </svg>
  );
}

// ── Petal burst: small celebration when a dose or check-in is saved ──────
export function PetalBurst({ show }) {
  if (!show) return null;
  var colors = [C.accent, C.rose, C.gold, C.teal];
  return (
    <div className="fixed inset-0 pointer-events-none z-[90] flex items-center justify-center" aria-hidden="true">
      {Array.from({ length: 14 }, function (_, i) {
        var a = (i / 14) * Math.PI * 2;
        var d = 90 + (i % 3) * 30;
        return (
          <span key={i} className="petal-burst absolute w-3 h-4 rounded-full"
            style={{ backgroundColor: colors[i % 4], "--dx": Math.round(Math.cos(a) * d) + "px", "--dy": Math.round(Math.sin(a) * d) + "px", "--rot": i * 47 + "deg", animationDelay: (i % 4) * 30 + "ms" }} />
        );
      })}
    </div>
  );
}

// ── Streak flower: one petal per check-in day this week (max 7) ──────────
export function StreakFlower({ days, size = 72 }) {
  var n = Math.max(0, Math.min(7, days));
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={n + " of 7 petals"}>
      <path d="M50 96 C 50 84, 49 76, 50 64" stroke={C.teal} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M50 84 C 40 82, 36 76, 36 72 C 43 72, 49 77, 50 84 z" fill={C.teal} opacity="0.7" />
      {Array.from({ length: 7 }, function (_, i) {
        var a = (i / 7) * 360;
        var on = i < n;
        return (
          <g key={i} transform={"rotate(" + a + " 50 40)"}>
            <ellipse cx="50" cy="22" rx="8" ry="15" fill={on ? (i % 2 ? C.rose : C.accent) : C.border} opacity={on ? 0.9 : 0.8}
              className={on ? "petal-open" : ""} style={{ transformOrigin: "50px 40px", animationDelay: i * 80 + "ms" }} />
          </g>
        );
      })}
      <circle cx="50" cy="40" r="8" fill={n ? C.gold : C.dim} />
    </svg>
  );
}

// ── Donut for adherence and progress stats ───────────────────────────────
export function Donut({ value, size = 72, color = C.teal, label }) {
  var r = 30, circ = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={(label || "Progress") + " " + Math.round(v * 100) + "%"}>
        <circle cx="40" cy="40" r={r} fill="none" stroke={C.border} strokeWidth="9" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={v * circ + " " + circ} transform="rotate(-90 40 40)" className="ring-draw" style={{ "--ring-len": v * circ }} />
      </svg>
      <span className={"absolute inset-0 flex items-center justify-center font-bold " + (size < 64 ? "text-[11px]" : "text-sm")} style={{ color: color }}>{Math.round(v * 100)}%</span>
    </div>
  );
}

// ── Extra spot illustrations ─────────────────────────────────────────────
export function Illustration({ name, size = 96 }) {
  if (name === "shield") return (
    <Frame size={size} bg={C.teal}>
      <path d="M60 20 L90 32 V58 C 90 78, 76 92, 60 100 C 44 92, 30 78, 30 58 V32 Z" fill="#fff" stroke={C.teal} strokeWidth="3" strokeLinejoin="round" />
      <path d="M60 30 L82 39 V58 C 82 73, 72 84, 60 90 Z" fill={C.teal} opacity="0.2" />
      <rect x="49" y="56" width="22" height="18" rx="3" fill={C.accent} />
      <path d="M53 56 v-5 a7 7 0 0 1 14 0 v5" fill="none" stroke={C.accent} strokeWidth="3" />
      <circle cx="60" cy="64" r="2.5" fill="#fff" />
    </Frame>
  );
  if (name === "bell") return (
    <Frame size={size} bg={C.gold}>
      <path d="M60 26 c-14 0 -24 11 -24 26 v16 l-8 10 h64 l-8 -10 v-16 c0 -15 -10 -26 -24 -26 z" fill="#fff" stroke={C.accent} strokeWidth="3" strokeLinejoin="round" />
      <path d="M52 82 a8 8 0 0 0 16 0" fill={C.accent} />
      <circle cx="60" cy="24" r="4" fill={C.accent} />
      <path d="M86 34 q8 8 8 20 M34 34 q-8 8 -8 20" stroke={C.gold} strokeWidth="3" fill="none" strokeLinecap="round" className="twinkle" />
    </Frame>
  );
  if (name === "report") return (
    <Frame size={size}>
      <rect x="32" y="24" width="56" height="72" rx="7" fill="#fff" stroke={C.accent} strokeWidth="2.5" />
      <rect x="48" y="18" width="24" height="12" rx="4" fill={C.accent} />
      <path d="M40 72 l10 -12 l10 6 l12 -16" stroke={C.rose} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 44 h24 M40 50 h16 M40 84 h40" stroke={C.dim} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="84" cy="84" r="11" fill={C.teal} /><path d="M79 84 l4 4 l7 -8" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
  if (name === "chart") return (
    <Frame size={size} bg={C.rose}>
      <rect x="24" y="28" width="72" height="60" rx="8" fill="#fff" stroke={C.rose} strokeWidth="2.5" />
      <path d="M32 78 h56 M32 40 v38" stroke={C.dim} strokeWidth="2" strokeLinecap="round" />
      <rect x="32" y="48" width="56" height="10" fill={C.teal} opacity="0.15" />
      <path d="M36 74 q10 -2 16 -10 t16 -10 t16 -14" stroke={C.rose} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="84" cy="40" r="4" fill={C.teal} />
    </Frame>
  );
  if (name === "journal") return (
    <Frame size={size} bg="#8B7AC5">
      <rect x="34" y="24" width="50" height="70" rx="6" fill="#8B7AC5" />
      <rect x="40" y="24" width="44" height="70" rx="4" fill="#fff" stroke="#8B7AC5" strokeWidth="2" />
      <path d="M48 40 h28 M48 48 h22 M48 56 h26" stroke={C.dim} strokeWidth="2" strokeLinecap="round" />
      <rect x="64" y="64" width="22" height="18" rx="3" fill={C.accent} />
      <path d="M68 64 v-5 a7 7 0 0 1 14 0 v5" fill="none" stroke={C.accent} strokeWidth="3" />
      <circle cx="75" cy="72" r="2.5" fill="#fff" />
    </Frame>
  );
  if (name === "scan") return (
    <Frame size={size}>
      <rect x="26" y="30" width="68" height="50" rx="8" fill="#fff" stroke={C.accent} strokeWidth="2.5" />
      <path d="M36 70 a24 24 0 0 1 48 0 z" fill={C.accent} opacity="0.12" />
      <circle cx="52" cy="60" r="6" fill="none" stroke={C.accent} strokeWidth="2" /><circle cx="66" cy="56" r="8" fill="none" stroke={C.rose} strokeWidth="2" /><circle cx="74" cy="66" r="4" fill="none" stroke={C.accent} strokeWidth="2" />
      <rect x="50" y="80" width="20" height="8" fill={C.accent} opacity="0.5" /><rect x="42" y="88" width="36" height="4" rx="2" fill={C.accent} />
    </Frame>
  );
  if (name === "phone") return (
    <Frame size={size} bg={C.rose}>
      <rect x="42" y="22" width="36" height="72" rx="8" fill="#fff" stroke={C.rose} strokeWidth="2.5" />
      <rect x="54" y="27" width="12" height="3" rx="1.5" fill={C.dim} />
      <circle cx="60" cy="54" r="10" fill={C.rose} opacity="0.85" />
      <path d="M55 52 q2 6 8 8 l2 -2 l3 2 l-2 3 q-10 -2 -13 -12 l3 -2 l2 3 z" fill="#fff" />
      <path d="M84 36 q6 6 0 12 M90 30 q12 12 0 24" stroke={C.rose} strokeWidth="2.5" fill="none" strokeLinecap="round" className="twinkle" />
    </Frame>
  );
  if (name === "lab") return (
    <Frame size={size} bg={C.teal}>
      <rect x="44" y="24" width="14" height="60" rx="7" fill="#fff" stroke={C.teal} strokeWidth="2.5" />
      <rect x="46" y="58" width="10" height="24" rx="5" fill={C.rose} opacity="0.8" />
      <rect x="64" y="34" width="14" height="50" rx="7" fill="#fff" stroke={C.teal} strokeWidth="2.5" />
      <rect x="66" y="62" width="10" height="20" rx="5" fill={C.gold} opacity="0.8" />
      <path d="M36 88 h52" stroke={C.teal} strokeWidth="3" strokeLinecap="round" />
      <path d="M90 30 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill={C.gold} className="twinkle" />
    </Frame>
  );
  if (name === "community") return (
    <Frame size={size}>
      <circle cx="40" cy="58" r="9" fill={C.teal} opacity="0.85" /><path d="M26 86 a14 13 0 0 1 28 0 z" fill={C.teal} opacity="0.55" />
      <circle cx="80" cy="58" r="9" fill={C.rose} opacity="0.85" /><path d="M66 86 a14 13 0 0 1 28 0 z" fill={C.rose} opacity="0.55" />
      <circle cx="60" cy="50" r="11" fill={C.accent} /><path d="M43 86 a17 16 0 0 1 34 0 z" fill={C.accent} opacity="0.8" />
      <path d="M70 20 h26 a6 6 0 0 1 6 6 v10 a6 6 0 0 1 -6 6 h-14 l-6 6 v-6 h-6 a6 6 0 0 1 -6 -6 v-10 a6 6 0 0 1 6 -6 z" fill="#fff" stroke={C.accent} strokeWidth="2" />
      <path d="M80 29 c-3 -3 -7 0 -4 3 l4 4 l4 -4 c3 -3 -1 -6 -4 -3 z" fill={C.rose} />
      <path d="M18 30 h20 a5 5 0 0 1 5 5 v6 a5 5 0 0 1 -5 5 h-12 l-5 5 v-5 h-3 a5 5 0 0 1 -5 -5 v-6 a5 5 0 0 1 5 -5 z" fill="#fff" stroke={C.teal} strokeWidth="2" />
      <circle cx="24" cy="38" r="1.6" fill={C.teal} /><circle cx="30" cy="38" r="1.6" fill={C.teal} /><circle cx="36" cy="38" r="1.6" fill={C.teal} />
    </Frame>
  );
  if (name === "rainbow") return (
    <Frame size={size} bg="#5BADD4">
      <path d="M26 74 a34 34 0 0 1 68 0" stroke={C.rose} strokeWidth="5" fill="none" opacity="0.7" />
      <path d="M33 74 a27 27 0 0 1 54 0" stroke={C.gold} strokeWidth="5" fill="none" opacity="0.7" />
      <path d="M40 74 a20 20 0 0 1 40 0" stroke={C.teal} strokeWidth="5" fill="none" opacity="0.7" />
      <path d="M22 44 a9 9 0 0 1 15 -7 a11 11 0 0 1 20 5 a7 7 0 0 1 -1 14 h-30 a6 6 0 0 1 -4 -12 z" fill="#fff" stroke="#9CC9E3" strokeWidth="1.5" />
      <path d="M30 60 l-2 6 M40 60 l-2 6 M50 60 l-2 6" stroke="#5BADD4" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 94 v-14" stroke={C.teal} strokeWidth="3" strokeLinecap="round" />
      <path d="M60 84 q-10 -2 -10 -10 q10 0 10 10 z M60 82 q10 -2 10 -10 q-10 0 -10 10 z" fill={C.teal} />
    </Frame>
  );
  if (name === "pill") return (
    <Frame size={size}>
      <g transform="rotate(-35 50 60)">
        <rect x="38" y="30" width="18" height="52" rx="4" fill="#fff" stroke={C.accent} strokeWidth="2.5" />
        <rect x="41" y="52" width="12" height="26" rx="2" fill={C.accent} opacity="0.35" />
        <rect x="42" y="20" width="10" height="10" rx="2" fill={C.accent} />
        <path d="M47 82 v10" stroke={C.muted} strokeWidth="2" strokeLinecap="round" />
      </g>
      <g transform="rotate(30 82 70)"><rect x="70" y="64" width="26" height="12" rx="6" fill={C.rose} /><rect x="83" y="64" width="13" height="12" rx="6" fill="#fff" stroke={C.rose} strokeWidth="2" /></g>
      <circle cx="76" cy="40" r="6" fill={C.gold} /><path d="M72 40 h8" stroke="#fff" strokeWidth="1.5" />
    </Frame>
  );
  if (name === "baby") return (
    <Frame size={size} bg={C.rose}>
      <circle cx="60" cy="60" r="30" fill="#fff" stroke={C.rose} strokeWidth="2.5" />
      <path d="M52 72 c-10 -4 -10 -20 2 -22 c2 -8 14 -8 16 0 c6 2 6 10 0 12 c-2 8 -10 12 -18 10 z" fill={C.rose} opacity="0.75" />
      <circle cx="66" cy="50" r="7" fill={C.rose} />
      <path d="M60 22 c-4 -4 -9 -2 -7 2 c1 2 7 6 7 6 c0 0 6 -4 7 -6 c2 -4 -3 -6 -7 -2 z" fill={C.rose} className="heartbeat" style={{ transformOrigin: "60px 26px" }} />
    </Frame>
  );
  if (name === "hourglass") return (
    <Frame size={size} bg={C.teal}>
      <path d="M40 24 h40 M40 96 h40" stroke={C.teal} strokeWidth="4" strokeLinecap="round" />
      <path d="M44 24 q0 22 16 36 q16 -14 16 -36 z" fill="#fff" stroke={C.teal} strokeWidth="2.5" />
      <path d="M44 96 q0 -22 16 -36 q16 14 16 36 z" fill="#fff" stroke={C.teal} strokeWidth="2.5" />
      <path d="M52 36 q8 10 16 0 z" fill={C.gold} /><path d="M50 94 q10 -14 20 0 z" fill={C.gold} />
      <path d="M60 60 v24" stroke={C.gold} strokeWidth="1.6" strokeDasharray="2 3" />
      <path d="M92 36 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill={C.accent} className="twinkle" />
    </Frame>
  );
  if (name === "crown") return (
    <Frame size={size} bg={C.gold}>
      <path d="M30 76 l-4 -34 l18 14 l16 -24 l16 24 l18 -14 l-4 34 z" fill={C.gold} stroke="#A57E28" strokeWidth="2" strokeLinejoin="round" />
      <rect x="30" y="76" width="60" height="10" rx="3" fill={C.accent} />
      <circle cx="60" cy="62" r="5" fill={C.rose} /><circle cx="44" cy="66" r="3.5" fill="#fff" /><circle cx="76" cy="66" r="3.5" fill="#fff" />
      <path d="M96 26 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill={C.accent} className="twinkle" />
      <path d="M22 28 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 z" fill={C.rose} className="twinkle" style={{ animationDelay: "0.7s" }} />
    </Frame>
  );
  if (name === "menu") return (
    <Frame size={size}>
      {[[30, 30, C.accent], [64, 30, C.rose], [30, 64, C.teal], [64, 64, C.gold]].map(function (b, i) {
        return <rect key={i} x={b[0]} y={b[1]} width="26" height="26" rx="8" fill={b[2]} opacity={0.85 - i * 0.1} />;
      })}
      <path d="M43 38 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 z" fill="#fff" />
      <path d="M77 36 c-3 -3 -7 0 -4 3 l4 4 l4 -4 c3 -3 -1 -6 -4 -3 z" fill="#fff" />
    </Frame>
  );
  if (name === "embryo") return (
    <Frame size={size} bg={C.accent}>
      <circle cx="60" cy="60" r="32" fill="#fff" stroke={C.accent} strokeWidth="2.5" />
      {[[50, 50], [70, 50], [50, 70], [70, 70]].map(function (p, i) {
        return <circle key={i} cx={p[0]} cy={p[1]} r="11" fill={i % 2 ? C.rose : C.accent} opacity="0.55" />;
      })}
    </Frame>
  );
  if (name === "plate") return (
    <Frame size={size} bg={C.gold}>
      <circle cx="60" cy="62" r="32" fill="#fff" stroke={C.gold} strokeWidth="2.5" />
      <circle cx="60" cy="62" r="22" fill="none" stroke={C.border} strokeWidth="2" />
      <path d="M48 56 q6 -12 14 -2 q-6 8 -14 2 z" fill={C.teal} />
      <circle cx="68" cy="68" r="6" fill={C.rose} /><circle cx="54" cy="70" r="4" fill={C.gold} />
      <path d="M22 40 v44 M18 40 v10 a4 4 0 0 0 8 0 v-10" stroke={C.muted} strokeWidth="2" fill="none" strokeLinecap="round" />
    </Frame>
  );
  if (name === "leaf") return (
    <Frame size={size} bg={C.teal}>
      <circle cx="60" cy="34" r="7" fill={C.accent} />
      <path d="M60 42 v26 M60 50 l-18 -8 M60 50 l18 -8 M60 68 l-14 20 M60 68 l14 20" stroke={C.accent} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M24 96 C 40 86, 80 86, 96 96" stroke={C.teal} strokeWidth="3" fill="none" strokeLinecap="round" />
    </Frame>
  );
  if (name === "couple") return (
    <Frame size={size} bg={C.rose}>
      <circle cx="46" cy="44" r="10" fill={C.accent} opacity="0.85" /><circle cx="74" cy="44" r="10" fill={C.rose} opacity="0.85" />
      <path d="M30 86 a16 18 0 0 1 32 0 z" fill={C.accent} opacity="0.5" /><path d="M58 86 a16 18 0 0 1 32 0 z" fill={C.rose} opacity="0.5" />
      <path d="M60 30 c-4 -4 -9 -2 -7 2 c1 2 7 6 7 6 c0 0 6 -4 7 -6 c2 -4 -3 -6 -7 -2 z" fill={C.rose} />
    </Frame>
  );
  return <BaseIllustration name={name} size={size} />;
}

// ── Feeling faces (logging chips) ────────────────────────────────────────
var FACE = { fill: "#F7C27B", ink: "#7A4A1E" };
function Eyes({ type }) {
  var k = FACE.ink;
  if (type === "closed") return <path d="M-9 -3 q3 3 6 0 M3 -3 q3 3 6 0" stroke={k} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
  if (type === "sadClosed") return <path d="M-9 -1 q3 -3 6 0 M3 -1 q3 -3 6 0" stroke={k} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
  if (type === "wide") return <><circle cx="-6" cy="-3" r="3.4" fill="#fff" stroke={k} strokeWidth="1.2" /><circle cx="6" cy="-3" r="3.4" fill="#fff" stroke={k} strokeWidth="1.2" /><circle cx="-6" cy="-3" r="1.4" fill={k} /><circle cx="6" cy="-3" r="1.4" fill={k} /></>;
  if (type === "line") return <path d="M-9 -3 h5 M4 -3 h5" stroke={k} strokeWidth="1.8" strokeLinecap="round" />;
  if (type === "down") return <><circle cx="-6" cy="0" r="1.8" fill={k} /><circle cx="6" cy="0" r="1.8" fill={k} /></>;
  if (type === "side") return <><circle cx="-4" cy="-3" r="1.8" fill={k} /><circle cx="8" cy="-3" r="1.8" fill={k} /><path d="M-9 -7 h6 M3 -7 h6" stroke={k} strokeWidth="1.4" strokeLinecap="round" /></>;
  return <><circle cx="-6" cy="-3" r="1.9" fill={k} /><circle cx="6" cy="-3" r="1.9" fill={k} /></>;
}
var FEELING_ART = {
  calm:        { eyes: "closed", mouth: "M-6 6 q6 5 12 0" },
  hopeful:     { eyes: "dot", mouth: "M-6 5 q6 6 12 0", extra: "sprout" },
  grateful:    { eyes: "closed", mouth: "M-7 5 q7 7 14 0", extra: "heart" },
  happy:       { eyes: "dot", mouth: "M-8 4 q8 11 16 0 z", filled: true },
  anxious:     { eyes: "dot", mouth: "M-7 8 q2 -3 4 0 q2 3 4 0 q2 -3 4 0", extra: "sweat" },
  scared:      { eyes: "wide", mouth: "M-3 8 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0", filled: true },
  overwhelmed: { eyes: "line", mouth: "M-6 8 q2 -2 4 0 q2 2 4 0 q2 -2 4 0", extra: "cloud" },
  sad:         { eyes: "dot", mouth: "M-6 9 q6 -6 12 0", extra: "tear", brows: "M-10 -8 l5 -2 M10 -8 l-5 -2" },
  irritable:   { eyes: "dot", mouth: "M-6 9 q6 -5 12 0", brows: "M-10 -9 l6 3 M10 -9 l-6 3" },
  numb:        { eyes: "line", mouth: "M-6 7 h12" },
  guilty:      { eyes: "sadClosed", mouth: "M-4 8 q4 -3 8 0", extra: "sweat" },
  envious:     { eyes: "side", mouth: "M-5 8 l10 -2" },
  lonely:      { eyes: "sadClosed", mouth: "M-5 8 h10", extra: "tear" },
};
export function FeelingFace({ id, size = 28 }) {
  var a = FEELING_ART[id] || FEELING_ART.calm;
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" aria-hidden="true">
      <circle r="17" fill={FACE.fill} />
      <Eyes type={a.eyes} />
      {a.brows && <path d={a.brows} stroke={FACE.ink} strokeWidth="1.6" strokeLinecap="round" />}
      <path d={a.mouth} stroke={FACE.ink} strokeWidth="1.9" fill={a.filled ? FACE.ink : "none"} strokeLinecap="round" strokeLinejoin="round" />
      {a.extra === "sweat" && <path d="M11 -12 q-3 4 0 6 q3 -2 0 -6 z" fill="#7FB8E0" />}
      {a.extra === "tear" && <path d="M-7 1 q-2 4 0 5 q2 -1 0 -5 z" fill="#7FB8E0" />}
      {a.extra === "heart" && <path d="M11 -15 c-2 -2 -5 0 -3 2 l3 3 l3 -3 c2 -2 -1 -4 -3 -2 z" fill={C.rose} />}
      {a.extra === "sprout" && <path d="M0 -17 q -5 -5 0 -8 q 5 3 0 8" fill={C.teal} />}
      {a.extra === "cloud" && <path d="M-4 -15 a4 4 0 0 1 7 -3 a3.5 3.5 0 0 1 6 3 a3 3 0 0 1 -1 5 h-11 a3 3 0 0 1 -1 -5 z" fill="#fff" stroke={C.dim} strokeWidth="0.8" />}
    </svg>
  );
}

// ── Symptom icons (logging chips) ────────────────────────────────────────
function Target({ x, y }) {
  return <g><circle cx={x} cy={y} r="3.6" fill="#fff" stroke={C.rose} strokeWidth="1.6" /><circle cx={x} cy={y} r="1.3" fill={C.rose} /></g>;
}
export function SymptomIcon({ name, size = 28 }) {
  var a = C.accent, r = C.rose;
  var g;
  switch (name) {
    case "Feeling fine": g = <path d="M10 22 v-8 h3 l4 -6 c2 0 2 2 1.5 4 h5 c1.5 0 2 1.5 1.5 3 l-2 6 c-.4 1 -1 1.5 -2 1.5 h-8 z M7 14 h2.5 v8 h-2.5 z" fill={a} />; break;
    case "Bloating": g = <><path d="M9 7 c-2 6 -3 12 1 18 M23 7 c2 6 3 12 -1 18" stroke={a} strokeWidth="1.8" fill="none" strokeLinecap="round" /><ellipse cx="16" cy="17" rx="6.5" ry="6" fill={r} opacity="0.75" /><circle cx="16" cy="18" r="1" fill="#fff" /></>; break;
    case "Cramping": g = <><path d="M9 11 q7 -4 14 0 q-2 3 -4 3 v6 q-3 3 -6 0 v-6 q-2 0 -4 -3 z" fill={a} opacity="0.85" /><Target x={16} y={16} /></>; break;
    case "Pelvic pressure": g = <><path d="M9 9 q7 -4 14 0 q-2 3 -4 3 v5 q-3 3 -6 0 v-5 q-2 0 -4 -3 z" fill={a} opacity="0.85" /><path d="M16 21 v5 m-3 -3 l3 3 l3 -3" stroke={r} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>; break;
    case "Breast tenderness": g = <><path d="M6 13 q5 9 10 0 q5 9 10 0" stroke={a} strokeWidth="2" fill="none" strokeLinecap="round" /><Target x={11} y={16} /></>; break;
    case "Back pain": g = <><g fill={a}>{[7, 11, 15, 19, 23].map(function (y) { return <rect key={y} x="13" y={y} width="6" height="3" rx="1.5" />; })}</g><Target x={21} y={17} /></>; break;
    case "Headache": g = <><circle cx="15" cy="15" r="7" fill={a} opacity="0.85" /><path d="M11 24 q4 -3 8 0" stroke={a} strokeWidth="2" fill="none" /><Target x={20} y={11} /></>; break;
    case "Nausea": g = <><circle cx="16" cy="16" r="8" fill="#9FD9C9" /><path d="M16 16 m-3 0 a3 3 0 1 1 3 3 a5 5 0 1 1 5 -5" stroke="#2E8C80" strokeWidth="1.5" fill="none" strokeLinecap="round" /></>; break;
    case "Fatigue": g = <><rect x="7" y="11" width="16" height="10" rx="2.5" fill="#fff" stroke={a} strokeWidth="1.8" /><rect x="23.5" y="14" width="2" height="4" rx="1" fill={a} /><rect x="9" y="13" width="4" height="6" rx="1" fill={r} /></>; break;
    case "Hot flashes": g = <path d="M16 6 c1 5 7 7 7 13 a7 7 0 0 1 -14 0 c0 -3 2 -5 3 -6 c0 2 1 4 3 4 c-1 -4 0 -8 1 -11 z" fill={r} />; break;
    case "Spotting": g = <><path d="M13 8 q-5 7 -5 10 a5 5 0 0 0 10 0 q0 -3 -5 -10 z" fill={r} /><circle cx="22" cy="20" r="2.2" fill={r} opacity="0.7" /></>; break;
    case "Insomnia": g = <><path d="M19 7 a9 9 0 1 0 6 14 a7 7 0 1 1 -6 -14 z" fill={a} /><path d="M20 10 h4 l-4 4 h4" stroke={C.gold} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>; break;
    case "Brain fog": g = <><circle cx="14" cy="17" r="7" fill={a} opacity="0.85" /><path d="M13 12 a4 4 0 0 1 7 -3 a3.5 3.5 0 0 1 6 3 a3 3 0 0 1 -1 5 h-11 a3 3 0 0 1 -1 -5 z" fill="#fff" stroke={C.dim} strokeWidth="0.8" /></>; break;
    case "Mood swings": g = <path d="M6 18 q3 -8 6 0 t6 0 t6 0" stroke={a} strokeWidth="2.2" fill="none" strokeLinecap="round" />; break;
    case "Injection site pain": g = <><g transform="rotate(-40 16 16)"><rect x="13" y="7" width="6" height="14" rx="1.5" fill="#fff" stroke={a} strokeWidth="1.6" /><rect x="14" y="13" width="4" height="7" fill={a} opacity="0.4" /><path d="M16 21 v5 M13 5 h6 M16 5 v2" stroke={a} strokeWidth="1.6" strokeLinecap="round" /></g><Target x={23} y={23} /></>; break;
    case "Bruising": g = <><ellipse cx="16" cy="17" rx="8" ry="6" fill="#B39DDB" opacity="0.6" /><ellipse cx="15" cy="17" rx="4.5" ry="3.5" fill="#7E57C2" opacity="0.7" /><circle cx="18" cy="15" r="1" fill="#fff" /></>; break;
    default: g = <circle cx="16" cy="16" r="5" fill={a} />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#EADFF5" />
      {g}
    </svg>
  );
}

// ── Phase icons for the journey picker: a progress ring around a glyph ──
var PHASE_GLYPH = {
  planning:    <g><rect x="-9" y="-7" width="18" height="16" rx="3" fill="#fff" stroke={C.accent} strokeWidth="2" /><path d="M-9 -2 h18 M-5 -10 v5 M5 -10 v5" stroke={C.accent} strokeWidth="2" strokeLinecap="round" /><circle cx="2" cy="4" r="2" fill={C.rose} /></g>,
  stimulation: <g transform="rotate(-40)"><rect x="-3.5" y="-10" width="7" height="16" rx="2" fill="#fff" stroke={C.accent} strokeWidth="2" /><rect x="-2" y="-3" width="4" height="8" fill={C.rose} opacity="0.6" /><path d="M0 6 v6 M-4 -12 h8 M0 -12 v2" stroke={C.accent} strokeWidth="2" strokeLinecap="round" /></g>,
  retrieval:   <g><circle r="9" fill="#fff" stroke={C.gold} strokeWidth="2" /><circle cx="-2" cy="-2" r="4" fill={C.gold} opacity="0.7" /></g>,
  transfer:    <g><circle r="10" fill="#fff" stroke={C.accent} strokeWidth="2" />{[[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]].map(function (p, i) { return <circle key={i} cx={p[0]} cy={p[1]} r="3.6" fill={i % 2 ? C.rose : C.accent} opacity="0.7" />; })}</g>,
  tww:         <g><path d="M-7 -10 h14 M-7 10 h14 M-6 -10 q0 8 6 10 q6 -2 6 -10 M-6 10 q0 -8 6 -10 q6 2 6 10" stroke={C.teal} strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M-3 7 q3 -3 6 0 z" fill={C.teal} /></g>,
  pregnant:    <path d="M0 9 C -12 1, -10 -9, -4 -9 C -1 -9, 0 -6, 0 -5 C 0 -6, 1 -9, 4 -9 C 10 -9, 12 1, 0 9 z" fill={C.rose} />,
};
var PHASE_PROGRESS = { planning: 0.1, stimulation: 0.35, retrieval: 0.5, transfer: 0.65, tww: 0.85, pregnant: 1 };

export function PhaseIcon({ phase, size = 64 }) {
  var r = 26, circ = 2 * Math.PI * r, v = PHASE_PROGRESS[phase] || 0.2;
  var ang = v * 2 * Math.PI - Math.PI / 2;
  return (
    <svg width={size} height={size} viewBox="-32 -32 64 64" aria-hidden="true">
      <circle r="31" fill={C.accent} opacity="0.08" />
      <circle r={r} fill="none" stroke={C.border} strokeWidth="3" />
      <circle r={r} fill="none" stroke={C.rose} strokeWidth="3" strokeLinecap="round" strokeDasharray={v * circ + " " + circ} transform="rotate(-90)" />
      <circle cx={r * Math.cos(ang)} cy={r * Math.sin(ang)} r="4" fill={C.teal} stroke="#fff" strokeWidth="1.5" />
      {PHASE_GLYPH[phase]}
    </svg>
  );
}

// ── Wellbeing scenes (16:10 thumbnails for Wellbeing Videos) ─────────────
var SKIN = "#D9A07A", HAIR = "#3B2A33";
var SCENE_COLOR = { movement: C.teal, breath: C.accent, meditation: "#8B7AC5", nutrition: C.gold, emotional: C.rose };

export function WellbeingScene({ cat, className = "", animate = true }) {
  var col = SCENE_COLOR[cat] || C.accent;
  var g = useSvgId("ws");
  var night = cat === "meditation";
  var body;
  if (cat === "movement") body = (
    <g>
      <circle cx="128" cy="24" r="11" fill={C.gold} opacity="0.75" />
      <path d="M22 86 q4 -18 10 -22 q-2 10 2 22 z M30 86 q6 -14 14 -16 q-6 8 -4 16 z" fill={C.teal} opacity="0.55" />
      <rect x="40" y="86" width="80" height="5" rx="2.5" fill={col} />
      <path d="M77 44 L71 27 L80 13 M83 44 L89 27 L80 13" stroke={SKIN} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M73 43 q7 -4 14 0 l-2 22 h-10 z" fill={col} />
      <path d="M78 64 v22" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
      <path d="M82 64 l8 9 l-8 5" stroke={SKIN} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="80" cy="34" r="7" fill={SKIN} />
      <path d="M73 33 q0 -9 7 -9 q8 0 8 8 q-4 -4 -9 -3 q-4 1 -6 4 z" fill={HAIR} />
    </g>
  );
  else if (cat === "breath") body = (
    <g>
      <circle cx="80" cy="56" r="40" fill={col} opacity="0.1" className={animate ? "breathe" : ""} style={{ transformOrigin: "80px 56px" }} />
      <circle cx="80" cy="56" r="29" fill={col} opacity="0.14" className={animate ? "breathe" : ""} style={{ transformOrigin: "80px 56px", animationDelay: "0.4s" }} />
      <path d="M58 96 q22 -44 44 0 z" fill={col} />
      <circle cx="80" cy="42" r="10" fill={SKIN} />
      <path d="M70 41 q0 -12 10 -12 q11 0 11 11 q-5 -5 -11 -4 q-6 1 -10 5 z" fill={HAIR} />
      <path d="M75 44 q2 2 4 0 M82 44 q2 2 4 0" stroke={HAIR} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M95 40 q7 -3 13 0 q6 3 12 0 M97 48 q6 -2 11 0 q5 2 10 0" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  );
  else if (cat === "meditation") body = (
    <g>
      <path d="M34 14 a13 13 0 1 0 12 20 a10 10 0 1 1 -12 -20 z" fill="#FFE8A3" />
      {[[120, 18, 1], [140, 34, 0.7], [108, 40, 0.6], [22, 54, 0.6]].map(function (s, i) {
        return <path key={i} transform={"translate(" + s[0] + " " + s[1] + ") scale(" + s[2] + ")"} d="M0 -6 Q0.9 -0.9 6 0 Q0.9 0.9 0 6 Q-0.9 0.9 -6 0 Q-0.9 -0.9 0 -6 z" fill="#FFE8A3" className={animate ? "twinkle" : ""} style={{ animationDelay: i * 0.5 + "s" }} />;
      })}
      <path d="M58 86 q22 -12 44 0 q-22 9 -44 0 z" fill="#D8CCF0" />
      <path d="M70 58 q10 -6 20 0 l4 22 h-28 z" fill="#D8CCF0" />
      <path d="M71 62 q-7 10 -3 20 M89 62 q7 10 3 20" stroke={SKIN} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="47" r="8" fill={SKIN} />
      <path d="M72 46 q0 -10 8 -10 q9 0 9 9 q-4 -4 -9 -3 q-5 1 -8 4 z" fill={HAIR} />
      <circle cx="80" cy="47" r="15" fill="none" stroke="#FFE8A3" strokeWidth="1" opacity="0.5" />
    </g>
  );
  else if (cat === "nutrition") body = (
    <g>
      <path d="M58 34 q-3 -6 0 -12 M70 30 q-3 -6 0 -12 M82 34 q-3 -6 0 -12" stroke={col} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M44 52 h72 a36 30 0 0 1 -72 0 z" fill="#fff" stroke={col} strokeWidth="2.5" />
      <ellipse cx="66" cy="50" rx="12" ry="6" fill={C.teal} opacity="0.85" transform="rotate(-15 66 50)" />
      <ellipse cx="94" cy="49" rx="10" ry="5" fill="#8BC34A" opacity="0.8" transform="rotate(20 94 49)" />
      <circle cx="80" cy="47" r="6" fill={C.rose} /><circle cx="104" cy="46" r="4" fill={C.rose} opacity="0.8" />
      <circle cx="56" cy="47" r="4" fill={C.gold} />
      <path d="M126 28 v50 M122 28 v12 a4 4 0 0 0 8 0 v-12" stroke={C.muted} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
  else body = (
    <g>
      <g className={animate ? "heartbeat" : ""} style={{ transformOrigin: "80px 44px" }}>
        <path d="M80 60 C 58 46, 60 26, 72 26 C 77 26, 80 30, 80 33 C 80 30, 83 26, 88 26 C 100 26, 102 46, 80 60 z" fill={col} />
      </g>
      <path d="M40 66 q14 -2 28 8 q8 6 12 12 h-30 q-8 -6 -10 -20 z" fill={SKIN} />
      <path d="M120 66 q-14 -2 -28 8 q-8 6 -12 12 h30 q8 -6 10 -20 z" fill="#B97D5B" />
      <path d="M36 88 h40 M84 88 h40" stroke={col} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    </g>
  );
  return (
    <svg viewBox="0 0 160 100" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={night ? "#3A2A5E" : col} stopOpacity={night ? 1 : 0.28} />
          <stop offset="100%" stopColor={night ? "#6B5A99" : col} stopOpacity={night ? 1 : 0.1} />
        </linearGradient>
      </defs>
      <rect width="160" height="100" fill={night ? "#3A2A5E" : "#fff"} />
      <rect width="160" height="100" fill={"url(#" + g + ")"} />
      <circle cx="150" cy="96" r="30" fill="#fff" opacity="0.18" />
      <circle cx="6" cy="8" r="22" fill="#fff" opacity="0.18" />
      {body}
    </svg>
  );
}

// ── Friendly person avatar (community), varied by seed ───────
var AV_SKIN = ["#E8B996", "#C68B64", "#8D5B3E", "#F1C9A5", "#B07A56"];
var AV_HAIR = ["#3B2A33", "#6B3E26", "#1E1A1D", "#A0522D", "#2E2429"];
var AV_BG = [C.accent, C.rose, C.teal, C.gold, "#8B7AC5"];
export function PersonAvatar({ seed = 0, size = 48 }) {
  var n = typeof seed === "number" ? seed : String(seed).split("").reduce(function (a, ch) { return a + ch.charCodeAt(0); }, 0);
  var skin = AV_SKIN[n % 5], hair = AV_HAIR[(n >> 1) % 5], bg = AV_BG[(n >> 2) % 5], style = n % 3;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill={bg} opacity="0.22" />
      {style === 0 && <path d="M11 30 q-2 -18 13 -19 q15 1 13 19 q-2 6 -4 8 v-12 h-18 v12 q-2 -2 -4 -8 z" fill={hair} />}
      <path d="M8 48 a16 13 0 0 1 32 0 z" fill={bg} />
      <circle cx="24" cy="22" r="9" fill={skin} />
      {style !== 2 ? <path d="M15 21 q0 -11 9 -11 q10 0 10 10 q-5 -5 -11 -4 q-5 1 -8 5 z" fill={hair} /> : <path d="M15 19 q1 -9 9 -9 q8 0 9 9 q-4 -3 -9 -3 q-5 0 -9 3 z" fill={hair} />}
      <path d="M20 24 q1.2 1.2 2.4 0 M25.6 24 q1.2 1.2 2.4 0" stroke={hair} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M21.5 27 q2.5 2 5 0" stroke="#9A4A4A" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── Flower avatar (anonymous community names like "Peony") ───────────────
var FLOWER_COLORS = { Sunflower: "#F2B53A", Rose: "#E07A8A", Lily: "#F4A7B9", Peony: "#E893B5", Orchid: "#B57EDC", Jasmine: "#F5F0E1", Magnolia: "#F0C6D5", Tulip: "#E8645A", Lotus: "#F2A1C0", Iris: "#7F6BD1" };
export function FlowerAvatar({ name, size = 36 }) {
  var col = FLOWER_COLORS[name] || C.accent;
  var petals = name === "Sunflower" ? 10 : name === "Lily" || name === "Iris" ? 6 : 5;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill={col} opacity="0.18" />
      {Array.from({ length: petals }, function (_, i) {
        return <ellipse key={i} cx="20" cy="11" rx={petals > 6 ? 3 : 4.5} ry="7.5" fill={col} stroke={name === "Jasmine" ? "#D9CFB5" : "none"} transform={"rotate(" + (i * 360 / petals) + " 20 20)"} opacity="0.95" />;
      })}
      <circle cx="20" cy="20" r={petals > 6 ? 5 : 4} fill={name === "Sunflower" ? "#6B4226" : C.gold} />
    </svg>
  );
}

// ── Baby-size fruits for the Pregnancy Journey (drawn, so every phone shows them) ──
// size: fruit id ("poppy seed"…); label: the translated name for screen readers.
export function FruitSize({ size, label, px = 120 }) {
  var k = (size || "").replace(/^an? /, "");
  var f;
  switch (k) {
    case "poppy seed": f = <circle cx="60" cy="60" r="2.5" fill="#3B2A33" />; break;
    case "sesame seed": f = <ellipse cx="60" cy="60" rx="3" ry="5" fill="#E9D8A6" stroke="#B89B5E" strokeWidth="1" />; break;
    case "lentil": f = <ellipse cx="60" cy="60" rx="8" ry="6" fill="#D98A4E" stroke="#B0663A" strokeWidth="1.2" />; break;
    case "blueberry": f = <g><circle cx="60" cy="62" r="14" fill="#5B6FC7" /><path d="M55 50 l5 4 l5 -4" stroke="#39428A" strokeWidth="2" fill="none" /><circle cx="54" cy="57" r="3" fill="#fff" opacity="0.35" /></g>; break;
    case "raspberry": f = <g>{[[52, 58], [60, 54], [68, 58], [55, 66], [63, 66], [59, 74], [48, 66], [72, 66]].map(function (p, i) { return <circle key={i} cx={p[0]} cy={p[1]} r="6" fill="#D6455E" stroke="#A92E45" strokeWidth="0.8" />; })}<path d="M54 46 q6 6 12 0" stroke="#4E9A4A" strokeWidth="3" fill="none" strokeLinecap="round" /></g>; break;
    case "strawberry": f = <g><path d="M60 88 C 36 70, 38 44, 60 46 C 82 44, 84 70, 60 88 z" fill="#E4415A" /><path d="M48 44 l12 6 l12 -6 l-6 -4 l-6 3 l-6 -3 z" fill="#4E9A4A" />{[[52, 58], [66, 58], [58, 68], [50, 72], [68, 70], [60, 80]].map(function (p, i) { return <ellipse key={i} cx={p[0]} cy={p[1]} rx="1.2" ry="2" fill="#FFE08A" />; })}</g>; break;
    case "lime": f = <g><circle cx="60" cy="62" r="24" fill="#8BC34A" /><circle cx="60" cy="62" r="24" fill="none" stroke="#5E8F2E" strokeWidth="2" /><ellipse cx="51" cy="54" rx="6" ry="4" fill="#fff" opacity="0.3" /><circle cx="84" cy="62" r="2.5" fill="#5E8F2E" /></g>; break;
    case "avocado": f = <g><path d="M60 26 C 44 26, 42 50, 38 66 C 34 86, 48 98, 60 98 C 72 98, 86 86, 82 66 C 78 50, 76 26, 60 26 z" fill="#4E7D2E" /><path d="M60 34 C 48 34, 48 54, 45 68 C 42 84, 52 92, 60 92 C 68 92, 78 84, 75 68 C 72 54, 72 34, 60 34 z" fill="#CFE38B" /><circle cx="60" cy="72" r="11" fill="#8A5A2B" /></g>; break;
    case "banana": f = <g><path d="M24 44 C 30 84, 80 98, 100 70 C 94 74, 60 80, 34 42 z" fill="#F6D64A" stroke="#C9A928" strokeWidth="2" strokeLinejoin="round" /><path d="M22 40 l4 6" stroke="#6B4E1F" strokeWidth="4" strokeLinecap="round" /></g>; break;
    case "aubergine": f = <g><path d="M42 40 C 30 60, 44 104, 70 100 C 96 96, 90 60, 66 42 z" fill="#6B3FA0" /><path d="M40 36 q10 -10 26 4 q-10 6 -26 -4 z" fill="#4E9A4A" /><ellipse cx="54" cy="66" rx="5" ry="12" fill="#fff" opacity="0.18" /></g>; break;
    case "papaya": f = <g><ellipse cx="60" cy="62" rx="26" ry="36" fill="#F4A340" /><ellipse cx="60" cy="62" rx="20" ry="30" fill="#F8C36E" /><ellipse cx="60" cy="66" rx="8" ry="16" fill="#3B2A33" opacity="0.8" /></g>; break;
    case "watermelon": f = <g><circle cx="60" cy="62" r="40" fill="#3E8E4A" />{[-24, -8, 8, 24].map(function (x, i) { return <path key={i} d={"M" + (60 + x) + " 24 q" + (x / 3) + " 38 0 76"} stroke="#2A6634" strokeWidth="5" fill="none" />; })}<ellipse cx="46" cy="44" rx="10" ry="6" fill="#fff" opacity="0.2" /></g>; break;
    default: f = <circle cx="60" cy="60" r="10" fill={C.rose} />;
  }
  return (
    <svg width={px} height={px} viewBox="0 0 120 120" role="img" aria-label={label || size}>
      <circle cx="60" cy="60" r="58" fill="#fff" />
      <circle cx="60" cy="60" r="58" fill={C.rose} opacity="0.06" />
      {f}
    </svg>
  );
}
