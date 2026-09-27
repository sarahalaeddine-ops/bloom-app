"use client";
import { useState } from "react";
import { Delete } from "lucide-react";

// 4-digit PIN entry. With `confirm`, asks twice and only calls onDone when both match.
// Without it, onDone(pin) returns (or resolves to) true/false to say whether the PIN was right.
export default function PinPad({ title, confirm, onDone }) {
  var [pin, setPin] = useState("");
  var [first, setFirst] = useState(null);
  var [error, setError] = useState("");

  function press(d) {
    if (pin.length >= 4) return;
    var next = pin + d;
    setPin(next);
    setError("");
    if (next.length < 4) return;
    setTimeout(function () {
      if (confirm && first === null) { setFirst(next); setPin(""); return; }
      if (confirm && first !== next) { setFirst(null); setPin(""); setError("PINs didn't match. Try again."); return; }
      Promise.resolve(onDone(next)).then(function (ok) {
        if (ok === false) { setPin(""); setError("Wrong PIN. Try again."); }
      });
    }, 150);
  }

  var heading = confirm && first !== null ? "Enter it again to confirm" : title;

  return (
    <div className="flex flex-col items-center">
      <p className="text-bloom-text font-semibold mb-4">{heading}</p>
      <div className="flex gap-3 mb-2" aria-label={pin.length + " of 4 digits entered"}>
        {[0, 1, 2, 3].map(function (i) {
          return <span key={i} className="w-3.5 h-3.5 rounded-full border-2 border-bloom-accent transition-colors" style={{ backgroundColor: i < pin.length ? "#9B6DC5" : "transparent" }} />;
        })}
      </div>
      <p className="text-red-500 text-xs h-5 mb-2" role="alert">{error}</p>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(function (k, i) {
          if (!k) return <span key={i} />;
          if (k === "del") return (
            <button key={i} onClick={function () { setPin(pin.slice(0, -1)); }} aria-label="Delete digit" className="w-16 h-16 rounded-full flex items-center justify-center text-bloom-muted">
              <Delete size={22} />
            </button>
          );
          return (
            <button key={i} onClick={function () { press(k); }} className="w-16 h-16 rounded-full bg-bloom-surface text-bloom-text text-2xl font-light active:bg-purple-100">{k}</button>
          );
        })}
      </div>
    </div>
  );
}
