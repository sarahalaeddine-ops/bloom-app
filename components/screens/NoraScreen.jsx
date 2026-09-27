"use client";
import { useState } from "react";
import { store } from "../../lib/store";
import { ChatBubble, Typing, ChatInput, useScrollToBottom } from "../ui/Chat";
import { useT } from "../../lib/i18n";
import { BloomFlower, Blobs } from "../ui/Graphics";

function welcome(user, t) {
  return { role: "assistant", content: t("nora.welcome", { name: user.name || "Sarah", day: user.stimDay || 7, e2: (user.e2 || 1840).toLocaleString() }) };
}

export default function NoraScreen({ user }) {
  var { t, lang } = useT();
  var SUGGESTED = [t("nora.s1"), t("nora.s2"), t("nora.s3"), t("nora.s4")];
  var [msgs, setMsgs] = useState(function () { return store.get("nora", null) || [welcome(user, t)]; });
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var [demo, setDemo] = useState(false);
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
      var res = await fetch("/api/nora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { name: user.name, stimDay: user.stimDay, protocol: user.protocol, clinic: user.clinic, e2: user.e2 },
          messages: next,
          lang: lang,
        }),
      });
      var data = await res.json();
      setDemo(!!data.demo);
      update(next.concat({ role: "assistant", content: data.text || t("nora.error") }));
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
        <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center">
          <BloomFlower size={30} animate={false} />
        </div>
        <div className="flex-1">
          <p className="text-bloom-text text-sm font-semibold">Nora</p>
          <p className="text-bloom-teal text-xs">{t("nora.status")}</p>
        </div>
        {msgs.length > 1 && <button onClick={clear} className="text-bloom-dim text-xs">{t("nora.newChat")}</button>}
      </div>

      <div className="flex-1 px-4 py-4 pb-36 bg-bloom-bg">
        {msgs.length <= 1 && (
          <div className="relative overflow-hidden rounded-3xl p-5 mb-4 flex flex-col items-center text-center" style={{ background: "linear-gradient(150deg,#EEE6FA 0%,#FBEFF2 100%)" }}>
            <Blobs />
            <BloomFlower size={84} className="relative mb-2" />
            <p className="relative font-serif italic text-bloom-accent" style={{ fontSize: "28px" }}>Nora</p>
            <p className="relative text-bloom-muted text-sm">{t("nora.status")}</p>
          </div>
        )}
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
        {demo && !loading && <p className="text-bloom-dim text-[10px] text-center mt-1">{t("nora.demo")}</p>}
        <p className="text-bloom-dim text-[10px] text-center mt-3">{t("nora.notDoctor")}</p>
        <div ref={bottomRef} />
      </div>

      <ChatInput value={input} onChange={setInput} onSend={function () { send(); }} disabled={loading} placeholder={t("nora.ph")} />
    </div>
  );
}
