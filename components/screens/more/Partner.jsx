"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { store } from "../../../lib/store";
import { PARTNER_FEATURES, PARTNER_TIPS, PARTNER_FAQ, APPOINTMENTS, MEDS } from "../../../lib/demo-data";
import { Illustration, JourneyRing, journeyDay, Blobs } from "../../ui/Graphics";

var PEACH = "#FDBA74";

// What she chooses to share. Journal, Secret Space and Nora are never shareable.
var SHARES = [
  { id: "phase", label: "Cycle phase and stim day" },
  { id: "appts", label: "Upcoming appointments" },
  { id: "meds",  label: "Medication times (not doses)" },
  { id: "tips",  label: "Daily support tips" },
];
var DEFAULT_SHARES = { phase: true, appts: true, meds: true, tips: true };

function Hero({ children }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 mb-4" style={{ background: "linear-gradient(150deg,#EADFF8 0%,#FCE7DD 100%)" }}>
      <Blobs />
      <div className="relative flex items-start gap-3">
        <div className="flex-1">{children}</div>
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
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: on ? 22 : 2 }} />
    </button>
  );
}

function makeCode() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var s = "";
  for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "BL-" + s;
}

export default function Partner({ onBack, user }) {
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

  var msg = "Join me on Bloom so you can follow my IVF journey. Download Bloom and enter my code: " + partner.code;

  if (!partner.connected) return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <Hero>
          <h1 className="text-3xl font-bold text-bloom-text leading-tight mb-2">Bloom for Partners</h1>
          <p className="text-bloom-text text-sm leading-relaxed"><b>You&apos;re always in control.</b> Your partner only sees what you choose, never your journal, Secret Space or Nora chats.</p>
        </Hero>
        <p className="text-bloom-muted text-sm mb-4">Help them understand and support you, without having to explain everything again.</p>

        {PARTNER_FEATURES.map(function (f) {
          return (
            <div key={f.title} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-bloom-border mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: f.color + "18", color: f.color }}>{f.mark}</div>
              <div>
                <p className="text-bloom-text text-sm font-bold">{f.title}</p>
                <p className="text-bloom-muted text-xs">{f.desc}</p>
              </div>
            </div>
          );
        })}

        <div className="bg-white rounded-2xl p-5 border-2 mt-4 text-center" style={{ borderColor: PEACH }}>
          <Label className="mb-2">Your pairing code</Label>
          <p className="font-bold text-bloom-text mb-4" style={{ fontSize: "36px", letterSpacing: "0.12em" }}>{partner.code}</p>
          <a href={"https://wa.me/?text=" + encodeURIComponent(msg)} target="_blank" rel="noopener noreferrer"
            className="block w-full py-3.5 rounded-xl text-white font-semibold mb-2" style={{ backgroundColor: "#25D366" }}>
            Share via WhatsApp
          </a>
          <button onClick={copy} className="w-full py-3.5 rounded-xl bg-bloom-surface text-bloom-text font-semibold text-sm">{copied ? "Copied ✓" : "Copy code"}</button>
        </div>

        <button onClick={function () { save({ ...partner, connected: true, name: "Alex", since: new Date().toISOString() }); }}
          className="w-full mt-4 py-3 text-xs text-bloom-muted border border-dashed border-bloom-dim rounded-xl">
          Demo: simulate partner joining with this code
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <Hero>
          <h1 className="text-2xl font-bold text-bloom-text leading-tight mb-1">Partner Space</h1>
          <p className="text-bloom-teal text-xs font-semibold mb-2">● Connected with {partner.name}</p>
          <p className="text-bloom-text text-sm leading-relaxed"><b>You&apos;re always in control.</b> {partner.name} can only see what you switch on below and can&apos;t log or edit anything.</p>
        </Hero>

        {!confirmStop ? (
          <div className="bg-white rounded-3xl p-5 mb-5 flex items-center gap-3" style={{ boxShadow: "0 2px 12px rgba(26,16,20,0.06)" }}>
            <div className="flex-1">
              <p className="text-bloom-text font-bold mb-1">Don&apos;t want to share anymore?</p>
              <p className="text-bloom-muted text-sm leading-relaxed mb-4">Stop sharing any time, right here. Your body. Your data. Your choice.</p>
              <button onClick={function () { setConfirmStop(true); }} className="px-5 py-2.5 rounded-full bg-bloom-rose text-white font-semibold text-sm">Stop sharing</button>
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
            <p className="text-bloom-text text-sm mb-3">Stop sharing with {partner.name}? Access ends straight away and they aren&apos;t sent any details.</p>
            <div className="flex gap-2">
              <button onClick={function () { setConfirmStop(false); }} className="flex-1 py-2.5 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">Keep sharing</button>
              <button onClick={function () { setConfirmStop(false); save({ code: makeCode(), connected: false }); }} className="flex-1 py-2.5 rounded-xl bg-bloom-rose text-white text-sm font-semibold">Stop sharing</button>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold text-bloom-text mb-3">What your partner sees</h2>
        <div className="flex gap-3 mb-4">
          <Phone label="Your view 💜" tone="#E4D4F4">
            <div className="flex justify-center mt-1">
              <JourneyRing day={journeyDay(user.phase, user.stimDay || 7)} size={82}>
                <p className="font-serif italic text-bloom-text leading-none" style={{ fontSize: "14px" }}>Day {user.stimDay || 7}</p>
              </JourneyRing>
            </div>
            <p className="text-[9px] text-bloom-muted text-center mb-1">E2 1.8k · 11 follicles</p>
            {MEDS.slice(0, 3).map(function (m) {
              return <div key={m.id} className="flex items-center gap-1 bg-white rounded-md border border-bloom-border px-1.5 py-1 mb-1"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} /><span className="text-[8px] text-bloom-text truncate">{m.name} {m.dose}</span></div>;
            })}
            <div className="bg-purple-50 rounded-md px-1.5 py-1 text-[8px] text-bloom-accent">✎ Journal · private</div>
          </Phone>
          <Phone label={"Their view ♥"} tone="#CFF1EA">
            <p className="text-[9px] text-bloom-muted mt-1">{user.anonymous ? "Your partner" : user.name}</p>
            {shares.phase ? <p className="font-serif italic text-bloom-text leading-tight mb-1" style={{ fontSize: "15px" }}>Stim Day {user.stimDay || 7}</p> : <p className="text-[9px] text-bloom-dim mb-1">Phase hidden</p>}
            {shares.appts && <div className="bg-white rounded-md border border-bloom-border px-1.5 py-1 mb-1"><p className="text-[8px] font-semibold text-bloom-text">{APPOINTMENTS[0].type}</p><p className="text-[8px] text-bloom-muted">{APPOINTMENTS[0].label} · {APPOINTMENTS[0].time}</p></div>}
            {shares.meds && <div className="bg-white rounded-md border border-bloom-border px-1.5 py-1 mb-1"><p className="text-[8px] text-bloom-text">💉 Injection at {MEDS[0].time}</p></div>}
            {shares.tips && <div className="rounded-md px-1.5 py-1.5 mb-1" style={{ backgroundColor: "#FDF1E3" }}><p className="text-[8px] font-semibold text-bloom-text leading-snug">{PARTNER_TIPS[0].title}</p></div>}
            {!shares.phase && !shares.appts && !shares.meds && !shares.tips && <p className="text-[9px] text-bloom-dim mt-3 text-center">Nothing shared</p>}
          </Phone>
        </div>

        <div className="bg-white rounded-2xl border border-bloom-border mb-5">
          <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold px-4 pt-3 pb-1">You choose what&apos;s shared</p>
          {SHARES.map(function (it) {
            return (
              <div key={it.id} className="flex items-center gap-3 px-4 py-3 border-b border-bloom-border last:border-0">
                <p className="flex-1 text-bloom-text text-sm">{it.label}</p>
                <Toggle on={shares[it.id]} label={it.label} onChange={function (v) { save({ ...partner, shares: { ...shares, [it.id]: v } }); }} />
              </div>
            );
          })}
          <p className="text-bloom-dim text-xs px-4 py-3">Never shared: journal, Secret Space, Nora chats, weight and symptoms.</p>
        </div>

        {shares.tips && <>
          <Label className="mb-2">How {partner.name} can support you today</Label>
          {PARTNER_TIPS.map(function (tip, i) {
            return (
              <div key={i} className="bg-white rounded-2xl p-4 border mb-2" style={{ borderColor: PEACH + "80" }}>
                <p className="text-bloom-text text-sm font-bold mb-1">{tip.title}</p>
                <p className="text-bloom-muted text-xs leading-relaxed">{tip.body}</p>
              </div>
            );
          })}
          <div className="mb-4" />
        </>}

        <Label className="mb-2">FAQ</Label>
        <div className="bg-white rounded-2xl border border-bloom-border mb-4">
          {PARTNER_FAQ.map(function (f, i) {
            var open = faq === i;
            return (
              <div key={i} className="border-b border-bloom-border last:border-0">
                <button onClick={function () { setFaq(open ? null : i); }} aria-expanded={open} className="w-full text-start px-4 py-3 flex justify-between items-center gap-2">
                  <span className="text-bloom-text text-sm font-medium">{f.q}</span>
                  <span className="text-bloom-muted">{open ? "−" : "+"}</span>
                </button>
                {open && <p className="px-4 pb-3 text-bloom-muted text-xs leading-relaxed">{f.a}</p>}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
