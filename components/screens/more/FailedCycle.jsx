"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { FAILED_STEPS, WTF_QUESTIONS, ROOMS } from "../../../lib/demo-data";
import { roomMembers } from "../../../lib/community";
import { useT } from "../../../lib/i18n";

export default function FailedCycle({ onBack, openSection }) {
  var { t } = useT();
  var [copied, setCopied] = useState(false);
  var failedRoom = ROOMS.find(function (r) { return r.id === "failed"; });
  var members = failedRoom ? roomMembers(failedRoom) : null;

  function copyQuestions() {
    var text = t("fail.copyHeader") + "\n" + WTF_QUESTIONS.map(function (n, i) { return (i + 1) + ". " + t("fail.q" + n); }).join("\n");
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    setCopied(true);
    setTimeout(function () { setCopied(false); }, 2000);
  }

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <div className="rounded-2xl p-6 mb-4 text-center" style={{ backgroundColor: "#5BADD415" }}>
          <p className="text-3xl mb-3" style={{ color: "#5BADD4" }}>◈</p>
          <h1 className="text-2xl font-bold text-bloom-text mb-2">{t("sec.failed")}</h1>
          <p className="text-bloom-muted text-sm leading-relaxed">{t("fail.intro")}</p>
        </div>

        <Label className="mb-2">{t("fail.steps")}</Label>
        {FAILED_STEPS.map(function (n, i) {
          return (
            <div key={n} className="bg-white rounded-2xl p-4 border border-bloom-border mb-2 flex gap-3">
              <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#5BADD4" }}>{i + 1}</span>
              <div>
                <p className="text-bloom-text text-sm font-bold mb-1">{t("fail.s" + n + ".t")}</p>
                <p className="text-bloom-muted text-xs leading-relaxed">{t("fail.s" + n + ".b")}</p>
              </div>
            </div>
          );
        })}

        <div className="bg-white rounded-2xl p-4 border mb-3 mt-3" style={{ borderColor: "#5BADD440" }}>
          <p className="text-bloom-text text-sm font-bold mb-2">{t("fail.qTitle")}</p>
          {WTF_QUESTIONS.map(function (n, i) {
            return <p key={n} className="text-bloom-muted text-xs mb-1.5">{i + 1}. {t("fail.q" + n)}</p>;
          })}
          <button onClick={copyQuestions} className="mt-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: "#5BADD4", backgroundColor: "#5BADD415" }}>
            {copied ? t("cmn.copied") : t("fail.copy")}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={function () { openSection("coaching"); }} className="bg-white rounded-2xl p-4 border border-bloom-teal/40 text-start">
            <p className="text-bloom-teal text-lg mb-1">◇</p>
            <p className="text-bloom-text text-sm font-bold">{t("fail.coach")}</p>
            <p className="text-bloom-muted text-xs">{t("sec.coaching")}</p>
          </button>
          <button onClick={function () { openSection("community"); }} className="bg-white rounded-2xl p-4 border text-start" style={{ borderColor: "#5BADD440" }}>
            <p className="text-lg mb-1" style={{ color: "#5BADD4" }}>◎</p>
            <p className="text-bloom-text text-sm font-bold">{t("fail.room")}</p>
            <p className="text-bloom-muted text-xs">{members !== null ? t("fail.roomDemo", { n: members }) : t("cm.room.failed.d")}</p>
          </button>
        </div>
        <p className="text-bloom-dim text-xs text-center mt-4">{t("fail.clinic")}</p>
      </div>
    </div>
  );
}
