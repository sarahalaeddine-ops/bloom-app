"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { store } from "../../../lib/store";
import { PARTNER_FEATURES, PARTNER_TIPS, PARTNER_SEES, PARTNER_FAQ } from "../../../lib/demo-data";

var PEACH = "#FDBA74";

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
        <p className="text-3xl mb-2" style={{ color: PEACH }}>◑</p>
        <h1 className="text-2xl font-bold text-bloom-text mb-1">Bloom for Partners</h1>
        <p className="text-bloom-muted text-sm mb-4">Help them understand and support you, without having to explain everything again.</p>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-orange-500 mb-1">You are always in control</p>
          <p className="text-bloom-muted text-xs leading-relaxed">Your partner never sees your journal, Secret Space or Nora chats. You can disconnect at any time.</p>
        </div>

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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: PEACH }}>{partner.name[0]}</div>
          <div>
            <h1 className="text-xl font-bold text-bloom-text">Partner Space</h1>
            <p className="text-bloom-teal text-xs font-semibold">● Connected with {partner.name}</p>
          </div>
        </div>

        <Label className="mb-2">How to support her today</Label>
        <p className="text-bloom-dim text-xs mb-2">{user.name} is on Stimulation Day {user.stimDay || 7}</p>
        {PARTNER_TIPS.map(function (t, i) {
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border mb-2" style={{ borderColor: PEACH + "80" }}>
              <p className="text-bloom-text text-sm font-bold mb-1">{t.title}</p>
              <p className="text-bloom-muted text-xs leading-relaxed">{t.body}</p>
            </div>
          );
        })}

        <Label className="mb-2 mt-4">What your partner sees</Label>
        <div className="bg-white rounded-2xl border border-bloom-border mb-4">
          {PARTNER_SEES.map(function (s) {
            return <p key={s} className="text-bloom-text text-sm px-4 py-3 border-b border-bloom-border last:border-0"><span className="text-bloom-teal mr-2">✓</span>{s}</p>;
          })}
        </div>

        <Label className="mb-2">FAQ</Label>
        <div className="bg-white rounded-2xl border border-bloom-border mb-4">
          {PARTNER_FAQ.map(function (f, i) {
            var open = faq === i;
            return (
              <div key={i} className="border-b border-bloom-border last:border-0">
                <button onClick={function () { setFaq(open ? null : i); }} aria-expanded={open} className="w-full text-left px-4 py-3 flex justify-between items-center gap-2">
                  <span className="text-bloom-text text-sm font-medium">{f.q}</span>
                  <span className="text-bloom-muted">{open ? "−" : "+"}</span>
                </button>
                {open && <p className="px-4 pb-3 text-bloom-muted text-xs leading-relaxed">{f.a}</p>}
              </div>
            );
          })}
        </div>

        <button onClick={function () { save({ code: makeCode(), connected: false }); }} className="w-full py-3.5 rounded-2xl border-2 border-bloom-rose text-bloom-rose font-semibold text-sm">
          Disconnect partner
        </button>
      </div>
    </div>
  );
}
