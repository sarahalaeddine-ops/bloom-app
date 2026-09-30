"use client";
import { useEffect } from "react";
import { Globe, Phone, MessageCircle, AtSign } from "lucide-react";
import { BackBtn, Label } from "../../ui/Common";
import CoachAvatar from "../../ui/CoachAvatar";
import ScreenHero from "../../ui/ScreenHero";
import { store } from "../../../lib/store";
import { COACHES } from "../../../lib/demo-data";
import { useT } from "../../../lib/i18n";

function host(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function CoachCard({ coach }) {
  var { t } = useT();
  var k = "coach." + coach.key + ".";
  var ext = { target: "_blank", rel: "noopener noreferrer" };
  var btn = "flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold";
  return (
    <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
      <div className="flex items-center gap-3 mb-3">
        <CoachAvatar coach={coach} size={72} />
        <div className="flex-1 min-w-0">
          <p className="text-bloom-text text-base font-bold"><bdi>{coach.name}</bdi></p>
          <p className="text-bloom-teal text-xs font-semibold">{t(k + "title")}</p>
          <p className="text-bloom-muted text-xs">{t(k + "speaker")} · {t(k + "city")}</p>
          <p className="text-bloom-dim text-[11px] italic mt-0.5">{t(k + "tagline")}</p>
        </div>
      </div>
      <p className="text-bloom-muted text-sm leading-relaxed mb-3">{t(k + "bio")}</p>

      <Label className="mb-1.5">{t("coach.focus")}</Label>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {coach.topics.map(function (x) {
          return <span key={x} className="text-xs text-bloom-teal bg-bloom-teal/10 rounded-full px-2.5 py-1">{t(k + x)}</span>;
        })}
      </div>

      <Label className="mb-1">{t("coach.methods")}</Label>
      <p className="text-bloom-text text-sm mb-3"><bdi>{t(k + "methods")}</bdi></p>

      <Label className="mb-1">{t("coach.formats")}</Label>
      <ul className="mb-3">
        {coach.formats.map(function (x) { return <li key={x} className="text-bloom-text text-sm mb-0.5">✦ {t(k + x)}</li>; })}
      </ul>

      <Label className="mb-1">{t("coach.background")}</Label>
      <ul className="mb-4">
        {coach.background.map(function (x) { return <li key={x} className="text-bloom-muted text-xs mb-1 leading-relaxed">· {t(k + x)}</li>; })}
      </ul>

      <Label className="mb-2">{t("coach.contact")}</Label>
      <a href={coach.website} {...ext} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-bloom-teal text-white text-sm font-semibold mb-2">
        <Globe size={16} /> {t("coach.website")}
      </a>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <a href={"tel:" + coach.tel} aria-label={t("coach.callLabel", { name: coach.name })} className={btn + " border-bloom-teal/40 text-bloom-teal"}>
          <Phone size={14} /> {t("coach.call")}
        </a>
        <a href={coach.whatsapp} {...ext} className={btn + " border-bloom-teal/40 text-bloom-teal"}>
          <MessageCircle size={14} /> {t("coach.whatsapp")}
        </a>
        <a href={coach.instagram} {...ext} className={btn + " border-bloom-teal/40 text-bloom-teal"}>
          <AtSign size={14} /> {t("coach.instagram")}
        </a>
      </div>
      <p className="text-bloom-muted text-xs text-center mb-1"><bdi dir="ltr">{coach.phone}</bdi></p>
      <p className="text-bloom-dim text-[11px] text-center leading-relaxed">{t("coach.direct")}</p>
      <p className="text-bloom-dim text-[11px] text-center mt-1">{t("coach.source", { site: host(coach.website) })}</p>
    </div>
  );
}

export default function Coaching({ onBack }) {
  var { t } = useT();

  // Bookings came from the old fictional-therapist demo (before 2026-09-29). Nothing reads them now.
  useEffect(function () { store.remove("bookings"); }, []);

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <ScreenHero art="therapy" title={t("coach.title")} sub={t("coach.sub")} tint="teal" />

        <div className="bg-bloom-surface rounded-2xl p-4 mb-4">
          <p className="text-bloom-text text-xs leading-relaxed mb-2">{t("coach.notTreatment")}</p>
          <p className="text-bloom-rose text-xs font-semibold leading-relaxed">{t("coach.crisis")}</p>
        </div>

        <Label className="mb-2">{t("coach.list")}</Label>
        {COACHES.map(function (c) { return <CoachCard key={c.id} coach={c} />; })}
      </div>
    </div>
  );
}
