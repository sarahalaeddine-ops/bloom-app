"use client";
import { useState } from "react";
import { store } from "../../lib/store";
import { ChatBubble, Typing, ChatInput, useScrollToBottom } from "../ui/Chat";

var SUGGESTED = ["What does my E2 mean?", "Am I at risk for OHSS?", "When is my trigger shot?", "I am scared about retrieval"];

function welcome(user) {
  return {
    role: "assistant",
    content: "Hi " + (user.name || "Sarah") + ". I am Nora, your IVF companion.\n\nYou are on Stimulation Day " + (user.stimDay || 7) + " with 11 follicles and E2 at " + (user.e2 || 1840).toLocaleString() + ". Things look really promising.\n\nHow are you feeling today?",
  };
}

export default function NoraScreen({ user }) {
  var [msgs, setMsgs] = useState(function () { return store.get("nora", null) || [welcome(user)]; });
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
        }),
      });
      var data = await res.json();
      setDemo(!!data.demo);
      update(next.concat({ role: "assistant", content: data.text || "Sorry, try again." }));
    } catch {
      update(next.concat({ role: "assistant", content: "Something went wrong. Please try again." }));
    }
    setLoading(false);
  }

  function clear() {
    store.remove("nora");
    setMsgs([welcome(user)]);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-bloom-border">
        <div className="w-9 h-9 rounded-full bg-bloom-accent flex items-center justify-center">
          <span className="text-white text-sm">✦</span>
        </div>
        <div className="flex-1">
          <p className="text-bloom-text text-sm font-semibold">Nora</p>
          <p className="text-bloom-teal text-xs">Online · Knows your cycle</p>
        </div>
        {msgs.length > 1 && <button onClick={clear} className="text-bloom-dim text-xs">New chat</button>}
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
        {demo && !loading && <p className="text-bloom-dim text-[10px] text-center mt-1">Demo mode · add ANTHROPIC_API_KEY for live Nora</p>}
        <p className="text-bloom-dim text-[10px] text-center mt-3">Nora is not a doctor. Always confirm medical decisions with your clinic.</p>
        <div ref={bottomRef} />
      </div>

      <ChatInput value={input} onChange={setInput} onSend={function () { send(); }} disabled={loading} placeholder="Ask Nora anything..." />
    </div>
  );
}
