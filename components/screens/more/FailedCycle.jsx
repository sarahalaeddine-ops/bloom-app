"use client";
import { useState } from "react";
import { BackBtn, Label } from "../../ui/Common";
import { FAILED_STEPS, WTF_QUESTIONS } from "../../../lib/demo-data";

export default function FailedCycle({ onBack, openSection }) {
  var [copied, setCopied] = useState(false);

  function copyQuestions() {
    var text = "Questions for my follow-up appointment:\n" + WTF_QUESTIONS.map(function (q, i) { return (i + 1) + ". " + q; }).join("\n");
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
          <h1 className="text-2xl font-bold text-bloom-text mb-2">After a Failed Cycle</h1>
          <p className="text-bloom-muted text-sm leading-relaxed">We are so sorry. Whatever you are feeling right now is allowed. You do not have to decide anything today.</p>
        </div>

        <Label className="mb-2">Gentle next steps</Label>
        {FAILED_STEPS.map(function (s, i) {
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border border-bloom-border mb-2 flex gap-3">
              <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#5BADD4" }}>{i + 1}</span>
              <div>
                <p className="text-bloom-text text-sm font-bold mb-1">{s.title}</p>
                <p className="text-bloom-muted text-xs leading-relaxed">{s.body}</p>
              </div>
            </div>
          );
        })}

        <div className="bg-white rounded-2xl p-4 border mb-3 mt-3" style={{ borderColor: "#5BADD440" }}>
          <p className="text-bloom-text text-sm font-bold mb-2">Questions for your follow-up</p>
          {WTF_QUESTIONS.map(function (q, i) {
            return <p key={i} className="text-bloom-muted text-xs mb-1.5">{i + 1}. {q}</p>;
          })}
          <button onClick={copyQuestions} className="mt-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: "#5BADD4", backgroundColor: "#5BADD415" }}>
            {copied ? "Copied ✓" : "Copy questions"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={function () { openSection("coaching"); }} className="bg-white rounded-2xl p-4 border border-bloom-teal/40 text-start">
            <p className="text-bloom-teal text-lg mb-1">◇</p>
            <p className="text-bloom-text text-sm font-bold">Talk to a coach</p>
            <p className="text-bloom-muted text-xs">Coaching &amp; support</p>
          </button>
          <button onClick={function () { openSection("community"); }} className="bg-white rounded-2xl p-4 border text-start" style={{ borderColor: "#5BADD440" }}>
            <p className="text-lg mb-1" style={{ color: "#5BADD4" }}>◎</p>
            <p className="text-bloom-text text-sm font-bold">Failed Cycle room</p>
            <p className="text-bloom-muted text-xs">43 women who get it</p>
          </button>
        </div>
      </div>
    </div>
  );
}
