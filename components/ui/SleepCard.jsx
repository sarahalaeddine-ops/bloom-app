"use client";
import { useState } from "react";
import { Moon, Check, Minus, Plus } from "lucide-react";
import { Sheet, Label } from "./Common";
import { getSleep, logSleep, sleepScore, fmtHours } from "../../lib/sleep";
import { useT } from "../../lib/i18n";

var NIGHT = "#2B1A45";
var SCORE_COLOR = { great: "#4ABFB0", good: "#9B6DC5", fair: "#C49A3C", restless: "#E07A8A" };

export function Sparkle({ x, y, s, color, delay }) {
  return (
    <path transform={"translate(" + x + " " + y + ") scale(" + s + ")"} className="twinkle" style={{ animationDelay: (delay || 0) + "s" }}
      d="M0 -6 Q0.9 -0.9 6 0 Q0.9 0.9 0 6 Q-0.9 0.9 -6 0 Q-0.9 -0.9 0 -6 z" fill={color} />
  );
}

export function SleepRing({ value, size = 180, badge = true, children }) {
  var r = 70, circ = 2 * Math.PI * r;
  var a = value * 2 * Math.PI - Math.PI / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 180 180" aria-hidden="true">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="12" />
        <circle cx="90" cy="90" r={r} fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={value * circ + " " + circ} transform="rotate(-90 90 90)" className="ring-draw" style={{ "--ring-len": value * circ }} />
        {badge && <circle cx={90 + r * Math.cos(a)} cy={90 + r * Math.sin(a)} r="12" fill="#4ABFB0" stroke={NIGHT} strokeWidth="3" />}
        {badge && <path d={"M" + (84 + r * Math.cos(a)) + " " + (90 + r * Math.sin(a)) + " l4 4 l7 -8"} transform={"translate(0 0)"} stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

// Keep the score label inside the ring whatever the language.
function fitSize(label) {
  var n = label.length;
  return (n <= 5 ? 36 : n <= 7 ? 30 : 25) + "px";
}

export default function SleepCard() {
  var { t } = useT();
  var [nights, setNights] = useState(getSleep);
  var [open, setOpen] = useState(false);
  var last = nights[0];
  var score = sleepScore(last);
  var loggedToday = last && new Date(last.date).toDateString() === new Date().toDateString();

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl p-5 mb-3 text-center" style={{ backgroundColor: NIGHT }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 420" preserveAspectRatio="none" aria-hidden="true">
          <Sparkle x={40} y={150} s={1.4} color="#F5A3D8" />
          <Sparkle x={28} y={210} s={0.9} color="#8FA8FF" delay={0.8} />
          <Sparkle x={330} y={170} s={1.8} color="#FFE45C" delay={0.4} />
          <Sparkle x={300} y={110} s={1} color="#F5A3D8" delay={1.2} />
          <Sparkle x={250} y={40} s={0.8} color="#8C7BB0" delay={1.6} />
          <Sparkle x={55} y={300} s={1.3} color="#FFE45C" delay={0.2} />
          <Sparkle x={320} y={300} s={1.3} color="#F5A3D8" delay={1} />
        </svg>
        <div className="relative flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 text-xs font-semibold" style={{ color: "#6B4FA0" }}>
            <Moon size={14} /> {t("sleep.title")}
          </span>
          <span className="flex-1" />
          <button onClick={function () { setOpen(true); }} className="text-white/70 text-xs font-semibold border border-white/30 rounded-full px-3 py-1.5">
            {loggedToday ? t("sleep.edit") : t("sleep.logLast")}
          </button>
        </div>
        {score ? (
          <div className="relative flex flex-col items-center">
            <SleepRing value={score.value} size={190} badge={score.key === "great" || score.key === "good"}>
              <p className="text-white font-bold leading-none px-2" style={{ fontSize: fitSize(t("sleep.score." + score.key)) }}>{t("sleep.score." + score.key)}</p>
              <p className="text-white/60 text-sm mt-1">{t("sleep.scoreLabel")}</p>
            </SleepRing>
            <p className="text-white/60 text-sm font-semibold mt-3">{t("sleep.asleep", { h: fmtHours(last.hours, t) })}</p>
            <p className="text-white text-[15px] leading-snug mt-2 mb-4 px-2">{t("sleep.msg." + score.key)}</p>
          </div>
        ) : (
          <p className="relative text-white/80 text-sm my-8">{t("sleep.empty")}</p>
        )}
        <button onClick={function () { setOpen(true); }} className="relative w-full py-3.5 rounded-full text-white font-bold" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
          {t("sleep.showMe")}
        </button>
      </div>
      {open && <SleepSheet nights={nights} onSaved={setNights} onClose={function () { setOpen(false); }} />}
    </>
  );
}

function SleepSheet({ nights, onSaved, onClose }) {
  var { t, locale } = useT();
  var last = nights[0];
  var isToday = last && new Date(last.date).toDateString() === new Date().toDateString();
  var [hours, setHours] = useState(isToday ? last.hours : 7);
  var [quality, setQuality] = useState(isToday ? last.quality : 2);
  var [saved, setSaved] = useState(false);
  var week = nights.slice(0, 7).slice().reverse();
  var avg = week.length ? week.reduce(function (s, n) { return s + n.hours; }, 0) / week.length : 0;

  function save() {
    var d = new Date();
    d.setHours(7, 0, 0, 0);
    onSaved(logSleep({ date: d.toISOString(), hours: hours, quality: quality }));
    setSaved(true);
    setTimeout(function () { setSaved(false); }, 2000);
  }

  return (
    <Sheet onClose={onClose}>
      <div className="w-10 h-1 bg-bloom-border rounded-full mx-auto -mt-2 mb-4" />
      <h2 className="text-xl font-bold text-bloom-text mb-1">{t("sleep.sheetTitle")}</h2>
      <p className="text-bloom-muted text-sm mb-4">{week.length ? t("sleep.avg", { h: fmtHours(avg, t) }) : t("sleep.empty")}</p>

      <div className="flex items-end justify-between gap-2 h-36 mb-1" role="img" aria-label={week.map(function (n) { return fmtHours(n.hours, t); }).join(", ")}>
        {week.map(function (n, i) {
          var sc = sleepScore(n);
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-[10px] text-bloom-muted mb-1">{n.hours}</span>
              <div className="w-full rounded-t-lg rounded-b-sm" style={{ height: Math.max(8, (n.hours / 10) * 100) + "%", backgroundColor: SCORE_COLOR[sc.key] }} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-2 mb-5">
        {week.map(function (n, i) {
          return <span key={i} className="flex-1 text-center text-[10px] text-bloom-dim">{new Date(n.date).toLocaleDateString(locale, { weekday: "narrow" })}</span>;
        })}
      </div>

      <Label className="mb-2">{t("sleep.lastNight")}</Label>
      <div className="flex items-center justify-center gap-5 mb-4">
        <button onClick={function () { setHours(Math.max(3, hours - 0.5)); }} aria-label={t("sleep.less")} className="w-11 h-11 rounded-full bg-bloom-surface flex items-center justify-center text-bloom-accent"><Minus size={20} /></button>
        <p className="text-4xl font-light text-bloom-text w-28 text-center"><bdi>{fmtHours(hours, t)}</bdi></p>
        <button onClick={function () { setHours(Math.min(12, hours + 0.5)); }} aria-label={t("sleep.more")} className="w-11 h-11 rounded-full bg-bloom-surface flex items-center justify-center text-bloom-accent"><Plus size={20} /></button>
      </div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map(function (q) {
          var on = quality === q;
          return (
            <button key={q} onClick={function () { setQuality(q); }} aria-pressed={on}
              className="flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold"
              style={{ borderColor: on ? "#9B6DC5" : "#E8E0DB", color: on ? "#9B6DC5" : "#7A6880", backgroundColor: on ? "#9B6DC50D" : "white" }}>
              {t("sleep.q" + q)}
            </button>
          );
        })}
      </div>
      <button onClick={save} className="w-full py-3.5 rounded-xl text-white font-semibold mb-5 flex items-center justify-center gap-2" style={{ backgroundColor: saved ? "#4ABFB0" : "#9B6DC5" }}>
        {saved ? <><Check size={18} /> {t("sleep.saved")}</> : t("common.save")}
      </button>

      <Label className="mb-2">{t("sleep.tipsTitle")}</Label>
      {[1, 2, 3].map(function (i) {
        return <p key={i} className="text-bloom-muted text-sm mb-2">✦ {t("sleep.tip" + i)}</p>;
      })}
    </Sheet>
  );
}
