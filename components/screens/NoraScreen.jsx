"use client";
import { useState } from "react";
import { store, consent } from "../../lib/store";
import { askNora } from "../../lib/api";
import { ChatBubble, Typing, ChatInput, useScrollToBottom } from "../ui/Chat";
import { useT } from "../../lib/i18n";
import { noraProfile } from "../../lib/nora";
import { getMeds, getAppts } from "../../lib/schedule";

// The demo persona gets her cycle summary; a real user never sees Sarah's numbers (G15).
function welcome(user, t) {
  if (user.id === "demo") return { role: "assistant", content: t("nora.welcome", { name: user.name || "Sarah", day: user.stimDay || 7, e2: (user.e2 || 1840).toLocaleString() }) };
  var first = user.anonymous ? "" : (user.name || "").trim().split(" ")[0];
  return { role: "assistant", content: first ? t("nora.welcomeUser", { name: first }) : t("nora.welcomeNoName") };
}

export default function NoraScreen({ user }) {
  var { t, lang } = useT();
  var SUGGESTED = [t("nora.s1"), t("nora.s2"), t("nora.s3"), t("nora.s4")];
  var [msgs, setMsgs] = useState(function () { return store.get("nora", null) || [welcome(user, t)]; });
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var [demo, setDemo] = useState(false);
  var [aiOff, setAiOff] = useState(false);
  var bottomRef = useScrollToBottom([msgs, loading]);

  function update(next) {
    setMsgs(next);
    store.set("nora", next);
  }

  async function send(text) {
    var msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    var next = msgs.concat({ role: "user", content: msg });
    update(next);
    setLoading(true);
    try {
      var res = await askNora({
        // Only what Nora needs: first name (never in anonymous mode) and cycle context. In cloud mode
        // the server reads her synced profile instead. See docs/sa6/architecture.md.
        // Her schedule: medication names, doses and times and her next appointments (no notes).
        user: noraProfile(user, { meds: getMeds(), appts: getAppts() }),
        messages: next,
        lang: lang,
        // Her consent to AI processing (G11). Cloud accounts: the server checks her stored consent too.
        ai: consent.aiAllowed(user),
      });
      // Her cloud session is no longer valid (the route's 401, not the demo gate's): ask her to sign in again.
      var reply = res.status === 401 && res.data.error === "Not signed in" ? t("nora.signInAgain") : res.data.text || t("nora.error");
      setDemo(!!res.data.demo);
      setAiOff(!!res.data.aiOff);
      update(next.concat({ role: "assistant", content: reply }));
    } catch {
      update(next.concat({ role: "assistant", content: t("nora.error") }));
    }
    setLoading(false);
  }

  function clear() {
    store.remove("nora");
    setMsgs([welcome(user, t)]);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-bloom-border">
        <div className="w-9 h-9 rounded-full bg-bloom-accent flex items-center justify-center">
          <span className="text-white text-sm">✦</span>
        </div>
        <div className="flex-1">
          <p className="text-bloom-text text-sm font-semibold flex items-center gap-1.5">Nora <span className="text-[9px] font-bold uppercase tracking-wider text-bloom-accent bg-purple-50 border border-purple-200 rounded px-1 py-px" title={t("nora.aiBadge.d")}>{t("nora.aiBadge")}</span></p>
          <p className="text-bloom-teal text-xs">{t("nora.status")}</p>
        </div>
        {msgs.length > 1 && <button onClick={clear} className="text-bloom-dim text-xs">{t("nora.newChat")}</button>}
      </div>

      <div className="flex-1 px-4 py-4 pb-36 bg-bloom-bg">
        {msgs.map(function (m, i) { return <ChatBubble key={i} role={m.role} content={m.content} />; })}

        {msgs.length <= 1 && (
          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            {SUGGESTED.map(function (q) {
              return (
                <button key={q} onClick={function () { send(q); }}
                  className="px-3 py-2 bg-white border border-bloom-accent/30 rounded-full text-bloom-accent text-xs">
                  {q}
                </button>
              );
            })}
          </div>
        )}

        {loading && <Typing />}
        {aiOff && !loading && <p className="text-bloom-dim text-[10px] text-center mt-1">{t("nora.aiOff")}</p>}
        {demo && !aiOff && !loading && <p className="text-bloom-dim text-[10px] text-center mt-1">{t("nora.demo")}</p>}
        {/* AI disclosure (App Store 5.1.2(i), 1.4.1): always visible under the chat. */}
        <p className="text-bloom-dim text-[10px] text-center mt-3">{t("nora.notDoctor")}</p>
        <div ref={bottomRef} />
      </div>

      <ChatInput value={input} onChange={setInput} onSend={function () { send(); }} disabled={loading} placeholder={t("nora.ph")} />
    </div>
  );
}
