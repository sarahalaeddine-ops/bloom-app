"use client";
import { useState } from "react";
import { BackBtn, Logo } from "../../ui/Common";
import { auth } from "../../../lib/store";
import { PLANS, FREE_TIER } from "../../../lib/demo-data";
import { useT } from "../../../lib/i18n";

export default function Upgrade({ onBack, user, setUser }) {
  var { t } = useT();
  var [plan, setPlan] = useState("pro");
  var [billing, setBilling] = useState("annual");
  var [done, setDone] = useState(false);
  var p = PLANS.find(function (x) { return x.id === plan; });
  var price = billing === "annual" ? t("up.priceYear", { price: p.annual }) : t("up.priceMonth", { price: p.monthly });

  function start() {
    setUser(auth.updateUser({ plan: plan, billing: billing }));
    setDone(true);
  }

  if (done) return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <BackBtn onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-24">
        <p className="text-5xl mb-4" style={{ color: p.color }}>✦</p>
        <h2 className="text-2xl font-bold text-bloom-text mb-2">{t("up.welcome", { plan: p.name })}</h2>
        <p className="text-bloom-muted text-sm mb-2">{t("up.trial")}</p>
        <p className="text-bloom-dim text-xs mb-8">{t("up.demo")}</p>
        <button onClick={onBack} className="text-white font-semibold px-8 py-3 rounded-xl" style={{ backgroundColor: p.color }}>{t("up.back")}</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bloom-bg pb-6">
      <BackBtn onBack={onBack} />
      <div className="px-4">
        <div className="text-center mb-6">
          <Logo size={30} />
          <h1 className="text-2xl font-bold text-bloom-text mb-2 mt-2">{t("up.title")}</h1>
          <p className="text-bloom-muted text-sm">{t("up.sub")}</p>
          {user.plan && <p className="text-bloom-teal text-xs font-semibold mt-2">{t("up.current", { plan: (PLANS.find(function (x) { return x.id === user.plan; }) || {}).name || "" })}</p>}
        </div>

        <div className="flex bg-bloom-surface rounded-xl p-1 mb-6" role="tablist">
          {["monthly", "annual"].map(function (b) {
            return (
              <button key={b} role="tab" aria-selected={billing === b} onClick={function () { setBilling(b); }}
                className={"flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 " + (billing === b ? "bg-white text-bloom-text shadow-sm" : "text-bloom-muted")}>
                {b === "annual" ? t("up.annual") : t("up.monthly")}
                {b === "annual" && <span className="bg-bloom-teal text-white text-[10px] px-1.5 py-0.5 rounded-md">{t("up.save46")}</span>}
              </button>
            );
          })}
        </div>

        {PLANS.map(function (x) {
          var on = plan === x.id;
          return (
            <button key={x.id} onClick={function () { setPlan(x.id); }} aria-pressed={on}
              className="w-full text-start bg-white rounded-2xl p-5 border-2 mb-4 relative transition-all"
              style={{ borderColor: on ? x.color : "#E8E0DB" }}>
              {x.popular && <span className="absolute -top-3 end-4 text-white text-xs px-3 py-1 rounded-full font-bold" style={{ backgroundColor: x.color }}>{t("up.popular")}</span>}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5"
                  style={{ borderColor: on ? x.color : "#E8E0DB", backgroundColor: on ? x.color : "white" }}>
                  {on && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-bold text-base" style={{ color: x.color }}>{x.name}</p>
                  <p className="text-2xl font-bold text-bloom-text" style={{ letterSpacing: "-1px" }}>
                    {billing === "annual" ? x.annual : x.monthly} <span className="text-sm font-normal text-bloom-muted">{billing === "annual" ? t("up.perYear") : t("up.perMonth")}</span>
                  </p>
                  {billing === "annual" && <p className="text-xs font-semibold mt-0.5" style={{ color: x.color }}>{t("up.orMonthly", { price: x.monthly })}</p>}
                </div>
              </div>
              <div className="border-t border-bloom-border pt-3 flex flex-col gap-2">
                {x.features.map(function (f) {
                  return (
                    <div key={f} className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: x.color }}>✓</span>
                      <span className="text-bloom-muted text-xs">{t(f)}</span>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}

        <button onClick={start} className="w-full py-4 rounded-2xl text-white font-bold text-base mb-2" style={{ backgroundColor: p.color }}>
          {t("up.start", { plan: p.name, price: price })}
        </button>
        <p className="text-bloom-dim text-xs text-center mb-6">{t("up.trialNote")}</p>

        <div className="bg-white rounded-2xl p-4 border border-bloom-border mb-3">
          <p className="text-bloom-text text-sm font-bold mb-2">{t("up.freeIncludes")}</p>
          {FREE_TIER.map(function (f) {
            return <p key={f} className="text-bloom-muted text-xs mb-1.5 last:mb-0">✓ {t(f)}</p>;
          })}
        </div>
        <button onClick={onBack} className="w-full py-3 text-bloom-muted text-sm font-medium underline">{t("up.continueFree")}</button>
      </div>
    </div>
  );
}
