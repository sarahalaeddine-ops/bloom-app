"use client";
import { useState, useEffect } from "react";
import { BackBtn, Label, Sheet } from "../../ui/Common";
import { Illustration } from "../../ui/Graphics";
import { auth, store, consent } from "../../../lib/store";
import { getCheckins, getMedHistory } from "../../../lib/cycle";
import PinPad from "../../ui/PinPad";
import { hashSecret } from "../../../lib/crypto";
import { cloudEnabled } from "../../../lib/supabase";
import { useT, langInfo } from "../../../lib/i18n";
import { biometricInfo, verifyBiometric, setPrivacyScreen } from "../../../lib/native";
import { siteUrl } from "../../../lib/config";

var PLEDGES = ["priv.p1", "priv.p2", "priv.p3"];

function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={function () { onChange(!on); }}
      className="w-12 h-7 rounded-full relative transition-colors flex-shrink-0" style={{ backgroundColor: on ? "#4ABFB0" : "#E8E0DB" }}>
      <span className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ insetInlineStart: on ? 24 : 4 }} />
    </button>
  );
}

export default function Privacy({ onBack, user, setUser }) {
  var { t, lang } = useT();
  var cloud = cloudEnabled() && !!user.cloud;
  var isDemo = user.id === "demo";
  var [rec, setRec] = useState(function () { return consent.get(); });
  var [savingConsent, setSavingConsent] = useState(false);
  var [hasPin, setHasPin] = useState(function () { return !!store.get("lock_pin", null); });
  var [pinSheet, setPinSheet] = useState(false);
  var [confirmDelete, setConfirmDelete] = useState(false);
  var [msg, setMsg] = useState("");
  var [deleting, setDeleting] = useState(false);
  var [deleteError, setDeleteError] = useState("");
  // Native app only: Face ID / Touch ID / fingerprint unlock on top of the PIN (device setting).
  var [bioKind, setBioKind] = useState(null);
  var [bioOn, setBioOn] = useState(function () { return !!store.get("lock_bio", false); });

  useEffect(function () {
    var live = true;
    biometricInfo().then(function (info) { if (live && info.available) setBioKind(info.kind); });
    return function () { live = false; };
  }, []);

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

  // Grant or withdraw one consent (G11). Withdrawing cloud sync removes her health data from the
  // cloud copy (it stays on this device); withdrawing AI makes Nora answer offline.
  async function setConsentChoice(key, on) {
    var next = { cloud: !!(rec && rec.cloud), ai: !!(rec && rec.ai) };
    next[key] = on;
    setSavingConsent(true);
    var saved = await consent.set(next);
    setSavingConsent(false);
    setRec(saved);
    flash(key === "cloud" ? (on ? t("priv.cloudOn") : t("priv.cloudOff")) : (on ? t("priv.aiOn") : t("priv.aiOff")));
  }

  function consentDate(iso) {
    try { return new Date(iso).toLocaleString(langInfo(lang).locale, { dateStyle: "medium", timeStyle: "short" }); } catch { return iso; }
  }

  function setLock(on) {
    if (on) { setPinSheet(true); return; }
    store.remove("lock_pin");
    store.remove("lock_bio");
    setBioOn(false);
    setHasPin(false);
    setPrivacyScreen(false);
    flash(t("priv.lockOff"));
  }

  async function savePin(pin) {
    store.set("lock_pin", await hashSecret(pin));
    setHasPin(true);
    setPinSheet(false);
    setPrivacyScreen(true); // native: hide her data in the app switcher while the lock is on
    flash(t("priv.lockOn"));
  }

  // Turning biometric unlock on asks for Face ID / fingerprint once, so she knows it works.
  async function setBio(on) {
    if (!on) { store.remove("lock_bio"); setBioOn(false); flash(t("priv.bioOff")); return; }
    var ok = await verifyBiometric({ reason: t("bio.reason"), title: t("bio.title"), cancel: t("common.cancel") });
    if (!ok) { flash(t("priv.bioFailed")); return; }
    store.set("lock_bio", true);
    setBioOn(true);
    flash(t("priv.bioOn"));
  }

  function exportData() {
    var data = {};
    try {
      Object.keys(localStorage).filter(function (k) { return k.indexOf("bloom_") === 0 && k !== "bloom_users" && k !== "bloom_lock_pin" && k !== "bloom_owner" && k.indexOf("bloom_stash_") !== 0; /* other accounts' parked data is never hers to export */ }).forEach(function (k) {
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
          {hasPin && bioKind && (
            <div className="flex items-center gap-3 py-2 border-t border-bloom-border">
              <div className="flex-1">
                <p className="text-bloom-text text-sm font-semibold">{t("priv.bio." + bioKind)}</p>
                <p className="text-bloom-muted text-xs">{t("priv.bio.d")}</p>
              </div>
              <Toggle on={bioOn} onChange={setBio} label={t("priv.bio." + bioKind)} />
            </div>
          )}
        </div>

        {!isDemo && (
          <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
            <Label className="mb-3">{t("priv.consent")}</Label>
            {cloud && (
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1">
                  <p className="text-bloom-text text-sm font-semibold">{t("cons.cloud")}</p>
                  <p className="text-bloom-muted text-xs">{t("cons.cloud.d")}</p>
                </div>
                <Toggle on={!!(rec && rec.cloud)} onChange={function (on) { if (!savingConsent) setConsentChoice("cloud", on); }} label={t("cons.cloud")} />
              </div>
            )}
            <div className={"flex items-center gap-3 py-2" + (cloud ? " border-t border-bloom-border" : "")}>
              <div className="flex-1">
                <p className="text-bloom-text text-sm font-semibold">{t("cons.ai")}</p>
                <p className="text-bloom-muted text-xs">{t("cons.ai.d")}</p>
              </div>
              <Toggle on={!!(rec && rec.ai)} onChange={function (on) { if (!savingConsent) setConsentChoice("ai", on); }} label={t("cons.ai")} />
            </div>
            <p className="text-bloom-muted text-xs mt-2">{t("cons.abroad")} {t("cons.withdraw")}</p>
            <p className="text-bloom-dim text-[10px] mt-2"><bdi>{rec ? t("cons.version", { v: rec.version, date: consentDate(rec.at) }) : t("cons.none")}</bdi></p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-3">{t("priv.holds")}</Label>
          <div className="flex items-center gap-2 mb-2 p-2.5 rounded-xl bg-bloom-surface">
            <span className={"w-2 h-2 rounded-full flex-shrink-0 " + (cloud && consent.syncing() ? "bg-bloom-teal" : "bg-bloom-gold")} />
            <p className="text-bloom-muted text-xs">{cloud ? (consent.syncing() ? t("priv.synced") : t("priv.syncOff")) : t("priv.device")}</p>
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

        <p className="text-xs text-center mb-4">
          <a href={siteUrl("/privacy")} target="_blank" rel="noopener noreferrer" className="text-bloom-accent font-semibold underline">{t("legal.privacy")}</a>
          <span className="text-bloom-dim"> · </span>
          <a href={siteUrl("/support")} target="_blank" rel="noopener noreferrer" className="text-bloom-accent font-semibold underline">{t("legal.support")}</a>
        </p>

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
