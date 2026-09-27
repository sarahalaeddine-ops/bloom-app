"use client";
import { useState } from "react";
import { store } from "../lib/store";
import { BloomFlower, Blobs } from "./ui/Graphics";
import PinPad from "./ui/PinPad";
import { verifySecret } from "../lib/crypto";

export default function LockScreen({ onUnlock, onForgot }) {
  var [forgot, setForgot] = useState(false);

  async function check(pin) {
    var stored = store.get("lock_pin", null);
    var ok = typeof stored === "string" ? pin === stored : await verifySecret(pin, stored);
    if (ok) onUnlock();
    return ok;
  }

  return (
    <div className="relative min-h-screen bg-bloom-bg flex flex-col items-center justify-center px-6 overflow-hidden">
      <Blobs />
      <div className="relative flex flex-col items-center">
        <BloomFlower size={64} className="mb-2" />
        <p className="logo mb-8" style={{ fontSize: "36px" }}>bloom</p>
        <PinPad title="Enter your PIN" onDone={check} />
        {!forgot ? (
          <button onClick={function () { setForgot(true); }} className="text-bloom-dim text-xs mt-8">Forgot PIN?</button>
        ) : (
          <div className="text-center mt-6">
            <p className="text-bloom-muted text-xs mb-2">Sign out and remove the lock. You can sign back in with your email.</p>
            <button onClick={onForgot} className="text-bloom-accent text-sm font-semibold">Sign out</button>
          </div>
        )}
      </div>
    </div>
  );
}
