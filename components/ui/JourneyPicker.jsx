"use client";
import { Check } from "lucide-react";
import { PhaseIcon } from "./Graphics";
import { auth } from "../../lib/store";
import { useT } from "../../lib/i18n";

// "Your Bloom journey": switch IVF phase at any time (Flo's mode cards, for IVF).
export default function JourneyPicker({ user, setUser, onPregnant, onChanged }) {
  var { t } = useT();
  var current = user.phase || "stimulation";

  function pick(id) {
    if (id === current) return;
    setUser(auth.updateUser({ phase: id }));
    if (onChanged) onChanged(t("journey.changed", { phase: t("phase." + id) }));
  }

  var cards = ["planning", "stimulation", "retrieval", "transfer", "tww", "pregnant"];

  return (
    <div>
      <h2 className="text-xl font-bold text-bloom-text mb-1">{t("journey.title")}</h2>
      <p className="text-bloom-muted text-sm mb-4">{t("journey.sub")}</p>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(function (id) {
          var on = id === current;
          var label = id === "pregnant" ? t("journey.pregnant") : t("phase." + id);
          return (
            <button key={id} onClick={function () { if (id === "pregnant") onPregnant(); else pick(id); }} aria-pressed={id === "pregnant" ? undefined : on}
              className="relative bg-white rounded-2xl py-5 px-3 flex flex-col items-center text-center transition-all active:scale-[0.98]"
              style={{ border: on ? "2px solid #E07A8A" : "2px solid transparent", boxShadow: "0 2px 12px rgba(26,16,20,0.06)" }}>
              {on && (
                <span className="absolute top-2.5 end-2.5 w-6 h-6 rounded-full bg-bloom-rose text-white flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
              <PhaseIcon phase={id} size={68} />
              <span className="text-bloom-text text-sm font-medium mt-3 leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
