"use client";
import { useState } from "react";
import { consent } from "../lib/store";
import { cloudEnabled } from "../lib/supabase";
import { useT } from "../lib/i18n";
import { Illustration } from "./ui/Graphics";
import ConsentPanel from "./ConsentPanel";

// Shown once to onboarded users who haven't answered the current consent version (existing
// accounts, or after a wording change bumps CONSENT_VERSION). New users answer inside onboarding.
export default function ConsentScreen({ user, onDone }) {
  var { t } = useT();
  var prev = consent.get();
  var [choice, setChoice] = useState({ cloud: !!(prev && prev.cloud), ai: !!(prev && prev.ai) });
  var [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await consent.set(choice);
    setBusy(false);
    onDone();
  }

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col">
      <div className="flex-1 px-6 pt-10 pb-4 overflow-y-auto">
        <div className="mb-4"><Illustration name="shield" size={88} /></div>
        <h1 className="text-2xl font-bold text-bloom-text mb-2">{t("cons.title")}</h1>
        {prev && <p className="text-bloom-accent text-xs font-semibold mb-3">{t("cons.updated")}</p>}
        <ConsentPanel cloud={cloudEnabled() && !!user.cloud} value={choice} onChange={setChoice} />
      </div>
      <div className="px-6 pb-8 pt-4">
        <button onClick={save} disabled={busy} className="w-full bg-bloom-accent text-white font-semibold py-4 rounded-2xl disabled:opacity-40 text-base">
          {busy ? t("auth.busy") : t("cons.save")}
        </button>
      </div>
    </div>
  );
}
