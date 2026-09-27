"use client";
import ScreenHero from "../../ui/ScreenHero";
import { FruitSize } from "../../ui/Graphics";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { store } from "../../../lib/store";
import { PREGNANCY_WEEKS } from "../../../lib/demo-data";

export default function Pregnancy({ onBack }) {
  var [idx, setIdx] = useState(function () { return store.get("pregWeek", 2); });
  var w = PREGNANCY_WEEKS[idx];

  function go(i) {
    var n = Math.max(0, Math.min(PREGNANCY_WEEKS.length - 1, i));
    setIdx(n);
    store.set("pregWeek", n);
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <ScreenHero art="baby" title="Pregnancy Journey" sub="Week by week, after IVF" tint="rose" />

        <div className="rounded-2xl p-6 mb-3 text-center border border-bloom-rose/30" style={{ backgroundColor: "#FEF0F2" }}>
          <p className="text-xs uppercase tracking-wider font-semibold text-bloom-rose mb-1">Week</p>
          <p className="font-bold text-bloom-rose" style={{ fontSize: "64px", lineHeight: 1, letterSpacing: "-3px" }}>{w.week}</p>
          <div className="my-4 flex justify-center"><FruitSize size={w.size} px={128} /></div>
          <p className="text-bloom-muted text-sm">Your baby is about the size of <b className="text-bloom-text">{w.size}</b></p>
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={function () { go(idx - 1); }} disabled={idx === 0} className="flex-1 py-3 rounded-xl bg-white border border-bloom-border text-bloom-muted text-sm font-semibold disabled:opacity-40">← Previous</button>
          <button onClick={function () { go(idx + 1); }} disabled={idx === PREGNANCY_WEEKS.length - 1} className="flex-1 py-3 rounded-xl bg-bloom-rose text-white text-sm font-semibold disabled:opacity-40">Next →</button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-bloom-border mb-4">
          <Label className="mb-2">This week</Label>
          <p className="text-bloom-text text-sm leading-relaxed">{w.body}</p>
        </div>

        <Label className="mb-2">Jump to week</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {PREGNANCY_WEEKS.map(function (x, i) {
            var on = i === idx;
            return (
              <button key={x.week} onClick={function () { go(i); }} aria-pressed={on} className="w-11 h-11 rounded-full text-sm font-semibold"
                style={{ backgroundColor: on ? "#E07A8A" : "#F0EBE8", color: on ? "white" : "#7A6880" }}>{x.week}</button>
            );
          })}
        </div>
        <p className="text-bloom-dim text-xs text-center">Pregnancy after IVF can feel scary too. Your feelings still belong here.</p>
      </div>
    </div>
  );
}
