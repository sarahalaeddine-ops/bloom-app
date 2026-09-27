"use client";
import { useState } from "react";
import { BackBtn, Label, Sheet } from "../../ui/Common";
import { Illustration } from "../../ui/Graphics";
import { auth, store } from "../../../lib/store";
import { getCheckins, getMedHistory } from "../../../lib/cycle";
import PinPad from "../../ui/PinPad";
import { hashSecret } from "../../../lib/crypto";
import { cloudEnabled } from "../../../lib/supabase";
import { useT } from "../../../lib/i18n";

var PLEDGES = ["priv.p1", "priv.p2", "priv.p3"];

function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={function () { onChange(!on); }}
      className="w-12 h-7 rounded-full relative transition-colors flex-shrink-0" style={{ backgroundColor: on ? "#4ABFB0" : "#E8E0DB" }}>
      <span className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: on ? 24 : 4 }} />
    </button>
  );
}

export default function Privacy({ onBack, user, setUser }) {
  var { t } = useT();
  var cloud = cloudEnabled() && !!user.cloud;
  var [hasPin, setHasPin] = useState(function () { return !!store.get("lock_pin", null); });
  var [pinSheet, setPinSheet] = useState(false);
  var [confirmDelete, setConfirmDelete] = useState(false);
  var [msg, setMsg] = useState("");
  var [deleting, setDeleting] = useState(false);
  var [deleteError, setDeleteError] = useState("");

  var counts = [
    [t("priv.cCheckins"), getCheckins().length],
    [t("priv.cMeds"), getMedHistory().length],
    [t("priv.cSecret"), store.get("secret_vault", null) ? t("priv.encrypted") : t("priv.notSet")],
    [t("priv.cNora"), store.get("nora", []).length],
  ];

  function flash(text) { setMsg(text); setTimeout(function () { setMsg(""); }, 2500); }

  function setAnon(on) {
    setUser(auth.updateUser({ anonymous: on }));
    flash(on ? t("priv.anonOn") : t("priv.anonOff"));
  }

  function setLock(on) {
    if (on) { setPinSheet(true); return; }
    store.remove("lock_pin");
    setHasPin(false);
    flash(t("priv.lockOff"));
  }

  async function savePin(pin) {
    store.set("lock_pin", await hashSecret(pin));
    setHasPin(true);
    setPinSheet(false);
    flash(t("priv.lockOn"));
  }

  function exportData() {
    var data = {};
    try {
      Object.keys(localStorage).filter(function (k) { return k.indexOf("bloom_") === 0 && k !== "bloom_users" && k !== "bloom_lock_pin"; }).forEach(function (k) {
        data[k.replace("bloom_", "")] = JSON.parse(localStorage.getItem(k));
      });
    } catch {}
    if (data.user) { data.user = { ...data.user }; delete data.user.password; }
    var blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), app: "Bloom", data: data }, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bloom-my-data.json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    flash(t("priv.downloaded"));
  }

  // Cloud: the server deletes her account and synced data, then the device is wiped (G4).
  // Local: wipes this device. On failure nothing is deleted and she can try again.
  async function deleteAll() {
    setDeleting(true);
    setDeleteError("");
    var res = await store.eraseAccount();
    setDeleting(false);
    if (res.ok) { setUser(null); return; }
    setDeleteError(res.error === "session" ? t("priv.deleteSession") : t("priv.deleteFailed"));
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <div className="flex flex-col items-center text-center mb-5">
          <Illustration name="shield" size={110} />
          <h1 className="text-2xl font-bold text-bloom-text mt-3 mb-1">{t("priv.title")}</h1>
          <p className="text-bloom-muted text-sm">{t("priv.sub")}</p>
        </div>

        {msg && <p className="text-bloom-teal text-sm text-center font-semibold mb-3" role="status">{msg}</p>}

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-3">{t("priv.controls")}</Label>
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1">
              <p className="text-bloom-text text-sm font-semibold">{t("priv.anon")}</p>
              <p className="text-bloom-muted text-xs">{t("priv.anon.d")}</p>
            </div>
            <Toggle on={!!user.anonymous} onChange={setAnon} label={t("priv.anon")} />
          </div>
          <div className="flex items-center gap-3 py-2 border-t border-bloom-border">
            <div className="flex-1">
              <p className="text-bloom-text text-sm font-semibold">{t("priv.lock")}</p>
              <p className="text-bloom-muted text-xs">{t("priv.lock.d")}</p>
            </div>
            <Toggle on={hasPin} onChange={setLock} label={t("priv.lock")} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-3">{t("priv.holds")}</Label>
          <div className="flex items-center gap-2 mb-2 p-2.5 rounded-xl bg-bloom-surface">
            <span className={"w-2 h-2 rounded-full flex-shrink-0 " + (cloud ? "bg-bloom-teal" : "bg-bloom-gold")} />
            <p className="text-bloom-muted text-xs">{cloud ? t("priv.synced") : t("priv.device")}</p>
          </div>
          <p className="text-bloom-muted text-xs mb-2 px-1">
            <span className="text-bloom-text font-semibold">{t("priv.noraLabel")}</span>
            {t("priv.noraBody")}
          </p>
          {counts.map(function (c) {
            return (
              <div key={c[0]} className="flex justify-between py-2 border-t border-bloom-border first:border-0 text-sm">
                <span className="text-bloom-muted">{c[0]}</span><span className="text-bloom-text font-semibold">{c[1]}</span>
              </div>
            );
          })}
          <button onClick={exportData} className="w-full mt-3 py-3 rounded-xl bg-bloom-surface text-bloom-text font-semibold text-sm">{t("priv.download")}</button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-4">
          <Label className="mb-3">{t("priv.promises")}</Label>
          {PLEDGES.map(function (p) {
            return (
              <div key={p} className="flex gap-3 mb-3 last:mb-0">
                <span className="w-6 h-6 rounded-full bg-bloom-teal/15 text-bloom-teal flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                <div><p className="text-bloom-text text-sm font-semibold">{t(p)}</p><p className="text-bloom-muted text-xs">{t(p + ".d")}</p></div>
              </div>
            );
          })}
        </div>

        {!confirmDelete ? (
          <button onClick={function () { setConfirmDelete(true); }} className="w-full py-3.5 rounded-2xl border border-red-300 text-red-500 font-semibold text-sm">{t("priv.delete")}</button>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-red-200 text-center">
            <p className="text-bloom-text text-sm mb-3">{cloud ? t("priv.deleteCloud") : t("priv.deleteLocal")}</p>
            {deleteError && <p className="text-red-500 text-xs mb-3" role="alert">{deleteError}</p>}
            <div className="flex gap-2">
              <button onClick={function () { setConfirmDelete(false); setDeleteError(""); }} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">{t("common.cancel")}</button>
              <button onClick={deleteAll} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-60">{deleting ? t("priv.deleting") : t("priv.deleteConfirm")}</button>
            </div>
          </div>
        )}
      </div>

      {pinSheet && (
        <Sheet onClose={function () { setPinSheet(false); }}>
          <PinPad title={t("priv.pinTitle")} confirm onDone={savePin} />
        </Sheet>
      )}
    </div>
  );
}
