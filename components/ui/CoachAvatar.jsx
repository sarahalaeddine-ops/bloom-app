"use client";
import { useState } from "react";
import { useT } from "../../lib/i18n";

// Round avatar for a coach: her photo (public/, bundled in the app build) when set and loadable,
// otherwise her initials in the Bloom style.
export default function CoachAvatar({ coach, size = 64 }) {
  var { t } = useT();
  var [failed, setFailed] = useState(false);
  var box = { width: size + "px", height: size + "px" };
  if (coach.photo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static export: next/image optimisation is off in the app build
      <img src={coach.photo} alt={t("coach.photoAlt", { name: coach.name })} width={size} height={size} onError={function () { setFailed(true); }}
        className="rounded-full object-cover object-top flex-shrink-0 border-2 border-white shadow-sm" style={box} />
    );
  }
  return (
    <div role="img" aria-label={coach.name} className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ ...box, backgroundColor: coach.color, fontSize: Math.round(size * 0.34) + "px" }}>
      {coach.initials}
    </div>
  );
}
