"use client";
import { useState } from "react";
const CONTENT = [
  {
    title: "Prepare your clinic questions",
    body: "Write down the questions you want to ask before each appointment. Keep a copy of the answers and the date your clinic gave you the instructions.",
  },
  {
    title: "Make room for your feelings",
    body: "You can use a check-in or journal entry to put your feelings into words. If you want support, ask your clinic which counselling services are available.",
  },
  {
    title: "Keep your records together",
    body: "Copy medication instructions and result units exactly as provided. If anything is unclear or instructions change, contact your clinic before acting on them.",
  },
];
export default function InsightsScreen() {
  const [selected, setSelected] = useState(null);
  return (
    <div className="p-4">
      <h1 className="text-2xl py-4 font-semibold">Insights</h1>
      <p className="text-bloom-muted text-sm mb-4">
        Practical support for organising your journey. Clinical articles and
        videos are awaiting qualified review.
      </p>
      {selected ? (
        <div className="card">
          <button
            className="text-bloom-accent mb-4"
            onClick={() => setSelected(null)}
          >
            ← Back to insights
          </button>
          <h2 className="text-xl mb-3">{selected.title}</h2>
          <p className="text-bloom-muted">{selected.body}</p>
        </div>
      ) : (
        CONTENT.map((a, i) => (
          <button
            className="card w-full text-left"
            style={{ backgroundColor: ["#F5EEF8", "#EDFAF8", "#FEF9EE"][i] }}
            key={a.title}
            onClick={() => setSelected(a)}
          >
            <span className="text-bloom-accent text-2xl">✦</span>
            <h2 className="font-semibold mt-2">{a.title}</h2>
            <p className="text-xs text-bloom-muted mt-2">Read note →</p>
          </button>
        ))
      )}
    </div>
  );
}
