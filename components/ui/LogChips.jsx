"use client";
import { FeelingFace, SymptomIcon } from "./Graphics";
import { useT } from "../../lib/i18n";

var TONES = {
  feeling: { bg: "#FDF1E3", on: "#F7C27B", text: "#7A4A1E" },
  symptom: { bg: "#F5EEFA", on: "#9B6DC5", text: "#5B3F7A" },
};

// Pill chips with an illustrated icon, for feelings ("feel.<id>") and symptoms ("sym.<name>").
export default function LogChips({ kind, items, selected, onToggle }) {
  var { t } = useT();
  var tone = TONES[kind];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(function (id) {
        var on = selected.includes(id);
        var label = t((kind === "feeling" ? "feel." : "sym.") + id);
        return (
          <button key={id} onClick={function () { onToggle(id); }} aria-pressed={on}
            className="flex items-center gap-2 ps-1 pe-3.5 py-1 rounded-full border-2 transition-all active:scale-95"
            style={{ backgroundColor: tone.bg, borderColor: on ? tone.on : "transparent" }}>
            {kind === "feeling" ? <FeelingFace id={id} size={30} /> : <SymptomIcon name={id} size={30} />}
            <span className="text-[13px] font-medium" style={{ color: tone.text }}>{label}</span>
            {on && <span className="text-xs font-bold" style={{ color: tone.on }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// Filters ids by a search query against their translated label (and the English key).
export function matchItems(items, prefix, query, t) {
  var q = (query || "").trim().toLowerCase();
  if (!q) return items;
  return items.filter(function (id) {
    return t(prefix + id).toLowerCase().indexOf(q) !== -1 || id.toLowerCase().indexOf(q) !== -1;
  });
}
