"use client";
import ScreenHero from "../../ui/ScreenHero";
import { useState } from "react";
import { BackBtn, Label, Sheet } from "../../ui/Common";
import { auth, store } from "../../../lib/store";
import { getCheckins, getMedHistory } from "../../../lib/cycle";
import PinPad from "../../ui/PinPad";
import { hashSecret } from "../../../lib/crypto";
import { cloudEnabled } from "../../../lib/supabase";

var PLEDGES = [
  ["Never sold", "Your health data is never sold or used for advertising."],
  ["Never shared without you", "Your clinic and partner only see what you choose to share."],
  ["Secret Space is end-to-end encrypted", "Encrypted on your device with your passphrase (AES-256). We can't read it."],
];

function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={function () { onChange(!on); }}
      className="w-12 h-7 rounded-full relative transition-colors flex-shrink-0" style={{ backgroundColor: on ? "#4ABFB0" : "#E8E0DB" }}>
      <span className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: on ? 24 : 4 }} />
    </button>
  );
}

export default function Privacy({ onBack, user, setUser }) {
  var [hasPin, setHasPin] = useState(function () { return !!store.get("lock_pin", null); });
  var [pinSheet, setPinSheet] = useState(false);
  var [confirmDelete, setConfirmDelete] = useState(false);
  var [msg, setMsg] = useState("");

  var counts = [
    ["Check-ins", getCheckins().length],
    ["Medication logs", getMedHistory().length],
    ["Secret Space", store.get("secret_vault", null) ? "Encrypted 🔒" : "Not set up"],
    ["Nora messages", store.get("nora", []).length],
  ];

  function flash(t) { setMsg(t); setTimeout(function () { setMsg(""); }, 2500); }

  function setAnon(on) {
    setUser(auth.updateUser({ anonymous: on }));
    flash(on ? "Anonymous mode on. Your name is hidden." : "Anonymous mode off.");
  }

  function setLock(on) {
    if (on) { setPinSheet(true); return; }
    store.remove("lock_pin");
    setHasPin(false);
    flash("App lock off.");
  }

  async function savePin(pin) {
    store.set("lock_pin", await hashSecret(pin));
    setHasPin(true);
    setPinSheet(false);
    flash("App lock on. You'll need your PIN to open Bloom.");
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
    flash("Your data was downloaded ✓");
  }

  async function deleteAll() {
    await store.resetDemo();
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <ScreenHero art="shield" title="Privacy Centre" sub="Your journey is yours. You decide who sees what." tint="teal" />

        {msg && <p className="text-bloom-teal text-sm text-center font-semibold mb-3" role="status">{msg}</p>}

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-3">Controls</Label>
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1">
              <p className="text-bloom-text text-sm font-semibold">Anonymous mode</p>
              <p className="text-bloom-muted text-xs">Hide your name across the app, handy for screenshots and shared screens.</p>
            </div>
            <Toggle on={!!user.anonymous} onChange={setAnon} label="Anonymous mode" />
          </div>
          <div className="flex items-center gap-3 py-2 border-t border-bloom-border">
            <div className="flex-1">
              <p className="text-bloom-text text-sm font-semibold">App lock</p>
              <p className="text-bloom-muted text-xs">Ask for a 4-digit PIN every time Bloom opens.</p>
            </div>
            <Toggle on={hasPin} onChange={setLock} label="App lock" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <Label className="mb-3">What Bloom holds about you</Label>
          <div className="flex items-center gap-2 mb-2 p-2.5 rounded-xl bg-bloom-surface">
            <span className={"w-2 h-2 rounded-full " + (cloudEnabled() && user.cloud ? "bg-bloom-teal" : "bg-bloom-gold")} />
            <p className="text-bloom-muted text-xs">
              {cloudEnabled() && user.cloud ? "Synced securely to your Bloom account (row-level secured, encrypted in transit)." : "Stored only on this device."}
            </p>
          </div>
          {counts.map(function (c) {
            return (
              <div key={c[0]} className="flex justify-between py-2 border-t border-bloom-border first:border-0 text-sm">
                <span className="text-bloom-muted">{c[0]}</span><span className="text-bloom-text font-semibold">{c[1]}</span>
              </div>
            );
          })}
          <button onClick={exportData} className="w-full mt-3 py-3 rounded-xl bg-bloom-surface text-bloom-text font-semibold text-sm">Download my data</button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-4">
          <Label className="mb-3">Our promises</Label>
          {PLEDGES.map(function (p) {
            return (
              <div key={p[0]} className="flex gap-3 mb-3 last:mb-0">
                <span className="w-6 h-6 rounded-full bg-bloom-teal/15 text-bloom-teal flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                <div><p className="text-bloom-text text-sm font-semibold">{p[0]}</p><p className="text-bloom-muted text-xs">{p[1]}</p></div>
              </div>
            );
          })}
        </div>

        {!confirmDelete ? (
          <button onClick={function () { setConfirmDelete(true); }} className="w-full py-3.5 rounded-2xl border border-red-300 text-red-500 font-semibold text-sm">Delete all my data</button>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-red-200 text-center">
            <p className="text-bloom-text text-sm mb-3">This permanently deletes your account, check-ins, logs and journal from this device.</p>
            <div className="flex gap-2">
              <button onClick={function () { setConfirmDelete(false); }} className="flex-1 py-2.5 rounded-xl bg-bloom-surface text-bloom-muted text-sm font-semibold">Cancel</button>
              <button onClick={deleteAll} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold">Delete everything</button>
            </div>
          </div>
        )}
      </div>

      {pinSheet && (
        <Sheet onClose={function () { setPinSheet(false); }}>
          <PinPad title="Choose a 4-digit PIN" confirm onDone={savePin} />
        </Sheet>
      )}
    </div>
  );
}
