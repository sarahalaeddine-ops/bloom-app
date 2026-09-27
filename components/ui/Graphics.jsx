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
