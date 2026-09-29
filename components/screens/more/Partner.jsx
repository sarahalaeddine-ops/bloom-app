"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { store } from "../../../lib/store";
import { PARTNER_FEATURES, PARTNER_TIPS, PARTNER_FAQ } from "../../../lib/demo-data";
import { isDemoUser, latestE2, follicleStats } from "../../../lib/cycle";
import { getMeds, upcomingAppts, fmtClock } from "../../../lib/schedule";
import { apptLabel, relDay } from "../../ScheduleForms";
import { Illustration, JourneyRing, journeyDay, Blobs } from "../../ui/Graphics";
import { useT } from "../../../lib/i18n";

var PEACH = "#FDBA74";

// What she chooses to share (sa5). Labels are "partner.sees<n>". Journal, Secret Space and Nora
// are never shareable.
var SHARES = [
  { id: "phase", n: 1 },
  { id: "appts", n: 2 },
  { id: "meds",  n: 3 },
  { id: "tips",  n: 4 },
];
var DEFAULT_SHARES = { phase: true, appts: true, meds: true, tips: true };

function Hero({ children }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 mb-4" style={{ background: "linear-gradient(150deg,#EADFF8 0%,#FCE7DD 100%)" }}>
      <Blobs />
      <div className="relative flex items-start gap-3">
        <div className="flex-1 min-w-0">{children}</div>
        <div className="flex-shrink-0 -me-2"><Illustration name="couple" size={112} /></div>
      </div>
    </div>
  );
}

function Phone({ label, tone, children }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col items-center">
      <span className="text-xs font-bold px-3 py-1.5 rounded-full mb-2 shadow-sm" style={{ backgroundColor: tone, color: "#1A1014" }}>{label}</span>
      <div className="w-full rounded-[22px] border-[5px] border-bloom-text/80 bg-white overflow-hidden shadow-md" style={{ aspectRatio: "3 / 4.2" }}>
        <div className="h-3 flex justify-center"><span className="w-10 h-1.5 mt-1 rounded-full bg-bloom-text/70" /></div>
        <div className="px-2 pb-2 h-full" style={{ background: "linear-gradient(180deg,#FBF1F3 0%,#fff 60%)" }}>{children}</div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={function () { onChange(!on); }}
      className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0" style={{ backgroundColor: on ? "#4ABFB0" : "#E8E0DB" }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ insetInlineStart: on ? 22 : 2 }} />
    </button>
  );
}

function makeCode() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var s = "";
  for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "BL-" + s;
}

function iso(s) { return "⁨" + s + "⁩"; }

export default function Partner({ onBack, user }) {
  var { t, locale } = useT();
  var [partner, setPartner] = useState(function () {
    var p = store.get("partner", null);
    if (!p) { p = { code: makeCode(), connected: false }; store.set("partner", p); }
    return p;
  });
  var [copied, setCopied] = useState(false);
  var [faq, setFaq] = useState(null);
  var [confirmStop, setConfirmStop] = useState(false);
  var shares = { ...DEFAULT_SHARES, ...(partner.shares || {}) };

  function save(p) { setPartner(p); store.set("partner", p); }

  function copy() {
    if (navigator.clipboard) navigator.clipboard.writeText(partner.code).catch(function () {});
    setCopied(true);
    setTimeout(function () { setCopied(false); }, 2000);
  }

  var msg = t("partner.msg", { code: partner.code });
  var phase = user.phase || "stimulation";
  var stimDay = phase === "stimulation" && user.stimDay ? user.stimDay : null;
  var phaseText = stimDay ? t("more.stimDay", { n: stimDay }) : t("phase." + phase);

  if (!partner.connected) return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <Hero>
          <h1 className="text-3xl font-bold text-bloom-text leading-tight mb-2">{t("partner.title")}</h1>
          <p className="text-bloom-text text-sm leading-relaxed"><b>{t("partner.control")}.</b> {t("partner.controlChoose")}</p>
        </Hero>
        <p className="text-bloom-muted text-sm mb-4">{t("partner.intro")}</p>

        {PARTNER_FEATURES.map(function (f) {
          return (
            <div key={f.n} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-bloom-border mb-2">
              <Illustration name={f.art} size={48} />
              <div>
                <p className="text-bloom-text text-sm font-bold">{t("partner.f" + f.n)}</p>
                <p className="text-bloom-muted text-xs">{t("partner.f" + f.n + ".d")}</p>
              </div>
            </div>
          );
        })}

        <div className="bg-white rounded-2xl p-5 border-2 mt-4 text-center" style={{ borderColor: PEACH }}>
          <Label className="mb-2">{t("partner.code")}</Label>
          <p className="font-bold text-bloom-text mb-4" style={{ fontSize: "36px", letterSpacing: "0.12em" }}><bdi dir="ltr">{partner.code}</bdi></p>
          <a href={"https://wa.me/?text=" + encodeURIComponent(msg)} target="_blank" rel="noopener noreferrer"
            className="block w-full py-3.5 rounded-xl text-white font-semibold mb-2" style={{ backgroundColor: "#25D366" }}>
            {t("partner.whatsapp")}
          </a>
          <button onClick={copy} className="w-full py-3.5 rounded-xl bg-bloom-surface text-bloom-text font-semibold text-sm">{copied ? t("cmn.copied") : t("partner.copy")}</button>
        </div>

        {isDemoUser() && (
          <button onClick={function () { save({ ...partner, connected: true, name: "Alex", since: new Date().toISOString() }); }}
            className="w-full mt-4 py-3 text-xs text-bloom-muted border border-dashed border-bloom-dim rounded-xl">
            {t("partner.demoJoin")}
          </button>
        )}
      </div>
    </div>
  );

  // The "your view / their view" preview uses only her own data (empty when she hasn't logged any).
  var name = iso(partner.name);
  var e2 = latestE2();
  var fol = follicleStats();
  var meds = getMeds().slice(0, 3);
  var nextAppt = upcomingAppts(new Date())[0] || null;
  var firstDose = meds.length && meds[0].times && meds[0].times.length ? meds[0].times[0] : null;
  var summary = [e2 ? "E2 " + e2.value.toLocaleString(locale) : null, !fol.none ? t("home.follicles") + " " + fol.total : null].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <Hero>
          <h1 className="text-2xl font-bold text-bloom-text leading-tight mb-1">{t("sec.partner")}</h1>
          <p className="text-bloom-teal text-xs font-semibold mb-2">{t("partner.connected", { name: name })}</p>
          <p className="text-bloom-text text-sm leading-relaxed"><b>{t("partner.control")}.</b> {t("partner.controlConnected", { name: name })}</p>
        </Hero>

        {!confirmStop ? (
          <div className="bg-white rounded-3xl p-5 mb-5 flex items-center gap-3" style={{ boxShadow: "0 2px 12px rgba(26,16,20,0.06)" }}>
            <div className="flex-1">
              <p className="text-bloom-text font-bold mb-1">{t("partner.stopQ")}</p>
              <p className="text-bloom-muted text-sm leading-relaxed mb-4">{t("partner.stopBody")}</p>
              <button onClick={function () { setConfirmStop(true); }} className="px-5 py-2.5 rounded-full bg-bloom-rose text-white font-semibold text-sm">{t("partner.stop")}</button>
            </div>
            <svg width="72" height="90" viewBox="0 0 72 90" aria-hidden="true" className="flex-shrink-0">
              <rect x="30" y="4" width="36" height="62" rx="7" fill="#fff" stroke="#C5B8CC" strokeWidth="2.5" />
              <circle cx="48" cy="28" r="7" fill="#C5B8CC" /><path d="M38 44 a10 8 0 0 1 20 0 z" fill="#C5B8CC" />
              <rect x="6" y="22" width="34" height="62" rx="7" fill="#4ABFB0" stroke="#2E8C80" strokeWidth="2" />
              <circle cx="23" cy="46" r="7" fill="#fff" /><path d="M13 62 a10 8 0 0 1 20 0 z" fill="#fff" />
            </svg>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 mb-5 border-2 border-bloom-rose/40">
            <p className="text-bloom-text text-sm mb-3">{t("partner.stopConfirm", { name: name })}</p>
            <div className="flex gap-2">
              <button onClick={function () { setConfirmStop(false); }} className="flex-1 py-2.5 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">{t("partner.keep")}</button>
              <button onClick={function () { setConfirmStop(false); save({ code: makeCode(), connected: false }); }} className="flex-1 py-2.5 rounded-xl bg-bloom-rose text-white text-sm font-semibold">{t("partner.stop")}</button>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold text-bloom-text mb-3">{t("partner.seesLabel")}</h2>
        <div className="flex gap-3 mb-4">
          <Phone label={t("partner.yourView") + " 💜"} tone="#E4D4F4">
            <div className="flex justify-center mt-1">
              <JourneyRing day={journeyDay(phase, stimDay || 1)} size={82}>
                <p className="font-serif italic text-bloom-text leading-none text-center" style={{ fontSize: "12px" }}>{stimDay ? t("common.day", { n: stimDay }) : t("phase." + phase)}</p>
              </JourneyRing>
            </div>
            {summary && <p className="text-[9px] text-bloom-muted text-center mb-1"><bdi>{summary}</bdi></p>}
            {meds.map(function (m) {
              return <div key={m.id} className="flex items-center gap-1 bg-white rounded-md border border-bloom-border px-1.5 py-1 mb-1"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} /><span className="text-[8px] text-bloom-text truncate"><bdi>{m.name} {m.dose}</bdi></span></div>;
            })}
            <div className="bg-purple-50 rounded-md px-1.5 py-1 text-[8px] text-bloom-accent">✎ {t("partner.journalPrivate")}</div>
          </Phone>
          <Phone label={t("partner.theirView") + " ♥"} tone="#CFF1EA">
            <p className="text-[9px] text-bloom-muted mt-1"><bdi>{user.anonymous || !user.name ? t("partner.her") : user.name}</bdi></p>
            {shares.phase ? <p className="font-serif italic text-bloom-text leading-tight mb-1" style={{ fontSize: "14px" }}>{phaseText}</p> : <p className="text-[9px] text-bloom-dim mb-1">{t("partner.phaseHidden")}</p>}
            {shares.appts && nextAppt && <div className="bg-white rounded-md border border-bloom-border px-1.5 py-1 mb-1"><p className="text-[8px] font-semibold text-bloom-text"><bdi>{apptLabel(nextAppt, t)}</bdi></p><p className="text-[8px] text-bloom-muted">{relDay(nextAppt, t)} · <bdi>{fmtClock(nextAppt.time, locale)}</bdi></p></div>}
            {shares.meds && firstDose && <div className="bg-white rounded-md border border-bloom-border px-1.5 py-1 mb-1"><p className="text-[8px] text-bloom-text">💉 {t("partner.doseAt", { time: fmtClock(firstDose, locale) })}</p></div>}
            {shares.tips && <div className="rounded-md px-1.5 py-1.5 mb-1" style={{ backgroundColor: "#FDF1E3" }}><p className="text-[8px] font-semibold text-bloom-text leading-snug">{t("partner.tip" + PARTNER_TIPS[0])}</p></div>}
            {!shares.phase && !shares.appts && !shares.meds && !shares.tips && <p className="text-[9px] text-bloom-dim mt-3 text-center">{t("partner.nothingShared")}</p>}
          </Phone>
        </div>

        <div className="bg-white rounded-2xl border border-bloom-border mb-5">
          <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold px-4 pt-3 pb-1">{t("partner.youChoose")}</p>
          {SHARES.map(function (it) {
            var label = t("partner.sees" + it.n);
            return (
              <div key={it.id} className="flex items-center gap-3 px-4 py-3 border-b border-bloom-border last:border-0">
                <p className="flex-1 text-bloom-text text-sm">{label}</p>
                <Toggle on={shares[it.id]} label={label} onChange={function (v) { save({ ...partner, shares: { ...shares, [it.id]: v } }); }} />
              </div>
            );
          })}
          <p className="text-bloom-dim text-xs px-4 py-3">{t("partner.neverShared")}</p>
        </div>

        {shares.tips && <>
          <Label className="mb-2">{t("partner.supportToday", { name: name })}</Label>
          <p className="text-bloom-dim text-xs mb-2">{stimDay ? t("partner.stimLine", { name: iso(user.name || ""), n: stimDay }) : t("partner.phaseLine", { name: iso(user.name || ""), phase: t("phase." + phase) })}</p>
          {PARTNER_TIPS.map(function (n) {
            return (
              <div key={n} className="bg-white rounded-2xl p-4 border mb-2" style={{ borderColor: PEACH + "80" }}>
                <p className="text-bloom-text text-sm font-bold mb-1">{t("partner.tip" + n)}</p>
                <p className="text-bloom-muted text-xs leading-relaxed">{t("partner.tip" + n + ".d")}</p>
              </div>
            );
          })}
          <div className="mb-4" />
        </>}

        <Label className="mb-2">{t("partner.faq")}</Label>
        <div className="bg-white rounded-2xl border border-bloom-border mb-4">
          {PARTNER_FAQ.map(function (n, i) {
            var open = faq === i;
            return (
              <div key={n} className="border-b border-bloom-border last:border-0">
                <button onClick={function () { setFaq(open ? null : i); }} aria-expanded={open} className="w-full text-start px-4 py-3 flex justify-between items-center gap-2">
                  <span className="text-bloom-text text-sm font-medium">{t("partner.faq" + n)}</span>
                  <span className="text-bloom-muted">{open ? "−" : "+"}</span>
                </button>
                {open && <p className="px-4 pb-3 text-bloom-muted text-xs leading-relaxed">{t("partner.faq" + n + ".a")}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
