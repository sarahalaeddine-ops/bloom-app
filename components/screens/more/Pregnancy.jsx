"use client";
import ScreenHero from "../../ui/ScreenHero";
import { FruitSize } from "../../ui/Graphics";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { store } from "../../../lib/store";
import { PREGNANCY_WEEKS } from "../../../lib/demo-data";
import { useT } from "../../../lib/i18n";

export default function Pregnancy({ onBack }) {
  var { t } = useT();
  var [idx, setIdx] = useState(function () { return store.get("pregWeek", 2); });
  var w = PREGNANCY_WEEKS[idx] || PREGNANCY_WEEKS[0];
  var sizeParts = t("preg.size").split("{size}");

  function go(i) {
    var n = Math.max(0, Math.min(PREGNANCY_WEEKS.length - 1, i));
    setIdx(n);
    store.set("pregWeek", n);
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <ScreenHero art="baby" title={t("sec.pregnant")} sub={t("preg.sub")} tint="rose" />

        <div className="rounded-2xl p-6 mb-3 text-center border border-bloom-rose/30" style={{ backgroundColor: "#FEF0F2" }}>
          <p className="text-xs uppercase tracking-wider font-semibold text-bloom-rose mb-1">{t("preg.week")}</p>
          <p className="font-bold text-bloom-rose" style={{ fontSize: "64px", lineHeight: 1, letterSpacing: "-3px" }}>{w.week}</p>
          <div className="my-4 flex justify-center"><FruitSize size={w.fruit} label={t("preg.w" + w.week + ".size")} px={128} /></div>
          <p className="text-bloom-muted text-sm">{sizeParts[0]}<b className="text-bloom-text">{t("preg.w" + w.week + ".size")}</b>{sizeParts[1] || ""}</p>
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={function () { go(idx - 1); }} disabled={idx === 0} className="flex-1 py-3 rounded-xl bg-white border border-bloom-border text-bloom-muted text-sm font-semibold disabled:opacity-40"><span className="flip-rtl">←</span> {t("preg.prev")}</button>
          <button onClick={function () { go(idx + 1); }} disabled={idx === PREGNANCY_WEEKS.length - 1} className="flex-1 py-3 rounded-xl bg-bloom-rose text-white text-sm font-semibold disabled:opacity-40">{t("preg.next")} <span className="flip-rtl">→</span></button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-bloom-border mb-4">
          <Label className="mb-2">{t("preg.thisWeek")}</Label>
          <p className="text-bloom-text text-sm leading-relaxed">{t("preg.w" + w.week + ".body")}</p>
        </div>

        <Label className="mb-2">{t("preg.jump")}</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {PREGNANCY_WEEKS.map(function (x, i) {
            var on = i === idx;
            return (
              <button key={x.week} onClick={function () { go(i); }} aria-pressed={on} className="w-11 h-11 rounded-full text-sm font-semibold"
                style={{ backgroundColor: on ? "#E07A8A" : "#F0EBE8", color: on ? "white" : "#7A6880" }}>{x.week}</button>
            );
          })}
        </div>
        <p className="text-bloom-dim text-xs text-center mb-2">{t("preg.feel")}</p>
        <p className="text-bloom-dim text-[11px] text-center">{t("preg.clinic")}</p>
      </div>
    </div>
  );
}
