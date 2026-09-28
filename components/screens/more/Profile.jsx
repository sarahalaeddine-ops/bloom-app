"use client";
import { useState } from "react";
import { BackBtn } from "../../ui/Common";
import { auth, store } from "../../../lib/store";
import { useT, LANGS } from "../../../lib/i18n";
import { siteUrl } from "../../../lib/config";

var PROTOCOLS = ["Antagonist", "Long Lupron", "Mini IVF", "Natural", "Not sure yet"];

// The last action depends on who is signed in:
// - demo persona: "Reset demo data" (wipes this device, as before);
// - local account (data only on this device): "Erase Bloom data on this device";
// - cloud account: no device-only reset (it would also delete her synced data but keep the account,
//   which is confusing); "Delete my account" opens the Privacy Centre's full deletion flow instead.
export default function Profile({ onBack, user, setUser, openSection }) {
  var { t, lang, setLang } = useT();
  var [name, setName] = useState(user.name || "");
  var [clinic, setClinic] = useState(user.clinic || "");
  var [protocol, setProtocol] = useState(user.protocol || "");
  var [saved, setSaved] = useState(false);
  var [confirmReset, setConfirmReset] = useState(false);
  var isDemo = user.id === "demo";
  var isCloud = !!user.cloud;

  function save() {
    if (!name.trim()) return;
    setUser(auth.updateUser({ name: name.trim(), clinic: clinic.trim(), protocol: protocol }));
    setSaved(true);
    setTimeout(function () { setSaved(false); }, 2000);
  }

  async function signOut() {
    await auth.signOut();
    setUser(null);
  }

  async function resetDevice() {
    await store.resetDemo();
    setUser(null);
  }

  var inputCls = "w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none focus:border-bloom-accent";

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-5">{t("prof.title")}</h1>
        <div className="bg-white rounded-2xl p-5 border border-bloom-border mb-4">
          <div className="flex flex-col items-center mb-5">
            <div className="w-16 h-16 rounded-full bg-bloom-accent flex items-center justify-center mb-2">
              <span className="text-white text-2xl font-bold">{(name || "S")[0].toUpperCase()}</span>
            </div>
            <p className="text-bloom-text font-bold"><bdi>{name}</bdi></p>
            <p className="text-bloom-muted text-xs" dir="ltr">{user.email}</p>
          </div>
          <div className="mb-4">
            <label htmlFor="p-name" className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 block">{t("prof.name")}</label>
            <input id="p-name" value={name} onChange={function (e) { setName(e.target.value); }} className={inputCls} />
          </div>
          <div className="mb-4">
            <label htmlFor="p-clinic" className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 block">{t("prof.clinic")}</label>
            <input id="p-clinic" value={clinic} onChange={function (e) { setClinic(e.target.value); }} placeholder={t("prof.clinicPh")} className={inputCls} />
          </div>
          <div className="mb-5">
            <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2">{t("prof.protocol")}</p>
            <div className="flex gap-2 flex-wrap">
              {PROTOCOLS.map(function (p) {
                var on = protocol === p;
                return (
                  <button key={p} onClick={function () { setProtocol(p); }} aria-pressed={on}
                    className="px-3 py-2 rounded-full border-2 text-xs font-semibold transition-all"
                    style={{ borderColor: on ? "#9B6DC5" : "#E8E0DB", backgroundColor: on ? "#9B6DC515" : "white", color: on ? "#9B6DC5" : "#7A6880" }}>
                    <bdi>{p}</bdi>
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={save} className="w-full py-4 rounded-2xl text-white font-semibold transition-all" style={{ backgroundColor: saved ? "#4ABFB0" : "#9B6DC5" }}>
            {saved ? t("prof.saved") : t("prof.save")}
          </button>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-4">
          <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-3">{t("lang")}</p>
          <div className="flex gap-2" role="group" aria-label={t("lang")}>
            {LANGS.map(function (l) {
              var on = lang === l.id;
              return (
                <button key={l.id} onClick={function () { setLang(l.id); }} aria-pressed={on}
                  className="flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold"
                  style={{ borderColor: on ? "#9B6DC5" : "#E8E0DB", backgroundColor: on ? "#9B6DC515" : "white", color: on ? "#9B6DC5" : "#7A6880" }}>
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-bloom-border mb-4 divide-y divide-bloom-border">
          <a href={siteUrl("/privacy")} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center px-4 py-3.5 text-sm text-bloom-text">
            {t("legal.privacy")} <span className="text-bloom-dim flip-rtl">→</span>
          </a>
          <a href={siteUrl("/support")} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center px-4 py-3.5 text-sm text-bloom-text">
            {t("legal.support")} <span className="text-bloom-dim flip-rtl">→</span>
          </a>
        </div>

        <button onClick={signOut} className="w-full py-4 rounded-2xl border border-red-300 text-red-500 font-semibold text-sm mb-3">{t("prof.signOut")}</button>

        {isCloud && !isDemo ? (
          <button onClick={function () { if (openSection) openSection("privacy"); }} className="w-full py-3 text-bloom-muted text-xs underline">{t("prof.deleteAccount")}</button>
        ) : !confirmReset ? (
          <button onClick={function () { setConfirmReset(true); }} className="w-full py-3 text-bloom-dim text-xs">{isDemo ? t("prof.resetDemo") : t("prof.eraseDevice")}</button>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-bloom-border text-center">
            <p className="text-bloom-text text-sm mb-3">{isDemo ? t("prof.resetDemoConfirm") : t("prof.eraseDeviceConfirm")}</p>
            <div className="flex gap-2">
              <button onClick={function () { setConfirmReset(false); }} className="flex-1 py-2.5 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">{t("common.cancel")}</button>
              <button onClick={resetDevice} className="flex-1 py-2.5 rounded-xl bg-bloom-rose text-white text-sm font-semibold">{isDemo ? t("prof.reset") : t("prof.erase")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
