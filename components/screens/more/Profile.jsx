"use client";
import { useState } from "react";
import { BackBtn } from "../../ui/Common";
import { auth, store } from "../../../lib/store";
import { useT, LANGS } from "../../../lib/i18n";

var PROTOCOLS = ["Antagonist", "Long Lupron", "Mini IVF"];

export default function Profile({ onBack, user, setUser }) {
  var { t, lang, setLang } = useT();
  var [name, setName] = useState(user.name || "");
  var [clinic, setClinic] = useState(user.clinic || "");
  var [protocol, setProtocol] = useState(user.protocol || "Antagonist");
  var [saved, setSaved] = useState(false);
  var [confirmReset, setConfirmReset] = useState(false);

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

  async function resetDemo() {
    await store.resetDemo();
    setUser(null);
  }

  var inputCls = "w-full bg-bloom-surface border border-bloom-border rounded-xl px-4 py-3 text-bloom-text text-sm outline-none focus:border-bloom-accent";

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <h1 className="text-2xl font-bold text-bloom-text mb-5">My Profile</h1>
        <div className="bg-white rounded-2xl p-5 border border-bloom-border mb-4">
          <div className="flex flex-col items-center mb-5">
            <div className="w-16 h-16 rounded-full bg-bloom-accent flex items-center justify-center mb-2">
              <span className="text-white text-2xl font-bold">{(name || "S")[0].toUpperCase()}</span>
            </div>
            <p className="text-bloom-text font-bold">{name || "Sarah"}</p>
            <p className="text-bloom-muted text-xs">{user.email}</p>
          </div>
          <div className="mb-4">
            <label htmlFor="p-name" className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 block">Your name</label>
            <input id="p-name" value={name} onChange={function (e) { setName(e.target.value); }} className={inputCls} />
          </div>
          <div className="mb-4">
            <label htmlFor="p-clinic" className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2 block">Clinic</label>
            <input id="p-clinic" value={clinic} onChange={function (e) { setClinic(e.target.value); }} placeholder="Emirates Fertility Centre" className={inputCls} />
          </div>
          <div className="mb-5">
            <p className="text-bloom-muted text-xs uppercase tracking-wider font-semibold mb-2">Protocol</p>
            <div className="flex gap-2 flex-wrap">
              {PROTOCOLS.map(function (p) {
                var on = protocol === p;
                return (
                  <button key={p} onClick={function () { setProtocol(p); }} aria-pressed={on}
                    className="px-3 py-2 rounded-full border-2 text-xs font-semibold transition-all"
                    style={{ borderColor: on ? "#9B6DC5" : "#E8E0DB", backgroundColor: on ? "#9B6DC515" : "white", color: on ? "#9B6DC5" : "#7A6880" }}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={save} className="w-full py-4 rounded-2xl text-white font-semibold transition-all" style={{ backgroundColor: saved ? "#4ABFB0" : "#9B6DC5" }}>
            {saved ? "Saved ✓" : "Save Changes"}
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
        <button onClick={signOut} className="w-full py-4 rounded-2xl border border-red-300 text-red-500 font-semibold text-sm mb-3">Sign Out</button>

        {!confirmReset ? (
          <button onClick={function () { setConfirmReset(true); }} className="w-full py-3 text-bloom-dim text-xs">Reset demo data</button>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-bloom-border text-center">
            <p className="text-bloom-text text-sm mb-3">Clear all accounts, check-ins and chats on this device?</p>
            <div className="flex gap-2">
              <button onClick={function () { setConfirmReset(false); }} className="flex-1 py-2.5 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">Cancel</button>
              <button onClick={resetDemo} className="flex-1 py-2.5 rounded-xl bg-bloom-rose text-white text-sm font-semibold">Reset</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
