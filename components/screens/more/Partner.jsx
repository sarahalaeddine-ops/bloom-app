"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { store } from "../../../lib/store";
import { PARTNER_FEATURES, PARTNER_TIPS, PARTNER_SEES, PARTNER_FAQ } from "../../../lib/demo-data";
import { isDemoUser } from "../../../lib/cycle";
import { useT } from "../../../lib/i18n";

var PEACH = "#FDBA74";

function makeCode() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var s = "";
  for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "BL-" + s;
}

export default function Partner({ onBack, user }) {
  var { t } = useT();
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

  var msg = t("partner.msg", { code: partner.code });
  var phase = user.phase || "stimulation";

  if (!partner.connected) return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <p className="text-3xl mb-2" style={{ color: PEACH }}>◑</p>
        <h1 className="text-2xl font-bold text-bloom-text mb-1">{t("partner.title")}</h1>
        <p className="text-bloom-muted text-sm mb-4">{t("partner.intro")}</p>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-orange-500 mb-1">{t("partner.control")}</p>
          <p className="text-bloom-muted text-xs leading-relaxed">{t("partner.controlBody")}</p>
        </div>

        {PARTNER_FEATURES.map(function (f) {
          return (
            <div key={f.n} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-bloom-border mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: f.color + "18", color: f.color }}>{f.mark}</div>
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

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: PEACH }}>{partner.name[0]}</div>
          <div>
            <h1 className="text-xl font-bold text-bloom-text">{t("sec.partner")}</h1>
            <p className="text-bloom-teal text-xs font-semibold">{t("partner.connected", { name: "\u2068" + partner.name + "\u2069" })}</p>
          </div>
        </div>

        <Label className="mb-2">{t("partner.f3")}</Label>
        <p className="text-bloom-dim text-xs mb-2">{phase === "stimulation" ? t("partner.stimLine", { name: "\u2068" + (user.name || "") + "\u2069", n: user.stimDay || 1 }) : t("partner.phaseLine", { name: "\u2068" + (user.name || "") + "\u2069", phase: t("phase." + phase) })}</p>
        {PARTNER_TIPS.map(function (n) {
          return (
            <div key={n} className="bg-white rounded-2xl p-4 border mb-2" style={{ borderColor: PEACH + "80" }}>
              <p className="text-bloom-text text-sm font-bold mb-1">{t("partner.tip" + n)}</p>
              <p className="text-bloom-muted text-xs leading-relaxed">{t("partner.tip" + n + ".d")}</p>
            </div>
          );
        })}

        <Label className="mb-2 mt-4">{t("partner.seesLabel")}</Label>
        <div className="bg-white rounded-2xl border border-bloom-border mb-4">
          {PARTNER_SEES.map(function (n) {
            return <p key={n} className="text-bloom-text text-sm px-4 py-3 border-b border-bloom-border last:border-0"><span className="text-bloom-teal me-2">✓</span>{t("partner.sees" + n)}</p>;
          })}
        </div>

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

        <button onClick={function () { save({ code: makeCode(), connected: false }); }} className="w-full py-3.5 rounded-2xl border-2 border-bloom-rose text-bloom-rose font-semibold text-sm">
          {t("partner.disconnect")}
        </button>
      </div>
    </div>
  );
}
