"use client";
import { useT } from "../lib/i18n";

// Explicit, granular health-data consent (G11). Both choices start unticked (opt-in) and saying
// no never blocks the app: Bloom keeps working on this device with offline Nora answers.
// `cloud` = she has a cloud account, so the sync choice applies. Wording is a DRAFT pending legal
// review (docs/sa6/architecture.md).
function Choice({ on, onToggle, title, body }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} onClick={onToggle}
      className={"w-full flex items-start gap-3 p-4 rounded-2xl border text-start transition-colors " + (on ? "border-bloom-accent bg-purple-50" : "border-bloom-border bg-white")}>
      <span aria-hidden="true" className={"mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold " + (on ? "bg-bloom-accent border-bloom-accent text-white" : "border-bloom-dim text-transparent")}>✓</span>
      <span className="flex-1">
        <span className={"block text-sm font-semibold mb-1 " + (on ? "text-bloom-accent" : "text-bloom-text")}>{title}</span>
        <span className="block text-bloom-muted text-xs leading-relaxed">{body}</span>
      </span>
    </button>
  );
}

export default function ConsentPanel({ cloud, value, onChange }) {
  var { t } = useT();
  function flip(key) {
    var next = { ...value };
    next[key] = !value[key];
    onChange(next);
  }
  return (
    <div>
      <p className="text-bloom-muted text-sm leading-relaxed mb-4">{t("cons.intro")}</p>
      <div className="bg-bloom-surface rounded-2xl p-3 mb-3">
        <p className="text-bloom-muted text-xs leading-relaxed">{t("cons.device")}</p>
      </div>
      <div className="flex flex-col gap-3 mb-4">
        {cloud && <Choice on={!!value.cloud} onToggle={function () { flip("cloud"); }} title={t("cons.cloud")} body={t("cons.cloud.d")} />}
        <Choice on={!!value.ai} onToggle={function () { flip("ai"); }} title={t("cons.ai")} body={t("cons.ai.d")} />
      </div>
      <p className="text-bloom-muted text-xs leading-relaxed mb-2">{t("cons.abroad")}</p>
      <p className="text-bloom-muted text-xs leading-relaxed">{t("cons.withdraw")}</p>
    </div>
  );
}
