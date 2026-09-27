"use client";
import ScreenHero from "../../ui/ScreenHero";
import { PersonAvatar } from "../../ui/Graphics";
import { useState } from "react";
import { BackBtn, Label, Sheet } from "../../ui/Common";
import { store } from "../../../lib/store";
import { THERAPISTS } from "../../../lib/demo-data";

var SLOTS = ["Tomorrow 2:00 PM", "Thursday 11:00 AM", "Friday 6:00 PM", "Monday 9:30 AM"];

export default function Therapy({ onBack }) {
  var [bookings, setBookings] = useState(function () { return store.get("bookings", []); });
  var [pick, setPick] = useState(null);
  var [slot, setSlot] = useState("");
  var usedFree = bookings.some(function (b) { return b.free; });

  function confirm() {
    var free = !usedFree && pick.id === 1;
    var next = [{ id: Date.now(), therapist: pick.name, when: slot, free: free }].concat(bookings);
    setBookings(next);
    store.set("bookings", next);
    setPick(null);
  }

  function cancel(id) {
    var next = bookings.filter(function (b) { return b.id !== id; });
    setBookings(next);
    store.set("bookings", next);
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <ScreenHero art="therapy" title="Therapy & Coaching" sub="IVF-specialist therapists, online" tint="teal" />

        {!usedFree && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-4">
            <p className="text-bloom-teal text-sm font-bold mb-1">Your free session is waiting</p>
            <p className="text-bloom-muted text-xs leading-relaxed">One free session is part of every Bloom account. We made it mandatory because most women who need it would never book it on their own.</p>
          </div>
        )}

        {bookings.length > 0 && (
          <>
            <Label className="mb-2">Your sessions</Label>
            {bookings.map(function (b) {
              return (
                <div key={b.id} className="bg-white rounded-2xl p-4 border border-bloom-teal/40 mb-2 flex items-center gap-3">
                  <span className="text-bloom-teal text-lg">✓</span>
                  <div className="flex-1">
                    <p className="text-bloom-text text-sm font-semibold">{b.therapist}</p>
                    <p className="text-bloom-muted text-xs">{b.when} · Video call{b.free ? " · Free" : ""}</p>
                  </div>
                  <button onClick={function () { cancel(b.id); }} className="text-bloom-dim text-xs">Cancel</button>
                </div>
              );
            })}
            <div className="h-3" />
          </>
        )}

        <Label className="mb-2">Therapists</Label>
        {THERAPISTS.map(function (t) {
          return (
            <div key={t.id} className="bg-white rounded-2xl p-4 border border-bloom-border mb-2">
              <div className="flex items-center gap-3 mb-3">
                <PersonAvatar seed={t.name + t.id} size={52} />
                <div className="flex-1">
                  <p className="text-bloom-text text-sm font-bold">{t.name}</p>
                  <p className="text-bloom-muted text-xs">{t.title} · {t.years} yrs IVF support</p>
                  <p className="text-bloom-dim text-xs">{t.langs}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-bloom-dim text-[10px] uppercase tracking-wider">Next available</p>
                  <p className="text-bloom-text text-xs font-semibold">{t.next} · {t.id === 1 && !usedFree ? "Free" : t.price}</p>
                </div>
                <button onClick={function () { setPick(t); setSlot(t.next); }} className="text-white text-xs font-semibold px-4 py-2 rounded-xl" style={{ backgroundColor: t.color }}>Book</button>
              </div>
            </div>
          );
        })}
        <p className="text-bloom-dim text-xs text-center mt-3">In crisis? Please contact your local emergency number right away.</p>
      </div>

      {pick && (
        <Sheet onClose={function () { setPick(null); }}>
          <h3 className="text-lg font-bold text-bloom-text mb-1">Book with {pick.name}</h3>
          <p className="text-bloom-muted text-sm mb-4">50-minute video session</p>
          <Label className="mb-2">Choose a time</Label>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {SLOTS.map(function (s) {
              var on = slot === s;
              return (
                <button key={s} onClick={function () { setSlot(s); }} aria-pressed={on} className="py-2.5 rounded-xl border text-xs font-semibold"
                  style={{ borderColor: on ? pick.color : "#E8E0DB", backgroundColor: on ? pick.color + "15" : "white", color: on ? pick.color : "#7A6880" }}>{s}</button>
              );
            })}
          </div>
          <button onClick={confirm} className="w-full py-3.5 rounded-xl text-white font-semibold" style={{ backgroundColor: pick.color }}>
            Confirm booking{pick.id === 1 && !usedFree ? " · Free" : ""}
          </button>
          <p className="text-bloom-dim text-xs text-center mt-3">Demo booking · no payment is taken</p>
        </Sheet>
      )}
    </div>
  );
}
