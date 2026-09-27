"use client";
import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Sheet, Label } from "./Common";
import { REVIEW_BOARD, reviewFor } from "../../lib/demo-data";
import { useT } from "../../lib/i18n";

var POLICY = [
  "Written with IVF specialists, in plain language",
  "Checked by a board member in the matching specialty",
  "Based on current clinical guidelines, with sources listed",
  "Re-reviewed at least every 6 months",
  "Never sponsored. No clinic or drug maker pays for content",
];

export function BoardSheet({ cat, onClose }) {
  var r = cat ? reviewFor(cat) : null;
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center gap-2 mb-1">
        <BadgeCheck size={22} className="text-bloom-teal" />
        <h2 className="text-xl font-bold text-bloom-text">Medical Review Board</h2>
      </div>
      <p className="text-bloom-muted text-sm mb-5">Every article, story and Nora guideline in Bloom is reviewed by specialists before you see it.</p>

      {r && (
        <div className="bg-bloom-surface rounded-2xl p-4 mb-4">
          <Label className="mb-2">This content</Label>
          <p className="text-bloom-text text-sm font-semibold">Reviewed by {r.reviewer.name}, {r.reviewer.creds}</p>
          <p className="text-bloom-muted text-xs mb-3">{r.reviewer.role} · {r.date}</p>
          <p className="text-bloom-muted text-xs font-semibold mb-1">Sources</p>
          <ul className="list-disc ps-4">
            {r.sources.map(function (s) { return <li key={s} className="text-bloom-muted text-xs mb-0.5">{s}</li>; })}
          </ul>
        </div>
      )}

      <Label className="mb-2">The board</Label>
      {REVIEW_BOARD.map(function (m) {
        return (
          <div key={m.id} className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: m.color }}>
              {m.name.replace("Dr. ", "").split(" ").map(function (w) { return w[0]; }).join("")}
            </span>
            <div><p className="text-bloom-text text-sm font-semibold">{m.name}, {m.creds}</p><p className="text-bloom-muted text-xs">{m.role}</p></div>
          </div>
        );
      })}

      <Label className="mt-4 mb-2">How we make content</Label>
      {POLICY.map(function (p) {
        return <p key={p} className="text-bloom-muted text-sm mb-1.5">✓ {p}</p>;
      })}
      <p className="text-bloom-dim text-[11px] leading-relaxed mt-4">Demo: the board members shown are illustrative placeholders until Bloom&apos;s board is appointed. Bloom gives general information, not medical advice. Always confirm with your clinic.</p>
    </Sheet>
  );
}

// Small tappable "Medically reviewed" line for articles and stories.
export default function ReviewedBadge({ cat, tone = "light", onToggle }) {
  var [open, setOpenState] = useState(false);
  function setOpen(v) { setOpenState(v); if (onToggle) onToggle(v); }
  var { t } = useT();
  var r = reviewFor(cat);
  return (
    <>
      <button onClick={function (e) { e.stopPropagation(); setOpen(true); }}
        className={"relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 " + (tone === "light" ? "bg-white/80 text-bloom-teal border border-bloom-teal/30" : "bg-bloom-teal/10 text-bloom-teal")}>
        <BadgeCheck size={14} />
        {t("review.by", { name: r.reviewer.name, date: r.date })}
      </button>
      {open && <BoardSheet cat={cat} onClose={function () { setOpen(false); }} />}
    </>
  );
}
