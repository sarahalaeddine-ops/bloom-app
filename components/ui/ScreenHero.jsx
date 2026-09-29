"use client";
import { Blobs, Illustration } from "./Graphics";

// Shared illustrated header for inner screens: gradient card, title, subtitle, drawing on the end side.
var TINTS = {
  accent: "linear-gradient(150deg,#EEE6FA 0%,#FBEFF2 100%)",
  rose:   "linear-gradient(150deg,#FCE7EC 0%,#FBF1E6 100%)",
  teal:   "linear-gradient(150deg,#E3F5F1 0%,#EEE9FA 100%)",
  gold:   "linear-gradient(150deg,#FDF1DC 0%,#FBEFF2 100%)",
  blue:   "linear-gradient(150deg,#E4F1F9 0%,#F1ECFA 100%)",
};

export default function ScreenHero({ art, title, sub, tint = "accent", children }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 mb-4" style={{ background: TINTS[tint] || TINTS.accent }}>
      <Blobs />
      <div className="relative flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-bloom-text leading-tight mb-1">{title}</h1>
          {sub && <p className="text-bloom-muted text-sm leading-relaxed">{sub}</p>}
          {children}
        </div>
        <div className="flex-shrink-0 -me-1"><Illustration name={art} size={100} /></div>
      </div>
    </div>
  );
}
