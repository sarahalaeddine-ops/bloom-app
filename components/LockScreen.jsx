"use client";
import { useState, useEffect, useRef } from "react";
import { ScanFace, Fingerprint } from "lucide-react";
import { store } from "../lib/store";
import { BloomFlower, Blobs } from "./ui/Graphics";
import PinPad from "./ui/PinPad";
import { verifySecret } from "../lib/crypto";
import { useT } from "../lib/i18n";
import { biometricInfo, verifyBiometric } from "../lib/native";

// App lock. PIN always works. In the native app, if she turned on Face ID / fingerprint unlock in the
// Privacy Centre (bloom_lock_bio, device only), the system prompt opens straight away; cancelling it
// leaves the PIN pad, and a button lets her try biometrics again.
export default function LockScreen({ onUnlock, onForgot }) {
  var { t } = useT();
  var [forgot, setForgot] = useState(false);
  var [bio, setBio] = useState(null);
  var asked = useRef(false);

  async function tryBiometric() {
    var ok = await verifyBiometric({ reason: t("bio.reason"), title: t("bio.title"), cancel: t("bio.cancel") });
    if (ok) onUnlock();
  }

  useEffect(function () {
    if (!store.get("lock_bio", false)) return;
    var live = true;
    biometricInfo().then(function (info) {
      if (!live || !info.available) return;
      setBio(info.kind);
      if (!asked.current) { asked.current = true; tryBiometric(); }
    });
    return function () { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ask once when the lock screen opens
  }, []);

  async function check(pin) {
    var stored = store.get("lock_pin", null);
    var ok = typeof stored === "string" ? pin === stored : await verifySecret(pin, stored);
    if (ok) onUnlock();
    return ok;
  }

  var BioIcon = bio === "face" ? ScanFace : Fingerprint;

  return (
    <div className="relative min-h-screen bg-bloom-bg flex flex-col items-center justify-center px-6 overflow-hidden">
      <Blobs />
      <div className="relative flex flex-col items-center">
        <BloomFlower size={64} className="mb-2" />
        <p className="logo mb-8" style={{ fontSize: "36px" }}>bloom</p>
        <PinPad title={t("lock.enter")} onDone={check} />
        {bio && (
          <button onClick={tryBiometric} className="mt-6 flex items-center gap-2 text-bloom-accent text-sm font-semibold">
            <BioIcon size={20} /> {t("priv.bio." + bio)}
          </button>
        )}
        {!forgot ? (
          <button onClick={function () { setForgot(true); }} className="text-bloom-dim text-xs mt-8">{t("lock.forgot")}</button>
        ) : (
          <div className="text-center mt-6">
            <p className="text-bloom-muted text-xs mb-2">{t("lock.forgotBody")}</p>
            <button onClick={onForgot} className="text-bloom-accent text-sm font-semibold">{t("lock.signOut")}</button>
          </div>
        )}
      </div>
    </div>
  );
}
